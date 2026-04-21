import { describe, expect, it } from "vitest";

import {
  aggregateClientesABC,
  aggregateDRE,
  aggregateServicos,
  aggregateVendas,
  knownCost,
} from "@/lib/relatorios/aggregations";
import type { ItemServico, LancamentoFinanceiro, Orcamento, StatusOrcamento } from "@/lib/types";

function makeItem(overrides: Partial<ItemServico> = {}): ItemServico {
  return {
    id: overrides.id ?? "item-" + Math.random().toString(36).slice(2),
    servicoTemplateId: "tpl",
    nomeServico: overrides.nomeServico ?? "Calha padrão",
    motorType: "motor1",
    materialId: "mat",
    espessura: 0.4,
    corte: 0.3,
    metragem: 10,
    dificuldade: "medio",
    fatorDificuldade: 3.5,
    custoMetroLinear: 10,
    custoTotalMaterial: 100,
    insumosCalculados: [],
    custoTotalInsumos: 50,
    custoTotalObra: 150,
    valorVenda: 525,
    ...overrides,
  };
}

function makeOrc(overrides: Partial<Orcamento> = {}): Orcamento {
  return {
    id: overrides.id ?? "orc-" + Math.random().toString(36).slice(2),
    numeroOrcamento: overrides.numeroOrcamento ?? 1001,
    clienteId: overrides.clienteId ?? "cli-1",
    nomeCliente: overrides.nomeCliente ?? "Cliente A",
    motorType: "motor1",
    itensServico: overrides.itensServico ?? [makeItem()],
    custoTotalObra: overrides.custoTotalObra ?? 150,
    valorVenda: overrides.valorVenda ?? 525,
    desconto: 0,
    valorFinal: overrides.valorFinal ?? 525,
    dataCriacao: overrides.dataCriacao ?? "2025-04-15T10:00:00.000Z",
    status: (overrides.status ?? "aprovado") as StatusOrcamento,
    validade: "",
    descricaoGeral: "",
    formasPagamento: "",
    garantia: "",
    tempoGarantia: "",
    dataExecucao: overrides.dataExecucao ?? null,
    dataPrevista: null,
    dataFaturamento: overrides.dataFaturamento ?? null,
    dataPagamento: overrides.dataPagamento ?? null,
    dataCancelamento: null,
  };
}

const fullApril = { start: new Date(2025, 3, 1), end: new Date(2025, 3, 30, 23, 59, 59) };

describe("knownCost helper", () => {
  it("sums custoConhecido when present and ignores incomplete items", () => {
    const orc = makeOrc({
      itensServico: [
        makeItem({ custoConhecido: 100, custoTotalObra: 999 }),
        makeItem({ custoConhecido: 50 }),
        makeItem({ custoIncompleto: true, custoTotalObra: 9999 }),
      ],
    });
    const r = knownCost(orc);
    expect(r.value).toBe(150);
    expect(r.partial).toBe(true);
  });

  it("falls back to custoTotalObra when custoConhecido is undefined", () => {
    const orc = makeOrc({ itensServico: [makeItem({ custoTotalObra: 200 })] });
    expect(knownCost(orc)).toEqual({ value: 200, partial: false });
  });
});

describe("aggregateVendas", () => {
  it("only counts aprovado/executado orçamentos for revenue", () => {
    const orcs = [
      makeOrc({ status: "aprovado", valorFinal: 500 }),
      makeOrc({ status: "pendente", valorFinal: 999 }),
      makeOrc({ status: "executado", valorFinal: 300 }),
      makeOrc({ status: "rejeitado", valorFinal: 777 }),
    ];
    const r = aggregateVendas(orcs, fullApril);
    expect(r.faturamento).toBe(800);
    expect(r.qtdOrcamentos).toBe(2);
  });

  it("returns null lucro/margem when any item is incomplete (parcial)", () => {
    const orcs = [
      makeOrc({
        status: "aprovado",
        valorFinal: 500,
        itensServico: [makeItem({ custoIncompleto: true })],
      }),
    ];
    const r = aggregateVendas(orcs, fullApril);
    expect(r.lucro).toBeNull();
    expect(r.margem).toBeNull();
    expect(r.hasIncomplete).toBe(true);
  });

  it("respects the date range", () => {
    const orcs = [
      makeOrc({ status: "aprovado", dataCriacao: "2025-03-31T10:00:00.000Z", valorFinal: 100 }),
      makeOrc({ status: "aprovado", dataCriacao: "2025-04-15T10:00:00.000Z", valorFinal: 200 }),
      makeOrc({ status: "aprovado", dataCriacao: "2025-05-01T10:00:00.000Z", valorFinal: 400 }),
    ];
    const r = aggregateVendas(orcs, fullApril);
    expect(r.faturamento).toBe(200);
  });

  it("computes conversion as approved / (approved + rejected)", () => {
    const orcs = [
      makeOrc({ status: "aprovado", valorFinal: 100 }),
      makeOrc({ status: "executado", valorFinal: 100 }),
      makeOrc({ status: "rejeitado", valorFinal: 100 }),
    ];
    const r = aggregateVendas(orcs, fullApril);
    expect(r.conversao).toBeCloseTo((2 / 3) * 100);
  });
});

