import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";
import { usePlatformColor, useUpdatePlatformColor } from "@/hooks/usePlatformColor";

export function SuperAdminConfiguracoes() {
  const { platformPrimaryColor, isLoading } = usePlatformColor();
  const updateColor = useUpdatePlatformColor();
  const [color, setColor] = useState(platformPrimaryColor);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && !isLoading) {
      setColor(platformPrimaryColor);
      setInitialized(true);
    }
  }, [isLoading, platformPrimaryColor, initialized]);

  const handleSave = () => {
    if (color && /^#[0-9a-fA-F]{6}$/.test(color)) {
      updateColor.mutate(color);
    }
  };

  const isValid = /^#[0-9a-fA-F]{6}$/.test(color);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Cor principal da plataforma</h3>
          <p className="text-xs text-muted-foreground mb-5">
            Esta é a cor principal padrão da plataforma. Empresas que não definirem uma cor própria usarão esta cor
            automaticamente.
          </p>

          <div className="flex items-center gap-3 mb-4">
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
              className="h-10 font-mono text-sm w-36"
            />
            <div
              className="h-10 flex-1 rounded-md border"
              style={{ backgroundColor: isValid ? color : "#ccc" }}
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-2">
              {["#4F46E5", "#2563EB", "#0B1B32", "#7C3AED", "#059669", "#DC2626"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setColor(preset)}
                  className="h-7 w-7 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: preset,
                    borderColor: color === preset ? "hsl(var(--foreground))" : "transparent",
                  }}
                  title={preset}
                />
              ))}
            </div>
          </div>

          {!isValid && color.length > 0 && (
            <p className="text-xs text-destructive mb-3">Formato inválido. Use hex com 6 caracteres, ex: #4F46E5</p>
          )}

          <Button onClick={handleSave} disabled={!isValid || updateColor.isPending} size="sm">
            {updateColor.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            Salvar cor padrão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
