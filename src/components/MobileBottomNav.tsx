import { LayoutDashboard, Plus, DollarSign, FileText, Users, Settings, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Tab } from '@/components/AppSidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface MobileBottomNavProps {
  active: Tab;
  onNavigate: (tab: Tab) => void;
  onNewOrcamento: () => void;
}

function isOrcamentoTab(tab: Tab) {
  return tab === 'orcamentos' || tab === 'orcamento-detalhes' || tab === 'orcamento-novo';
}

export function MobileBottomNav({ active, onNavigate, onNewOrcamento }: MobileBottomNavProps) {
  const { canCreateEditBudget, canViewFinanceiro, canManageSettings, canManageUsers, canManageClientes } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Secondary items for the "Mais" sheet
  const secondaryItems: { title: string; tab: Tab; icon: React.ElementType }[] = [];

  if (canManageClientes) {
    secondaryItems.push({ title: 'Clientes', tab: 'clientes', icon: Users });
  }
  if (canManageSettings) {
    secondaryItems.push({ title: 'Configurações', tab: 'config', icon: Settings });
  }
  if (canManageUsers) {
    secondaryItems.push({ title: 'Usuários', tab: 'usuarios', icon: Users });
  }

  const handleSecondaryNav = (tab: Tab) => {
    setSheetOpen(false);
    onNavigate(tab);
  };

  const isSecondaryActive = secondaryItems.some(item => item.tab === active);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-lg lg:hidden">
      <div className="flex h-16 items-center justify-around">
        {/* Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={cn(
            'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors',
            active === 'dashboard' ? 'text-primary font-semibold' : 'text-muted-foreground'
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </button>

        {/* Orçamentos */}
        <button
          onClick={() => onNavigate('orcamentos')}
          className={cn(
            'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors',
            isOrcamentoTab(active) && active !== 'orcamento-novo'
              ? 'text-primary font-semibold'
              : 'text-muted-foreground'
          )}
        >
          <FileText className="h-5 w-5" />
          <span>Orçamentos</span>
        </button>

        {/* Novo (FAB) */}
        {canCreateEditBudget && (
          <button
            onClick={onNewOrcamento}
            className="flex flex-col items-center gap-0.5"
          >
            <div className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full shadow-md -mt-5 transition-colors',
              'bg-accent text-accent-foreground'
            )}>
              <Plus className="h-5 w-5" />
            </div>
            <span className={cn(
              'text-[10px]',
              active === 'orcamento-novo' ? 'text-accent font-semibold' : 'text-muted-foreground'
            )}>Novo</span>
          </button>
        )}

        {/* Financeiro */}
        {canViewFinanceiro && (
          <button
            onClick={() => onNavigate('financeiro')}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors',
              active === 'financeiro' ? 'text-primary font-semibold' : 'text-muted-foreground'
            )}
          >
            <DollarSign className="h-5 w-5" />
            <span>Financeiro</span>
          </button>
        )}

        {/* Mais */}
        {secondaryItems.length > 0 && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors',
                  isSecondaryActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span>Mais</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl pb-8">
              <SheetHeader>
                <SheetTitle className="text-base">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-1">
                {secondaryItems.map(item => (
                  <button
                    key={item.tab}
                    onClick={() => handleSecondaryNav(item.tab)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors',
                      active === item.tab
                        ? 'bg-accent/10 text-accent font-semibold'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.title}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
}
