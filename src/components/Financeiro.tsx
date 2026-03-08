import { useMemo, useState } from 'react';
import { useOrcamentos } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, BarChart3, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtPct = (v: number) => `${v.toFixed(1)}%`;

type PeriodFilter = 'month' | '3months' | 'year';
type StatusFilter = 'all' | 'aprovado' | 'executado';

export function Financeiro() {
  const { data: orcamentos = [] } = useOrcamentos();
  const [period, setPeriod] = useState<PeriodFilter>('year');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const now = new Date();

  const filtered = useMemo(() => {
    return orcamentos.filter((orc) => {
      // Status filter
      if (statusFilter !== 'all' && orc.status !== statusFilter) return false;

      // Period filter
      const d = new Date(orc.dataCriacao);
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (period === '3months') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        return d >= threeMonthsAgo;
      }
      // year
      return d.getFullYear() === now.getFullYear();
    });
  }, [orcamentos, period, statusFilter]);

  // KPI cards
  const kpis = useMemo(() => {
    const faturamento = filtered.reduce((s, o) => s + o.valorFinal, 0);
    const custo = filtered.reduce((s, o) => s + o.custoTotalObra, 0);
    const lucro = faturamento - custo;
    const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0;
    return { faturamento, custo, lucro, margem };
  }, [filtered]);

  // Chart data — last 6 months
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

  // Top 5 most profitable
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <div className="flex gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mês Atual</SelectItem>
              <SelectItem value="3months">Últimos 3 Meses</SelectItem>
              <SelectItem value="year">Ano Atual</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[160px]">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card
            key={kpi.title}
            className={kpi.highlight ? 'border-accent bg-accent/5' : ''}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.highlight ? 'text-accent' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${kpi.highlight ? 'text-accent' : 'text-foreground'}`}>
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Receita vs Custo — Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  tick={{ fontSize: 11 }}
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
          <CardHeader>
            <CardTitle className="text-base">Resumo do Período</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Orçamentos no período</p>
              <p className="text-3xl font-bold text-foreground">{filtered.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-xl font-semibold text-foreground">
                {filtered.length > 0 ? fmt(kpis.faturamento / filtered.length) : 'R$ 0,00'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Lucro por Orçamento</p>
              <p className="text-xl font-semibold text-accent">
                {filtered.length > 0 ? fmt(kpis.lucro / filtered.length) : 'R$ 0,00'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 — Orçamentos Mais Lucrativos</CardTitle>
        </CardHeader>
        <CardContent>
          {top5.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhum orçamento encontrado para o período selecionado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Custo Total</TableHead>
                  <TableHead className="text-right">Lucro Bruto</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top5.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.nomeCliente}</TableCell>
                    <TableCell>{new Date(o.dataCriacao).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">{fmt(o.valorFinal)}</TableCell>
                    <TableCell className="text-right">{fmt(o.custoTotalObra)}</TableCell>
                    <TableCell className="text-right font-semibold text-accent">{fmt(o.lucro)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={o.margem >= 40 ? 'default' : 'secondary'}>
                        {fmtPct(o.margem)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
