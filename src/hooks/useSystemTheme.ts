import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformSettings {
  primary_color: string;
}

export function useSystemTheme() {
  const { data, isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("sa_get_platform_settings" as never);
      if (error) throw error;
      return data as PlatformSettings;
    },
    staleTime: 60_000,
  });

  return {
    systemColor: data?.primary_color ?? null,
    isLoading,
  };
}
