import { useState } from 'react';
import { useSAEmpresas, useSAMutations } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { StatusBadge } from './SuperAdminDashboard';
import { Loader2, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  onSelectEmpresa: (id: string) => void;
}

export function SuperAdminEmpresas({ onSelectEmpresa }: Props) {
  const { data: empresas, isLoading } = useSAEmpresas();
  const { createEmpresa } = useSAMutations();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ nome_fantasia: '', razao_social: '', cnpj_cpf: '', email_contato: '', telefone: '', invite_email: '', invite_role: 'admin' });

  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filtered = (empresas || []).filter(e => {
    const q = normalize(search);
    const matchSearch = !q || normalize(e.nome_fantasia).includes(q) || normalize(e.razao_social || '').includes(q) || normalize(e.cnpj_cpf || '').includes(q) || normalize(e.email_contato || '').includes(q);
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = async () => {
    if (!form.nome_fantasia.trim()) return;
    await createEmpresa.mutateAsync({
      nome_fantasia: form.nome_fantasia,
      razao_social: form.razao_social,
      cnpj_cpf: form.cnpj_cpf,
      email_contato: form.email_contato,
      telefone: form.telefone,
      invite_email: form.invite_email || undefined,
      invite_role: form.invite_role,
    });
    setForm({ nome_fantasia: '', razao_social: '', cnpj_cpf: '', email_contato: '', telefone: '', invite_email: '', invite_role: 'admin' });
    setCreateOpen(false);
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Empresas</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Empresa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Criar Empresa</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome Fantasia *</Label><Input value={form.nome_fantasia} onChange={e => setForm(f => ({ ...f, nome_fantasia: e.target.value }))} /></div>
              <div><Label>Razão Social</Label><Input value={form.razao_social} onChange={e => setForm(f => ({ ...f, razao_social: e.target.value }))} /></div>
              <div><Label>CNPJ/CPF</Label><Input value={form.cnpj_cpf} onChange={e => setForm(f => ({ ...f, cnpj_cpf: e.target.value }))} /></div>
              <div><Label>E-mail de Contato</Label><Input value={form.email_contato} onChange={e => setForm(f => ({ ...f, email_contato: e.target.value }))} /></div>
              <div><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} /></div>
              <hr />
              <p className="text-xs text-muted-foreground">Opcional: enviar convite para o primeiro administrador</p>
              <div><Label>E-mail do Admin</Label><Input value={form.invite_email} onChange={e => setForm(f => ({ ...f, invite_email: e.target.value }))} placeholder="admin@empresa.com" /></div>
              <div>
                <Label>Papel</Label>
                <Select value={form.invite_role} onValueChange={v => setForm(f => ({ ...f, invite_role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={createEmpresa.isPending} className="w-full">
                {createEmpresa.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Criar Empresa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar empresa..." className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ativa">Ativa</SelectItem>
            <SelectItem value="suspensa">Suspensa</SelectItem>
            <SelectItem value="bloqueada">Bloqueada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ/CPF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Usuários</TableHead>
                <TableHead className="text-center">Convites</TableHead>
                <TableHead>Admins</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(e => (
                <TableRow key={e.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelectEmpresa(e.id)}>
                  <TableCell className="font-medium">{e.nome_fantasia}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{e.cnpj_cpf || '—'}</TableCell>
                  <TableCell><StatusBadge status={e.status} /></TableCell>
                  <TableCell className="text-center">{e.total_usuarios}</TableCell>
                  <TableCell className="text-center">{e.convites_pendentes}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.admins?.map((a: any) => a.full_name || a.email).join(', ') || '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(e.created_at), 'dd/MM/yy')}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma empresa encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
