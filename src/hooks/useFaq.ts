import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

type FaqRow = Tables<"faq_items">;
type FaqInsert = TablesInsert<"faq_items">;
type FaqUpdate = TablesUpdate<"faq_items">;

export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  ordem: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaqInput {
  pergunta: string;
  resposta: string;
  categoria: string;
  ordem: number;
  ativo: boolean;
}

function dbToFaq(row: FaqRow): FaqItem {
  return {
    id: row.id,
    pergunta: row.pergunta,
    resposta: row.resposta,
    categoria: row.categoria,
    ordem: row.ordem,
    ativo: row.ativo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function faqToInsert(input: FaqInput): FaqInsert {
  return {
    pergunta: input.pergunta.trim(),
    resposta: input.resposta.trim(),
    categoria: input.categoria.trim() || "Geral",
    ordem: input.ordem,
    ativo: input.ativo,
  };
}

function faqToUpdate(input: FaqInput): FaqUpdate {
  return faqToInsert(input);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useFaqPublic() {
  return useQuery({
    queryKey: ["faq", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true })
        .order("categoria", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []).map(dbToFaq);
    },
  });
}

export function useFaqAdmin() {
  return useQuery({
    queryKey: ["faq", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .order("ordem", { ascending: true })
        .order("categoria", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []).map(dbToFaq);
    },
  });
}

export function useFaqMutations() {
  const qc = useQueryClient();

  const invalidateFaq = () => {
    qc.invalidateQueries({ queryKey: ["faq", "public"] });
    qc.invalidateQueries({ queryKey: ["faq", "admin"] });
  };

  const createFaq = useMutation({
    mutationFn: async (input: FaqInput) => {
      const { error } = await supabase.from("faq_items").insert(faqToInsert(input));
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("FAQ criada com sucesso.");
      invalidateFaq();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Erro ao criar FAQ.")),
  });

  const updateFaq = useMutation({
    mutationFn: async (args: { id: string; input: FaqInput }) => {
      const { error } = await supabase.from("faq_items").update(faqToUpdate(args.input)).eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("FAQ atualizada.");
      invalidateFaq();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Erro ao atualizar FAQ.")),
  });

  const deleteFaq = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("FAQ removida.");
      invalidateFaq();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Erro ao remover FAQ.")),
  });

  return {
    createFaq,
    updateFaq,
    deleteFaq,
  };
}
