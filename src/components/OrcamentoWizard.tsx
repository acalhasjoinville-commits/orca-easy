import { useState } from 'react';
import { storage } from '@/lib/storage';
import { ItemServico, Orcamento } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Check, Trash2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { AddServicoModal } from './AddServicoModal';

interface Props { onDone: () => void; }

export function OrcamentoWizard({ onDone }: Props) {
  const [phase, setPhase] = useState<'cliente' | 'carrinho'>('cliente');
  const [nomeCliente, setNomeCliente] = useState('');
  const [itens, setItens] = useState<ItemServico[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const totalCusto = itens.reduce((s, i) => s + i.custoTotalObra, 0);
  const totalVenda = itens.reduce((s, i) => s + i.valorVenda, 0);

  const handleAddItem = (item: ItemServico) => {
    setItens(prev => [...prev, item]);
    setModalOpen(false);
    toast.success('Serviço adicionado!');
  };

  const handleRemoveItem = (id: string) => {
    setItens(prev => prev.filter(i => i.id !== id));
  };

  const handleSave = () => {
    if (itens.length === 0) return;
    const orcamento: Orcamento = {
      id: crypto.randomUUID(),
      nomeCliente,
      itensServico: itens,
      custoTotalObra: totalCusto,
      valorVenda: totalVenda,
      dataCriacao: new Date().toISOString(),
    };
    storage.addOrcamento(orcamento);
    toast.success('Orçamento salvo com sucesso!');
    onDone();
  };

  // Phase 1: Client name
  if (phase === 'cliente') {
    return (
      <div className="px-4 pb-24 pt-4">
        <h1 className="text-lg font-bold text-primary mb-6">Novo Orçamento</h1>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Label>Nome do Cliente</Label>
            <Input
              placeholder="Ex: João da Silva"
              value={nomeCliente}
              onChange={e => setNomeCliente(e.target.value)}
              autoFocus
            />
            <Button
              onClick={() => setPhase('carrinho')}
              disabled={!nomeCliente.trim()}
              className="w-full bg-primary text-primary-foreground h-12"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Phase 2: Cart
  return (
    <div className="px-4 pb-36 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => setPhase('cliente')} className="text-primary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-primary">Detalhes do Orçamento</h1>
          <p className="text-xs text-muted-foreground">Cliente: {nomeCliente}</p>
        </div>
      </div>

      {/* Add service button */}
      <Button
        onClick={() => setModalOpen(true)}
        className="w-full mb-4 bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base"
      >
        <Plus className="mr-2 h-5 w-5" /> Adicionar Serviço
      </Button>

      {/* Items list */}
      {itens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhum serviço adicionado ainda.</p>
          <p className="text-xs text-muted-foreground">Clique em "+ Adicionar Serviço" para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {itens.map((item, idx) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold">{item.nomeServico}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.metragem}m · {item.motorType === 'motor1' ? 'Motor 1' : 'Motor 2'}
                    </p>
                  </div>
                  <button onClick={() => handleRemoveItem(item.id)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Custo: {fmt(item.custoTotalObra)}</span>
                  <span className="font-semibold text-accent text-sm">{fmt(item.valorVenda)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Fixed bottom total panel */}
      {itens.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-card shadow-lg">
          <div className="mx-auto max-w-lg px-4 py-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Custo Total</span>
              <span className="font-medium">{fmt(totalCusto)}</span>
            </div>
            <div className="flex justify-between items-end mb-3">
              <span className="text-base font-semibold">Valor de Venda</span>
              <span className="text-xl font-bold text-accent">{fmt(totalVenda)}</span>
            </div>
            <Button onClick={handleSave} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11">
              <Check className="mr-2 h-5 w-5" /> Gerar Proposta ({itens.length} {itens.length === 1 ? 'item' : 'itens'})
            </Button>
          </div>
        </div>
      )}

      <AddServicoModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAddItem} />
    </div>
  );
}
