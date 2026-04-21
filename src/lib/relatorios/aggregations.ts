/**
 * Pure aggregation functions for the Relatórios module.
 *
 * Hard rules (mirror Financeiro.tsx exactly):
 *  - Only orçamentos with status `aprovado` or `executado` count as revenue/profit.
 *  - Cost is the sum of `custoConhecido ?? custoTotalObra` per item, skipping items
 *    flagged as `custoIncompleto`. If any item is incomplete, the result is "partial".
 *  - All date comparisons go through plain YYYY-MM-DD via `toLocalDateStr` to avoid
 *    timezone drift.
 *  - This module is read-only. Never import calcEngine or mutate inputs.
 */
import type { ItemServico, LancamentoFinanceiro, Orcamento, StatusOrcamento } from "@/lib/types";
import { toLocalDateStr } from "@/lib/dateUtils";

export const VALID_FOR_PROFIT: ReadonlyArray<StatusOrcamento> = ["aprovado", "executado"];

export interface DateRange {
  /** Inclusive start (local). */
  start: Date;
  /** Inclusive end (local). */
  end: Date;
}

export interface KnownCostResult {
  value: number;
  partial: boolean;
}

/** Centralized cost helper. The single source of truth for "known cost" in reports. */
export function knownCost(orc: Orcamento): KnownCostResult {
  const partial = orc.itensServico.some((i) => i.custoIncompleto === true);
  const value = orc.itensServico.reduce((sum, item) => {
    if (item.custoIncompleto) return sum;
    const known = item.custoConhecido ?? item.custoTotalObra;
    return sum + (Number.isFinite(known) ? known : 0);
  }, 0);
  return { value, partial };
}

/** Same logic at item level (used for service aggregation). */
function knownItemCost(item: ItemServico): { value: number | null } {
  if (item.custoIncompleto) return { value: null };
  const known = item.custoConhecido ?? item.custoTotalObra;
  return { value: Number.isFinite(known) ? known : 0 };
}

function inRangeStr(dateStr: string | null | undefined, range: DateRange): boolean {
  const local = toLocalDateStr(dateStr ?? null);
  if (!local) return false;
  const startStr = toLocalDateStr(range.start.toISOString())!;
  const endStr = toLocalDateStr(range.end.toISOString())!;
  return local >= startStr && local <= endStr;
}

function isQuoteInRange(orc: Orcamento, range: DateRange): boolean {
  return inRangeStr(orc.dataCriacao, range);
}

function monthKey(dateStr: string): string {
  const local = toLocalDateStr(dateStr) ?? dateStr.slice(0, 10);
  return local.slice(0, 7); // YYYY-MM
}

function monthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  if (!y || !m) return yyyymm;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function enumerateMonths(range: DateRange): string[] {
  const months: string[] = [];
  const start = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
  const end = new Date(range.end.getFullYear(), range.end.getMonth(), 1);
  const cursor = new Date(start);
  while (cursor <= end) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

// ─── VENDAS ──────────────────────────────────────────────────────────────

export interface OrcamentoVendaRow {
  id: string;
  numero: number;
  data: string; // YYYY-MM-DD local
  cliente: string;
  status: StatusOrcamento;
  valorFinal: number;
  custo: number;
  lucro: number | null;
  margem: number | null;
  partial: boolean;
}

export interface VendasMonthPoint {
  key: string;
  label: string;
  receita: number;
  custo: number;
}

export interface VendasAggregation {
  faturamento: number;
  custo: number;
  lucro: number | null;
  margem: number | null;
  ticketMedio: number;
  conversao: number | null; // aprovados / (aprovados + rejeitados)
  qtdOrcamentos: number;
  hasIncomplete: boolean;
  rows: OrcamentoVendaRow[];
  serieMensal: VendasMonthPoint[];
}

export function aggregateVendas(orcamentos: Orcamento[], range: DateRange): VendasAggregation {
  const inRange = orcamentos.filter((o) => isQuoteInRange(o, range));
  const validForProfit = inRange.filter((o) => VALID_FOR_PROFIT.includes(o.status));

  let faturamento = 0;
  let custo = 0;
  let hasIncomplete = false;
  const rows: OrcamentoVendaRow[] = [];

  for (const orc of validForProfit) {
    const { value: c, partial } = knownCost(orc);
    if (partial) hasIncomplete = true;
    faturamento += orc.valorFinal;
    custo += c;
    rows.push({
      id: orc.id,
      numero: orc.numeroOrcamento,
      data: toLocalDateStr(orc.dataCriacao) ?? "",
      cliente: orc.nomeCliente,
      status: orc.status,
      valorFinal: orc.valorFinal,
      custo: c,
      lucro: partial ? null : orc.valorFinal - c,
      margem: partial ? null : orc.valorFinal > 0 ? ((orc.valorFinal - c) / orc.valorFinal) * 100 : 0,
      partial,
    });
  }

  rows.sort((a, b) => (a.data < b.data ? 1 : -1));

  const lucro = hasIncomplete ? null : faturamento - custo;
  const margem = hasIncomplete ? null : faturamento > 0 ? ((faturamento - custo) / faturamento) * 100 : 0;
  const ticketMedio = validForProfit.length > 0 ? faturamento / validForProfit.length : 0;

  // Conversion: only counts aprovados vs rejeitados within range (regardless of profit window).
  const aprovadosCount = inRange.filter((o) => o.status === "aprovado" || o.status === "executado").length;
  const rejeitadosCount = inRange.filter((o) => o.status === "rejeitado").length;
  const denom = aprovadosCount + rejeitadosCount;
  const conversao = denom > 0 ? (aprovadosCount / denom) * 100 : null;

  // Monthly series within range
  const months = enumerateMonths(range);
  const monthMap = new Map<string, VendasMonthPoint>();
  months.forEach((k) => monthMap.set(k, { key: k, label: monthLabel(k), receita: 0, custo: 0 }));

  for (const orc of validForProfit) {
    const k = monthKey(orc.dataCriacao);
    const point = monthMap.get(k);
    if (!point) continue;
    point.receita += orc.valorFinal;
    const { value } = knownCost(orc);
    point.custo += value;
  }

  return {
    faturamento,
    custo,
    lucro,
    margem,
    ticketMedio,
    conversao,
    qtdOrcamentos: validForProfit.length,
    hasIncomplete,
    rows,
    serieMensal: Array.from(monthMap.values()),
  };
}

// ─── CLIENTES (ABC) ──────────────────────────────────────────────────────

export type ABCClass = "A" | "B" | "C";

export interface ClienteABCRow {
  clienteId: string;
  cliente: string;
  qtdOrcamentos: number;
  faturamento: number;
  ticketMedio: number;
  participacaoPct: number;
  acumuladoPct: number;
  classe: ABCClass;
}

export interface ClientesABCAggregation {
  total: number;
  rows: ClienteABCRow[];
}

export function aggregateClientesABC(orcamentos: Orcamento[], range: DateRange): ClientesABCAggregation {
  const valid = orcamentos.filter(
    (o) => isQuoteInRange(o, range) && VALID_FOR_PROFIT.includes(o.status),
  );

  const map = new Map<string, { id: string; nome: string; qtd: number; faturamento: number }>();
  for (const orc of valid) {
    const key = orc.clienteId || `__sem_id__:${orc.nomeCliente}`;
    const cur = map.get(key) ?? { id: orc.clienteId || "", nome: orc.nomeCliente, qtd: 0, faturamento: 0 };
    cur.qtd += 1;
    cur.faturamento += orc.valorFinal;
    cur.nome = orc.nomeCliente || cur.nome;
    map.set(key, cur);
  }

  const sorted = Array.from(map.values()).sort((a, b) => b.faturamento - a.faturamento);
  const total = sorted.reduce((s, c) => s + c.faturamento, 0);

  let acumulado = 0;
  const rows: ClienteABCRow[] = sorted.map((c) => {
    const participacao = total > 0 ? (c.faturamento / total) * 100 : 0;
    acumulado += participacao;
    let classe: ABCClass = "C";
    if (acumulado <= 80) classe = "A";
    else if (acumulado <= 95) classe = "B";
    return {
      clienteId: c.id,
      cliente: c.nome,
      qtdOrcamentos: c.qtd,
      faturamento: c.faturamento,
      ticketMedio: c.qtd > 0 ? c.faturamento / c.qtd : 0,
      participacaoPct: participacao,
      acumuladoPct: acumulado,
      classe,
    };
  });

  return { total, rows };
}

// ─── SERVIÇOS ────────────────────────────────────────────────────────────

export interface ServicoAggRow {
  nomeServico: string;
  qtdItens: number;
  receita: number;
  custo: number;
  lucro: number | null;
  margem: number | null;
  partial: boolean;
}

export interface ServicosAggregation {
  rows: ServicoAggRow[];
}

export function aggregateServicos(orcamentos: Orcamento[], range: DateRange): ServicosAggregation {
  const valid = orcamentos.filter(
    (o) => isQuoteInRange(o, range) && VALID_FOR_PROFIT.includes(o.status),
  );

  const map = new Map<
    string,
    { nome: string; qtd: number; receita: number; custo: number; partial: boolean }
  >();

  for (const orc of valid) {
    for (const item of orc.itensServico) {
      const nome = item.nomeServico || "(sem nome)";
      const cur = map.get(nome) ?? { nome, qtd: 0, receita: 0, custo: 0, partial: false };
      cur.qtd += 1;
      cur.receita += Number.isFinite(item.valorVenda) ? item.valorVenda : 0;
      const { value } = knownItemCost(item);
      if (value === null) {
        cur.partial = true;
      } else {
        cur.custo += value;
      }
      map.set(nome, cur);
    }
  }

  const rows: ServicoAggRow[] = Array.from(map.values())
    .map((g) => ({
      nomeServico: g.nome,
      qtdItens: g.qtd,
      receita: g.receita,
      custo: g.custo,
      lucro: g.partial ? null : g.receita - g.custo,
      margem: g.partial ? null : g.receita > 0 ? ((g.receita - g.custo) / g.receita) * 100 : 0,
      partial: g.partial,
    }))
    .sort((a, b) => b.receita - a.receita);

  return { rows };
}

// ─── DRE SIMPLIFICADO ────────────────────────────────────────────────────

export interface DRECategoryRow {
  categoria: string;
  porMes: Record<string, number>;
  total: number;
}

export interface DREMonthSummary {
  key: string;
  label: string;
  receitaExecutada: number;
  receitaManual: number;
  despesa: number;
  resultado: number;
}

export interface DREAggregation {
  meses: DREMonthSummary[];
  receitas: DRECategoryRow[];
  despesas: DRECategoryRow[];
  totalReceitas: number;
  totalDespesas: number;
  resultadoLiquido: number;
  faturadoNoPeriodo: number;
  recebidoNoPeriodo: number;
}

const RECEITA_EXEC_LABEL = "Receita executada (orçamentos)";

export function aggregateDRE(
  orcamentos: Orcamento[],
  lancamentos: LancamentoFinanceiro[],
  range: DateRange,
): DREAggregation {
  const months = enumerateMonths(range);
  const monthsLabels = months.map((k) => ({ key: k, label: monthLabel(k) }));

  const meses: DREMonthSummary[] = monthsLabels.map((m) => ({
    key: m.key,
    label: m.label,
    receitaExecutada: 0,
    receitaManual: 0,
    despesa: 0,
    resultado: 0,
  }));

  // Revenue from executed orçamentos — uses dataExecucao (when present) or dataCriacao as fallback.
  const receitaExecCat: DRECategoryRow = {
    categoria: RECEITA_EXEC_LABEL,
    porMes: Object.fromEntries(months.map((k) => [k, 0])),
    total: 0,
  };

  for (const orc of orcamentos) {
    if (orc.status !== "executado") continue;
    const refDate = orc.dataExecucao ?? orc.dataCriacao;
    if (!inRangeStr(refDate, range)) continue;
    const k = monthKey(refDate);
    const summary = meses.find((m) => m.key === k);
    if (!summary) continue;
    summary.receitaExecutada += orc.valorFinal;
    receitaExecCat.porMes[k] = (receitaExecCat.porMes[k] ?? 0) + orc.valorFinal;
    receitaExecCat.total += orc.valorFinal;
  }

  // Manual entries
  const receitaCatMap = new Map<string, DRECategoryRow>();
  const despesaCatMap = new Map<string, DRECategoryRow>();

  for (const l of lancamentos) {
    if (!inRangeStr(l.data, range)) continue;
    const k = monthKey(l.data);
    const summary = meses.find((m) => m.key === k);
    if (!summary) continue;
    const valorAbs = Math.abs(l.valor);
    const targetMap = l.tipo === "receita" ? receitaCatMap : despesaCatMap;
    const cat = l.categoria || "Sem categoria";
    const cur =
      targetMap.get(cat) ??
      { categoria: cat, porMes: Object.fromEntries(months.map((mk) => [mk, 0])), total: 0 };
    cur.porMes[k] = (cur.porMes[k] ?? 0) + valorAbs;
    cur.total += valorAbs;
    targetMap.set(cat, cur);

    if (l.tipo === "receita") {
      summary.receitaManual += valorAbs;
    } else {
      summary.despesa += valorAbs;
    }
  }

  for (const m of meses) {
    m.resultado = m.receitaExecutada + m.receitaManual - m.despesa;
  }

  const receitas: DRECategoryRow[] = [
    receitaExecCat,
    ...Array.from(receitaCatMap.values()).sort((a, b) => b.total - a.total),
  ];
  const despesas = Array.from(despesaCatMap.values()).sort((a, b) => b.total - a.total);

  const totalReceitas = receitas.reduce((s, r) => s + r.total, 0);
  const totalDespesas = despesas.reduce((s, d) => s + d.total, 0);

  // Faturado / recebido (informativo)
  let faturado = 0;
  let recebido = 0;
  for (const orc of orcamentos) {
    if (orc.dataFaturamento && inRangeStr(orc.dataFaturamento, range)) {
      faturado += orc.valorFinal;
    }
    if (orc.dataPagamento && inRangeStr(orc.dataPagamento, range)) {
      recebido += orc.valorFinal;
    }
  }

  return {
    meses,
    receitas,
    despesas,
    totalReceitas,
    totalDespesas,
    resultadoLiquido: totalReceitas - totalDespesas,
    faturadoNoPeriodo: faturado,
    recebidoNoPeriodo: recebido,
  };
}
