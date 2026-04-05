import { lazy, Suspense, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, Tab } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Orcamento } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOrcamentos, useClientes, useEmpresa } from "@/hooks/useSupabaseData";
import { usePlatformColor } from "@/hooks/usePlatformColor";
import { resolveEffectiveColor } from "@/lib/colorUtils";
import { ThemeApplicator } from "@/components/ThemeApplicator";

import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LogOut, Loader2, UserCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = lazy(() => import("@/components/Dashboard").then((module) => ({ default: module.Dashboard })));
const Orcamentos = lazy(() => import("@/components/Orcamentos").then((module) => ({ default: module.Orcamentos })));
const OrcamentoWizard = lazy(() =>
  import("@/components/OrcamentoWizard").then((module) => ({ default: module.OrcamentoWizard })),
);
const OrcamentoDetails = lazy(() =>
  import("@/components/OrcamentoDetails").then((module) => ({ default: module.OrcamentoDetails })),
);
const Configuracoes = lazy(() =>
  import("@/components/Configuracoes").then((module) => ({ default: module.Configuracoes })),
);
const Clientes = lazy(() => import("@/components/Clientes").then((module) => ({ default: module.Clientes })));
const Financeiro = lazy(() => import("@/components/Financeiro").then((module) => ({ default: module.Financeiro })));
const Usuarios = lazy(() => import("@/components/Usuarios").then((module) => ({ default: module.Usuarios })));
const EditarPerfil = lazy(() =>
  import("@/components/EditarPerfil").then((module) => ({ default: module.EditarPerfil })),
);
const LoginPage = lazy(() => import("@/components/LoginPage").then((module) => ({ default: module.LoginPage })));
const PendingApproval = lazy(() =>
  import("@/components/PendingApproval").then((module) => ({ default: module.PendingApproval })),
);
const AccessDenied = lazy(() =>
  import("@/components/AccessDenied").then((module) => ({ default: module.AccessDenied })),
);
const EmpresaSuspensa = lazy(() =>
  import("@/components/EmpresaSuspensa").then((module) => ({ default: module.EmpresaSuspensa })),
);

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
    </div>
  );
}

