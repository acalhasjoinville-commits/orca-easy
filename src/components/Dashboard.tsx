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
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Resumo rápido do seu negócio</p>
        </div>
        {canCreateEditBudget && (
          <Button onClick={onNewOrcamento} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1.5 h-4 w-4" /> Novo Orçamento
          </Button>
        )}
      </div>

      {/* BLOCO 1 — KPIs Consolidados: Status + Valores */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">Visão Geral</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pendentes */}
          <Card className={cn('border', statusConfig.pendente.bgColor)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('text-[11px] font-semibold uppercase tracking-wider', statusConfig.pendente.color)}>Pendentes</p>
                  <p className={cn('text-2xl font-bold mt-0.5', statusConfig.pendente.color)}>{byStatus.pendente.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(valorPendente)}</p>
                </div>
                <div className="rounded-lg p-2 bg-background/50">
                  <Clock className={cn('h-5 w-5 opacity-70', statusConfig.pendente.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Aprovados */}
          <Card className={cn('border', statusConfig.aprovado.bgColor)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('text-[11px] font-semibold uppercase tracking-wider', statusConfig.aprovado.color)}>Aprovados</p>
                  <p className={cn('text-2xl font-bold mt-0.5', statusConfig.aprovado.color)}>{byStatus.aprovado.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(valorAprovado)}</p>
                </div>
                <div className="rounded-lg p-2 bg-background/50">
                  <CheckCircle className={cn('h-5 w-5 opacity-70', statusConfig.aprovado.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Executados */}
          <Card className={cn('border', statusConfig.executado.bgColor)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('text-[11px] font-semibold uppercase tracking-wider', statusConfig.executado.color)}>Executados</p>
                  <p className={cn('text-2xl font-bold mt-0.5', statusConfig.executado.color)}>{byStatus.executado.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(faturamentoExecutado)}</p>
                </div>
                <div className="rounded-lg p-2 bg-background/50">
                  <Hammer className={cn('h-5 w-5 opacity-70', statusConfig.executado.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Ticket Médio */}
          <Card className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ticket Médio</p>
                  <p className="text-2xl font-bold mt-0.5 text-foreground">{formatCurrency(ticketMedio)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{vendas.length} vendas</p>
                </div>
                <div className="rounded-lg p-2 bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent opacity-70" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BLOCO 2 — Desempenho do Mês + Fat/Rec */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5 capitalize">
          <BarChart3 className="h-3.5 w-3.5" />
          Desempenho — {monthName}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Aprovados</p>
              <p className="text-2xl font-bold text-green-700">{monthlyMetrics.aprovadosCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(monthlyMetrics.aprovadosValor)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Executados</p>
              <p className="text-2xl font-bold text-blue-700">{monthlyMetrics.executadosCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(monthlyMetrics.executadosValor)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="h-3 w-3 text-accent" />
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Conversão</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{monthlyMetrics.taxaConversao.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ticket: {formatCurrency(monthlyMetrics.ticketMedio)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Receipt className="h-3 w-3 text-emerald-700" />
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Faturado</p>
              </div>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(monthlyMetrics.faturadosValor)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Banknote className="h-3 w-3 text-violet-700" />
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recebido</p>
              </div>
              <p className="text-xl font-bold text-violet-700">{formatCurrency(monthlyMetrics.pagosValor)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="h-3 w-3 text-yellow-700" />
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pendentes</p>
              </div>
              <p className="text-xl font-bold text-yellow-700">{monthlyMetrics.pendentesCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BLOCO 3 — Últimos Orçamentos (lista compacta) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Últimos Orçamentos</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-accent hover:text-accent/80 h-7 px-2"
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
                <Button onClick={onNewOrcamento} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="mr-2 h-4 w-4" /> Criar primeiro orçamento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentOrcamentos.map((o) => {
                  const st = statusConfig[o.status ?? 'pendente'];
                  const displayValue = (o.desconto ?? 0) > 0 ? (o.valorFinal ?? o.valorVenda) : o.valorVenda;
                  return (
                    <div 
                      key={o.id} 
                      className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onViewOrcamento(o)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-semibold border shrink-0', st.bgColor, st.color)}>
                          {st.label.replace('s', '')}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            <span className="text-accent font-bold">#{o.numeroOrcamento ?? '—'}</span>
                            <span className="text-muted-foreground mx-1.5">·</span>
                            {o.nomeCliente}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(o.dataCriacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-accent shrink-0">{formatCurrency(displayValue)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* BLOCO 4 — Atalhos Rápidos (compactados) */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">Atalhos Rápidos</h2>
        <div className="flex flex-wrap gap-2">
          {canCreateEditBudget && (
            <Button variant="outline" size="sm" onClick={onNewOrcamento} className="h-9 text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Novo Orçamento
            </Button>
          )}
          {canManageClientes && (
            <Button variant="outline" size="sm" onClick={() => onNavigate('clientes')} className="h-9 text-xs">
              <Users className="mr-1.5 h-3.5 w-3.5" /> Novo Cliente
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onNavigate('orcamentos')} className="h-9 text-xs">
            <FileText className="mr-1.5 h-3.5 w-3.5" /> Ver Orçamentos
          </Button>
          {canViewFinanceiro && (
            <Button variant="outline" size="sm" onClick={() => onNavigate('financeiro')} className="h-9 text-xs">
              <DollarSign className="mr-1.5 h-3.5 w-3.5" /> Ver Financeiro
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
