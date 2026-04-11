import { useMemo } from "react";
import { useFilaComercial, FilaComercialItem } from "@/hooks/useFollowUp";
import { useVisitas } from "@/hooks/useVisitas";
import { Orcamento, Visita } from "@/lib/types";
import { getTodayLocal, toLocalDateStr } from "@/lib/dateUtils";

export interface PendenciaItem {
  id: string;
  orcamentoId?: string | null;
  visitaId?: string | null;
  numero?: number | null;
  nomeCliente: string;
  horaVisita?: string | null;
}

export interface PendenciasComercial {
  followUpsHoje: PendenciaItem[];
  followUpsAtrasados: PendenciaItem[];
  semRetorno: PendenciaItem[];
}

export interface PendenciasOperacao {
  aprovadosSemDataPrevista: PendenciaItem[];
  execucaoHoje: PendenciaItem[];
  execucaoAtrasada: PendenciaItem[];
}

export interface PendenciasFinanceiro {
  executadosSemFaturamento: PendenciaItem[];
  faturadosSemPagamento: PendenciaItem[];
}

export interface PendenciasVisitas {
  visitasHoje: PendenciaItem[];
  visitasAtrasadas: PendenciaItem[];
}

export interface Pendencias {
  comercial: PendenciasComercial;
  operacao: PendenciasOperacao;
  financeiro: PendenciasFinanceiro;
  visitas: PendenciasVisitas;
  totalComercial: number;
  totalOperacao: number;
  totalFinanceiro: number;
  totalVisitas: number;
  isComercialLoading: boolean;
  isVisitasLoading: boolean;
}

export function usePendencias(orcamentos: Orcamento[]): Pendencias {
  const { data: filaComercial, isLoading: isComercialLoading } = useFilaComercial();
  const { visitas, isLoading: isVisitasLoading } = useVisitas();

  return useMemo(() => {
    const hoje = getTodayLocal();
    const fila = filaComercial ?? [];

    const followUpsHoje: PendenciaItem[] = [];
    const followUpsAtrasados: PendenciaItem[] = [];
    const semRetorno: PendenciaItem[] = [];

    for (const item of fila) {
      if (item.statusFollowUp === "concluido") continue;
      if (item.statusOrcamento === "cancelado" || item.statusOrcamento === "rejeitado") continue;

      const retornoLocal = toLocalDateStr(item.dataRetorno);

      if (retornoLocal === hoje) {
        followUpsHoje.push(toItem(item));
      } else if (retornoLocal && retornoLocal < hoje) {
        followUpsAtrasados.push(toItem(item));
      }

      if (item.statusFollowUp === "sem_retorno" && item.statusOrcamento === "pendente") {
        semRetorno.push(toItem(item));
      }
    }

    const aprovadosSemDataPrevista: PendenciaItem[] = [];
    const execucaoHoje: PendenciaItem[] = [];
    const execucaoAtrasada: PendenciaItem[] = [];

    const executadosSemFaturamento: PendenciaItem[] = [];
    const faturadosSemPagamento: PendenciaItem[] = [];
    const visitasHoje: PendenciaItem[] = [];
    const visitasAtrasadas: PendenciaItem[] = [];

    for (const orcamento of orcamentos) {
      if (orcamento.status === "aprovado") {
        if (!orcamento.dataPrevista) {
          aprovadosSemDataPrevista.push(toItemOrc(orcamento));
        } else {
          const previstaLocal = toLocalDateStr(orcamento.dataPrevista);

          if (previstaLocal === hoje) {
            execucaoHoje.push(toItemOrc(orcamento));
          } else if (previstaLocal && previstaLocal < hoje) {
            execucaoAtrasada.push(toItemOrc(orcamento));
          }
        }
      }

      if (orcamento.status === "cancelado") continue;

      if (orcamento.status === "executado" && !orcamento.dataFaturamento) {
        executadosSemFaturamento.push(toItemOrc(orcamento));
      }

      if (orcamento.dataFaturamento && !orcamento.dataPagamento) {
        faturadosSemPagamento.push(toItemOrc(orcamento));
      }
    }

    for (const visita of visitas) {
      if (visita.status !== "agendada" && visita.status !== "reagendada") continue;

      if (visita.dataVisita === hoje) {
        visitasHoje.push(toItemVisita(visita));
      } else if (visita.dataVisita < hoje) {
        visitasAtrasadas.push(toItemVisita(visita));
      }
    }

    return {
      comercial: {
        followUpsHoje,
        followUpsAtrasados,
        semRetorno,
      },
      operacao: {
        aprovadosSemDataPrevista,
        execucaoHoje,
        execucaoAtrasada,
      },
      financeiro: {
        executadosSemFaturamento,
        faturadosSemPagamento,
      },
      visitas: {
        visitasHoje,
        visitasAtrasadas,
      },
      totalComercial: followUpsHoje.length + followUpsAtrasados.length + semRetorno.length,
      totalOperacao: aprovadosSemDataPrevista.length + execucaoHoje.length + execucaoAtrasada.length,
      totalFinanceiro: executadosSemFaturamento.length + faturadosSemPagamento.length,
      totalVisitas: visitasHoje.length + visitasAtrasadas.length,
      isComercialLoading,
      isVisitasLoading,
    };
  }, [filaComercial, isComercialLoading, isVisitasLoading, orcamentos, visitas]);
}

function toItem(item: FilaComercialItem): PendenciaItem {
  return {
    id: item.orcamentoId,
    orcamentoId: item.orcamentoId,
    numero: item.numeroOrcamento,
    nomeCliente: item.nomeCliente,
  };
}

function toItemOrc(orcamento: Orcamento): PendenciaItem {
  return {
    id: orcamento.id,
    orcamentoId: orcamento.id,
    numero: orcamento.numeroOrcamento,
    nomeCliente: orcamento.nomeCliente,
  };
}

function toItemVisita(visita: Visita): PendenciaItem {
  return {
    id: visita.id,
    visitaId: visita.id,
    nomeCliente: visita.nomeCliente,
    horaVisita: visita.horaVisita?.slice(0, 5) ?? null,
  };
}
