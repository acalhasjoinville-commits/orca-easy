import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { Dashboard } from '@/components/Dashboard';
import { OrcamentoWizard } from '@/components/OrcamentoWizard';
import { Configuracoes } from '@/components/Configuracoes';
import { Clientes } from '@/components/Clientes';
import { Orcamento } from '@/lib/types';

type Tab = 'dashboard' | 'orcamento' | 'clientes' | 'config';

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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg">
        {tab === 'dashboard' && <Dashboard onNewOrcamento={goToOrcamento} onEditOrcamento={goToEdit} />}
        {tab === 'orcamento' && (
          <OrcamentoWizard key={wizardKey} onDone={() => { setEditingOrcamento(null); setTab('dashboard'); }} editingOrcamento={editingOrcamento} />
        )}
        {tab === 'clientes' && <Clientes />}
        {tab === 'config' && <Configuracoes />}
      </div>
      <BottomNav active={tab} onNavigate={setTab} />
    </div>
  );
};

export default Index;
