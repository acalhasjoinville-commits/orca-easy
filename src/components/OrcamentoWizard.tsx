import { useState, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { ItemServico, Orcamento, Dificuldade, Cliente } from '@/lib/types';
import { calcCustoMetroMotor1, calcCustoMetroMotor2, calcInsumosDinamicos, getFatorDificuldade } from '@/lib/calcEngine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Check, Trash2, ShoppingCart, Pencil, Save, X, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { AddServicoModal } from './AddServicoModal';
import { cn } from '@/lib/utils';

interface Props {
  onDone: () => void;
  editingOrcamento?: Orcamento | null;
}

export function OrcamentoWizard({ onDone, editingOrcamento }: Props) {
  const isEditing = !!editingOrcamento;
  const [phase, setPhase] = useState<'cliente' | 'carrinho'>(isEditing ? 'carrinho' : 'cliente');
  const [selectedClienteId, setSelectedClienteId] = useState(editingOrcamento?.clienteId ?? '');
  const [clienteSearch, setClienteSearch] = useState('');
  const [itens, setItens] = useState<ItemServico[]>(editingOrcamento?.itensServico ?? []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editMetragem, setEditMetragem] = useState('');
  const [editDificuldade, setEditDificuldade] = useState<Dificuldade>('facil');

  const clientes = useMemo(() => storage.getClientes(), []);
  const selectedCliente = clientes.find(c => c.id === selectedClienteId);

  const filteredClientes = clientes.filter(c =>
    c.nomeRazaoSocial.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    c.documento.includes(clienteSearch)
  );

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

  const startEditItem = (item: ItemServico) => {
    setEditingItemId(item.id);
    setEditMetragem(String(item.metragem));
    setEditDificuldade(item.dificuldade);
  };

  const cancelEditItem = () => { setEditingItemId(null); };

  const saveEditItem = (item: ItemServico) => {
    const m = parseFloat(editMetragem);
    if (isNaN(m) || m <= 0) return;
    const servicosList = storage.getServicos();
    const regrasList = storage.getRegras();
    const motor1List = storage.getMotor1();
    const motor2List = storage.getMotor2();
    const insumosList = storage.getInsumos();
    const servico = servicosList.find(s => s.id === item.servicoTemplateId);
    const regra = servico ? regrasList.find(r => r.id === servico.regraId) : null;
    if (!servico || !regra) return;
    let custoMetroLinear: number;
    if (servico.motorPadrao === 'motor1') {
      const motor1 = motor1List.find(e => e.material === servico.materialPadrao);
      if (!motor1) return;
      custoMetroLinear = calcCustoMetroMotor1(servico.espessuraPadrao, servico.cortePadrao, motor1);
    } else {
      const resultado = calcCustoMetroMotor2(servico.materialPadrao, servico.espessuraPadrao, servico.cortePadrao, motor2List);
      if (resultado === null) return;
      custoMetroLinear = resultado;
    }
    const custoTotalMaterial = custoMetroLinear * m;
    const insumosCalc = calcInsumosDinamicos(m, regra, insumosList);
    const fator = getFatorDificuldade(servico, editDificuldade);
    const custoTotalInsumos = insumosCalc.reduce((s, i) => s + i.custoTotal, 0);
    const custoTotalObra = custoTotalMaterial + custoTotalInsumos;
    const valorVenda = custoTotalObra * fator;
    setItens(prev => prev.map(i => i.id !== item.id ? i : {
      ...i, metragem: m, dificuldade: editDificuldade, fatorDificuldade: fator,
      custoMetroLinear, custoTotalMaterial, insumosCalculados: insumosCalc,
      custoTotalInsumos, custoTotalObra, valorVenda,
    }));
    setEditingItemId(null);
    toast.success('Item atualizado!');
  };

  const dificuldadeLabel: Record<Dificuldade, string> = {
    facil: 'Fácil', medio: 'Médio', dificil: 'Difícil',
  };

  const handleSave = () => {
    if (itens.length === 0 || !selectedCliente) return;
    if (isEditing && editingOrcamento) {
      const updated: Orcamento = {
        ...editingOrcamento,
        clienteId: selectedCliente.id,
        nomeCliente: selectedCliente.nomeRazaoSocial,
        itensServico: itens,
        custoTotalObra: totalCusto,
        valorVenda: totalVenda,
      };
      storage.updateOrcamento(updated);
      toast.success('Orçamento atualizado!');
    } else {
      const orcamento: Orcamento = {
        id: crypto.randomUUID(),
        clienteId: selectedCliente.id,
        nomeCliente: selectedCliente.nomeRazaoSocial,
        itensServico: itens,
        custoTotalObra: totalCusto,
        valorVenda: totalVenda,
        dataCriacao: new Date().toISOString(),
      };
      storage.addOrcamento(orcamento);
      toast.success('Orçamento salvo com sucesso!');
    }
    onDone();
  };

  // Phase 1: Client selection
  if (phase === 'cliente') {
    return (
      <div className="px-4 pb-24 pt-4">
        <h1 className="text-lg font-bold text-primary mb-4">Novo Orçamento</h1>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Label>Selecionar Cliente</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar cliente..." value={clienteSearch}
                onChange={e => setClienteSearch(e.target.value)} className="pl-9" autoFocus />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredClientes.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    {clientes.length === 0 ? 'Nenhum cliente cadastrado.' : 'Nenhum resultado.'}
                  </p>
                  {clientes.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Cadastre clientes na aba "Clientes".</p>
                  )}
                </div>
              ) : (
                filteredClientes.map(c => (
                  <button key={c.id} onClick={() => setSelectedClienteId(c.id)}
                    className={cn(
                      'w-full text-left rounded-lg border p-3 transition-all',
                      selectedClienteId === c.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-primary/30'
                    )}>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">{c.tipo}</span>
                      <p className="text-sm font-medium truncate">{c.nomeRazaoSocial}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.documento} · {c.whatsapp}</p>
                  </button>
                ))
              )}
            </div>

            <Button onClick={() => setPhase('carrinho')} disabled={!selectedClienteId}
              className="w-full bg-primary text-primary-foreground h-12">
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
        <button onClick={() => isEditing ? onDone() : setPhase('cliente')} className="text-primary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-primary">
            {isEditing ? 'Editar Orçamento' : 'Detalhes do Orçamento'}
          </h1>
          <p className="text-xs text-muted-foreground">Cliente: {selectedCliente?.nomeRazaoSocial ?? editingOrcamento?.nomeCliente}</p>
        </div>
      </div>

      <Button onClick={() => setModalOpen(true)}
        className="w-full mb-4 bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base">
        <Plus className="mr-2 h-5 w-5" /> Adicionar Serviço
      </Button>

      {itens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhum serviço adicionado ainda.</p>
          <p className="text-xs text-muted-foreground">Clique em "+ Adicionar Serviço" para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {itens.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                {editingItemId === item.id ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">{item.nomeServico}</p>
                    <div>
                      <Label className="text-xs">Metragem (m)</Label>
                      <Input type="number" inputMode="decimal" value={editMetragem}
                        onChange={e => setEditMetragem(e.target.value)} className="h-9" />
                    </div>
                    <div>
                      <Label className="text-xs">Dificuldade</Label>
                      <div className="grid grid-cols-3 gap-1.5 mt-1">
                        {(['facil', 'medio', 'dificil'] as Dificuldade[]).map(d => (
                          <button key={d} onClick={() => setEditDificuldade(d)}
                            className={cn('rounded-md border px-2 py-1.5 text-xs font-medium transition-all',
                              editDificuldade === d ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground')}>
                            {dificuldadeLabel[d]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEditItem(item)} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                        <Check className="mr-1 h-3 w-3" /> Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditItem} className="flex-1">
                        <X className="mr-1 h-3 w-3" /> Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold">{item.nomeServico}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.metragem}m · {dificuldadeLabel[item.dificuldade]} · {item.motorType === 'motor1' ? 'Motor 1' : 'Motor 2'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEditItem(item)} className="text-muted-foreground hover:text-primary p-1">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleRemoveItem(item.id)} className="text-muted-foreground hover:text-destructive p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Custo: {fmt(item.custoTotalObra)}</span>
                      <span className="font-semibold text-accent text-sm">{fmt(item.valorVenda)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
              {isEditing ? (
                <><Save className="mr-2 h-5 w-5" /> Salvar Alterações</>
              ) : (
                <><Check className="mr-2 h-5 w-5" /> Gerar Proposta ({itens.length} {itens.length === 1 ? 'item' : 'itens'})</>
              )}
            </Button>
          </div>
        </div>
      )}

      <AddServicoModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAddItem} />
    </div>
  );
}
