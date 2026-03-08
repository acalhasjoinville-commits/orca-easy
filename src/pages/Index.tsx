import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar, Tab } from '@/components/AppSidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Dashboard } from '@/components/Dashboard';
import { OrcamentoWizard } from '@/components/OrcamentoWizard';
import { Configuracoes } from '@/components/Configuracoes';
import { Clientes } from '@/components/Clientes';
import { Financeiro } from '@/components/Financeiro';
import { Orcamento } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [wizardKey, setWizardKey] = useState(0);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const isMobile = useIsMobile();

  const goToOrcamento = () => {
    setEditingOrcamento(null);
    setWizardKey(k => k + 1);
    setTab('orcamento');
  };

  const goToEdit = (orc: Orcamento) => {
    setEditingOrcamento(orc);
    setWizardKey(k => k + 1);
    setTab('orcamento');
  };

  const content = (
    <>
      {tab === 'dashboard' && <Dashboard onNewOrcamento={goToOrcamento} onEditOrcamento={goToEdit} />}
      {tab === 'orcamento' && (
        <OrcamentoWizard key={wizardKey} onDone={() => { setEditingOrcamento(null); setTab('dashboard'); }} editingOrcamento={editingOrcamento} />
      )}
      {tab === 'clientes' && <Clientes />}
      {tab === 'financeiro' && <Financeiro />}
      {tab === 'config' && <Configuracoes />}
    </>
  );

  // Mobile layout: full width + bottom nav
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="h-12 flex items-center border-b bg-card px-4 sticky top-0 z-40">
          <span className="text-base font-bold text-primary">OrçaCalhas</span>
          <span className="ml-3 text-sm text-muted-foreground">
            {tab === 'dashboard' && 'Dashboard'}
            {tab === 'orcamento' && (editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento')}
            {tab === 'clientes' && 'Clientes'}
            {tab === 'financeiro' && 'Financeiro'}
            {tab === 'config' && 'Configurações'}
          </span>
        </header>
        <main className="overflow-auto">
          {content}
        </main>
        <MobileBottomNav active={tab} onNavigate={setTab} />
      </div>
    );
  }

  // Desktop layout: sidebar + wide content
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar active={tab} onNavigate={setTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card px-4 shrink-0">
            <SidebarTrigger className="mr-3" />
            <span className="text-sm font-semibold text-muted-foreground">
              {tab === 'dashboard' && 'Dashboard'}
              {tab === 'orcamento' && (editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento')}
              {tab === 'clientes' && 'Clientes'}
              {tab === 'financeiro' && 'Financeiro'}
              {tab === 'config' && 'Configurações'}
            </span>
          </header>
          <main className="flex-1 overflow-auto">
            {content}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
