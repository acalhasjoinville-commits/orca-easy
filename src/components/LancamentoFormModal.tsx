import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LancamentoFinanceiro, TipoLancamento, CATEGORIAS_DESPESA, CATEGORIAS_RECEITA } from '@/lib/types';
import { toast } from 'sonner';
import { useDraft } from '@/hooks/useDraft';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lancamento: LancamentoFinanceiro | null;
  onSave: (l: LancamentoFinanceiro) => Promise<void>;
  isSaving: boolean;
  empresaId: string;
}

interface LancamentoDraft {
  tipo: TipoLancamento;
  descricao: string;
  valor: string;
  data: string;
  categoria: string;
  observacao: string;
}

const EMPTY_DRAFT: LancamentoDraft = {
  tipo: 'despesa',
  descricao: '',
  valor: '',
  data: new Date().toISOString().slice(0, 10),
  categoria: '',
  observacao: '',
};

function draftFromLancamento(l: LancamentoFinanceiro): LancamentoDraft {
  return {
    tipo: l.tipo,
    descricao: l.descricao,
    valor: String(l.valor),
    data: l.data,
    categoria: l.categoria,
    observacao: l.observacao,
  };
}

export function LancamentoFormModal({ open, onOpenChange, lancamento, onSave, isSaving, empresaId }: Props) {
  const isEdit = !!lancamento;
  const draftKey = lancamento ? `draft:lancamento-edit:${lancamento.id}` : 'draft:lancamento-new';
  const initialDraft = lancamento ? draftFromLancamento(lancamento) : EMPTY_DRAFT;

  const [draft, setDraft, clearDraft, wasRestored] = useDraft<LancamentoDraft>(draftKey, initialDraft);

  // Show restore toast once
  useEffect(() => {
    if (open && wasRestored) {
      toast.info('Rascunho restaurado.', { duration: 2000 });
    }
  }, [open, wasRestored]);

  // When modal opens, seed from entity if no draft exists
  useEffect(() => {
    if (!open) return;
    if (lancamento) {
      const stored = sessionStorage.getItem(draftKey);
      if (!stored) {
        setDraft(draftFromLancamento(lancamento));
      }
    } else {
      const stored = sessionStorage.getItem('draft:lancamento-new');
      if (!stored) {
        setDraft({ ...EMPTY_DRAFT, data: new Date().toISOString().slice(0, 10) });
      }
    }
  }, [open, lancamento?.id]);

  const { tipo, descricao, valor, data, categoria, observacao } = draft;

  const updateField = <K extends keyof LancamentoDraft>(field: K, value: LancamentoDraft[K]) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const categorias = tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  // Reset categoria when switching tipo if current doesn't exist in new list
  useEffect(() => {
    if (categoria && !(categorias as readonly string[]).includes(categoria)) {
      updateField('categoria', '');
    }
  }, [tipo]);

  const handleClose = () => {
    clearDraft();
    onOpenChange(false);
  };

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
    clearDraft();
    onOpenChange(false);
    toast.success(isEdit ? 'Lançamento atualizado.' : 'Lançamento criado.');
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
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
                onClick={() => updateField('tipo', 'despesa')}
              >
                Despesa
              </Button>
              <Button
                type="button"
                size="sm"
                variant={tipo === 'receita' ? 'default' : 'outline'}
                className={tipo === 'receita' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}
                onClick={() => updateField('tipo', 'receita')}
              >
                Receita
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="lanc-descricao" className="text-xs text-muted-foreground">Descrição *</Label>
            <Input id="lanc-descricao" value={descricao} onChange={(e) => updateField('descricao', e.target.value)} placeholder="Ex: Compra de alumínio" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lanc-valor" className="text-xs text-muted-foreground">Valor (R$) *</Label>
              <Input id="lanc-valor" type="number" min="0.01" step="0.01" value={valor} onChange={(e) => updateField('valor', e.target.value)} placeholder="0,00" />
            </div>
            <div>
              <Label htmlFor="lanc-data" className="text-xs text-muted-foreground">Data *</Label>
              <Input id="lanc-data" type="date" value={data} onChange={(e) => updateField('data', e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Categoria *</Label>
            <Select value={categoria} onValueChange={v => updateField('categoria', v)}>
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
            <Textarea id="lanc-obs" value={observacao} onChange={(e) => updateField('observacao', e.target.value)} placeholder="Opcional..." rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
