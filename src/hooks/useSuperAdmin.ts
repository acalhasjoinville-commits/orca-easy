import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Enums, Json, Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type SAAppRole = Enums<"app_role">;

interface SAEmpresaAdmin {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

interface SARoleAssignment {
  role: SAAppRole;
  empresa_id: string;
}

interface SARecentEmpresa {
  id: string;
  nome_fantasia: string;
  status: string;
  created_at: string;
}

interface SARecentUser {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string | null;
}

export interface SAEmpresaUser {
  user_id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  roles: SAAppRole[];
}

export interface SAEmpresaInvite {
  id: string;
  email: string;
  role: SAAppRole;
  created_at: string;
  used_at: string | null;
  invited_by: string;
}

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
  admins: SAEmpresaAdmin[];
}

export interface SAEmpresaUpdateInput {
  empresaId: string;
  nomeFantasia: string;
  razaoSocial?: string;
  cnpjCpf?: string;
  emailContato?: string;
  telefoneWhatsApp?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  slogan?: string;
}

export interface SAUser {
  user_id: string;
  full_name: string;
  email: string;
  empresa_id: string | null;
  empresa_nome: string | null;
  empresa_status: string | null;
  created_at: string;
  roles: SARoleAssignment[];
}

export interface SAInvite {
  id: string;
  email: string;
  role: SAAppRole;
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
  details: Json | null;
  created_at: string;
  admin_name: string | null;
  admin_email: string | null;
}

export interface SADashboardStats {
  total_empresas: number;
  empresas_ativas: number;
  empresas_suspensas: number;
  empresas_bloqueadas: number;
  total_usuarios: number;
  usuarios_sem_papel: number;
  convites_pendentes: number;
  empresas_recentes: SARecentEmpresa[];
  usuarios_recentes: SARecentUser[];
}

export interface SAEmpresaDetail {
  empresa: Tables<"empresa">;
  users: SAEmpresaUser[];
  invites: SAEmpresaInvite[];
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn as never, args as never);
  if (error) throw error;
  return data as T;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useSADashboard() {
  return useQuery({
    queryKey: ["sa-dashboard"],
    queryFn: () => rpc<SADashboardStats>("sa_dashboard_stats"),
    staleTime: 30_000,
  });
}

export function useSAEmpresas() {
  return useQuery({
    queryKey: ["sa-empresas"],
    queryFn: () => rpc<SAEmpresa[]>("sa_list_empresas"),
  });
}

export function useSAEmpresaDetail(empresaId: string | null) {
  return useQuery({
    queryKey: ["sa-empresa-detail", empresaId],
    queryFn: () => rpc<SAEmpresaDetail>("sa_get_empresa_detail", { _empresa_id: empresaId }),
    enabled: !!empresaId,
  });
}

export function useSAUsers() {
  return useQuery({
    queryKey: ["sa-users"],
    queryFn: () => rpc<SAUser[]>("sa_list_all_users"),
  });
}

export function useSAInvites() {
  return useQuery({
    queryKey: ["sa-invites"],
    queryFn: () => rpc<SAInvite[]>("sa_list_all_invites"),
  });
}

export function useSAAuditLog() {
  return useQuery({
    queryKey: ["sa-audit"],
    queryFn: () => rpc<SAAuditEntry[]>("sa_list_audit_log", { _limit: 200 }),
  });
}

