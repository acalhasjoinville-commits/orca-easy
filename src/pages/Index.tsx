import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Loader2, PanelLeftClose, PanelLeftOpen, Shield, UserCircle } from "lucide-react";
import { toast } from "sonner";

import { AppSidebar, Tab } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useClientes, useEmpresa, useOrcamentos } from "@/hooks/useSupabaseData";
import {
  getOrcamentoDetailsPath,
  getOrcamentoEditPath,
  getOrcamentoNewPath,
  getPathForTab,
  resolveAppShellRoute,
} from "@/lib/appShellRoutes";
import { Orcamento } from "@/lib/types";

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
const Agenda = lazy(() => import("@/components/Agenda").then((module) => ({ default: module.Agenda })));
const Ajuda = lazy(() => import("@/components/Ajuda").then((module) => ({ default: module.Ajuda })));
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

function InlineRouteFallback({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

const DESKTOP_SIDEBAR_STORAGE_KEY = "orcacalhas:desktop-sidebar-collapsed:v1";

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

  const [wizardKey, setWizardKey] = useState(0);
  const [clienteCreateRequest, setClienteCreateRequest] = useState(0);
  const [lancamentoCreateRequest, setLancamentoCreateRequest] = useState(0);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const mainContentRef = useRef<HTMLElement | null>(null);

  const activeRoute = useMemo(() => resolveAppShellRoute(location.pathname), [location.pathname]);
  const tab = activeRoute.tab;

  const {
    orcamentos: orcamentos,
    isLoading: orcamentosLoading,
    getNextNumero,
    addOrcamento,
    updateOrcamento,
  } = useOrcamentos();
  const { clientes } = useClientes();
  const { empresa } = useEmpresa();

  const routeOrcamento = useMemo(
    () =>
      activeRoute.orcamentoId
        ? (orcamentos.find((orcamento) => orcamento.id === activeRoute.orcamentoId) ?? null)
        : null,
    [orcamentos, activeRoute.orcamentoId],
  );

  const selectedOrcamento = activeRoute.tab === "orcamento-detalhes" ? routeOrcamento : null;
  const editingOrcamento = activeRoute.isEditingOrcamento ? routeOrcamento : null;
  const isEditingRoute = activeRoute.tab === "orcamento-novo" && activeRoute.isEditingOrcamento;

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (isMobile) {
        window.scrollTo({ top: 0, left: 0 });
      }
      mainContentRef.current?.scrollTo({ top: 0, left: 0 });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isMobile, location.pathname]);

  useEffect(() => {
    if (!user?.id) return;

    try {
      const stored = sessionStorage.getItem(`${DESKTOP_SIDEBAR_STORAGE_KEY}:${user.id}`);
      if (stored === "1" || stored === "0") {
        setDesktopSidebarCollapsed(stored === "1");
      }
    } catch {
      // ignore storage errors
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    try {
      sessionStorage.setItem(`${DESKTOP_SIDEBAR_STORAGE_KEY}:${user.id}`, desktopSidebarCollapsed ? "1" : "0");
    } catch {
      // ignore storage errors
    }
  }, [user?.id, desktopSidebarCollapsed]);

  useEffect(() => {
    if (!user || loading || !rolesLoaded || !hasAnyRole) return;

    if (location.pathname === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, rolesLoaded, hasAnyRole, location.pathname, navigate]);

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return (
      <Suspense fallback={<FullScreenLoader />}>
        <LoginPage />
      </Suspense>
    );
  }

  if (!rolesLoaded) {
    return <FullScreenLoader />;
  }

  if (isSuperAdmin && !hasAnyRole) {
    return <Navigate to="/super-admin" replace />;
  }

  if (!isSuperAdmin && empresaStatus && empresaStatus !== "ativa") {
    return (
      <Suspense fallback={<FullScreenLoader />}>
        <EmpresaSuspensa />
      </Suspense>
    );
  }

  if (!hasAnyRole) {
    return (
      <Suspense fallback={<FullScreenLoader />}>
        <PendingApproval />
      </Suspense>
    );
  }

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
      toast.error("Sem permissão para criar ou editar orçamentos.");
      return;
    }
    if (newTab === "usuarios" && !canManageUsers) {
      toast.error("Sem permissão para gerenciar usuários.");
      return;
    }

    navigate(getPathForTab(newTab));
  };

  const goToList = () => {
    navigate(getPathForTab("orcamentos"));
  };

  const goToNew = () => {
    if (!canCreateEditBudget) {
      toast.error("Sem permissão para criar orçamentos.");
      return;
    }

    setWizardKey((value) => value + 1);
    navigate(getOrcamentoNewPath());
  };

  const goToNewCliente = () => {
    if (!canManageClientes) {
      toast.error("Sem permissão para cadastrar clientes.");
      return;
    }

    navigate(getPathForTab("clientes"));
    setClienteCreateRequest((value) => value + 1);
  };

  const goToNewLancamento = () => {
    if (!canViewFinanceiro) {
      toast.error("Sem permissão para criar lançamentos financeiros.");
      return;
    }

    navigate(getPathForTab("financeiro"));
    setLancamentoCreateRequest((value) => value + 1);
  };

  const goToDetails = (orcamento: Orcamento) => {
    navigate(getOrcamentoDetailsPath(orcamento.id));
  };

  const goToEdit = (orcamento: Orcamento) => {
    if (!canCreateEditBudget) {
      toast.error("Sem permissão para editar orçamentos.");
      return;
    }

    setWizardKey((value) => value + 1);
    navigate(getOrcamentoEditPath(orcamento.id));
  };

  const handleDuplicate = async (orcamento: Orcamento) => {
    if (!canCreateEditBudget) {
      toast.error("Sem permissão para duplicar orçamentos.");
      return;
    }

    try {
      const novoNumero = await getNextNumero();
      const novoOrcamento: Orcamento = {
        ...orcamento,
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

  const handleMarkExecuted = async (orcamento: Orcamento) => {
    try {
      await updateOrcamento.mutateAsync({
        ...orcamento,
        status: "executado",
        dataExecucao: new Date().toISOString(),
      });
      toast.success("Orçamento marcado como executado!");
    } catch {
      toast.error("Erro ao marcar como executado.");
    }
  };

  const handleMarkFaturado = async (orcamento: Orcamento) => {
    if (orcamento.dataFaturamento) {
      toast.error("Orçamento já foi faturado.");
      return;
    }

    try {
      await updateOrcamento.mutateAsync({
        ...orcamento,
        dataFaturamento: new Date().toISOString(),
      });
      toast.success("Orçamento marcado como faturado!");
    } catch {
      toast.error("Erro ao marcar como faturado.");
    }
  };

  const handleMarkPago = async (orcamento: Orcamento) => {
    if (orcamento.dataPagamento) {
      toast.error("Orçamento já foi marcado como pago.");
      return;
    }

    try {
      await updateOrcamento.mutateAsync({
        ...orcamento,
        dataPagamento: new Date().toISOString(),
      });
      toast.success("Orçamento marcado como pago!");
    } catch {
      toast.error("Erro ao marcar como pago.");
    }
  };

  const handleUpdateDataPrevista = async (orcamento: Orcamento, date: string | null) => {
    try {
      await updateOrcamento.mutateAsync({
        ...orcamento,
        dataPrevista: date,
      });
      toast.success(date ? "Data prevista atualizada!" : "Data prevista removida.");
    } catch {
      toast.error("Erro ao atualizar data prevista.");
    }
  };

  const handleCancelOrcamento = async (orcamento: Orcamento) => {
    try {
      await updateOrcamento.mutateAsync({
        ...orcamento,
        status: "cancelado",
        dataCancelamento: new Date().toISOString(),
      });
      toast.success("Orçamento cancelado.");
    } catch {
      toast.error("Erro ao cancelar orçamento.");
    }
  };

  const getHeaderMeta = () => {
    switch (tab) {
      case "dashboard":
        return { title: "Dashboard", helper: "Resumo rápido da operação e dos números principais." };
      case "agenda":
        return { title: "Agenda", helper: "Compromissos comerciais e operacionais da semana." };
      case "orcamentos":
        return { title: "Orçamentos", helper: "Acompanhe status, datas operacionais e próximos passos." };
      case "orcamento-detalhes":
        return { title: "Detalhes do orçamento", helper: "Revise itens, dados do cliente e situação comercial." };
      case "orcamento-novo":
        return {
          title: isEditingRoute ? "Editar orçamento" : "Novo orçamento",
          helper: "Fluxo guiado para montar a proposta com mais clareza.",
        };
      case "clientes":
        return { title: "Clientes", helper: "Base cadastral, contatos e histórico operacional." };
      case "financeiro":
        return { title: "Financeiro", helper: "Movimentações, leitura dos números e rotina financeira." };
      case "usuarios":
        return { title: "Usuários", helper: "Convites, aprovações e papéis da equipe." };
      case "ajuda":
        return { title: "Ajuda", helper: "Perguntas frequentes e orientações rápidas para o uso do sistema." };
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

      {tab === "agenda" && <Agenda orcamentos={orcamentos} onViewOrcamento={goToDetails} />}

      {tab === "orcamentos" && (
        <Orcamentos onNewOrcamento={goToNew} onViewOrcamento={goToDetails} onEditOrcamento={goToEdit} />
      )}

      {tab === "orcamento-detalhes" &&
        (orcamentosLoading ? (
          <SectionLoader />
        ) : selectedOrcamento ? (
          <OrcamentoDetails
            orcamento={selectedOrcamento}
            cliente={clientes.find((cliente) => cliente.id === selectedOrcamento.clienteId)}
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
        ) : (
          <InlineRouteFallback
            title="Orçamento não encontrado"
            description="Não conseguimos localizar esse orçamento. Ele pode ter sido removido ou você pode não ter acesso a ele."
            actionLabel="Voltar para orçamentos"
            onAction={goToList}
          />
        ))}

      {tab === "orcamento-novo" &&
        (canCreateEditBudget ? (
          isEditingRoute && orcamentosLoading ? (
            <SectionLoader />
          ) : isEditingRoute && !editingOrcamento ? (
            <InlineRouteFallback
              title="Orçamento não encontrado"
              description="Não conseguimos localizar o orçamento que você tentou editar."
              actionLabel="Voltar para orçamentos"
              onAction={goToList}
            />
          ) : (
            <OrcamentoWizard
              key={`${location.pathname}:${wizardKey}`}
              onDone={() => navigate(getPathForTab("orcamentos"))}
              editingOrcamento={editingOrcamento}
            />
          )
        ) : (
          <AccessDenied message="Você não tem permissão para criar ou editar orçamentos." />
        ))}

      {tab === "clientes" &&
        (canManageClientes ? (
          <Clientes openNewRequest={clienteCreateRequest} />
        ) : (
          <AccessDenied message="Você não tem permissão para acessar Clientes." />
        ))}

      {tab === "financeiro" &&
        (canViewFinanceiro ? (
          <Financeiro openNewLancamentoRequest={lancamentoCreateRequest} />
        ) : (
          <AccessDenied message="Você não tem permissão para acessar o Financeiro." />
        ))}

      {tab === "usuarios" &&
        (canManageUsers ? <Usuarios /> : <AccessDenied message="Você não tem permissão para gerenciar usuários." />)}

      {tab === "ajuda" && <Ajuda />}

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
        <main ref={mainContentRef} className="overflow-x-hidden pb-24">
          {content}
        </main>
        <MobileBottomNav
          active={tab}
          onNavigate={guardedNavigate}
          onNewOrcamento={goToNew}
          onNewCliente={goToNewCliente}
          onNewLancamento={goToNewLancamento}
        />
        <Suspense fallback={null}>
          <EditarPerfil open={profileOpen} onOpenChange={setProfileOpen} />
        </Suspense>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen w-full overflow-hidden bg-background">
        <div className="flex h-full w-full">
          <AppSidebar active={tab} collapsed={desktopSidebarCollapsed} onNavigate={guardedNavigate} />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b bg-card/85 px-4 backdrop-blur-sm lg:px-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDesktopSidebarCollapsed((current) => !current)}
                className="mr-3 text-muted-foreground"
                aria-label={desktopSidebarCollapsed ? "Expandir navegação" : "Recolher navegação"}
              >
                {desktopSidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{headerMeta.title}</p>
                <p className="hidden text-xs text-muted-foreground sm:block">{headerMeta.helper}</p>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <span className="max-w-[260px] truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>

              <div className="flex items-center gap-1">
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

            <main ref={mainContentRef} className="flex-1 overflow-auto overflow-x-hidden">
              {content}
            </main>
          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <EditarPerfil open={profileOpen} onOpenChange={setProfileOpen} />
      </Suspense>
    </>
  );
};

export default Index;
