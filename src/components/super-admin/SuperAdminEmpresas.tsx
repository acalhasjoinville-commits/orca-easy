import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Building2, Loader2, Mail, Plus, Search, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSAEmpresas, useSAMutations } from "@/hooks/useSuperAdmin";
import type { SAAppRole } from "@/hooks/useSuperAdmin";
import { StatusBadge } from "./SuperAdminDashboard";

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
    (value || "")
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

  const stats = useMemo(() => {
    const source = empresas || [];

    return {
      total: source.length,
      ativas: source.filter((empresa) => empresa.status === "ativa").length,
      suspensas: source.filter((empresa) => empresa.status === "suspensa").length,
      convites: source.reduce((total, empresa) => total + empresa.convites_pendentes, 0),
    };
  }, [empresas]);

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Empresas</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Consulte o status das contas, identifique administradores ativos e abra os detalhes operacionais de cada
            empresa sem sair da visão global.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nova empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar empresa</DialogTitle>
              <DialogDescription>
                Cadastre a conta da empresa e, se quiser, já gere o convite inicial do primeiro administrador.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Nome fantasia *</Label>
                  <Input
                    value={form.nome_fantasia}
                    onChange={(event) => setForm((current) => ({ ...current, nome_fantasia: event.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Razão social</Label>
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
                  <Label>Telefone</Label>
                  <Input
                    value={form.telefone}
                    onChange={(event) => setForm((current) => ({ ...current, telefone: event.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>E-mail de contato</Label>
                  <Input
                    value={form.email_contato}
                    onChange={(event) => setForm((current) => ({ ...current, email_contato: event.target.value }))}
                  />
                </div>
              </div>

              <Card className="border-dashed bg-muted/20">
                <CardContent className="space-y-3 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Convite inicial</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Opcional. Se preencher o e-mail abaixo, o sistema já cria o primeiro convite junto com a empresa.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                    <div>
                      <Label>E-mail do administrador</Label>
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
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleCreate} disabled={createEmpresa.isPending} className="w-full">
                {createEmpresa.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Criar empresa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Gestão global de empresas</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Use esta área para acompanhar status, abrir detalhes, criar novas contas e enxergar rapidamente empresas
                com convites pendentes ou administradores ativos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Empresas"
          value={stats.total}
          helper="Base total cadastrada"
          icon={Building2}
          iconClassName="bg-primary/10 text-primary"
        />
        <MetricCard
          label="Ativas"
          value={stats.ativas}
          helper="Operação liberada"
          icon={Shield}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <MetricCard
          label="Suspensas"
          value={stats.suspensas}
          helper="Exigem atenção"
          icon={Shield}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
        <MetricCard
          label="Convites"
          value={stats.convites}
          helper="Pendências ligadas às empresas"
          icon={Mail}
          iconClassName="bg-sky-500/10 text-sky-600"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, documento ou e-mail..."
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-44">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Base de empresas</CardTitle>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              {filtered.length} exibidas
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Clique em uma empresa para abrir os detalhes, revisar usuários e administrar convites.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ/CPF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Usuários</TableHead>
                <TableHead className="text-center">Convites</TableHead>
                <TableHead>Administradores</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((empresa) => (
                <TableRow
                  key={empresa.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => onSelectEmpresa(empresa.id)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{empresa.nome_fantasia}</p>
                      {empresa.email_contato && (
                        <p className="mt-1 text-xs text-muted-foreground">{empresa.email_contato}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{empresa.cnpj_cpf || "—"}</TableCell>
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
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nenhuma empresa encontrada com os filtros atuais.
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

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: number;
  helper: string;
  icon: typeof Building2;
  iconClassName: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconClassName}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
