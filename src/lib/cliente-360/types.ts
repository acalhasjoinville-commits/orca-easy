/**
 * Cliente 360° — types.
 * Read-only module: derives from existing Orcamento, Visita, RetornoServico.
 */
import type { Orcamento, RetornoServico, Visita, OrcamentoFollowUp } from "@/lib/types";

export interface ResumoFinanceiroCliente {
  /** Total faturado: soma de valor_final dos orçamentos executados/faturados/pagos */
  totalFaturado: number;
  /** Ticket médio dos mesmos orçamentos (faturados+) */
  ticketMedio: number;
  /** Em aberto: aprovados/executados/faturados sem pagamento */
  emAberto: number;
  /** Total de orçamentos do cliente (todos os status, exceto cancelado/rejeitado para "ativos") */
  qtdOrcamentos: number;
  /** Quantidade de orçamentos executados ou superiores */
  qtdConcluidos: number;
  /** Taxa de conversão = aprovados+executados / (todos exceto rascunho) */
  taxaConversao: number;
  /** Data do primeiro orçamento (cronologicamente) */
  primeiroOrcamentoEm: string | null;
  /** Data do último orçamento */
  ultimoOrcamentoEm: string | null;
}

export type TimelineEventoTipo =
  | "visita_agendada"
  | "visita_realizada"
  | "orcamento_criado"
  | "orcamento_aprovado"
  | "orcamento_executado"
  | "orcamento_faturado"
  | "orcamento_pago"
  | "orcamento_cancelado"
  | "retorno_aberto"
  | "retorno_resolvido";

export interface TimelineEvento {
  id: string;
  tipo: TimelineEventoTipo;
  /** Data ISO ou YYYY-MM-DD para ordenação */
  data: string;
  /** Para ordenação cronológica precisa */
  ordemDate: Date;
  titulo: string;
  descricao?: string;
  orcamentoId?: string;
  visitaId?: string;
  retornoId?: string;
  numeroOrcamento?: number;
  valor?: number;
}

export interface AcompanhamentoPendente {
  orcamentoId: string;
  numeroOrcamento: number;
  valorFinal: number;
  dataCriacao: string;
  followUp: OrcamentoFollowUp | null;
}

export interface ClienteHistoricoData {
  resumo: ResumoFinanceiroCliente;
  orcamentos: Orcamento[];
  visitas: Visita[];
  retornos: RetornoServico[];
  acompanhamentos: AcompanhamentoPendente[];
  timeline: TimelineEvento[];
}
