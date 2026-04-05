import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FALLBACK_PRIMARY } from "@/lib/colorUtils";
import { toast } from "sonner";

interface PlatformSettings {
  primary_color: string;
  updated_at: string;
}

export function usePlatformColor() {
  const query = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("sa_get_platform_settings" as never);
      if (error) throw error;
      return data as unknown as PlatformSettings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const platformPrimaryColor = (query.data?.primary_color || FALLBACK_PRIMARY);

  return { platformPrimaryColor, isLoading: query.isLoading };
}

export function useUpdatePlatformColor() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (color: string) => {
      const { error } = await supabase.rpc("sa_update_platform_settings" as never, {
        _primary_color: color,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cor padrão da plataforma atualizada");
      qc.invalidateQueries({ queryKey: ["platform-settings"] });
      qc.invalidateQueries({ queryKey: ["sa-audit"] });
    },
    onError: () => toast.error("Erro ao atualizar cor da plataforma"),
  });
}
