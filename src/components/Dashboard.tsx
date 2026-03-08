import { useOrcamentos, useClientes, useEmpresa } from '@/hooks/useSupabaseData';
import { Orcamento, StatusOrcamento } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Trash2, Pencil, Search, Copy, Loader2, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PDFDownloadButton } from './PDFDownloadButton';
import { OSDownloadButton } from './OSDownloadButton';

interface DashboardProps {
  onNewOrcamento: () => void;
  onEditOrcamento: (orc: Orcamento) => void;
}

const statusConfig: Record<StatusOrcamento, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
  aprovado: { label: 'Aprovado', color: 'bg-green-500/20 text-green-700 border-green-500/30' },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-500/20 text-red-700 border-red-500/30' },
  executado: { label: 'Executado', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
};

export function Dashboard({ onNewOrcamento, onEditOrcamento }: DashboardProps) {
  const { orcamentos, isLoading, getNextNumero, addOrcamento, deleteOrcamento } = useOrcamentos();
  const { clientes } = useClientes();
  const { empresa } = useEmpresa();
  const [search, setSearch] = useState('');

  const handleDelete = async (id: string) => {
    try {
      await deleteOrcamento.mutateAsync(id);
      toast.success('Orçamento removido.');
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  const handleDuplicate = async (orc: Orcamento) => {
    try {
      const nextNum = await getNextNumero();
      const duplicated: Orcamento = {
        ...orc,
        id: crypto.randomUUID(),
        numeroOrcamento: nextNum,
        dataCriacao: new Date().toISOString(),
        status: 'pendente',
      };
      await addOrcamento.mutateAsync(duplicated);
      toast.success(`Orçamento duplicado como #${duplicated.numeroOrcamento}`);
    } catch {
      toast.error('Erro ao duplicar.');
    }
  };

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
    <div className="px-4 pb-24 pt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">OrçaCalhas</h1>
        <p className="text-sm text-muted-foreground">Seus orçamentos de calhas e rufos</p>
      </div>

      {orcamentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="mb-4 h-16 w-16 text-muted-foreground/40" />
          <h2 className="mb-2 text-lg font-semibold text-muted-foreground">Nenhum orçamento ainda</h2>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            Crie seu primeiro orçamento e veja os cálculos automatizados em segundos.
          </p>
          <Button onClick={onNewOrcamento} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Últimos Orçamentos</h2>
            <Button size="sm" onClick={onNewOrcamento} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-1 h-3 w-3" /> Novo
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou número..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          {filtered.map(o => {
            const st = statusConfig[o.status ?? 'pendente'];
            const displayValue = (o.desconto ?? 0) > 0 ? (o.valorFinal ?? o.valorVenda) : o.valorVenda;
            return (
              <Card key={o.id} className="overflow-hidden cursor-pointer hover:border-primary/40 transition-colors" onClick={() => onEditOrcamento(o)}>
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
                        {' · '}
                        {o.itensServico.map(i => i.nomeServico).join(', ')}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); handleDuplicate(o); }} className="text-muted-foreground hover:text-primary p-1" title="Duplicar">
                        <Copy className="h-4 w-4" />
                      </button>
                      <PDFDownloadButton
                        orcamento={o}
                        cliente={clientes.find(c => c.id === o.clienteId)}
                        empresa={empresa}
                        size="icon"
                        className="h-7 w-7 p-1"
                      />
                      {(o.status === 'aprovado' || o.status === 'executado') && (
                        <OSDownloadButton
                          orcamento={o}
                          cliente={clientes.find(c => c.id === o.clienteId)}
                          empresa={empresa}
                          size="icon"
                          className="h-7 w-7 p-1"
                        />
                      )}
                      <button onClick={(e) => { e.stopPropagation(); onEditOrcamento(o); }} className="text-muted-foreground hover:text-primary p-1">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(o.id); }} className="text-muted-foreground hover:text-destructive p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Custo</p>
                      <p className="text-sm font-medium">{formatCurrency(o.custoTotalObra)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{(o.desconto ?? 0) > 0 ? 'Valor Final' : 'Valor de Venda'}</p>
                      <p className="text-lg font-bold text-accent">{formatCurrency(displayValue)}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {new Date(o.dataCriacao).toLocaleDateString('pt-BR')}
                  </p>
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
