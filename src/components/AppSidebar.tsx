import { LayoutDashboard, Settings, FileText, Users, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export type Tab = 'dashboard' | 'orcamentos' | 'orcamento-detalhes' | 'orcamento-novo' | 'clientes' | 'financeiro' | 'usuarios' | 'config';

interface AppSidebarProps {
  active: Tab;
  onNavigate: (tab: Tab) => void;
}

type Permission = 'all' | 'canManageClientes' | 'canViewFinanceiro' | 'canManageSettings' | 'canManageUsers';

interface NavItem {
  title: string;
  tab: Tab;
  icon: React.ElementType;
  permission: Permission;
}

const operationItems: NavItem[] = [
  { title: 'Dashboard', tab: 'dashboard', icon: LayoutDashboard, permission: 'all' },
  { title: 'Orçamentos', tab: 'orcamentos', icon: FileText, permission: 'all' },
  { title: 'Clientes', tab: 'clientes', icon: Users, permission: 'canManageClientes' },
  { title: 'Financeiro', tab: 'financeiro', icon: DollarSign, permission: 'canViewFinanceiro' },
];

const adminItems: NavItem[] = [
  { title: 'Configurações', tab: 'config', icon: Settings, permission: 'canManageSettings' },
  { title: 'Usuários', tab: 'usuarios', icon: Users, permission: 'canManageUsers' },
];

function isOrcamentoTab(tab: Tab) {
  return tab === 'orcamentos' || tab === 'orcamento-detalhes' || tab === 'orcamento-novo';
}

export function AppSidebar({ active, onNavigate }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { canManageClientes, canViewFinanceiro, canManageSettings, canManageUsers } = useAuth();

  const permissionMap: Record<string, boolean> = {
    all: true,
    canManageClientes,
    canViewFinanceiro,
    canManageSettings,
    canManageUsers,
  };

  const visibleOps = operationItems.filter(item => permissionMap[item.permission]);
  const visibleAdmin = adminItems.filter(item => permissionMap[item.permission]);

  const renderItem = (item: NavItem) => {
    const isActive = item.tab === 'orcamentos'
      ? isOrcamentoTab(active)
      : active === item.tab;
    return (
      <SidebarMenuItem key={item.tab}>
        <SidebarMenuButton
          onClick={() => onNavigate(item.tab)}
          className={cn(
            'w-full cursor-pointer rounded-lg transition-all duration-150 h-10',
            isActive
              ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="text-[13px]">{item.title}</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="pt-2">
        {/* Brand */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 h-12 flex items-center">
            {!collapsed ? (
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
                  OC
                </div>
                <span className="text-base font-bold tracking-tight text-sidebar-accent-foreground">
                  OrçaCalhas
                </span>
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm mx-auto">
                OC
              </div>
            )}
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Operação */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="px-4">
            {!collapsed && <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-semibold">Operação</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-0.5">
              {visibleOps.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administração */}
        {visibleAdmin.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-4">
              {!collapsed && <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-semibold">Administração</span>}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="px-2 space-y-0.5">
                {visibleAdmin.map(renderItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
