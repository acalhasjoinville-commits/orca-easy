import { useOrcamentos } from '@/hooks/useSupabaseData';
import { Orcamento, StatusOrcamento } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const statusConfig: Record<StatusOrcamento, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  pendente: { label: 'Pendentes', color: 'text-yellow-700', bgColor: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  aprovado: { label: 'Aprovados', color: 'text-green-700', bgColor: 'bg-green-500/10 border-green-500/20', icon: CheckCircle },
  executado: { label: 'Executados', color: 'text-blue-700', bgColor: 'bg-blue-500/10 border-blue-500/20', icon: Hammer },
  rejeitado: { label: 'Rejeitados', color: 'text-red-700', bgColor: 'bg-red-500/10 border-red-500/20', icon: XCircle },
  cancelado: { label: 'Cancelados', color: 'text-gray-600', bgColor: 'bg-gray-500/10 border-gray-500/20', icon: Ban },
};

export function Dashboard({ onNewOrcamento, onViewOrcamento, onNavigate }: DashboardProps) {
  const { orcamentos, isLoading } = useOrcamentos();
  const { canCreateEditBudget, canViewFinanceiro, canManageClientes } = useAuth();

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // KPIs by status
  const byStatus = {
    pendente: orcamentos.filter(o => o.status === 'pendente'),
    aprovado: orcamentos.filter(o => o.status === 'aprovado'),
    executado: orcamentos.filter(o => o.status === 'executado'),
    rejeitado: orcamentos.filter(o => o.status === 'rejeitado'),
  };

  // Commercial summary
  const valorPendente = byStatus.pendente.reduce((sum, o) => sum + (o.valorFinal ?? o.valorVenda), 0);
  const valorAprovado = byStatus.aprovado.reduce((sum, o) => sum + (o.valorFinal ?? o.valorVenda), 0);
  const faturamentoExecutado = byStatus.executado.reduce((sum, o) => sum + (o.valorFinal ?? o.valorVenda), 0);
  const vendas = [...byStatus.aprovado, ...byStatus.executado];
  const ticketMedio = vendas.length > 0 
    ? vendas.reduce((sum, o) => sum + (o.valorFinal ?? o.valorVenda), 0) / vendas.length 
    : 0;

  // Monthly performance metrics
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

  // Recent budgets (last 5)
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
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4 space-y-8">
      {/* BLOCO 1 — Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Resumo rápido do seu negócio</p>
        </div>
        <div className="flex gap-2">
          {canCreateEditBudget && (
            <Button onClick={onNewOrcamento} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
            </Button>
          )}
          {canManageClientes && (
            <Button variant="outline" onClick={() => onNavigate('clientes')} className="shadow-sm">
              <Users className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          )}
        </div>
      </div>

      {/* BLOCO 2 — KPIs de Status */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Status dos Orçamentos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(['pendente', 'aprovado', 'executado', 'rejeitado'] as StatusOrcamento[]).map((status) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const count = byStatus[status].length;
            return (
              <Card key={status} className={cn('border card-hover', config.bgColor)}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn('text-[11px] font-semibold uppercase tracking-wider', config.color)}>{config.label}</p>
                      <p className={cn('text-3xl font-bold mt-1', config.color)}>{count}</p>
                    </div>
                    <div className={cn('rounded-xl p-2.5 bg-background/50')}>
                      <Icon className={cn('h-7 w-7 opacity-70', config.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* BLOCO 3 — Resumo Comercial */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Resumo Comercial</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg p-1.5 bg-yellow-500/10">
                  <Clock className="h-4 w-4 text-yellow-700" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Valor Pendente</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(valorPendente)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg p-1.5 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-700" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Valor Aprovado</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(valorAprovado)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg p-1.5 bg-blue-500/10">
                  <DollarSign className="h-4 w-4 text-blue-700" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Faturamento</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(faturamentoExecutado)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg p-1.5 bg-accent/10">
                  <TrendingUp className="h-4 w-4 text-accent" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket Médio</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(ticketMedio)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BLOCO 3.5 — Desempenho do Mês */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2 capitalize">
          <BarChart3 className="h-4 w-4" />
          Desempenho de {monthName}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="card-hover">
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Aprovados</p>
              <p className="text-3xl font-bold text-green-700">{monthlyMetrics.aprovadosCount}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatCurrency(monthlyMetrics.aprovadosValor)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Executados</p>
              <p className="text-3xl font-bold text-blue-700">{monthlyMetrics.executadosCount}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatCurrency(monthlyMetrics.executadosValor)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-accent" />
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket Médio</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(monthlyMetrics.ticketMedio)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Target className="h-3.5 w-3.5 text-accent" />
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Conversão</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{monthlyMetrics.taxaConversao.toFixed(0)}%</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="h-3.5 w-3.5 text-yellow-700" />
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pendentes</p>
              </div>
              <p className="text-2xl font-bold text-yellow-700">{monthlyMetrics.pendentesCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BLOCO 3.6 — Faturamento e Recebimento do Mês */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2 capitalize">
          <Receipt className="h-4 w-4" />
          Faturamento e Recebimento — {monthName}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg p-1.5 bg-emerald-500/10">
                  <Receipt className="h-4 w-4 text-emerald-700" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Faturado no mês</p>
              </div>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(monthlyMetrics.faturadosValor)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg p-1.5 bg-violet-500/10">
                  <Banknote className="h-4 w-4 text-violet-700" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recebido no mês</p>
              </div>
              <p className="text-2xl font-bold text-violet-700">{formatCurrency(monthlyMetrics.pagosValor)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BLOCO 4 — Últimos Orçamentos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Últimos Orçamentos</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-accent hover:text-accent/80"
            onClick={() => onNavigate('orcamentos')}
          >
            Ver todos <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        
        {recentOrcamentos.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground mb-4">Você ainda não possui orçamentos cadastrados</p>
              {canCreateEditBudget && (
                <Button onClick={onNewOrcamento} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm">
                  <Plus className="mr-2 h-4 w-4" /> Criar primeiro orçamento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {recentOrcamentos.map((o) => {
              const st = statusConfig[o.status ?? 'pendente'];
              const displayValue = (o.desconto ?? 0) > 0 ? (o.valorFinal ?? o.valorVenda) : o.valorVenda;
              return (
                <Card 
                  key={o.id} 
                  className="cursor-pointer card-hover hover:border-primary/30"
                  onClick={() => onViewOrcamento(o)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold border shrink-0', st.bgColor, st.color)}>
                          {st.label.replace('s', '')}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">
                            <span className="text-accent font-bold">#{o.numeroOrcamento ?? '—'}</span>
                            {' — '}
                            {o.nomeCliente}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {new Date(o.dataCriacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <p className="text-base font-bold text-accent shrink-0">{formatCurrency(displayValue)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* BLOCO 5 — Atalhos Rápidos */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Atalhos Rápidos</h2>
        <div className="grid grid-cols-2 gap-4">
          {canCreateEditBudget && (
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-1.5 rounded-xl shadow-sm card-hover"
              onClick={onNewOrcamento}
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-medium">Novo Orçamento</span>
            </Button>
          )}
          {canManageClientes && (
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-1.5 rounded-xl shadow-sm card-hover"
              onClick={() => onNavigate('clientes')}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs font-medium">Novo Cliente</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-1.5 rounded-xl shadow-sm card-hover"
            onClick={() => onNavigate('orcamentos')}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">Ver Orçamentos</span>
          </Button>
          {canViewFinanceiro && (
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-1.5 rounded-xl shadow-sm card-hover"
              onClick={() => onNavigate('financeiro')}
            >
              <DollarSign className="h-5 w-5" />
              <span className="text-xs font-medium">Ver Financeiro</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
