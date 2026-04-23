import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SystemThemeApplicator } from "@/components/SystemThemeApplicator";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";

const SuperAdminPage = lazy(() => import("./pages/SuperAdmin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

function SuperAdminGuard() {
  const { user, loading, rolesLoaded, isSuperAdmin } = useAuth();

  if (loading || !rolesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user || !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SuperAdminPage />
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <SystemThemeApplicator />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/agenda" element={<Index />} />
            <Route path="/orcamentos" element={<Index />} />
            <Route path="/orcamentos/novo" element={<Index />} />
            <Route path="/orcamentos/:orcamentoId" element={<Index />} />
            <Route path="/orcamentos/:orcamentoId/editar" element={<Index />} />
            <Route path="/clientes" element={<Index />} />
            <Route path="/financeiro" element={<Index />} />
            <Route path="/relatorios" element={<Index />} />
            <Route path="/usuarios" element={<Index />} />
            <Route path="/ajuda" element={<Index />} />
            <Route path="/configuracoes" element={<Index />} />
            <Route path="/config" element={<Navigate to="/configuracoes" replace />} />
            <Route path="/super-admin" element={<SuperAdminGuard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
