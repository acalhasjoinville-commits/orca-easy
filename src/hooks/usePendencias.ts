import { useMemo } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useFilaComercial, FilaComercialItem } from "@/hooks/useFollowUp";
import { useAllRetornos } from "@/hooks/useRetornosServico";
import { useVisitas } from "@/hooks/useVisitas";
import { Orcamento, RetornoServico, Visita } from "@/lib/types";
import { addDaysLocal, getTodayLocal, toLocalDateStr } from "@/lib/dateUtils";

export interface PendenciaItem {
  id: string;
  orcamentoId?: string | null;
  visitaId?: string | null;
  retornoId?: string | null;
  numero?: number | null;
  nomeCliente: string;
  horaVisita?: string | null;
  date?: string | null;
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

export interface PendenciasRetornos {
  retornosHoje: PendenciaItem[];
  retornosAtrasados: PendenciaItem[];
  retornosSemAgenda: PendenciaItem[];
}

export interface ProximosCompromissos {
  visitasProximas: PendenciaItem[];
  retornosProximos: PendenciaItem[];
  execucoesProximas: PendenciaItem[];
  retornosServicoProximos: PendenciaItem[];
}

export interface Pendencias {
  comercial: PendenciasComercial;
  operacao: PendenciasOperacao;
  financeiro: PendenciasFinanceiro;
  visitas: PendenciasVisitas;
  retornos: PendenciasRetornos;
  proximos: ProximosCompromissos;
  totalComercial: number;
  totalOperacao: number;
  totalFinanceiro: number;
  totalVisitas: number;
  totalRetornos: number;
  totalProximos: number;
  isComercialLoading: boolean;
  isVisitasLoading: boolean;
  isRetornosLoading: boolean;
}

export function usePendencias(orcamentos: Orcamento[]): Pendencias {
  const { canManageAgenda } = useAuth();
  const { data: filaComercial, isLoading: isComercialLoading } = useFilaComercial();
  const { visitas, isLoading: isVisitasLoading } = useVisitas();
  const { data: retornosServico, isLoading: isRetornosLoading } = useAllRetornos(canManageAgenda);

  return useMemo(() => {
    const hoje = getTodayLocal();
    const limite7 = addDaysLocal(7);
    const fila = filaComercial ?? [];
    const orcamentosMap = new Map<string, Orcamento>(orcamentos.map((orcamento) => [orcamento.id, orcamento]));

    const followUpsHoje: PendenciaItem[] = [];
    const followUpsAtrasados: PendenciaItem[] = [];
    const semRetorno: PendenciaItem[] = [];
    const retornosProximos: PendenciaItem[] = [];

    for (const item of fila) {
      if (item.statusFollowUp === "concluido") continue;
      if (item.statusOrcamento === "cancelado" || item.statusOrcamento === "rejeitado") continue;

      const retornoLocal = toLocalDateStr(item.dataRetorno);

      if (retornoLocal === hoje) {
        followUpsHoje.push(toItem(item));
      } else if (retornoLocal && retornoLocal < hoje) {
        followUpsAtrasados.push(toItem(item));
      } else if (retornoLocal && retornoLocal > hoje && retornoLocal <= limite7) {
        retornosProximos.push({ ...toItem(item), date: retornoLocal });
      }

      if (item.statusFollowUp === "sem_retorno" && item.statusOrcamento === "pendente") {
        semRetorno.push(toItem(item));
      }
    }

    const aprovadosSemDataPrevista: PendenciaItem[] = [];
    const execucaoHoje: PendenciaItem[] = [];
    const execucaoAtrasada: PendenciaItem[] = [];
    const execucoesProximas: PendenciaItem[] = [];

    const executadosSemFaturamento: PendenciaItem[] = [];
    const faturadosSemPagamento: PendenciaItem[] = [];
    const visitasHoje: PendenciaItem[] = [];
    const visitasAtrasadas: PendenciaItem[] = [];
    const visitasProximas: PendenciaItem[] = [];

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
          } else if (previstaLocal && previstaLocal > hoje && previstaLocal <= limite7) {
            execucoesProximas.push({ ...toItemOrc(orcamento), date: previstaLocal });
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
      } else if (visita.dataVisita > hoje && visita.dataVisita <= limite7) {
        visitasProximas.push({ ...toItemVisita(visita), date: visita.dataVisita });
      }
    }

    const retornosHoje: PendenciaItem[] = [];
    const retornosAtrasados: PendenciaItem[] = [];
    const retornosSemAgenda: PendenciaItem[] = [];
    const retornosServicoProximos: PendenciaItem[] = [];

    for (const retorno of retornosServico ?? []) {
      if (retorno.status === "encerrado" || retorno.status === "cancelado") continue;

      const item = toItemRetorno(retorno, orcamentosMap.get(retorno.orcamentoId));

      if (!retorno.dataRetorno) {
        retornosSemAgenda.push(item);
        continue;
      }

      if (retorno.dataRetorno === hoje) {
        retornosHoje.push(item);
      } else if (retorno.dataRetorno < hoje) {
        retornosAtrasados.push(item);
      } else if (retorno.dataRetorno <= limite7) {
        retornosServicoProximos.push({ ...item, date: retorno.dataRetorno });
      }
    }

    const sortByDate = (a: PendenciaItem, b: PendenciaItem) => (a.date ?? "").localeCompare(b.date ?? "");
    visitasProximas.sort(sortByDate);
    retornosProximos.sort(sortByDate);
    execucoesProximas.sort(sortByDate);
    retornosServicoProximos.sort(sortByDate);

    const totalRetornos = retornosHoje.length + retornosAtrasados.length + retornosSemAgenda.length;
    const totalProximos =
      visitasProximas.length + retornosProximos.length + execucoesProximas.length + retornosServicoProximos.length;

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
      retornos: {
        retornosHoje,
        retornosAtrasados,
        retornosSemAgenda,
      },
      proximos: {
        visitasProximas,
        retornosProximos,
        execucoesProximas,
        retornosServicoProximos,
      },
      totalComercial: followUpsHoje.length + followUpsAtrasados.length + semRetorno.length,
      totalOperacao: aprovadosSemDataPrevista.length + execucaoHoje.length + execucaoAtrasada.length,
      totalFinanceiro: executadosSemFaturamento.length + faturadosSemPagamento.length,
      totalVisitas: visitasHoje.length + visitasAtrasadas.length,
      totalRetornos,
      totalProximos,
      isComercialLoading,
      isVisitasLoading,
      isRetornosLoading,
    };
  }, [filaComercial, isComercialLoading, isRetornosLoading, isVisitasLoading, orcamentos, retornosServico, visitas]);
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

function toItemRetorno(retorno: RetornoServico, orcamento?: Orcamento): PendenciaItem {
  return {
    id: retorno.id,
    retornoId: retorno.id,
    orcamentoId: retorno.orcamentoId,
    numero: orcamento?.numeroOrcamento ?? null,
    nomeCliente: orcamento?.nomeCliente ?? "Orçamento vinculado",
    horaVisita: retorno.horaRetorno?.slice(0, 5) ?? null,
  };
}
