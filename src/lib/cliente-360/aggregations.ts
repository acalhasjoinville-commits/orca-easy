/**
 * Cliente 360° — aggregation functions.
 * Pure, side-effect-free, fully testable. Read-only operations on existing
 * Orcamento, Visita, RetornoServico, OrcamentoFollowUp data.
 *
 * Financial KPI rules align with the rest of the system:
 * - Revenue/billed amounts: only orcamentos in status "executado"+ AND with
 *   dataFaturamento OR dataPagamento set count as billed. Following the
 *   established lifecycle: pendente → aprovado → executado → faturado → pago.
 * - "Em aberto" = approved/executed/billed but not yet paid.
 * - Cancelled/rejected are excluded from financial aggregations.
 */
import type { Orcamento, OrcamentoFollowUp, RetornoServico, Visita, StatusOrcamento } from "@/lib/types";
import { STATUS_RETORNO_CONFIG, TIPO_RETORNO_CONFIG } from "@/lib/types";
import type {
  AcompanhamentoPendente,
  ClienteHistoricoData,
  ResumoFinanceiroCliente,
  TimelineEvento,
} from "./types";

const FATURADO_STATUSES: StatusOrcamento[] = ["executado"];

function normalize(name: string): string {
  return (name || "").trim().toLowerCase();
}

/** Filter orcamentos belonging to a cliente (by id when present, else by name). */
export function filterOrcamentosByCliente(
  orcamentos: Orcamento[],
  opts: { clienteId?: string | null; nomeCliente?: string | null },
): Orcamento[] {
  if (opts.clienteId) {
    return orcamentos.filter((o) => o.clienteId === opts.clienteId);
  }
  if (opts.nomeCliente) {
    const target = normalize(opts.nomeCliente);
    return orcamentos.filter((o) => !o.clienteId && normalize(o.nomeCliente) === target);
  }
  return [];
}

/** Filter visitas by clienteId or matching nome (when no cliente_id). */
export function filterVisitasByCliente(
  visitas: Visita[],
  opts: { clienteId?: string | null; nomeCliente?: string | null },
): Visita[] {
  if (opts.clienteId) {
    return visitas.filter((v) => v.clienteId === opts.clienteId);
  }
  if (opts.nomeCliente) {
    const target = normalize(opts.nomeCliente);
    return visitas.filter((v) => !v.clienteId && normalize(v.nomeCliente) === target);
  }
  return [];
}

/** Filter retornos by orcamentos already filtered by cliente. */
export function filterRetornosByOrcamentos(
  retornos: RetornoServico[],
  orcamentoIds: Set<string>,
): RetornoServico[] {
  return retornos.filter((r) => orcamentoIds.has(r.orcamentoId));
}

/** Compute KPIs. Cancelled/rejected are excluded from financial sums. */
export function computeResumoFinanceiro(orcamentos: Orcamento[]): ResumoFinanceiroCliente {
  const faturados = orcamentos.filter(
    (o) => FATURADO_STATUSES.includes(o.status) || o.dataFaturamento || o.dataPagamento,
  );

  const totalFaturado = faturados.reduce((acc, o) => acc + (Number(o.valorFinal) || 0), 0);
  const ticketMedio = faturados.length > 0 ? totalFaturado / faturados.length : 0;

  // Em aberto: aprovado/executado/faturado sem dataPagamento. Cancelado/rejeitado fora.
  const emAbertoOrcs = orcamentos.filter(
    (o) =>
      (o.status === "aprovado" || o.status === "executado") &&
      !o.dataPagamento,
  );
  const emAberto = emAbertoOrcs.reduce((acc, o) => acc + (Number(o.valorFinal) || 0), 0);

  const ativos = orcamentos.filter((o) => o.status !== "cancelado" && o.status !== "rejeitado");
  const concluidos = orcamentos.filter(
    (o) => o.status === "executado" || o.status === "aprovado",
  );

  const taxaConversao = ativos.length > 0 ? concluidos.length / ativos.length : 0;

  // Datas
  const datas = orcamentos
    .map((o) => o.dataCriacao)
    .filter(Boolean)
    .sort();
  const primeiroOrcamentoEm = datas[0] ?? null;
  const ultimoOrcamentoEm = datas[datas.length - 1] ?? null;

  return {
    totalFaturado,
    ticketMedio,
    emAberto,
    qtdOrcamentos: orcamentos.length,
    qtdConcluidos: concluidos.length,
    taxaConversao,
    primeiroOrcamentoEm,
    ultimoOrcamentoEm,
  };
}

