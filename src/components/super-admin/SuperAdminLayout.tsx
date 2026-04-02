import { useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Building2, Users, Mail, ScrollText, LogOut, Shield, ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type SATab = 'dashboard' | 'empresas' | 'usuarios' | 'convites' | 'auditoria';

interface Props {
  active: SATab;
  onNavigate: (tab: SATab) => void;
  children: ReactNode;
}

const navItems: { tab: SATab; label: string; icon: any }[] = [
  { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { tab: 'empresas', label: 'Empresas', icon: Building2 },
  { tab: 'usuarios', label: 'Usuários', icon: Users },
  { tab: 'convites', label: 'Convites', icon: Mail },
  { tab: 'auditoria', label: 'Auditoria', icon: ScrollText },
];

export function SuperAdminLayout({ active, onNavigate, children }: Props) {
  const { signOut, hasAnyRole, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2">
          <Shield className="h-6 w-6 text-sidebar-primary shrink-0" />
          {!collapsed && <span className="font-bold text-sm text-sidebar-primary-foreground">Super Admin</span>}
        </div>

        <nav className="flex-1 py-3 space-y-1 px-2">
          {navItems.map(({ tab, label, icon: Icon }) => (
            <button
              key={tab}
              onClick={() => onNavigate(tab)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active === tab
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          {hasAnyRole && (
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 shrink-0" />
              {!collapsed && 'Voltar ao Sistema'}
            </button>
          )}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && 'Sair'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center border-b bg-card/80 backdrop-blur-sm px-5 shrink-0 sticky top-0 z-40">
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(c => !c)} className="mr-3 text-muted-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </Button>
          <h1 className="text-sm font-semibold text-foreground flex-1">
            Administração da Plataforma
          </h1>
          <span className="text-xs text-muted-foreground">{user?.email}</span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
