import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar, Tab } from '@/components/AppSidebar';
import { Dashboard } from '@/components/Dashboard';
import { OrcamentoWizard } from '@/components/OrcamentoWizard';
import { Configuracoes } from '@/components/Configuracoes';
import { Clientes } from '@/components/Clientes';
import { Financeiro } from '@/components/Financeiro';
import { Orcamento } from '@/lib/types';

const Index = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [wizardKey, setWizardKey] = useState(0);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar active={tab} onNavigate={setTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card px-4 shrink-0">
            <SidebarTrigger className="mr-3" />
            <span className="text-sm font-semibold text-muted-foreground">
              {tab === 'dashboard' && 'Dashboard'}
              {tab === 'orcamento' && 'Novo Orçamento'}
              {tab === 'clientes' && 'Clientes'}
              {tab === 'financeiro' && 'Financeiro'}
              {tab === 'config' && 'Configurações'}
            </span>
          </header>
          <main className="flex-1 overflow-auto">
            {tab === 'dashboard' && <Dashboard onNewOrcamento={goToOrcamento} onEditOrcamento={goToEdit} />}
            {tab === 'orcamento' && (
              <OrcamentoWizard key={wizardKey} onDone={() => { setEditingOrcamento(null); setTab('dashboard'); }} editingOrcamento={editingOrcamento} />
            )}
            {tab === 'clientes' && <Clientes />}
            {tab === 'financeiro' && <Financeiro />}
            {tab === 'config' && <Configuracoes />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
