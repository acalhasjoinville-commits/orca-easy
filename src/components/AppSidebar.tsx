import { LayoutDashboard, Settings, FileText, Users, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
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

export type Tab = 'dashboard' | 'orcamentos' | 'orcamento-detalhes' | 'orcamento-novo' | 'clientes' | 'financeiro' | 'config';

interface AppSidebarProps {
  active: Tab;
  onNavigate: (tab: Tab) => void;
}

const items: { title: string; tab: Tab; icon: React.ElementType }[] = [
  { title: 'Dashboard', tab: 'dashboard', icon: LayoutDashboard },
  { title: 'Orçamentos', tab: 'orcamentos', icon: FileText },
  { title: 'Clientes', tab: 'clientes', icon: Users },
  { title: 'Financeiro', tab: 'financeiro', icon: DollarSign },
  { title: 'Configurações', tab: 'config', icon: Settings },
];

function isOrcamentoTab(tab: Tab) {
  return tab === 'orcamentos' || tab === 'orcamento-detalhes' || tab === 'orcamento-novo';
}

export function AppSidebar({ active, onNavigate }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

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
              {items.map((item) => {
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
