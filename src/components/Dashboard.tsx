import { useMemo } from "react";
import { usePendencias } from "@/hooks/usePendencias";
import { PendenciasOperacionais } from "@/components/PendenciasOperacionais";
import {
  ArrowRight,
  Banknote,
  BarChart3,
  Ban,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Hammer,
  Loader2,
  Plus,
  Receipt,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrcamentos } from "@/hooks/useSupabaseData";
import { cn } from "@/lib/utils";
import { Orcamento, StatusOrcamento } from "@/lib/types";
import { Tab } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardProps {
  onNewOrcamento: () => void;
  onViewOrcamento: (orc: Orcamento) => void;
  onNavigate: (tab: Tab) => void;
}

const statusConfig: Record<
  StatusOrcamento,
  { label: string; color: string; iconColor: string; icon: React.ElementType }
> = {
  pendente: {
    label: "Pendentes",
    color: "text-amber-600 dark:text-amber-400",
    iconColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    icon: Clock,
  },
  aprovado: {
    label: "Aprovados",
    color: "text-emerald-600 dark:text-emerald-400",
    iconColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle,
  },
  executado: {
    label: "Executados",
    color: "text-blue-600 dark:text-blue-400",
    iconColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    icon: Hammer,
  },
  rejeitado: {
    label: "Rejeitados",
    color: "text-red-500",
    iconColor: "bg-red-500/15 text-red-500",
    icon: XCircle,
  },
  cancelado: {
    label: "Cancelados",
    color: "text-gray-500",
    iconColor: "bg-gray-500/15 text-gray-500",
    icon: Ban,
  },
};

const statusBadgeColors: Record<StatusOrcamento, string> = {
  pendente: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
  aprovado: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  executado: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
  rejeitado: "bg-red-500/15 text-red-600 border-red-500/25",
  cancelado: "bg-gray-500/15 text-gray-600 border-gray-500/25",
};

