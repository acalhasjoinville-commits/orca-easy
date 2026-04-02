import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type helpers
export interface SAEmpresa {
  id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj_cpf: string;
  email_contato: string;
  telefone_whatsapp: string;
  status: string;
  created_at: string;
  total_usuarios: number;
  convites_pendentes: number;
  admins: { user_id: string; full_name: string; email: string }[];
}

export interface SAUser {
  user_id: string;
  full_name: string;
  email: string;
  empresa_id: string | null;
  empresa_nome: string | null;
  empresa_status: string | null;
  created_at: string;
  roles: { role: string; empresa_id: string }[];
}

export interface SAInvite {
  id: string;
  email: string;
  role: string;
  empresa_id: string;
  empresa_nome: string;
  invited_by: string;
  created_at: string;
  used_at: string | null;
}

export interface SAAuditEntry {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: any;
  created_at: string;
  admin_name: string;
  admin_email: string;
}

export interface SADashboardStats {
  total_empresas: number;
  empresas_ativas: number;
  empresas_suspensas: number;
  empresas_bloqueadas: number;
  total_usuarios: number;
  usuarios_sem_papel: number;
  convites_pendentes: number;
  empresas_recentes: any[];
  usuarios_recentes: any[];
}

export interface SAEmpresaDetail {
  empresa: any;
  users: { user_id: string; full_name: string; email: string; created_at: string; roles: string[] }[];
  invites: { id: string; email: string; role: string; created_at: string; used_at: string | null; invited_by: string }[];
}

async function rpc<T>(fn: string, args?: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.rpc(fn as any, args as any);
  if (error) throw error;
  return data as T;
}

export function useSADashboard() {
  return useQuery({
    queryKey: ['sa-dashboard'],
    queryFn: () => rpc<SADashboardStats>('sa_dashboard_stats'),
    staleTime: 30_000,
  });
}

export function useSAEmpresas() {
  return useQuery({
    queryKey: ['sa-empresas'],
    queryFn: () => rpc<SAEmpresa[]>('sa_list_empresas'),
  });
}

export function useSAEmpresaDetail(empresaId: string | null) {
  return useQuery({
    queryKey: ['sa-empresa-detail', empresaId],
    queryFn: () => rpc<SAEmpresaDetail>('sa_get_empresa_detail', { _empresa_id: empresaId }),
    enabled: !!empresaId,
  });
}

export function useSAUsers() {
  return useQuery({
    queryKey: ['sa-users'],
    queryFn: () => rpc<SAUser[]>('sa_list_all_users'),
  });
}

export function useSAInvites() {
  return useQuery({
    queryKey: ['sa-invites'],
    queryFn: () => rpc<SAInvite[]>('sa_list_all_invites'),
  });
}

export function useSAAuditLog() {
  return useQuery({
    queryKey: ['sa-audit'],
    queryFn: () => rpc<SAAuditEntry[]>('sa_list_audit_log', { _limit: 200 }),
  });
}

export function useSAMutations() {
  const qc = useQueryClient();
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['sa-dashboard'] });
    qc.invalidateQueries({ queryKey: ['sa-empresas'] });
    qc.invalidateQueries({ queryKey: ['sa-users'] });
    qc.invalidateQueries({ queryKey: ['sa-invites'] });
    qc.invalidateQueries({ queryKey: ['sa-audit'] });
    qc.invalidateQueries({ queryKey: ['sa-empresa-detail'] });
  };

  const updateEmpresaStatus = useMutation({
    mutationFn: (args: { empresaId: string; newStatus: string }) =>
      rpc<void>('sa_update_empresa_status', { _empresa_id: args.empresaId, _new_status: args.newStatus }),
    onSuccess: () => { toast.success('Status da empresa atualizado'); invalidateAll(); },
    onError: (e: any) => toast.error(e.message || 'Erro ao atualizar status'),
  });

  const createEmpresa = useMutation({
    mutationFn: (args: { nome_fantasia: string; razao_social?: string; cnpj_cpf?: string; email_contato?: string; telefone?: string; invite_email?: string; invite_role?: string }) =>
      rpc<string>('sa_create_empresa', {
        _nome_fantasia: args.nome_fantasia,
        _razao_social: args.razao_social || '',
        _cnpj_cpf: args.cnpj_cpf || '',
        _email_contato: args.email_contato || '',
        _telefone: args.telefone || '',
        _invite_email: args.invite_email || null,
        _invite_role: args.invite_role || 'admin',
      }),
    onSuccess: () => { toast.success('Empresa criada com sucesso'); invalidateAll(); },
    onError: (e: any) => toast.error(e.message || 'Erro ao criar empresa'),
  });

  const upsertUserRole = useMutation({
    mutationFn: (args: { userId: string; empresaId: string; role: string }) =>
      rpc<void>('sa_upsert_user_role', { _user_id: args.userId, _empresa_id: args.empresaId, _role: args.role }),
    onSuccess: () => { toast.success('Papel atualizado'); invalidateAll(); },
    onError: (e: any) => toast.error(e.message || 'Erro ao atualizar papel'),
  });

  const deleteUserRole = useMutation({
    mutationFn: (args: { userId: string; empresaId: string }) =>
      rpc<void>('sa_delete_user_role', { _user_id: args.userId, _empresa_id: args.empresaId }),
    onSuccess: () => { toast.success('Papel removido'); invalidateAll(); },
    onError: (e: any) => toast.error(e.message || 'Erro ao remover papel'),
  });

  const createInvite = useMutation({
    mutationFn: (args: { empresaId: string; email: string; role: string }) =>
      rpc<string>('sa_create_invite', { _empresa_id: args.empresaId, _email: args.email, _role: args.role }),
    onSuccess: () => { toast.success('Convite criado'); invalidateAll(); },
    onError: (e: any) => toast.error(e.message || 'Erro ao criar convite'),
  });

  const revokeInvite = useMutation({
    mutationFn: (inviteId: string) => rpc<void>('sa_revoke_invite', { _invite_id: inviteId }),
    onSuccess: () => { toast.success('Convite revogado'); invalidateAll(); },
    onError: (e: any) => toast.error(e.message || 'Erro ao revogar convite'),
  });

  const approveUser = useMutation({
    mutationFn: (args: { userId: string; empresaId: string; role?: string }) =>
      rpc<void>('sa_approve_user', { _user_id: args.userId, _empresa_id: args.empresaId, _role: args.role || 'vendedor' }),
    onSuccess: () => { toast.success('Usuário aprovado'); invalidateAll(); },
    onError: (e: any) => toast.error(e.message || 'Erro ao aprovar usuário'),
  });

  return { updateEmpresaStatus, createEmpresa, upsertUserRole, deleteUserRole, createInvite, revokeInvite, approveUser };
}
