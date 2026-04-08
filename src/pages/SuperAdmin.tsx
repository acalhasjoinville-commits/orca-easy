import { useEffect, useRef, useState } from "react";
import { SuperAdminLayout, SATab } from "@/components/super-admin/SuperAdminLayout";
import { SuperAdminDashboard } from "@/components/super-admin/SuperAdminDashboard";
import { SuperAdminEmpresas } from "@/components/super-admin/SuperAdminEmpresas";
import { SuperAdminEmpresaDetail } from "@/components/super-admin/SuperAdminEmpresaDetail";
import { SuperAdminUsuarios } from "@/components/super-admin/SuperAdminUsuarios";
import { SuperAdminConvites } from "@/components/super-admin/SuperAdminConvites";
import { SuperAdminAuditoria } from "@/components/super-admin/SuperAdminAuditoria";
import { SuperAdminFaq } from "@/components/super-admin/SuperAdminFaq";
import { SuperAdminAparencia } from "@/components/super-admin/SuperAdminAparencia";
import { useAuth } from "@/hooks/useAuth";

const SUPER_ADMIN_SHELL_STORAGE_KEY = "orcacalhas:super-admin-shell:v1";
const RESTORABLE_SA_TABS: SATab[] = ["dashboard", "empresas", "usuarios", "convites", "auditoria", "faq", "aparencia"];

interface StoredSuperAdminState {
  tab?: SATab;
  selectedEmpresaId?: string | null;
}

function isRestorableSATab(value: string): value is SATab {
  return RESTORABLE_SA_TABS.includes(value as SATab);
}

export default function SuperAdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<SATab>("dashboard");
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null);
  const restoredUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user || restoredUserIdRef.current === user.id) return;

    restoredUserIdRef.current = user.id;

    try {
      const raw = sessionStorage.getItem(`${SUPER_ADMIN_SHELL_STORAGE_KEY}:${user.id}`);
      if (!raw) return;

      const parsed = JSON.parse(raw) as StoredSuperAdminState;
      const restoredTab = parsed.tab && isRestorableSATab(parsed.tab) ? parsed.tab : "dashboard";

      setTab(restoredTab);
      setSelectedEmpresaId(restoredTab === "empresas" ? (parsed.selectedEmpresaId ?? null) : null);
    } catch {
      setTab("dashboard");
      setSelectedEmpresaId(null);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const state: StoredSuperAdminState = {
      tab,
      selectedEmpresaId: tab === "empresas" ? selectedEmpresaId : null,
    };

    sessionStorage.setItem(`${SUPER_ADMIN_SHELL_STORAGE_KEY}:${user.id}`, JSON.stringify(state));
  }, [user, tab, selectedEmpresaId]);

  const handleSelectEmpresa = (id: string) => {
    setSelectedEmpresaId(id);
    setTab("empresas");
  };

  const content = (() => {
    if (tab === "empresas" && selectedEmpresaId) {
      return <SuperAdminEmpresaDetail empresaId={selectedEmpresaId} onBack={() => setSelectedEmpresaId(null)} />;
    }

    switch (tab) {
      case "dashboard":
        return <SuperAdminDashboard />;
      case "empresas":
        return <SuperAdminEmpresas onSelectEmpresa={handleSelectEmpresa} />;
      case "usuarios":
        return <SuperAdminUsuarios />;
      case "convites":
        return <SuperAdminConvites />;
      case "auditoria":
        return <SuperAdminAuditoria />;
      case "faq":
        return <SuperAdminFaq />;
      case "aparencia":
        return <SuperAdminAparencia />;
    }
  })();

  const handleNavigate = (newTab: SATab) => {
    setTab(newTab);
    if (newTab !== "empresas") setSelectedEmpresaId(null);
  };

  return (
    <SuperAdminLayout active={tab} onNavigate={handleNavigate}>
      {content}
    </SuperAdminLayout>
  );
}
