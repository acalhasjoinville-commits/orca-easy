import { useState } from 'react';
import { useSAEmpresaDetail, useSAMutations, useSAEmpresas } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from './SuperAdminDashboard';
import { ArrowLeft, Loader2, UserPlus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  empresaId: string;
  onBack: () => void;
}

export function SuperAdminEmpresaDetail({ empresaId, onBack }: Props) {
  const { data, isLoading } = useSAEmpresaDetail(empresaId);
  const { updateEmpresaStatus, upsertUserRole, deleteUserRole, createInvite, revokeInvite } = useSAMutations();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'vendedor' });

  if (isLoading || !data) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const { empresa, users, invites } = data;

  const handleStatusChange = (newStatus: string) => {
    updateEmpresaStatus.mutate({ empresaId, newStatus });
  };

  const handleInvite = async () => {
    if (!inviteForm.email) return;
    await createInvite.mutateAsync({ empresaId, email: inviteForm.email, role: inviteForm.role });
    setInviteForm({ email: '', role: 'vendedor' });
    setInviteOpen(false);
  };

  const pendingInvites = invites.filter((i: any) => !i.used_at);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <h2 className="text-2xl font-bold text-foreground">{empresa.nome_fantasia}</h2>
        <StatusBadge status={empresa.status} />
      </div>

      {/* Company info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Dados da Empresa</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Razão Social:</span> <span className="font-medium">{empresa.razao_social || '—'}</span></div>
            <div><span className="text-muted-foreground">CNPJ/CPF:</span> <span className="font-medium">{empresa.cnpj_cpf || '—'}</span></div>
            <div><span className="text-muted-foreground">E-mail:</span> <span className="font-medium">{empresa.email_contato || '—'}</span></div>
            <div><span className="text-muted-foreground">Telefone:</span> <span className="font-medium">{empresa.telefone_whatsapp || '—'}</span></div>
            <div><span className="text-muted-foreground">Endereço:</span> <span className="font-medium">{[empresa.endereco, empresa.numero, empresa.bairro, empresa.cidade, empresa.estado].filter(Boolean).join(', ') || '—'}</span></div>
            <div><span className="text-muted-foreground">Criada em:</span> <span className="font-medium">{format(new Date(empresa.created_at), 'dd/MM/yyyy HH:mm')}</span></div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="text-sm text-muted-foreground mr-2">Alterar status:</span>
            {['ativa', 'suspensa', 'bloqueada'].map(s => (
              <Button key={s} size="sm" variant={empresa.status === s ? 'default' : 'outline'} disabled={empresa.status === s || updateEmpresaStatus.isPending}
                onClick={() => handleStatusChange(s)} className="capitalize text-xs">{s}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Usuários ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Papéis</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u: any) => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium">{u.full_name || '(sem nome)'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {u.roles?.length > 0 ? u.roles.map((r: string) => (
                      <Badge key={r} variant="secondary" className="mr-1 text-xs capitalize">{r}</Badge>
                    )) : <Badge variant="outline" className="text-xs">Sem papel</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Select onValueChange={v => upsertUserRole.mutate({ userId: u.user_id, empresaId, role: v })}>
                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue placeholder="Definir papel" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="vendedor">Vendedor</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                        onClick={() => deleteUserRole.mutate({ userId: u.user_id, empresaId })}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">Nenhum usuário.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invites */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Convites Pendentes ({pendingInvites.length})</CardTitle>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"><UserPlus className="h-4 w-4 mr-1" />Convidar</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Convidar Usuário</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>E-mail</Label><Input value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div>
                  <Label>Papel</Label>
                  <Select value={inviteForm.role} onValueChange={v => setInviteForm(f => ({ ...f, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInvite} disabled={createInvite.isPending} className="w-full">Enviar Convite</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInvites.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-sm">{inv.email}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize text-xs">{inv.role}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(inv.created_at), 'dd/MM/yy')}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-destructive text-xs h-7"
                      onClick={() => revokeInvite.mutate(inv.id)}>Revogar</Button>
                  </TableCell>
                </TableRow>
              ))}
              {pendingInvites.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">Nenhum convite pendente.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
