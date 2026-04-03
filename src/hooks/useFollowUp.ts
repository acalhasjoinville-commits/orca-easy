import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  OrcamentoFollowUp,
  FollowUpLog,
  StatusFollowUp,
  TipoInteracao,
} from '@/lib/types';

// ─── MAPPERS ───

function dbToFollowUp(row: any): OrcamentoFollowUp {
  return {
    id: row.id,
    orcamentoId: row.orcamento_id,
    empresaId: row.empresa_id,
    statusFollowUp: row.status_followup as StatusFollowUp,
    proximaAcao: row.proxima_acao || '',
    dataRetorno: row.data_retorno ?? null,
    responsavelId: row.responsavel_id ?? null,
    responsavelNome: row.responsavel_nome || '',
    ultimaInteracaoEm: row.ultima_interacao_em ?? null,
    observacoes: row.observacoes || '',
  };
}

function dbToLog(row: any): FollowUpLog {
  return {
    id: row.id,
    orcamentoId: row.orcamento_id,
    empresaId: row.empresa_id,
    userId: row.user_id,
    userName: row.user_name || '',
    tipo: row.tipo as TipoInteracao,
    descricao: row.descricao || '',
    createdAt: row.created_at,
  };
}

// ─── Default for orçamentos without follow-up ───

function defaultFollowUp(orcamentoId: string, empresaId: string): OrcamentoFollowUp {
  return {
    id: '',
    orcamentoId,
    empresaId,
    statusFollowUp: 'sem_retorno',
    proximaAcao: '',
    dataRetorno: null,
    responsavelId: null,
    responsavelNome: '',
    ultimaInteracaoEm: null,
    observacoes: '',
  };
}

// ─── HOOKS ───

/** Follow-up for a single orçamento (creates default if none exists) */
export function useFollowUp(orcamentoId: string) {
  const qc = useQueryClient();
  const { empresaId, user } = useAuth();

  const query = useQuery({
    queryKey: ['followup', orcamentoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamento_followups')
        .select('*')
        .eq('orcamento_id', orcamentoId)
        .maybeSingle();
      if (error) throw error;
      if (data) return dbToFollowUp(data);
      return defaultFollowUp(orcamentoId, empresaId || '');
    },
    enabled: !!orcamentoId,
  });

  const upsertFollowUp = useMutation({
    mutationFn: async (updates: Partial<OrcamentoFollowUp>) => {
      if (!empresaId) throw new Error('Empresa não vinculada');

      const payload = {
        orcamento_id: orcamentoId,
        empresa_id: empresaId,
        status_followup: updates.statusFollowUp ?? 'sem_retorno',
        proxima_acao: updates.proximaAcao ?? '',
        data_retorno: updates.dataRetorno ?? null,
        responsavel_id: updates.responsavelId ?? null,
        observacoes: updates.observacoes ?? '',
      };

      const { error } = await supabase
        .from('orcamento_followups')
        .upsert(payload, { onConflict: 'orcamento_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['followup', orcamentoId] });
      qc.invalidateQueries({ queryKey: ['fila-comercial'] });
    },
  });

  const logsQuery = useQuery({
    queryKey: ['followup-logs', orcamentoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamento_followup_logs')
        .select('*')
        .eq('orcamento_id', orcamentoId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToLog);
    },
    enabled: !!orcamentoId,
  });

  const addLog = useMutation({
    mutationFn: async (input: { tipo: TipoInteracao; descricao: string }) => {
      if (!empresaId || !user) throw new Error('Empresa/usuário não vinculado');

      const { error } = await supabase
        .from('orcamento_followup_logs')
        .insert({
          orcamento_id: orcamentoId,
          empresa_id: empresaId,
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.email || '',
          tipo: input.tipo,
          descricao: input.descricao,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['followup-logs', orcamentoId] });
      qc.invalidateQueries({ queryKey: ['followup', orcamentoId] });
      qc.invalidateQueries({ queryKey: ['fila-comercial'] });
    },
  });

  return {
    followUp: query.data ?? defaultFollowUp(orcamentoId, empresaId || ''),
    isLoading: query.isLoading,
    upsertFollowUp,
    logs: logsQuery.data ?? [],
    logsLoading: logsQuery.isLoading,
    addLog,
  };
}

/** Fila comercial: all orcamentos LEFT JOIN followups */
export interface FilaComercialItem {
  orcamentoId: string;
  numeroOrcamento: number;
  nomeCliente: string;
  valorFinal: number;
  statusOrcamento: string;
  dataCriacao: string;
  // follow-up fields (defaults when null)
  statusFollowUp: StatusFollowUp;
  proximaAcao: string;
  dataRetorno: string | null;
  responsavelNome: string;
  ultimaInteracaoEm: string | null;
}

export function useFilaComercial() {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ['fila-comercial'],
    queryFn: async () => {
      // LEFT JOIN via two queries (supabase-js doesn't support left join on non-FK)
      const { data: orcs, error: orcErr } = await supabase
        .from('orcamentos')
        .select('id, numero_orcamento, nome_cliente, valor_final, desconto, valor_venda, status, data_criacao')
        .order('created_at', { ascending: false });
      if (orcErr) throw orcErr;

      const { data: followups, error: fErr } = await supabase
        .from('orcamento_followups')
        .select('*');
      if (fErr) throw fErr;

      const fMap = new Map<string, any>();
      for (const f of (followups || [])) {
        fMap.set(f.orcamento_id, f);
      }

      const items: FilaComercialItem[] = (orcs || []).map((o: any) => {
        const f = fMap.get(o.id);
        const displayValue = (o.desconto ?? 0) > 0 ? (o.valor_final ?? o.valor_venda) : o.valor_venda;
        return {
          orcamentoId: o.id,
          numeroOrcamento: o.numero_orcamento,
          nomeCliente: o.nome_cliente,
          valorFinal: Number(displayValue),
          statusOrcamento: o.status,
          dataCriacao: o.data_criacao,
          statusFollowUp: (f?.status_followup as StatusFollowUp) ?? 'sem_retorno',
          proximaAcao: f?.proxima_acao || '',
          dataRetorno: f?.data_retorno ?? null,
          responsavelNome: f?.responsavel_nome || '',
          ultimaInteracaoEm: f?.ultima_interacao_em ?? null,
        };
      });

      return items;
    },
    enabled: !!empresaId,
  });
}
