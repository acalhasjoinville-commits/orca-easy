import { useState } from 'react';
import { useSAUsers, useSAEmpresas, useSAMutations } from '@/hooks/useSuperAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Trash2, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

export function SuperAdminUsuarios() {
  const { data: users, isLoading } = useSAUsers();
  const { data: empresas } = useSAEmpresas();
  const { upsertUserRole, deleteUserRole, approveUser } = useSAMutations();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [empresaFilter, setEmpresaFilter] = useState('all');
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<any>(null);
  const [approveForm, setApproveForm] = useState({ empresaId: '', role: 'vendedor' });

  const normalize = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filtered = (users || []).filter(u => {
    const q = normalize(search);
    const matchSearch = !q || normalize(u.full_name).includes(q) || normalize(u.email).includes(q) || normalize(u.empresa_nome || '').includes(q);
    const matchRole = roleFilter === 'all' || (roleFilter === 'sem_papel' ? u.roles.length === 0 : u.roles.some((r: any) => r.role === roleFilter));
    const matchEmpresa = empresaFilter === 'all' || (empresaFilter === 'sem_empresa' ? !u.empresa_id : u.empresa_id === empresaFilter);
    return matchSearch && matchRole && matchEmpresa;
  });

  const openApprove = (user: any) => {
    setApproveTarget(user);
    setApproveForm({ empresaId: '', role: 'vendedor' });
    setApproveOpen(true);
  };

  const handleApprove = async () => {
    if (!approveTarget || !approveForm.empresaId) return;
    await approveUser.mutateAsync({ userId: approveTarget.user_id, empresaId: approveForm.empresaId, role: approveForm.role });
    setApproveOpen(false);
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Usuários</h2>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou empresa..." className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Papel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="vendedor">Vendedor</SelectItem>
            <SelectItem value="financeiro">Financeiro</SelectItem>
            <SelectItem value="sem_papel">Sem Papel</SelectItem>
          </SelectContent>
        </Select>
        <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Empresa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="sem_empresa">Sem Empresa</SelectItem>
            {(empresas || []).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.nome_fantasia}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Papéis</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium">{u.full_name || '(sem nome)'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-sm">{u.empresa_nome || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>
                    {u.roles.length > 0 ? u.roles.map((r: any, i: number) => (
                      <Badge key={i} variant="secondary" className="mr-1 text-xs capitalize">{r.role}</Badge>
                    )) : <Badge variant="outline" className="text-xs">Sem papel</Badge>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(u.created_at), 'dd/MM/yy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {u.roles.length === 0 && (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openApprove(u)}>
                          <UserCheck className="h-3 w-3 mr-1" />Aprovar
                        </Button>
                      )}
                      {u.empresa_id && u.roles.length > 0 && (
                        <>
                          <Select onValueChange={v => upsertUserRole.mutate({ userId: u.user_id, empresaId: u.empresa_id!, role: v })}>
                            <SelectTrigger className="h-7 w-28 text-xs"><SelectValue placeholder="Alterar" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="vendedor">Vendedor</SelectItem>
                              <SelectItem value="financeiro">Financeiro</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                            onClick={() => deleteUserRole.mutate({ userId: u.user_id, empresaId: u.empresa_id! })}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum usuário encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Aprovar Usuário</DialogTitle></DialogHeader>
          {approveTarget && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Aprovar <strong>{approveTarget.full_name || approveTarget.email}</strong></p>
              <div>
                <Label>Empresa</Label>
                <Select value={approveForm.empresaId} onValueChange={v => setApproveForm(f => ({ ...f, empresaId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar empresa" /></SelectTrigger>
                  <SelectContent>
                    {(empresas || []).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.nome_fantasia}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Papel</Label>
                <Select value={approveForm.role} onValueChange={v => setApproveForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleApprove} disabled={approveUser.isPending || !approveForm.empresaId} className="w-full">Aprovar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