/** Build the unified timeline (newest first). */
export function buildTimeline(
  orcamentos: Orcamento[],
  visitas: Visita[],
  retornos: RetornoServico[],
): TimelineEvento[] {
  const eventos: TimelineEvento[] = [];

  // Visitas
  for (const v of visitas) {
    const dateStr = `${v.dataVisita}T${v.horaVisita || "08:00:00"}`;
    const d = new Date(dateStr);
    const isPast = d.getTime() < Date.now();
    eventos.push({
      id: `visita-${v.id}`,
      tipo: v.status === "realizada" || (isPast && v.status === "agendada") ? "visita_realizada" : "visita_agendada",
      data: dateStr,
      ordemDate: d,
      titulo: v.status === "realizada" ? "Visita realizada" : "Visita agendada",
      descricao: v.tipoServico || v.observacoes || v.enderecoCompleto,
      visitaId: v.id,
    });
  }

  // Orçamentos — múltiplos eventos por orçamento (cada marco)
  for (const o of orcamentos) {
    if (o.dataCriacao) {
      eventos.push({
        id: `orc-${o.id}-criado`,
        tipo: "orcamento_criado",
        data: o.dataCriacao,
        ordemDate: new Date(o.dataCriacao),
        titulo: `Orçamento #${o.numeroOrcamento} criado`,
        descricao: o.descricaoGeral || undefined,
        orcamentoId: o.id,
        numeroOrcamento: o.numeroOrcamento,
        valor: o.valorFinal,
      });
    }
    if (o.status === "aprovado" && o.dataExecucao) {
      // we don't have explicit dataAprovacao; skip duplicate
    }
    if (o.dataExecucao) {
      eventos.push({
        id: `orc-${o.id}-executado`,
        tipo: "orcamento_executado",
        data: o.dataExecucao,
        ordemDate: new Date(o.dataExecucao),
        titulo: `Orçamento #${o.numeroOrcamento} executado`,
        orcamentoId: o.id,
        numeroOrcamento: o.numeroOrcamento,
        valor: o.valorFinal,
      });
    }
    if (o.dataFaturamento) {
      eventos.push({
        id: `orc-${o.id}-faturado`,
        tipo: "orcamento_faturado",
        data: o.dataFaturamento,
        ordemDate: new Date(o.dataFaturamento),
        titulo: `Orçamento #${o.numeroOrcamento} faturado`,
        orcamentoId: o.id,
        numeroOrcamento: o.numeroOrcamento,
        valor: o.valorFinal,
      });
    }
    if (o.dataPagamento) {
      eventos.push({
        id: `orc-${o.id}-pago`,
        tipo: "orcamento_pago",
        data: o.dataPagamento,
        ordemDate: new Date(o.dataPagamento),
        titulo: `Orçamento #${o.numeroOrcamento} pago`,
        orcamentoId: o.id,
        numeroOrcamento: o.numeroOrcamento,
        valor: o.valorFinal,
      });
    }
    if (o.dataCancelamento) {
      eventos.push({
        id: `orc-${o.id}-cancelado`,
        tipo: "orcamento_cancelado",
        data: o.dataCancelamento,
        ordemDate: new Date(o.dataCancelamento),
        titulo: `Orçamento #${o.numeroOrcamento} cancelado`,
        orcamentoId: o.id,
        numeroOrcamento: o.numeroOrcamento,
      });
    }
  }

  // Retornos do serviço
  for (const r of retornos) {
    eventos.push({
      id: `ret-${r.id}-aberto`,
      tipo: "retorno_aberto",
      data: r.createdAt,
      ordemDate: new Date(r.createdAt),
      titulo: `${TIPO_RETORNO_CONFIG[r.tipo]?.label ?? "Retorno"} aberto (${STATUS_RETORNO_CONFIG[r.status]?.label ?? r.status})`,
      descricao: r.descricao,
      retornoId: r.id,
      orcamentoId: r.orcamentoId,
    });
    if (r.status === "resolvido" && r.updatedAt && r.updatedAt !== r.createdAt) {
      eventos.push({
        id: `ret-${r.id}-resolvido`,
        tipo: "retorno_resolvido",
        data: r.updatedAt,
        ordemDate: new Date(r.updatedAt),
        titulo: `Retorno resolvido`,
        descricao: r.resolucao || undefined,
        retornoId: r.id,
        orcamentoId: r.orcamentoId,
      });
    }
  }

  // Sort: most recent first
  eventos.sort((a, b) => b.ordemDate.getTime() - a.ordemDate.getTime());
  return eventos;
}

/** Pendências comerciais: orçamentos pendentes do cliente, com followup quando houver. */
export function buildAcompanhamentos(
  orcamentos: Orcamento[],
  followUpsByOrcId: Map<string, OrcamentoFollowUp>,
): AcompanhamentoPendente[] {
  return orcamentos
    .filter((o) => o.status === "pendente")
    .map((o) => ({
      orcamentoId: o.id,
      numeroOrcamento: o.numeroOrcamento,
      valorFinal: o.valorFinal,
      dataCriacao: o.dataCriacao,
      followUp: followUpsByOrcId.get(o.id) ?? null,
    }))
    .sort((a, b) => {
      // dataRetorno asc (próxima ação primeiro), depois dataCriacao desc
      const ar = a.followUp?.dataRetorno;
      const br = b.followUp?.dataRetorno;
      if (ar && br) return ar.localeCompare(br);
      if (ar) return -1;
      if (br) return 1;
      return b.dataCriacao.localeCompare(a.dataCriacao);
    });
}

/** Top-level orchestrator that builds the full 360° dataset. */
export function buildClienteHistorico(input: {
  orcamentos: Orcamento[];
  visitas: Visita[];
  retornos: RetornoServico[];
  followUps: OrcamentoFollowUp[];
  clienteId?: string | null;
  nomeCliente?: string | null;
}): ClienteHistoricoData {
  const orcs = filterOrcamentosByCliente(input.orcamentos, {
    clienteId: input.clienteId,
    nomeCliente: input.nomeCliente,
  });
  const orcIds = new Set(orcs.map((o) => o.id));
  const vis = filterVisitasByCliente(input.visitas, {
    clienteId: input.clienteId,
    nomeCliente: input.nomeCliente,
  });
  const rets = filterRetornosByOrcamentos(input.retornos, orcIds);

  const fMap = new Map<string, OrcamentoFollowUp>();
  for (const f of input.followUps) {
    if (orcIds.has(f.orcamentoId)) fMap.set(f.orcamentoId, f);
  }

  return {
    resumo: computeResumoFinanceiro(orcs),
    orcamentos: orcs,
    visitas: vis,
    retornos: rets,
    acompanhamentos: buildAcompanhamentos(orcs, fMap),
    timeline: buildTimeline(orcs, vis, rets),
  };
}
