import { useState } from "react";
import { useSAEmpresaDetail, useSAMutations } from "@/hooks/useSuperAdmin";
import type { SAAppRole } from "@/hooks/useSuperAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./SuperAdminDashboard";
import { ArrowLeft, Loader2, UserPlus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Props {
  empresaId: string;
  onBack: () => void;
}

const roleOptions: SAAppRole[] = ["admin", "vendedor", "financeiro"];
const statusOptions = ["ativa", "suspensa", "bloqueada"] as const;

export function SuperAdminEmpresaDetail({ empresaId, onBack }: Props) {
  const { data, isLoading } = useSAEmpresaDetail(empresaId);
  const { updateEmpresaStatus, upsertUserRole, deleteUserRole, createInvite, revokeInvite } = useSAMutations();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<{ email: string; role: SAAppRole }>({ email: "", role: "vendedor" });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { empresa, users, invites } = data;
  const pendingInvites = invites.filter((invite) => !invite.used_at);

  const handleInvite = async () => {
    if (!inviteForm.email) {
      return;
    }

    await createInvite.mutateAsync({ empresaId, email: inviteForm.email, role: inviteForm.role });
    setInviteForm({ email: "", role: "vendedor" });
    setInviteOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold text-foreground">{empresa.nome_fantasia}</h2>
        <StatusBadge status={empresa.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Razao Social:</span>{" "}
              <span className="font-medium">{empresa.razao_social || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">CNPJ/CPF:</span>{" "}
              <span className="font-medium">{empresa.cnpj_cpf || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">E-mail:</span>{" "}
              <span className="font-medium">{empresa.email_contato || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Telefone:</span>{" "}
              <span className="font-medium">{empresa.telefone_whatsapp || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Endereco:</span>{" "}
              <span className="font-medium">
                {[empresa.endereco, empresa.numero, empresa.bairro, empresa.cidade, empresa.estado]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Criada em:</span>{" "}
              <span className="font-medium">{format(new Date(empresa.created_at), "dd/MM/yyyy HH:mm")}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="text-sm text-muted-foreground mr-2">Alterar status:</span>
            {statusOptions.map((status) => (
              <Button
                key={status}
                size="sm"
                variant={empresa.status === status ? "default" : "outline"}
                disabled={empresa.status === status || updateEmpresaStatus.isPending}
                onClick={() => updateEmpresaStatus.mutate({ empresaId, newStatus: status })}
                className="capitalize text-xs"
              >
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Usuarios ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Papeis</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.full_name || "(sem nome)"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <Badge key={`${user.user_id}-${role}`} variant="secondary" className="mr-1 text-xs capitalize">
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Sem papel
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Select
                        onValueChange={(value: SAAppRole) =>
                          upsertUserRole.mutate({ userId: user.user_id, empresaId, role: value })
                        }
                      >
                        <SelectTrigger className="h-7 w-28 text-xs">
                          <SelectValue placeholder="Definir papel" />
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
                        onClick={() => deleteUserRole.mutate({ userId: user.user_id, empresaId })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    Nenhum usuario.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Convites Pendentes ({pendingInvites.length})</CardTitle>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4 mr-1" />
                Convidar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Convidar Usuario</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>E-mail</Label>
                  <Input
                    value={inviteForm.email}
                    onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </div>
                <div>
                  <Label>Papel</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value: SAAppRole) => setInviteForm((current) => ({ ...current, role: value }))}
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
                <Button onClick={handleInvite} disabled={createInvite.isPending} className="w-full">
                  Enviar Convite
                </Button>
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
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInvites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell className="text-sm">{invite.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {invite.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(invite.created_at), "dd/MM/yy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive text-xs h-7"
                      onClick={() => revokeInvite.mutate(invite.id)}
                    >
                      Revogar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {pendingInvites.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    Nenhum convite pendente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
