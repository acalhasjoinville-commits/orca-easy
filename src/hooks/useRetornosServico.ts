import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RetornoServico, TipoRetorno, StatusRetorno } from "@/lib/types";

interface RetornoRow {
  id: string;
  empresa_id: string;
  orcamento_id: string;
  tipo: string;
  status: string;
  descricao: string;
  data_retorno: string | null;
  hora_retorno: string | null;
  responsavel_id: string | null;
  responsavel_nome: string;
  observacoes: string;
  resolucao: string;
  created_at: string;
  updated_at: string;
}

function rowToRetorno(row: RetornoRow): RetornoServico {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    orcamentoId: row.orcamento_id,
    tipo: row.tipo as TipoRetorno,
    status: row.status as StatusRetorno,
    descricao: row.descricao,
    dataRetorno: row.data_retorno,
    horaRetorno: row.hora_retorno,
    responsavelId: row.responsavel_id,
    responsavelNome: row.responsavel_nome,
    observacoes: row.observacoes,
    resolucao: row.resolucao,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useRetornosByOrcamento(orcamentoId: string) {
  return useQuery({
    queryKey: ["retornos_servico", orcamentoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("retornos_servico")
        .select("*")
        .eq("orcamento_id", orcamentoId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as RetornoRow[]).map(rowToRetorno);
    },
    enabled: !!orcamentoId,
  });
}

export function useAllRetornos() {
  return useQuery({
    queryKey: ["retornos_servico"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("retornos_servico")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as RetornoRow[]).map(rowToRetorno);
    },
  });
}

export interface AddRetornoInput {
  orcamentoId: string;
  tipo: TipoRetorno;
  status: StatusRetorno;
  descricao: string;
  dataRetorno?: string | null;
  horaRetorno?: string | null;
  responsavelId?: string | null;
  observacoes?: string;
  resolucao?: string;
}

export function useAddRetorno() {
  const queryClient = useQueryClient();
  const { empresaId } = useAuth();

  return useMutation({
    mutationFn: async (input: AddRetornoInput) => {
      const row = {
        empresa_id: empresaId,
        orcamento_id: input.orcamentoId,
        tipo: input.tipo,
        status: input.status,
        descricao: input.descricao,
        data_retorno: input.dataRetorno || null,
        hora_retorno: input.horaRetorno || null,
        responsavel_id: input.responsavelId || null,
        observacoes: input.observacoes || "",
        resolucao: input.resolucao || "",
      };
      const { error } = await supabase.from("retornos_servico").insert(row);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["retornos_servico", variables.orcamentoId] });
      queryClient.invalidateQueries({ queryKey: ["retornos_servico"] });
    },
  });
}

export interface UpdateRetornoInput {
  id: string;
  orcamentoId: string;
  status?: StatusRetorno;
  descricao?: string;
  dataRetorno?: string | null;
  horaRetorno?: string | null;
  responsavelId?: string | null;
  observacoes?: string;
  resolucao?: string;
  tipo?: TipoRetorno;
}

export function useUpdateRetorno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateRetornoInput) => {
      const updates: Record<string, unknown> = {};
      if (input.status !== undefined) updates.status = input.status;
      if (input.descricao !== undefined) updates.descricao = input.descricao;
      if (input.dataRetorno !== undefined) updates.data_retorno = input.dataRetorno || null;
      if (input.horaRetorno !== undefined) updates.hora_retorno = input.horaRetorno || null;
      if (input.responsavelId !== undefined) updates.responsavel_id = input.responsavelId || null;
      if (input.observacoes !== undefined) updates.observacoes = input.observacoes;
      if (input.resolucao !== undefined) updates.resolucao = input.resolucao;
      if (input.tipo !== undefined) updates.tipo = input.tipo;

      const { error } = await supabase
        .from("retornos_servico")
        .update(updates)
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["retornos_servico", variables.orcamentoId] });
      queryClient.invalidateQueries({ queryKey: ["retornos_servico"] });
    },
  });
}