describe("aggregateClientesABC", () => {
  it("classifies clients into A/B/C by accumulated revenue", () => {
    const orcs = [
      makeOrc({ clienteId: "c1", nomeCliente: "Cliente 1", valorFinal: 800, status: "aprovado" }),
      makeOrc({ clienteId: "c2", nomeCliente: "Cliente 2", valorFinal: 150, status: "aprovado" }),
      makeOrc({ clienteId: "c3", nomeCliente: "Cliente 3", valorFinal: 50, status: "aprovado" }),
    ];
    const r = aggregateClientesABC(orcs, fullApril);
    expect(r.total).toBe(1000);
    expect(r.rows[0]).toMatchObject({ cliente: "Cliente 1", classe: "A" });
    expect(r.rows[1]).toMatchObject({ cliente: "Cliente 2", classe: "B" });
    expect(r.rows[2]).toMatchObject({ cliente: "Cliente 3", classe: "C" });
  });

  it("ignores out-of-range and non-profitable orçamentos", () => {
    const orcs = [
      makeOrc({ clienteId: "c1", status: "pendente", valorFinal: 500 }),
      makeOrc({ clienteId: "c1", status: "aprovado", valorFinal: 200 }),
    ];
    const r = aggregateClientesABC(orcs, fullApril);
    expect(r.total).toBe(200);
    expect(r.rows).toHaveLength(1);
  });
});

describe("aggregateServicos", () => {
  it("aggregates by service name and sums revenue/cost", () => {
    const orcs = [
      makeOrc({
        status: "aprovado",
        valorFinal: 500,
        itensServico: [
          makeItem({ nomeServico: "Calha", valorVenda: 300, custoTotalObra: 100 }),
          makeItem({ nomeServico: "Rufo", valorVenda: 200, custoTotalObra: 80 }),
        ],
      }),
      makeOrc({
        status: "executado",
        valorFinal: 700,
        itensServico: [makeItem({ nomeServico: "Calha", valorVenda: 700, custoTotalObra: 250 })],
      }),
    ];
    const r = aggregateServicos(orcs, fullApril);
    const calha = r.rows.find((row) => row.nomeServico === "Calha");
    expect(calha?.qtdItens).toBe(2);
    expect(calha?.receita).toBe(1000);
    expect(calha?.custo).toBe(350);
  });

  it("marks service as partial when any of its items has incomplete cost", () => {
    const orcs = [
      makeOrc({
        status: "aprovado",
        itensServico: [makeItem({ nomeServico: "X", custoIncompleto: true, valorVenda: 100 })],
      }),
    ];
    const r = aggregateServicos(orcs, fullApril);
    expect(r.rows[0].partial).toBe(true);
    expect(r.rows[0].lucro).toBeNull();
  });
});

describe("aggregateDRE", () => {
  it("sums executed quotes as revenue and manual entries by category", () => {
    const orcs = [
      makeOrc({
        status: "executado",
        valorFinal: 1000,
        dataExecucao: "2025-04-10T10:00:00.000Z",
      }),
    ];
    const lancs: LancamentoFinanceiro[] = [
      {
        id: "l1",
        empresaId: "e1",
        tipo: "despesa",
        descricao: "Gasolina",
        valor: 200,
        data: "2025-04-12",
        categoria: "Combustível",
        observacao: "",
        origem: "manual",
      },
      {
        id: "l2",
        empresaId: "e1",
        tipo: "receita",
        descricao: "Avulso",
        valor: 100,
        data: "2025-04-20",
        categoria: "Receita Avulsa",
        observacao: "",
        origem: "manual",
      },
    ];
    const r = aggregateDRE(orcs, lancs, fullApril);
    expect(r.totalReceitas).toBe(1100);
    expect(r.totalDespesas).toBe(200);
    expect(r.resultadoLiquido).toBe(900);
    const totalCategoryReceitas = r.receitas.reduce((s, c) => s + c.total, 0);
    expect(totalCategoryReceitas).toBe(r.totalReceitas);
  });

  it("excludes entries outside the date range", () => {
    const orcs = [
      makeOrc({
        status: "executado",
        valorFinal: 500,
        dataExecucao: "2025-05-01T10:00:00.000Z",
      }),
    ];
    const r = aggregateDRE(orcs, [], fullApril);
    expect(r.totalReceitas).toBe(0);
  });
});
