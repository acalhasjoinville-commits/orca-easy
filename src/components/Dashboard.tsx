import { useOrcamentos } from '@/hooks/useSupabaseData';
import { Orcamento, StatusOrcamento } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText, 
  Loader2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Hammer,
  Users,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Target,
  BarChart3,
  Receipt,
  Banknote,
  Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Tab } from '@/components/AppSidebar';
import { useMemo } from 'react';

interface DashboardProps {
  onNewOrcamento: () => void;
  onViewOrcamento: (orc: Orcamento) => void;
  onNavigate: (tab: Tab) => void;
}

const statusConfig: Record<StatusOrcamento, { label: string; color: string; iconColor: string; icon: React.ElementType }> = {
  pendente: { label: 'Pendentes', color: 'text-amber-600 dark:text-amber-400', iconColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', icon: Clock },
  aprovado: { label: 'Aprovados', color: 'text-emerald-600 dark:text-emerald-400', iconColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', icon: CheckCircle },
  executado: { label: 'Executados', color: 'text-blue-600 dark:text-blue-400', iconColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', icon: Hammer },
  rejeitado: { label: 'Rejeitados', color: 'text-red-500', iconColor: 'bg-red-500/15 text-red-500', icon: XCircle },
  cancelado: { label: 'Cancelados', color: 'text-gray-500', iconColor: 'bg-gray-500/15 text-gray-500', icon: Ban },
};

const statusBadgeColors: Record<StatusOrcamento, string> = {
  pendente: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25',
  aprovado: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
  executado: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25',
  rejeitado: 'bg-red-500/15 text-red-600 border-red-500/25',
  cancelado: 'bg-gray-500/15 text-gray-600 border-gray-500/25',
};

export function Dashboard({ onNewOrcamento, onViewOrcamento, onNavigate }: DashboardProps) {
  const { orcamentos, isLoading } = useOrcamentos();
  const { canCreateEditBudget, canViewFinanceiro, canManageClientes } = useAuth();

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const byStatus = {
    pendente: orcamentos.filter(o => o.status === 'pendente'),
    aprovado: orcamentos.filter(o => o.status === 'aprovado'),
    executado: orcamentos.filter(o => o.status === 'executado'),
    rejeitado: orcamentos.filter(o => o.status === 'rejeitado'),
  };

  const valorPendente = byStatus.pendente.reduce((sum, o) => sum + (o.valorFinal ?? o.valorVenda), 0);
  const valorAprovado = byStatus.aprovado.reduce((sum, o) => sum + (o.valorFinal ?? o.valorVenda), 0);
  const faturamentoExecutado = byStatus.executado.reduce((sum, o) => sum + (o.valorFinal ?? o.valorVenda), 0);
  const vendas = [...byStatus.aprovado, ...byStatus.executado];
  const ticketMedio = vendas.length > 0 
    ? vendas.reduce((sum, o) => sum + (o.valorFinal ?? o.valorVenda), 0) / vendas.length 
    : 0;

  const monthlyMetrics = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const isInMonth = (dateStr: string | null | undefined) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= monthStart && d <= monthEnd;
    };

    const monthAprovados = orcamentos.filter(o => o.status === 'aprovado' && isInMonth(o.dataCriacao));
    const monthExecutados = orcamentos.filter(o => o.status === 'executado' && isInMonth(o.dataExecucao || o.dataCriacao));
    const monthRejeitados = orcamentos.filter(o => o.status === 'rejeitado' && isInMonth(o.dataCriacao));
    const monthFaturados = orcamentos.filter(o => isInMonth(o.dataFaturamento));
    const monthPagos = orcamentos.filter(o => isInMonth(o.dataPagamento));

    const monthAprovadosValor = monthAprovados.reduce((s, o) => s + (o.valorFinal ?? o.valorVenda), 0);
    const monthExecutadosValor = monthExecutados.reduce((s, o) => s + (o.valorFinal ?? o.valorVenda), 0);
    const monthFaturadosValor = monthFaturados.reduce((s, o) => s + (o.valorFinal ?? o.valorVenda), 0);
    const monthPagosValor = monthPagos.reduce((s, o) => s + (o.valorFinal ?? o.valorVenda), 0);

    const monthVendas = [...monthAprovados, ...monthExecutados];
    const monthTicket = monthVendas.length > 0
      ? monthVendas.reduce((s, o) => s + (o.valorFinal ?? o.valorVenda), 0) / monthVendas.length
      : 0;

    const convDenom = monthAprovados.length + monthRejeitados.length;
    const taxaConversao = convDenom > 0 ? (monthAprovados.length / convDenom) * 100 : 0;

    return {
      aprovadosCount: monthAprovados.length,
      aprovadosValor: monthAprovadosValor,
      executadosCount: monthExecutados.length,
      executadosValor: monthExecutadosValor,
      faturadosValor: monthFaturadosValor,
      pagosValor: monthPagosValor,
      ticketMedio: monthTicket,
      taxaConversao,
      pendentesCount: byStatus.pendente.length,
    };
  }, [orcamentos, byStatus.pendente.length]);

  const recentOrcamentos = [...orcamentos]
    .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const monthName = new Date().toLocaleString('pt-BR', { month: 'long' });

  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-5 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Resumo rápido do seu negócio</p>
        </div>
        {canCreateEditBudget && (
          <Button onClick={onNewOrcamento} className="font-semibold shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" /> Novo Orçamento
          </Button>
        )}
      </div>

      {/* KPIs — Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { ...statusConfig.pendente, count: byStatus.pendente.length, value: valorPendente },
          { ...statusConfig.aprovado, count: byStatus.aprovado.length, value: valorAprovado },
          { ...statusConfig.executado, count: byStatus.executado.length, value: faturamentoExecutado },
          { label: 'Ticket Médio', color: 'text-primary', iconColor: 'bg-primary/10 text-primary', icon: TrendingUp, count: vendas.length, value: ticketMedio, isTicket: true },
        ].map((kpi, idx) => (
          <Card key={idx} className="border shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', kpi.iconColor)}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
              <p className={cn('text-2xl font-bold', kpi.color)}>
                {'isTicket' in kpi ? formatCurrency(kpi.value) : kpi.count}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {'isTicket' in kpi ? `${kpi.count} vendas` : formatCurrency(kpi.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Performance + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly metrics */}
        <Card className="lg:col-span-2 border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground capitalize">Desempenho — {monthName}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Aprovados</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{monthlyMetrics.aprovadosCount}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(monthlyMetrics.aprovadosValor)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Executados</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{monthlyMetrics.executadosCount}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(monthlyMetrics.executadosValor)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="h-3 w-3 text-primary" />
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Conversão</p>
                </div>
                <p className="text-xl font-bold text-foreground">{monthlyMetrics.taxaConversao.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Ticket: {formatCurrency(monthlyMetrics.ticketMedio)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Receipt className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Faturado</p>
                </div>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(monthlyMetrics.faturadosValor)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Banknote className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Recebido</p>
                </div>
                <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{formatCurrency(monthlyMetrics.pagosValor)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Pendentes</p>
                </div>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{monthlyMetrics.pendentesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent budgets */}
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Últimos Orçamentos</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-primary hover:text-primary/80 h-7 px-2"
                onClick={() => onNavigate('orcamentos')}
              >
                Ver todos <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            
            {recentOrcamentos.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground mb-4">Nenhum orçamento ainda</p>
                {canCreateEditBudget && (
                  <Button onClick={onNewOrcamento} size="sm" className="font-semibold">
                    <Plus className="mr-2 h-4 w-4" /> Criar primeiro
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-border">
                {recentOrcamentos.map((o) => {
                  const st = statusConfig[o.status ?? 'pendente'];
                  const badgeColor = statusBadgeColors[o.status ?? 'pendente'];
                  const displayValue = (o.desconto ?? 0) > 0 ? (o.valorFinal ?? o.valorVenda) : o.valorVenda;
                  return (
                    <div 
                      key={o.id} 
                      className="flex items-center gap-3 py-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                      onClick={() => onViewOrcamento(o)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-primary">#{o.numeroOrcamento ?? '—'}</span>
                          <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold border', badgeColor)}>
                            {st.label.replace('s', '')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{o.nomeCliente}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground shrink-0">{formatCurrency(displayValue)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-2">Atalhos:</span>
            {canCreateEditBudget && (
              <Button variant="outline" size="sm" onClick={onNewOrcamento} className="h-8 text-xs">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Novo Orçamento
              </Button>
            )}
            {canManageClientes && (
              <Button variant="outline" size="sm" onClick={() => onNavigate('clientes')} className="h-8 text-xs">
                <Users className="mr-1.5 h-3.5 w-3.5" /> Clientes
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onNavigate('orcamentos')} className="h-8 text-xs">
              <FileText className="mr-1.5 h-3.5 w-3.5" /> Orçamentos
            </Button>
            {canViewFinanceiro && (
              <Button variant="outline" size="sm" onClick={() => onNavigate('financeiro')} className="h-8 text-xs">
                <DollarSign className="mr-1.5 h-3.5 w-3.5" /> Financeiro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
