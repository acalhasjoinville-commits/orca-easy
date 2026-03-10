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
import { ArrowLeft, Plus, Check, Trash2, ShoppingCart, Pencil, Save, X, Search, Users, FileText, Loader2, Factory, Truck, CreditCard, Shield, Clock, CalendarDays } from 'lucide-react';

import { toast } from 'sonner';
import { AddServicoModal } from './AddServicoModal';
import { PDFDownloadButton } from './PDFDownloadButton';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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

const FALLBACK_TERMO = 'CONCLUÍDO: Declaro que, nesta data, os serviços acima descritos foram conferidos, executados e entregues em perfeitas condições.';

const steps = [
  { key: 'cliente', label: 'Cliente' },
  { key: 'motor', label: 'Motor' },
  { key: 'carrinho', label: 'Carrinho' },
];

function StepIndicator({ current }: { current: 'cliente' | 'motor' | 'carrinho' }) {
  const currentIdx = steps.findIndex(s => s.key === current);
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((step, idx) => {
        const isActive = idx === currentIdx;
        const isDone = idx < currentIdx;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                isActive ? 'bg-accent text-accent-foreground shadow-md' :
                isDone ? 'bg-accent/20 text-accent' :
                'bg-muted text-muted-foreground'
              )}>
                {isDone ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span className={cn(
                'text-[10px] mt-1 font-medium',
                isActive ? 'text-accent' : isDone ? 'text-accent/70' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                'h-[2px] w-10 sm:w-16 mx-1 mt-[-12px] transition-all',
                idx < currentIdx ? 'bg-accent/40' : 'bg-border'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
  const [loadedPoliticaId, setLoadedPoliticaId] = useState<string | null>(
    editingOrcamento?.politicaComercialId ?? null
  );
  const [politicaNomeSnapshot, setPoliticaNomeSnapshot] = useState<string | null>(
    editingOrcamento?.politicaNomeSnapshot ?? null
  );
  const [termoRecebimentoOs, setTermoRecebimentoOs] = useState<string>(
    editingOrcamento?.termoRecebimentoOsSnapshot || FALLBACK_TERMO
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
      toast.error('Motor travado após adicionar item. Remova os itens para alterar o motor.', { duration: 5000 });
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
    const insumosBase = calcInsumosDinamicos(m, regra, insumosList);
    const fator = getFatorDificuldade(servico, editDificuldade);

    const existingOverrides = item.insumosOverrides;
    let cleanedOverrides: Record<string, number> | undefined = undefined;
    if (existingOverrides) {
      const filtered: Record<string, number> = {};
      for (const [insumoId, overrideQty] of Object.entries(existingOverrides)) {
        const baseInsumo = insumosBase.find(ic => ic.insumoId === insumoId);
        if (baseInsumo && overrideQty !== baseInsumo.quantidade) {
          filtered[insumoId] = overrideQty;
        }
      }
      cleanedOverrides = Object.keys(filtered).length > 0 ? filtered : undefined;
    }

    const insumosCalc = insumosBase.map(ic => {
      const override = cleanedOverrides?.[ic.insumoId];
      if (override !== undefined) {
        return { ...ic, quantidade: override, custoTotal: override * ic.custoUnitario };
      }
      return ic;
    });

    const custoTotalInsumos = insumosCalc.reduce((s, i) => s + i.custoTotal, 0);
    const custoTotalObra = custoTotalMaterial + custoTotalInsumos;
    const valorVenda = custoTotalObra * fator;
    setItens(prev => prev.map(i => i.id !== item.id ? i : {
      ...i, metragem: m, dificuldade: editDificuldade, fatorDificuldade: fator,
      custoMetroLinear, custoTotalMaterial, insumosCalculados: insumosCalc,
      custoTotalInsumos, custoTotalObra, valorVenda,
      insumosOverrides: cleanedOverrides,
    }));
    setEditingItemId(null);
    toast.success('Item atualizado!');
  };

  const TEMPO_GARANTIA_OPTIONS = ['3 meses', '6 meses', '1 ano', '2 anos', '3 anos', '5 anos'];

  const loadPolitica = (politicaId: string) => {
    const pol = politicas.find(p => p.id === politicaId);
    if (!pol) return;
    setLoadedPoliticaId(pol.id);
    setPoliticaNomeSnapshot(pol.nomePolitica);
    setValidade(`${pol.validadeDias} dias`);
    setFormasPagamento(pol.formasPagamento);
    setGarantia(pol.garantia);
    setTempoGarantia(pol.tempoGarantia || '');
    setTermoRecebimentoOs(pol.termoRecebimentoOs || FALLBACK_TERMO);
    toast.success(`Política "${pol.nomePolitica}" carregada!`);
  };

  const dificuldadeLabel: Record<Dificuldade, string> = {
    facil: 'Fácil', medio: 'Médio', dificil: 'Difícil',
  };

  const saveAndGetOrcamento = async (): Promise<Orcamento | null> => {
    if (isSaving) return null;
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
      politicaComercialId: loadedPoliticaId ?? null,
      politicaNomeSnapshot: politicaNomeSnapshot ?? null,
      validadeSnapshot: validade,
      formasPagamentoSnapshot: formasPagamento,
      garantiaSnapshot: garantia,
      tempoGarantiaSnapshot: tempoGarantia,
      termoRecebimentoOsSnapshot: termoRecebimentoOs,
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

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    if (itens.length === 0 || !selectedCliente) return;
    setIsSaving(true);
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
      politicaComercialId: loadedPoliticaId ?? null,
      politicaNomeSnapshot: politicaNomeSnapshot ?? null,
      validadeSnapshot: validade,
      formasPagamentoSnapshot: formasPagamento,
      garantiaSnapshot: garantia,
      tempoGarantiaSnapshot: tempoGarantia,
      termoRecebimentoOsSnapshot: termoRecebimentoOs,
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
    } finally {
      setIsSaving(false);
    }
  };

  // Phase 1: Client selection
  if (phase === 'cliente') {
    return (
      <div className="px-4 pb-24 pt-4 max-w-2xl mx-auto">
        <StepIndicator current="cliente" />
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground">Selecionar Cliente</h1>
          <p className="text-sm text-muted-foreground mt-1">Escolha o cliente para este orçamento</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar cliente..." value={clienteSearch}
              onChange={e => setClienteSearch(e.target.value)} className="pl-9" autoFocus />
          </div>

          {loadingClientes ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2">
              {filteredClientes.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground font-medium">
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
                      'w-full text-left rounded-lg border p-3.5 transition-all',
                      selectedClienteId === c.id
                        ? 'border-accent bg-accent/10 shadow-sm'
                        : 'border-border hover:border-primary/30'
                    )}>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">{c.tipo}</span>
                      <p className="text-sm font-medium truncate">{c.nomeRazaoSocial}</p>
                      {selectedClienteId === c.id && <Check className="h-4 w-4 text-accent ml-auto shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{c.documento} · {c.whatsapp}</p>
                  </button>
                ))
              )}
            </div>
          )}

          <Button onClick={() => setPhase('motor')} disabled={!selectedClienteId}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-semibold">
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  // Phase 1.5: Motor selection
  if (phase === 'motor') {
    return (
      <div className="px-4 pb-24 pt-4 max-w-2xl mx-auto">
        <StepIndicator current="motor" />
        <div className="mb-5">
          <button onClick={() => hasItems ? setPhase('carrinho') : setPhase('cliente')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <h1 className="text-xl font-bold text-foreground">Tipo de Orçamento</h1>
          <p className="text-sm text-muted-foreground mt-1">Selecione o motor de cálculo para este orçamento</p>
        </div>

        <div className="space-y-4">
          {hasItems && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">Motor travado: remova todos os itens para alterar.</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleMotorSelect('motor1')}
              disabled={hasItems}
              className={cn(
                'flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all disabled:cursor-not-allowed disabled:opacity-70',
                motorType === 'motor1'
                  ? 'border-accent bg-accent/10 text-accent shadow-sm'
                  : 'border-border text-muted-foreground hover:border-primary/30'
              )}
            >
              <Factory className="h-10 w-10" />
              <div className="text-center">
                <span className="text-sm font-bold block">Motor 1</span>
                <span className="text-[11px] text-muted-foreground">Fabricar</span>
              </div>
            </button>
            <button
              onClick={() => handleMotorSelect('motor2')}
              disabled={hasItems}
              className={cn(
                'flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all disabled:cursor-not-allowed disabled:opacity-70',
                motorType === 'motor2'
                  ? 'border-accent bg-accent/10 text-accent shadow-sm'
                  : 'border-border text-muted-foreground hover:border-primary/30'
              )}
            >
              <Truck className="h-10 w-10" />
              <div className="text-center">
                <span className="text-sm font-bold block">Motor 2</span>
                <span className="text-[11px] text-muted-foreground">Comprar Dobrado</span>
              </div>
            </button>
          </div>
          <Button onClick={() => setPhase('carrinho')}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-semibold">
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  const currentStatus = statusOptions.find(s => s.value === status)!;
  const corDestaque = empresa?.corDestaque || '#F57C00';

  // Phase 2: Cart
  return (
    <div className="px-4 pb-28 pt-4 max-w-2xl mx-auto">
      {!isEditing && <StepIndicator current="carrinho" />}

      {/* Header */}
      <div className="mb-5">
        <button onClick={handleBackFromCart} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" /> {isEditing ? 'Voltar para lista' : 'Voltar'}
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEditing ? `Orçamento #${editingOrcamento?.numeroOrcamento}` : 'Carrinho'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {selectedCliente?.nomeRazaoSocial ?? editingOrcamento?.nomeCliente}
              {' · '}{motorType === 'motor1' ? 'Motor 1' : 'Motor 2'}
            </p>
          </div>
          <Select value={status} onValueChange={v => setStatus(v as StatusOrcamento)}>
            <SelectTrigger className={cn('h-8 w-auto text-xs font-semibold border', currentStatus.color)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Services section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Serviços</h2>
            {hasItems && <p className="text-xs text-muted-foreground">{itens.length} {itens.length === 1 ? 'item' : 'itens'}</p>}
          </div>
          <Button onClick={() => setModalOpen(true)} size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1.5 h-4 w-4" /> Adicionar
          </Button>
        </div>

        {itens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed border-border">
            <ShoppingCart className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground font-medium">Nenhum serviço adicionado</p>
            <p className="text-xs text-muted-foreground mt-0.5">Clique em "Adicionar" para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {itens.map((item, idx) => (
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
                        <div className="flex items-start gap-2.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground mt-0.5 shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">{item.nomeServico}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.metragem}m · {dificuldadeLabel[item.dificuldade]} · {item.materialId}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 ml-2">
                          <button onClick={() => startEditItem(item)} className="text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-muted transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleRemoveItem(item.id)} className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-muted transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground ml-8.5 pl-[34px]">
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
      </div>

      {/* Financial summary inline card */}
      {hasItems && (
        <Card className="mb-6 border-accent/20">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Resumo Financeiro</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Custo Total</span>
                <span className="font-medium">{fmt(totalCusto)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor de Venda</span>
                <span className="font-medium">{fmt(totalVenda)}</span>
              </div>
              {descontoNum > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Desconto</span>
                  <span className="font-medium text-destructive">-{fmt(descontoNum)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-foreground">Valor Final</span>
                <span className="text-xl font-bold text-accent">{fmt(valorFinal)}</span>
              </div>
              {totalVenda > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Margem</span>
                  <span className={cn(
                    'font-medium',
                    ((1 - totalCusto / valorFinal) * 100) >= 30 ? 'text-green-600' : 'text-yellow-600'
                  )}>
                    {((1 - totalCusto / valorFinal) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commercial details section */}
      {hasItems && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Condições Comerciais</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Termos, prazos e garantias do orçamento</p>
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

            {loadedPoliticaId && (
              <div>
                <Label className="text-xs">Termo de Recebimento (OS)</Label>
                <Textarea
                  value={termoRecebimentoOs}
                  onChange={e => setTermoRecebimentoOs(e.target.value)}
                  rows={3}
                  className="text-sm"
                  placeholder="Texto do canhoto de entrega da OS..."
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Este texto aparece no canhoto de entrega da Ordem de Serviço.
                </p>
              </div>
            )}

            {/* Validade + Desconto row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3 text-muted-foreground" /> Validade
                </Label>
                <Input value={validade} onChange={e => setValidade(e.target.value)} placeholder="Ex: 15 dias" className="h-9" />
              </div>
              <div>
                <Label className="text-xs">Desconto (R$)</Label>
                <Input type="number" inputMode="decimal" value={desconto} onChange={e => setDesconto(e.target.value)} placeholder="0" className="h-9" />
              </div>
            </div>

            {/* Escopo */}
            <div>
              <Label className="text-xs flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-muted-foreground" /> Escopo do Serviço
              </Label>
              <Textarea value={descricaoGeral} onChange={e => setDescricaoGeral(e.target.value)}
                placeholder="Ex: Instalação de calhas no beiral frontal e rufos na platibanda lateral..." rows={3} className="text-sm" />
            </div>

            {/* Pagamento */}
            <div>
              <Label className="text-xs flex items-center gap-1.5">
                <CreditCard className="h-3 w-3 text-muted-foreground" /> Formas de Pagamento
              </Label>
              <Textarea value={formasPagamento} onChange={e => setFormasPagamento(e.target.value)}
                placeholder="Condições de pagamento..." rows={2} className="text-sm" />
            </div>

            <Separator />

            {/* Garantia group */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" /> Garantia
              </h3>
              <div>
                <Label className="text-xs">Tempo de Garantia</Label>
                <Select value={tempoGarantia} onValueChange={setTempoGarantia}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione..." />
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simplified sticky footer */}
      {hasItems && (
        <div className="fixed bottom-16 lg:bottom-0 left-0 lg:left-64 right-0 z-40 border-t bg-card/95 backdrop-blur-sm shadow-lg">
          <div className="mx-auto max-w-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Valor Final</p>
                <p className="text-lg font-bold" style={{ color: corDestaque }}>{fmt(valorFinal)}</p>
              </div>
              <div className="flex gap-2">
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
                <Button onClick={handleSave} disabled={isSaving} className="h-11 px-6" style={{ backgroundColor: corDestaque, color: '#fff' }}>
                  {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Salvar</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddServicoModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAddItem} motorType={motorType} />
    </div>
  );
}
