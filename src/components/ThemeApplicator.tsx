import { useEffect } from "react";
import { hexToHSL } from "@/lib/colorUtils";

/**
 * Applies the effective primary color to CSS custom properties.
 * Must be rendered ONLY inside the company-authenticated area (not in super admin).
 * Cleanup on unmount resets variables so they don't bleed into other areas.
 */
export function ThemeApplicator({ color }: { color: string }) {
  useEffect(() => {
    const root = document.documentElement;
    const hsl = hexToHSL(color);

    // Store originals for cleanup
    const originalPrimary = root.style.getPropertyValue("--primary");
    const originalRing = root.style.getPropertyValue("--ring");
    const originalSidebarPrimary = root.style.getPropertyValue("--sidebar-primary");
    const originalSidebarRing = root.style.getPropertyValue("--sidebar-ring");

    root.style.setProperty("--primary", hsl);
    root.style.setProperty("--ring", hsl);
    root.style.setProperty("--sidebar-primary", hsl);
    root.style.setProperty("--sidebar-ring", hsl);

    return () => {
      // Reset to original values (empty string removes the inline override,
      // letting the CSS stylesheet value take effect again)
      root.style.setProperty("--primary", originalPrimary);
      root.style.setProperty("--ring", originalRing);
      root.style.setProperty("--sidebar-primary", originalSidebarPrimary);
      root.style.setProperty("--sidebar-ring", originalSidebarRing);
    };
  }, [color]);

  return null;
}
