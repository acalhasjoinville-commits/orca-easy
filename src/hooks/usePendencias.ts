import { useMemo } from 'react';
import { Orcamento } from '@/lib/types';
import { FilaComercialItem, useFilaComercial } from '@/hooks/useFollowUp';

// ─── Safe local-date comparison ───

/** Extract YYYY-MM-DD from an ISO/timestamp string using local timezone */
function toLocalDateStr(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTodayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ─── Types ───

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
  isLoading: boolean;
}

// ─── Hook ───

export function usePendencias(orcamentos: Orcamento[]): Pendencias {
  const { data: filaComercial, isLoading: filaLoading } = useFilaComercial();

  return useMemo(() => {
    const hoje = getTodayLocal();

    // ── Comercial (from useFilaComercial — single source of truth) ──
    const fila = filaComercial ?? [];

    const followUpsHoje: PendenciaItem[] = [];
    const followUpsAtrasados: PendenciaItem[] = [];
    const semRetorno: PendenciaItem[] = [];

    for (const item of fila) {
      // Skip concluded or non-pending statuses
      if (item.statusFollowUp === 'concluido') continue;
      if (item.statusOrcamento === 'cancelado' || item.statusOrcamento === 'rejeitado') continue;

      const retornoLocal = toLocalDateStr(item.dataRetorno);

      if (retornoLocal === hoje) {
        followUpsHoje.push(toItem(item));
      } else if (retornoLocal && retornoLocal < hoje) {
        followUpsAtrasados.push(toItem(item));
      }

      if (item.statusFollowUp === 'sem_retorno' && item.statusOrcamento === 'pendente') {
        semRetorno.push(toItem(item));
      }
    }

    // ── Operação (from orcamentos) ──
    const aprovadosSemDataPrevista: PendenciaItem[] = [];
    const execucaoHoje: PendenciaItem[] = [];
    const execucaoAtrasada: PendenciaItem[] = [];

    for (const o of orcamentos) {
      if (o.status === 'aprovado') {
        if (!o.dataPrevista) {
          aprovadosSemDataPrevista.push(toItemOrc(o));
        } else {
          const prevLocal = toLocalDateStr(o.dataPrevista);
          if (prevLocal === hoje) {
            execucaoHoje.push(toItemOrc(o));
          } else if (prevLocal && prevLocal < hoje) {
            execucaoAtrasada.push(toItemOrc(o));
          }
        }
      }
    }

    // ── Financeiro (from orcamentos) ──
    const executadosSemFaturamento: PendenciaItem[] = [];
    const faturadosSemPagamento: PendenciaItem[] = [];

    for (const o of orcamentos) {
      if (o.status === 'cancelado') continue;

      if (o.status === 'executado' && !o.dataFaturamento) {
        executadosSemFaturamento.push(toItemOrc(o));
      }

      if (o.dataFaturamento && !o.dataPagamento) {
        faturadosSemPagamento.push(toItemOrc(o));
      }
    }

    const comercial = { followUpsHoje, followUpsAtrasados, semRetorno };
    const operacao = { aprovadosSemDataPrevista, execucaoHoje, execucaoAtrasada };
    const financeiro = { executadosSemFaturamento, faturadosSemPagamento };

    return {
      comercial,
      operacao,
      financeiro,
      totalComercial: followUpsHoje.length + followUpsAtrasados.length + semRetorno.length,
      totalOperacao: aprovadosSemDataPrevista.length + execucaoHoje.length + execucaoAtrasada.length,
      totalFinanceiro: executadosSemFaturamento.length + faturadosSemPagamento.length,
      isLoading: filaLoading,
    };
  }, [orcamentos, filaComercial, filaLoading]);
}

// ─── Helpers ───

function toItem(f: FilaComercialItem): PendenciaItem {
  return { orcamentoId: f.orcamentoId, numero: f.numeroOrcamento, nomeCliente: f.nomeCliente };
}

function toItemOrc(o: Orcamento): PendenciaItem {
  return { orcamentoId: o.id, numero: o.numeroOrcamento, nomeCliente: o.nomeCliente };
}
