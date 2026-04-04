import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { c as createLucideIcon, f as useOrcamentos, u as useAuth, e as LoaderCircle, B as Button, P as Plus, a as cn, F as FileText, U as Users, D as DollarSign } from "./index-BN5a_yey.js";
import { C as Card, a as CardContent } from "./card-B4K8qJaR.js";
import { C as ChartColumn, T as TrendingUp } from "./trending-up-CQC4QTG5.js";
import { R as Receipt, B as Banknote, H as Hammer, a as Ban } from "./receipt-oWie0_9I.js";
import { C as Clock } from "./clock-h-zti0qz.js";
import { A as ArrowRight } from "./arrow-right-CwcInH32.js";
import "./charts-vendor-BrW5ULH7.js";
import "./radix-vendor-CEzLCFk2.js";
import "./pdf-vendor-Dv6cUxDn.js";
import "./query-vendor-BLvK6anV.js";
import "./router-vendor-CCo6OTFM.js";
import "./supabase-vendor-BsjcsmU5.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CircleCheckBig = createLucideIcon("CircleCheckBig", [
  ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CircleX = createLucideIcon("CircleX", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Target = createLucideIcon("Target", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
]);
const statusConfig = {
  pendente: {
    label: "Pendentes",
    color: "text-amber-600 dark:text-amber-400",
    iconColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    icon: Clock
  },
  aprovado: {
    label: "Aprovados",
    color: "text-emerald-600 dark:text-emerald-400",
    iconColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    icon: CircleCheckBig
  },
  executado: {
    label: "Executados",
    color: "text-blue-600 dark:text-blue-400",
    iconColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    icon: Hammer
  },
  rejeitado: {
    label: "Rejeitados",
    color: "text-red-500",
    iconColor: "bg-red-500/15 text-red-500",
    icon: CircleX
  },
  cancelado: {
    label: "Cancelados",
    color: "text-gray-500",
    iconColor: "bg-gray-500/15 text-gray-500",
    icon: Ban
  }
};
const statusBadgeColors = {
  pendente: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
  aprovado: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  executado: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
  rejeitado: "bg-red-500/15 text-red-600 border-red-500/25",
  cancelado: "bg-gray-500/15 text-gray-600 border-gray-500/25"
};
function Dashboard({ onNewOrcamento, onViewOrcamento, onNavigate }) {
  const { orcamentos, isLoading } = useOrcamentos();
  const { canCreateEditBudget, canViewFinanceiro, canManageClientes } = useAuth();
  const formatCurrency = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const metrics = reactExports.useMemo(() => {
    const byStatus = {
      pendente: orcamentos.filter((orcamento) => orcamento.status === "pendente"),
      aprovado: orcamentos.filter((orcamento) => orcamento.status === "aprovado"),
      executado: orcamentos.filter((orcamento) => orcamento.status === "executado"),
      rejeitado: orcamentos.filter((orcamento) => orcamento.status === "rejeitado"),
      cancelado: orcamentos.filter((orcamento) => orcamento.status === "cancelado")
    };
    const valorPendente = byStatus.pendente.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0
    );
    const valorAprovado = byStatus.aprovado.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0
    );
    const faturamentoExecutado = byStatus.executado.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0
    );
    const vendas = [...byStatus.aprovado, ...byStatus.executado];
    const ticketMedio = vendas.length > 0 ? vendas.reduce((sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda), 0) / vendas.length : 0;
    const now = /* @__PURE__ */ new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const isInMonth = (dateStr) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date >= monthStart && date <= monthEnd;
    };
    const monthAprovados = orcamentos.filter(
      (orcamento) => orcamento.status === "aprovado" && isInMonth(orcamento.dataCriacao)
    );
    const monthExecutados = orcamentos.filter(
      (orcamento) => orcamento.status === "executado" && isInMonth(orcamento.dataExecucao || orcamento.dataCriacao)
    );
    const monthRejeitados = orcamentos.filter(
      (orcamento) => orcamento.status === "rejeitado" && isInMonth(orcamento.dataCriacao)
    );
    const monthFaturados = orcamentos.filter((orcamento) => isInMonth(orcamento.dataFaturamento));
    const monthPagos = orcamentos.filter((orcamento) => isInMonth(orcamento.dataPagamento));
    const monthAprovadosValor = monthAprovados.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0
    );
    const monthExecutadosValor = monthExecutados.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0
    );
    const monthFaturadosValor = monthFaturados.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0
    );
    const monthPagosValor = monthPagos.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0
    );
    const monthVendas = [...monthAprovados, ...monthExecutados];
    const monthTicket = monthVendas.length > 0 ? monthVendas.reduce((sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda), 0) / monthVendas.length : 0;
    const convDenom = monthAprovados.length + monthRejeitados.length;
    const taxaConversao = convDenom > 0 ? monthAprovados.length / convDenom * 100 : 0;
    const recentOrcamentos = [...orcamentos].sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()).slice(0, 5);
    return {
      byStatus,
      valorPendente,
      valorAprovado,
      faturamentoExecutado,
      ticketMedio,
      monthly: {
        aprovadosCount: monthAprovados.length,
        aprovadosValor: monthAprovadosValor,
        executadosCount: monthExecutados.length,
        executadosValor: monthExecutadosValor,
        faturadosValor: monthFaturadosValor,
        pagosValor: monthPagosValor,
        ticketMedio: monthTicket,
        taxaConversao,
        pendentesCount: byStatus.pendente.length
      },
      recentOrcamentos
    };
  }, [orcamentos]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }) });
  }
  const monthName = (/* @__PURE__ */ new Date()).toLocaleString("pt-BR", { month: "long" });
  const vendasFechadas = metrics.byStatus.aprovado.length + metrics.byStatus.executado.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-[1400px] space-y-6 px-4 pb-24 pt-5 lg:px-6 lg:pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm text-muted-foreground", children: "Acompanhe o ritmo da operação, os orçamentos em andamento e os números mais importantes do mês." })
      ] }),
      canCreateEditBudget && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onNewOrcamento, className: "font-semibold shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-4 w-4" }),
        "Novo orçamento"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Central da operação do dia" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm leading-relaxed text-muted-foreground", children: [
          "Hoje você tem ",
          metrics.byStatus.pendente.length,
          " orçamento",
          metrics.byStatus.pendente.length === 1 ? "" : "s",
          " pendente",
          metrics.byStatus.pendente.length === 1 ? "" : "s",
          ", ",
          metrics.byStatus.aprovado.length,
          " aprovado",
          metrics.byStatus.aprovado.length === 1 ? "" : "s",
          " e ",
          metrics.byStatus.executado.length,
          " serviço",
          metrics.byStatus.executado.length === 1 ? "" : "s",
          " já executado",
          metrics.byStatus.executado.length === 1 ? "" : "s",
          "."
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: [
      {
        ...statusConfig.pendente,
        count: metrics.byStatus.pendente.length,
        value: metrics.valorPendente,
        helper: "Precisam de acompanhamento comercial"
      },
      {
        ...statusConfig.aprovado,
        count: metrics.byStatus.aprovado.length,
        value: metrics.valorAprovado,
        helper: "Já convertidos em venda"
      },
      {
        ...statusConfig.executado,
        count: metrics.byStatus.executado.length,
        value: metrics.faturamentoExecutado,
        helper: "Já passaram para execução"
      },
      {
        label: "Ticket médio",
        color: "text-primary",
        iconColor: "bg-primary/10 text-primary",
        icon: TrendingUp,
        count: vendasFechadas,
        value: metrics.ticketMedio,
        helper: "Média entre aprovados e executados",
        isCurrency: true
      }
    ].map((kpi) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border shadow-sm transition-shadow hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: kpi.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex h-10 w-10 items-center justify-center rounded-full", kpi.iconColor), children: /* @__PURE__ */ jsxRuntimeExports.jsx(kpi.icon, { className: "h-5 w-5" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-2xl font-bold", kpi.color), children: "isCurrency" in kpi ? formatCurrency(kpi.value) : kpi.count }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "isCurrency" in kpi ? `${kpi.count} vendas fechadas` : formatCurrency(kpi.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: kpi.helper })
    ] }) }, kpi.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border shadow-sm lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold capitalize text-foreground", children: [
              "Desempenho do mês • ",
              monthName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Um resumo rápido para entender vendas aprovadas, execução e impacto financeiro do período atual." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MiniMetric,
            {
              label: "Aprovados",
              value: String(metrics.monthly.aprovadosCount),
              helper: formatCurrency(metrics.monthly.aprovadosValor),
              tone: "text-emerald-600 dark:text-emerald-400"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MiniMetric,
            {
              label: "Executados",
              value: String(metrics.monthly.executadosCount),
              helper: formatCurrency(metrics.monthly.executadosValor),
              tone: "text-blue-600 dark:text-blue-400"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MiniMetric,
            {
              label: "Conversão",
              value: `${metrics.monthly.taxaConversao.toFixed(0)}%`,
              helper: `Ticket: ${formatCurrency(metrics.monthly.ticketMedio)}`,
              tone: "text-foreground",
              icon: Target
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MiniMetric,
            {
              label: "Faturado",
              value: formatCurrency(metrics.monthly.faturadosValor),
              helper: "Valor faturado no mês",
              tone: "text-emerald-600 dark:text-emerald-400",
              icon: Receipt
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MiniMetric,
            {
              label: "Recebido",
              value: formatCurrency(metrics.monthly.pagosValor),
              helper: "Valor já pago no mês",
              tone: "text-violet-600 dark:text-violet-400",
              icon: Banknote
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MiniMetric,
            {
              label: "Pendentes",
              value: String(metrics.monthly.pendentesCount),
              helper: "Ainda esperando avanço",
              tone: "text-amber-600 dark:text-amber-400",
              icon: Clock
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Últimos orçamentos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Os itens mais recentes para retomar a operação." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "h-7 px-2 text-xs text-primary hover:text-primary/80",
              onClick: () => onNavigate("orcamentos"),
              children: [
                "Ver todos",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-3 w-3" })
              ]
            }
          )
        ] }),
        metrics.recentOrcamentos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mx-auto mb-3 h-10 w-10 text-muted-foreground/20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-sm font-medium text-foreground", children: "Nenhum orçamento ainda" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-xs text-muted-foreground", children: "Assim que a equipe começar a cadastrar propostas, elas aparecerão aqui." }),
          canCreateEditBudget && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onNewOrcamento, size: "sm", className: "font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
            "Criar primeiro"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: metrics.recentOrcamentos.map((orcamento) => {
          const status = statusConfig[orcamento.status ?? "pendente"];
          const badgeColor = statusBadgeColors[orcamento.status ?? "pendente"];
          const displayValue = (orcamento.desconto ?? 0) > 0 ? orcamento.valorFinal ?? orcamento.valorVenda : orcamento.valorVenda;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "mx-[-8px] flex cursor-pointer items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-muted/50",
              onClick: () => onViewOrcamento(orcamento),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-0.5 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-primary", children: [
                      "#",
                      orcamento.numeroOrcamento ?? "—"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", badgeColor), children: status.label.replace(/s$/, "") })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-muted-foreground", children: orcamento.nomeCliente })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "shrink-0 text-sm font-bold text-foreground", children: formatCurrency(displayValue) })
              ]
            },
            orcamento.id
          );
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Ações rápidas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Atalhos para abrir as áreas mais usadas no dia a dia sem precisar navegar pelo menu." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        canCreateEditBudget && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: onNewOrcamento, className: "h-8 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-3.5 w-3.5" }),
          "Novo orçamento"
        ] }),
        canManageClientes && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => onNavigate("clientes"), className: "h-8 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mr-1.5 h-3.5 w-3.5" }),
          "Clientes"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => onNavigate("orcamentos"), className: "h-8 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mr-1.5 h-3.5 w-3.5" }),
          "Orçamentos"
        ] }),
        canViewFinanceiro && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => onNavigate("financeiro"), className: "h-8 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "mr-1.5 h-3.5 w-3.5" }),
          "Financeiro"
        ] })
      ] })
    ] }) }) })
  ] });
}
function MiniMetric({
  label,
  value,
  helper,
  tone,
  icon: Icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/50 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-1.5", children: [
      Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-lg font-bold sm:text-xl", tone), children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: helper })
  ] });
}
export {
  Dashboard
};
