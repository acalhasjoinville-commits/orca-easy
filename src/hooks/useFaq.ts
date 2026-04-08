import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

/** Public hook — explicitly filters ativo = true so platform admins don't see inactive items in the app */
export function useFaqPublic() {
  return useQuery({
    queryKey: ["faq", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .eq("ativo", true)
        .order("ordem")
        .order("categoria");
      if (error) throw error;
      return (data ?? []) as FaqItem[];
    },
  });
}

/** Admin hook — returns all items (active + inactive) */
export function useFaqAdmin() {
  return useQuery({
    queryKey: ["faq", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .order("ordem")
        .order("categoria");
      if (error) throw error;
      return (data ?? []) as FaqItem[];
    },
  });
}

export function useFaqMutations() {
  const qc = useQueryClient();

  const invalidateBoth = () => {
    qc.invalidateQueries({ queryKey: ["faq", "public"] });
    qc.invalidateQueries({ queryKey: ["faq", "admin"] });
  };

  const createFaq = useMutation({
    mutationFn: async (item: Omit<FaqItem, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("faq_items").insert(item);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateBoth();
      toast.success("FAQ criada com sucesso!");
    },
    onError: () => toast.error("Erro ao criar FAQ."),
  });

  const updateFaq = useMutation({
    mutationFn: async ({ id, ...fields }: Partial<FaqItem> & { id: string }) => {
      const { error } = await supabase.from("faq_items").update(fields).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateBoth();
      toast.success("FAQ atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar FAQ."),
  });

  const deleteFaq = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateBoth();
      toast.success("FAQ excluída.");
    },
    onError: () => toast.error("Erro ao excluir FAQ."),
  });

  return { createFaq, updateFaq, deleteFaq };
}
