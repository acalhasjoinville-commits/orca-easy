import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Plus, Trash2, Loader2, ShieldCheck, ShieldAlert, Mail, Send, X, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  roles: AppRole[];
}

interface Invite {
  id: string;
  email: string;
  role: AppRole;
  created_at: string;
  used_at: string | null;
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  vendedor: 'Vendedor',
  financeiro: 'Financeiro',
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  vendedor: 'bg-primary/10 text-primary border-primary/20',
  financeiro: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
};

export function Usuarios() {
  const { empresaId, user } = useAuth();
  const qc = useQueryClient();
  const [addingRoleFor, setAddingRoleFor] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>('vendedor');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('vendedor');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['empresa-users', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data: profiles, error: pErr } = await (supabase as any)
        .from('profiles').select('id, full_name, email, empresa_id').eq('empresa_id', empresaId);
      if (pErr) throw pErr;
      const { data: roles, error: rErr } = await (supabase as any)
        .from('user_roles').select('user_id, role').eq('empresa_id', empresaId);
      if (rErr) throw rErr;
      const roleMap = new Map<string, AppRole[]>();
      (roles || []).forEach((r: any) => {
        const existing = roleMap.get(r.user_id) || [];
        existing.push(r.role);
        roleMap.set(r.user_id, existing);
      });
      return (profiles || []).map((p: any): UserProfile => ({
        id: p.id, fullName: p.full_name || '', email: p.email || '—',
        roles: roleMap.get(p.id) || [],
      }));
    },
    enabled: !!empresaId,
  });

  const { data: invites = [] } = useQuery({
    queryKey: ['invites', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await (supabase as any)
        .from('invites').select('id, email, role, created_at, used_at')
        .eq('empresa_id', empresaId).is('used_at', null).order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Invite[];
    },
    enabled: !!empresaId,
  });

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      if (!empresaId) throw new Error('Sem empresa');
      const { error } = await (supabase as any).from('user_roles').insert({ user_id: userId, role, empresa_id: empresaId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['empresa-users'] }); setAddingRoleFor(null); toast.success('Role adicionada!', { duration: 2500 }); },
    onError: (err: any) => {
      if (err?.message?.includes('duplicate')) toast.error('Usuário já possui essa role.', { duration: 5000 });
      else toast.error('Erro ao adicionar role.', { duration: 5000 });
    },
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      if (!empresaId) throw new Error('Sem empresa');
      const { error } = await (supabase as any).from('user_roles').delete().eq('user_id', userId).eq('role', role).eq('empresa_id', empresaId);
      if (error) {
        if (error.message?.includes('último administrador')) throw new Error('Não é possível remover o último administrador da empresa.');
        throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['empresa-users'] }); toast.success('Role removida.', { duration: 2500 }); },
    onError: (err: any) => { toast.error(err?.message || 'Erro ao remover role.', { duration: 5000 }); },
  });

  const createInvite = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      if (!empresaId || !user) throw new Error('Sem empresa');
      const { error } = await (supabase as any).from('invites').insert({
        empresa_id: empresaId, email: email.toLowerCase().trim(), role, invited_by: user.id,
      });
      if (error) {
        if (error.message?.includes('duplicate') || error.code === '23505') throw new Error('Já existe um convite para este email.');
        throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invites'] }); setInviteEmail(''); toast.success('Convite criado!', { duration: 5000 }); },
    onError: (err: any) => { toast.error(err?.message || 'Erro ao criar convite.', { duration: 5000 }); },
  });

  const revokeInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await (supabase as any).from('invites').delete().eq('id', inviteId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invites'] }); toast.success('Convite revogado.', { duration: 2500 }); },
    onError: () => { toast.error('Erro ao revogar convite.', { duration: 5000 }); },
  });

  const handleSendInvite = () => {
    const email = inviteEmail.trim();
    if (!email || !email.includes('@')) { toast.error('Informe um email válido.'); return; }
    createInvite.mutate({ email, role: inviteRole });
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const usersWithRoles = users.filter(u => u.roles.length > 0);
  const usersPending = users.filter(u => u.roles.length === 0);

  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Convide e gerencie os membros da sua equipe</p>
      </div>

      {/* Invite Section */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Convidar Usuário</h3>
              <p className="text-[11px] text-muted-foreground">O usuário será vinculado ao se cadastrar com este email</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input placeholder="email@exemplo.com" value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)} className="flex-1 h-9" type="email" />
            <Select value={inviteRole} onValueChange={v => setInviteRole(v as AppRole)}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['vendedor', 'financeiro', 'admin'] as AppRole[]).map(r => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSendInvite} disabled={createInvite.isPending} size="sm" className="h-9 px-4">
              {createInvite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {invites.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Convites pendentes</p>
              {invites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{inv.email}</p>
                    <p className="text-[10px] text-muted-foreground">{ROLE_LABELS[inv.role]} · {new Date(inv.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive"
                    onClick={() => revokeInvite.mutate(inv.id)} disabled={revokeInvite.isPending}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active users */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Usuários Ativos</h3>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{usersWithRoles.length}</Badge>
        </div>
        {usersWithRoles.map(user => (
          <Card key={user.id}>
            <CardContent className="px-5 py-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.fullName || 'Sem nome'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-1.5 ml-3">
                  {user.roles.map(role => (
                    <Badge key={role} variant="outline" className={`text-[10px] ${ROLE_COLORS[role]}`}>
                      {ROLE_LABELS[role]}
                      <button onClick={() => removeRole.mutate({ userId: user.id, role })}
                        className="ml-1 hover:text-destructive" title="Remover role">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {addingRoleFor === user.id ? (
                    <div className="flex items-center gap-1">
                      <Select value={selectedRole} onValueChange={v => setSelectedRole(v as AppRole)}>
                        <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(['admin', 'vendedor', 'financeiro'] as AppRole[])
                            .filter(r => !user.roles.includes(r))
                            .map(r => (<SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" className="h-7 text-xs"
                        onClick={() => addRole.mutate({ userId: user.id, role: selectedRole })}
                        disabled={addRole.isPending}>OK</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingRoleFor(null)}>✕</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground"
                      onClick={() => {
                        const available = (['admin', 'vendedor', 'financeiro'] as AppRole[]).filter(r => !user.roles.includes(r));
                        if (available.length === 0) { toast.info('Usuário já possui todas as roles.'); return; }
                        setSelectedRole(available[0]);
                        setAddingRoleFor(user.id);
                      }}>
                      <Plus className="h-3 w-3 mr-0.5" /> Role
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending users */}
      {usersPending.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Aguardando Aprovação</h3>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{usersPending.length}</Badge>
          </div>
          {usersPending.map(user => (
            <Card key={user.id} className="border-dashed border-amber-500/30">
              <CardContent className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user.fullName || 'Sem nome'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3">
                    <Select value={selectedRole} onValueChange={v => setSelectedRole(v as AppRole)}>
                      <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(['admin', 'vendedor', 'financeiro'] as AppRole[]).map(r => (
                          <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="h-7 text-xs"
                      onClick={() => addRole.mutate({ userId: user.id, role: selectedRole })}
                      disabled={addRole.isPending}>Aprovar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {users.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum usuário encontrado nesta empresa.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
