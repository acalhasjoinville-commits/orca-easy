import { useMemo, useState } from 'react';
import { useOrcamentos } from '@/hooks/useSupabaseData';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useAuth } from '@/hooks/useAuth';
import { LancamentoFinanceiro } from '@/lib/types';
import { LancamentoFormModal } from '@/components/LancamentoFormModal';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, Percent, Plus, Pencil, Trash2, Wallet,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtPct = (v: number) => `${v.toFixed(1)}%`;

type PeriodFilter = 'month' | '3months' | 'year';
type StatusFilter = 'todos' | 'aprovado' | 'executado';
const VALID_STATUSES = ['aprovado', 'executado'];
type TipoFilter = 'all' | 'receita' | 'despesa';

// ─── Period filter helper ───
function filterByPeriod<T>(items: T[], getDate: (item: T) => Date, period: PeriodFilter, now: Date): T[] {
  return items.filter((item) => {
    const d = getDate(item);
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === '3months') return d >= new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return d.getFullYear() === now.getFullYear();
  });
}

// ═══════════════════════════════════════════════════
// Aba: Orçamentos (conteúdo original, sem alteração)
// ═══════════════════════════════════════════════════
function OrcamentosTab() {
  const { orcamentos } = useOrcamentos();
  const [period, setPeriod] = useState<PeriodFilter>('year');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const isMobile = useIsMobile();
  const now = new Date();

  const filtered = useMemo(() => {
    return orcamentos.filter((orc) => {
      if (statusFilter !== 'all' && orc.status !== statusFilter) return false;
      const d = new Date(orc.dataCriacao);
      if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (period === '3months') return d >= new Date(now.getFullYear(), now.getMonth() - 2, 1);
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
      if (m) { m.receita += orc.valorFinal; m.custo += orc.custoTotalObra; }
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
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mês Atual</SelectItem>
            <SelectItem value="3months">Últimos 3 Meses</SelectItem>
            <SelectItem value="year">Ano Atual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="executado">Executado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className={kpi.highlight ? 'border-accent/40 bg-accent/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${kpi.highlight ? 'bg-accent/15' : 'bg-muted'}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.highlight ? 'text-accent' : 'text-muted-foreground'}`} />
                </div>
              </div>
              <p className={`text-xl lg:text-2xl font-bold ${kpi.highlight ? 'text-accent' : 'text-foreground'}`}>{kpi.value}</p>
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
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => fmt(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
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
                <p className="text-xl font-semibold text-foreground">{filtered.length > 0 ? fmt(kpis.faturamento / filtered.length) : 'R$ 0,00'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Lucro por Orçamento</p>
                <p className="text-xl font-semibold text-accent">{filtered.length > 0 ? fmt(kpis.lucro / filtered.length) : 'R$ 0,00'}</p>
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
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum orçamento encontrado para o período selecionado.</p>
          ) : isMobile ? (
            <div className="space-y-3">
              {top5.map((o) => (
                <div key={o.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{o.nomeCliente}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.dataCriacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Badge variant={o.margem >= 40 ? 'default' : 'secondary'} className="text-[10px]">{fmtPct(o.margem)}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><p className="text-muted-foreground">Valor</p><p className="font-medium">{fmt(o.valorFinal)}</p></div>
                    <div><p className="text-muted-foreground">Custo</p><p className="font-medium">{fmt(o.custoTotalObra)}</p></div>
                    <div><p className="text-muted-foreground">Lucro</p><p className="font-semibold text-accent">{fmt(o.lucro)}</p></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                        <Badge variant={o.margem >= 40 ? 'default' : 'secondary'} className="text-[10px]">{fmtPct(o.margem)}</Badge>
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

// ═══════════════════════════════════════════════════
// Aba: Lançamentos
// ═══════════════════════════════════════════════════
function LancamentosTab() {
  const { empresaId } = useAuth();
  const { lancamentos, saveLancamento, isSaving, deleteLancamento, isDeleting } = useLancamentos();
  const isMobile = useIsMobile();
  const now = new Date();

  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LancamentoFinanceiro | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return filterByPeriod(
      lancamentos.filter((l) => tipoFilter === 'all' || l.tipo === tipoFilter),
      (l) => new Date(l.data),
      period,
      now,
    );
  }, [lancamentos, period, tipoFilter]);

  const kpis = useMemo(() => {
    const receitas = filtered.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
    const despesas = filtered.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0);
    const saldo = receitas - despesas;
    return { receitas, despesas, saldo };
  }, [filtered]);

  const handleEdit = (l: LancamentoFinanceiro) => { setEditing(l); setModalOpen(true); };
  const handleNew = () => { setEditing(null); setModalOpen(true); };
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteLancamento(deleteTarget);
    setDeleteTarget(null);
  };

  const kpiCards = [
    { title: 'Total Receitas', value: fmt(kpis.receitas), icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/15' },
    { title: 'Total Despesas', value: fmt(kpis.despesas), icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/15' },
    { title: 'Saldo', value: fmt(kpis.saldo), icon: Wallet, color: kpis.saldo >= 0 ? 'text-accent' : 'text-destructive', bg: kpis.saldo >= 0 ? 'bg-accent/15' : 'bg-destructive/15' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters + New button */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
        <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mês Atual</SelectItem>
            <SelectItem value="3months">Últimos 3 Meses</SelectItem>
            <SelectItem value="year">Ano Atual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tipoFilter} onValueChange={(v) => setTipoFilter(v as TipoFilter)}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="receita">Receitas</SelectItem>
            <SelectItem value="despesa">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <div className="sm:ml-auto">
          <Button size="sm" onClick={handleNew} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1" /> Novo Lançamento
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
              <p className={`text-lg lg:text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum lançamento encontrado para o período selecionado.</p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {filtered.map((l) => (
            <Card key={l.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{l.descricao}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={l.tipo === 'receita' ? 'default' : 'destructive'} className="text-[10px]">
                        {l.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{l.categoria}</span>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ml-2 whitespace-nowrap ${l.tipo === 'receita' ? 'text-accent' : 'text-destructive'}`}>
                    {l.tipo === 'receita' ? '+' : '−'} {fmt(l.valor)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(l.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(l)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(l.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Data</th>
                    <th className="pb-2 font-medium">Tipo</th>
                    <th className="pb-2 font-medium">Descrição</th>
                    <th className="pb-2 font-medium">Categoria</th>
                    <th className="pb-2 font-medium text-right">Valor</th>
                    <th className="pb-2 font-medium text-right w-20">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="py-2.5 text-muted-foreground whitespace-nowrap">
                        {new Date(l.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2.5">
                        <Badge variant={l.tipo === 'receita' ? 'default' : 'destructive'} className="text-[10px]">
                          {l.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </td>
                      <td className="py-2.5 font-medium max-w-[200px] truncate">{l.descricao}</td>
                      <td className="py-2.5 text-muted-foreground">{l.categoria}</td>
                      <td className={`py-2.5 text-right font-semibold whitespace-nowrap ${l.tipo === 'receita' ? 'text-accent' : 'text-destructive'}`}>
                        {l.tipo === 'receita' ? '+' : '−'} {fmt(l.valor)}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(l)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(l.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {empresaId && (
        <LancamentoFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          lancamento={editing}
          onSave={saveLancamento}
          isSaving={isSaving}
          empresaId={empresaId}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Componente principal com Tabs
// ═══════════════════════════════════════════════════
export function Financeiro() {
  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">Análise financeira e lançamentos</p>
      </div>

      <Tabs defaultValue="orcamentos" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="orcamentos" className="flex-1 sm:flex-none">Orçamentos</TabsTrigger>
          <TabsTrigger value="lancamentos" className="flex-1 sm:flex-none">Lançamentos</TabsTrigger>
        </TabsList>
        <TabsContent value="orcamentos">
          <OrcamentosTab />
        </TabsContent>
        <TabsContent value="lancamentos">
          <LancamentosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
