import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Loader2, Search, ShieldAlert, Trash2, UserCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSAEmpresas, useSAMutations, useSAUsers } from "@/hooks/useSuperAdmin";
import type { SAAppRole, SAUser } from "@/hooks/useSuperAdmin";
import { StatusBadge } from "./SuperAdminDashboard";

const roleOptions: SAAppRole[] = ["admin", "vendedor", "financeiro"];

const roleLabels: Record<SAAppRole, string> = {
  admin: "Admin",
  vendedor: "Vendedor",
  financeiro: "Financeiro",
};

export function SuperAdminUsuarios() {
  const { data: users, isLoading } = useSAUsers();
  const { data: empresas } = useSAEmpresas();
  const { upsertUserRole, deleteUserRole, approveUser } = useSAMutations();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [empresaFilter, setEmpresaFilter] = useState("all");
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<SAUser | null>(null);
  const [approveForm, setApproveForm] = useState<{ empresaId: string; role: SAAppRole }>({
    empresaId: "",
    role: "vendedor",
  });

  const normalize = (value: string) =>
    (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtered = (users || []).filter((user) => {
    const query = normalize(search);
    const matchSearch =
      !query ||
      normalize(user.full_name).includes(query) ||
      normalize(user.email).includes(query) ||
      normalize(user.empresa_nome || "").includes(query);
    const matchRole =
      roleFilter === "all" ||
      (roleFilter === "sem_papel" ? user.roles.length === 0 : user.roles.some((role) => role.role === roleFilter));
    const matchEmpresa =
      empresaFilter === "all" ||
      (empresaFilter === "sem_empresa" ? !user.empresa_id : user.empresa_id === empresaFilter);

    return matchSearch && matchRole && matchEmpresa;
  });

  const stats = useMemo(() => {
    const source = users || [];

    return {
      total: source.length,
      ativos: source.filter((user) => user.roles.length > 0).length,
      pendentes: source.filter((user) => user.roles.length === 0).length,
      semEmpresa: source.filter((user) => !user.empresa_id).length,
    };
  }, [users]);

  const openApprove = (user: SAUser) => {
    setApproveTarget(user);
    setApproveForm({ empresaId: "", role: "vendedor" });
    setApproveOpen(true);
  };

  const handleApprove = async () => {
    if (!approveTarget || !approveForm.empresaId) {
      return;
    }

    await approveUser.mutateAsync({
      userId: approveTarget.user_id,
      empresaId: approveForm.empresaId,
      role: approveForm.role,
    });

    setApproveOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Usuarios</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Revise quem ja recebeu papel, quem ainda depende de aprovacao e em qual empresa cada pessoa esta vinculada.
        </p>
      </div>

      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Gestao global de acessos</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Acompanhe pessoas sem papel definido, altere permissoes por empresa e aprove usuarios pendentes com mais
                contexto antes de liberar o acesso.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <UserMetric label="Usuarios" value={stats.total} helper="Base total da plataforma" />
        <UserMetric label="Ativos" value={stats.ativos} helper="Ja operando normalmente" />
        <UserMetric label="Pendentes" value={stats.pendentes} helper="Ainda sem papel definido" />
        <UserMetric label="Sem empresa" value={stats.semEmpresa} helper="Precisam de vinculacao" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, e-mail ou empresa..."
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full xl:w-40">
                <SelectValue placeholder="Papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="vendedor">Vendedor</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="sem_papel">Sem papel</SelectItem>
              </SelectContent>
            </Select>
            <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
              <SelectTrigger className="w-full xl:w-56">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="sem_empresa">Sem empresa</SelectItem>
                {(empresas || []).map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    {empresa.nome_fantasia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Base global de usuarios</CardTitle>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              {filtered.length} exibidos
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Use Aprovar para usuarios sem papel e Alterar para ajustar papeis dentro da empresa vinculada.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Papeis</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{user.full_name || "(sem nome)"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.empresa_nome ? (
                      <div>
                        <p className="font-medium text-foreground">{user.empresa_nome}</p>
                        {user.empresa_status && (
                          <div className="mt-1">
                            <StatusBadge status={user.empresa_status} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.roles.length > 0 ? (
                      <Badge variant="outline" className="text-xs">
                        Acesso liberado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Aguardando aprovacao
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((roleEntry) => (
                          <Badge
                            key={`${user.user_id}-${roleEntry.role}-${roleEntry.empresa_id}`}
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {roleLabels[roleEntry.role]}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem papel</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(user.created_at), "dd/MM/yy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {user.roles.length === 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => openApprove(user)}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Aprovar
                        </Button>
                      )}

                      {user.empresa_id && user.roles.length > 0 && (
                        <>
                          <Select
                            onValueChange={(value: SAAppRole) =>
                              upsertUserRole.mutate({
                                userId: user.user_id,
                                empresaId: user.empresa_id!,
                                role: value,
                              })
                            }
                          >
                            <SelectTrigger className="h-8 w-28 text-xs">
                              <SelectValue placeholder="Alterar" />
                            </SelectTrigger>
                            <SelectContent>
                              {roleOptions.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {roleLabels[role]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() =>
                              deleteUserRole.mutate({
                                userId: user.user_id,
                                empresaId: user.empresa_id!,
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Nenhum usuario encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Aprovar usuario</DialogTitle>
          </DialogHeader>
          {approveTarget && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-sm font-medium text-foreground">{approveTarget.full_name || approveTarget.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Defina a empresa e o papel inicial para liberar o acesso com seguranca.
                </p>
              </div>

              <div>
                <Label>Empresa</Label>
                <Select
                  value={approveForm.empresaId}
                  onValueChange={(value) => setApproveForm((current) => ({ ...current, empresaId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {(empresas || []).map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome_fantasia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Papel</Label>
                <Select
                  value={approveForm.role}
                  onValueChange={(value: SAAppRole) => setApproveForm((current) => ({ ...current, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleApprove}
                disabled={approveUser.isPending || !approveForm.empresaId}
                className="w-full"
              >
                {approveUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aprovar usuario
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserMetric({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        <p className="mt-3 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
