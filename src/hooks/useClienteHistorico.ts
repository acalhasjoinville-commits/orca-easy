/**
 * useClienteHistorico — composes existing hooks to build the 360° view.
 * Fully read-only. No mutations, no schema changes.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { useClientes, useOrcamentos } from "@/hooks/useSupabaseData";
import { useVisitas } from "@/hooks/useVisitas";
import { useAllRetornos } from "@/hooks/useRetornosServico";
import { supabase } from "@/integrations/supabase/client";
import type { OrcamentoFollowUp, StatusFollowUp } from "@/lib/types";
import type { Tables } from "@/integrations/supabase/types";

import { buildClienteHistorico } from "@/lib/cliente-360/aggregations";
import type { ClienteHistoricoData } from "@/lib/cliente-360/types";

type FollowUpRow = Tables<"orcamento_followups">;

function dbToFollowUp(row: FollowUpRow): OrcamentoFollowUp {
  return {
    id: row.id,
    orcamentoId: row.orcamento_id,
    empresaId: row.empresa_id,
    statusFollowUp: row.status_followup as StatusFollowUp,
    proximaAcao: row.proxima_acao || "",
    dataRetorno: row.data_retorno ?? null,
    responsavelId: row.responsavel_id ?? null,
    responsavelNome: row.responsavel_nome || "",
    ultimaInteracaoEm: row.ultima_interacao_em ?? null,
    observacoes: row.observacoes || "",
  };
}

function useAllFollowUps() {
  const { empresaId } = useAuth();
  return useQuery({
    queryKey: ["followups-all", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_followups")
        .select("*")
        .eq("empresa_id", empresaId!);
      if (error) throw error;
      return (data || []).map(dbToFollowUp);
    },
  });
}

export interface UseClienteHistoricoArgs {
  clienteId?: string | null;
  nomeCliente?: string | null;
}

export interface UseClienteHistoricoResult {
  data: ClienteHistoricoData | null;
  isLoading: boolean;
  /** Cliente cadastrado encontrado (null para avulso ou inexistente) */
  cliente: ReturnType<typeof useClientes>["clientes"][number] | null;
  /** True quando estamos consultando um cliente avulso (sem cadastro) */
  isAvulso: boolean;
}

export function useClienteHistorico(args: UseClienteHistoricoArgs): UseClienteHistoricoResult {
  const { clientes, isLoading: clientesLoading } = useClientes();
  const { orcamentos, isLoading: orcsLoading } = useOrcamentos();
  const { visitas, isLoading: visitasLoading } = useVisitas();
  const retornosQ = useAllRetornos();
  const followUpsQ = useAllFollowUps();

  const cliente = useMemo(() => {
    if (!args.clienteId) return null;
    return clientes.find((c) => c.id === args.clienteId) ?? null;
  }, [clientes, args.clienteId]);

  const isLoading =
    clientesLoading ||
    orcsLoading ||
    visitasLoading ||
    retornosQ.isLoading ||
    followUpsQ.isLoading;

  const isAvulso = !args.clienteId && !!args.nomeCliente;

  const data = useMemo<ClienteHistoricoData | null>(() => {
    if (isLoading) return null;
    // Resolve display name
    const nomeCliente = args.nomeCliente ?? cliente?.nomeRazaoSocial ?? null;
    if (!args.clienteId && !nomeCliente) return null;

    return buildClienteHistorico({
      orcamentos,
      visitas,
      retornos: retornosQ.data ?? [],
      followUps: followUpsQ.data ?? [],
      clienteId: args.clienteId ?? null,
      nomeCliente,
    });
  }, [isLoading, args.clienteId, args.nomeCliente, cliente, orcamentos, visitas, retornosQ.data, followUpsQ.data]);

  return { data, isLoading, cliente, isAvulso };
}
