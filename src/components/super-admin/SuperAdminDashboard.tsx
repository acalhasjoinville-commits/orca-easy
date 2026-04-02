import { useSADashboard } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Mail, AlertTriangle, ShieldOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function SuperAdminDashboard() {
  const { data: stats, isLoading } = useSADashboard();

  if (isLoading || !stats) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const kpis = [
    { label: 'Total Empresas', value: stats.total_empresas, icon: Building2, color: 'text-primary' },
    { label: 'Ativas', value: stats.empresas_ativas, icon: Building2, color: 'text-chart-3' },
    { label: 'Suspensas', value: stats.empresas_suspensas, icon: AlertTriangle, color: 'text-accent' },
    { label: 'Bloqueadas', value: stats.empresas_bloqueadas, icon: ShieldOff, color: 'text-destructive' },
    { label: 'Total Usuários', value: stats.total_usuarios, icon: Users, color: 'text-primary' },
    { label: 'Sem Papel', value: stats.usuarios_sem_papel, icon: Users, color: 'text-accent' },
    { label: 'Convites Pendentes', value: stats.convites_pendentes, icon: Mail, color: 'text-chart-4' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpis.map(k => (
          <Card key={k.label}>
            <CardContent className="pt-4 pb-3 px-4 text-center">
              <k.icon className={`h-5 w-5 mx-auto mb-1 ${k.color}`} />
              <div className="text-2xl font-bold text-foreground">{k.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Empresas Recentes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stats.empresas_recentes.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{e.nome_fantasia}</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={e.status} />
                  <span className="text-xs text-muted-foreground">{format(new Date(e.created_at), 'dd/MM/yy')}</span>
                </div>
              </div>
            ))}
            {stats.empresas_recentes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma empresa.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Usuários Recentes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stats.usuarios_recentes.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-foreground">{u.full_name || '(sem nome)'}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{u.email}</span>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(u.created_at), 'dd/MM/yy')}</span>
              </div>
            ))}
            {stats.usuarios_recentes.length === 0 && <p className="text-sm text-muted-foreground">Nenhum usuário.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    ativa: { label: 'Ativa', variant: 'default' },
    suspensa: { label: 'Suspensa', variant: 'secondary' },
    bloqueada: { label: 'Bloqueada', variant: 'destructive' },
  };
  const cfg = map[status] || { label: status, variant: 'outline' as const };
  return <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>;
}
