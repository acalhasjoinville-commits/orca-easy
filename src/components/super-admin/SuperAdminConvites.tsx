import { differenceInDays, format } from "date-fns";
import { useMemo, useState } from "react";
import { Loader2, Mail, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSAEmpresas, useSAInvites, useSAMutations } from "@/hooks/useSuperAdmin";
import type { SAAppRole } from "@/hooks/useSuperAdmin";

const roleOptions: SAAppRole[] = ["admin", "vendedor", "financeiro"];

const roleLabels: Record<SAAppRole, string> = {
  admin: "Admin",
  vendedor: "Vendedor",
  financeiro: "Financeiro",
};

export function SuperAdminConvites() {
  const { data: invites, isLoading } = useSAInvites();
  const { data: empresas } = useSAEmpresas();
  const { createInvite, revokeInvite } = useSAMutations();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pendente");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<{ empresaId: string; email: string; role: SAAppRole }>({
    empresaId: "",
    email: "",
    role: "vendedor",
  });

  const normalize = (value: string) =>
    (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtered = (invites || []).filter((invite) => {
    const query = normalize(search);
    const matchSearch =
      !query || normalize(invite.email).includes(query) || normalize(invite.empresa_nome).includes(query);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "pendente" ? !invite.used_at : statusFilter === "usado" ? Boolean(invite.used_at) : true);

    return matchSearch && matchStatus;
  });

  const stats = useMemo(() => {
    const source = invites || [];

    return {
      total: source.length,
      pendentes: source.filter((invite) => !invite.used_at).length,
      usados: source.filter((invite) => Boolean(invite.used_at)).length,
      antigos: source.filter(
        (invite) => !invite.used_at && differenceInDays(new Date(), new Date(invite.created_at)) > 7,
      ).length,
    };
  }, [invites]);

  const handleCreate = async () => {
    if (!form.empresaId || !form.email) {
      return;
    }

    await createInvite.mutateAsync({ empresaId: form.empresaId, email: form.email, role: form.role });
    setForm({ empresaId: "", email: "", role: "vendedor" });
    setCreateOpen(false);
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Convites</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Acompanhe convites pendentes, revogue acessos antigos e crie novos convites já vinculando empresa e papel.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Novo convite
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Criar convite</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Empresa</Label>
                <Select
                  value={form.empresaId}
                  onValueChange={(value) => setForm((current) => ({ ...current, empresaId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
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
                <Label>E-mail</Label>
                <Input
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="usuario@empresa.com"
                />
              </div>
              <div>
                <Label>Papel</Label>
                <Select
                  value={form.role}
                  onValueChange={(value: SAAppRole) => setForm((current) => ({ ...current, role: value }))}
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
              <Button onClick={handleCreate} disabled={createInvite.isPending} className="w-full">
                {createInvite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar convite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Pendências de acesso</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Esta área ajuda a localizar convites não utilizados, entender há quanto tempo estão abertos e agir antes
                que virem pendências esquecidas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InviteMetric label="Convites" value={stats.total} helper="Base global registrada" />
        <InviteMetric label="Pendentes" value={stats.pendentes} helper="Aguardando uso" />
        <InviteMetric label="Usados" value={stats.usados} helper="Já convertidos em acesso" />
        <InviteMetric label="Antigos" value={stats.antigos} helper="Pendentes há mais de 7 dias" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por e-mail ou empresa..."
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="usado">Usados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Convites da plataforma</CardTitle>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              {filtered.length} exibidos
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Convites muito antigos merecem revisão, principalmente quando a empresa já está ativa e sem pendências.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((invite) => {
                const days = differenceInDays(new Date(), new Date(invite.created_at));

                return (
                  <TableRow key={invite.id}>
                    <TableCell className="text-sm font-medium">{invite.email}</TableCell>
                    <TableCell className="text-sm">{invite.empresa_nome || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {roleLabels[invite.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invite.used_at ? (
                        <Badge variant="outline" className="text-xs">
                          Usado
                        </Badge>
                      ) : (
                        <Badge className="text-xs">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(invite.created_at), "dd/MM/yy")}
                    </TableCell>
                    <TableCell className="text-xs">
                      {!invite.used_at && days > 7 ? (
                        <span className="font-medium text-destructive">{days}d</span>
                      ) : (
                        <span className="text-muted-foreground">{days}d</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!invite.used_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive"
                          onClick={() => revokeInvite.mutate(invite.id)}
                        >
                          Revogar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nenhum convite encontrado com os filtros atuais.
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

function InviteMetric({ label, value, helper }: { label: string; value: number; helper: string }) {
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
