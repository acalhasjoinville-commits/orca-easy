import { useState } from "react";
import { useSAInvites, useSAEmpresas, useSAMutations } from "@/hooks/useSuperAdmin";
import type { SAAppRole } from "@/hooks/useSuperAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Plus } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const roleOptions: SAAppRole[] = ["admin", "vendedor", "financeiro"];

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Convites</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Novo Convite
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Criar Convite</DialogTitle>
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
                        {role === "admin" ? "Admin" : role === "vendedor" ? "Vendedor" : "Financeiro"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={createInvite.isPending} className="w-full">
                Enviar Convite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por e-mail ou empresa..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="usado">Usados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
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
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((invite) => {
                const days = differenceInDays(new Date(), new Date(invite.created_at));

                return (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium text-sm">{invite.email}</TableCell>
                    <TableCell className="text-sm">{invite.empresa_nome || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {invite.role}
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
                        <span className="text-destructive font-medium">{days}d</span>
                      ) : (
                        <span className="text-muted-foreground">{days}d</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!invite.used_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive text-xs h-7"
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum convite encontrado.
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
