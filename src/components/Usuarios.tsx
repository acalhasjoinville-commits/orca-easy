import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppRole, useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Send,
  X,
  MoreVertical,
  Search,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  empresa_id: string | null;
}

interface UserRoleRow {
  user_id: string;
  role: AppRole;
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  vendedor: "Vendedor",
  financeiro: "Financeiro",
};

const ROLE_HELPERS: Record<AppRole, string> = {
  admin: "Controla a operação da empresa e também a gestão de acessos.",
  vendedor: "Cuida da rotina comercial e operacional ligada ao orçamento.",
  financeiro: "Fica focado no financeiro, sem acesso à agenda comercial.",
};

const ROLE_ACCESS: Record<AppRole, string[]> = {
  admin: ["Dashboard", "Agenda", "Orçamentos", "Clientes", "Financeiro", "Configurações", "Usuários"],
  vendedor: ["Dashboard", "Agenda", "Orçamentos", "Clientes"],
  financeiro: ["Dashboard", "Orçamentos", "Financeiro"],
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  vendedor: "bg-primary/10 text-primary border-primary/20",
  financeiro: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

const ROLE_OPTIONS: AppRole[] = ["admin", "vendedor", "financeiro"];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return null;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

function getInitials(name: string, email: string) {
  const base = name.trim() || email.trim();
  const parts = base.split(" ").filter(Boolean);
  if (parts.length === 0) return "US";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function Usuarios() {
  const { empresaId, user } = useAuth();
  const qc = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("vendedor");
  const [approvalRoles, setApprovalRoles] = useState<Record<string, AppRole>>({});
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["empresa-users", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const { data: profilesRaw, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, empresa_id")
        .eq("empresa_id", empresaId);
      if (profileError) throw profileError;

      const { data: rolesRaw, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("empresa_id", empresaId);
      if (rolesError) throw rolesError;

      const profiles = (profilesRaw ?? []) as ProfileRow[];
      const roles = (rolesRaw ?? []) as UserRoleRow[];
      const roleMap = new Map<string, AppRole[]>();

      roles.forEach((roleRow) => {
        const existing = roleMap.get(roleRow.user_id) || [];
        existing.push(roleRow.role);
        roleMap.set(roleRow.user_id, existing);
      });

      return profiles.map(
        (profile): UserProfile => ({
          id: profile.id,
          fullName: profile.full_name || "",
          email: profile.email || "—",
          roles: roleMap.get(profile.id) || [],
        }),
      );
    },
    enabled: !!empresaId,
  });

  const { data: invites = [] } = useQuery({
    queryKey: ["invites", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const { data, error } = await supabase
        .from("invites")
        .select("id, email, role, created_at, used_at")
        .eq("empresa_id", empresaId)
        .is("used_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Invite[];
    },
    enabled: !!empresaId,
  });

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      if (!empresaId) throw new Error("Sem empresa vinculada.");

      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role,
        empresa_id: empresaId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["empresa-users", empresaId] });
      toast.success("Acesso atualizado!", { duration: 2500 });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      if (message?.includes("duplicate")) toast.error("Este usuário já possui esse acesso.", { duration: 5000 });
      else toast.error(message || "Erro ao adicionar acesso.", { duration: 5000 });
    },
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      if (!empresaId) throw new Error("Sem empresa vinculada.");

      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role)
        .eq("empresa_id", empresaId);

      if (error) {
        if (error.message?.includes("último administrador")) {
          throw new Error("Não é possível remover o último administrador da empresa.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["empresa-users", empresaId] });
      toast.success("Acesso removido.", { duration: 2500 });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Erro ao remover acesso.", { duration: 5000 });
    },
  });

  const createInvite = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      if (!empresaId || !user) throw new Error("Sem empresa vinculada.");

      const { error } = await supabase.from("invites").insert({
        empresa_id: empresaId,
        email: email.toLowerCase().trim(),
        role,
        invited_by: user.id,
      });

      if (error) {
        if (error.message?.includes("duplicate") || error.code === "23505") {
          throw new Error("Já existe um convite pendente para este e-mail.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invites", empresaId] });
      setInviteEmail("");
      toast.success("Convite criado!", { duration: 4000 });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Erro ao criar convite.", { duration: 5000 });
    },
  });

  const revokeInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase.from("invites").delete().eq("id", inviteId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invites", empresaId] });
      toast.success("Convite revogado.", { duration: 2500 });
    },
    onError: () => {
      toast.error("Erro ao revogar convite.", { duration: 5000 });
    },
  });

  const handleSendInvite = () => {
    const email = inviteEmail.trim();
    if (!email || !email.includes("@")) {
      toast.error("Informe um e-mail válido.", { duration: 4000 });
      return;
    }

    createInvite.mutate({ email, role: inviteRole });
  };

  const getAvailableRoles = (roles: AppRole[]) => ROLE_OPTIONS.filter((role) => !roles.includes(role));

  const searchQuery = normalize(search.trim());

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(
      (profile) => normalize(profile.fullName).includes(searchQuery) || normalize(profile.email).includes(searchQuery),
    );
  }, [searchQuery, users]);

  const filteredInvites = useMemo(() => {
    if (!searchQuery) return invites;
    return invites.filter(
      (invite) =>
        normalize(invite.email).includes(searchQuery) || normalize(ROLE_LABELS[invite.role]).includes(searchQuery),
    );
  }, [invites, searchQuery]);

  const usersWithRoles = filteredUsers.filter((profile) => profile.roles.length > 0);
  const usersPending = filteredUsers.filter((profile) => profile.roles.length === 0);
  const hasAnyResult = filteredUsers.length > 0 || filteredInvites.length > 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4 space-y-6 max-w-4xl mx-auto">
      <div>
        <p className="text-sm text-muted-foreground">Convide, aprove e organize os acessos da equipe.</p>
      </div>

      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-2 min-w-0">
              <p className="text-sm font-semibold text-foreground">Como funcionam os acessos</p>
              <p className="text-xs text-muted-foreground">
                Cada papel libera partes diferentes do sistema. Você pode convidar alguém por e-mail, aprovar quem já
                entrou na empresa e ajustar acessos sem mexer no restante da conta.
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {ROLE_OPTIONS.map((role) => (
                  <div key={role} className="rounded-lg border bg-background/80 px-3 py-3">
                    <p className="text-xs font-semibold text-foreground">{ROLE_LABELS[role]}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{ROLE_HELPERS[role]}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {ROLE_ACCESS[role].map((access) => (
                        <Badge
                          key={`${role}-${access}`}
                          variant="outline"
                          className={cn("text-[10px] px-1.5 py-0", ROLE_COLORS[role])}
                        >
                          {access}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <p className="text-[11px] font-medium text-foreground">Sem papel definido</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  A pessoa consegue entrar com a conta, mas fica em{" "}
                  <span className="font-medium text-foreground">Aguardando aprovação</span> até receber um papel.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Usuários ativos</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {users.filter((profile) => profile.roles.length > 0).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Membros com acesso liberado ao sistema.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Aguardando aprovação
            </p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {users.filter((profile) => profile.roles.length === 0).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Pessoas que já entraram, mas ainda sem papel definido.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Convites pendentes</p>
            <p className="text-2xl font-bold text-foreground mt-2">{invites.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Convites enviados e ainda não utilizados.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">Convidar alguém para a equipe</h2>
              <p className="text-xs text-muted-foreground mt-1">
                O convite fica vinculado ao e-mail informado. Quando a pessoa entrar com esse e-mail, o sistema já
                saberá qual acesso liberar.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
            <Input
              placeholder="email@empresa.com"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              className="h-10"
              type="email"
            />
            <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as AppRole)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSendInvite} disabled={createInvite.isPending} className="h-10 gap-2">
              {createInvite.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Criar convite
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/20 px-3 py-2">
            <p className="text-[11px] font-medium text-foreground">Papel selecionado: {ROLE_LABELS[inviteRole]}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{ROLE_HELPERS[inviteRole]}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Acesso liberado:{" "}
              <span className="font-medium text-foreground">{ROLE_ACCESS[inviteRole].join(" · ")}</span>
            </p>
          </div>

          {filteredInvites.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Convites pendentes
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Revogue apenas se o convite não for mais necessário.
                </p>
              </div>
              <div className="space-y-2">
                {filteredInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{invite.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ROLE_LABELS[invite.role]} · Enviado em {formatDate(invite.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => revokeInvite.mutate(invite.id)}
                      disabled={revokeInvite.isPending}
                    >
                      <X className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Revogar</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, e-mail ou papel..."
              className="h-10 pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {!hasAnyResult && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Nenhum resultado encontrado</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ajuste a busca ou limpe o filtro para visualizar usuários e convites.
            </p>
          </CardContent>
        </Card>
      )}

      {hasAnyResult && (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Usuários ativos</h2>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {usersWithRoles.length}
              </Badge>
            </div>

            {usersWithRoles.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <ShieldCheck className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Nenhum usuário ativo nesta busca</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quando um usuário receber um papel, ele aparecerá aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              usersWithRoles.map((profile) => {
                const availableRoles = getAvailableRoles(profile.roles);
                return (
                  <Card key={profile.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                            {getInitials(profile.fullName, profile.email)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {profile.fullName || "Sem nome"}
                              </p>
                              {profile.id === user?.id && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  Você
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-1">{profile.email}</p>
                            <p className="text-[11px] text-muted-foreground mt-2">
                              Use o menu para adicionar ou remover acessos deste usuário.
                            </p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            {availableRoles.map((role) => (
                              <DropdownMenuItem
                                key={`add-${profile.id}-${role}`}
                                onClick={() => addRole.mutate({ userId: profile.id, role })}
                                className="text-xs gap-2"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Adicionar {ROLE_LABELS[role]}
                              </DropdownMenuItem>
                            ))}
                            {profile.roles.map((role) => (
                              <DropdownMenuItem
                                key={`remove-${profile.id}-${role}`}
                                onClick={() => removeRole.mutate({ userId: profile.id, role })}
                                className="text-xs gap-2 text-destructive focus:text-destructive"
                              >
                                <X className="h-3.5 w-3.5" />
                                Remover {ROLE_LABELS[role]}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {profile.roles.map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className={cn("text-[10px] px-2 py-1", ROLE_COLORS[role])}
                          >
                            {ROLE_LABELS[role]}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">Aguardando aprovação</h2>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {usersPending.length}
              </Badge>
            </div>

            {usersPending.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center">
                  <UserPlus className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Nenhum usuário aguardando aprovação</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quando alguém entrar sem papel definido, aparecerá aqui para você liberar o acesso.
                  </p>
                </CardContent>
              </Card>
            ) : (
              usersPending.map((profile) => {
                const selectedApprovalRole = approvalRoles[profile.id] || "vendedor";
                return (
                  <Card key={profile.id} className="border-dashed border-amber-500/30 bg-amber-500/5">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {profile.fullName || "Sem nome"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">{profile.email}</p>
                          <p className="text-[11px] text-muted-foreground mt-2">
                            Esta pessoa já pertence à empresa, mas ainda não consegue usar o sistema porque não tem
                            papel definido.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                          <Select
                            value={selectedApprovalRole}
                            onValueChange={(value) =>
                              setApprovalRoles((current) => ({ ...current, [profile.id]: value as AppRole }))
                            }
                          >
                            <SelectTrigger className="h-9 w-full sm:w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {ROLE_LABELS[role]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            className="h-9 gap-2"
                            onClick={() => addRole.mutate({ userId: profile.id, role: selectedApprovalRole })}
                            disabled={addRole.isPending}
                          >
                            {addRole.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ShieldCheck className="h-4 w-4" />
                            )}
                            Aprovar acesso
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
