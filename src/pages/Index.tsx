import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar, Tab } from '@/components/AppSidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Dashboard } from '@/components/Dashboard';
import { OrcamentoWizard } from '@/components/OrcamentoWizard';
import { OrcamentoDetails } from '@/components/OrcamentoDetails';
import { Configuracoes } from '@/components/Configuracoes';
import { Clientes } from '@/components/Clientes';
import { Financeiro } from '@/components/Financeiro';
import { Orcamento } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOrcamentos, useClientes, useEmpresa } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

const Index = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [wizardKey, setWizardKey] = useState(0);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const isMobile = useIsMobile();

  const { deleteOrcamento } = useOrcamentos();
  const { clientes } = useClientes();
  const { empresa } = useEmpresa();

  const goToList = () => setTab('orcamentos');

  const goToNew = () => {
    setEditingOrcamento(null);
    setWizardKey(k => k + 1);
    setTab('orcamento-novo');
  };

  const goToDetails = (orc: Orcamento) => {
    setSelectedOrcamento(orc);
    setTab('orcamento-detalhes');
  };

  const goToEdit = (orc: Orcamento) => {
    setEditingOrcamento(orc);
    setWizardKey(k => k + 1);
    setTab('orcamento-novo');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOrcamento.mutateAsync(id);
      toast.success('Orçamento removido.');
      setTab('orcamentos');
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  const getHeaderLabel = () => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'orcamentos': return 'Orçamentos';
      case 'orcamento-detalhes': return 'Detalhes do Orçamento';
      case 'orcamento-novo': return editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento';
      case 'clientes': return 'Clientes';
      case 'financeiro': return 'Financeiro';
      case 'config': return 'Configurações';
      default: return '';
    }
  };

  const content = (
    <>
      {tab === 'dashboard' && <Dashboard onNewOrcamento={goToNew} onViewOrcamento={goToDetails} />}
      {tab === 'orcamentos' && <Dashboard onNewOrcamento={goToNew} onViewOrcamento={goToDetails} />}
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
        <OrcamentoWizard
          key={wizardKey}
          onDone={() => { setEditingOrcamento(null); setTab('orcamentos'); }}
          editingOrcamento={editingOrcamento}
        />
      )}
      {tab === 'clientes' && <Clientes />}
      {tab === 'financeiro' && <Financeiro />}
      {tab === 'config' && <Configuracoes />}
    </>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="h-12 flex items-center border-b bg-card px-4 sticky top-0 z-40">
          <span className="text-base font-bold text-primary">OrçaCalhas</span>
          <span className="ml-3 text-sm text-muted-foreground">{getHeaderLabel()}</span>
        </header>
        <main className="overflow-auto">{content}</main>
        <MobileBottomNav active={tab} onNavigate={setTab} onNewOrcamento={goToNew} />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar active={tab} onNavigate={setTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card px-4 shrink-0">
            <SidebarTrigger className="mr-3" />
            <span className="text-sm font-semibold text-muted-foreground">{getHeaderLabel()}</span>
          </header>
          <main className="flex-1 overflow-auto">{content}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
