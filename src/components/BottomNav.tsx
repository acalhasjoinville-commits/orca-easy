import { LayoutDashboard, Settings, Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  active: 'dashboard' | 'orcamento' | 'clientes' | 'config';
  onNavigate: (tab: 'dashboard' | 'orcamento' | 'clientes' | 'config') => void;
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-lg">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        <button
          onClick={() => onNavigate('dashboard')}
          className={cn(
            'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
            active === 'dashboard' ? 'text-primary font-semibold' : 'text-muted-foreground'
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </button>

        <button
          onClick={() => onNavigate('clientes')}
          className={cn(
            'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
            active === 'clientes' ? 'text-primary font-semibold' : 'text-muted-foreground'
          )}
        >
          <Users className="h-5 w-5" />
          Clientes
        </button>

        <button
          onClick={() => onNavigate('orcamento')}
          className="flex flex-col items-center gap-0.5"
        >
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full shadow-md -mt-6 transition-colors',
            'bg-accent text-accent-foreground'
          )}>
            <Plus className="h-6 w-6" />
          </div>
          <span className={cn(
            'text-xs',
            active === 'orcamento' ? 'text-accent font-semibold' : 'text-muted-foreground'
          )}>Orçamento</span>
        </button>

        <button
          onClick={() => onNavigate('config')}
          className={cn(
            'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
            active === 'config' ? 'text-primary font-semibold' : 'text-muted-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          Config
        </button>
      </div>
    </nav>
  );
}
