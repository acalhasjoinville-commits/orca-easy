import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Visita, StatusVisita } from "@/lib/types";

const STATUS_VALUES: StatusVisita[] = ["agendada", "realizada", "cancelada", "reagendada"];

function toStatusVisita(v: string): StatusVisita {
  return STATUS_VALUES.includes(v as StatusVisita) ? (v as StatusVisita) : "agendada";
}

function dbToVisita(row: Record<string, unknown>): Visita {
  return {
    id: row.id as string,
    empresaId: row.empresa_id as string,
    nomeCliente: row.nome_cliente as string,
    telefone: row.telefone as string,
    enderecoCompleto: row.endereco_completo as string,
    bairro: (row.bairro as string) ?? "",
    cidade: (row.cidade as string) ?? "",
    complemento: (row.complemento as string) ?? "",
    pontoReferencia: (row.ponto_referencia as string) ?? "",
    tipoServico: (row.tipo_servico as string) ?? "",
    observacoes: (row.observacoes as string) ?? "",
    responsavelId: (row.responsavel_id as string) ?? null,
    responsavelNome: (row.responsavel_nome as string) ?? "",
    origemContato: (row.origem_contato as string) ?? "",
    dataVisita: row.data_visita as string,
    horaVisita: (row.hora_visita as string) ?? "08:00",
    status: toStatusVisita(row.status as string),
    clienteId: (row.cliente_id as string) ?? null,
    orcamentoId: (row.orcamento_id as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useVisitas() {
  const { empresaId } = useAuth();

  const query = useQuery({
    queryKey: ["visitas", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from("visitas")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("data_visita", { ascending: true })
        .order("hora_visita", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r) => dbToVisita(r as Record<string, unknown>));
    },
    enabled: !!empresaId,
  });

  return { visitas: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}

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
}

export function useAddVisita() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();

  return useMutation({
    mutationFn: async (input: VisitaInput) => {
      if (!empresaId) throw new Error("Empresa não identificada");
      const { error } = await supabase.from("visitas").insert({
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
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visitas"] }),
  });
}

export function useUpdateVisita() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: VisitaInput & { id: string }) => {
      const payload: Record<string, unknown> = {};
      if (input.nomeCliente !== undefined) payload.nome_cliente = input.nomeCliente.trim();
      if (input.telefone !== undefined) payload.telefone = input.telefone.trim();
      if (input.enderecoCompleto !== undefined) payload.endereco_completo = input.enderecoCompleto.trim();
      if (input.bairro !== undefined) payload.bairro = input.bairro.trim();
      if (input.cidade !== undefined) payload.cidade = input.cidade.trim();
      if (input.complemento !== undefined) payload.complemento = input.complemento.trim();
      if (input.pontoReferencia !== undefined) payload.ponto_referencia = input.pontoReferencia.trim();
      if (input.tipoServico !== undefined) payload.tipo_servico = input.tipoServico.trim();
      if (input.observacoes !== undefined) payload.observacoes = input.observacoes.trim();
      if (input.responsavelId !== undefined) payload.responsavel_id = input.responsavelId;
      if (input.responsavelNome !== undefined) payload.responsavel_nome = input.responsavelNome.trim();
      if (input.origemContato !== undefined) payload.origem_contato = input.origemContato.trim();
      if (input.dataVisita !== undefined) payload.data_visita = input.dataVisita;
      if (input.horaVisita !== undefined) payload.hora_visita = input.horaVisita;
      if (input.status !== undefined) payload.status = input.status;

      const { error } = await supabase
        .from("visitas")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visitas"] }),
  });
}

export function useDeleteVisita() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("visitas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visitas"] }),
  });
}
