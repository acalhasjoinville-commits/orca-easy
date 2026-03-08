import { Orcamento } from '@/lib/types';
import { storage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DashboardProps {
  onNewOrcamento: () => void;
}

export function Dashboard({ onNewOrcamento }: DashboardProps) {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(storage.getOrcamentos());

  const handleDelete = (id: string) => {
    storage.deleteOrcamento(id);
    setOrcamentos(storage.getOrcamentos());
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
          {orcamentos.map(o => (
            <Card key={o.id} className="overflow-hidden">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{o.nomeCliente}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {o.itensServico.length} {o.itensServico.length === 1 ? 'serviço' : 'serviços'}
                      {' · '}
                      {o.itensServico.map(i => i.nomeServico).join(', ')}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(o.id)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Custo</p>
                    <p className="text-sm font-medium">{formatCurrency(o.custoTotalObra)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Valor de Venda</p>
                    <p className="text-lg font-bold text-accent">{formatCurrency(o.valorVenda)}</p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {new Date(o.dataCriacao).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
