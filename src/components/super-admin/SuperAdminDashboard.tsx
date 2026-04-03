import { useSADashboard } from "@/hooks/useSuperAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Mail, AlertTriangle, ShieldOff, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function SuperAdminDashboard() {
  const { data: stats, isLoading } = useSADashboard();

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    { label: "Total Empresas", value: stats.total_empresas, icon: Building2, color: "text-primary" },
    { label: "Ativas", value: stats.empresas_ativas, icon: Building2, color: "text-chart-3" },
    { label: "Suspensas", value: stats.empresas_suspensas, icon: AlertTriangle, color: "text-accent" },
    { label: "Bloqueadas", value: stats.empresas_bloqueadas, icon: ShieldOff, color: "text-destructive" },
    { label: "Total Usuarios", value: stats.total_usuarios, icon: Users, color: "text-primary" },
    { label: "Sem Papel", value: stats.usuarios_sem_papel, icon: Users, color: "text-accent" },
    { label: "Convites Pendentes", value: stats.convites_pendentes, icon: Mail, color: "text-chart-4" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3 px-4 text-center">
              <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Empresas Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.empresas_recentes.map((empresa) => (
              <div key={empresa.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{empresa.nome_fantasia}</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={empresa.status} />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(empresa.created_at), "dd/MM/yy")}
                  </span>
                </div>
              </div>
            ))}
            {stats.empresas_recentes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma empresa.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usuarios Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.usuarios_recentes.map((user) => (
              <div key={user.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-foreground">{user.full_name || "(sem nome)"}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{user.email}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {user.created_at ? format(new Date(user.created_at), "dd/MM/yy") : "--"}
                </span>
              </div>
            ))}
            {stats.usuarios_recentes.length === 0 && <p className="text-sm text-muted-foreground">Nenhum usuario.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ativa: { label: "Ativa", variant: "default" },
    suspensa: { label: "Suspensa", variant: "secondary" },
    bloqueada: { label: "Bloqueada", variant: "destructive" },
  };

  const config = map[status] || { label: status, variant: "outline" as const };

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}
