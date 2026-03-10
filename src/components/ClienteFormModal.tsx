import { useState, useEffect } from 'react';
import { Cliente, TipoPessoa } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [tipo, setTipo] = useState<TipoPessoa>(EMPTY_FORM.tipo);
  const [nome, setNome] = useState(EMPTY_FORM.nome);
  const [documento, setDocumento] = useState(EMPTY_FORM.documento);
  const [whatsapp, setWhatsapp] = useState(EMPTY_FORM.whatsapp);
  const [cep, setCep] = useState(EMPTY_FORM.cep);
  const [endereco, setEndereco] = useState(EMPTY_FORM.endereco);
  const [numero, setNumero] = useState(EMPTY_FORM.numero);
  const [bairro, setBairro] = useState(EMPTY_FORM.bairro);
  const [cidade, setCidade] = useState(EMPTY_FORM.cidade);
  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);

  // Sync form state whenever the modal opens or the editing target changes
  useEffect(() => {
    if (!open) return;
    const src = editing ? formFromCliente(editing) : EMPTY_FORM;
    setTipo(src.tipo);
    setNome(src.nome);
    setDocumento(src.documento);
    setWhatsapp(src.whatsapp);
    setCep(src.cep);
    setEndereco(src.endereco);
    setNumero(src.numero);
    setBairro(src.bairro);
    setCidade(src.cidade);
    setLoadingCNPJ(false);
    setLoadingCEP(false);
  }, [open, editing]);

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
      setNome(data.razao_social || '');
      if (data.cep) {
        setCep(formatCEP(data.cep));
        setEndereco(`${data.descricao_tipo_de_logradouro || ''} ${data.logradouro || ''}`.trim());
        setNumero(data.numero || '');
        setBairro(data.bairro || '');
        setCidade(`${data.municipio || ''} - ${data.uf || ''}`);
      }
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
      setEndereco(data.logradouro || '');
      setBairro(data.bairro || '');
      setCidade(`${data.localidade || ''} - ${data.uf || ''}`);
      toast.success('Endereço carregado!', { duration: 2500 });
    } catch {
      toast.error('CEP não encontrado.', { duration: 5000 });
    } finally {
      setLoadingCEP(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const canSave = nome.trim() && rawPhone.length >= 10 && rawDoc.length >= (tipo === 'PF' ? 11 : 14);

  const handleSave = async () => {
    if (isSaving) return;
    if (!canSave) return;
    setIsSaving(true);
    try {
      await Promise.resolve(onSave({
        id: editing?.id ?? crypto.randomUUID(),
        tipo, nomeRazaoSocial: nome.trim(), documento, whatsapp,
        cep, endereco, numero, bairro, cidade,
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
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
                <button key={t} onClick={() => { setTipo(t); setDocumento(''); }}
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
                onChange={e => setDocumento(tipo === 'PF' ? formatCPF(e.target.value) : formatCNPJ(e.target.value))}
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
            <Input value={nome} onChange={e => setNome(e.target.value)} placeholder={tipo === 'PF' ? 'João da Silva' : 'Empresa Ltda.'} />
          </div>

          {/* WhatsApp */}
          <div>
            <Label className="text-xs">WhatsApp *</Label>
            <Input value={whatsapp} onChange={e => setWhatsapp(formatPhone(e.target.value))} placeholder="(11) 99999-9999" />
          </div>

          {/* CEP */}
          <div>
            <Label className="text-xs">CEP</Label>
            <div className="flex gap-2">
              <Input value={cep} onChange={e => setCep(formatCEP(e.target.value))} placeholder="00000-000" className="flex-1" />
              <Button size="sm" variant="outline" onClick={buscarCEP} disabled={loadingCEP || rawCep.length !== 8}>
                {loadingCEP ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Endereço */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Label className="text-xs">Endereço</Label>
              <Input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua..." />
            </div>
            <div>
              <Label className="text-xs">Nº</Label>
              <Input value={numero} onChange={e => setNumero(e.target.value)} placeholder="123" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Bairro</Label>
              <Input value={bairro} onChange={e => setBairro(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Cidade</Label>
              <Input value={cidade} onChange={e => setCidade(e.target.value)} />
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
