import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { StatusVisita, Visita } from "@/lib/types";

type VisitaRow = Tables<"visitas">;
type VisitaInsert = TablesInsert<"visitas">;
type VisitaUpdate = TablesUpdate<"visitas">;

export interface VisitaInput {
  nomeCliente: string;
  telefone: string;
  enderecoCompleto: string;
  bairro?: string;
  cidade?: string;
  complemento?: string;
  pontoReferencia?: string;
  tipoServico?: string;
  observacoes?: string;
  responsavelId?: string | null;
  responsavelNome?: string;
  origemContato?: string;
  dataVisita: string;
  horaVisita: string;
  status?: StatusVisita;
  clienteId?: string | null;
  orcamentoId?: string | null;
}

const STATUS_VALUES: StatusVisita[] = ["agendada", "realizada", "cancelada", "reagendada"];

function toStatusVisita(value: string): StatusVisita {
  return STATUS_VALUES.includes(value as StatusVisita) ? (value as StatusVisita) : "agendada";
}

function dbToVisita(row: VisitaRow): Visita {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    nomeCliente: row.nome_cliente,
    telefone: row.telefone,
    enderecoCompleto: row.endereco_completo,
    bairro: row.bairro,
    cidade: row.cidade,
    complemento: row.complemento,
    pontoReferencia: row.ponto_referencia,
    tipoServico: row.tipo_servico,
    observacoes: row.observacoes,
    responsavelId: row.responsavel_id,
    responsavelNome: row.responsavel_nome,
    origemContato: row.origem_contato,
    dataVisita: row.data_visita,
    horaVisita: row.hora_visita,
    status: toStatusVisita(row.status),
    clienteId: row.cliente_id,
    orcamentoId: row.orcamento_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toVisitaInsert(input: VisitaInput, empresaId: string): VisitaInsert {
  return {
    empresa_id: empresaId,
    nome_cliente: input.nomeCliente.trim(),
    telefone: input.telefone.trim(),
    endereco_completo: input.enderecoCompleto.trim(),
    bairro: input.bairro?.trim() ?? "",
    cidade: input.cidade?.trim() ?? "",
    complemento: input.complemento?.trim() ?? "",
    ponto_referencia: input.pontoReferencia?.trim() ?? "",
    tipo_servico: input.tipoServico?.trim() ?? "",
    observacoes: input.observacoes?.trim() ?? "",
    responsavel_id: input.responsavelId ?? null,
    responsavel_nome: input.responsavelNome?.trim() ?? "",
    origem_contato: input.origemContato?.trim() ?? "",
    data_visita: input.dataVisita,
    hora_visita: input.horaVisita,
    status: input.status ?? "agendada",
    cliente_id: input.clienteId ?? null,
    orcamento_id: input.orcamentoId ?? null,
  };
}

function toVisitaUpdate(input: VisitaInput): VisitaUpdate {
  return {
    nome_cliente: input.nomeCliente.trim(),
    telefone: input.telefone.trim(),
    endereco_completo: input.enderecoCompleto.trim(),
    bairro: input.bairro?.trim() ?? "",
    cidade: input.cidade?.trim() ?? "",
    complemento: input.complemento?.trim() ?? "",
    ponto_referencia: input.pontoReferencia?.trim() ?? "",
    tipo_servico: input.tipoServico?.trim() ?? "",
    observacoes: input.observacoes?.trim() ?? "",
    responsavel_id: input.responsavelId ?? null,
    responsavel_nome: input.responsavelNome?.trim() ?? "",
    origem_contato: input.origemContato?.trim() ?? "",
    data_visita: input.dataVisita,
    hora_visita: input.horaVisita,
    status: input.status ?? "agendada",
    cliente_id: input.clienteId ?? null,
    orcamento_id: input.orcamentoId ?? null,
  };
}

export function useVisitas() {
  const { empresaId } = useAuth();

  const query = useQuery({
    queryKey: ["visitas", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitas")
        .select("*")
        .eq("empresa_id", empresaId!)
        .order("data_visita", { ascending: true })
        .order("hora_visita", { ascending: true });

      if (error) throw error;
      return (data || []).map(dbToVisita);
    },
  });

  return {
    visitas: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useAddVisita() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const key = ["visitas", empresaId];

  return useMutation({
    mutationFn: async (input: VisitaInput) => {
      if (!empresaId) throw new Error("Empresa não vinculada.");

      const { error } = await supabase.from("visitas").insert(toVisitaInsert(input, empresaId));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateVisita() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const key = ["visitas", empresaId];

  return useMutation({
    mutationFn: async (args: { id: string; input: VisitaInput }) => {
      const { error } = await supabase.from("visitas").update(toVisitaUpdate(args.input)).eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteVisita() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const key = ["visitas", empresaId];

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("visitas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
