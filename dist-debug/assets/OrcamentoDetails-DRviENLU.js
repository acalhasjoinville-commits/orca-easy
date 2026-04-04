const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/pdf-vendor-Dv6cUxDn.js","assets/charts-vendor-BrW5ULH7.js","assets/react-vendor-ivNAblfg.js","assets/OrdemServicoPDF-CP5ssW8o.js"])))=>i.map(i=>d[i]);
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { a as useFollowUp, b as useTeamMembers, M as MessageCircle } from "./useFollowUp-BXp-Mmrm.js";
import { S as STATUS_FOLLOWUP_CONFIG, T as TIPO_INTERACAO_CONFIG } from "./types-DSYQLPIT.js";
import { C as Card, a as CardContent } from "./card-B4K8qJaR.js";
import { c as createLucideIcon, e as LoaderCircle, B as Button, a as cn, I as Input, X, k as Separator, d as ue, _ as __vitePreload, l as buttonVariants, u as useAuth, F as FileText, S as Shield } from "./index-BN5a_yey.js";
import { B as Badge, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, C as ChevronUp, e as ChevronDown } from "./select-DQUVPZUM.js";
import { T as Textarea } from "./textarea-B24Ov2Sw.js";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle, f as DialogFooter } from "./dialog-ScvtRc5R.js";
import { P as Pencil, A as AlertDialog, h as AlertDialogTrigger, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-C9g92JDz.js";
import { C as CalendarDays } from "./calendar-days-3Dqi55VX.js";
import { U as User } from "./user-A1J5wkwB.js";
import { C as Clock } from "./clock-h-zti0qz.js";
import { S as Save, P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-Bh9k5wbj.js";
import { f as fetchLogoBase64, t as toast, F as Factory, T as Truck, a as CreditCard, P as PDFDownloadButton, C as Copy } from "./PDFDownloadButton-B9hfEiE-.js";
import { D as DayPicker } from "./date-vendor-Blim8teg.js";
import { C as ChevronLeft } from "./chevron-left-ClXy3RlD.js";
import { C as ChevronRight } from "./chevron-right-DibYopn_.js";
import { A as ArrowLeft } from "./arrow-left-lde2cEfB.js";
import { H as Hammer, R as Receipt, B as Banknote, a as Ban } from "./receipt-oWie0_9I.js";
import { C as Check } from "./check-D0l1wUju.js";
import "./charts-vendor-BrW5ULH7.js";
import "./query-vendor-BLvK6anV.js";
import "./radix-vendor-CEzLCFk2.js";
import "./pdf-vendor-Dv6cUxDn.js";
import "./router-vendor-CCo6OTFM.js";
import "./supabase-vendor-BsjcsmU5.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CalendarClock = createLucideIcon("CalendarClock", [
  ["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5", key: "1osxxc" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M3 10h5", key: "r794hk" }],
  ["path", { d: "M17.5 17.5 16 16.3V14", key: "akvzfd" }],
  ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ClipboardList = createLucideIcon("ClipboardList", [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "116196"
    }
  ],
  ["path", { d: "M12 11h4", key: "1jrz19" }],
  ["path", { d: "M12 16h4", key: "n85exb" }],
  ["path", { d: "M8 11h.01", key: "1dfujw" }],
  ["path", { d: "M8 16h.01", key: "18s6g9" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const MessageSquarePlus = createLucideIcon("MessageSquarePlus", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }],
  ["path", { d: "M12 7v6", key: "lw1j43" }],
  ["path", { d: "M9 10h6", key: "9gxzsh" }]
]);
const allStatuses = Object.keys(STATUS_FOLLOWUP_CONFIG);
const allTipos = Object.keys(TIPO_INTERACAO_CONFIG);
function FollowUpBlock({ orcamentoId }) {
  const { followUp, isLoading, upsertFollowUp, logs, logsLoading, addLog } = useFollowUp(orcamentoId);
  const { data: teamMembers = [] } = useTeamMembers();
  const [editing, setEditing] = reactExports.useState(false);
  const [editStatus, setEditStatus] = reactExports.useState("sem_retorno");
  const [editProximaAcao, setEditProximaAcao] = reactExports.useState("");
  const [editDataRetorno, setEditDataRetorno] = reactExports.useState("");
  const [editObservacoes, setEditObservacoes] = reactExports.useState("");
  const [editResponsavelId, setEditResponsavelId] = reactExports.useState(null);
  const [showLogDialog, setShowLogDialog] = reactExports.useState(false);
  const [logTipo, setLogTipo] = reactExports.useState("contato");
  const [logDescricao, setLogDescricao] = reactExports.useState("");
  const [showAllLogs, setShowAllLogs] = reactExports.useState(false);
  const startEdit = () => {
    setEditStatus(followUp.statusFollowUp);
    setEditProximaAcao(followUp.proximaAcao);
    setEditDataRetorno(followUp.dataRetorno || "");
    setEditObservacoes(followUp.observacoes);
    setEditResponsavelId(followUp.responsavelId);
    setEditing(true);
  };
  const saveEdit = async () => {
    try {
      await upsertFollowUp.mutateAsync({
        statusFollowUp: editStatus,
        proximaAcao: editProximaAcao,
        dataRetorno: editDataRetorno || null,
        observacoes: editObservacoes,
        responsavelId: editResponsavelId
      });
      ue.success("Follow-up atualizado");
      setEditing(false);
    } catch {
      ue.error("Erro ao salvar follow-up");
    }
  };
  const handleAddLog = async () => {
    if (!logDescricao.trim()) {
      ue.error("Preencha a descrição");
      return;
    }
    try {
      await addLog.mutateAsync({ tipo: logTipo, descricao: logDescricao.trim() });
      ue.success("Interação registrada");
      setShowLogDialog(false);
      setLogDescricao("");
      setLogTipo("contato");
    } catch {
      ue.error("Erro ao registrar interação");
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5 flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" }) }) });
  }
  const stConfig = STATUS_FOLLOWUP_CONFIG[followUp.statusFollowUp];
  const displayedLogs = showAllLogs ? logs : logs.slice(0, 5);
  const isOverdue = followUp.dataRetorno && new Date(followUp.dataRetorno) < new Date((/* @__PURE__ */ new Date()).toDateString());
  const isToday = followUp.dataRetorno && new Date(followUp.dataRetorno).toDateString() === (/* @__PURE__ */ new Date()).toDateString();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Acompanhamento Comercial" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "text-xs h-8 gap-1.5", onClick: () => setShowLogDialog(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquarePlus, { className: "h-3.5 w-3.5" }),
            "Registrar Interação"
          ] }),
          !editing && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-xs h-8 gap-1", onClick: startEdit, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }),
      !editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Status:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cn("text-[11px]", stConfig.color), children: stConfig.label })
          ] }),
          followUp.proximaAcao && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground shrink-0", children: "Próxima ação:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground", children: followUp.proximaAcao })
          ] }),
          followUp.dataRetorno && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3 w-3 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn(
              "text-xs font-medium",
              isOverdue && "text-destructive",
              isToday && "text-amber-600",
              !isOverdue && !isToday && "text-foreground"
            ), children: [
              "Retorno: ",
              new Date(followUp.dataRetorno).toLocaleDateString("pt-BR"),
              isOverdue && " (atrasado)",
              isToday && " (hoje)"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          followUp.responsavelNome && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground", children: followUp.responsavelNome })
          ] }),
          followUp.ultimaInteracaoEm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "Última interação: ",
              new Date(followUp.ultimaInteracaoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })
            ] })
          ] }),
          followUp.observacoes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: followUp.observacoes })
        ] })
      ] }) : (
        /* Editing form */
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Status do Follow-up" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editStatus, onValueChange: (v) => setEditStatus(v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: allStatuses.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "text-xs", children: STATUS_FOLLOWUP_CONFIG[s].label }, s)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Data de Retorno" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  value: editDataRetorno,
                  onChange: (e) => setEditDataRetorno(e.target.value),
                  className: "h-9 text-xs"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Responsável" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editResponsavelId || "_none", onValueChange: (v) => setEditResponsavelId(v === "_none" ? null : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Nenhum" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_none", className: "text-xs", children: "Nenhum" }),
                  teamMembers.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m.id, className: "text-xs", children: m.name }, m.id))
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Próxima Ação" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: editProximaAcao,
                onChange: (e) => setEditProximaAcao(e.target.value),
                placeholder: "Ex: Ligar para confirmar aprovação",
                className: "h-9 text-xs"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Observações" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: editObservacoes,
                onChange: (e) => setEditObservacoes(e.target.value),
                placeholder: "Notas internas sobre o andamento...",
                className: "text-xs min-h-[60px]"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "text-xs h-8 gap-1", onClick: saveEdit, disabled: upsertFollowUp.isPending, children: [
              upsertFollowUp.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" }),
              "Salvar"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "text-xs h-8 gap-1", onClick: () => setEditing(false), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
              "Cancelar"
            ] })
          ] })
        ] })
      ),
      logs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider", children: "Histórico de Interações" }),
          displayedLogs.map((log) => {
            var _a;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 py-2 border-b border-border/50 last:border-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-muted shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3 w-3 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-foreground", children: ((_a = TIPO_INTERACAO_CONFIG[log.tipo]) == null ? void 0 : _a.label) ?? log.tipo }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: new Date(log.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: log.descricao }),
                log.userName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground/70", children: [
                  "por ",
                  log.userName
                ] })
              ] })
            ] }, log.id);
          }),
          logs.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "text-xs h-7 w-full mt-1 gap-1 text-muted-foreground",
              onClick: () => setShowAllLogs(!showAllLogs),
              children: [
                showAllLogs ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3 w-3" }),
                showAllLogs ? "Mostrar menos" : `Ver todas (${logs.length})`
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showLogDialog, onOpenChange: setShowLogDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-base", children: "Registrar Interação" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Tipo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: logTipo, onValueChange: (v) => setLogTipo(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: allTipos.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, className: "text-xs", children: TIPO_INTERACAO_CONFIG[t].label }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Descrição" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: logDescricao,
              onChange: (e) => setLogDescricao(e.target.value),
              placeholder: "Descreva o que aconteceu...",
              className: "text-xs min-h-[80px]"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowLogDialog(false), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleAddLog, disabled: addLog.isPending, className: "gap-1", children: [
          addLog.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
          "Registrar"
        ] })
      ] })
    ] }) })
  ] });
}
const LEGACY_TERMO_FALLBACK = "CONCLUÍDO: Declaro que, nesta data, os serviços acima descritos foram conferidos, executados e entregues em perfeitas condições.";
function OSDownloadButton({ orcamento, cliente, empresa, size = "default", className }) {
  const [logoBase64, setLogoBase64] = reactExports.useState(null);
  const [generating, setGenerating] = reactExports.useState(false);
  const termoRecebimento = orcamento.termoRecebimentoOsSnapshot != null ? orcamento.termoRecebimentoOsSnapshot : LEGACY_TERMO_FALLBACK;
  reactExports.useEffect(() => {
    let cancelled = false;
    if (empresa == null ? void 0 : empresa.logoUrl) {
      fetchLogoBase64(empresa.logoUrl).then((b64) => {
        if (!cancelled) setLogoBase64(b64);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [empresa == null ? void 0 : empresa.logoUrl]);
  const handleShare = async () => {
    if (generating) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 50));
    try {
      const [{ pdf }, { OrdemServicoPDF }] = await Promise.all([
        __vitePreload(() => import("./pdf-vendor-Dv6cUxDn.js").then((n) => n.r), true ? __vite__mapDeps([0,1,2]) : void 0),
        __vitePreload(() => import("./OrdemServicoPDF-CP5ssW8o.js"), true ? __vite__mapDeps([3,2,1,0]) : void 0)
      ]);
      const buildBlob = async (withLogo) => {
        const OrdemServicoPDFComponent = OrdemServicoPDF;
        return pdf(
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            OrdemServicoPDFComponent,
            {
              orcamento,
              cliente,
              empresa,
              logoBase64: withLogo ? logoBase64 : null,
              termoRecebimento
            }
          )
        ).toBlob();
      };
      let blob;
      try {
        blob = await buildBlob(Boolean(logoBase64));
      } catch (firstError) {
        if (!logoBase64) throw firstError;
        console.warn("Falha ao renderizar OS com logo, tentando sem logo.", firstError);
        blob = await buildBlob(false);
      }
      const nomeCliente = ((cliente == null ? void 0 : cliente.nomeRazaoSocial) || orcamento.nomeCliente || "Cliente").trim().replace(/\s+/g, "_");
      const nomeArquivo = `OS_${orcamento.numeroOrcamento || "novo"}_${nomeCliente}.pdf`;
      const file = new File([blob], nomeArquivo, { type: "application/pdf" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Ordem de Serviço",
          text: "Segue a Ordem de Serviço para execução."
        });
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 3e4);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Erro ao gerar/enviar OS:", err);
      toast({ title: "Erro ao gerar OS", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      size,
      variant: "outline",
      className,
      disabled: generating,
      onClick: (e) => {
        e.stopPropagation();
        handleShare();
      },
      children: generating ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        size !== "icon" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", children: "Gerando..." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-4 w-4" }),
        size !== "icon" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", children: "Gerar OS" })
      ] })
    }
  );
}
function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DayPicker,
    {
      showOutsideDays,
      className: cn("p-3", className),
      classNames: {
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames
      },
      components: {
        IconLeft: ({ ..._props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
        IconRight: ({ ..._props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
      },
      ...props
    }
  );
}
Calendar.displayName = "Calendar";
const statusConfig = {
  pendente: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30" },
  aprovado: { label: "Aprovado", color: "bg-green-500/20 text-green-700 border-green-500/30" },
  rejeitado: { label: "Rejeitado", color: "bg-red-500/20 text-red-700 border-red-500/30" },
  executado: { label: "Executado", color: "bg-blue-500/20 text-blue-700 border-blue-500/30" },
  cancelado: { label: "Cancelado", color: "bg-gray-500/20 text-gray-600 border-gray-500/30" }
};
const dificuldadeLabels = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil"
};
const formatCurrency = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pipelineSteps = [
  { key: "pendente", label: "Pendente" },
  { key: "aprovado", label: "Aprovado" },
  { key: "executado", label: "Executado" },
  { key: "faturado", label: "Faturado" },
  { key: "pago", label: "Pago" }
];
function getPipelineStep(orc) {
  if (orc.dataPagamento) return 4;
  if (orc.dataFaturamento) return 3;
  if (orc.status === "executado") return 2;
  if (orc.status === "aprovado") return 1;
  return 0;
}
function PipelineBar({ orcamento }) {
  const currentStep = getPipelineStep(orcamento);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0 mb-6 px-2", children: pipelineSteps.map((step, idx) => {
    const isActive = idx <= currentStep;
    const isCurrent = idx === currentStep;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center flex-1 relative", children: [
      idx > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
        "absolute top-3 right-1/2 w-full h-0.5 -z-10",
        isActive ? "bg-accent" : "bg-border"
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
        "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all border-2",
        isCurrent ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/20 scale-110" : isActive ? "bg-accent/20 text-accent border-accent/40" : "bg-muted text-muted-foreground border-border"
      ), children: isActive && idx < currentStep ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }) : idx + 1 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
        "text-[10px] mt-1.5 font-semibold truncate",
        isCurrent ? "text-accent" : isActive ? "text-accent/70" : "text-muted-foreground"
      ), children: step.label })
    ] }) }, step.key);
  }) });
}
function OrcamentoDetails({ orcamento, cliente, empresa, onBack, onEdit, onDuplicate, onMarkExecuted, onMarkFaturado, onMarkPago, onUpdateDataPrevista, onCancelOrcamento }) {
  const { canCreateEditBudget } = useAuth();
  const st = statusConfig[orcamento.status ?? "pendente"];
  const displayValue = (orcamento.desconto ?? 0) > 0 ? orcamento.valorFinal ?? orcamento.valorVenda : orcamento.valorVenda;
  const margem = displayValue > 0 ? (1 - orcamento.custoTotalObra / displayValue) * 100 : 0;
  const showPipeline = orcamento.status !== "rejeitado" && orcamento.status !== "cancelado";
  const [dataPrevPopoverOpen, setDataPrevPopoverOpen] = reactExports.useState(false);
  const handleDataPrevistaSelect = (date) => {
    if (onUpdateDataPrevista) {
      onUpdateDataPrevista(orcamento, date ? date.toISOString() : null);
    }
    setDataPrevPopoverOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 lg:px-6 pt-4 pb-24 lg:pb-8 max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: onBack,
        className: "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Voltar para lista"
        ]
      }
    ),
    showPipeline && /* @__PURE__ */ jsxRuntimeExports.jsx(PipelineBar, { orcamento }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FollowUpBlock, { orcamentoId: orcamento.id }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-bold text-accent", children: [
              "#",
              orcamento.numeroOrcamento ?? "—"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("rounded-md px-2 py-0.5 text-[11px] font-semibold border", st.color), children: st.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border border-border", children: orcamento.motorType === "motor1" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Factory, { className: "h-3 w-3" }),
              " Motor 1"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3 w-3" }),
              " Motor 2"
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-medium text-foreground", children: orcamento.nomeCliente })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-accent", children: formatCurrency(displayValue) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3 w-3" }),
          "Criado em ",
          new Date(orcamento.dataCriacao).toLocaleDateString("pt-BR")
        ] }),
        orcamento.dataPrevista && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-3 w-3" }),
          "Previsto ",
          new Date(orcamento.dataPrevista).toLocaleDateString("pt-BR")
        ] }),
        orcamento.dataExecucao && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Hammer, { className: "h-3 w-3" }),
          "Executado em ",
          new Date(orcamento.dataExecucao).toLocaleDateString("pt-BR")
        ] }),
        orcamento.dataFaturamento && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3 w-3" }),
          "Faturado em ",
          new Date(orcamento.dataFaturamento).toLocaleDateString("pt-BR")
        ] }),
        orcamento.dataPagamento && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-3 w-3" }),
          "Pago em ",
          new Date(orcamento.dataPagamento).toLocaleDateString("pt-BR")
        ] }),
        orcamento.validade && !isNaN(new Date(orcamento.validade).getTime()) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Válido até ",
          new Date(orcamento.validade).toLocaleDateString("pt-BR")
        ] })
      ] }),
      canCreateEditBudget && orcamento.status === "aprovado" && onUpdateDataPrevista && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: dataPrevPopoverOpen, onOpenChange: setDataPrevPopoverOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "text-xs h-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "mr-1.5 h-3.5 w-3.5" }),
            orcamento.dataPrevista ? `Previsto: ${new Date(orcamento.dataPrevista).toLocaleDateString("pt-BR")}` : "Definir data prevista"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Calendar,
            {
              mode: "single",
              selected: orcamento.dataPrevista ? new Date(orcamento.dataPrevista) : void 0,
              onSelect: handleDataPrevistaSelect,
              initialFocus: true,
              className: "p-3 pointer-events-auto"
            }
          ) })
        ] }),
        orcamento.dataPrevista && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-xs h-8 text-destructive", onClick: () => onUpdateDataPrevista(orcamento, null), children: "Limpar" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Itens do Orçamento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          orcamento.itensServico.length,
          " ",
          orcamento.itensServico.length === 1 ? "item" : "itens"
        ] })
      ] }),
      orcamento.itensServico.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum item adicionado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0", children: orcamento.itensServico.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("py-3.5", idx > 0 && "border-t border-border"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground mt-0.5 shrink-0", children: idx + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: item.nomeServico }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.materialId }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  item.espessura,
                  "mm"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  item.metragem,
                  "m"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dificuldadeLabels[item.dificuldade] ?? item.dificuldade })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-accent shrink-0 ml-2", children: formatCurrency(item.valorVenda) })
        ] }),
        item.insumosCalculados && item.insumosCalculados.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-[34px] mt-2 rounded-md bg-muted/50 p-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider", children: "Insumos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0.5", children: item.insumosCalculados.map((ins) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              ins.nomeInsumo,
              " (×",
              ins.quantidade.toFixed(2),
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(ins.custoTotal) })
          ] }, ins.insumoId)) })
        ] })
      ] }, item.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground mb-3", children: "Resumo Financeiro" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Custo Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatCurrency(orcamento.custoTotalObra) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Valor de Venda" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatCurrency(orcamento.valorVenda) })
        ] }),
        (orcamento.desconto ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Desconto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-destructive", children: [
            "-",
            formatCurrency(orcamento.desconto)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-baseline rounded-lg bg-muted/50 px-3 py-2.5 -mx-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Valor Final" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold text-accent", children: formatCurrency(displayValue) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Margem" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: margem >= 30 ? "default" : "secondary", className: "text-[10px] px-2", children: [
            margem.toFixed(1),
            "%"
          ] })
        ] })
      ] })
    ] }) }),
    (orcamento.formasPagamento || orcamento.garantia || orcamento.descricaoGeral) && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground mb-3", children: "Condições Comerciais" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
        orcamento.descricaoGeral && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Descrição" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground", children: orcamento.descricaoGeral })
          ] })
        ] }),
        orcamento.formasPagamento && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-muted-foreground mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Pagamento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground", children: orcamento.formasPagamento })
          ] })
        ] }),
        orcamento.garantia && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-muted-foreground mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Garantia" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-foreground", children: [
              orcamento.garantia,
              orcamento.tempoGarantia ? ` (${orcamento.tempoGarantia})` : ""
            ] })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        PDFDownloadButton,
        {
          orcamento,
          cliente,
          empresa,
          className: "h-10 px-4 sm:px-5 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-xs sm:text-sm"
        }
      ),
      (orcamento.status === "aprovado" || orcamento.status === "executado") && /* @__PURE__ */ jsxRuntimeExports.jsx(
        OSDownloadButton,
        {
          orcamento,
          cliente,
          empresa,
          className: "h-10 px-4 sm:px-5 text-xs sm:text-sm"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:block h-6 w-px bg-border mx-1" }),
      canCreateEditBudget && orcamento.status === "aprovado" && onMarkExecuted && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            className: "h-10 px-4 text-xs sm:text-sm border-blue-500/30 text-blue-700 hover:bg-blue-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Hammer, { className: "mr-1.5 h-4 w-4" }),
              "Marcar Executado"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Marcar como Executado?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
              "O orçamento ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                "#",
                orcamento.numeroOrcamento
              ] }),
              " será marcado como executado com a data de hoje."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => onMarkExecuted(orcamento), className: "bg-blue-600 text-white hover:bg-blue-700", children: "Confirmar" })
          ] })
        ] })
      ] }),
      canCreateEditBudget && orcamento.status === "executado" && !orcamento.dataFaturamento && onMarkFaturado && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            className: "h-10 px-4 text-xs sm:text-sm border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "mr-1.5 h-4 w-4" }),
              "Marcar Faturado"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Marcar como Faturado?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
              "O orçamento ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                "#",
                orcamento.numeroOrcamento
              ] }),
              " será marcado como faturado com a data de hoje."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => onMarkFaturado(orcamento), className: "bg-emerald-600 text-white hover:bg-emerald-700", children: "Confirmar" })
          ] })
        ] })
      ] }),
      canCreateEditBudget && orcamento.dataFaturamento && !orcamento.dataPagamento && onMarkPago && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            className: "h-10 px-4 text-xs sm:text-sm border-violet-500/30 text-violet-700 hover:bg-violet-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "mr-1.5 h-4 w-4" }),
              "Marcar Pago"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Marcar como Pago?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
              "O orçamento ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                "#",
                orcamento.numeroOrcamento
              ] }),
              " será marcado como pago com a data de hoje."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => onMarkPago(orcamento), className: "bg-violet-600 text-white hover:bg-violet-700", children: "Confirmar" })
          ] })
        ] })
      ] }),
      canCreateEditBudget && (orcamento.status === "pendente" || orcamento.status === "aprovado") && onCancelOrcamento && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            className: "h-10 px-4 text-xs sm:text-sm border-gray-500/30 text-gray-600 hover:bg-gray-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "mr-1.5 h-4 w-4" }),
              "Cancelar Orçamento"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Cancelar Orçamento?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
              "O orçamento ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                "#",
                orcamento.numeroOrcamento
              ] }),
              " será cancelado. Esta ação não pode ser desfeita."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Voltar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => onCancelOrcamento(orcamento), className: "bg-gray-600 text-white hover:bg-gray-700", children: "Confirmar Cancelamento" })
          ] })
        ] })
      ] }),
      canCreateEditBudget && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          onClick: () => onEdit(orcamento),
          className: "h-10 px-4 text-xs sm:text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-1.5 h-4 w-4" }),
            "Editar"
          ]
        }
      ),
      canCreateEditBudget && onDuplicate && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          onClick: () => onDuplicate(orcamento),
          className: "h-10 px-4 text-xs sm:text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "mr-1.5 h-4 w-4" }),
            "Duplicar"
          ]
        }
      )
    ] })
  ] });
}
export {
  OrcamentoDetails
};
