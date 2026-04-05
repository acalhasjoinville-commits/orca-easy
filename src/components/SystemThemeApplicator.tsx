import { useEffect } from "react";
import { hexToHSL } from "@/lib/colorUtils";
import { useSystemTheme } from "@/hooks/useSystemTheme";

const CSS_VARS = ["--primary", "--ring", "--sidebar-primary", "--sidebar-ring"] as const;

export function SystemThemeApplicator() {
  const { systemColor } = useSystemTheme();

  useEffect(() => {
    if (!systemColor) return;

    const root = document.documentElement;
    const hsl = hexToHSL(systemColor);
    const originals = CSS_VARS.map((cssVar) => [cssVar, root.style.getPropertyValue(cssVar)] as const);

    CSS_VARS.forEach((cssVar) => root.style.setProperty(cssVar, hsl));

    return () => {
      originals.forEach(([cssVar, original]) => {
        if (original) root.style.setProperty(cssVar, original);
        else root.style.removeProperty(cssVar);
      });
    };
  }, [systemColor]);

  return null;
}
