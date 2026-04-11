import { CalendarDays, DollarSign, FileText, HelpCircle, LayoutDashboard, MoreHorizontal, Plus, Settings, Shield, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Tab } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  active: Tab;
  onNavigate: (tab: Tab) => void;
  onNewOrcamento: () => void;
  onNewCliente?: () => void;
  onNewLancamento?: () => void;
  onNewVisita?: () => void;
}

interface NavButtonProps {
  active: boolean;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}

function isOrcamentoTab(tab: Tab) {
  return tab === "orcamentos" || tab === "orcamento-detalhes" || tab === "orcamento-novo";
}

function MobileNavButton({ active, label, icon: Icon, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "mx-auto flex w-full max-w-[72px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] transition-colors",
        active ? "text-primary font-semibold" : "text-muted-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="leading-none">{label}</span>
    </button>
  );
}

export function MobileBottomNav({
  active,
  onNavigate,
  onNewOrcamento,
  onNewCliente,
  onNewLancamento,
  onNewVisita,
}: MobileBottomNavProps) {
  const { canCreateEditBudget, canViewFinanceiro, canManageSettings, canManageUsers, canManageClientes, isSuperAdmin } =
    useAuth();
  const navigate = useNavigate();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const quickActions: { label: string; description: string; icon: React.ElementType; onSelect: () => void }[] = [];

  if (canCreateEditBudget) {
    quickActions.push({
      label: "Novo orçamento",
      description: "Abra o fluxo completo para montar uma nova proposta.",
      icon: FileText,
      onSelect: onNewOrcamento,
    });
  }

  if (canManageClientes && onNewCliente) {
    quickActions.push({
      label: "Novo cliente",
      description: "Cadastre um cliente novo sem sair da rotina principal.",
      icon: Users,
      onSelect: onNewCliente,
    });
  }

  if (canViewFinanceiro && onNewLancamento) {
    quickActions.push({
      label: "Novo lançamento",
      description: "Registre receita ou despesa direto pelo atalho central.",
      icon: DollarSign,
      onSelect: onNewLancamento,
    });
  }

  if (onNewVisita) {
    quickActions.push({
      label: "Nova visita",
      description: "Agende uma visita técnica ou comercial para um novo atendimento.",
      icon: CalendarDays,
      onSelect: onNewVisita,
    });
  }

  const secondaryItems: { title: string; tab: Tab; icon: React.ElementType }[] = [];

  if (canManageClientes) {
    secondaryItems.push({ title: "Clientes", tab: "clientes", icon: Users });
  }
  if (canViewFinanceiro) {
    secondaryItems.push({ title: "Financeiro", tab: "financeiro", icon: DollarSign });
  }
  if (canManageSettings) {
    secondaryItems.push({ title: "Configurações", tab: "config", icon: Settings });
  }
  if (canManageUsers) {
    secondaryItems.push({ title: "Usuários", tab: "usuarios", icon: Users });
  }
  secondaryItems.push({ title: "Ajuda", tab: "ajuda", icon: HelpCircle });

  const isSecondaryActive = secondaryItems.some((item) => item.tab === active);

  const handleQuickAction = (action: () => void) => {
    setQuickCreateOpen(false);
    action();
  };

  const handleSecondaryNav = (tab: Tab) => {
    setMoreOpen(false);
    onNavigate(tab);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:hidden">
      <div className="mx-auto grid h-[76px] max-w-lg grid-cols-5 items-end px-2 pb-2">
        <MobileNavButton
          active={active === "dashboard"}
          label="Dashboard"
          icon={LayoutDashboard}
          onClick={() => onNavigate("dashboard")}
        />

        <MobileNavButton
          active={active === "agenda"}
          label="Agenda"
          icon={CalendarDays}
          onClick={() => onNavigate("agenda")}
        />

        <div className="flex justify-center">
          {quickActions.length > 0 ? (
            <Sheet open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary text-primary-foreground shadow-xl transition-transform hover:-translate-y-0.5",
                      active === "orcamento-novo" && "ring-4 ring-primary/15",
                    )}
                  >
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className={cn(active === "orcamento-novo" && "font-semibold text-primary")}>Novo</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl pb-8">
                <SheetHeader>
                  <SheetTitle>Ações rápidas</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.onSelect)}
                      className="flex w-full items-start gap-3 rounded-2xl border border-border bg-background px-4 py-4 text-left transition-colors hover:bg-muted"
                    >
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{action.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{action.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="h-14 w-14" />
          )}
        </div>

        <MobileNavButton
          active={isOrcamentoTab(active) && active !== "orcamento-novo"}
          label="Orçamentos"
          icon={FileText}
          onClick={() => onNavigate("orcamentos")}
        />

        {secondaryItems.length > 0 ? (
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "mx-auto flex w-full max-w-[72px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] transition-colors",
                  isSecondaryActive ? "text-primary font-semibold" : "text-muted-foreground",
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="leading-none">Mais</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl pb-8">
              <SheetHeader>
                <SheetTitle>Navegação</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-1">
                {secondaryItems.map((item) => (
                  <Button
                    key={item.tab}
                    variant="ghost"
                    onClick={() => handleSecondaryNav(item.tab)}
                    className={cn(
                      "flex h-auto w-full items-center justify-start gap-3 rounded-2xl px-4 py-3.5 text-left",
                      active === item.tab ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.title}</span>
                  </Button>
                ))}

                {isSuperAdmin && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMoreOpen(false);
                      navigate("/super-admin");
                    }}
                    className="flex h-auto w-full items-center justify-start gap-3 rounded-2xl px-4 py-3.5 text-left"
                  >
                    <Shield className="h-5 w-5 shrink-0" />
                    <span>Super Admin</span>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
