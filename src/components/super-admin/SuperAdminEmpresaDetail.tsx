import { format } from "date-fns";
import { useMemo, useState } from "react";
import { ArrowLeft, Loader2, Trash2, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSAEmpresaDetail, useSAMutations } from "@/hooks/useSuperAdmin";
import type { SAAppRole } from "@/hooks/useSuperAdmin";
import { StatusBadge } from "./SuperAdminDashboard";

interface Props {
  empresaId: string;
  onBack: () => void;
}

const roleOptions: SAAppRole[] = ["admin", "vendedor", "financeiro"];
const statusOptions = ["ativa", "suspensa", "bloqueada"] as const;

const roleLabels: Record<SAAppRole, string> = {
  admin: "Admin",
  vendedor: "Vendedor",
  financeiro: "Financeiro",
};

export function SuperAdminEmpresaDetail({ empresaId, onBack }: Props) {
  const { data, isLoading } = useSAEmpresaDetail(empresaId);
  const { updateEmpresaStatus, upsertUserRole, deleteUserRole, createInvite, revokeInvite } = useSAMutations();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<{ email: string; role: SAAppRole }>({
    email: "",
    role: "vendedor",
  });

  const summary = useMemo(() => {
    if (!data) return null;

    return {
      users: data.users.length,
      pendingInvites: data.invites.filter((invite) => !invite.used_at).length,
      admins: data.users.filter((user) => user.roles.includes("admin")).length,
    };
  }, [data]);

  if (isLoading || !data || !summary) {
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">{empresa.nome_fantasia}</h2>
              <StatusBadge status={empresa.status} />
            </div>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Gerencie status, usuários e convites desta empresa sem sair da camada de administração global.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={empresa.status === status ? "default" : "outline"}
              disabled={empresa.status === status || updateEmpresaStatus.isPending}
              onClick={() => updateEmpresaStatus.mutate({ empresaId, newStatus: status })}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Usuários" value={summary.users} helper="Pessoas vinculadas à empresa" />
        <SummaryCard label="Convites pendentes" value={summary.pendingInvites} helper="Ainda sem uso" />
        <SummaryCard label="Admins" value={summary.admins} helper="Com acesso administrativo" />
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">Dados da empresa</CardTitle>
          <p className="text-sm text-muted-foreground">
            Esta área resume os dados institucionais principais usados no sistema e no relacionamento comercial.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <DetailItem label="Razão social" value={empresa.razao_social || "—"} />
            <DetailItem label="CNPJ/CPF" value={empresa.cnpj_cpf || "—"} />
            <DetailItem label="E-mail" value={empresa.email_contato || "—"} />
            <DetailItem label="WhatsApp" value={empresa.telefone_whatsapp || "—"} />
            <DetailItem
              label="Endereço"
              value={
                [empresa.endereco, empresa.numero, empresa.bairro, empresa.cidade, empresa.estado]
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />
            <DetailItem label="Criada em" value={format(new Date(empresa.created_at), "dd/MM/yyyy HH:mm")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Usuários da empresa</CardTitle>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              {users.length} usuários
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Use Alterar para ajustar o papel dentro da empresa ou Remover para retirar o acesso atual.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Papéis</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.full_name || "(sem nome)"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    {user.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((role) => (
                          <Badge key={`${user.user_id}-${role}`} variant="secondary" className="text-xs capitalize">
                            {roleLabels[role]}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Sem papel
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Select
                        onValueChange={(value: SAAppRole) =>
                          upsertUserRole.mutate({ userId: user.user_id, empresaId, role: value })
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
                        onClick={() => deleteUserRole.mutate({ userId: user.user_id, empresaId })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    Nenhum usuário vinculado a esta empresa.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Convites pendentes</CardTitle>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Convidar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Convidar usuário</DialogTitle>
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
                            {roleLabels[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleInvite} disabled={createInvite.isPending} className="w-full">
                    {createInvite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar convite
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm text-muted-foreground">
            Convites abertos aparecem aqui até serem usados ou revogados pela administração.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInvites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell className="text-sm">{invite.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {roleLabels[invite.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(invite.created_at), "dd/MM/yy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive"
                      onClick={() => revokeInvite.mutate(invite.id)}
                    >
                      Revogar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {pendingInvites.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    Nenhum convite pendente para esta empresa.
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

function SummaryCard({ label, value, helper }: { label: string; value: number; helper: string }) {
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

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
