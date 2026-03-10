import { useState, useRef, useEffect } from 'react';
import { useMotor1, useMotor2, useInsumos, useRegras, useServicos } from '@/hooks/useSupabaseTechnicalData';
import { useEmpresa, usePoliticas } from '@/hooks/useSupabaseData';
import { Motor1Entry, Motor2Entry, InsumoEntry, RegraCalculo, ServicoTemplate, PoliticaComercial, MotorType, ItemRegra, MetodoCalculo, getCustoUnitario, MinhaEmpresa } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Building2, Upload, Save, Loader2, Layers, Calculator, BookOpen, FileText } from 'lucide-react';
import { toast } from 'sonner';

// ─── Types for active entity tracking ───
type EntitySection = 'motor1' | 'motor2' | 'insumos' | 'regras' | 'catalogo' | 'politicas';

// ─── MinhaEmpresaForm (unchanged) ───
function MinhaEmpresaForm() {
  const { empresa: existing, isLoading, saveEmpresa } = useEmpresa();
  const [initialized, setInitialized] = useState(false);
  const [form, setForm] = useState<MinhaEmpresa>({
    logoUrl: '', nomeFantasia: '', razaoSocial: '', cnpjCpf: '',
    telefoneWhatsApp: '', emailContato: '', endereco: '', numero: '',
    bairro: '', cidade: '', estado: '', corPrimaria: '#0B1B32', corDestaque: '#F57C00',
    slogan: '',
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialized && !isLoading) {
      if (existing) setForm(existing);
      setInitialized(true);
    }
  }, [isLoading, existing, initialized]);

  const set = (k: keyof MinhaEmpresa, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 2MB.', { duration: 5000 });
      return;
    }
    setUploading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await (supabase as any).from('profiles').select('empresa_id').eq('id', user?.id).maybeSingle();
      const empresaPrefix = profile?.empresa_id || 'default';
      const ext = file.name.split('.').pop() || 'png';
      const path = `${empresaPrefix}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('logos').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
      set('logoUrl', urlData.publicUrl);
      toast.success('Logo enviada!', { duration: 2500 });
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar logo.', { duration: 5000 });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveEmpresa.mutateAsync(form);
      toast.success('Dados da empresa salvos!');
    } catch {
      toast.error('Erro ao salvar dados da empresa.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Minha Empresa"
        description="Dados institucionais, identidade visual e informações de contato."
      />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-primary">Dados da Empresa</h2>
          </div>

          {/* Logo */}
          <div>
            <Label className="text-xs font-semibold">Logomarca</Label>
            <div className="flex items-center gap-4 mt-1">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="h-16 w-16 rounded-lg object-contain border bg-background" />
              ) : (
                <div className="h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-muted-foreground/40" />
                </div>
              )}
              <div>
                <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Upload className="mr-1 h-3 w-3" />}
                  {uploading ? 'Enviando...' : 'Upload Logo'}
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <p className="text-[10px] text-muted-foreground mt-1">PNG ou JPG, máx 2MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nome Fantasia</Label>
              <Input value={form.nomeFantasia} onChange={e => set('nomeFantasia', e.target.value)} placeholder="Nome comercial" className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Razão Social</Label>
              <Input value={form.razaoSocial} onChange={e => set('razaoSocial', e.target.value)} placeholder="Razão social" className="h-9" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Slogan</Label>
            <Input value={form.slogan} onChange={e => set('slogan', e.target.value)} placeholder="Ex: A solução está no nome" className="h-9" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">CNPJ / CPF</Label>
              <Input value={form.cnpjCpf} onChange={e => set('cnpjCpf', e.target.value)} placeholder="00.000.000/0001-00" className="h-9" />
            </div>
            <div>
              <Label className="text-xs">WhatsApp</Label>
              <Input value={form.telefoneWhatsApp} onChange={e => set('telefoneWhatsApp', e.target.value)} placeholder="(00) 00000-0000" className="h-9" />
            </div>
          </div>

          <div>
            <Label className="text-xs">E-mail de Contato</Label>
            <Input type="email" value={form.emailContato} onChange={e => set('emailContato', e.target.value)} placeholder="contato@empresa.com" className="h-9" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Endereço</Label>
              <Input value={form.endereco} onChange={e => set('endereco', e.target.value)} placeholder="Rua / Av." className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Número</Label>
              <Input value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="Nº" className="h-9" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Bairro</Label>
              <Input value={form.bairro} onChange={e => set('bairro', e.target.value)} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Cidade</Label>
              <Input value={form.cidade} onChange={e => set('cidade', e.target.value)} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Estado</Label>
              <Input value={form.estado} onChange={e => set('estado', e.target.value)} placeholder="UF" className="h-9" />
            </div>
          </div>

          {/* Color pickers */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold">Cores do App & PDF</Label>
            <div>
              <p className="text-xs text-muted-foreground mb-1">🎨 Cor Primária <span className="text-[10px]">(cabeçalhos, botões, navegação)</span></p>
              <div className="flex items-center gap-3">
                <input type="color" value={form.corPrimaria} onChange={e => set('corPrimaria', e.target.value)}
                  className="h-10 w-14 rounded-md border cursor-pointer" />
                <Input value={form.corPrimaria} onChange={e => set('corPrimaria', e.target.value)}
                  placeholder="#0044CC" className="h-9 w-28 font-mono text-sm" />
                <div className="h-8 flex-1 rounded-md" style={{ backgroundColor: form.corPrimaria }} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">✨ Cor Destaque <span className="text-[10px]">(valor total, garantia, status aprovado)</span></p>
              <div className="flex items-center gap-3">
                <input type="color" value={form.corDestaque} onChange={e => set('corDestaque', e.target.value)}
                  className="h-10 w-14 rounded-md border cursor-pointer" />
                <Input value={form.corDestaque} onChange={e => set('corDestaque', e.target.value)}
                  placeholder="#16A34A" className="h-9 w-28 font-mono text-sm" />
                <div className="h-8 flex-1 rounded-md" style={{ backgroundColor: form.corDestaque }} />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saveEmpresa.isPending} className="w-full bg-primary text-primary-foreground h-11">
            {saveEmpresa.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Dados da Empresa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Reusable section header ───
function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// ─── Reusable sub-section with header + add button + list ───
function SubSection({
  title,
  description,
  onAdd,
  isEmpty,
  emptyText,
  children,
}: {
  title: string;
  description: string;
  onAdd: () => void;
  isEmpty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button size="sm" onClick={onAdd} className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-1 h-3 w-3" /> Novo
        </Button>
      </div>
      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/25 py-8 text-center">
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

// ─── Main Component ───
export function Configuracoes() {
  const [tab, setTab] = useState('empresa');
  // Tracks which entity type the dialog is editing (important for "materiais" tab)
  const [activeSection, setActiveSection] = useState<EntitySection>('motor1');

  // All data from Supabase hooks (unchanged)
  const { motor1, isLoading: loadingM1, addMotor1, updateMotor1, deleteMotor1 } = useMotor1();
  const { motor2, isLoading: loadingM2, addMotor2, updateMotor2, deleteMotor2 } = useMotor2();
  const { insumos, isLoading: loadingIns, addInsumo, updateInsumo, deleteInsumo } = useInsumos();
  const { regras, isLoading: loadingReg, addRegra, updateRegra, deleteRegra } = useRegras();
  const { servicos, isLoading: loadingSrv, addServico, updateServico, deleteServico } = useServicos();
  const { politicas, addPolitica, updatePolitica, deletePolitica } = usePoliticas();

  const isLoadingTech = loadingM1 || loadingM2 || loadingIns || loadingReg || loadingSrv;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<Record<string, string>>({});
  const setField = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const [regraItens, setRegraItens] = useState<ItemRegra[]>([]);

  const openAdd = (section: EntitySection) => {
    setActiveSection(section);
    setEditItem(null);
    setForm({});
    setRegraItens([]);
    setDialogOpen(true);
  };

  const openEdit = (item: any, section: EntitySection) => {
    setActiveSection(section);
    setEditItem(item);
    const f: Record<string, string> = {};
    Object.entries(item).forEach(([k, v]) => {
      if (k !== 'id' && k !== 'itensRegra') f[k] = String(v);
    });
    setForm(f);
    if (item.itensRegra) setRegraItens([...item.itensRegra]);
    setDialogOpen(true);
  };

  // handleSave now uses activeSection instead of tab
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const id = editItem?.id || crypto.randomUUID();

    try {
      if (activeSection === 'motor1') {
        const entry: Motor1Entry = { id, material: form.material || '', densidade: parseFloat(form.densidade) || 0, precoQuilo: parseFloat(form.precoQuilo) || 0 };
        if (editItem) await updateMotor1.mutateAsync(entry);
        else await addMotor1.mutateAsync(entry);
      } else if (activeSection === 'motor2') {
        const entry: Motor2Entry = { id, material: form.material || '', espessura: parseFloat(form.espessura) || 0, corte: parseFloat(form.corte) || 0, precoMetroLinear: parseFloat(form.precoMetroLinear) || 0 };
        if (editItem) await updateMotor2.mutateAsync(entry);
        else await addMotor2.mutateAsync(entry);
      } else if (activeSection === 'insumos') {
        const entry: InsumoEntry = { id, nomeEmbalagemCompra: form.nomeEmbalagemCompra || '', nomeUnidadeConsumo: form.nomeUnidadeConsumo || '', precoEmbalagem: parseFloat(form.precoEmbalagem) || 0, qtdEmbalagem: parseFloat(form.qtdEmbalagem) || 1 };
        if (editItem) await updateInsumo.mutateAsync(entry);
        else await addInsumo.mutateAsync(entry);
      } else if (activeSection === 'regras') {
        const entry: RegraCalculo = { id, nomeRegra: form.nomeRegra || '', itensRegra: regraItens };
        if (editItem) await updateRegra.mutateAsync(entry);
        else await addRegra.mutateAsync(entry);
      } else if (activeSection === 'catalogo') {
        const entry: ServicoTemplate = {
          id, nomeServico: form.nomeServico || '',
          regraId: form.regraId || '',
          motorType: (form.motorType as MotorType) || 'motor1',
          materialPadrao: form.materialPadrao || '',
          espessuraPadrao: parseFloat(form.espessuraPadrao) || 0,
          cortePadrao: parseFloat(form.cortePadrao) || 0,
          dificuldadeFacil: parseFloat(form.dificuldadeFacil) || 2.6,
          dificuldadeMedia: parseFloat(form.dificuldadeMedia) || 3.5,
          dificuldadeDificil: parseFloat(form.dificuldadeDificil) || 4.6,
        };
        if (editItem) await updateServico.mutateAsync(entry);
        else await addServico.mutateAsync(entry);
      } else if (activeSection === 'politicas') {
        const entry: PoliticaComercial = {
          id,
          nomePolitica: form.nomePolitica || '',
          validadeDias: parseInt(form.validadeDias) || 15,
          formasPagamento: form.formasPagamento || '',
          garantia: form.garantia || '',
          tempoGarantia: form.tempoGarantia || '1 ano',
          termoRecebimentoOs: form.termoRecebimentoOs || '',
        };
        if (editItem) await updatePolitica.mutateAsync(entry);
        else await addPolitica.mutateAsync(entry);
      }

      setDialogOpen(false);
      toast.success(editItem ? 'Atualizado!' : 'Adicionado!');
    } catch {
      toast.error('Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  // handleDelete now uses activeSection
  const handleDelete = async (id: string, section: EntitySection) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      if (section === 'motor1') await deleteMotor1.mutateAsync(id);
      else if (section === 'motor2') await deleteMotor2.mutateAsync(id);
      else if (section === 'insumos') await deleteInsumo.mutateAsync(id);
      else if (section === 'regras') await deleteRegra.mutateAsync(id);
      else if (section === 'catalogo') await deleteServico.mutateAsync(id);
      else if (section === 'politicas') await deletePolitica.mutateAsync(id);
      toast.success('Removido!');
    } catch {
      toast.error('Erro ao remover.');
    } finally {
      setDeletingId(null);
    }
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const renderItem = (item: any, subtitle: string, section: EntitySection) => (
    <Card key={item.id}>
      <CardContent className="flex items-center justify-between px-4 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{item.material || item.nomeEmbalagemCompra || item.nomeRegra || item.nomeServico || item.nomePolitica}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => openEdit(item, section)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => handleDelete(item.id, section)} disabled={deletingId === item.id} className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50">
            {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
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

  // ─── Form renderers (unchanged logic) ───

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
        <Label className="text-xs font-semibold">Motor</Label>
        <Select value={form.motorType || 'motor1'} onValueChange={v => setField('motorType', v)}>
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

  const TEMPO_GARANTIA_OPTIONS = ['3 meses', '6 meses', '1 ano', '2 anos', '3 anos', '5 anos'];

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
        <Label className="text-xs font-semibold text-accent">Tempo de Garantia</Label>
        <Select value={form.tempoGarantia || '1 ano'} onValueChange={v => setField('tempoGarantia', v)}>
          <SelectTrigger className="h-9 border-accent/30">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {TEMPO_GARANTIA_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Formas de Pagamento</Label>
        <Textarea value={form.formasPagamento || ''} onChange={e => setField('formasPagamento', e.target.value)}
          placeholder="Condições de pagamento padrão..." rows={2} className="text-sm" />
      </div>
      <div>
        <Label className="text-xs">Termos de Garantia (detalhes)</Label>
        <Textarea value={form.garantia || ''} onChange={e => setField('garantia', e.target.value)}
          placeholder="Detalhes dos termos de garantia..." rows={2} className="text-sm" />
      </div>
      <div>
        <Label className="text-xs font-semibold text-accent">Termo de Recebimento (OS)</Label>
        <Textarea value={form.termoRecebimentoOs || ''} onChange={e => setField('termoRecebimentoOs', e.target.value)}
          placeholder="Texto do canhoto de entrega da Ordem de Serviço..." rows={3} className="text-sm" />
        <p className="text-[10px] text-muted-foreground mt-1">Este texto será exibido no canhoto de entrega da OS.</p>
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
    if (activeSection === 'catalogo') return renderCatalogoForm();
    if (activeSection === 'regras') return renderRegraForm();
    if (activeSection === 'politicas') return renderPoliticaForm();
    return (
      <div className="space-y-3">
        {simpleFields[activeSection]?.map(f => (
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

  // ─── Dialog title with context ───
  const sectionLabels: Record<EntitySection, string> = {
    motor1: 'Motor 1',
    motor2: 'Motor 2',
    insumos: 'Insumo',
    regras: 'Regra de Cálculo',
    catalogo: 'Serviço',
    politicas: 'Política Comercial',
  };

  const dialogTitle = `${editItem ? 'Editar' : 'Adicionar'} ${sectionLabels[activeSection]}`;

  // ─── Tab content renderers ───

  const renderMateriaisTab = () => (
    <div className="space-y-8">
      <SectionHeader
        title="Custos e Materiais"
        description="Materiais, chapas e insumos usados como base de cálculo dos orçamentos."
      />

      {/* Motor 1 */}
      <SubSection
        title="Motor 1 — Chapas e Bobinas"
        description="Materiais comprados em bobina/chapa, com cálculo por peso."
        onAdd={() => openAdd('motor1')}
        isEmpty={motor1.length === 0}
        emptyText="Nenhum material cadastrado no Motor 1."
      >
        {motor1.map(e => renderItem(e, `${e.densidade} g/cm³ · ${fmt(e.precoQuilo)}/kg`, 'motor1'))}
      </SubSection>

      <div className="border-t border-border" />

      {/* Motor 2 */}
      <SubSection
        title="Motor 2 — Material Dobrado"
        description="Materiais comprados já dobrados do fornecedor, com preço por metro linear."
        onAdd={() => openAdd('motor2')}
        isEmpty={motor2.length === 0}
        emptyText="Nenhum material cadastrado no Motor 2."
      >
        {motor2.map(e => renderItem(e, `${e.espessura}mm · ${e.corte}mm · ${fmt(e.precoMetroLinear)}/m`, 'motor2'))}
      </SubSection>

      <div className="border-t border-border" />

      {/* Insumos */}
      <SubSection
        title="Insumos"
        description="Materiais consumíveis usados nas regras de cálculo (parafusos, silicone, etc)."
        onAdd={() => openAdd('insumos')}
        isEmpty={insumos.length === 0}
        emptyText="Nenhum insumo cadastrado."
      >
        {insumos.map(e => {
          const preco = e.precoEmbalagem ?? 0;
          const qtd = e.qtdEmbalagem ?? 1;
          return renderItem(e, `${fmt(preco)} / ${qtd} un = ${fmt(getCustoUnitario(e))}/un`, 'insumos');
        })}
      </SubSection>
    </div>
  );

  const renderRegrasTab = () => (
    <div className="space-y-6">
      <SubSection
        title="Regras de Cálculo"
        description="Definem como os insumos entram no cálculo do orçamento. Cada regra pode ter vários insumos com métodos diferentes."
        onAdd={() => openAdd('regras')}
        isEmpty={regras.length === 0}
        emptyText="Nenhuma regra cadastrada. Crie uma para vincular insumos aos serviços."
      >
        {regras.map(e => renderItem(e, `${e.itensRegra.length} insumo(s) vinculado(s)`, 'regras'))}
      </SubSection>
    </div>
  );

  const renderCatalogoTab = () => (
    <div className="space-y-6">
      <SubSection
        title="Catálogo de Serviços"
        description="Serviços disponíveis para orçamento, com motor, material padrão e fatores de dificuldade."
        onAdd={() => openAdd('catalogo')}
        isEmpty={servicos.length === 0}
        emptyText="Nenhum serviço cadastrado. Adicione para usar nos orçamentos."
      >
        {servicos.map(e => renderItem(e, `${e.materialPadrao} · ${e.espessuraPadrao}mm · ${e.cortePadrao}mm · Regra: ${regraName(e.regraId)}`, 'catalogo'))}
      </SubSection>
    </div>
  );

  const renderPoliticasTab = () => (
    <div className="space-y-6">
      <SubSection
        title="Políticas Comerciais"
        description="Condições comerciais usadas no orçamento e na Ordem de Serviço: validade, pagamento, garantia e termos."
        onAdd={() => openAdd('politicas')}
        isEmpty={politicas.length === 0}
        emptyText="Nenhuma política cadastrada. Crie uma para usar nos orçamentos."
      >
        {politicas.map(e => renderItem(e, `${e.validadeDias} dias · Garantia: ${e.tempoGarantia || '—'} · ${e.formasPagamento.substring(0, 30)}...`, 'politicas'))}
      </SubSection>
    </div>
  );

  return (
    <div className="px-4 pb-24 pt-4">
      <h1 className="mb-5 text-xl font-bold text-primary">Configurações</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-5 mb-6 h-auto">
          <TabsTrigger value="empresa" className="text-xs px-2 py-2.5 gap-1.5 flex-col sm:flex-row">
            <Building2 className="h-4 w-4" />
            <span>Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="materiais" className="text-xs px-2 py-2.5 gap-1.5 flex-col sm:flex-row">
            <Layers className="h-4 w-4" />
            <span>Materiais</span>
          </TabsTrigger>
          <TabsTrigger value="regras" className="text-xs px-2 py-2.5 gap-1.5 flex-col sm:flex-row">
            <Calculator className="h-4 w-4" />
            <span>Regras</span>
          </TabsTrigger>
          <TabsTrigger value="catalogo" className="text-xs px-2 py-2.5 gap-1.5 flex-col sm:flex-row">
            <BookOpen className="h-4 w-4" />
            <span>Catálogo</span>
          </TabsTrigger>
          <TabsTrigger value="politicas" className="text-xs px-2 py-2.5 gap-1.5 flex-col sm:flex-row">
            <FileText className="h-4 w-4" />
            <span>Políticas</span>
          </TabsTrigger>
        </TabsList>

        {tab === 'empresa' && <MinhaEmpresaForm />}

        {tab !== 'empresa' && isLoadingTech ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {tab === 'materiais' && renderMateriaisTab()}
            {tab === 'regras' && renderRegrasTab()}
            {tab === 'catalogo' && renderCatalogoTab()}
            {tab === 'politicas' && renderPoliticasTab()}
          </>
        )}
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          {renderFormContent()}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground">
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
