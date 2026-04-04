import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { c as createLucideIcon, g as useIsMobile, e as LoaderCircle, U as Users, a as cn, I as Input, B as Button, f as useOrcamentos, u as useAuth, P as Plus, F as FileText, d as ue } from "./index-BN5a_yey.js";
import { C as Card, a as CardContent } from "./card-B4K8qJaR.js";
import { u as useFilaComercial, M as MessageCircle } from "./useFollowUp-BXp-Mmrm.js";
import { S as STATUS_FOLLOWUP_CONFIG } from "./types-DSYQLPIT.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, B as Badge } from "./select-DQUVPZUM.js";
import { C as CalendarDays } from "./calendar-days-3Dqi55VX.js";
import { T as TriangleAlert } from "./triangle-alert-B8cOOzjo.js";
import { C as Clock } from "./clock-h-zti0qz.js";
import { S as Search } from "./search-CUbuJP2V.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem, E as EllipsisVertical } from "./dropdown-menu-Cw3zSzm8.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction, P as Pencil } from "./alert-dialog-C9g92JDz.js";
import { C as Check } from "./check-D0l1wUju.js";
import "./charts-vendor-BrW5ULH7.js";
import "./radix-vendor-CEzLCFk2.js";
import "./pdf-vendor-Dv6cUxDn.js";
import "./query-vendor-BLvK6anV.js";
import "./router-vendor-CCo6OTFM.js";
import "./supabase-vendor-BsjcsmU5.js";
import "./chevron-right-DibYopn_.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Eye = createLucideIcon("Eye", [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
]);
const allStatuses$1 = Object.keys(STATUS_FOLLOWUP_CONFIG);
const fmtDate$1 = (dateValue) => {
  if (!dateValue) return "Sem data";
  return new Date(dateValue).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  });
};
const formatCurrency = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
function getDayTimestamp(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
function getPriorityRank(item, todayTs) {
  const retornoTs = getDayTimestamp(item.dataRetorno);
  if (retornoTs !== null) {
    if (retornoTs < todayTs && item.statusFollowUp !== "concluido") return 0;
    if (retornoTs === todayTs) return 1;
    return 3;
  }
  if (item.statusFollowUp === "sem_retorno") return 2;
  return 4;
}
function compareByPriority(a, b, todayTs) {
  const rankA = getPriorityRank(a, todayTs);
  const rankB = getPriorityRank(b, todayTs);
  if (rankA !== rankB) return rankA - rankB;
  const retornoA = getDayTimestamp(a.dataRetorno);
  const retornoB = getDayTimestamp(b.dataRetorno);
  if (retornoA !== null && retornoB !== null && retornoA !== retornoB) {
    return retornoA - retornoB;
  }
  const createdA = new Date(a.dataCriacao).getTime();
  const createdB = new Date(b.dataCriacao).getTime();
  if (rankA === 2) {
    return createdA - createdB;
  }
  return createdB - createdA;
}
function getRetornoLabel(item) {
  if (item.dataRetorno) return fmtDate$1(item.dataRetorno);
  if (item.statusFollowUp === "sem_retorno") return "Sem agenda";
  return "Nao agendado";
}
function FilaComercial({ onViewOrcamento, orcamentos }) {
  const { data: items, isLoading } = useFilaComercial();
  const isMobile = useIsMobile();
  const [search, setSearch] = reactExports.useState("");
  const [filterStatus, setFilterStatus] = reactExports.useState("all");
  const [filterResponsavel, setFilterResponsavel] = reactExports.useState("all");
  const [sortBy, setSortBy] = reactExports.useState("prioridade");
  const todayTs = reactExports.useMemo(() => {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  }, []);
  const kpis = reactExports.useMemo(() => {
    if (!items) {
      return {
        semRetorno: 0,
        hoje: 0,
        atrasados: 0,
        emNegociacao: 0,
        aguardando: 0
      };
    }
    let semRetorno = 0;
    let hoje = 0;
    let atrasados = 0;
    let emNegociacao = 0;
    let aguardando = 0;
    for (const item of items) {
      if (item.statusFollowUp === "sem_retorno") semRetorno++;
      if (item.statusFollowUp === "em_negociacao") emNegociacao++;
      if (item.statusFollowUp === "aguardando_cliente") aguardando++;
      if (item.dataRetorno) {
        const retornoTs = getDayTimestamp(item.dataRetorno);
        if (retornoTs === todayTs) hoje++;
        else if (retornoTs !== null && retornoTs < todayTs && item.statusFollowUp !== "concluido") {
          atrasados++;
        }
      }
    }
    return { semRetorno, hoje, atrasados, emNegociacao, aguardando };
  }, [items, todayTs]);
  const responsaveis = reactExports.useMemo(() => {
    if (!items) return [];
    const names = /* @__PURE__ */ new Set();
    for (const item of items) {
      if (item.responsavelNome) names.add(item.responsavelNome);
    }
    return Array.from(names).sort();
  }, [items]);
  const filtered = reactExports.useMemo(() => {
    if (!items) return [];
    let result = [...items];
    if (filterStatus === "all") {
      result = result.filter((item) => item.statusFollowUp !== "concluido");
    } else {
      result = result.filter((item) => item.statusFollowUp === filterStatus);
    }
    if (filterResponsavel !== "all") {
      result = result.filter((item) => item.responsavelNome === filterResponsavel);
    }
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter(
        (item) => item.nomeCliente.toLowerCase().includes(query) || String(item.numeroOrcamento).includes(query)
      );
    }
    result.sort((a, b) => {
      if (sortBy === "prioridade") {
        return compareByPriority(a, b, todayTs);
      }
      return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
    });
    return result;
  }, [filterResponsavel, filterStatus, items, search, sortBy, todayTs]);
  const handleView = (item) => {
    const orcamento = orcamentos.find((orc) => orc.id === item.orcamentoId);
    if (orcamento) onViewOrcamento(orcamento);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-5", children: [
      { label: "Sem retorno", value: kpis.semRetorno, icon: MessageCircle, color: "text-gray-600" },
      { label: "Retorno hoje", value: kpis.hoje, icon: CalendarDays, color: "text-blue-600" },
      { label: "Atrasados", value: kpis.atrasados, icon: TriangleAlert, color: "text-destructive" },
      { label: "Em negociacao", value: kpis.emNegociacao, icon: Users, color: "text-amber-600" },
      { label: "Aguardando", value: kpis.aguardando, icon: Clock, color: "text-purple-600" }
    ].map((kpi) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center gap-2.5 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(kpi.icon, { className: cn("h-4 w-4 shrink-0", kpi.color) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold leading-none text-foreground", children: kpi.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: kpi.label })
      ] })
    ] }) }, kpi.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Buscar por cliente ou numero...",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "h-9 bg-background pl-9 text-xs"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-full text-xs sm:w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status follow-up" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", className: "text-xs", children: "Todos (exceto concluido)" }),
            allStatuses$1.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: status, className: "text-xs", children: STATUS_FOLLOWUP_CONFIG[status].label }, status))
          ] })
        ] }),
        responsaveis.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterResponsavel, onValueChange: setFilterResponsavel, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-full text-xs sm:w-[170px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Responsavel" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", className: "text-xs", children: "Todos" }),
            responsaveis.map((responsavel) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: responsavel, className: "text-xs", children: responsavel }, responsavel))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sortBy, onValueChange: (value) => setSortBy(value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-full text-xs sm:w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "prioridade", className: "text-xs", children: "Prioridade comercial" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "data_criacao", className: "text-xs", children: "Mais recentes" })
          ] })
        ] })
      ] }),
      sortBy === "prioridade" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[11px] text-muted-foreground", children: "A ordem padrao destaca atrasados, retornos de hoje e orcamentos que ainda nao receberam acompanhamento." })
    ] }) }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mb-3 h-8 w-8 text-muted-foreground/30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Nenhum orcamento na fila" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground/70", children: "Ajuste os filtros para ver mais resultados." })
    ] }) }) : !isMobile ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-16 px-3 py-2.5 font-semibold", children: "#" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 font-semibold", children: "Cliente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-32 px-3 py-2.5 font-semibold", children: "Follow-up" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-28 px-3 py-2.5 text-right font-semibold", children: "Valor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-28 px-3 py-2.5 font-semibold", children: "Retorno" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-32 px-3 py-2.5 font-semibold", children: "Responsavel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-32 px-3 py-2.5 font-semibold", children: "Ultima interacao" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-10 px-3 py-2.5 font-semibold" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((item) => {
        const statusConfig2 = STATUS_FOLLOWUP_CONFIG[item.statusFollowUp];
        const retornoTs = getDayTimestamp(item.dataRetorno);
        const isOverdue = retornoTs !== null && retornoTs < todayTs && item.statusFollowUp !== "concluido";
        const isToday = retornoTs !== null && retornoTs === todayTs;
        const needsFirstTouch = !item.dataRetorno && item.statusFollowUp === "sem_retorno";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            className: "cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/30",
            onClick: () => handleView(item),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 text-sm font-bold text-primary", children: [
                "#",
                item.numeroOrcamento
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "max-w-[200px] truncate px-3 py-3 font-medium text-foreground", children: item.nomeCliente }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cn("text-[10px]", statusConfig2.color), children: statusConfig2.label }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right font-bold tabular-nums", children: formatCurrency(item.valorFinal) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs tabular-nums", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: cn(
                    isOverdue && "font-semibold text-destructive",
                    isToday && "font-semibold text-amber-600",
                    needsFirstTouch && "font-semibold text-amber-700",
                    !isOverdue && !isToday && !needsFirstTouch && "text-muted-foreground"
                  ),
                  children: [
                    getRetornoLabel(item),
                    isOverdue && " (atrasado)",
                    isToday && " (hoje)",
                    needsFirstTouch && " (primeiro contato)"
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs text-muted-foreground", children: item.responsavelNome || "Sem responsavel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs tabular-nums text-muted-foreground", children: item.ultimaInteracaoEm ? fmtDate$1(item.ultimaInteracaoEm) : "Sem historico" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 w-7 p-0",
                  onClick: (event) => {
                    event.stopPropagation();
                    handleView(item);
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" })
                }
              ) })
            ]
          },
          item.orcamentoId
        );
      }) })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filtered.map((item) => {
      const statusConfig2 = STATUS_FOLLOWUP_CONFIG[item.statusFollowUp];
      const retornoTs = getDayTimestamp(item.dataRetorno);
      const isOverdue = retornoTs !== null && retornoTs < todayTs && item.statusFollowUp !== "concluido";
      const isToday = retornoTs !== null && retornoTs === todayTs;
      const needsFirstTouch = !item.dataRetorno && item.statusFollowUp === "sem_retorno";
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: "cursor-pointer transition-all hover:shadow-md",
          onClick: () => handleView(item),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-primary", children: [
                "#",
                item.numeroOrcamento
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cn("text-[10px]", statusConfig2.color), children: statusConfig2.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold tabular-nums text-foreground", children: formatCurrency(item.valorFinal) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1.5 truncate text-sm font-medium text-foreground", children: item.nomeCliente }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border-t border-border/50 pt-1.5 text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: cn(
                    isOverdue && "font-medium text-destructive",
                    isToday && "font-medium text-amber-600",
                    needsFirstTouch && "font-medium text-amber-700"
                  ),
                  children: [
                    "Retorno: ",
                    getRetornoLabel(item),
                    isOverdue && " (atrasado)",
                    isToday && " (hoje)",
                    needsFirstTouch && " (primeiro contato)"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.responsavelNome || "Sem responsavel" })
            ] })
          ] })
        },
        item.orcamentoId
      );
    }) })
  ] });
}
const statusConfig = {
  pendente: { label: "Pendente", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  aprovado: {
    label: "Aprovado",
    color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
  },
  rejeitado: { label: "Rejeitado", color: "bg-red-500/15 text-red-600 border-red-500/30" },
  executado: { label: "Executado", color: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30" },
  cancelado: { label: "Cancelado", color: "bg-gray-500/15 text-gray-600 border-gray-500/30" }
};
const allStatuses = ["pendente", "aprovado", "rejeitado", "executado", "cancelado"];
const filterChips = [
  { key: "pendente", label: "Pendentes" },
  { key: "aprovado", label: "Aprovados" },
  { key: "executado", label: "Executados" },
  { key: "rejeitado", label: "Rejeitados" },
  { key: "cancelado", label: "Cancelados" }
];
const statusPriority = {
  pendente: 0,
  aprovado: 1,
  executado: 2,
  rejeitado: 3,
  cancelado: 4
};
const defaultActiveFilters = /* @__PURE__ */ new Set(["pendente", "aprovado"]);
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};
function Orcamentos({ onNewOrcamento, onViewOrcamento, onEditOrcamento }) {
  const { orcamentos, isLoading, updateOrcamento } = useOrcamentos();
  const { canCreateEditBudget } = useAuth();
  const isMobile = useIsMobile();
  const [search, setSearch] = reactExports.useState("");
  const [activeFilters, setActiveFilters] = reactExports.useState(new Set(defaultActiveFilters));
  const [updatingId, setUpdatingId] = reactExports.useState(null);
  const [pendingReject, setPendingReject] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState("lista");
  const allSelected = filterChips.every((f) => activeFilters.has(f.key));
  const toggleFilter = (status) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };
  const toggleAll = () => {
    if (allSelected) setActiveFilters(/* @__PURE__ */ new Set());
    else setActiveFilters(new Set(filterChips.map((f) => f.key)));
  };
  const formatCurrency2 = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const handleStatusChange = async (orc, newStatus) => {
    if (newStatus === orc.status) return;
    if (newStatus === "rejeitado") {
      setPendingReject(orc);
      return;
    }
    await applyStatusChange(orc, newStatus);
  };
  const applyStatusChange = async (orc, newStatus) => {
    if (updatingId) return;
    setUpdatingId(orc.id);
    try {
      await updateOrcamento.mutateAsync({ ...orc, status: newStatus });
      ue.success(`Status alterado para ${statusConfig[newStatus].label}.`, { duration: 2500 });
    } catch {
      ue.error("Erro ao alterar status.", { duration: 5e3 });
    } finally {
      setUpdatingId(null);
    }
  };
  const confirmReject = async () => {
    if (!pendingReject) return;
    await applyStatusChange(pendingReject, "rejeitado");
    setPendingReject(null);
  };
  const filtered = reactExports.useMemo(() => {
    const showAll = activeFilters.size === 0;
    const result = orcamentos.filter((o) => {
      if (!showAll && !activeFilters.has(o.status)) return false;
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return o.nomeCliente.toLowerCase().includes(q) || String(o.numeroOrcamento ?? "").includes(q) || formatCurrency2(o.valorFinal).toLowerCase().includes(q);
    });
    result.sort((a, b) => {
      const pa = statusPriority[a.status] ?? 99;
      const pb = statusPriority[b.status] ?? 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
    });
    return result;
  }, [orcamentos, activeFilters, search]);
  const groupedByStatus = reactExports.useMemo(() => {
    var _a;
    const statusOrder = ["pendente", "aprovado", "executado", "rejeitado", "cancelado"];
    const groups = [];
    for (const s of statusOrder) {
      const items = filtered.filter((o) => o.status === s);
      if (items.length > 0) {
        const label = ((_a = statusConfig[s]) == null ? void 0 : _a.label) ?? s;
        groups.push({ status: s, label: `${label}s`, items });
      }
    }
    const known = new Set(statusOrder);
    const rest = filtered.filter((o) => !known.has(o.status));
    if (rest.length > 0) groups.push({ status: "outros", label: "Outros", items: rest });
    return groups;
  }, [filtered]);
  const motorLabel = (mt) => {
    if (mt === "motor1") return "M1";
    if (mt === "motor2") return "M2";
    return null;
  };
  const getRelevantDate = (o) => {
    if (o.dataPagamento) return { label: "Pago", value: fmtDate(o.dataPagamento) };
    if (o.dataFaturamento) return { label: "Faturado", value: fmtDate(o.dataFaturamento) };
    if (o.dataExecucao) return { label: "Executado", value: fmtDate(o.dataExecucao) };
    if (o.dataPrevista) return { label: "Previsto", value: fmtDate(o.dataPrevista) };
    return null;
  };
  const renderStatusBadge = (o) => {
    const st = statusConfig[o.status ?? "pendente"];
    const isUpdating = updatingId === o.id;
    if (canCreateEditBudget) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            disabled: isUpdating,
            className: cn(
              "rounded-md px-2.5 py-1 text-[11px] font-semibold border cursor-pointer transition-all",
              st.color,
              isUpdating && "opacity-50"
            ),
            children: isUpdating ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin inline" }) : st.label
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "start", className: "min-w-[140px]", onClick: (e) => e.stopPropagation(), children: allStatuses.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleStatusChange(o, s), className: "text-xs gap-2", children: [
          s === o.status && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
          s !== o.status && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("rounded-full w-2 h-2 shrink-0", statusConfig[s].color.split(" ")[0]) }),
          statusConfig[s].label
        ] }, s)) })
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("rounded-md px-2.5 py-1 text-[11px] font-semibold border", st.color), children: st.label });
  };
  const renderRowActions = (o) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "h-4 w-4" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "min-w-[140px]", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => onViewOrcamento(o), className: "text-xs gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
        " Ver detalhes"
      ] }),
      canCreateEditBudget && onEditOrcamento && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => onEditOrcamento(o), className: "text-xs gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
        " Editar"
      ] })
    ] })
  ] });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }) });
  }
  const countByStatus = (s) => orcamentos.filter((o) => o.status === s).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 lg:px-6 pb-24 lg:pb-8 pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-foreground", children: "Orçamentos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: orcamentos.length > 0 ? `${orcamentos.length} orçamento${orcamentos.length > 1 ? "s" : ""} · ${countByStatus("pendente")} pendente${countByStatus("pendente") !== 1 ? "s" : ""} · ${countByStatus("aprovado")} aprovado${countByStatus("aprovado") !== 1 ? "s" : ""}` : "Crie e acompanhe seus orçamentos de calhas e rufos" })
      ] }),
      canCreateEditBudget && orcamentos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onNewOrcamento, size: "sm", className: "hidden sm:flex gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Novo Orçamento"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mb-4 border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab("lista"),
          className: cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "lista" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 inline mr-1.5" }),
            "Lista"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab("followup"),
          className: cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "followup" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3.5 w-3.5 inline mr-1.5" }),
            "Follow-up"
          ]
        }
      )
    ] }),
    activeTab === "followup" ? /* @__PURE__ */ jsxRuntimeExports.jsx(FilaComercial, { onViewOrcamento, orcamentos }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4 border-dashed bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Visão operacional dos orçamentos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Acompanhe o que ainda está pendente, o que já foi aprovado e quais propostas já avançaram para execução, faturamento ou pagamento." })
        ] })
      ] }) }) }),
      orcamentos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center justify-center py-20 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 text-primary/40" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-1.5 text-lg font-semibold text-foreground", children: "Nenhum orçamento criado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 max-w-sm text-sm text-muted-foreground leading-relaxed", children: canCreateEditBudget ? "Comece criando seu primeiro orçamento. O sistema calcula automaticamente materiais, insumos e valores de venda." : "Ainda não há orçamentos cadastrados. Entre em contato com o responsável para criar novos orçamentos." }),
        canCreateEditBudget && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onNewOrcamento, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " Criar Primeiro Orçamento"
        ] })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Buscar por cliente, número ou valor...",
                  value: search,
                  onChange: (e) => setSearch(e.target.value),
                  className: "pl-9 h-9 bg-background"
                }
              )
            ] }),
            canCreateEditBudget && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onNewOrcamento, size: "sm", className: "sm:hidden shrink-0 h-9 gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              " Novo"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 overflow-x-auto pt-3 -mx-1 px-1 scrollbar-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: toggleAll,
                className: cn(
                  "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium border transition-colors",
                  allSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:bg-muted"
                ),
                children: "Todos"
              }
            ),
            filterChips.map((f) => {
              const isActive = activeFilters.has(f.key);
              const count = countByStatus(f.key);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => toggleFilter(f.key),
                  className: cn(
                    "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium border transition-colors",
                    isActive ? statusConfig[f.key].color : "bg-background text-muted-foreground border-border hover:bg-muted"
                  ),
                  children: [
                    f.label,
                    " ",
                    count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-0.5 opacity-70", children: [
                      "(",
                      count,
                      ")"
                    ] })
                  ]
                },
                f.key
              );
            })
          ] })
        ] }) }),
        !isMobile ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-5", children: groupedByStatus.map((group) => {
          var _a;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: cn(
                    "text-[11px] font-bold uppercase tracking-wider",
                    ((_a = statusConfig[group.status]) == null ? void 0 : _a.color.split(" ")[1]) ?? "text-muted-foreground"
                  ),
                  children: group.label
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-medium bg-muted rounded-full px-2 py-0.5", children: group.items.length }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border/60" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b bg-muted/40 text-left text-[11px] text-muted-foreground uppercase tracking-wide", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-16", children: "#" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "Cliente" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-24", children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold text-right w-28", children: "Valor" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-20 text-center", children: "Criação" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-20 text-center", children: "Previsto" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-20 text-center", children: "Execução" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-20 text-center", children: "Faturado" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-20 text-center", children: "Pago" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-12 text-center", children: "Motor" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-10" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: group.items.map((o) => {
                const displayValue = (o.desconto ?? 0) > 0 ? o.valorFinal ?? o.valorVenda : o.valorVenda;
                const motor = motorLabel(o.motorType);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "tr",
                  {
                    className: "border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors group",
                    onClick: () => onViewOrcamento(o),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3 font-bold text-primary text-sm", children: [
                        "#",
                        o.numeroOrcamento ?? "—"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground truncate block max-w-[200px]", children: o.nomeCliente }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
                          o.itensServico.length,
                          " ",
                          o.itensServico.length === 1 ? "serviço" : "serviços"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3", children: renderStatusBadge(o) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-right font-bold tabular-nums text-foreground", children: formatCurrency2(displayValue) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-center text-xs text-muted-foreground tabular-nums", children: fmtDate(o.dataCriacao) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-center text-xs tabular-nums", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: o.dataPrevista ? "text-foreground font-medium" : "text-muted-foreground",
                          children: fmtDate(o.dataPrevista)
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-center text-xs tabular-nums", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: o.dataExecucao ? "text-blue-600 dark:text-blue-400 font-medium" : "text-muted-foreground",
                          children: fmtDate(o.dataExecucao)
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-center text-xs tabular-nums", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: o.dataFaturamento ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground",
                          children: fmtDate(o.dataFaturamento)
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-center text-xs tabular-nums", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: o.dataPagamento ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground",
                          children: fmtDate(o.dataPagamento)
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-center", children: motor && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold rounded-full px-2 py-0.5 bg-muted text-muted-foreground", children: motor }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-right opacity-0 group-hover:opacity-100 transition-opacity", children: renderRowActions(o) })
                    ]
                  },
                  o.id
                );
              }) })
            ] }) }) })
          ] }, group.status);
        }) }) : (
          /* Mobile: Cards view */
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: groupedByStatus.map((group) => {
            var _a;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 pt-3 pb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: cn(
                      "text-[11px] font-bold uppercase tracking-wider",
                      ((_a = statusConfig[group.status]) == null ? void 0 : _a.color.split(" ")[1]) ?? "text-muted-foreground"
                    ),
                    children: group.label
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-medium bg-muted rounded-full px-2 py-0.5", children: group.items.length }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border/60" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: group.items.map((o) => {
                const displayValue = (o.desconto ?? 0) > 0 ? o.valorFinal ?? o.valorVenda : o.valorVenda;
                const relevantDate = getRelevantDate(o);
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    className: "overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/20 transition-all",
                    onClick: () => onViewOrcamento(o),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-primary shrink-0", children: [
                          "#",
                          o.numeroOrcamento ?? "—"
                        ] }),
                        renderStatusBadge(o),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold text-foreground shrink-0 tabular-nums", children: formatCurrency2(displayValue) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate flex-1 mr-2", children: o.nomeCliente }),
                        renderRowActions(o)
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap pt-1.5 border-t border-border/50", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(o.dataCriacao).toLocaleDateString("pt-BR") }),
                        relevantDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-border", children: "·" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                            relevantDate.label,
                            ": ",
                            relevantDate.value
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-[10px]", children: [
                          o.itensServico.length,
                          " ",
                          o.itensServico.length === 1 ? "serviço" : "serviços"
                        ] })
                      ] })
                    ] })
                  },
                  o.id
                );
              }) })
            ] }, group.status);
          }) })
        ),
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-8 w-8 text-muted-foreground/30 mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Nenhum orçamento encontrado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70 mt-1 max-w-xs", children: "Tente ajustar os filtros ou buscar por outro termo." })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        AlertDialog,
        {
          open: !!pendingReject,
          onOpenChange: (open) => {
            if (!open) setPendingReject(null);
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Marcar como Rejeitado?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                "Deseja marcar o orçamento ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  "#",
                  pendingReject == null ? void 0 : pendingReject.numeroOrcamento
                ] }),
                " como rejeitado?"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AlertDialogAction,
                {
                  onClick: confirmReject,
                  className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                  children: "Rejeitar"
                }
              )
            ] })
          ] })
        }
      )
    ] })
  ] });
}
export {
  Orcamentos
};
