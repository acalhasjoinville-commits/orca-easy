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
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, Percent, Plus, Pencil, Trash2, Wallet, MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtPct = (v: number) => `${v.toFixed(1)}%`;

type PeriodFilter = 'month' | '3months' | 'year';
type StatusFilter = 'todos' | 'aprovado' | 'executado';
const VALID_STATUSES = ['aprovado', 'executado'];
type TipoFilter = 'all' | 'receita' | 'despesa';

function filterByPeriod<T>(items: T[], getDate: (item: T) => Date, period: PeriodFilter, now: Date): T[] {
  return items.filter((item) => {
    const d = getDate(item);
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === '3months') return d >= new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return d.getFullYear() === now.getFullYear();
  });
}

// ─── KPI Card Component ───
function KpiCard({ title, value, icon: Icon, color = 'text-foreground', iconBg = 'bg-muted', highlight = false }: {
  title: string; value: string; icon: React.ElementType; color?: string; iconBg?: string; highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.06]' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </div>
        <p className={`text-xl lg:text-2xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════
// Aba: Orçamentos
// ═══════════════════════════════════════════════════
function OrcamentosTab() {
  const { orcamentos } = useOrcamentos();
  const [period, setPeriod] = useState<PeriodFilter>('year');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const isMobile = useIsMobile();
  const now = new Date();

  const filtered = useMemo(() => {
    return orcamentos.filter((orc) => {
      if (!VALID_STATUSES.includes(orc.status)) return false;
      if (statusFilter !== 'todos' && orc.status !== statusFilter) return false;
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
      if (!VALID_STATUSES.includes(orc.status)) return;
      if (statusFilter !== 'todos' && orc.status !== statusFilter) return;
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

  return (
    <div className="space-y-6 mt-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0">Período</span>
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-full sm:w-[180px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês Atual</SelectItem>
                <SelectItem value="3months">Últimos 3 Meses</SelectItem>
                <SelectItem value="year">Ano Atual</SelectItem>
              </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0">Status</span>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-full sm:w-[200px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Executados + Aprovados</SelectItem>
                <SelectItem value="executado">Executados</SelectItem>
                <SelectItem value="aprovado">Aprovados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard title="Faturamento" value={fmt(kpis.faturamento)} icon={DollarSign} iconBg="bg-primary/10" color="text-primary" />
        <KpiCard title="Custo Total" value={fmt(kpis.custo)} icon={BarChart3} iconBg="bg-muted" color="text-muted-foreground" />
        <KpiCard title="Lucro Bruto" value={fmt(kpis.lucro)} icon={TrendingUp} iconBg="bg-emerald-500/10" color="text-emerald-600 dark:text-emerald-400" highlight />
        <KpiCard title="Margem Média" value={fmtPct(kpis.margem)} icon={Percent} iconBg="bg-amber-500/10" color="text-amber-600 dark:text-amber-400" />
      </div>

      {/* Chart + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Receita vs Custo</h2>
              <span className="text-[10px] text-muted-foreground">Últimos 6 meses</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => fmt(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="custo" name="Custo" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 lg:p-5">
            <h2 className="text-sm font-semibold text-foreground mb-5">Resumo do Período</h2>
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Orçamentos</p>
                <p className="text-3xl font-bold text-foreground">{filtered.length}</p>
              </div>
              <Separator />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Ticket Médio</p>
                <p className="text-xl font-semibold text-foreground">{filtered.length > 0 ? fmt(kpis.faturamento / filtered.length) : 'R$ 0,00'}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Lucro por Orçamento</p>
                <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">{filtered.length > 0 ? fmt(kpis.lucro / filtered.length) : 'R$ 0,00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 */}
      <Card>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Top 5 — Mais Lucrativos</h2>
            <span className="text-[10px] text-muted-foreground">{filtered.length} orçamentos no período</span>
          </div>
          {top5.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <BarChart3 className="h-10 w-10 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum orçamento no período selecionado.</p>
            </div>
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
                    <div><p className="text-muted-foreground">Lucro</p><p className="font-semibold text-emerald-600 dark:text-emerald-400">{fmt(o.lucro)}</p></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[11px] text-muted-foreground bg-muted/30">
                    <th className="py-2.5 px-3 font-medium">Cliente</th>
                    <th className="py-2.5 px-3 font-medium">Data</th>
                    <th className="py-2.5 px-3 font-medium text-right">Valor Total</th>
                    <th className="py-2.5 px-3 font-medium text-right">Custo Total</th>
                    <th className="py-2.5 px-3 font-medium text-right">Lucro Bruto</th>
                    <th className="py-2.5 px-3 font-medium text-right">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {top5.map((o) => (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium">{o.nomeCliente}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{new Date(o.dataCriacao).toLocaleDateString('pt-BR')}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmt(o.valorFinal)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmt(o.custoTotalObra)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt(o.lucro)}</td>
                      <td className="py-2.5 px-3 text-right">
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

  return (
    <div className="space-y-6 mt-4">
      {/* Filters + New button */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0">Período</span>
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-full sm:w-[180px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês Atual</SelectItem>
                <SelectItem value="3months">Últimos 3 Meses</SelectItem>
                <SelectItem value="year">Ano Atual</SelectItem>
              </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0">Tipo</span>
            <Select value={tipoFilter} onValueChange={(v) => setTipoFilter(v as TipoFilter)}>
              <SelectTrigger className="w-full sm:w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
            <div className="sm:ml-auto">
              <Button size="sm" onClick={handleNew} className="w-full sm:w-auto h-9">
                <Plus className="h-4 w-4 mr-1.5" /> Novo Lançamento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard title="Total Receitas" value={fmt(kpis.receitas)} icon={TrendingUp} iconBg="bg-emerald-500/10" color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard title="Total Despesas" value={fmt(kpis.despesas)} icon={TrendingDown} iconBg="bg-red-500/10" color="text-red-600 dark:text-red-400" />
        <KpiCard title="Saldo do Período" value={fmt(kpis.saldo)} icon={Wallet}
          iconBg={kpis.saldo >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}
          color={kpis.saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
          highlight
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum lançamento encontrado para o período selecionado.</p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-2">
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
                  <p className={`text-sm font-bold ml-2 whitespace-nowrap ${l.tipo === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
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
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] text-muted-foreground bg-muted/30">
                  <th className="py-2.5 px-3 font-medium w-24">Data</th>
                  <th className="py-2.5 px-3 font-medium w-20">Tipo</th>
                  <th className="py-2.5 px-3 font-medium">Descrição</th>
                  <th className="py-2.5 px-3 font-medium w-28">Categoria</th>
                  <th className="py-2.5 px-3 font-medium text-right w-28">Valor</th>
                  <th className="py-2.5 px-3 font-medium text-right w-16">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap tabular-nums">
                      {new Date(l.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={l.tipo === 'receita' ? 'default' : 'destructive'} className="text-[10px]">
                        {l.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-medium max-w-[200px] truncate">{l.descricao}</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{l.categoria}</td>
                    <td className={`py-2.5 px-3 text-right font-semibold whitespace-nowrap tabular-nums ${l.tipo === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {l.tipo === 'receita' ? '+' : '−'} {fmt(l.valor)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[120px]">
                          <DropdownMenuItem onClick={() => handleEdit(l)} className="text-xs gap-2">
                            <Pencil className="h-3.5 w-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(l.id)} className="text-xs gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Análise financeira e gestão de lançamentos</p>
      </div>

      <Tabs defaultValue="orcamentos" className="w-full">
        <TabsList className="w-full sm:w-auto h-10">
          <TabsTrigger value="orcamentos" className="flex-1 sm:flex-none text-xs sm:text-sm px-4">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
            Orçamentos
          </TabsTrigger>
          <TabsTrigger value="lancamentos" className="flex-1 sm:flex-none text-xs sm:text-sm px-4">
            <Wallet className="h-3.5 w-3.5 mr-1.5" />
            Lançamentos
          </TabsTrigger>
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
