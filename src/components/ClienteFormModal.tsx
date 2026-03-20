import { useState, useEffect } from 'react';
import { Cliente, TipoPessoa } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDraft } from '@/hooks/useDraft';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (cliente: Cliente) => void | Promise<void>;
  editing?: Cliente | null;
}

interface FormState {
  tipo: TipoPessoa;
  nome: string;
  documento: string;
  whatsapp: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
}

const EMPTY_FORM: FormState = {
  tipo: 'PF',
  nome: '',
  documento: '',
  whatsapp: '',
  cep: '',
  endereco: '',
  numero: '',
  bairro: '',
  cidade: '',
};

function formFromCliente(c: Cliente): FormState {
  return {
    tipo: c.tipo,
    nome: c.nomeRazaoSocial,
    documento: c.documento,
    whatsapp: c.whatsapp,
    cep: c.cep,
    endereco: c.endereco,
    numero: c.numero,
    bairro: c.bairro,
    cidade: c.cidade,
  };
}

function formatCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

function formatCEP(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.replace(/(\d{5})(\d)/, '$1-$2');
}

export function ClienteFormModal({ open, onClose, onSave, editing }: Props) {
  const draftKey = editing ? `draft:cliente-edit:${editing.id}` : 'draft:cliente-new';
  const initialForm = editing ? formFromCliente(editing) : EMPTY_FORM;

  const [draft, setDraft, clearDraft, wasRestored] = useDraft<FormState>(draftKey, initialForm);

  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Show restore toast once
  useEffect(() => {
    if (open && wasRestored) {
      toast.info('Rascunho restaurado.', { duration: 2000 });
    }
  }, [open, wasRestored]);

  // When modal opens for editing a DIFFERENT client, reset draft to that client's data
  useEffect(() => {
    if (!open) return;
    if (editing) {
      // If there's no saved draft for this edit key, load from the entity
      const stored = sessionStorage.getItem(draftKey);
      if (!stored) {
        setDraft(formFromCliente(editing));
      }
    } else {
      // New client: if no draft exists, reset to empty
      const stored = sessionStorage.getItem('draft:cliente-new');
      if (!stored) {
        setDraft(EMPTY_FORM);
      }
    }
  }, [open, editing?.id]);

  const { tipo, nome, documento, whatsapp, cep, endereco, numero, bairro, cidade } = draft;

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const rawDoc = documento.replace(/\D/g, '');
  const rawCep = cep.replace(/\D/g, '');
  const rawPhone = whatsapp.replace(/\D/g, '');

  const buscarCNPJ = async () => {
    if (rawDoc.length !== 14) { toast.error('CNPJ inválido', { duration: 5000 }); return; }
    setLoadingCNPJ(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${rawDoc}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDraft(prev => ({
        ...prev,
        nome: data.razao_social || '',
        ...(data.cep ? {
          cep: formatCEP(data.cep),
          endereco: `${data.descricao_tipo_de_logradouro || ''} ${data.logradouro || ''}`.trim(),
          numero: data.numero || '',
          bairro: data.bairro || '',
          cidade: `${data.municipio || ''} - ${data.uf || ''}`,
        } : {}),
      }));
      toast.success('Dados do CNPJ carregados!', { duration: 2500 });
    } catch {
      toast.error('Não foi possível buscar o CNPJ.', { duration: 5000 });
    } finally {
      setLoadingCNPJ(false);
    }
  };

  const buscarCEP = async () => {
    if (rawCep.length !== 8) { toast.error('CEP inválido', { duration: 5000 }); return; }
    setLoadingCEP(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await res.json();
      if (data.erro) throw new Error();
      setDraft(prev => ({
        ...prev,
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: `${data.localidade || ''} - ${data.uf || ''}`,
      }));
      toast.success('Endereço carregado!', { duration: 2500 });
    } catch {
      toast.error('CEP não encontrado.', { duration: 5000 });
    } finally {
      setLoadingCEP(false);
    }
  };

  const canSave = nome.trim() && rawPhone.length >= 10 && rawDoc.length >= (tipo === 'PF' ? 11 : 14);

  const handleSave = async () => {
    if (isSaving || !canSave) return;
    setIsSaving(true);
    try {
      await Promise.resolve(onSave({
        id: editing?.id ?? crypto.randomUUID(),
        tipo, nomeRazaoSocial: nome.trim(), documento, whatsapp,
        cep, endereco, numero, bairro, cidade,
      }));
      clearDraft();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    clearDraft();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo */}
          <div>
            <Label className="text-xs">Tipo</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(['PF', 'PJ'] as TipoPessoa[]).map(t => (
                <button key={t} onClick={() => { updateField('tipo', t); updateField('documento', ''); }}
                  className={cn('rounded-md border px-3 py-2 text-sm font-medium transition-all',
                    tipo === t ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground')}>
                  {t === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </button>
              ))}
            </div>
          </div>

          {/* Documento */}
          <div>
            <Label className="text-xs">{tipo === 'PF' ? 'CPF' : 'CNPJ'}</Label>
            <div className="flex gap-2">
              <Input value={documento}
                onChange={e => updateField('documento', tipo === 'PF' ? formatCPF(e.target.value) : formatCNPJ(e.target.value))}
                placeholder={tipo === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                className="flex-1" />
              {tipo === 'PJ' && (
                <Button size="sm" variant="outline" onClick={buscarCNPJ} disabled={loadingCNPJ || rawDoc.length !== 14}>
                  {loadingCNPJ ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Nome */}
          <div>
            <Label className="text-xs">{tipo === 'PF' ? 'Nome Completo' : 'Razão Social'}</Label>
            <Input value={nome} onChange={e => updateField('nome', e.target.value)} placeholder={tipo === 'PF' ? 'João da Silva' : 'Empresa Ltda.'} />
          </div>

          {/* WhatsApp */}
          <div>
            <Label className="text-xs">WhatsApp *</Label>
            <Input value={whatsapp} onChange={e => updateField('whatsapp', formatPhone(e.target.value))} placeholder="(11) 99999-9999" />
          </div>

          {/* CEP */}
          <div>
            <Label className="text-xs">CEP</Label>
            <div className="flex gap-2">
              <Input value={cep} onChange={e => updateField('cep', formatCEP(e.target.value))} placeholder="00000-000" className="flex-1" />
              <Button size="sm" variant="outline" onClick={buscarCEP} disabled={loadingCEP || rawCep.length !== 8}>
                {loadingCEP ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Endereço */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Label className="text-xs">Endereço</Label>
              <Input value={endereco} onChange={e => updateField('endereco', e.target.value)} placeholder="Rua..." />
            </div>
            <div>
              <Label className="text-xs">Nº</Label>
              <Input value={numero} onChange={e => updateField('numero', e.target.value)} placeholder="123" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Bairro</Label>
              <Input value={bairro} onChange={e => updateField('bairro', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Cidade</Label>
              <Input value={cidade} onChange={e => updateField('cidade', e.target.value)} />
            </div>
          </div>

          <Button onClick={handleSave} disabled={!canSave || isSaving} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11">
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : editing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
