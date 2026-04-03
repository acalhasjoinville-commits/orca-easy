import { format } from "date-fns";
import { Activity, AlertTriangle, Building2, Clock3, Loader2, Mail, Shield, ShieldOff, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSADashboard } from "@/hooks/useSuperAdmin";

interface KPIItem {
  label: string;
  helper: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export function SuperAdminDashboard() {
  const { data: stats, isLoading } = useSADashboard();

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpis: KPIItem[] = [
    {
      label: "Empresas",
      helper: "Total cadastrado na plataforma",
      value: stats.total_empresas,
      icon: Building2,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Ativas",
      helper: "Contas operando normalmente",
      value: stats.empresas_ativas,
      icon: Activity,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Suspensas",
      helper: "Sem operação liberada",
      value: stats.empresas_suspensas,
      icon: AlertTriangle,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Bloqueadas",
      helper: "Acesso operacional bloqueado",
      value: stats.empresas_bloqueadas,
      icon: ShieldOff,
      color: "bg-destructive/10 text-destructive",
    },
    {
      label: "Usuários",
      helper: "Perfis vinculados às empresas",
      value: stats.total_usuarios,
      icon: Users,
      color: "bg-sky-500/10 text-sky-600",
    },
    {
      label: "Sem papel",
      helper: "Entraram, mas ainda sem liberação",
      value: stats.usuarios_sem_papel,
      icon: Clock3,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Convites",
      helper: "Pendências de acesso em aberto",
      value: stats.convites_pendentes,
      icon: Mail,
      color: "bg-indigo-500/10 text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Dashboard da plataforma</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Acompanhe o status das empresas, usuários aguardando liberação e movimentações recentes para agir rápido
          quando alguma conta exigir atenção.
        </p>
      </div>

      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Visão geral da operação</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Este painel concentra a saúde da base em nível de plataforma. Use os indicadores para localizar empresas
                suspensas, convites esquecidos e usuários que ainda dependem de aprovação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{kpi.label}</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{kpi.value}</p>
                </div>
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", kpi.color)}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{kpi.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Empresas recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.empresas_recentes.map((empresa) => (
              <div
                key={empresa.id}
                className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/20 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{empresa.nome_fantasia}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Criada em {format(new Date(empresa.created_at), "dd/MM/yyyy")}
                  </p>
                </div>
                <StatusBadge status={empresa.status} />
              </div>
            ))}
            {stats.empresas_recentes.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma empresa recente para mostrar.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usuários recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.usuarios_recentes.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/20 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{user.full_name || "(sem nome)"}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {user.created_at ? format(new Date(user.created_at), "dd/MM/yy") : "--"}
                </span>
              </div>
            ))}
            {stats.usuarios_recentes.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum usuário recente para mostrar.</p>
            )}
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
