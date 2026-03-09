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
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Tab } from '@/components/AppSidebar';

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
  const ticketMedio = orcamentos.length > 0 
    ? orcamentos.reduce((sum, o) => sum + (o.valorFinal ?? o.valorVenda), 0) / orcamentos.length 
    : 0;

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

  return (
    <div className="px-4 pb-24 lg:pb-8 pt-4 space-y-6">
      {/* BLOCO 1 — Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumo rápido do seu negócio</p>
        </div>
        <div className="flex gap-2">
          {canCreateEditBudget && (
            <Button onClick={onNewOrcamento} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
            </Button>
          )}
          {canManageClientes && (
            <Button variant="outline" onClick={() => onNavigate('clientes')}>
              <Users className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          )}
        </div>
      </div>

      {/* BLOCO 2 — KPIs de Status */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Status dos Orçamentos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(['pendente', 'aprovado', 'executado', 'rejeitado'] as StatusOrcamento[]).map((status) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const count = byStatus[status].length;
            return (
              <Card key={status} className={cn('border', config.bgColor)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn('text-xs font-medium', config.color)}>{config.label}</p>
                      <p className={cn('text-2xl font-bold', config.color)}>{count}</p>
                    </div>
                    <Icon className={cn('h-8 w-8 opacity-60', config.color)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* BLOCO 3 — Resumo Comercial */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Resumo Comercial</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-700" />
                <p className="text-xs font-medium text-muted-foreground">Valor Pendente</p>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(valorPendente)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-700" />
                <p className="text-xs font-medium text-muted-foreground">Valor Aprovado</p>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(valorAprovado)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-blue-700" />
                <p className="text-xs font-medium text-muted-foreground">Faturamento</p>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(faturamentoExecutado)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-accent" />
                <p className="text-xs font-medium text-muted-foreground">Ticket Médio</p>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(ticketMedio)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BLOCO 4 — Últimos Orçamentos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Últimos Orçamentos</h2>
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
            <CardContent className="py-8 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground mb-4">Você ainda não possui orçamentos cadastrados</p>
              {canCreateEditBudget && (
                <Button onClick={onNewOrcamento} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="mr-2 h-4 w-4" /> Criar primeiro orçamento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentOrcamentos.map((o) => {
              const st = statusConfig[o.status ?? 'pendente'];
              const displayValue = (o.desconto ?? 0) > 0 ? (o.valorFinal ?? o.valorVenda) : o.valorVenda;
              return (
                <Card 
                  key={o.id} 
                  className="cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => onViewOrcamento(o)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold border shrink-0', st.bgColor, st.color)}>
                          {st.label.replace('s', '')}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            <span className="text-accent font-bold">#{o.numeroOrcamento ?? '—'}</span>
                            {' - '}
                            {o.nomeCliente}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(o.dataCriacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-accent shrink-0">{formatCurrency(displayValue)}</p>
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
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Atalhos Rápidos</h2>
        <div className="grid grid-cols-2 gap-3">
          {canCreateEditBudget && (
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-1"
              onClick={onNewOrcamento}
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Novo Orçamento</span>
            </Button>
          )}
          {canManageClientes && (
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-1"
              onClick={() => onNavigate('clientes')}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Novo Cliente</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-1"
            onClick={() => onNavigate('orcamentos')}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs">Ver Orçamentos</span>
          </Button>
          {canViewFinanceiro && (
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-1"
              onClick={() => onNavigate('financeiro')}
            >
              <DollarSign className="h-5 w-5" />
              <span className="text-xs">Ver Financeiro</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
