import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { LancamentoFinanceiro, TipoLancamento } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

type LancamentoRow = Tables<"lancamentos_financeiros">;
type LancamentoInsert = TablesInsert<"lancamentos_financeiros">;

function toTipoLancamento(value: string): TipoLancamento {
  return value === "despesa" ? "despesa" : "receita";
}

function dbToLancamento(row: LancamentoRow): LancamentoFinanceiro {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    tipo: toTipoLancamento(row.tipo),
    descricao: row.descricao,
    valor: Number(row.valor),
    data: row.data,
    categoria: row.categoria,
    observacao: row.observacao || "",
    origem: row.origem || "manual",
  };
}

function lancamentoToDb(l: LancamentoFinanceiro, empresaId: string): LancamentoInsert {
  return {
    id: l.id,
    empresa_id: empresaId,
    tipo: l.tipo,
    descricao: l.descricao,
    valor: Math.abs(l.valor), // always positive
    data: l.data,
    categoria: l.categoria,
    observacao: l.observacao,
    origem: l.origem || "manual",
  };
}

export function useLancamentos() {
  const { empresaId } = useAuth();
  const qc = useQueryClient();
  const key = ["lancamentos", empresaId];

  const { data: lancamentos = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lancamentos_financeiros")
        .select("*")
        .eq("empresa_id", empresaId!)
        .order("data", { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToLancamento);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (l: LancamentoFinanceiro) => {
      const row = lancamentoToDb(l, empresaId!);
      const { error } = await supabase.from("lancamentos_financeiros").upsert(row);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lancamentos_financeiros").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    lancamentos,
    isLoading,
    saveLancamento: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteLancamento: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
