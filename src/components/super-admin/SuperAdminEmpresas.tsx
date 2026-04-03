import { useState } from "react";
import { useSAEmpresas, useSAMutations } from "@/hooks/useSuperAdmin";
import type { SAAppRole } from "@/hooks/useSuperAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "./SuperAdminDashboard";
import { Loader2, Plus, Search } from "lucide-react";
import { format } from "date-fns";

interface Props {
  onSelectEmpresa: (id: string) => void;
}

interface CreateEmpresaForm {
  nome_fantasia: string;
  razao_social: string;
  cnpj_cpf: string;
  email_contato: string;
  telefone: string;
  invite_email: string;
  invite_role: SAAppRole;
}

const initialForm: CreateEmpresaForm = {
  nome_fantasia: "",
  razao_social: "",
  cnpj_cpf: "",
  email_contato: "",
  telefone: "",
  invite_email: "",
  invite_role: "admin",
};

export function SuperAdminEmpresas({ onSelectEmpresa }: Props) {
  const { data: empresas, isLoading } = useSAEmpresas();
  const { createEmpresa } = useSAMutations();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateEmpresaForm>(initialForm);

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtered = (empresas || []).filter((empresa) => {
    const query = normalize(search);
    const matchSearch =
      !query ||
      normalize(empresa.nome_fantasia).includes(query) ||
      normalize(empresa.razao_social || "").includes(query) ||
      normalize(empresa.cnpj_cpf || "").includes(query) ||
      normalize(empresa.email_contato || "").includes(query);
    const matchStatus = statusFilter === "all" || empresa.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleCreate = async () => {
    if (!form.nome_fantasia.trim()) {
      return;
    }

    await createEmpresa.mutateAsync({
      nome_fantasia: form.nome_fantasia,
      razao_social: form.razao_social,
      cnpj_cpf: form.cnpj_cpf,
      email_contato: form.email_contato,
      telefone: form.telefone,
      invite_email: form.invite_email || undefined,
      invite_role: form.invite_role,
    });

    setForm(initialForm);
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
        <h2 className="text-2xl font-bold text-foreground">Empresas</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Empresa</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nome Fantasia *</Label>
                <Input
                  value={form.nome_fantasia}
                  onChange={(event) => setForm((current) => ({ ...current, nome_fantasia: event.target.value }))}
                />
              </div>
              <div>
                <Label>Razao Social</Label>
                <Input
                  value={form.razao_social}
                  onChange={(event) => setForm((current) => ({ ...current, razao_social: event.target.value }))}
                />
              </div>
              <div>
                <Label>CNPJ/CPF</Label>
                <Input
                  value={form.cnpj_cpf}
                  onChange={(event) => setForm((current) => ({ ...current, cnpj_cpf: event.target.value }))}
                />
              </div>
              <div>
                <Label>E-mail de Contato</Label>
                <Input
                  value={form.email_contato}
                  onChange={(event) => setForm((current) => ({ ...current, email_contato: event.target.value }))}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={form.telefone}
                  onChange={(event) => setForm((current) => ({ ...current, telefone: event.target.value }))}
                />
              </div>
              <hr />
              <p className="text-xs text-muted-foreground">Opcional: enviar convite para o primeiro administrador.</p>
              <div>
                <Label>E-mail do Admin</Label>
                <Input
                  value={form.invite_email}
                  onChange={(event) => setForm((current) => ({ ...current, invite_email: event.target.value }))}
                  placeholder="admin@empresa.com"
                />
              </div>
              <div>
                <Label>Papel</Label>
                <Select
                  value={form.invite_role}
                  onValueChange={(value: SAAppRole) => setForm((current) => ({ ...current, invite_role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={createEmpresa.isPending} className="w-full">
                {createEmpresa.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Criar Empresa
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
            placeholder="Buscar empresa..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ativa">Ativa</SelectItem>
            <SelectItem value="suspensa">Suspensa</SelectItem>
            <SelectItem value="bloqueada">Bloqueada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ/CPF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Usuarios</TableHead>
                <TableHead className="text-center">Convites</TableHead>
                <TableHead>Admins</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((empresa) => (
                <TableRow
                  key={empresa.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectEmpresa(empresa.id)}
                >
                  <TableCell className="font-medium">{empresa.nome_fantasia}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{empresa.cnpj_cpf || "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={empresa.status} />
                  </TableCell>
                  <TableCell className="text-center">{empresa.total_usuarios}</TableCell>
                  <TableCell className="text-center">{empresa.convites_pendentes}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {empresa.admins?.map((admin) => admin.full_name || admin.email || "Sem nome").join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(empresa.created_at), "dd/MM/yy")}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma empresa encontrada.
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
