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

const allItems: { title: string; tab: Tab; icon: React.ElementType; permission: 'all' | 'canManageClientes' | 'canViewFinanceiro' | 'canManageSettings' | 'canManageUsers' }[] = [
  { title: 'Dashboard', tab: 'dashboard', icon: LayoutDashboard, permission: 'all' },
  { title: 'Orçamentos', tab: 'orcamentos', icon: FileText, permission: 'all' },
  { title: 'Clientes', tab: 'clientes', icon: Users, permission: 'canManageClientes' },
  { title: 'Financeiro', tab: 'financeiro', icon: DollarSign, permission: 'canViewFinanceiro' },
  { title: 'Usuários', tab: 'usuarios', icon: Users, permission: 'canManageUsers' },
  { title: 'Configurações', tab: 'config', icon: Settings, permission: 'canManageSettings' },
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

  const visibleItems = allItems.filter(item => permissionMap[item.permission]);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight text-primary">
                OrçaCalhas
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive = item.tab === 'orcamentos'
                  ? isOrcamentoTab(active)
                  : active === item.tab;
                return (
                  <SidebarMenuItem key={item.tab}>
                    <SidebarMenuButton
                      onClick={() => onNavigate(item.tab)}
                      className={cn(
                        'w-full cursor-pointer',
                        isActive && 'bg-accent text-accent-foreground font-semibold'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
