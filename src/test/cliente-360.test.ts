import { describe, it, expect } from "vitest";
import {
  buildAcompanhamentos,
  buildClienteHistorico,
  buildTimeline,
  computeResumoFinanceiro,
  filterOrcamentosByCliente,
  filterRetornosByOrcamentos,
  filterVisitasByCliente,
} from "@/lib/cliente-360/aggregations";
import type {
  Orcamento,
  OrcamentoFollowUp,
  RetornoServico,
  StatusOrcamento,
  Visita,
} from "@/lib/types";

function makeOrcamento(partial: Partial<Orcamento>): Orcamento {
  return {
    id: "o1",
    numeroOrcamento: 1,
    clienteId: "c1",
    nomeCliente: "Cliente A",
    itensServico: [],
    custoTotalObra: 0,
    valorVenda: 0,
    desconto: 0,
    valorFinal: 0,
    dataCriacao: "2025-01-01T00:00:00.000Z",
    status: "pendente" as StatusOrcamento,
    validade: "",
    descricaoGeral: "",
    formasPagamento: "",
    garantia: "",
    tempoGarantia: "",
    ...partial,
  };
}

function makeVisita(partial: Partial<Visita>): Visita {
  return {
    id: "v1",
    empresaId: "e1",
    nomeCliente: "Cliente A",
    telefone: "",
    enderecoCompleto: "",
    bairro: "",
    cidade: "",
    complemento: "",
    pontoReferencia: "",
    tipoServico: "",
    observacoes: "",
    responsavelId: null,
    responsavelNome: "",
    origemContato: "",
    dataVisita: "2025-01-15",
    horaVisita: "08:00:00",
    status: "agendada",
    clienteId: "c1",
    orcamentoId: null,
    createdAt: "2025-01-10T00:00:00.000Z",
    updatedAt: "2025-01-10T00:00:00.000Z",
    ...partial,
  };
}

function makeRetorno(partial: Partial<RetornoServico>): RetornoServico {
  return {
    id: "r1",
    empresaId: "e1",
    orcamentoId: "o1",
    tipo: "garantia",
    status: "aberto",
    descricao: "Ajuste necessário",
    dataRetorno: null,
    horaRetorno: null,
    responsavelId: null,
    responsavelNome: "",
    observacoes: "",
    resolucao: "",
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-02-01T00:00:00.000Z",
    ...partial,
  };
}

