import { useState } from 'react';
import { SuperAdminLayout, SATab } from '@/components/super-admin/SuperAdminLayout';
import { SuperAdminDashboard } from '@/components/super-admin/SuperAdminDashboard';
import { SuperAdminEmpresas } from '@/components/super-admin/SuperAdminEmpresas';
import { SuperAdminEmpresaDetail } from '@/components/super-admin/SuperAdminEmpresaDetail';
import { SuperAdminUsuarios } from '@/components/super-admin/SuperAdminUsuarios';
import { SuperAdminConvites } from '@/components/super-admin/SuperAdminConvites';
import { SuperAdminAuditoria } from '@/components/super-admin/SuperAdminAuditoria';

export default function SuperAdminPage() {
  const [tab, setTab] = useState<SATab>('dashboard');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null);

  const handleSelectEmpresa = (id: string) => {
    setSelectedEmpresaId(id);
    setTab('empresas'); // stay on empresas tab but show detail
  };

  const content = (() => {
    if (tab === 'empresas' && selectedEmpresaId) {
      return <SuperAdminEmpresaDetail empresaId={selectedEmpresaId} onBack={() => setSelectedEmpresaId(null)} />;
    }
    switch (tab) {
      case 'dashboard': return <SuperAdminDashboard />;
      case 'empresas': return <SuperAdminEmpresas onSelectEmpresa={handleSelectEmpresa} />;
      case 'usuarios': return <SuperAdminUsuarios />;
      case 'convites': return <SuperAdminConvites />;
      case 'auditoria': return <SuperAdminAuditoria />;
    }
  })();

  const handleNavigate = (newTab: SATab) => {
    setTab(newTab);
    if (newTab !== 'empresas') setSelectedEmpresaId(null);
  };

  return (
    <SuperAdminLayout active={tab} onNavigate={handleNavigate}>
      {content}
    </SuperAdminLayout>
  );
}
