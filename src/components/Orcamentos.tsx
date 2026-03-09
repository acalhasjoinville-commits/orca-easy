import { useOrcamentos } from '@/hooks/useSupabaseData';
import { Orcamento, StatusOrcamento } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface OrcamentosProps {
  onNewOrcamento: () => void;
  onViewOrcamento: (orc: Orcamento) => void;
}

const statusConfig: Record<StatusOrcamento, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
  aprovado: { label: 'Aprovado', color: 'bg-green-500/20 text-green-700 border-green-500/30' },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-500/20 text-red-700 border-red-500/30' },
  executado: { label: 'Executado', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
};

export function Orcamentos({ onNewOrcamento, onViewOrcamento }: OrcamentosProps) {
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
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seus orçamentos de calhas e rufos</p>
        </div>
        {canCreateEditBudget && orcamentos.length > 0 && (
          <Button onClick={onNewOrcamento} className="hidden sm:flex bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1.5 h-4 w-4" /> Novo Orçamento
          </Button>
        )}
      </div>

      {orcamentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">Nenhum orçamento ainda</h2>
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
          {/* Search + mobile CTA */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou número..." value={search}
                onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            {canCreateEditBudget && (
              <Button onClick={onNewOrcamento} className="sm:hidden bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {filtered.map(o => {
            const st = statusConfig[o.status ?? 'pendente'];
            const displayValue = (o.desconto ?? 0) > 0 ? (o.valorFinal ?? o.valorVenda) : o.valorVenda;
            return (
              <Card key={o.id} className="overflow-hidden cursor-pointer hover:border-primary/40 transition-colors" onClick={() => onViewOrcamento(o)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-accent">#{o.numeroOrcamento ?? '—'}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold border', st.color)}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{o.nomeCliente}</p>
                    </div>
                    <p className="text-lg font-bold text-accent shrink-0 ml-3">{formatCurrency(displayValue)}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{o.itensServico.length} {o.itensServico.length === 1 ? 'serviço' : 'serviços'}</span>
                    <span>{new Date(o.dataCriacao).toLocaleDateString('pt-BR')}</span>
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