describe("cliente-360/aggregations", () => {
  describe("filterOrcamentosByCliente", () => {
    it("filtra por clienteId quando informado", () => {
      const orcs = [
        makeOrcamento({ id: "a", clienteId: "c1" }),
        makeOrcamento({ id: "b", clienteId: "c2" }),
      ];
      expect(filterOrcamentosByCliente(orcs, { clienteId: "c1" })).toHaveLength(1);
    });

    it("filtra por nome (avulso) apenas quando clienteId é vazio", () => {
      const orcs = [
        makeOrcamento({ id: "a", clienteId: "", nomeCliente: "João Silva" }),
        makeOrcamento({ id: "b", clienteId: "c1", nomeCliente: "João Silva" }),
        makeOrcamento({ id: "c", clienteId: "", nomeCliente: " JOÃO SILVA " }),
      ];
      const result = filterOrcamentosByCliente(orcs, { nomeCliente: "joão silva" });
      expect(result.map((o) => o.id).sort()).toEqual(["a", "c"]);
    });

    it("retorna lista vazia sem identificadores", () => {
      expect(filterOrcamentosByCliente([makeOrcamento({})], {})).toHaveLength(0);
    });
  });

  describe("filterVisitasByCliente / filterRetornosByOrcamentos", () => {
    it("filtra visitas por clienteId", () => {
      const v = [makeVisita({ clienteId: "c1" }), makeVisita({ id: "v2", clienteId: "c2" })];
      expect(filterVisitasByCliente(v, { clienteId: "c1" })).toHaveLength(1);
    });

    it("filtra visitas avulsas por nome quando sem clienteId", () => {
      const v = [
        makeVisita({ id: "v1", clienteId: null, nomeCliente: "Maria" }),
        makeVisita({ id: "v2", clienteId: "c1", nomeCliente: "Maria" }),
      ];
      const r = filterVisitasByCliente(v, { nomeCliente: "maria" });
      expect(r.map((x) => x.id)).toEqual(["v1"]);
    });

    it("filtra retornos pelos orcamentos do cliente", () => {
      const rets = [makeRetorno({ orcamentoId: "o1" }), makeRetorno({ id: "r2", orcamentoId: "o2" })];
      expect(filterRetornosByOrcamentos(rets, new Set(["o1"]))).toHaveLength(1);
    });
  });

  describe("computeResumoFinanceiro", () => {
    it("soma faturado apenas para executados ou com data de faturamento/pagamento", () => {
      const orcs = [
        makeOrcamento({ id: "1", status: "executado", valorFinal: 1000 }),
        makeOrcamento({ id: "2", status: "aprovado", valorFinal: 500 }),
        makeOrcamento({
          id: "3",
          status: "aprovado",
          valorFinal: 300,
          dataFaturamento: "2025-03-01T00:00:00.000Z",
        }),
        makeOrcamento({ id: "4", status: "cancelado", valorFinal: 9999 }),
      ];
      const r = computeResumoFinanceiro(orcs);
      expect(r.totalFaturado).toBe(1300);
      expect(r.ticketMedio).toBe(650);
    });

    it("calcula em aberto excluindo pagos e cancelados", () => {
      const orcs = [
        makeOrcamento({ id: "1", status: "aprovado", valorFinal: 200 }),
        makeOrcamento({ id: "2", status: "executado", valorFinal: 800 }),
        makeOrcamento({
          id: "3",
          status: "executado",
          valorFinal: 500,
          dataPagamento: "2025-04-01T00:00:00.000Z",
        }),
        makeOrcamento({ id: "4", status: "cancelado", valorFinal: 9999 }),
      ];
      const r = computeResumoFinanceiro(orcs);
      expect(r.emAberto).toBe(1000);
    });

    it("retorna zeros quando lista vazia", () => {
      const r = computeResumoFinanceiro([]);
      expect(r.totalFaturado).toBe(0);
      expect(r.ticketMedio).toBe(0);
      expect(r.emAberto).toBe(0);
      expect(r.taxaConversao).toBe(0);
      expect(r.primeiroOrcamentoEm).toBeNull();
    });

    it("calcula taxa de conversão excluindo cancelados/rejeitados", () => {
      const orcs = [
        makeOrcamento({ id: "1", status: "pendente", valorFinal: 100 }),
        makeOrcamento({ id: "2", status: "aprovado", valorFinal: 100 }),
        makeOrcamento({ id: "3", status: "executado", valorFinal: 100 }),
        makeOrcamento({ id: "4", status: "rejeitado", valorFinal: 100 }),
      ];
      const r = computeResumoFinanceiro(orcs);
      // ativos = 3 (pendente, aprovado, executado), concluidos = 2 (aprovado + executado)
      expect(r.taxaConversao).toBeCloseTo(2 / 3, 5);
    });

    it("identifica primeiro e último orçamento", () => {
      const orcs = [
        makeOrcamento({ id: "a", dataCriacao: "2025-03-10T00:00:00.000Z" }),
        makeOrcamento({ id: "b", dataCriacao: "2025-01-01T00:00:00.000Z" }),
        makeOrcamento({ id: "c", dataCriacao: "2025-06-15T00:00:00.000Z" }),
      ];
      const r = computeResumoFinanceiro(orcs);
      expect(r.primeiroOrcamentoEm).toBe("2025-01-01T00:00:00.000Z");
      expect(r.ultimoOrcamentoEm).toBe("2025-06-15T00:00:00.000Z");
    });
  });

  describe("buildTimeline", () => {
    it("ordena eventos do mais recente para o mais antigo", () => {
      const orcs = [
        makeOrcamento({
          id: "o1",
          numeroOrcamento: 100,
          dataCriacao: "2025-01-01T10:00:00.000Z",
          dataExecucao: "2025-02-15T10:00:00.000Z",
        }),
      ];
      const timeline = buildTimeline(orcs, [], []);
      expect(timeline).toHaveLength(2);
      expect(timeline[0].tipo).toBe("orcamento_executado");
      expect(timeline[1].tipo).toBe("orcamento_criado");
    });

    it("gera múltiplos eventos por orçamento (criado/executado/faturado/pago)", () => {
      const orcs = [
        makeOrcamento({
          id: "o1",
          numeroOrcamento: 100,
          dataCriacao: "2025-01-01T00:00:00.000Z",
          dataExecucao: "2025-02-01T00:00:00.000Z",
          dataFaturamento: "2025-03-01T00:00:00.000Z",
          dataPagamento: "2025-04-01T00:00:00.000Z",
        }),
      ];
      const timeline = buildTimeline(orcs, [], []);
      const tipos = timeline.map((e) => e.tipo).sort();
      expect(tipos).toEqual([
        "orcamento_criado",
        "orcamento_executado",
        "orcamento_faturado",
        "orcamento_pago",
      ]);
    });

    it("inclui visitas e retornos", () => {
      const v = [makeVisita({ id: "v1", dataVisita: "2025-05-01", status: "agendada" })];
      const r = [
        makeRetorno({
          id: "r1",
          status: "resolvido",
          createdAt: "2025-06-01T00:00:00.000Z",
          updatedAt: "2025-06-10T00:00:00.000Z",
        }),
      ];
      const timeline = buildTimeline([], v, r);
      const tipos = timeline.map((e) => e.tipo);
      expect(tipos).toContain("visita_agendada");
      expect(tipos).toContain("retorno_aberto");
      expect(tipos).toContain("retorno_resolvido");
    });
  });

  describe("buildAcompanhamentos", () => {
    it("inclui apenas orçamentos pendentes", () => {
      const orcs = [
        makeOrcamento({ id: "o1", status: "pendente" }),
        makeOrcamento({ id: "o2", status: "aprovado" }),
        makeOrcamento({ id: "o3", status: "executado" }),
      ];
      const result = buildAcompanhamentos(orcs, new Map());
      expect(result).toHaveLength(1);
      expect(result[0].orcamentoId).toBe("o1");
    });

    it("ordena por dataRetorno asc, depois dataCriacao desc", () => {
      const orcs = [
        makeOrcamento({ id: "o1", status: "pendente", dataCriacao: "2025-01-01T00:00:00.000Z" }),
        makeOrcamento({ id: "o2", status: "pendente", dataCriacao: "2025-02-01T00:00:00.000Z" }),
        makeOrcamento({ id: "o3", status: "pendente", dataCriacao: "2025-03-01T00:00:00.000Z" }),
      ];
      const f = new Map<string, OrcamentoFollowUp>();
      f.set("o2", {
        id: "f2",
        orcamentoId: "o2",
        empresaId: "e1",
        statusFollowUp: "agendado",
        proximaAcao: "",
        dataRetorno: "2025-04-10",
        responsavelId: null,
        responsavelNome: "",
        ultimaInteracaoEm: null,
        observacoes: "",
      });
      const result = buildAcompanhamentos(orcs, f);
      // o2 tem dataRetorno: vem primeiro; depois o3 (dataCriacao mais recente), depois o1
      expect(result.map((a) => a.orcamentoId)).toEqual(["o2", "o3", "o1"]);
    });
  });

  describe("buildClienteHistorico", () => {
    it("compõe dataset completo para cliente cadastrado", () => {
      const orcamentos = [
        makeOrcamento({ id: "o1", clienteId: "c1", status: "executado", valorFinal: 1500 }),
        makeOrcamento({ id: "o2", clienteId: "c2", status: "executado", valorFinal: 999 }),
      ];
      const visitas = [makeVisita({ clienteId: "c1" })];
      const retornos = [makeRetorno({ orcamentoId: "o1" })];

      const data = buildClienteHistorico({
        orcamentos,
        visitas,
        retornos,
        followUps: [],
        clienteId: "c1",
      });

      expect(data.orcamentos).toHaveLength(1);
      expect(data.visitas).toHaveLength(1);
      expect(data.retornos).toHaveLength(1);
      expect(data.resumo.totalFaturado).toBe(1500);
      expect(data.timeline.length).toBeGreaterThan(0);
    });

    it("compõe dataset para cliente avulso (sem clienteId)", () => {
      const orcamentos = [
        makeOrcamento({ id: "o1", clienteId: "", nomeCliente: "Pedro" }),
        makeOrcamento({ id: "o2", clienteId: "c1", nomeCliente: "Pedro" }),
      ];
      const data = buildClienteHistorico({
        orcamentos,
        visitas: [],
        retornos: [],
        followUps: [],
        nomeCliente: "Pedro",
      });
      expect(data.orcamentos.map((o) => o.id)).toEqual(["o1"]);
    });
  });
});