export function useSAMutations() {
  const qc = useQueryClient();

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["sa-dashboard"] });
    qc.invalidateQueries({ queryKey: ["sa-empresas"] });
    qc.invalidateQueries({ queryKey: ["sa-users"] });
    qc.invalidateQueries({ queryKey: ["sa-invites"] });
    qc.invalidateQueries({ queryKey: ["sa-audit"] });
    qc.invalidateQueries({ queryKey: ["sa-empresa-detail"] });
  };

  const updateEmpresaStatus = useMutation({
    mutationFn: (args: { empresaId: string; newStatus: string }) =>
      rpc<void>("sa_update_empresa_status", { _empresa_id: args.empresaId, _new_status: args.newStatus }),
    onSuccess: () => {
      toast.success("Status da empresa atualizado");
      invalidateAll();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Erro ao atualizar status")),
  });

  const createEmpresa = useMutation({
    mutationFn: (args: {
      nome_fantasia: string;
      razao_social?: string;
      cnpj_cpf?: string;
      email_contato?: string;
      telefone?: string;
      invite_email?: string;
      invite_role?: SAAppRole;
    }) =>
      rpc<string>("sa_create_empresa", {
        _nome_fantasia: args.nome_fantasia,
        _razao_social: args.razao_social || "",
        _cnpj_cpf: args.cnpj_cpf || "",
        _email_contato: args.email_contato || "",
        _telefone: args.telefone || "",
        _invite_email: args.invite_email || null,
        _invite_role: args.invite_role || "admin",
      }),
    onSuccess: () => {
      toast.success("Empresa criada com sucesso");
      invalidateAll();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Erro ao criar empresa")),
  });

  const updateEmpresa = useMutation({
    mutationFn: (args: SAEmpresaUpdateInput) =>
      rpc<void>("sa_update_empresa", {
        _empresa_id: args.empresaId,
        _nome_fantasia: args.nomeFantasia,
        _razao_social: args.razaoSocial || "",
        _cnpj_cpf: args.cnpjCpf || "",
        _email_contato: args.emailContato || "",
        _telefone_whatsapp: args.telefoneWhatsApp || "",
        _endereco: args.endereco || "",
        _numero: args.numero || "",
        _bairro: args.bairro || "",
        _cidade: args.cidade || "",
        _estado: args.estado || "",
        _slogan: args.slogan || "",
      }),
    onSuccess: () => {
      toast.success("Dados da empresa atualizados");
      invalidateAll();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Erro ao atualizar empresa")),
  });

  const upsertUserRole = useMutation({
    mutationFn: (args: { userId: string; empresaId: string; role: SAAppRole }) =>
      rpc<void>("sa_upsert_user_role", { _user_id: args.userId, _empresa_id: args.empresaId, _role: args.role }),
    onSuccess: () => {
      toast.success("Papel atualizado");
      invalidateAll();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Erro ao atualizar papel")),
  });

  const deleteUserRole = useMutation({
    mutationFn: (args: { userId: string; empresaId: string }) =>
      rpc<void>("sa_delete_user_role", { _user_id: args.userId, _empresa_id: args.empresaId }),
    onSuccess: () => {
      toast.success("Papel removido");
      invalidateAll();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Erro ao remover papel")),
  });

  const createInvite = useMutation({
    mutationFn: (args: { empresaId: string; email: string; role: SAAppRole }) =>
      rpc<string>("sa_create_invite", { _empresa_id: args.empresaId, _email: args.email, _role: args.role }),
    onSuccess: () => {
      toast.success("Convite criado");
      invalidateAll();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Erro ao criar convite")),
  });

  const revokeInvite = useMutation({
    mutationFn: (inviteId: string) => rpc<void>("sa_revoke_invite", { _invite_id: inviteId }),
    onSuccess: () => {
      toast.success("Convite revogado");
      invalidateAll();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Erro ao revogar convite")),
  });

  const approveUser = useMutation({
    mutationFn: (args: { userId: string; empresaId: string; role?: SAAppRole }) =>
      rpc<void>("sa_approve_user", {
        _user_id: args.userId,
        _empresa_id: args.empresaId,
        _role: args.role || "vendedor",
      }),
    onSuccess: () => {
      toast.success("Usuario aprovado");
      invalidateAll();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Erro ao aprovar usuario")),
  });

  return {
    updateEmpresaStatus,
    createEmpresa,
    updateEmpresa,
    upsertUserRole,
    deleteUserRole,
    createInvite,
    revokeInvite,
    approveUser,
  };
}
