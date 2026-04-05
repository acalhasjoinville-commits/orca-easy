import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSystemTheme } from "@/hooks/useSystemTheme";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Palette, Info } from "lucide-react";
import { toast } from "sonner";

function hexToHSL(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

const PRESETS = ["#4F46E5", "#2563EB", "#0891B2", "#059669", "#D97706", "#DC2626", "#7C3AED", "#DB2777"];

export function SuperAdminAparencia() {
  const { systemColor, isLoading } = useSystemTheme();
  const [color, setColor] = useState("#4F46E5");
  const [initialized, setInitialized] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    if (!initialized && !isLoading && systemColor) {
      setColor(systemColor);
      setInitialized(true);
    } else if (!initialized && !isLoading) {
      setInitialized(true);
    }
  }, [isLoading, systemColor, initialized]);

  const saveMutation = useMutation({
    mutationFn: async (newColor: string) => {
      const { error } = await supabase.rpc("sa_update_platform_settings" as never, { _primary_color: newColor } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cor do sistema atualizada!");
      qc.invalidateQueries({ queryKey: ["platform-settings"] });
    },
    onError: () => toast.error("Erro ao salvar cor do sistema."),
  });

  const handleSave = () => saveMutation.mutate(color);
  const isValid = /^#[0-9a-fA-F]{6}$/.test(color);
  const hsl = isValid ? hexToHSL(color) : null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Esta cor altera a interface do sistema (botões, links, sidebar).
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Não altera as cores dos PDFs da empresa. As cores de branding/PDF são configuradas em cada empresa separadamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Palette className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Cor principal do sistema</h3>
              <p className="text-[11px] text-muted-foreground">Aplicada em toda a interface web</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 rounded-md border cursor-pointer"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#4F46E5"
              className="h-10 font-mono text-sm w-32"
            />
            {hsl && (
              <span className="text-xs text-muted-foreground">
                HSL({hsl.h}, {hsl.s}%, {hsl.l}%)
              </span>
            )}
          </div>

          <div className="mb-5">
            <p className="text-[11px] font-medium text-muted-foreground mb-2">Cores sugeridas</p>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setColor(p)}
                  className="h-8 w-8 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: p,
                    borderColor: color === p ? "currentColor" : "transparent",
                  }}
                  title={p}
                />
              ))}
            </div>
          </div>

          {isValid && (
            <div className="rounded-xl border bg-muted/30 p-4 mb-5">
              <p className="text-[11px] font-medium text-muted-foreground mb-3">Preview</p>
              <div className="flex items-center gap-3">
                <div className="h-10 px-4 rounded-lg text-sm font-medium flex items-center text-white" style={{ backgroundColor: color }}>
                  Botão primário
                </div>
                <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: color }} />
                <div className="h-2 w-24 rounded-full" style={{ backgroundColor: color }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saveMutation.isPending || !isValid || color === systemColor}
        className="w-full h-10"
      >
        {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Salvar cor do sistema
      </Button>
    </div>
  );
}
