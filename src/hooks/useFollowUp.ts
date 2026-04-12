import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { OrcamentoFollowUp, FollowUpLog, StatusFollowUp, TipoInteracao } from "@/lib/types";
import type { Tables } from "@/integrations/supabase/types";

type FollowUpRow = Tables<"orcamento_followups">;
type LogRow = Tables<"orcamento_followup_logs">;

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

function dbToLog(row: LogRow): FollowUpLog {
  return {
    id: row.id,
    orcamentoId: row.orcamento_id,
    empresaId: row.empresa_id,
    userId: row.user_id,
    userName: row.user_name || "",
    tipo: row.tipo as TipoInteracao,
    descricao: row.descricao || "",
    createdAt: row.created_at,
  };
}

function defaultFollowUp(orcamentoId: string, empresaId: string): OrcamentoFollowUp {
  return {
    id: "",
    orcamentoId,
    empresaId,
    statusFollowUp: "sem_retorno",
    proximaAcao: "",
    dataRetorno: null,
    responsavelId: null,
    responsavelNome: "",
    ultimaInteracaoEm: null,
    observacoes: "",
  };
}

export function useFollowUp(orcamentoId: string) {
  const qc = useQueryClient();
  const { empresaId, user } = useAuth();

  const query = useQuery({
    queryKey: ["followup", orcamentoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_followups")
        .select("*")
        .eq("orcamento_id", orcamentoId)
        .maybeSingle();
      if (error) throw error;
      if (data) return dbToFollowUp(data);
      return defaultFollowUp(orcamentoId, empresaId || "");
    },
    enabled: !!orcamentoId,
  });

  const upsertFollowUp = useMutation({
    mutationFn: async (updates: Partial<OrcamentoFollowUp>) => {
      if (!empresaId) throw new Error("Empresa nao vinculada");

      const current = query.data ?? defaultFollowUp(orcamentoId, empresaId);
      const payload = {
        orcamento_id: orcamentoId,
        empresa_id: empresaId,
        status_followup: updates.statusFollowUp ?? current.statusFollowUp ?? "sem_retorno",
        proxima_acao: updates.proximaAcao ?? current.proximaAcao ?? "",
        data_retorno: updates.dataRetorno ?? current.dataRetorno ?? null,
        responsavel_id: updates.responsavelId ?? current.responsavelId ?? null,
        observacoes: updates.observacoes ?? current.observacoes ?? "",
      };

      const { error } = await supabase.from("orcamento_followups").upsert(payload, { onConflict: "orcamento_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["followup", orcamentoId] });
      qc.invalidateQueries({ queryKey: ["fila-comercial"] });
    },
  });

  const logsQuery = useQuery({
    queryKey: ["followup-logs", orcamentoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_followup_logs")
        .select("*")
        .eq("orcamento_id", orcamentoId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToLog);
    },
    enabled: !!orcamentoId,
  });

  const addLog = useMutation({
    mutationFn: async (input: { tipo: TipoInteracao; descricao: string }) => {
      if (!empresaId || !user) throw new Error("Empresa/usuario nao vinculado");

      const { error } = await supabase.from("orcamento_followup_logs").insert({
        orcamento_id: orcamentoId,
        empresa_id: empresaId,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email || "",
        tipo: input.tipo,
        descricao: input.descricao,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["followup-logs", orcamentoId] });
      qc.invalidateQueries({ queryKey: ["followup", orcamentoId] });
      qc.invalidateQueries({ queryKey: ["fila-comercial"] });
    },
  });

  return {
    followUp: query.data ?? defaultFollowUp(orcamentoId, empresaId || ""),
    isLoading: query.isLoading,
    upsertFollowUp,
    logs: logsQuery.data ?? [],
    logsLoading: logsQuery.isLoading,
    addLog,
  };
}

export function useTeamMembers() {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["team-members", empresaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("empresa_id", empresaId!);
      if (error) throw error;
      return (data || []).map((p) => ({
        id: p.id,
        name: p.full_name || p.email || "Sem nome",
      }));
    },
    enabled: !!empresaId,
  });
}

export interface FilaComercialItem {
  orcamentoId: string;
  numeroOrcamento: number;
  nomeCliente: string;
  valorFinal: number;
  statusOrcamento: string;
  dataCriacao: string;
  statusFollowUp: StatusFollowUp;
  proximaAcao: string;
  dataRetorno: string | null;
  responsavelNome: string;
  ultimaInteracaoEm: string | null;
}

type OrcamentoRow = Pick<
  Tables<"orcamentos">,
  "id" | "numero_orcamento" | "nome_cliente" | "valor_final" | "desconto" | "valor_venda" | "status" | "data_criacao"
>;

export function useFilaComercial() {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["fila-comercial"],
    queryFn: async () => {
      const { data: orcs, error: orcErr } = await supabase
        .from("orcamentos")
        .select("id, numero_orcamento, nome_cliente, valor_final, desconto, valor_venda, status, data_criacao")
        .eq("status", "pendente")
        .order("created_at", { ascending: false });
      if (orcErr) throw orcErr;

      const { data: followups, error: fErr } = await supabase.from("orcamento_followups").select("*");
      if (fErr) throw fErr;

      const fMap = new Map<string, FollowUpRow>();
      for (const f of followups || []) {
        fMap.set(f.orcamento_id, f);
      }

      const items: FilaComercialItem[] = ((orcs || []) as OrcamentoRow[]).map((o) => {
        const f = fMap.get(o.id);
        const displayValue = (o.desconto ?? 0) > 0 ? (o.valor_final ?? o.valor_venda) : o.valor_venda;
        return {
          orcamentoId: o.id,
          numeroOrcamento: o.numero_orcamento,
          nomeCliente: o.nome_cliente,
          valorFinal: Number(displayValue),
          statusOrcamento: o.status,
          dataCriacao: o.data_criacao,
          statusFollowUp: (f?.status_followup as StatusFollowUp) ?? "sem_retorno",
          proximaAcao: f?.proxima_acao || "",
          dataRetorno: f?.data_retorno ?? null,
          responsavelNome: f?.responsavel_nome || "",
          ultimaInteracaoEm: f?.ultima_interacao_em ?? null,
        };
      });

      return items;
    },
    enabled: !!empresaId,
  });
}
