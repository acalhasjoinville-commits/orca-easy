import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { c as createLucideIcon, u as useAuth, s as supabase, d as ue, B as Button, I as Input, f as useOrcamentos, g as useIsMobile, k as Separator, D as DollarSign, P as Plus } from "./index-BN5a_yey.js";
import { u as useQueryClient, a as useQuery, b as useMutation } from "./query-vendor-BLvK6anV.js";
import { u as useDraft } from "./useDraft-B2tUcsQY.js";
import { C as CATEGORIAS_RECEITA, a as CATEGORIAS_DESPESA } from "./types-DSYQLPIT.js";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle } from "./dialog-ScvtRc5R.js";
import { L as Label } from "./label-BChNKNza.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, B as Badge } from "./select-DQUVPZUM.js";
import { T as Textarea } from "./textarea-B24Ov2Sw.js";
import { C as Card, a as CardContent } from "./card-B4K8qJaR.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Cr3helAi.js";
import { P as Pencil, A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-C9g92JDz.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, E as EllipsisVertical, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-Cw3zSzm8.js";
import { C as ChartColumn, T as TrendingUp } from "./trending-up-CQC4QTG5.js";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, d as Bar } from "./charts-vendor-BrW5ULH7.js";
import { T as Trash2 } from "./trash-2-DvXBRZTj.js";
import "./radix-vendor-CEzLCFk2.js";
import "./pdf-vendor-Dv6cUxDn.js";
import "./router-vendor-CCo6OTFM.js";
import "./supabase-vendor-BsjcsmU5.js";
import "./check-D0l1wUju.js";
import "./chevron-right-DibYopn_.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Percent = createLucideIcon("Percent", [
  ["line", { x1: "19", x2: "5", y1: "5", y2: "19", key: "1x9vlm" }],
  ["circle", { cx: "6.5", cy: "6.5", r: "2.5", key: "4mh3h7" }],
  ["circle", { cx: "17.5", cy: "17.5", r: "2.5", key: "1mdrzq" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const TrendingDown = createLucideIcon("TrendingDown", [
  ["polyline", { points: "22 17 13.5 8.5 8.5 13.5 2 7", key: "1r2t7k" }],
  ["polyline", { points: "16 17 22 17 22 11", key: "11uiuu" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Wallet = createLucideIcon("Wallet", [
  [
    "path",
    {
      d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",
      key: "18etb6"
    }
  ],
  ["path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4", key: "xoc0q4" }]
]);
function dbToLancamento(row) {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    tipo: row.tipo,
    descricao: row.descricao,
    valor: Number(row.valor),
    data: row.data,
    categoria: row.categoria,
    observacao: row.observacao || "",
    origem: row.origem || "manual"
  };
}
function lancamentoToDb(l, empresaId) {
  return {
    id: l.id,
    empresa_id: empresaId,
    tipo: l.tipo,
    descricao: l.descricao,
    valor: Math.abs(l.valor),
    // always positive
    data: l.data,
    categoria: l.categoria,
    observacao: l.observacao,
    origem: l.origem || "manual"
  };
}
function useLancamentos() {
  const { empresaId } = useAuth();
  const qc = useQueryClient();
  const key = ["lancamentos", empresaId];
  const { data: lancamentos = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase.from("lancamentos_financeiros").select("*").eq("empresa_id", empresaId).order("data", { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToLancamento);
    }
  });
  const saveMutation = useMutation({
    mutationFn: async (l) => {
      const row = lancamentoToDb(l, empresaId);
      const { error } = await supabase.from("lancamentos_financeiros").upsert(row);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("lancamentos_financeiros").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key })
  });
  return {
    lancamentos,
    isLoading,
    saveLancamento: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteLancamento: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending
  };
}
const EMPTY_DRAFT = {
  tipo: "despesa",
  descricao: "",
  valor: "",
  data: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  categoria: "",
  observacao: ""
};
function draftFromLancamento(lancamento) {
  return {
    tipo: lancamento.tipo,
    descricao: lancamento.descricao,
    valor: String(lancamento.valor),
    data: lancamento.data,
    categoria: lancamento.categoria,
    observacao: lancamento.observacao
  };
}
function LancamentoFormModal({ open, onOpenChange, lancamento, onSave, isSaving, empresaId }) {
  const isEdit = !!lancamento;
  const draftKey = lancamento ? `draft:lancamento-edit:${lancamento.id}` : "draft:lancamento-new";
  const initialDraft = lancamento ? draftFromLancamento(lancamento) : EMPTY_DRAFT;
  const [draft, setDraft, clearDraft, wasRestored] = useDraft(draftKey, initialDraft);
  reactExports.useEffect(() => {
    if (open && wasRestored) {
      ue.info("Rascunho restaurado.", { duration: 2e3 });
    }
  }, [open, wasRestored]);
  reactExports.useEffect(() => {
    if (!open) return;
    if (lancamento) {
      const stored = sessionStorage.getItem(draftKey);
      if (!stored) {
        setDraft(draftFromLancamento(lancamento));
      }
    } else {
      const stored = sessionStorage.getItem("draft:lancamento-new");
      if (!stored) {
        setDraft({ ...EMPTY_DRAFT, data: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
      }
    }
  }, [open, lancamento == null ? void 0 : lancamento.id, draftKey, lancamento, setDraft]);
  const { tipo, descricao, valor, data, categoria, observacao } = draft;
  const updateField = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };
  const categorias = tipo === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
  reactExports.useEffect(() => {
    if (categoria && !categorias.includes(categoria)) {
      setDraft((prev) => ({ ...prev, categoria: "" }));
    }
  }, [categoria, categorias, setDraft]);
  const handleClose = () => {
    clearDraft();
    onOpenChange(false);
  };
  const handleSave = async () => {
    if (!descricao.trim()) {
      ue.error("Informe a descrição.");
      return;
    }
    const numericValue = parseFloat(valor);
    if (!numericValue || numericValue <= 0) {
      ue.error("Informe um valor positivo.");
      return;
    }
    if (!data) {
      ue.error("Informe a data.");
      return;
    }
    if (!categoria) {
      ue.error("Selecione a categoria.");
      return;
    }
    await onSave({
      id: (lancamento == null ? void 0 : lancamento.id) || crypto.randomUUID(),
      empresaId,
      tipo,
      descricao: descricao.trim(),
      valor: Math.abs(numericValue),
      data,
      categoria,
      observacao: observacao.trim(),
      origem: "manual"
    });
    clearDraft();
    onOpenChange(false);
    ue.success(isEdit ? "Lançamento atualizado." : "Lançamento criado.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (value) => !value && handleClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isEdit ? "Editar lançamento" : "Novo lançamento" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Registro manual do financeiro" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Escolha o tipo, informe o valor e categorize corretamente para manter a leitura financeira confiável." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1.5 block text-xs text-muted-foreground", children: "Tipo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              size: "sm",
              variant: tipo === "despesa" ? "default" : "outline",
              className: tipo === "despesa" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "",
              onClick: () => updateField("tipo", "despesa"),
              children: "Despesa"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              size: "sm",
              variant: tipo === "receita" ? "default" : "outline",
              className: tipo === "receita" ? "bg-accent text-accent-foreground hover:bg-accent/90" : "",
              onClick: () => updateField("tipo", "receita"),
              children: "Receita"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "lanc-descricao", className: "text-xs text-muted-foreground", children: "Descrição *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "lanc-descricao",
            value: descricao,
            onChange: (event) => updateField("descricao", event.target.value),
            placeholder: "Ex: Compra de alumínio"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "lanc-valor", className: "text-xs text-muted-foreground", children: "Valor (R$) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "lanc-valor",
              type: "number",
              min: "0.01",
              step: "0.01",
              value: valor,
              onChange: (event) => updateField("valor", event.target.value),
              placeholder: "0,00"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "lanc-data", className: "text-xs text-muted-foreground", children: "Data *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "lanc-data",
              type: "date",
              value: data,
              onChange: (event) => updateField("data", event.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Categoria *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: categoria, onValueChange: (value) => updateField("categoria", value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecione..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categorias.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: item, children: item }, item)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "lanc-obs", className: "text-xs text-muted-foreground", children: "Observação" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "lanc-obs",
            value: observacao,
            onChange: (event) => updateField("observacao", event.target.value),
            placeholder: "Opcional...",
            rows: 2
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleClose, children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, disabled: isSaving, children: isSaving ? "Salvando..." : isEdit ? "Salvar" : "Criar" })
      ] })
    ] })
  ] }) });
}
const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtPct = (v) => `${v.toFixed(1)}%`;
const VALID_STATUSES = ["aprovado", "executado"];
function filterByPeriod(items, getDate, period, now) {
  return items.filter((item) => {
    const d = getDate(item);
    if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === "3months") return d >= new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return d.getFullYear() === now.getFullYear();
  });
}
function KpiCard({ title, value, icon: Icon, color = "text-foreground", iconBg = "bg-muted", highlight = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: highlight ? "border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.06]" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-4 w-4 ${color}` }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl lg:text-2xl font-bold ${color}`, children: value })
  ] }) });
}
function OrcamentosTab() {
  const { orcamentos } = useOrcamentos();
  const [period, setPeriod] = reactExports.useState("year");
  const [statusFilter, setStatusFilter] = reactExports.useState("todos");
  const isMobile = useIsMobile();
  const now = /* @__PURE__ */ new Date();
  const filtered = reactExports.useMemo(() => {
    return orcamentos.filter((orc) => {
      if (!VALID_STATUSES.includes(orc.status)) return false;
      if (statusFilter !== "todos" && orc.status !== statusFilter) return false;
      const d = new Date(orc.dataCriacao);
      if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (period === "3months") return d >= new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return d.getFullYear() === now.getFullYear();
    });
  }, [orcamentos, period, statusFilter]);
  const kpis = reactExports.useMemo(() => {
    const faturamento = filtered.reduce((s, o) => s + o.valorFinal, 0);
    const custo = filtered.reduce((s, o) => s + o.custoTotalObra, 0);
    const lucro = faturamento - custo;
    const margem = faturamento > 0 ? lucro / faturamento * 100 : 0;
    return { faturamento, custo, lucro, margem };
  }, [filtered]);
  const chartData = reactExports.useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      months.push({ key, label, receita: 0, custo: 0 });
    }
    orcamentos.forEach((orc) => {
      if (!VALID_STATUSES.includes(orc.status)) return;
      if (statusFilter !== "todos" && orc.status !== statusFilter) return;
      const d = new Date(orc.dataCriacao);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const m = months.find((x) => x.key === key);
      if (m) {
        m.receita += orc.valorFinal;
        m.custo += orc.custoTotalObra;
      }
    });
    return months;
  }, [orcamentos, statusFilter]);
  const top5 = reactExports.useMemo(() => {
    return [...filtered].map((o) => ({
      ...o,
      lucro: o.valorFinal - o.custoTotalObra,
      margem: o.valorFinal > 0 ? (o.valorFinal - o.custoTotalObra) / o.valorFinal * 100 : 0
    })).sort((a, b) => b.lucro - a.lucro).slice(0, 5);
  }, [filtered]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 mt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0", children: "Período" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: period, onValueChange: (v) => setPeriod(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-[180px] h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "month", children: "Mês Atual" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3months", children: "Últimos 3 Meses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "year", children: "Ano Atual" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { orientation: "vertical", className: "h-5 hidden sm:block" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0", children: "Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: (v) => setStatusFilter(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-[200px] h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "todos", children: "Executados + Aprovados" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "executado", children: "Executados" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "aprovado", children: "Aprovados" })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { title: "Faturamento", value: fmt(kpis.faturamento), icon: DollarSign, iconBg: "bg-primary/10", color: "text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { title: "Custo Total", value: fmt(kpis.custo), icon: ChartColumn, iconBg: "bg-muted", color: "text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { title: "Lucro Bruto", value: fmt(kpis.lucro), icon: TrendingUp, iconBg: "bg-emerald-500/10", color: "text-emerald-600 dark:text-emerald-400", highlight: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { title: "Margem Média", value: fmtPct(kpis.margem), icon: Percent, iconBg: "bg-amber-500/10", color: "text-amber-600 dark:text-amber-400" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 lg:p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Receita vs Custo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "Últimos 6 meses" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, barGap: 4, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 }, stroke: "hsl(var(--muted-foreground))" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 10 }, stroke: "hsl(var(--muted-foreground))", tickFormatter: (v) => `R$${(v / 1e3).toFixed(0)}k` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (value) => fmt(value), contentStyle: { backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: { fontSize: "11px" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "receita", name: "Receita", fill: "hsl(var(--primary))", radius: [4, 4, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "custo", name: "Custo", fill: "hsl(var(--muted-foreground) / 0.3)", radius: [4, 4, 0, 0] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 lg:p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground mb-5", children: "Resumo do Período" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1", children: "Orçamentos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-foreground", children: filtered.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1", children: "Ticket Médio" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold text-foreground", children: filtered.length > 0 ? fmt(kpis.faturamento / filtered.length) : "R$ 0,00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1", children: "Lucro por Orçamento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold text-emerald-600 dark:text-emerald-400", children: filtered.length > 0 ? fmt(kpis.lucro / filtered.length) : "R$ 0,00" })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 lg:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Top 5 — Mais Lucrativos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
          filtered.length,
          " orçamentos no período"
        ] })
      ] }),
      top5.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-10 w-10 text-muted-foreground/20 mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum orçamento no período selecionado." })
      ] }) : isMobile ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: top5.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: o.nomeCliente }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: new Date(o.dataCriacao).toLocaleDateString("pt-BR") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: o.margem >= 40 ? "default" : "secondary", className: "text-[10px]", children: fmtPct(o.margem) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Valor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(o.valorFinal) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Custo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(o.custoTotalObra) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Lucro" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-emerald-600 dark:text-emerald-400", children: fmt(o.lucro) })
          ] })
        ] })
      ] }, o.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left text-[11px] text-muted-foreground bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-medium", children: "Cliente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-medium", children: "Data" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-medium text-right", children: "Valor Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-medium text-right", children: "Custo Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-medium text-right", children: "Lucro Bruto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-medium text-right", children: "Margem" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: top5.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/40 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 font-medium", children: o.nomeCliente }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-muted-foreground", children: new Date(o.dataCriacao).toLocaleDateString("pt-BR") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-right tabular-nums", children: fmt(o.valorFinal) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-right tabular-nums", children: fmt(o.custoTotalObra) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums", children: fmt(o.lucro) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: o.margem >= 40 ? "default" : "secondary", className: "text-[10px]", children: fmtPct(o.margem) }) })
        ] }, o.id)) })
      ] }) })
    ] }) })
  ] });
}
function LancamentosTab() {
  const { empresaId } = useAuth();
  const { lancamentos, saveLancamento, isSaving, deleteLancamento, isDeleting } = useLancamentos();
  const isMobile = useIsMobile();
  const now = /* @__PURE__ */ new Date();
  const [period, setPeriod] = reactExports.useState("month");
  const [tipoFilter, setTipoFilter] = reactExports.useState("all");
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const filtered = reactExports.useMemo(() => {
    return filterByPeriod(
      lancamentos.filter((l) => tipoFilter === "all" || l.tipo === tipoFilter),
      (l) => new Date(l.data),
      period,
      now
    );
  }, [lancamentos, period, tipoFilter]);
  const kpis = reactExports.useMemo(() => {
    const receitas = filtered.filter((l) => l.tipo === "receita").reduce((s, l) => s + l.valor, 0);
    const despesas = filtered.filter((l) => l.tipo === "despesa").reduce((s, l) => s + l.valor, 0);
    const saldo = receitas - despesas;
    return { receitas, despesas, saldo };
  }, [filtered]);
  const handleEdit = (l) => {
    setEditing(l);
    setModalOpen(true);
  };
  const handleNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteLancamento(deleteTarget);
    setDeleteTarget(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 mt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0", children: "Período" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: period, onValueChange: (v) => setPeriod(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-[180px] h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "month", children: "Mês Atual" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3months", children: "Últimos 3 Meses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "year", children: "Ano Atual" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { orientation: "vertical", className: "h-5 hidden sm:block" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0", children: "Tipo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tipoFilter, onValueChange: (v) => setTipoFilter(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-[160px] h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Todos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "receita", children: "Receitas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "despesa", children: "Despesas" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:ml-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleNew, className: "w-full sm:w-auto h-9", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
        " Novo Lançamento"
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { title: "Total Receitas", value: fmt(kpis.receitas), icon: TrendingUp, iconBg: "bg-emerald-500/10", color: "text-emerald-600 dark:text-emerald-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { title: "Total Despesas", value: fmt(kpis.despesas), icon: TrendingDown, iconBg: "bg-red-500/10", color: "text-red-600 dark:text-red-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiCard,
        {
          title: "Saldo do Período",
          value: fmt(kpis.saldo),
          icon: Wallet,
          iconBg: kpis.saldo >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
          color: kpis.saldo >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
          highlight: true
        }
      )
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-10 w-10 text-muted-foreground/20 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum lançamento encontrado para o período selecionado." })
    ] }) }) : isMobile ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filtered.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: l.descricao }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: l.tipo === "receita" ? "default" : "destructive", className: "text-[10px]", children: l.tipo === "receita" ? "Receita" : "Despesa" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: l.categoria })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-sm font-bold ml-2 whitespace-nowrap ${l.tipo === "receita" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`, children: [
          l.tipo === "receita" ? "+" : "−",
          " ",
          fmt(l.valor)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: (/* @__PURE__ */ new Date(l.data + "T00:00:00")).toLocaleDateString("pt-BR") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleEdit(l), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-destructive", onClick: () => setDeleteTarget(l.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] })
      ] })
    ] }) }, l.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left text-[11px] text-muted-foreground bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-medium w-24", children: "Data" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-medium w-20", children: "Tipo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-medium", children: "Descrição" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-medium w-28", children: "Categoria" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-medium text-right w-28", children: "Valor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-medium text-right w-16", children: "Ações" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/40 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-muted-foreground whitespace-nowrap tabular-nums", children: (/* @__PURE__ */ new Date(l.data + "T00:00:00")).toLocaleDateString("pt-BR") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: l.tipo === "receita" ? "default" : "destructive", className: "text-[10px]", children: l.tipo === "receita" ? "Receita" : "Despesa" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 font-medium max-w-[200px] truncate", children: l.descricao }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-muted-foreground text-xs", children: l.categoria }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: `py-2.5 px-3 text-right font-semibold whitespace-nowrap tabular-nums ${l.tipo === "receita" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`, children: [
          l.tipo === "receita" ? "+" : "−",
          " ",
          fmt(l.valor)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "min-w-[120px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleEdit(l), className: "text-xs gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
              " Editar"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setDeleteTarget(l.id), className: "text-xs gap-2 text-destructive focus:text-destructive", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
              " Excluir"
            ] })
          ] })
        ] }) })
      ] }, l.id)) })
    ] }) }) }),
    empresaId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      LancamentoFormModal,
      {
        open: modalOpen,
        onOpenChange: setModalOpen,
        lancamento: editing,
        onSave: saveLancamento,
        isSaving,
        empresaId
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteTarget, onOpenChange: (open) => !open && setDeleteTarget(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Excluir lançamento?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Essa ação não pode ser desfeita." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleConfirmDelete, disabled: isDeleting, children: isDeleting ? "Excluindo..." : "Excluir" })
      ] })
    ] }) })
  ] });
}
function Financeiro() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 lg:px-6 pb-24 lg:pb-8 pt-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-foreground", children: "Financeiro" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Análise financeira e gestão de lançamentos" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "orcamentos", className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full sm:w-auto h-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "orcamentos", className: "flex-1 sm:flex-none text-xs sm:text-sm px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-3.5 w-3.5 mr-1.5" }),
          "Orçamentos"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "lancamentos", className: "flex-1 sm:flex-none text-xs sm:text-sm px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-3.5 w-3.5 mr-1.5" }),
          "Lançamentos"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "orcamentos", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrcamentosTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "lancamentos", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LancamentosTab, {}) })
    ] })
  ] });
}
export {
  Financeiro
};
