import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FALLBACK_PRIMARY } from "@/lib/colorUtils";

interface PlatformSettings {
  primary_color: string;
}

export function useSystemTheme() {
  const { data, isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("sa_get_platform_settings" as never);
      if (error) throw error;
      return data as PlatformSettings | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    systemColor: data?.primary_color || FALLBACK_PRIMARY,
    isLoading,
  };
}
