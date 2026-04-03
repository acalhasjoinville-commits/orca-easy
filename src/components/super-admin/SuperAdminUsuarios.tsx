import { useState } from "react";
import { useSAUsers, useSAEmpresas, useSAMutations } from "@/hooks/useSuperAdmin";
import type { SAAppRole, SAUser } from "@/hooks/useSuperAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Trash2, UserCheck } from "lucide-react";
import { format } from "date-fns";

const roleOptions: SAAppRole[] = ["admin", "vendedor", "financeiro"];

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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Usuarios</h2>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, e-mail ou empresa..."
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Papel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="vendedor">Vendedor</SelectItem>
            <SelectItem value="financeiro">Financeiro</SelectItem>
            <SelectItem value="sem_papel">Sem Papel</SelectItem>
          </SelectContent>
        </Select>
        <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="sem_empresa">Sem Empresa</SelectItem>
            {(empresas || []).map((empresa) => (
              <SelectItem key={empresa.id} value={empresa.id}>
                {empresa.nome_fantasia}
              </SelectItem>
            ))}
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
                <TableHead>Papeis</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.full_name || "(sem nome)"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-sm">
                    {user.empresa_nome || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    {user.roles.length > 0 ? (
                      user.roles.map((roleEntry) => (
                        <Badge
                          key={`${user.user_id}-${roleEntry.role}-${roleEntry.empresa_id}`}
                          variant="secondary"
                          className="mr-1 text-xs capitalize"
                        >
                          {roleEntry.role}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Sem papel
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(user.created_at), "dd/MM/yy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.roles.length === 0 && (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openApprove(user)}>
                          <UserCheck className="h-3 w-3 mr-1" />
                          Aprovar
                        </Button>
                      )}
                      {user.empresa_id && user.roles.length > 0 && (
                        <>
                          <Select
                            onValueChange={(value: SAAppRole) =>
                              upsertUserRole.mutate({ userId: user.user_id, empresaId: user.empresa_id!, role: value })
                            }
                          >
                            <SelectTrigger className="h-7 w-28 text-xs">
                              <SelectValue placeholder="Alterar" />
                            </SelectTrigger>
                            <SelectContent>
                              {roleOptions.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role === "admin" ? "Admin" : role === "vendedor" ? "Vendedor" : "Financeiro"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => deleteUserRole.mutate({ userId: user.user_id, empresaId: user.empresa_id! })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum usuario encontrado.
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
            <DialogTitle>Aprovar Usuario</DialogTitle>
          </DialogHeader>
          {approveTarget && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Aprovar <strong>{approveTarget.full_name || approveTarget.email}</strong>
              </p>
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
                        {role === "admin" ? "Admin" : role === "vendedor" ? "Vendedor" : "Financeiro"}
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
                Aprovar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
