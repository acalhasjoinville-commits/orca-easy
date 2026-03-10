import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  roles: AppRole[];
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  vendedor: 'Vendedor',
  financeiro: 'Financeiro',
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  vendedor: 'bg-primary/10 text-primary border-primary/20',
  financeiro: 'bg-accent/10 text-accent-foreground border-accent/20',
};

export function Usuarios() {
  const { empresaId } = useAuth();
  const qc = useQueryClient();
  const [addingRoleFor, setAddingRoleFor] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>('vendedor');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['empresa-users', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      // Fetch profiles for this empresa
      const { data: profiles, error: pErr } = await (supabase as any)
        .from('profiles')
        .select('id, full_name, email, empresa_id')
        .eq('empresa_id', empresaId);
      if (pErr) throw pErr;

      // Fetch all roles for this empresa
      const { data: roles, error: rErr } = await (supabase as any)
        .from('user_roles')
        .select('user_id, role')
        .eq('empresa_id', empresaId);
      if (rErr) throw rErr;

      const roleMap = new Map<string, AppRole[]>();
      (roles || []).forEach((r: any) => {
        const existing = roleMap.get(r.user_id) || [];
        existing.push(r.role);
        roleMap.set(r.user_id, existing);
      });

      return (profiles || []).map((p: any): UserProfile => ({
        id: p.id,
        fullName: p.full_name || '',
        email: p.email || '—',
        roles: roleMap.get(p.id) || [],
      }));
    },
    enabled: !!empresaId,
  });

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      if (!empresaId) throw new Error('Sem empresa');
      const { error } = await (supabase as any)
        .from('user_roles')
        .insert({ user_id: userId, role, empresa_id: empresaId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empresa-users'] });
      setAddingRoleFor(null);
      toast.success('Role adicionada!', { duration: 2500 });
    },
    onError: (err: any) => {
      if (err?.message?.includes('duplicate')) {
        toast.error('Usuário já possui essa role.', { duration: 5000 });
      } else {
        toast.error('Erro ao adicionar role.', { duration: 5000 });
      }
    },
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      if (!empresaId) throw new Error('Sem empresa');
      const { error } = await (supabase as any)
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role)
        .eq('empresa_id', empresaId);
      if (error) {
        if (error.message?.includes('último administrador')) {
          throw new Error('Não é possível remover o último administrador da empresa.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empresa-users'] });
      toast.success('Role removida.');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Erro ao remover role.');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const usersWithRoles = users.filter(u => u.roles.length > 0);
  const usersPending = users.filter(u => u.roles.length === 0);

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Gerenciar Usuários</h2>
      </div>

      {/* Active users */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" /> Usuários Ativos ({usersWithRoles.length})
        </h3>
        {usersWithRoles.map(user => (
          <Card key={user.id}>
            <CardContent className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.fullName || 'Sem nome'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                {user.roles.map(role => (
                  <Badge key={role} variant="outline" className={`text-[10px] ${ROLE_COLORS[role]}`}>
                    {ROLE_LABELS[role]}
                    <button
                      onClick={() => removeRole.mutate({ userId: user.id, role })}
                      className="ml-1 hover:text-destructive"
                      title="Remover role"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {addingRoleFor === user.id ? (
                  <div className="flex items-center gap-1">
                    <Select value={selectedRole} onValueChange={v => setSelectedRole(v as AppRole)}>
                      <SelectTrigger className="h-7 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['admin', 'vendedor', 'financeiro'] as AppRole[])
                          .filter(r => !user.roles.includes(r))
                          .map(r => (
                            <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => addRole.mutate({ userId: user.id, role: selectedRole })}
                      disabled={addRole.isPending}
                    >
                      OK
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingRoleFor(null)}>
                      ✕
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => {
                      const available = (['admin', 'vendedor', 'financeiro'] as AppRole[]).filter(r => !user.roles.includes(r));
                      if (available.length === 0) {
                        toast.info('Usuário já possui todas as roles.');
                        return;
                      }
                      setSelectedRole(available[0]);
                      setAddingRoleFor(user.id);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-0.5" /> Role
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending users */}
      {usersPending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" /> Aguardando Aprovação ({usersPending.length})
          </h3>
          {usersPending.map(user => (
            <Card key={user.id} className="border-dashed">
              <CardContent className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user.fullName || 'Sem nome'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Select value={selectedRole} onValueChange={v => setSelectedRole(v as AppRole)}>
                      <SelectTrigger className="h-7 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['admin', 'vendedor', 'financeiro'] as AppRole[]).map(r => (
                          <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => addRole.mutate({ userId: user.id, role: selectedRole })}
                      disabled={addRole.isPending}
                    >
                      Aprovar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {users.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum usuário encontrado nesta empresa.</p>
      )}
    </div>
  );
}
