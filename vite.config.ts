import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function getPackageName(id: string) {
  const normalized = id.split("node_modules/")[1];
  if (!normalized) return null;

  const parts = normalized.split("/");
  if (parts[0].startsWith("@")) {
    return `${parts[0]}/${parts[1]}`;
  }

  return parts[0];
}

function sanitizeChunkName(packageName: string) {
  return packageName.replace("@", "").replace(/[\\/]/g, "-");
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          const packageName = getPackageName(id);
          if (!packageName) return;

          // @react-pdf is loaded via dynamic import() — let Vite handle its chunking naturally
          if (packageName.startsWith("@supabase/")) return "supabase-vendor";
          if (packageName.startsWith("@tanstack/")) return "query-vendor";
          if (packageName === "react-router-dom" || packageName === "@remix-run/router") {
            return "router-vendor";
          }
          if (packageName.startsWith("@radix-ui/")) return "radix-vendor";
          if (packageName === "date-fns" || packageName === "react-day-picker") return "date-vendor";
          if (packageName === "react" || packageName === "react-dom" || packageName === "scheduler") {
            return "react-vendor";
          }
          if (packageName === "react-hook-form" || packageName === "@hookform/resolvers" || packageName === "zod") {
            return "form-vendor";
          }

          return undefined;
        },
      },
    },
  },
}));
