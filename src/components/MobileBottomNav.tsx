import { LayoutDashboard, Settings, Plus, DollarSign, FileText, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Tab } from '@/components/AppSidebar';

interface MobileBottomNavProps {
  active: Tab;
  onNavigate: (tab: Tab) => void;
  onNewOrcamento: () => void;
}

function isOrcamentoTab(tab: Tab) {
  return tab === 'orcamentos' || tab === 'orcamento-detalhes' || tab === 'orcamento-novo';
}

export function MobileBottomNav({ active, onNavigate, onNewOrcamento }: MobileBottomNavProps) {
  const { canCreateEditBudget, canViewFinanceiro, canManageSettings, canManageUsers } = useAuth();

  // Build items dynamically based on permissions
  const items: { title: string; tab: Tab; icon: React.ElementType; accent?: boolean; action?: () => void }[] = [
    { title: 'Dashboard', tab: 'dashboard', icon: LayoutDashboard },
    { title: 'Orçamentos', tab: 'orcamentos', icon: FileText },
  ];

  if (canCreateEditBudget) {
    items.push({ title: 'Novo', tab: 'orcamento-novo', icon: Plus, accent: true, action: onNewOrcamento });
  }

  if (canViewFinanceiro) {
    items.push({ title: 'Financeiro', tab: 'financeiro', icon: DollarSign });
  }

  if (canManageSettings) {
    items.push({ title: 'Config', tab: 'config', icon: Settings });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-lg lg:hidden">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const isActive = item.tab === 'orcamentos'
            ? isOrcamentoTab(active) && active !== 'orcamento-novo'
            : active === item.tab;

          const handleClick = () => {
            if (item.action) {
              item.action();
            } else {
              onNavigate(item.tab);
            }
          };

          return (
            <button
              key={item.tab}
              onClick={handleClick}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors',
                item.accent && active === item.tab
                  ? 'text-accent font-semibold'
                  : isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground'
              )}
            >
              {item.accent ? (
                <div className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full shadow-md -mt-5 transition-colors',
                  'bg-accent text-accent-foreground'
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
