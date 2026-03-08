import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { Dashboard } from '@/components/Dashboard';
import { OrcamentoWizard } from '@/components/OrcamentoWizard';
import { Configuracoes } from '@/components/Configuracoes';

type Tab = 'dashboard' | 'orcamento' | 'config';

const Index = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [wizardKey, setWizardKey] = useState(0);

  const goToOrcamento = () => {
    setWizardKey(k => k + 1);
    setTab('orcamento');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg">
        {tab === 'dashboard' && <Dashboard onNewOrcamento={goToOrcamento} />}
        {tab === 'orcamento' && (
          <OrcamentoWizard key={wizardKey} onDone={() => setTab('dashboard')} />
        )}
        {tab === 'config' && <Configuracoes />}
      </div>
      <BottomNav active={tab} onNavigate={setTab} />
    </div>
  );
};

export default Index;
