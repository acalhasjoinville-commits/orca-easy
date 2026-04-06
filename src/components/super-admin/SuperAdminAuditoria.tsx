import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Loader2, ScrollText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSAAuditLog } from "@/hooks/useSuperAdmin";

const actionLabels: Record<string, string> = {
  create_empresa: "Criar empresa",
  update_empresa_status: "Alterar status",
  upsert_user_role: "Definir papel",
  delete_user_role: "Remover papel",
  create_invite: "Criar convite",
  revoke_invite: "Revogar convite",
  approve_user: "Aprovar usuario",
};

export function SuperAdminAuditoria() {
  const { data: logs, isLoading } = useSAAuditLog();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const normalize = (value: string) =>
    (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtered = (logs || []).filter((log) => {
    const query = normalize(search);
    const matchSearch =
      !query ||
      normalize(log.admin_name || "").includes(query) ||
      normalize(log.admin_email || "").includes(query) ||
      normalize(log.action).includes(query) ||
      normalize(JSON.stringify(log.details || {})).includes(query);
    const matchAction = actionFilter === "all" || log.action === actionFilter;

    return matchSearch && matchAction;
  });

  const uniqueActions = useMemo(() => [...new Set((logs || []).map((log) => log.action))], [logs]);

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
        <h2 className="text-2xl font-bold text-foreground">Auditoria</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Consulte o historico das acoes sensiveis do super admin para entender mudancas de status, papeis, convites e
          criacao de empresas.
        </p>
      </div>

      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ScrollText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Rastreabilidade minima da plataforma</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Use esta visao para revisar o que foi alterado, por quem e em qual alvo. Isso ajuda a investigar
                mudancas administrativas e validar decisoes recentes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por admin, acao ou detalhe..."
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Acao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {actionLabels[action] || action}
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
            <CardTitle className="text-base">Log de acoes</CardTitle>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              {filtered.length} registros
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Os detalhes ajudam a confirmar o alvo da acao e o contexto em que a alteracao aconteceu.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Acao</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {format(new Date(log.created_at), "dd/MM/yy HH:mm")}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium">{log.admin_name || "-"}</div>
                    <div className="text-xs text-muted-foreground">{log.admin_email || "-"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {actionLabels[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs capitalize text-muted-foreground">{log.target_type}</TableCell>
                  <TableCell className="max-w-[320px] text-xs text-muted-foreground">
                    <div className="line-clamp-2">
                      {log.details && Object.keys(log.details).length > 0 ? JSON.stringify(log.details) : "-"}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Nenhum registro encontrado com os filtros atuais.
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
