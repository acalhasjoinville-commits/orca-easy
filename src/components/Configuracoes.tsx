import { useState } from 'react';
import { storage } from '@/lib/storage';
import { Motor1Entry, Motor2Entry, InsumoEntry, ReceitaServico } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function Configuracoes() {
  const [tab, setTab] = useState('motor1');
  const [motor1, setMotor1] = useState(storage.getMotor1());
  const [motor2, setMotor2] = useState(storage.getMotor2());
  const [insumos, setInsumos] = useState(storage.getInsumos());
  const [receitas, setReceitas] = useState(storage.getReceitas());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Form state
  const [form, setForm] = useState<Record<string, string>>({});
  const setField = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const openAdd = () => {
    setEditItem(null);
    setForm({});
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    const f: Record<string, string> = {};
    Object.entries(item).forEach(([k, v]) => { if (k !== 'id') f[k] = String(v); });
    setForm(f);
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
      const entry: InsumoEntry = { id, nome: form.nome || '', custoUnitario: parseFloat(form.custoUnitario) || 0 };
      const updated = editItem ? insumos.map(e => e.id === id ? entry : e) : [...insumos, entry];
      setInsumos(updated); storage.setInsumos(updated);
    } else {
      const entry: ReceitaServico = {
        id, nomeServico: form.nomeServico || '',
        divisorSuporte: parseFloat(form.divisorSuporte) || 0,
        divisorPU: parseFloat(form.divisorPU) || 0,
        multiplicadorRebite: parseFloat(form.multiplicadorRebite) || 0,
        dificuldadeFacil: parseFloat(form.dificuldadeFacil) || 2.6,
        dificuldadeMedia: parseFloat(form.dificuldadeMedia) || 3.5,
        dificuldadeDificil: parseFloat(form.dificuldadeDificil) || 4.6,
      };
      const updated = editItem ? receitas.map(e => e.id === id ? entry : e) : [...receitas, entry];
      setReceitas(updated); storage.setReceitas(updated);
    }

    setDialogOpen(false);
    toast.success(editItem ? 'Atualizado!' : 'Adicionado!');
  };

  const handleDelete = (id: string) => {
    if (tab === 'motor1') { const u = motor1.filter(e => e.id !== id); setMotor1(u); storage.setMotor1(u); }
    else if (tab === 'motor2') { const u = motor2.filter(e => e.id !== id); setMotor2(u); storage.setMotor2(u); }
    else if (tab === 'insumos') { const u = insumos.filter(e => e.id !== id); setInsumos(u); storage.setInsumos(u); }
    else { const u = receitas.filter(e => e.id !== id); setReceitas(u); storage.setReceitas(u); }
    toast.success('Removido!');
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const renderItem = (item: any, subtitle: string) => (
    <Card key={item.id} className="mb-2">
      <CardContent className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{item.material || item.nome || item.nomeServico}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => openEdit(item)} className="p-2 text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(item.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      </CardContent>
    </Card>
  );

  const fields: Record<string, { label: string; key: string; type?: string }[]> = {
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
      { label: 'Nome', key: 'nome' },
      { label: 'Custo Unitário (R$)', key: 'custoUnitario', type: 'number' },
    ],
    receitas: [
      { label: 'Nome do Serviço', key: 'nomeServico' },
      { label: 'Divisor Suporte (m)', key: 'divisorSuporte', type: 'number' },
      { label: 'Divisor PU (m)', key: 'divisorPU', type: 'number' },
      { label: 'Mult. Rebite', key: 'multiplicadorRebite', type: 'number' },
      { label: 'Fator Fácil', key: 'dificuldadeFacil', type: 'number' },
      { label: 'Fator Médio', key: 'dificuldadeMedia', type: 'number' },
      { label: 'Fator Difícil', key: 'dificuldadeDificil', type: 'number' },
    ],
  };

  return (
    <div className="px-4 pb-24 pt-4">
      <h1 className="mb-4 text-xl font-bold text-primary">Configurações</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="motor1" className="text-xs">Motor 1</TabsTrigger>
          <TabsTrigger value="motor2" className="text-xs">Motor 2</TabsTrigger>
          <TabsTrigger value="insumos" className="text-xs">Insumos</TabsTrigger>
          <TabsTrigger value="receitas" className="text-xs">Receitas</TabsTrigger>
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
          {insumos.map(e => renderItem(e, fmt(e.custoUnitario)))}
        </TabsContent>
        <TabsContent value="receitas">
          {receitas.map(e => renderItem(e, `Sup: ${e.divisorSuporte}m · PU: ${e.divisorPU}m · Reb: ×${e.multiplicadorRebite}`))}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Editar' : 'Adicionar'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {fields[tab]?.map(f => (
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
          <DialogFooter>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
