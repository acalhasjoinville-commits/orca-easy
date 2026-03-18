import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar, Tab } from '@/components/AppSidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Dashboard } from '@/components/Dashboard';
import { Orcamentos } from '@/components/Orcamentos';
import { OrcamentoWizard } from '@/components/OrcamentoWizard';
import { OrcamentoDetails } from '@/components/OrcamentoDetails';
import { Configuracoes } from '@/components/Configuracoes';
import { Clientes } from '@/components/Clientes';
import { Financeiro } from '@/components/Financeiro';
import { Usuarios } from '@/components/Usuarios';
import { LoginPage } from '@/components/LoginPage';
import { PendingApproval } from '@/components/PendingApproval';
import { AccessDenied } from '@/components/AccessDenied';
import { Orcamento } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOrcamentos, useClientes, useEmpresa } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading, rolesLoaded, hasAnyRole, signOut, canManageSettings, canViewFinanceiro, canCreateEditBudget, canManageClientes, canDeleteBudget, canManageUsers } = useAuth();

  const [tab, setTab] = useState<Tab>('dashboard');
  const [wizardKey, setWizardKey] = useState(0);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const isMobile = useIsMobile();

  const {} = useOrcamentos();
  const { clientes } = useClientes();
  const { empresa } = useEmpresa();

  // Auth loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated → login page
  if (!user) {
    return <LoginPage />;
  }

  // Still loading roles → show spinner (avoid flashing PendingApproval)
  if (!rolesLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Authenticated but no role → pending approval
  if (!hasAnyRole) {
    return <PendingApproval />;
  }

  // Guard navigation: redirect to dashboard if user navigates to restricted tab
  const guardedNavigate = (newTab: Tab) => {
    if (newTab === 'config' && !canManageSettings) {
      toast.error('Sem permissão para acessar Configurações.');
      return;
    }
    if (newTab === 'financeiro' && !canViewFinanceiro) {
      toast.error('Sem permissão para acessar Financeiro.');
      return;
    }
    if (newTab === 'clientes' && !canManageClientes) {
      toast.error('Sem permissão para acessar Clientes.');
      return;
    }
    if (newTab === 'orcamento-novo' && !canCreateEditBudget) {
      toast.error('Sem permissão para criar/editar orçamentos.');
      return;
    }
    if (newTab === 'usuarios' && !canManageUsers) {
      toast.error('Sem permissão para gerenciar usuários.');
      return;
    }
    setTab(newTab);
  };

  const goToList = () => setTab('orcamentos');

  const goToNew = () => {
    if (!canCreateEditBudget) {
      toast.error('Sem permissão para criar orçamentos.');
      return;
    }
    setEditingOrcamento(null);
    setWizardKey(k => k + 1);
    setTab('orcamento-novo');
  };

  const goToDetails = (orc: Orcamento) => {
    setSelectedOrcamento(orc);
    setTab('orcamento-detalhes');
  };

  const goToEdit = (orc: Orcamento) => {
    if (!canCreateEditBudget) {
      toast.error('Sem permissão para editar orçamentos.');
      return;
    }
    setEditingOrcamento(orc);
    setWizardKey(k => k + 1);
    setTab('orcamento-novo');
  };


  const getHeaderLabel = () => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'orcamentos': return 'Orçamentos';
      case 'orcamento-detalhes': return 'Detalhes do Orçamento';
      case 'orcamento-novo': return editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento';
      case 'clientes': return 'Clientes';
      case 'financeiro': return 'Financeiro';
      case 'usuarios': return 'Usuários';
      case 'config': return 'Configurações';
      default: return '';
    }
  };

  const content = (
    <>
      {tab === 'dashboard' && <Dashboard onNewOrcamento={goToNew} onViewOrcamento={goToDetails} onNavigate={guardedNavigate} />}
      {tab === 'orcamentos' && <Orcamentos onNewOrcamento={goToNew} onViewOrcamento={goToDetails} onEditOrcamento={goToEdit} />}
      {tab === 'orcamento-detalhes' && selectedOrcamento && (
        <OrcamentoDetails
          orcamento={selectedOrcamento}
          cliente={clientes.find(c => c.id === selectedOrcamento.clienteId)}
          empresa={empresa}
          onBack={goToList}
          onEdit={goToEdit}
          onDelete={handleDelete}
        />
      )}
      {tab === 'orcamento-novo' && (
        canCreateEditBudget ? (
          <OrcamentoWizard
            key={wizardKey}
            onDone={() => { setEditingOrcamento(null); setTab('orcamentos'); }}
            editingOrcamento={editingOrcamento}
          />
        ) : (
          <AccessDenied message="Você não tem permissão para criar ou editar orçamentos." />
        )
      )}
      {tab === 'clientes' && (
        canManageClientes ? <Clientes /> : <AccessDenied message="Você não tem permissão para acessar Clientes." />
      )}
      {tab === 'financeiro' && (
        canViewFinanceiro ? <Financeiro /> : <AccessDenied message="Você não tem permissão para acessar o Financeiro." />
      )}
      {tab === 'usuarios' && (
        canManageUsers ? <Usuarios /> : <AccessDenied message="Você não tem permissão para gerenciar usuários." />
      )}
      {tab === 'config' && (
        canManageSettings ? <Configuracoes /> : <AccessDenied message="Você não tem permissão para acessar Configurações." />
      )}
    </>
  );

  const logoutButton = (
    <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground h-8 px-2">
      <LogOut className="h-4 w-4" />
    </Button>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="h-12 flex items-center border-b bg-card px-4 sticky top-0 z-50">
          <span className="text-base font-bold text-primary">OrçaCalhas</span>
          <span className="ml-3 text-sm text-muted-foreground flex-1">{getHeaderLabel()}</span>
          {logoutButton}
        </header>
        <main className="pb-16">{content}</main>
        <MobileBottomNav active={tab} onNavigate={guardedNavigate} onNewOrcamento={goToNew} />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar active={tab} onNavigate={guardedNavigate} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card px-4 shrink-0">
            <SidebarTrigger className="mr-3" />
            <span className="text-sm font-semibold text-muted-foreground flex-1">{getHeaderLabel()}</span>
            <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">{user?.email}</span>
            {logoutButton}
          </header>
          <main className="flex-1 overflow-auto">{content}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
