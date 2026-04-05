import { useEffect } from "react";
import { useSystemTheme } from "@/hooks/useSystemTheme";

function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

const CSS_VARS = ["--primary", "--ring", "--sidebar-primary", "--sidebar-ring"] as const;

export function SystemThemeApplicator() {
  const { systemColor } = useSystemTheme();

  useEffect(() => {
    if (!systemColor) return;

    const hsl = hexToHSL(systemColor);
    if (!hsl) return;

    const root = document.documentElement;
    const value = `${hsl.h} ${hsl.s}% ${hsl.l}%`;

    // Store originals for cleanup
    const originals = CSS_VARS.map((v) => [v, root.style.getPropertyValue(v)] as const);

    CSS_VARS.forEach((v) => root.style.setProperty(v, value));

    // Also set primary-foreground to white or dark based on luminance
    const fgValue = hsl.l > 55 ? "0 0% 10%" : "0 0% 100%";
    const origFg = root.style.getPropertyValue("--primary-foreground");
    root.style.setProperty("--primary-foreground", fgValue);
    const origSidebarFg = root.style.getPropertyValue("--sidebar-primary-foreground");
    root.style.setProperty("--sidebar-primary-foreground", fgValue);

    return () => {
      originals.forEach(([v, orig]) => {
        if (orig) root.style.setProperty(v, orig);
        else root.style.removeProperty(v);
      });
      if (origFg) root.style.setProperty("--primary-foreground", origFg);
      else root.style.removeProperty("--primary-foreground");
      if (origSidebarFg) root.style.setProperty("--sidebar-primary-foreground", origSidebarFg);
      else root.style.removeProperty("--sidebar-primary-foreground");
    };
  }, [systemColor]);

  return null;
}
