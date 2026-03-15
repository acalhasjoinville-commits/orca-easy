import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LancamentoFinanceiro, TipoLancamento, CATEGORIAS_DESPESA, CATEGORIAS_RECEITA } from '@/lib/types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lancamento: LancamentoFinanceiro | null;
  onSave: (l: LancamentoFinanceiro) => Promise<void>;
  isSaving: boolean;
  empresaId: string;
}

export function LancamentoFormModal({ open, onOpenChange, lancamento, onSave, isSaving, empresaId }: Props) {
  const isEdit = !!lancamento;

  const [tipo, setTipo] = useState<TipoLancamento>('despesa');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [categoria, setCategoria] = useState('');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    if (open) {
      if (lancamento) {
        setTipo(lancamento.tipo);
        setDescricao(lancamento.descricao);
        setValor(String(lancamento.valor));
        setData(lancamento.data);
        setCategoria(lancamento.categoria);
        setObservacao(lancamento.observacao);
      } else {
        setTipo('despesa');
        setDescricao('');
        setValor('');
        setData(new Date().toISOString().slice(0, 10));
        setCategoria('');
        setObservacao('');
      }
    }
  }, [open, lancamento]);

  const categorias = tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  // Reset categoria when switching tipo if current doesn't exist in new list
  useEffect(() => {
    if (categoria && !(categorias as readonly string[]).includes(categoria)) {
      setCategoria('');
    }
  }, [tipo]);

  const handleSave = async () => {
    if (!descricao.trim()) { toast.error('Informe a descrição.'); return; }
    const numVal = parseFloat(valor);
    if (!numVal || numVal <= 0) { toast.error('Informe um valor positivo.'); return; }
    if (!data) { toast.error('Informe a data.'); return; }
    if (!categoria) { toast.error('Selecione a categoria.'); return; }

    await onSave({
      id: lancamento?.id || crypto.randomUUID(),
      empresaId,
      tipo,
      descricao: descricao.trim(),
      valor: Math.abs(numVal),
      data,
      categoria,
      observacao: observacao.trim(),
      origem: 'manual',
    });
    onOpenChange(false);
    toast.success(isEdit ? 'Lançamento atualizado.' : 'Lançamento criado.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Tipo toggle */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Tipo</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={tipo === 'despesa' ? 'default' : 'outline'}
                className={tipo === 'despesa' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                onClick={() => setTipo('despesa')}
              >
                Despesa
              </Button>
              <Button
                type="button"
                size="sm"
                variant={tipo === 'receita' ? 'default' : 'outline'}
                className={tipo === 'receita' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}
                onClick={() => setTipo('receita')}
              >
                Receita
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="lanc-descricao" className="text-xs text-muted-foreground">Descrição *</Label>
            <Input id="lanc-descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Compra de alumínio" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lanc-valor" className="text-xs text-muted-foreground">Valor (R$) *</Label>
              <Input id="lanc-valor" type="number" min="0.01" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
            </div>
            <div>
              <Label htmlFor="lanc-data" className="text-xs text-muted-foreground">Data *</Label>
              <Input id="lanc-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Categoria *</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="lanc-obs" className="text-xs text-muted-foreground">Observação</Label>
            <Textarea id="lanc-obs" value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Opcional..." rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
