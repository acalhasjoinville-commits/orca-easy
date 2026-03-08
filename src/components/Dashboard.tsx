import { useOrcamentos } from '@/hooks/useSupabaseData';
import { Orcamento, StatusOrcamento } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface DashboardProps {
  onNewOrcamento: () => void;
  onViewOrcamento: (orc: Orcamento) => void;
}

const statusConfig: Record<StatusOrcamento, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
  aprovado: { label: 'Aprovado', color: 'bg-green-500/20 text-green-700 border-green-500/30' },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-500/20 text-red-700 border-red-500/30' },
  executado: { label: 'Executado', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
};

export function Dashboard({ onNewOrcamento, onViewOrcamento }: DashboardProps) {
  const { orcamentos, isLoading } = useOrcamentos();
  const { canCreateEditBudget } = useAuth();
  const [search, setSearch] = useState('');

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const filtered = orcamentos.filter(o => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      o.nomeCliente.toLowerCase().includes(q) ||
      String(o.numeroOrcamento ?? '').includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 lg:pb-8 pt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Orçamentos</h1>
        <p className="text-sm text-muted-foreground">Gerencie seus orçamentos de calhas e rufos</p>
      </div>

      {orcamentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="mb-4 h-16 w-16 text-muted-foreground/40" />
          <h2 className="mb-2 text-lg font-semibold text-muted-foreground">Nenhum orçamento ainda</h2>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            {canCreateEditBudget ? 'Crie seu primeiro orçamento e veja os cálculos automatizados em segundos.' : 'Nenhum orçamento cadastrado no sistema.'}
          </p>
          {canCreateEditBudget && (
            <Button onClick={onNewOrcamento} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {canCreateEditBudget && (
            <Button onClick={onNewOrcamento} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base">
              <Plus className="mr-2 h-5 w-5" /> Novo Orçamento
            </Button>
          )}
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou número..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          {filtered.map(o => {
            const st = statusConfig[o.status ?? 'pendente'];
            const displayValue = (o.desconto ?? 0) > 0 ? (o.valorFinal ?? o.valorVenda) : o.valorVenda;
            return (
              <Card key={o.id} className="overflow-hidden cursor-pointer hover:border-primary/40 transition-colors" onClick={() => onViewOrcamento(o)}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold border', st.color)}>
                          {st.label}
                        </span>
                      </div>
                      <CardTitle className="text-base">
                        <span className="font-bold text-accent">#{o.numeroOrcamento ?? '—'}</span>
                        {' - '}
                        {o.nomeCliente}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {o.itensServico.length} {o.itensServico.length === 1 ? 'serviço' : 'serviços'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex items-end justify-between">
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(o.dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-lg font-bold text-accent">{formatCurrency(displayValue)}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhum orçamento encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}
