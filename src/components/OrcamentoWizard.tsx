import { useState, useMemo, useCallback } from 'react';
import { useMotor1, useMotor2, useInsumos, useRegras, useServicos } from '@/hooks/useSupabaseTechnicalData';
import { useClientes, useOrcamentos, usePoliticas, useEmpresa } from '@/hooks/useSupabaseData';
import { ItemServico, Orcamento, Dificuldade, StatusOrcamento, PoliticaComercial, MotorType } from '@/lib/types';
import { calcCustoMetroMotor1, calcCustoMetroMotor2, calcInsumosDinamicos, getFatorDificuldade } from '@/lib/calcEngine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Check, Trash2, ShoppingCart, Pencil, Save, X, Search, Users, FileText, Loader2, Factory, Truck } from 'lucide-react';

import { toast } from 'sonner';
import { AddServicoModal } from './AddServicoModal';
import { PDFDownloadButton } from './PDFDownloadButton';
import { cn } from '@/lib/utils';

interface Props {
  onDone: () => void;
  editingOrcamento?: Orcamento | null;
}

const statusOptions: { value: StatusOrcamento; label: string; color: string }[] = [
  { value: 'pendente', label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
  { value: 'aprovado', label: 'Aprovado', color: 'bg-green-500/20 text-green-700 border-green-500/30' },
  { value: 'rejeitado', label: 'Rejeitado', color: 'bg-red-500/20 text-red-700 border-red-500/30' },
  { value: 'executado', label: 'Executado', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
];

export function OrcamentoWizard({ onDone, editingOrcamento }: Props) {
  const isEditing = !!editingOrcamento;
  const [phase, setPhase] = useState<'cliente' | 'motor' | 'carrinho'>(isEditing ? 'carrinho' : 'cliente');
  const [selectedClienteId, setSelectedClienteId] = useState(editingOrcamento?.clienteId ?? '');
  const [clienteSearch, setClienteSearch] = useState('');
  const [motorType, setMotorType] = useState<MotorType>(editingOrcamento?.motorType ?? 'motor1');
  const [itens, setItens] = useState<ItemServico[]>(editingOrcamento?.itensServico ?? []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editMetragem, setEditMetragem] = useState('');
  const [editDificuldade, setEditDificuldade] = useState<Dificuldade>('facil');

  const [status, setStatus] = useState<StatusOrcamento>(editingOrcamento?.status ?? 'pendente');
  const [desconto, setDesconto] = useState(String(editingOrcamento?.desconto ?? 0));
  const [validade, setValidade] = useState(editingOrcamento?.validade ?? '');
  const [descricaoGeral, setDescricaoGeral] = useState(editingOrcamento?.descricaoGeral ?? '');
  const [formasPagamento, setFormasPagamento] = useState(editingOrcamento?.formasPagamento ?? '');
  const [garantia, setGarantia] = useState(editingOrcamento?.garantia ?? '');
  const [tempoGarantia, setTempoGarantia] = useState(editingOrcamento?.tempoGarantia ?? '');
  // Track which policy was last loaded (for snapshot linkage)
  const [loadedPoliticaId, setLoadedPoliticaId] = useState<string | null>(
    editingOrcamento?.politicaComercialId ?? null
  );

  const { clientes, isLoading: loadingClientes } = useClientes();
  const { politicas } = usePoliticas();
  const { getNextNumero, addOrcamento, updateOrcamento } = useOrcamentos();
  const { empresa } = useEmpresa();
  const { servicos: servicosList } = useServicos();
  const { regras: regrasList } = useRegras();
  const { motor1: motor1List } = useMotor1();
  const { motor2: motor2List } = useMotor2();
  const { insumos: insumosList } = useInsumos();

  const selectedCliente = clientes.find(c => c.id === selectedClienteId);

  const filteredClientes = clientes.filter(c =>
    c.nomeRazaoSocial.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    c.documento.includes(clienteSearch)
  );

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const totalCusto = itens.reduce((s, i) => s + i.custoTotalObra, 0);
  const totalVenda = itens.reduce((s, i) => s + i.valorVenda, 0);
  const descontoNum = parseFloat(desconto) || 0;
  const valorFinal = Math.max(totalVenda - descontoNum, 0);
  const hasItems = itens.length > 0;

  const handleBackFromCart = () => {
    if (isEditing) {
      onDone();
      return;
    }

    if (hasItems) {
      toast.error('Motor travado após adicionar item. Remova os itens para alterar o motor.');
      return;
    }

    setPhase('motor');
  };

  const handleMotorSelect = (nextMotor: MotorType) => {
    if (hasItems && nextMotor !== motorType) {
      toast.error('Motor travado após adicionar item.');
      return;
    }
    setMotorType(nextMotor);
  };

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
    const servico = servicosList.find(s => s.id === item.servicoTemplateId);
    const regra = servico ? regrasList.find(r => r.id === servico.regraId) : null;
    if (!servico || !regra) return;

    // Use item.motorType (the motor chosen at quote time), NOT servico fields
    let custoMetroLinear: number;
    if (item.motorType === 'motor1') {
      const motor1 = motor1List.find(e => e.material === item.materialId);
      if (!motor1) return;
      custoMetroLinear = calcCustoMetroMotor1(item.espessura, item.corte, motor1);
    } else {
      const resultado = calcCustoMetroMotor2(item.materialId, item.espessura, item.corte, motor2List);
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

  const TEMPO_GARANTIA_OPTIONS = ['3 meses', '6 meses', '1 ano', '2 anos', '3 anos', '5 anos'];

  const loadPolitica = (politicaId: string) => {
    const pol = politicas.find(p => p.id === politicaId);
    if (!pol) return;
    setValidade(`${pol.validadeDias} dias`);
    setFormasPagamento(pol.formasPagamento);
    setGarantia(pol.garantia);
    setTempoGarantia(pol.tempoGarantia || '');
    toast.success(`Política "${pol.nomePolitica}" carregada!`);
  };

  const dificuldadeLabel: Record<Dificuldade, string> = {
    facil: 'Fácil', medio: 'Médio', dificil: 'Difícil',
  };

  const saveAndGetOrcamento = async (): Promise<Orcamento | null> => {
    if (itens.length === 0 || !selectedCliente) return null;
    const base = {
      clienteId: selectedCliente.id,
      nomeCliente: selectedCliente.nomeRazaoSocial,
      motorType,
      itensServico: itens,
      custoTotalObra: totalCusto,
      valorVenda: totalVenda,
      desconto: descontoNum,
      valorFinal,
      status,
      validade,
      descricaoGeral,
      formasPagamento,
      garantia,
      tempoGarantia,
    };
    if (isEditing && editingOrcamento) {
      const orc = { ...editingOrcamento, ...base };
      await updateOrcamento.mutateAsync(orc);
      return orc;
    } else {
      const nextNum = await getNextNumero();
      const orc: Orcamento = {
        id: crypto.randomUUID(),
        numeroOrcamento: nextNum,
        dataCriacao: new Date().toISOString(),
        ...base,
      };
      await addOrcamento.mutateAsync(orc);
      return orc;
    }
  };

  const handleSave = async () => {
    if (itens.length === 0 || !selectedCliente) return;
    const base = {
      clienteId: selectedCliente.id,
      nomeCliente: selectedCliente.nomeRazaoSocial,
      motorType,
      itensServico: itens,
      custoTotalObra: totalCusto,
      valorVenda: totalVenda,
      desconto: descontoNum,
      valorFinal,
      status,
      validade,
      descricaoGeral,
      formasPagamento,
      garantia,
      tempoGarantia,
    };
    try {
      if (isEditing && editingOrcamento) {
        await updateOrcamento.mutateAsync({ ...editingOrcamento, ...base });
        toast.success('Orçamento atualizado!');
      } else {
        const nextNum = await getNextNumero();
        const orcamento: Orcamento = {
          id: crypto.randomUUID(),
          numeroOrcamento: nextNum,
          dataCriacao: new Date().toISOString(),
          ...base,
        };
        await addOrcamento.mutateAsync(orcamento);
        toast.success('Orçamento salvo com sucesso!');
      }
      onDone();
    } catch {
      toast.error('Erro ao salvar orçamento.');
    }
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

            {loadingClientes ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
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
            )}

            <Button onClick={() => setPhase('motor')} disabled={!selectedClienteId}
              className="w-full bg-primary text-primary-foreground h-12">
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Phase 1.5: Motor selection
  if (phase === 'motor') {
    return (
      <div className="px-4 pb-24 pt-4">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => hasItems ? setPhase('carrinho') : setPhase('cliente')} className="text-primary">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-primary">Tipo de Orçamento</h1>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Label>Selecionar Motor do Orçamento</Label>
            <p className="text-xs text-muted-foreground">Todos os serviços deste orçamento usarão o motor selecionado.</p>
            {hasItems && (
              <p className="text-xs text-destructive">Motor travado: remova todos os itens para alterar.</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleMotorSelect('motor1')}
                disabled={hasItems}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-5 transition-all disabled:cursor-not-allowed disabled:opacity-70',
                  motorType === 'motor1'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                )}
              >
                <Factory className="h-8 w-8" />
                <span className="text-sm font-semibold">Motor 1</span>
                <span className="text-[10px]">Fabricar</span>
              </button>
              <button
                onClick={() => handleMotorSelect('motor2')}
                disabled={hasItems}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-5 transition-all disabled:cursor-not-allowed disabled:opacity-70',
                  motorType === 'motor2'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                )}
              >
                <Truck className="h-8 w-8" />
                <span className="text-sm font-semibold">Motor 2</span>
                <span className="text-[10px]">Comprar Dobrado</span>
              </button>
            </div>
            <Button onClick={() => setPhase('carrinho')}
              className="w-full bg-primary text-primary-foreground h-12">
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatus = statusOptions.find(s => s.value === status)!;
  const corDestaque = empresa?.corDestaque || '#F57C00';

  // Phase 2: Cart
  return (
    <div className="px-4 pb-36 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={handleBackFromCart} className="text-primary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-primary">
            {isEditing ? `Orçamento Nº ${editingOrcamento?.numeroOrcamento}` : 'Detalhes do Orçamento'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Cliente: {selectedCliente?.nomeRazaoSocial ?? editingOrcamento?.nomeCliente}
            {' · '}{motorType === 'motor1' ? 'Motor 1 (Fabricar)' : 'Motor 2 (Comprar Dobrado)'}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <Select value={status} onValueChange={v => setStatus(v as StatusOrcamento)}>
          <SelectTrigger className={cn('h-9 w-fit text-xs font-semibold border', currentStatus.color)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {/* Commercial details section */}
      {itens.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-primary flex items-center gap-2">
                <FileText className="h-4 w-4" /> Detalhes Comerciais
              </h2>
            </div>

            {politicas.length > 0 && (
              <div>
                <Label className="text-xs">Carregar Política Padrão</Label>
                <Select onValueChange={loadPolitica}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione uma política..." />
                  </SelectTrigger>
                  <SelectContent>
                    {politicas.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nomePolitica}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Validade</Label>
                <Input value={validade} onChange={e => setValidade(e.target.value)} placeholder="Ex: 15 dias" className="h-9" />
              </div>
              <div>
                <Label className="text-xs">Desconto (R$)</Label>
                <Input type="number" inputMode="decimal" value={desconto} onChange={e => setDesconto(e.target.value)} placeholder="0" className="h-9" />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">📋 Escopo do Serviço</Label>
              <Textarea value={descricaoGeral} onChange={e => setDescricaoGeral(e.target.value)}
                placeholder="Ex: Instalação de calhas no beiral frontal e rufos na platibanda lateral..." rows={3} className="text-sm" />
            </div>
            <div>
              <Label className="text-xs">Formas de Pagamento</Label>
              <Textarea value={formasPagamento} onChange={e => setFormasPagamento(e.target.value)}
                placeholder="Condições de pagamento..." rows={2} className="text-sm" />
            </div>
            {/* Tempo de Garantia - highlighted */}
            <div className="rounded-lg border-2 border-accent/30 bg-accent/5 p-3">
              <Label className="text-sm font-bold text-accent flex items-center gap-2">
                🛡️ Tempo de Garantia
              </Label>
              <Select value={tempoGarantia} onValueChange={setTempoGarantia}>
                <SelectTrigger className="h-10 mt-1 border-accent/30 text-base font-semibold">
                  <SelectValue placeholder="Selecione a garantia..." />
                </SelectTrigger>
                <SelectContent>
                  {TEMPO_GARANTIA_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Detalhes da Garantia</Label>
              <Textarea value={garantia} onChange={e => setGarantia(e.target.value)}
                placeholder="Termos de garantia..." rows={2} className="text-sm" />
            </div>
          </CardContent>
        </Card>
      )}

      {itens.length > 0 && (
        <div className="fixed bottom-16 lg:bottom-0 left-0 lg:left-64 right-0 z-40 border-t bg-card shadow-lg">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Custo Total</span>
              <span className="font-medium">{fmt(totalCusto)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Valor de Venda</span>
              <span className="font-medium">{fmt(totalVenda)}</span>
            </div>
            {descontoNum > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Desconto</span>
                <span className="font-medium text-destructive">-{fmt(descontoNum)}</span>
              </div>
            )}
            <div className="flex justify-between items-end mb-3">
              <span className="text-base font-semibold">Valor Final</span>
              <span className="text-xl font-bold" style={{ color: corDestaque }}>{fmt(valorFinal)}</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 h-11" style={{ backgroundColor: corDestaque, color: '#fff' }}>
                {isEditing ? (
                  <><Save className="mr-2 h-5 w-5" /> Salvar</>
                ) : (
                  <><Check className="mr-2 h-5 w-5" /> Salvar ({itens.length})</>
                )}
              </Button>
              {isEditing && editingOrcamento && (
                <PDFDownloadButton
                  orcamento={{
                    ...editingOrcamento,
                    itensServico: itens,
                    custoTotalObra: totalCusto,
                    valorVenda: totalVenda,
                    desconto: descontoNum,
                    valorFinal,
                    status,
                    validade,
                    descricaoGeral,
                    formasPagamento,
                    garantia,
                    tempoGarantia,
                  }}
                  cliente={selectedCliente}
                  empresa={empresa}
                  size="default"
                  className="h-11"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <AddServicoModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAddItem} motorType={motorType} />
    </div>
  );
}
