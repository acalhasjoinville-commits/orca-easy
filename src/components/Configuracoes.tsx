import { useState } from 'react';
import { storage } from '@/lib/storage';
import { Motor1Entry, Motor2Entry, InsumoEntry, RegraCalculo, ServicoTemplate, PoliticaComercial, MotorType, ItemRegra, MetodoCalculo, getCustoUnitario } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function Configuracoes() {
  const [tab, setTab] = useState('motor1');
  const [motor1, setMotor1] = useState(storage.getMotor1());
  const [motor2, setMotor2] = useState(storage.getMotor2());
  const [insumos, setInsumos] = useState(storage.getInsumos());
  const [regras, setRegras] = useState(storage.getRegras());
  const [servicos, setServicos] = useState(storage.getServicos());
  const [politicas, setPoliticas] = useState(storage.getPoliticas());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const [form, setForm] = useState<Record<string, string>>({});
  const setField = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const [regraItens, setRegraItens] = useState<ItemRegra[]>([]);

  const openAdd = () => {
    setEditItem(null);
    setForm({});
    setRegraItens([]);
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    const f: Record<string, string> = {};
    Object.entries(item).forEach(([k, v]) => {
      if (k !== 'id' && k !== 'itensRegra') f[k] = String(v);
    });
    setForm(f);
    if (item.itensRegra) setRegraItens([...item.itensRegra]);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const id = editItem?.id || crypto.randomUUID();

    if (tab === 'motor1') {
      const entry: Motor1Entry = { id, material: form.material || '', densidade: parseFloat(form.densidade) || 0, precoQuilo: parseFloat(form.precoQuilo) || 0 };
      const updated = editItem ? motor1.map(e => e.id === id ? entry : e) : [...motor1, entry];
      setMotor1(updated); storage.setMotor1(updated);
    } else if (tab === 'motor2') {
      const entry: Motor2Entry = { id, material: form.material || '', espessura: parseFloat(form.espessura) || 0, corte: parseFloat(form.corte) || 0, precoMetroLinear: parseFloat(form.precoMetroLinear) || 0 };
      const updated = editItem ? motor2.map(e => e.id === id ? entry : e) : [...motor2, entry];
      setMotor2(updated); storage.setMotor2(updated);
    } else if (tab === 'insumos') {
      const entry: InsumoEntry = { id, nomeEmbalagemCompra: form.nomeEmbalagemCompra || '', nomeUnidadeConsumo: form.nomeUnidadeConsumo || '', precoEmbalagem: parseFloat(form.precoEmbalagem) || 0, qtdEmbalagem: parseFloat(form.qtdEmbalagem) || 1 };
      const updated = editItem ? insumos.map(e => e.id === id ? entry : e) : [...insumos, entry];
      setInsumos(updated); storage.setInsumos(updated);
    } else if (tab === 'regras') {
      const entry: RegraCalculo = { id, nomeRegra: form.nomeRegra || '', itensRegra: regraItens };
      const updated = editItem ? regras.map(e => e.id === id ? entry : e) : [...regras, entry];
      setRegras(updated); storage.setRegras(updated);
    } else if (tab === 'catalogo') {
      const entry: ServicoTemplate = {
        id, nomeServico: form.nomeServico || '',
        regraId: form.regraId || '',
        motorPadrao: (form.motorPadrao as MotorType) || 'motor1',
        materialPadrao: form.materialPadrao || '',
        espessuraPadrao: parseFloat(form.espessuraPadrao) || 0,
        cortePadrao: parseFloat(form.cortePadrao) || 0,
        dificuldadeFacil: parseFloat(form.dificuldadeFacil) || 2.6,
        dificuldadeMedia: parseFloat(form.dificuldadeMedia) || 3.5,
        dificuldadeDificil: parseFloat(form.dificuldadeDificil) || 4.6,
      };
      const updated = editItem ? servicos.map(e => e.id === id ? entry : e) : [...servicos, entry];
      setServicos(updated); storage.setServicos(updated);
    } else if (tab === 'politicas') {
      const entry: PoliticaComercial = {
        id,
        nomePolitica: form.nomePolitica || '',
        validadeDias: parseInt(form.validadeDias) || 15,
        descricaoGeral: form.descricaoGeral || '',
        formasPagamento: form.formasPagamento || '',
        garantia: form.garantia || '',
        tempoGarantia: form.tempoGarantia || '1 ano',
      };
      const updated = editItem ? politicas.map(e => e.id === id ? entry : e) : [...politicas, entry];
      setPoliticas(updated); storage.setPoliticas(updated);
    }

    setDialogOpen(false);
    toast.success(editItem ? 'Atualizado!' : 'Adicionado!');
  };

  const handleDelete = (id: string) => {
    if (tab === 'motor1') { const u = motor1.filter(e => e.id !== id); setMotor1(u); storage.setMotor1(u); }
    else if (tab === 'motor2') { const u = motor2.filter(e => e.id !== id); setMotor2(u); storage.setMotor2(u); }
    else if (tab === 'insumos') { const u = insumos.filter(e => e.id !== id); setInsumos(u); storage.setInsumos(u); }
    else if (tab === 'regras') { const u = regras.filter(e => e.id !== id); setRegras(u); storage.setRegras(u); }
    else if (tab === 'catalogo') { const u = servicos.filter(e => e.id !== id); setServicos(u); storage.setServicos(u); }
    else if (tab === 'politicas') { const u = politicas.filter(e => e.id !== id); setPoliticas(u); storage.setPoliticas(u); }
    toast.success('Removido!');
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const renderItem = (item: any, subtitle: string) => (
    <Card key={item.id} className="mb-2">
      <CardContent className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{item.material || item.nomeEmbalagemCompra || item.nomeRegra || item.nomeServico || item.nomePolitica}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => openEdit(item)} className="p-2 text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(item.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      </CardContent>
    </Card>
  );

  const materiaisUnicos = [...new Set([...motor1.map(m => m.material), ...motor2.map(m => m.material)])];
  const regraName = (id: string) => regras.find(r => r.id === id)?.nomeRegra || '—';

  const addRegraItem = () => {
    setRegraItens(prev => [...prev, { id: crypto.randomUUID(), insumoId: '', metodoCalculo: 'dividir', fator: 1 }]);
  };

  const updateRegraItem = (idx: number, field: keyof ItemRegra, value: string | number) => {
    setRegraItens(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeRegraItem = (idx: number) => {
    setRegraItens(prev => prev.filter((_, i) => i !== idx));
  };

  const renderRegraForm = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Nome da Regra</Label>
        <Input value={form.nomeRegra || ''} onChange={e => setField('nomeRegra', e.target.value)} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-semibold">Insumos da Regra</Label>
          <Button type="button" size="sm" variant="outline" onClick={addRegraItem} className="h-7 text-xs">
            <Plus className="mr-1 h-3 w-3" /> Adicionar Insumo
          </Button>
        </div>
        {regraItens.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum insumo adicionado. Clique em "+ Adicionar Insumo".</p>
        )}
        <div className="space-y-2">
          {regraItens.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg border bg-muted/20 p-2">
              <Select value={item.insumoId} onValueChange={v => updateRegraItem(idx, 'insumoId', v)}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Insumo" />
                </SelectTrigger>
                <SelectContent>
                  {insumos.map(ins => <SelectItem key={ins.id} value={ins.id}>{ins.nomeUnidadeConsumo}</SelectItem>)}
                </SelectContent>
              </Select>
               <Select value={item.metodoCalculo} onValueChange={v => updateRegraItem(idx, 'metodoCalculo', v as MetodoCalculo)}>
                <SelectTrigger className="h-8 text-xs w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiplicar">Qtd por metro:</SelectItem>
                  <SelectItem value="dividir">A cada (m):</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                inputMode="decimal"
                className="h-8 w-16 text-xs text-center"
                value={item.fator}
                onChange={e => updateRegraItem(idx, 'fator', parseFloat(e.target.value) || 0)}
              />
              <button onClick={() => removeRegraItem(idx)} className="p-1 text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCatalogoForm = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Nome do Serviço</Label>
        <Input value={form.nomeServico || ''} onChange={e => setField('nomeServico', e.target.value)} />
      </div>
      <div>
        <Label className="text-xs">Regra de Cálculo</Label>
        <Select value={form.regraId || ''} onValueChange={v => setField('regraId', v)}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {regras.map(r => <SelectItem key={r.id} value={r.id}>{r.nomeRegra}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Motor Padrão</Label>
        <Select value={form.motorPadrao || 'motor1'} onValueChange={v => setField('motorPadrao', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="motor1">Fabricar (Motor 1)</SelectItem>
            <SelectItem value="motor2">Comprar Dobrado (Motor 2)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Material Padrão</Label>
        <Select value={form.materialPadrao || ''} onValueChange={v => setField('materialPadrao', v)}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {materiaisUnicos.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Espessura (mm)</Label>
          <Input type="number" inputMode="decimal" value={form.espessuraPadrao || ''} onChange={e => setField('espessuraPadrao', e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Corte (mm)</Label>
          <Input type="number" inputMode="decimal" value={form.cortePadrao || ''} onChange={e => setField('cortePadrao', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Fator Fácil</Label>
          <Input type="number" inputMode="decimal" value={form.dificuldadeFacil || ''} onChange={e => setField('dificuldadeFacil', e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Fator Médio</Label>
          <Input type="number" inputMode="decimal" value={form.dificuldadeMedia || ''} onChange={e => setField('dificuldadeMedia', e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Fator Difícil</Label>
          <Input type="number" inputMode="decimal" value={form.dificuldadeDificil || ''} onChange={e => setField('dificuldadeDificil', e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderPoliticaForm = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Nome da Política</Label>
        <Input value={form.nomePolitica || ''} onChange={e => setField('nomePolitica', e.target.value)} placeholder="Ex: Padrão Residencial" />
      </div>
      <div>
        <Label className="text-xs">Validade (dias)</Label>
        <Input type="number" inputMode="numeric" value={form.validadeDias || ''} onChange={e => setField('validadeDias', e.target.value)} placeholder="15" />
      </div>
      <div>
        <Label className="text-xs">Descrição Geral</Label>
        <Textarea value={form.descricaoGeral || ''} onChange={e => setField('descricaoGeral', e.target.value)}
          placeholder="Descreva o escopo padrão do serviço..." rows={2} className="text-sm" />
      </div>
      <div>
        <Label className="text-xs">Formas de Pagamento</Label>
        <Textarea value={form.formasPagamento || ''} onChange={e => setField('formasPagamento', e.target.value)}
          placeholder="Condições de pagamento padrão..." rows={2} className="text-sm" />
      </div>
      <div>
        <Label className="text-xs">Garantia</Label>
        <Textarea value={form.garantia || ''} onChange={e => setField('garantia', e.target.value)}
          placeholder="Termos de garantia padrão..." rows={2} className="text-sm" />
      </div>
    </div>
  );

  const simpleFields: Record<string, { label: string; key: string; type?: string }[]> = {
    motor1: [
      { label: 'Material', key: 'material' },
      { label: 'Densidade (g/cm³)', key: 'densidade', type: 'number' },
      { label: 'Preço/Kg (R$)', key: 'precoQuilo', type: 'number' },
    ],
    motor2: [
      { label: 'Material', key: 'material' },
      { label: 'Espessura (mm)', key: 'espessura', type: 'number' },
      { label: 'Corte/Largura (mm)', key: 'corte', type: 'number' },
      { label: 'Preço/Metro (R$)', key: 'precoMetroLinear', type: 'number' },
    ],
    insumos: [
      { label: 'Nome da Embalagem', key: 'nomeEmbalagemCompra' },
      { label: 'Nome da Unidade de Consumo', key: 'nomeUnidadeConsumo' },
      { label: 'Preço da Embalagem (R$)', key: 'precoEmbalagem', type: 'number' },
      { label: 'Qtd na Embalagem', key: 'qtdEmbalagem', type: 'number' },
    ],
  };

  const renderFormContent = () => {
    if (tab === 'catalogo') return renderCatalogoForm();
    if (tab === 'regras') return renderRegraForm();
    if (tab === 'politicas') return renderPoliticaForm();
    return (
      <div className="space-y-3">
        {simpleFields[tab]?.map(f => (
          <div key={f.key}>
            <Label className="text-xs">{f.label}</Label>
            <Input
              type={f.type || 'text'}
              inputMode={f.type === 'number' ? 'decimal' : 'text'}
              value={form[f.key] || ''}
              onChange={e => setField(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="px-4 pb-24 pt-4">
      <h1 className="mb-4 text-xl font-bold text-primary">Configurações</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-6 mb-4">
          <TabsTrigger value="motor1" className="text-[10px] px-1">Motor 1</TabsTrigger>
          <TabsTrigger value="motor2" className="text-[10px] px-1">Motor 2</TabsTrigger>
          <TabsTrigger value="insumos" className="text-[10px] px-1">Insumos</TabsTrigger>
          <TabsTrigger value="regras" className="text-[10px] px-1">Regras</TabsTrigger>
          <TabsTrigger value="catalogo" className="text-[10px] px-1">Catálogo</TabsTrigger>
          <TabsTrigger value="politicas" className="text-[10px] px-1">Políticas</TabsTrigger>
        </TabsList>

        <Button size="sm" onClick={openAdd} className="mb-3 bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-1 h-3 w-3" /> Adicionar
        </Button>

        <TabsContent value="motor1">
          {motor1.map(e => renderItem(e, `${e.densidade} g/cm³ · ${fmt(e.precoQuilo)}/kg`))}
        </TabsContent>
        <TabsContent value="motor2">
          {motor2.map(e => renderItem(e, `${e.espessura}mm · ${e.corte}mm · ${fmt(e.precoMetroLinear)}/m`))}
        </TabsContent>
        <TabsContent value="insumos">
          {insumos.map(e => {
            const preco = e.precoEmbalagem ?? 0;
            const qtd = e.qtdEmbalagem ?? 1;
            return renderItem(e, `${fmt(preco)} / ${qtd} un = ${fmt(getCustoUnitario(e))}/un`);
          })}
        </TabsContent>
        <TabsContent value="regras">
          {regras.map(e => renderItem(e, `${e.itensRegra.length} insumo(s) vinculado(s)`))}
        </TabsContent>
        <TabsContent value="catalogo">
          {servicos.map(e => renderItem(e, `${e.materialPadrao} · ${e.espessuraPadrao}mm · ${e.cortePadrao}mm · Regra: ${regraName(e.regraId)}`))}
        </TabsContent>
        <TabsContent value="politicas">
          {politicas.map(e => renderItem(e, `${e.validadeDias} dias · ${e.formasPagamento.substring(0, 40)}...`))}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Editar' : 'Adicionar'}</DialogTitle>
          </DialogHeader>
          {renderFormContent()}
          <DialogFooter>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