export function Dashboard({ onNewOrcamento, onViewOrcamento, onNavigate }: DashboardProps) {
  const { orcamentos, isLoading } = useOrcamentos();
  const { canCreateEditBudget, canViewFinanceiro, canManageClientes } = useAuth();

  const formatCurrency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const metrics = useMemo(() => {
    const byStatus = {
      pendente: orcamentos.filter((orcamento) => orcamento.status === "pendente"),
      aprovado: orcamentos.filter((orcamento) => orcamento.status === "aprovado"),
      executado: orcamentos.filter((orcamento) => orcamento.status === "executado"),
      rejeitado: orcamentos.filter((orcamento) => orcamento.status === "rejeitado"),
      cancelado: orcamentos.filter((orcamento) => orcamento.status === "cancelado"),
    };

    const valorPendente = byStatus.pendente.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0,
    );
    const valorAprovado = byStatus.aprovado.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0,
    );
    const faturamentoExecutado = byStatus.executado.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0,
    );

    const vendas = [...byStatus.aprovado, ...byStatus.executado];
    const ticketMedio =
      vendas.length > 0
        ? vendas.reduce((sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda), 0) / vendas.length
        : 0;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const isInMonth = (dateStr: string | null | undefined) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date >= monthStart && date <= monthEnd;
    };

    const monthAprovados = orcamentos.filter(
      (orcamento) => orcamento.status === "aprovado" && isInMonth(orcamento.dataCriacao),
    );
    const monthExecutados = orcamentos.filter(
      (orcamento) => orcamento.status === "executado" && isInMonth(orcamento.dataExecucao || orcamento.dataCriacao),
    );
    const monthRejeitados = orcamentos.filter(
      (orcamento) => orcamento.status === "rejeitado" && isInMonth(orcamento.dataCriacao),
    );
    const monthFaturados = orcamentos.filter((orcamento) => isInMonth(orcamento.dataFaturamento));
    const monthPagos = orcamentos.filter((orcamento) => isInMonth(orcamento.dataPagamento));

    const monthAprovadosValor = monthAprovados.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0,
    );
    const monthExecutadosValor = monthExecutados.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0,
    );
    const monthFaturadosValor = monthFaturados.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0,
    );
    const monthPagosValor = monthPagos.reduce(
      (sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda),
      0,
    );

    const monthVendas = [...monthAprovados, ...monthExecutados];
    const monthTicket =
      monthVendas.length > 0
        ? monthVendas.reduce((sum, orcamento) => sum + (orcamento.valorFinal ?? orcamento.valorVenda), 0) /
          monthVendas.length
        : 0;

    const convDenom = monthAprovados.length + monthRejeitados.length;
    const taxaConversao = convDenom > 0 ? (monthAprovados.length / convDenom) * 100 : 0;

    const recentOrcamentos = [...orcamentos]
      .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
      .slice(0, 5);

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
        pendentesCount: byStatus.pendente.length,
      },
      recentOrcamentos,
    };
  }, [orcamentos]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const monthName = new Date().toLocaleString("pt-BR", { month: "long" });
  const vendasFechadas = metrics.byStatus.aprovado.length + metrics.byStatus.executado.length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 pb-24 pt-5 lg:px-6 lg:pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Acompanhe o ritmo da operação, os orçamentos em andamento e os números mais importantes do mês.
          </p>
        </div>
        {canCreateEditBudget && (
          <Button onClick={onNewOrcamento} className="font-semibold shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Novo orçamento
          </Button>
        )}
      </div>

      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Central da operação do dia</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Hoje você tem {metrics.byStatus.pendente.length} orçamento
                {metrics.byStatus.pendente.length === 1 ? "" : "s"} pendente
                {metrics.byStatus.pendente.length === 1 ? "" : "s"}, {metrics.byStatus.aprovado.length} aprovado
                {metrics.byStatus.aprovado.length === 1 ? "" : "s"} e {metrics.byStatus.executado.length} serviço
                {metrics.byStatus.executado.length === 1 ? "" : "s"} já executado
                {metrics.byStatus.executado.length === 1 ? "" : "s"}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            ...statusConfig.pendente,
            count: metrics.byStatus.pendente.length,
            value: metrics.valorPendente,
            helper: "Precisam de acompanhamento comercial",
          },
          {
            ...statusConfig.aprovado,
            count: metrics.byStatus.aprovado.length,
            value: metrics.valorAprovado,
            helper: "Já convertidos em venda",
          },
          {
            ...statusConfig.executado,
            count: metrics.byStatus.executado.length,
            value: metrics.faturamentoExecutado,
            helper: "Já passaram para execução",
          },
          {
            label: "Ticket médio",
            color: "text-primary",
            iconColor: "bg-primary/10 text-primary",
            icon: TrendingUp,
            count: vendasFechadas,
            value: metrics.ticketMedio,
            helper: "Média entre aprovados e executados",
            isCurrency: true,
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="border shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{kpi.label}</p>
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", kpi.iconColor)}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
              <p className={cn("text-2xl font-bold", kpi.color)}>
                {"isCurrency" in kpi ? formatCurrency(kpi.value) : kpi.count}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {"isCurrency" in kpi ? `${kpi.count} vendas fechadas` : formatCurrency(kpi.value)}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">{kpi.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border shadow-sm lg:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold capitalize text-foreground">Desempenho do mês • {monthName}</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Um resumo rápido para entender vendas aprovadas, execução e impacto financeiro do período atual.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <MiniMetric
                label="Aprovados"
                value={String(metrics.monthly.aprovadosCount)}
                helper={formatCurrency(metrics.monthly.aprovadosValor)}
                tone="text-emerald-600 dark:text-emerald-400"
              />
              <MiniMetric
                label="Executados"
                value={String(metrics.monthly.executadosCount)}
                helper={formatCurrency(metrics.monthly.executadosValor)}
                tone="text-blue-600 dark:text-blue-400"
              />
              <MiniMetric
                label="Conversão"
                value={`${metrics.monthly.taxaConversao.toFixed(0)}%`}
                helper={`Ticket: ${formatCurrency(metrics.monthly.ticketMedio)}`}
                tone="text-foreground"
                icon={Target}
              />
              <MiniMetric
                label="Faturado"
                value={formatCurrency(metrics.monthly.faturadosValor)}
                helper="Valor faturado no mês"
                tone="text-emerald-600 dark:text-emerald-400"
                icon={Receipt}
              />
              <MiniMetric
                label="Recebido"
                value={formatCurrency(metrics.monthly.pagosValor)}
                helper="Valor já pago no mês"
                tone="text-violet-600 dark:text-violet-400"
                icon={Banknote}
              />
              <MiniMetric
                label="Pendentes"
                value={String(metrics.monthly.pendentesCount)}
                helper="Ainda esperando avanço"
                tone="text-amber-600 dark:text-amber-400"
                icon={Clock}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Últimos orçamentos</h2>
                <p className="mt-1 text-xs text-muted-foreground">Os itens mais recentes para retomar a operação.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-primary hover:text-primary/80"
                onClick={() => onNavigate("orcamentos")}
              >
                Ver todos
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>

            {metrics.recentOrcamentos.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
                <p className="mb-1 text-sm font-medium text-foreground">Nenhum orçamento ainda</p>
                <p className="mb-4 text-xs text-muted-foreground">
                  Assim que a equipe começar a cadastrar propostas, elas aparecerão aqui.
                </p>
                {canCreateEditBudget && (
                  <Button onClick={onNewOrcamento} size="sm" className="font-semibold">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar primeiro
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {metrics.recentOrcamentos.map((orcamento) => {
                  const status = statusConfig[orcamento.status ?? "pendente"];
                  const badgeColor = statusBadgeColors[orcamento.status ?? "pendente"];
                  const displayValue =
                    (orcamento.desconto ?? 0) > 0
                      ? (orcamento.valorFinal ?? orcamento.valorVenda)
                      : orcamento.valorVenda;

                  return (
                    <div
                      key={orcamento.id}
                      className="mx-[-8px] flex cursor-pointer items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-muted/50"
                      onClick={() => onViewOrcamento(orcamento)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">#{orcamento.numeroOrcamento ?? "—"}</span>
                          <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", badgeColor)}>
                            {status.label.replace(/s$/, "")}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{orcamento.nomeCliente}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-foreground">{formatCurrency(displayValue)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Ações rápidas</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Atalhos para abrir as áreas mais usadas no dia a dia sem precisar navegar pelo menu.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canCreateEditBudget && (
                <Button variant="outline" size="sm" onClick={onNewOrcamento} className="h-8 text-xs">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Novo orçamento
                </Button>
              )}
              {canManageClientes && (
                <Button variant="outline" size="sm" onClick={() => onNavigate("clientes")} className="h-8 text-xs">
                  <Users className="mr-1.5 h-3.5 w-3.5" />
                  Clientes
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => onNavigate("orcamentos")} className="h-8 text-xs">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Orçamentos
              </Button>
              {canViewFinanceiro && (
                <Button variant="outline" size="sm" onClick={() => onNavigate("financeiro")} className="h-8 text-xs">
                  <DollarSign className="mr-1.5 h-3.5 w-3.5" />
                  Financeiro
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  helper,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  tone: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <p className={cn("text-lg font-bold sm:text-xl", tone)}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}
