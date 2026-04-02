import { useState } from 'react';
import { useSAAuditLog } from '@/hooks/useSuperAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';

const actionLabels: Record<string, string> = {
  create_empresa: 'Criar Empresa',
  update_empresa_status: 'Alterar Status',
  upsert_user_role: 'Definir Papel',
  delete_user_role: 'Remover Papel',
  create_invite: 'Criar Convite',
  revoke_invite: 'Revogar Convite',
  approve_user: 'Aprovar Usuário',
};

export function SuperAdminAuditoria() {
  const { data: logs, isLoading } = useSAAuditLog();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const normalize = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filtered = (logs || []).filter(l => {
    const q = normalize(search);
    const matchSearch = !q || normalize(l.admin_name).includes(q) || normalize(l.admin_email).includes(q) || normalize(l.action).includes(q) || normalize(JSON.stringify(l.details)).includes(q);
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const uniqueActions = [...new Set((logs || []).map(l => l.action))];

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Auditoria</h2>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-9" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Ação" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {uniqueActions.map(a => <SelectItem key={a} value={a}>{actionLabels[a] || a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(l.created_at), 'dd/MM/yy HH:mm')}</TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium">{l.admin_name || '—'}</div>
                    <div className="text-xs text-muted-foreground">{l.admin_email}</div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{actionLabels[l.action] || l.action}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground capitalize">{l.target_type}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                    {l.details && Object.keys(l.details).length > 0 ? JSON.stringify(l.details) : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum registro.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
