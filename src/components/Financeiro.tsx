import { useMemo, useState } from 'react';
import { useOrcamentos } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, BarChart3, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtPct = (v: number) => `${v.toFixed(1)}%`;

type PeriodFilter = 'month' | '3months' | 'year';
type StatusFilter = 'all' | 'aprovado' | 'executado';

export function Financeiro() {
  const { orcamentos } = useOrcamentos();
  const [period, setPeriod] = useState<PeriodFilter>('year');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const isMobile = useIsMobile();

  const now = new Date();

  const filtered = useMemo(() => {
    return orcamentos.filter((orc) => {
      if (statusFilter !== 'all' && orc.status !== statusFilter) return false;
      const d = new Date(orc.dataCriacao);
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (period === '3months') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        return d >= threeMonthsAgo;
      }
      return d.getFullYear() === now.getFullYear();
    });
  }, [orcamentos, period, statusFilter]);

  const kpis = useMemo(() => {
    const faturamento = filtered.reduce((s, o) => s + o.valorFinal, 0);
    const custo = filtered.reduce((s, o) => s + o.custoTotalObra, 0);
    const lucro = faturamento - custo;
    const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0;
    return { faturamento, custo, lucro, margem };
  }, [filtered]);

  const chartData = useMemo(() => {
    const months: { key: string; label: string; receita: number; custo: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months.push({ key, label, receita: 0, custo: 0 });
    }
    orcamentos.forEach((orc) => {
      if (statusFilter !== 'all' && orc.status !== statusFilter) return;
      const d = new Date(orc.dataCriacao);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const m = months.find((x) => x.key === key);
      if (m) {
        m.receita += orc.valorFinal;
        m.custo += orc.custoTotalObra;
      }
    });
    return months;
  }, [orcamentos, statusFilter]);

  const top5 = useMemo(() => {
    return [...filtered]
      .map((o) => ({
        ...o,
        lucro: o.valorFinal - o.custoTotalObra,
        margem: o.valorFinal > 0 ? ((o.valorFinal - o.custoTotalObra) / o.valorFinal) * 100 : 0,
      }))
      .sort((a, b) => b.lucro - a.lucro)
      .slice(0, 5);
  }, [filtered]);

  const kpiCards = [
    { title: 'Faturamento Total', value: fmt(kpis.faturamento), icon: DollarSign, highlight: false },
    { title: 'Custo Total', value: fmt(kpis.custo), icon: BarChart3, highlight: false },
    { title: 'Lucro Real', value: fmt(kpis.lucro), icon: TrendingUp, highlight: true },
    { title: 'Margem Média', value: fmtPct(kpis.margem), icon: Percent, highlight: false },
  ];

  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4 space-y-6">
      {/* Header + filters */}
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Análise financeira dos orçamentos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mês Atual</SelectItem>
              <SelectItem value="3months">Últimos 3 Meses</SelectItem>
              <SelectItem value="year">Ano Atual</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="executado">Executado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {kpiCards.map((kpi) => (
          <Card
            key={kpi.title}
            className={kpi.highlight ? 'border-accent/40 bg-accent/5' : ''}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${kpi.highlight ? 'bg-accent/15' : 'bg-muted'}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.highlight ? 'text-accent' : 'text-muted-foreground'}`} />
                </div>
              </div>
              <p className={`text-xl lg:text-2xl font-bold ${kpi.highlight ? 'text-accent' : 'text-foreground'}`}>
                {kpi.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-4 lg:p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Receita vs Custo — Últimos 6 Meses</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => fmt(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="custo" name="Custo" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Resumo do Período</h2>
            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Orçamentos no período</p>
                <p className="text-3xl font-bold text-foreground">{filtered.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Ticket Médio</p>
                <p className="text-xl font-semibold text-foreground">
                  {filtered.length > 0 ? fmt(kpis.faturamento / filtered.length) : 'R$ 0,00'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Lucro por Orçamento</p>
                <p className="text-xl font-semibold text-accent">
                  {filtered.length > 0 ? fmt(kpis.lucro / filtered.length) : 'R$ 0,00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 */}
      <Card>
        <CardContent className="p-4 lg:p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Top 5 — Orçamentos Mais Lucrativos</h2>
          {top5.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhum orçamento encontrado para o período selecionado.
            </p>
          ) : isMobile ? (
            /* Mobile: card list */
            <div className="space-y-3">
              {top5.map((o) => (
                <div key={o.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{o.nomeCliente}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.dataCriacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Badge variant={o.margem >= 40 ? 'default' : 'secondary'} className="text-[10px]">
                      {fmtPct(o.margem)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Valor</p>
                      <p className="font-medium">{fmt(o.valorFinal)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Custo</p>
                      <p className="font-medium">{fmt(o.custoTotalObra)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lucro</p>
                      <p className="font-semibold text-accent">{fmt(o.lucro)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop: table */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Cliente</th>
                    <th className="pb-2 font-medium">Data</th>
                    <th className="pb-2 font-medium text-right">Valor Total</th>
                    <th className="pb-2 font-medium text-right">Custo Total</th>
                    <th className="pb-2 font-medium text-right">Lucro Bruto</th>
                    <th className="pb-2 font-medium text-right">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {top5.map((o) => (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{o.nomeCliente}</td>
                      <td className="py-2.5 text-muted-foreground">{new Date(o.dataCriacao).toLocaleDateString('pt-BR')}</td>
                      <td className="py-2.5 text-right">{fmt(o.valorFinal)}</td>
                      <td className="py-2.5 text-right">{fmt(o.custoTotalObra)}</td>
                      <td className="py-2.5 text-right font-semibold text-accent">{fmt(o.lucro)}</td>
                      <td className="py-2.5 text-right">
                        <Badge variant={o.margem >= 40 ? 'default' : 'secondary'} className="text-[10px]">
                          {fmtPct(o.margem)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