const Index = () => {
  const {
    user,
    loading,
    rolesLoaded,
    hasAnyRole,
    isSuperAdmin,
    empresaStatus,
    signOut,
    canManageSettings,
    canViewFinanceiro,
    canCreateEditBudget,
    canManageClientes,
    canManageUsers,
  } = useAuth();

  const [tab, setTab] = useState<Tab>("dashboard");
  const [wizardKey, setWizardKey] = useState(0);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const { orcamentos: _orc, getNextNumero, addOrcamento, updateOrcamento } = useOrcamentos();
  const { clientes } = useClientes();
  const { empresa } = useEmpresa();
  const { platformPrimaryColor } = usePlatformColor();
  const effectiveColor = resolveEffectiveColor(empresa?.corPrimaria, platformPrimaryColor);

  // Auth loading state
  if (loading) {
    return <FullScreenLoader />;
  }

  // Not authenticated → login page
  if (!user) {
    return (
      <Suspense fallback={<FullScreenLoader />}>
        <LoginPage />
      </Suspense>
    );
  }

  // Still loading roles → show spinner (avoid flashing PendingApproval)
  if (!rolesLoaded) {
    return <FullScreenLoader />;
  }

  // Super admin without company role → redirect to super admin area
  if (isSuperAdmin && !hasAnyRole) {
    return <Navigate to="/super-admin" replace />;
  }

  // Empresa suspensa ou bloqueada → tela de bloqueio (exceto super admin)
  if (!isSuperAdmin && empresaStatus && empresaStatus !== "ativa") {
    return (
      <Suspense fallback={<FullScreenLoader />}>
        <EmpresaSuspensa />
      </Suspense>
    );
  }

  // Authenticated but no role → pending approval
  if (!hasAnyRole) {
    return (
      <Suspense fallback={<FullScreenLoader />}>
        <PendingApproval />
      </Suspense>
    );
  }

  // Guard navigation: redirect to dashboard if user navigates to restricted tab
  const guardedNavigate = (newTab: Tab) => {
    if (newTab === "config" && !canManageSettings) {
      toast.error("Sem permissão para acessar Configurações.");
      return;
    }
    if (newTab === "financeiro" && !canViewFinanceiro) {
      toast.error("Sem permissão para acessar Financeiro.");
      return;
    }
    if (newTab === "clientes" && !canManageClientes) {
      toast.error("Sem permissão para acessar Clientes.");
      return;
    }
    if (newTab === "orcamento-novo" && !canCreateEditBudget) {
      toast.error("Sem permissão para criar/editar orçamentos.");
      return;
    }
    if (newTab === "usuarios" && !canManageUsers) {
      toast.error("Sem permissão para gerenciar usuários.");
      return;
    }
    setTab(newTab);
  };

  const goToList = () => setTab("orcamentos");

  const goToNew = () => {
    if (!canCreateEditBudget) {
      toast.error("Sem permissão para criar orçamentos.");
      return;
    }
    setEditingOrcamento(null);
    setWizardKey((k) => k + 1);
    setTab("orcamento-novo");
  };

  const goToDetails = (orc: Orcamento) => {
    setSelectedOrcamento(orc);
    setTab("orcamento-detalhes");
  };

  const goToEdit = (orc: Orcamento) => {
    if (!canCreateEditBudget) {
      toast.error("Sem permissão para editar orçamentos.");
      return;
    }
    setEditingOrcamento(orc);
    setWizardKey((k) => k + 1);
    setTab("orcamento-novo");
  };

  const handleDuplicate = async (orc: Orcamento) => {
    if (!canCreateEditBudget) {
      toast.error("Sem permissão para duplicar orçamentos.");
      return;
    }
    try {
      const novoNumero = await getNextNumero();
      const novoOrcamento: Orcamento = {
        ...orc,
        id: crypto.randomUUID(),
        numeroOrcamento: novoNumero,
        dataCriacao: new Date().toISOString(),
        status: "pendente",
        dataExecucao: null,
      };
      await addOrcamento.mutateAsync(novoOrcamento);
      toast.success(`Orçamento #${novoNumero} duplicado com sucesso!`);
      goToDetails(novoOrcamento);
    } catch {
      toast.error("Erro ao duplicar orçamento.");
    }
  };

  const handleMarkExecuted = async (orc: Orcamento) => {
    try {
      const updated: Orcamento = {
        ...orc,
        status: "executado",
        dataExecucao: new Date().toISOString(),
      };
      await updateOrcamento.mutateAsync(updated);
      setSelectedOrcamento(updated);
      toast.success("Orçamento marcado como executado!");
    } catch {
      toast.error("Erro ao marcar como executado.");
    }
  };

  const handleMarkFaturado = async (orc: Orcamento) => {
    if (orc.dataFaturamento) {
      toast.error("Orçamento já foi faturado.");
      return;
    }
    try {
      const updated: Orcamento = {
        ...orc,
        dataFaturamento: new Date().toISOString(),
      };
      await updateOrcamento.mutateAsync(updated);
      setSelectedOrcamento(updated);
      toast.success("Orçamento marcado como faturado!");
    } catch {
      toast.error("Erro ao marcar como faturado.");
    }
  };

  const handleMarkPago = async (orc: Orcamento) => {
    if (orc.dataPagamento) {
      toast.error("Orçamento já foi marcado como pago.");
      return;
    }
    try {
      const updated: Orcamento = {
        ...orc,
        dataPagamento: new Date().toISOString(),
      };
      await updateOrcamento.mutateAsync(updated);
      setSelectedOrcamento(updated);
      toast.success("Orçamento marcado como pago!");
    } catch {
      toast.error("Erro ao marcar como pago.");
    }
  };

  const handleUpdateDataPrevista = async (orc: Orcamento, date: string | null) => {
    try {
      const updated: Orcamento = {
        ...orc,
        dataPrevista: date,
      };
      await updateOrcamento.mutateAsync(updated);
      setSelectedOrcamento(updated);
      toast.success(date ? "Data prevista atualizada!" : "Data prevista removida.");
    } catch {
      toast.error("Erro ao atualizar data prevista.");
    }
  };

  const handleCancelOrcamento = async (orc: Orcamento) => {
    try {
      const updated: Orcamento = {
        ...orc,
        status: "cancelado",
        dataCancelamento: new Date().toISOString(),
      };
      await updateOrcamento.mutateAsync(updated);
      setSelectedOrcamento(updated);
      toast.success("Orçamento cancelado.");
    } catch {
      toast.error("Erro ao cancelar orçamento.");
    }
  };

  const getHeaderMeta = () => {
    switch (tab) {
      case "dashboard":
        return { title: "Dashboard", helper: "Resumo rápido da operação e dos números principais." };
      case "orcamentos":
        return { title: "Orçamentos", helper: "Acompanhe status, datas operacionais e próximos passos." };
      case "orcamento-detalhes":
        return { title: "Detalhes do orçamento", helper: "Revise itens, dados do cliente e situação comercial." };
      case "orcamento-novo":
        return {
          title: editingOrcamento ? "Editar orçamento" : "Novo orçamento",
          helper: "Fluxo guiado para montar a proposta com mais clareza.",
        };
      case "clientes":
        return { title: "Clientes", helper: "Base cadastral, contatos e histórico operacional." };
      case "financeiro":
        return { title: "Financeiro", helper: "Movimentações, leitura dos números e rotina financeira." };
      case "usuarios":
        return { title: "Usuários", helper: "Convites, aprovações e papéis da equipe." };
      case "config":
        return { title: "Configurações", helper: "Materiais, regras, catálogo e dados-base do sistema." };
      default:
        return { title: "", helper: "" };
    }
  };

  const headerMeta = getHeaderMeta();

  const content = (
    <Suspense fallback={<SectionLoader />}>
      {tab === "dashboard" && (
        <Dashboard onNewOrcamento={goToNew} onViewOrcamento={goToDetails} onNavigate={guardedNavigate} />
      )}
      {tab === "orcamentos" && (
        <Orcamentos onNewOrcamento={goToNew} onViewOrcamento={goToDetails} onEditOrcamento={goToEdit} />
      )}
      {tab === "orcamento-detalhes" && selectedOrcamento && (
        <OrcamentoDetails
          orcamento={selectedOrcamento}
          cliente={clientes.find((c) => c.id === selectedOrcamento.clienteId)}
          empresa={empresa}
          onBack={goToList}
          onEdit={goToEdit}
          onDuplicate={handleDuplicate}
          onMarkExecuted={handleMarkExecuted}
          onMarkFaturado={handleMarkFaturado}
          onMarkPago={handleMarkPago}
          onUpdateDataPrevista={handleUpdateDataPrevista}
          onCancelOrcamento={handleCancelOrcamento}
        />
      )}
      {tab === "orcamento-novo" &&
        (canCreateEditBudget ? (
          <OrcamentoWizard
            key={wizardKey}
            onDone={() => {
              setEditingOrcamento(null);
              setTab("orcamentos");
            }}
            editingOrcamento={editingOrcamento}
          />
        ) : (
          <AccessDenied message="Você não tem permissão para criar ou editar orçamentos." />
        ))}
      {tab === "clientes" &&
        (canManageClientes ? <Clientes /> : <AccessDenied message="Você não tem permissão para acessar Clientes." />)}
      {tab === "financeiro" &&
        (canViewFinanceiro ? (
          <Financeiro />
        ) : (
          <AccessDenied message="Você não tem permissão para acessar o Financeiro." />
        ))}
      {tab === "usuarios" &&
        (canManageUsers ? <Usuarios /> : <AccessDenied message="Você não tem permissão para gerenciar usuários." />)}
      {tab === "config" &&
        (canManageSettings ? (
          <Configuracoes />
        ) : (
          <AccessDenied message="Você não tem permissão para acessar Configurações." />
        ))}
    </Suspense>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <ThemeApplicator color={effectiveColor} />
        <header className="h-14 flex items-center border-b bg-card px-4 sticky top-0 z-50 shadow-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
            OC
          </div>
          <span className="ml-3 text-sm font-semibold text-foreground flex-1">{headerMeta.title}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProfileOpen(true)}
            className="text-muted-foreground hover:text-foreground h-9 w-9 p-0"
          >
            <UserCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground h-9 w-9 p-0"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </header>
        <main className="pb-20">{content}</main>
        <MobileBottomNav active={tab} onNavigate={guardedNavigate} onNewOrcamento={goToNew} />
        <Suspense fallback={null}>
          <EditarPerfil open={profileOpen} onOpenChange={setProfileOpen} />
        </Suspense>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar active={tab} onNavigate={guardedNavigate} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b bg-card/85 px-5 backdrop-blur-sm">
            <SidebarTrigger className="mr-4 text-muted-foreground hover:text-foreground" />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-semibold text-foreground">{headerMeta.title}</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">{headerMeta.helper}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-3 hidden sm:inline">{user?.email}</span>
              {isSuperAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/super-admin")}
                  className="text-muted-foreground hover:text-foreground h-9 w-9 p-0 rounded-lg"
                  title="Super Admin"
                >
                  <Shield className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProfileOpen(true)}
                className="text-muted-foreground hover:text-foreground h-9 w-9 p-0 rounded-lg"
              >
                <UserCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground h-9 w-9 p-0 rounded-lg"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">{content}</main>
        </div>
      </div>
      <Suspense fallback={null}>
        <EditarPerfil open={profileOpen} onOpenChange={setProfileOpen} />
      </Suspense>
    </SidebarProvider>
  );
};

export default Index;
