import { useMemo } from "react";
import { useFilaComercial, FilaComercialItem } from "@/hooks/useFollowUp";
import { Orcamento } from "@/lib/types";
import { toLocalDateStr, getTodayLocal } from "@/lib/dateUtils";

export interface PendenciaItem {
  orcamentoId: string;
  numero: number;
  nomeCliente: string;
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

export interface Pendencias {
  comercial: PendenciasComercial;
  operacao: PendenciasOperacao;
  financeiro: PendenciasFinanceiro;
  totalComercial: number;
  totalOperacao: number;
  totalFinanceiro: number;
  isComercialLoading: boolean;
}

export function usePendencias(orcamentos: Orcamento[]): Pendencias {
  const { data: filaComercial, isLoading: isComercialLoading } = useFilaComercial();

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
      totalComercial: followUpsHoje.length + followUpsAtrasados.length + semRetorno.length,
      totalOperacao: aprovadosSemDataPrevista.length + execucaoHoje.length + execucaoAtrasada.length,
      totalFinanceiro: executadosSemFaturamento.length + faturadosSemPagamento.length,
      isComercialLoading,
    };
  }, [filaComercial, isComercialLoading, orcamentos]);
}

function toItem(item: FilaComercialItem): PendenciaItem {
  return {
    orcamentoId: item.orcamentoId,
    numero: item.numeroOrcamento,
    nomeCliente: item.nomeCliente,
  };
}

function toItemOrc(orcamento: Orcamento): PendenciaItem {
  return {
    orcamentoId: orcamento.id,
    numero: orcamento.numeroOrcamento,
    nomeCliente: orcamento.nomeCliente,
  };
}
