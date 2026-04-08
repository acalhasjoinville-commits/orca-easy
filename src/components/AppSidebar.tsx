import { CalendarDays, DollarSign, FileText, HelpCircle, LayoutDashboard, Settings, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export type Tab =
  | "dashboard"
  | "orcamentos"
  | "orcamento-detalhes"
  | "orcamento-novo"
  | "agenda"
  | "clientes"
  | "financeiro"
  | "usuarios"
  | "config"
  | "ajuda";

interface AppSidebarProps {
  active: Tab;
  collapsed: boolean;
  onNavigate: (tab: Tab) => void;
}

type Permission = "all" | "canManageClientes" | "canViewFinanceiro" | "canManageSettings" | "canManageUsers";

interface NavItem {
  title: string;
  helper: string;
  tab: Tab;
  icon: LucideIcon;
  permission: Permission;
}

const operationItems: NavItem[] = [
  {
    title: "Dashboard",
    helper: "Visão geral da operação",
    tab: "dashboard",
    icon: LayoutDashboard,
    permission: "all",
  },
  {
    title: "Agenda",
    helper: "Compromissos e prazos da semana",
    tab: "agenda",
    icon: CalendarDays,
    permission: "all",
  },
  {
    title: "Orçamentos",
    helper: "Propostas, follow-up e execução",
    tab: "orcamentos",
    icon: FileText,
    permission: "all",
  },
  {
    title: "Clientes",
    helper: "Cadastros e contatos ativos",
    tab: "clientes",
    icon: Users,
    permission: "canManageClientes",
  },
  {
    title: "Financeiro",
    helper: "Lançamentos e leitura do caixa",
    tab: "financeiro",
    icon: DollarSign,
    permission: "canViewFinanceiro",
  },
];

const adminItems: NavItem[] = [
  {
    title: "Configurações",
    helper: "Dados-base e catálogo técnico",
    tab: "config",
    icon: Settings,
    permission: "canManageSettings",
  },
  {
    title: "Usuários",
    helper: "Convites, aprovações e papéis",
    tab: "usuarios",
    icon: Users,
    permission: "canManageUsers",
  },
];

function isOrcamentoTab(tab: Tab) {
  return tab === "orcamentos" || tab === "orcamento-detalhes" || tab === "orcamento-novo";
}

export function AppSidebar({ active, collapsed, onNavigate }: AppSidebarProps) {
  const { canManageClientes, canViewFinanceiro, canManageSettings, canManageUsers } = useAuth();

  const permissionMap: Record<Permission, boolean> = {
    all: true,
    canManageClientes,
    canViewFinanceiro,
    canManageSettings,
    canManageUsers,
  };

  const visibleOps = operationItems.filter((item) => permissionMap[item.permission]);
  const visibleAdmin = adminItems.filter((item) => permissionMap[item.permission]);

  const renderItem = ({ title, helper, tab, icon: Icon }: NavItem) => {
    const isActive = tab === "orcamentos" ? isOrcamentoTab(active) : active === tab;

    return (
      <button
        key={tab}
        onClick={() => onNavigate(tab)}
        className={cn(
          "w-full rounded-2xl px-3 py-3 text-left transition-all",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          collapsed && "px-0 text-center",
        )}
        title={collapsed ? title : undefined}
      >
        <div className={cn("flex items-start gap-3", collapsed && "justify-center")}>
          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium">{title}</p>
              <p
                className={cn(
                  "mt-1 text-[11px]",
                  isActive ? "text-sidebar-primary-foreground/75" : "text-sidebar-foreground/60",
                )}
              >
                {helper}
              </p>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-[86px]" : "w-[288px]",
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <FileText className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-primary-foreground">OrçaCalhas</p>
            <p className="truncate text-[11px] text-sidebar-foreground/65">Rotina comercial e operacional</p>
          </div>
        )}
      </div>

      <div className="border-b border-sidebar-border px-3 py-4">
        <div
          className={cn(
            "rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/30 px-3 py-3",
            collapsed && "px-0 py-3 text-center",
          )}
        >
          {!collapsed ? (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/45">
                Operação
              </p>
              <p className="mt-2 text-sm font-medium text-sidebar-foreground">
                Acompanhe orçamento, execução, financeiro e cadastros em um fluxo único.
              </p>
            </>
          ) : (
            <LayoutDashboard className="mx-auto h-4 w-4 text-sidebar-foreground/70" />
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-4 px-3 py-4">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/45">
              Navegação
            </p>
          )}
          <div className="space-y-1">{visibleOps.map(renderItem)}</div>
        </div>

        {visibleAdmin.length > 0 && (
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/45">
                Administração
              </p>
            )}
            <div className="space-y-1">{visibleAdmin.map(renderItem)}</div>
          </div>
        )}
      </nav>
    </aside>
  );
}
