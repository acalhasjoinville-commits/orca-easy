import { ReactNode, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ChevronLeft,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  MoreHorizontal,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Shield,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export type SATab = "dashboard" | "empresas" | "usuarios" | "convites" | "auditoria" | "aparencia" | "faq";

interface Props {
  active: SATab;
  onNavigate: (tab: SATab) => void;
  children: ReactNode;
}

interface NavItem {
  tab: SATab;
  label: string;
  helper: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    tab: "dashboard",
    label: "Dashboard",
    helper: "Visao geral da plataforma",
    icon: LayoutDashboard,
  },
  {
    tab: "empresas",
    label: "Empresas",
    helper: "Contas, status e administradores",
    icon: Building2,
  },
  {
    tab: "usuarios",
    label: "Usuarios",
    helper: "Acessos globais e aprovacoes",
    icon: Users,
  },
  {
    tab: "convites",
    label: "Convites",
    helper: "Pendencias e convites ativos",
    icon: Mail,
  },
  {
    tab: "auditoria",
    label: "Auditoria",
    helper: "Acoes sensiveis da plataforma",
    icon: ScrollText,
  },
  {
    tab: "aparencia",
    label: "Aparencia",
    helper: "Cor principal da interface",
    icon: Palette,
  },
  {
    tab: "faq",
    label: "FAQ",
    helper: "Perguntas frequentes do sistema",
    icon: HelpCircle,
  },
];

export function SuperAdminLayout({ active, onNavigate, children }: Props) {
  const { signOut, hasAnyRole, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const activeItem = useMemo(() => navItems.find((item) => item.tab === active) ?? navItems[0], [active]);

  const mobilePrimaryItems = navItems.filter((item) =>
    ["dashboard", "empresas", "usuarios", "convites"].includes(item.tab),
  );
  const mobileMoreItems = navItems.filter(
    (item) => !["dashboard", "empresas", "usuarios", "convites"].includes(item.tab),
  );
  const isMoreActive = mobileMoreItems.some((item) => item.tab === active);

  if (isMobile) {
    return (
      <div className="min-h-screen w-full bg-background">
        <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-card px-4 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{activeItem.label}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="pb-24">
          <div className="mx-auto w-full max-w-7xl p-4">{children}</div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="mx-auto grid h-[76px] max-w-lg grid-cols-5 items-end px-2 pb-2">
            {mobilePrimaryItems.map(({ tab, label, icon: Icon }) => (
              <button
                key={tab}
                onClick={() => onNavigate(tab)}
                className={cn(
                  "mx-auto flex w-full max-w-[72px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] transition-colors",
                  active === tab ? "text-primary font-semibold" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="leading-none">{label}</span>
              </button>
            ))}

            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    "mx-auto flex w-full max-w-[72px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] transition-colors",
                    isMoreActive ? "text-primary font-semibold" : "text-muted-foreground",
                  )}
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="leading-none">Mais</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl pb-8">
                <SheetHeader>
                  <SheetTitle>Super Admin</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-1">
                  {mobileMoreItems.map(({ tab, label, icon: Icon }) => (
                    <Button
                      key={tab}
                      variant="ghost"
                      onClick={() => {
                        setMoreOpen(false);
                        onNavigate(tab);
                      }}
                      className={cn(
                        "flex h-auto w-full items-center justify-start gap-3 rounded-2xl px-4 py-3.5 text-left",
                        active === tab ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{label}</span>
                    </Button>
                  ))}

                  {hasAnyRole && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setMoreOpen(false);
                        navigate("/");
                      }}
                      className="flex h-auto w-full items-center justify-start gap-3 rounded-2xl px-4 py-3.5 text-left"
                    >
                      <ChevronLeft className="h-5 w-5 shrink-0" />
                      <span>Voltar ao sistema</span>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMoreOpen(false);
                      signOut();
                    }}
                    className="flex h-auto w-full items-center justify-start gap-3 rounded-2xl px-4 py-3.5 text-left"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span>Sair</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="flex min-h-screen w-full">
        <aside
          className={cn(
            "flex shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200",
            collapsed ? "w-[86px]" : "w-[288px]",
          )}
        >
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-sidebar-primary-foreground">Super Admin</p>
                <p className="truncate text-[11px] text-sidebar-foreground/65">Administracao da plataforma</p>
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
                    Plataforma
                  </p>
                  <p className="mt-2 text-sm font-medium text-sidebar-foreground">
                    Controle empresas, acessos, convites e acoes sensiveis em um unico lugar.
                  </p>
                </>
              ) : (
                <Shield className="mx-auto h-4 w-4 text-sidebar-foreground/70" />
              )}
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map(({ tab, label, helper, icon: Icon }) => {
              const isActive = active === tab;

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
                  title={collapsed ? label : undefined}
                >
                  <div className={cn("flex items-start gap-3", collapsed && "justify-center")}>
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{label}</p>
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
            })}
          </nav>

          <div className="space-y-2 border-t border-sidebar-border p-3">
            {hasAnyRole && (
              <button
                onClick={() => navigate("/")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60"
                title={collapsed ? "Voltar ao sistema" : undefined}
              >
                <ChevronLeft className="h-4 w-4 shrink-0" />
                {!collapsed && "Voltar ao sistema"}
              </button>
            )}
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60"
              title={collapsed ? "Sair" : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && "Sair"}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b bg-card/85 px-4 backdrop-blur-sm lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((current) => !current)}
              className="mr-3 text-muted-foreground"
              aria-label={collapsed ? "Expandir navegacao" : "Recolher navegacao"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{activeItem.label}</p>
              <p className="hidden text-xs text-muted-foreground sm:block">{activeItem.helper}</p>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                Super admin
              </Badge>
              <span className="max-w-[260px] truncate text-xs text-muted-foreground">{user?.email}</span>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
