import { useOrcamentos } from "@/hooks/useSupabaseData";
import { Orcamento, StatusOrcamento } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Search, Loader2, MoreVertical, Check, Eye, Pencil, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { FilaComercial } from "./FilaComercial";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrcamentosProps {
  onNewOrcamento: () => void;
  onViewOrcamento: (orc: Orcamento) => void;
  onEditOrcamento?: (orc: Orcamento) => void;
}

const ORCAMENTOS_VIEW_STORAGE_KEY = "orcacalhas:orcamentos-view:v2";

const statusConfig: Record<StatusOrcamento, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  aprovado: {
    label: "Aprovado",
    color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  rejeitado: { label: "Rejeitado", color: "bg-red-500/15 text-red-600 border-red-500/30" },
  executado: { label: "Executado", color: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30" },
  cancelado: { label: "Cancelado", color: "bg-gray-500/15 text-gray-600 border-gray-500/30" },
};

const allStatuses: StatusOrcamento[] = ["pendente", "aprovado", "rejeitado", "executado", "cancelado"];
const isStatusOrcamento = (value: string): value is StatusOrcamento => allStatuses.includes(value as StatusOrcamento);

const filterChips: { key: StatusOrcamento; label: string }[] = [
  { key: "pendente", label: "Pendentes" },
  { key: "aprovado", label: "Aprovados" },
  { key: "executado", label: "Executados" },
  { key: "rejeitado", label: "Rejeitados" },
  { key: "cancelado", label: "Cancelados" },
];

const statusPriority: Record<string, number> = {
  pendente: 0,
  aprovado: 1,
  executado: 2,
  rejeitado: 3,
  cancelado: 4,
};

const defaultActiveFilters = new Set<StatusOrcamento>(["pendente", "aprovado"]);

type OrcamentoActionTone = "critical" | "today" | "neutral" | "done" | "muted";

interface OrcamentoActionMeta {
  label: string;
  detail: string;
  tone: OrcamentoActionTone;
  rank: number;
}

interface StoredOrcamentosViewState {
  activeTab?: "lista" | "followup";
  search?: string;
  filters?: StatusOrcamento[];
}

const isDateOnlyValue = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const parseDateValue = (value: string | null | undefined) => {
  if (!value) return null;
  if (isDateOnlyValue(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getLocalDateKey = (value: string | null | undefined) => {
  if (!value) return null;
  if (isDateOnlyValue(value)) return value;

  const parsed = parseDateValue(value);
  if (!parsed) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fmtDate = (value: string | null | undefined, options?: Intl.DateTimeFormatOptions) => {
  const parsed = parseDateValue(value);
  if (!parsed) return "—";
  return parsed.toLocaleDateString("pt-BR", options ?? { day: "2-digit", month: "2-digit" });
};

const getOrcamentoAction = (orcamento: Orcamento, todayKey: string): OrcamentoActionMeta => {
  const previstaKey = getLocalDateKey(orcamento.dataPrevista);

  if (orcamento.status === "cancelado") {
    return {
      label: "Fluxo encerrado",
      detail: "Orçamento cancelado.",
      tone: "muted",
      rank: 8,
    };
  }

  if (orcamento.status === "rejeitado") {
    return {
      label: "Negociação encerrada",
      detail: "A proposta não avançou.",
      tone: "muted",
      rank: 7,
    };
  }

  if (orcamento.dataPagamento) {
    return {
      label: "Pagamento concluído",
      detail: `Recebido em ${fmtDate(orcamento.dataPagamento)}.`,
      tone: "done",
      rank: 6,
    };
  }

  if (orcamento.dataFaturamento && !orcamento.dataPagamento) {
    return {
      label: "Cobrar pagamento",
      detail: `Faturado em ${fmtDate(orcamento.dataFaturamento)} e aguardando baixa.`,
      tone: "critical",
      rank: 1,
    };
  }

  if (orcamento.status === "executado" && !orcamento.dataFaturamento) {
    return {
      label: "Faturar orçamento",
      detail: "Execução concluída e pronta para faturamento.",
      tone: "today",
      rank: 2,
    };
  }

  if (orcamento.status === "aprovado") {
    if (!previstaKey) {
      return {
        label: "Definir data prevista",
        detail: "O orçamento foi aprovado e ainda não entrou na agenda.",
        tone: "critical",
        rank: 0,
      };
    }

    if (previstaKey < todayKey) {
      return {
        label: "Reprogramar execução",
        detail: `A execução estava prevista para ${fmtDate(orcamento.dataPrevista)}.`,
        tone: "critical",
        rank: 0,
      };
    }

    if (previstaKey === todayKey) {
      return {
        label: "Executar hoje",
        detail: "A equipe deve atuar neste orçamento hoje.",
        tone: "today",
        rank: 1,
      };
    }

    return {
      label: "Acompanhar execução",
      detail: `Execução prevista para ${fmtDate(orcamento.dataPrevista)}.`,
      tone: "neutral",
      rank: 3,
    };
  }

  if (orcamento.status === "pendente") {
    return {
      label: "Acompanhar proposta",
      detail: "Negociação em aberto com o cliente.",
      tone: "neutral",
      rank: 4,
    };
  }

  return {
    label: "Sem ação imediata",
    detail: "Acompanhe a evolução conforme o status.",
    tone: "muted",
    rank: 5,
  };
};

const getActionToneClasses = (tone: OrcamentoActionTone) => {
  switch (tone) {
    case "critical":
      return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20";
    case "today":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
    case "done":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
    case "neutral":
      return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getPriorityTimestamp = (orcamento: Orcamento) =>
  parseDateValue(orcamento.dataPrevista)?.getTime() ??
  parseDateValue(orcamento.dataExecucao)?.getTime() ??
  parseDateValue(orcamento.dataFaturamento)?.getTime() ??
  parseDateValue(orcamento.dataPagamento)?.getTime() ??
  parseDateValue(orcamento.dataCriacao)?.getTime() ??
  0;

export function Orcamentos({ onNewOrcamento, onViewOrcamento, onEditOrcamento }: OrcamentosProps) {
  const { orcamentos, isLoading, updateOrcamento } = useOrcamentos();
  const { canCreateEditBudget, user } = useAuth();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<StatusOrcamento>>(new Set(defaultActiveFilters));
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingReject, setPendingReject] = useState<Orcamento | null>(null);
  const [activeTab, setActiveTab] = useState<"lista" | "followup">("lista");

  useEffect(() => {
    if (!user) return;
    try {
      const stored = sessionStorage.getItem(`${ORCAMENTOS_VIEW_STORAGE_KEY}:${user.id}`);
      if (!stored) return;

      if (stored === "lista" || stored === "followup") {
        setActiveTab(stored);
        return;
      }

      const parsed = JSON.parse(stored) as StoredOrcamentosViewState;
      if (parsed.activeTab === "lista" || parsed.activeTab === "followup") {
        setActiveTab(parsed.activeTab);
      }
      if (typeof parsed.search === "string") {
        setSearch(parsed.search);
      }
      if (Array.isArray(parsed.filters)) {
        setActiveFilters(new Set(parsed.filters.filter(isStatusOrcamento)));
      }
    } catch {
      // ignore sessionStorage restore failures
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try {
      const state: StoredOrcamentosViewState = {
        activeTab,
        search,
        filters: Array.from(activeFilters),
      };
      sessionStorage.setItem(`${ORCAMENTOS_VIEW_STORAGE_KEY}:${user.id}`, JSON.stringify(state));
    } catch {
      // ignore sessionStorage persistence failures
    }
  }, [user, activeTab, search, activeFilters]);
  const todayKey = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const allSelected = filterChips.every((f) => activeFilters.has(f.key));

  const toggleFilter = (status: StatusOrcamento) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setActiveFilters(new Set());
    else setActiveFilters(new Set(filterChips.map((f) => f.key)));
  };

  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleStatusChange = async (orc: Orcamento, newStatus: StatusOrcamento) => {
    if (newStatus === orc.status) return;
    if (newStatus === "rejeitado") {
      setPendingReject(orc);
      return;
    }
    await applyStatusChange(orc, newStatus);
  };

  const applyStatusChange = async (orc: Orcamento, newStatus: StatusOrcamento) => {
    if (updatingId) return;
    setUpdatingId(orc.id);
    try {
      await updateOrcamento.mutateAsync({ ...orc, status: newStatus });
      toast.success(`Status alterado para ${statusConfig[newStatus].label}.`, { duration: 2500 });
    } catch {
      toast.error("Erro ao alterar status.", { duration: 5000 });
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmReject = async () => {
    if (!pendingReject) return;
    await applyStatusChange(pendingReject, "rejeitado");
    setPendingReject(null);
  };

  const filtered = useMemo(() => {
    const showAll = activeFilters.size === 0;
    const result = orcamentos.filter((o) => {
      if (!showAll && !activeFilters.has(o.status as StatusOrcamento)) return false;
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        o.nomeCliente.toLowerCase().includes(q) ||
        String(o.numeroOrcamento ?? "").includes(q) ||
        formatCurrency(o.valorFinal).toLowerCase().includes(q)
      );
    });
    result.sort((a, b) => {
      const pa = statusPriority[a.status] ?? 99;
      const pb = statusPriority[b.status] ?? 99;
      if (pa !== pb) return pa - pb;

      const actionA = getOrcamentoAction(a, todayKey);
      const actionB = getOrcamentoAction(b, todayKey);
      if (actionA.rank !== actionB.rank) return actionA.rank - actionB.rank;

      const priorityTimeA = getPriorityTimestamp(a);
      const priorityTimeB = getPriorityTimestamp(b);
      if (priorityTimeA !== priorityTimeB) return priorityTimeA - priorityTimeB;

      return (parseDateValue(b.dataCriacao)?.getTime() ?? 0) - (parseDateValue(a.dataCriacao)?.getTime() ?? 0);
    });
    return result;
  }, [orcamentos, activeFilters, search, todayKey]);

  const groupedByStatus = useMemo(() => {
    const statusOrder: string[] = ["pendente", "aprovado", "executado", "rejeitado", "cancelado"];
    const groups: { status: string; label: string; items: typeof filtered }[] = [];
    for (const s of statusOrder) {
      const items = filtered.filter((o) => o.status === s);
      if (items.length > 0) {
        const label = statusConfig[s as StatusOrcamento]?.label ?? s;
        groups.push({ status: s, label: `${label}s`, items });
      }
    }
    const known = new Set(statusOrder);
    const rest = filtered.filter((o) => !known.has(o.status));
    if (rest.length > 0) groups.push({ status: "outros", label: "Outros", items: rest });
    return groups;
  }, [filtered]);

  const motorLabel = (mt?: string) => {
    if (mt === "motor1") return "M1";
    if (mt === "motor2") return "M2";
    return null;
  };

  const getRelevantDate = (o: Orcamento): { label: string; value: string } | null => {
    if (o.dataPagamento) return { label: "Pago", value: fmtDate(o.dataPagamento) };
    if (o.dataFaturamento) return { label: "Faturado", value: fmtDate(o.dataFaturamento) };
    if (o.dataExecucao) return { label: "Executado", value: fmtDate(o.dataExecucao) };
    if (o.dataPrevista) return { label: "Previsto", value: fmtDate(o.dataPrevista) };
    return null;
  };

  const renderStatusBadge = (o: Orcamento) => {
    const st = statusConfig[o.status ?? "pendente"];
    const isUpdating = updatingId === o.id;

    if (canCreateEditBudget) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button
              disabled={isUpdating}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-semibold border cursor-pointer transition-all",
                st.color,
                isUpdating && "opacity-50",
              )}
            >
              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin inline" /> : st.label}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px]" onClick={(e) => e.stopPropagation()}>
            {allStatuses.map((s) => (
              <DropdownMenuItem key={s} onClick={() => handleStatusChange(o, s)} className="text-xs gap-2">
                {s === o.status && <Check className="h-3 w-3" />}
                {s !== o.status && <span className="w-3" />}
                <span className={cn("rounded-full w-2 h-2 shrink-0", statusConfig[s].color.split(" ")[0])} />
                {statusConfig[s].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return <span className={cn("rounded-md px-2.5 py-1 text-[11px] font-semibold border", st.color)}>{st.label}</span>;
  };

  const renderRowActions = (o: Orcamento) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onViewOrcamento(o)} className="text-xs gap-2">
          <Eye className="h-3.5 w-3.5" /> Ver detalhes
        </DropdownMenuItem>
        {canCreateEditBudget && onEditOrcamento && (
          <DropdownMenuItem onClick={() => onEditOrcamento(o)} className="text-xs gap-2">
            <Pencil className="h-3.5 w-3.5" /> Editar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Summary stats
  const countByStatus = (s: StatusOrcamento) => orcamentos.filter((o) => o.status === s).length;
  const immediateActions = filtered.filter((orcamento) => getOrcamentoAction(orcamento, todayKey).rank <= 2).length;

  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {orcamentos.length > 0
              ? `${orcamentos.length} orçamento${orcamentos.length > 1 ? "s" : ""} · ${countByStatus("pendente")} pendente${countByStatus("pendente") !== 1 ? "s" : ""} · ${countByStatus("aprovado")} aprovado${countByStatus("aprovado") !== 1 ? "s" : ""}`
              : "Crie e acompanhe seus orçamentos de calhas e rufos"}
          </p>
        </div>
        {canCreateEditBudget && orcamentos.length > 0 && (
          <Button onClick={onNewOrcamento} size="sm" className="hidden sm:flex gap-1.5">
            <Plus className="h-4 w-4" /> Novo Orçamento
          </Button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 mb-4 border-b border-border">
        <button
          onClick={() => setActiveTab("lista")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "lista"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <FileText className="h-3.5 w-3.5 inline mr-1.5" />
          Lista
        </button>
        <button
          onClick={() => setActiveTab("followup")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "followup"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <MessageCircle className="h-3.5 w-3.5 inline mr-1.5" />
          Acompanhamento comercial
        </button>
      </div>

      {activeTab === "followup" ? (
        <FilaComercial onViewOrcamento={onViewOrcamento} orcamentos={orcamentos} />
      ) : (
        <>
          <Card className="mb-4 border-dashed bg-muted/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Visão operacional dos orçamentos</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A lista destaca o próximo passo de cada orçamento para facilitar agenda, execução, faturamento e
                    cobrança.
                  </p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    {immediateActions > 0
                      ? `${immediateActions} orçamento${immediateActions > 1 ? "s" : ""} pedem ação prioritária agora.`
                      : "Nenhum orçamento exige ação imediata neste momento."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {orcamentos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <FileText className="h-8 w-8 text-primary/40" />
                </div>
                <h2 className="mb-1.5 text-lg font-semibold text-foreground">Nenhum orçamento criado</h2>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground leading-relaxed">
                  {canCreateEditBudget
                    ? "Comece criando seu primeiro orçamento. O sistema calcula automaticamente materiais, insumos e valores de venda."
                    : "Ainda não há orçamentos cadastrados. Entre em contato com o responsável para criar novos orçamentos."}
                </p>
                {canCreateEditBudget && (
                  <Button onClick={onNewOrcamento} className="gap-2">
                    <Plus className="h-4 w-4" /> Criar Primeiro Orçamento
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Toolbar */}
              <Card>
                <CardContent className="p-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por cliente, número ou valor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 bg-background"
                      />
                    </div>
                    {canCreateEditBudget && (
                      <Button onClick={onNewOrcamento} size="sm" className="sm:hidden shrink-0 h-9 gap-1.5">
                        <Plus className="h-4 w-4" /> Novo
                      </Button>
                    )}
                  </div>

                  {/* Filter chips */}
                  <div className="flex gap-1.5 overflow-x-auto pt-3 -mx-1 px-1 scrollbar-none">
                    <button
                      onClick={toggleAll}
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium border transition-colors",
                        allSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:bg-muted",
                      )}
                    >
                      Todos
                    </button>
                    {filterChips.map((f) => {
                      const isActive = activeFilters.has(f.key);
                      const count = countByStatus(f.key);
                      return (
                        <button
                          key={f.key}
                          onClick={() => toggleFilter(f.key)}
                          className={cn(
                            "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium border transition-colors",
                            isActive
                              ? statusConfig[f.key].color
                              : "bg-background text-muted-foreground border-border hover:bg-muted",
                          )}
                        >
                          {f.label} {count > 0 && <span className="ml-0.5 opacity-70">({count})</span>}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Desktop: Table view */}
              {!isMobile ? (
                <div className="space-y-5">
                  {groupedByStatus.map((group) => (
                    <div key={group.status}>
                      <div className="flex items-center gap-2.5 pb-2">
                        <span
                          className={cn(
                            "text-[11px] font-bold uppercase tracking-wider",
                            statusConfig[group.status as StatusOrcamento]?.color.split(" ")[1] ??
                              "text-muted-foreground",
                          )}
                        >
                          {group.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium bg-muted rounded-full px-2 py-0.5">
                          {group.items.length}
                        </span>
                        <div className="flex-1 h-px bg-border/60" />
                      </div>
                      <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground uppercase tracking-wide">
                                <th className="py-2.5 px-3 font-semibold w-16">#</th>
                                <th className="py-2.5 px-3 font-semibold">Cliente</th>
                                <th className="py-2.5 px-3 font-semibold w-24">Status</th>
                                <th className="py-2.5 px-3 font-semibold w-[260px]">Próxima ação</th>
                                <th className="py-2.5 px-3 font-semibold text-right w-28">Valor</th>
                                <th className="py-2.5 px-3 font-semibold w-20 text-center">Criação</th>
                                <th className="py-2.5 px-3 font-semibold w-20 text-center">Previsto</th>
                                <th className="py-2.5 px-3 font-semibold w-20 text-center">Execução</th>
                                <th className="py-2.5 px-3 font-semibold w-20 text-center">Faturado</th>
                                <th className="py-2.5 px-3 font-semibold w-20 text-center">Pago</th>
                                <th className="py-2.5 px-3 font-semibold w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.items.map((o) => {
                                const displayValue =
                                  (o.desconto ?? 0) > 0 ? (o.valorFinal ?? o.valorVenda) : o.valorVenda;
                                const motor = motorLabel(o.motorType);
                                const action = getOrcamentoAction(o, todayKey);
                                return (
                                  <tr
                                    key={o.id}
                                    className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors group"
                                    onClick={() => onViewOrcamento(o)}
                                  >
                                    <td className="py-3 px-3 font-bold text-primary text-sm">
                                      #{o.numeroOrcamento ?? "—"}
                                    </td>
                                    <td className="py-3 px-3">
                                      <span className="font-medium text-foreground truncate block max-w-[200px]">
                                        {o.nomeCliente}
                                      </span>
                                      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                        <span>
                                          {o.itensServico.length} {o.itensServico.length === 1 ? "serviço" : "serviços"}
                                        </span>
                                        {motor && (
                                          <>
                                            <span>•</span>
                                            <span className="font-semibold">{motor}</span>
                                          </>
                                        )}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3">{renderStatusBadge(o)}</td>
                                    <td className="py-3 px-3">
                                      <div className="space-y-1">
                                        <span
                                          className={cn(
                                            "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                                            getActionToneClasses(action.tone),
                                          )}
                                        >
                                          {action.label}
                                        </span>
                                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                                          {action.detail}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="py-3 px-3 text-right font-bold tabular-nums text-foreground">
                                      {formatCurrency(displayValue)}
                                    </td>
                                    <td className="py-3 px-3 text-center text-xs text-muted-foreground tabular-nums">
                                      {fmtDate(o.dataCriacao)}
                                    </td>
                                    <td className="py-3 px-3 text-center text-xs tabular-nums">
                                      <span
                                        className={
                                          o.dataPrevista ? "text-foreground font-medium" : "text-muted-foreground"
                                        }
                                      >
                                        {fmtDate(o.dataPrevista)}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-center text-xs tabular-nums">
                                      <span
                                        className={
                                          o.dataExecucao
                                            ? "text-blue-600 dark:text-blue-400 font-medium"
                                            : "text-muted-foreground"
                                        }
                                      >
                                        {fmtDate(o.dataExecucao)}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-center text-xs tabular-nums">
                                      <span
                                        className={
                                          o.dataFaturamento
                                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                            : "text-muted-foreground"
                                        }
                                      >
                                        {fmtDate(o.dataFaturamento)}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-center text-xs tabular-nums">
                                      <span
                                        className={
                                          o.dataPagamento
                                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                            : "text-muted-foreground"
                                        }
                                      >
                                        {fmtDate(o.dataPagamento)}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                      {renderRowActions(o)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                /* Mobile: Cards view */
                <div>
                  {groupedByStatus.map((group) => (
                    <div key={group.status}>
                      <div className="flex items-center gap-2.5 pt-3 pb-2">
                        <span
                          className={cn(
                            "text-[11px] font-bold uppercase tracking-wider",
                            statusConfig[group.status as StatusOrcamento]?.color.split(" ")[1] ??
                              "text-muted-foreground",
                          )}
                        >
                          {group.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium bg-muted rounded-full px-2 py-0.5">
                          {group.items.length}
                        </span>
                        <div className="flex-1 h-px bg-border/60" />
                      </div>
                      <div className="space-y-2">
                        {group.items.map((o) => {
                          const displayValue = (o.desconto ?? 0) > 0 ? (o.valorFinal ?? o.valorVenda) : o.valorVenda;
                          const relevantDate = getRelevantDate(o);
                          const action = getOrcamentoAction(o, todayKey);
                          const motor = motorLabel(o.motorType);
                          return (
                            <Card
                              key={o.id}
                              className="overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/20 transition-all"
                              onClick={() => onViewOrcamento(o)}
                            >
                              <CardContent className="p-3.5">
                                {/* Row 1: number + status + value */}
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-bold text-primary shrink-0">
                                    #{o.numeroOrcamento ?? "—"}
                                  </span>
                                  {renderStatusBadge(o)}
                                  <span className="flex-1" />
                                  <p className="text-base font-bold text-foreground shrink-0 tabular-nums">
                                    {formatCurrency(displayValue)}
                                  </p>
                                </div>
                                {/* Row 2: client + actions */}
                                <div className="flex items-center justify-between mb-1.5">
                                  <p className="text-sm font-medium text-foreground truncate flex-1 mr-2">
                                    {o.nomeCliente}
                                  </p>
                                  {renderRowActions(o)}
                                </div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <span
                                    className={cn(
                                      "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                                      getActionToneClasses(action.tone),
                                    )}
                                  >
                                    {action.label}
                                  </span>
                                  {motor && (
                                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                                      {motor}
                                    </span>
                                  )}
                                </div>
                                <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
                                  {action.detail}
                                </p>
                                {/* Row 3: dates + services count */}
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap pt-1.5 border-t border-border/50">
                                  <span>
                                    {fmtDate(o.dataCriacao, { day: "2-digit", month: "2-digit", year: "numeric" })}
                                  </span>
                                  {relevantDate && (
                                    <>
                                      <span className="text-border">•</span>
                                      <span className="font-medium">
                                        {relevantDate.label}: {relevantDate.value}
                                      </span>
                                    </>
                                  )}
                                  <span className="ml-auto text-[10px]">
                                    {o.itensServico.length} {o.itensServico.length === 1 ? "serviço" : "serviços"}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filtered.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">Nenhum orçamento encontrado</p>
                    <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
                      Tente ajustar os filtros ou buscar por outro termo.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Rejection confirmation dialog */}
          <AlertDialog
            open={!!pendingReject}
            onOpenChange={(open) => {
              if (!open) setPendingReject(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Marcar como Rejeitado?</AlertDialogTitle>
                <AlertDialogDescription>
                  Deseja marcar o orçamento <strong>#{pendingReject?.numeroOrcamento}</strong> como rejeitado?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmReject}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Rejeitar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
