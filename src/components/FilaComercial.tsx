import { useState, useMemo } from 'react';
import { useFilaComercial, FilaComercialItem } from '@/hooks/useFollowUp';
import { StatusFollowUp, STATUS_FOLLOWUP_CONFIG, Orcamento } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Loader2,
  Clock,
  AlertTriangle,
  CalendarDays,
  Users,
  MessageCircle,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilaComercialProps {
  onViewOrcamento: (orc: Orcamento) => void;
  orcamentos: Orcamento[];
}

const allStatuses = Object.keys(STATUS_FOLLOWUP_CONFIG) as StatusFollowUp[];

const fmtDate = (d: string | null | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function FilaComercial({ onViewOrcamento, orcamentos }: FilaComercialProps) {
  const { data: items, isLoading } = useFilaComercial();
  const isMobile = useIsMobile();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterResponsavel, setFilterResponsavel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'data_retorno' | 'data_criacao'>('data_retorno');

  const today = new Date(new Date().toDateString());

  const kpis = useMemo(() => {
    if (!items) return { semRetorno: 0, hoje: 0, atrasados: 0, emNegociacao: 0, aguardando: 0 };
    let semRetorno = 0, hoje = 0, atrasados = 0, emNegociacao = 0, aguardando = 0;
    for (const it of items) {
      if (it.statusFollowUp === 'sem_retorno') semRetorno++;
      if (it.statusFollowUp === 'em_negociacao') emNegociacao++;
      if (it.statusFollowUp === 'aguardando_cliente') aguardando++;
      if (it.dataRetorno) {
        const dr = new Date(it.dataRetorno);
        if (dr.toDateString() === today.toDateString()) hoje++;
        else if (dr < today && it.statusFollowUp !== 'concluido') atrasados++;
      }
    }
    return { semRetorno, hoje, atrasados, emNegociacao, aguardando };
  }, [items]);

  const responsaveis = useMemo(() => {
    if (!items) return [];
    const set = new Set<string>();
    for (const it of items) {
      if (it.responsavelNome) set.add(it.responsavelNome);
    }
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    let result = [...items];

    // Exclude concluido by default unless explicitly filtered
    if (filterStatus === 'all') {
      result = result.filter((it) => it.statusFollowUp !== 'concluido');
    } else {
      result = result.filter((it) => it.statusFollowUp === filterStatus);
    }

    if (filterResponsavel !== 'all') {
      result = result.filter((it) => it.responsavelNome === filterResponsavel);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((it) =>
        it.nomeCliente.toLowerCase().includes(q) ||
        String(it.numeroOrcamento).includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'data_retorno') {
        const da = a.dataRetorno ? new Date(a.dataRetorno).getTime() : Infinity;
        const db = b.dataRetorno ? new Date(b.dataRetorno).getTime() : Infinity;
        return da - db;
      }
      return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
    });

    return result;
  }, [items, filterStatus, filterResponsavel, search, sortBy]);

  const handleView = (item: FilaComercialItem) => {
    const orc = orcamentos.find((o) => o.id === item.orcamentoId);
    if (orc) onViewOrcamento(orc);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: 'Sem retorno', value: kpis.semRetorno, icon: MessageCircle, color: 'text-gray-600' },
          { label: 'Retorno hoje', value: kpis.hoje, icon: CalendarDays, color: 'text-blue-600' },
          { label: 'Atrasados', value: kpis.atrasados, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Em negociação', value: kpis.emNegociacao, icon: Users, color: 'text-amber-600' },
          { label: 'Aguardando', value: kpis.aguardando, icon: Clock, color: 'text-purple-600' },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-dashed">
            <CardContent className="p-3 flex items-center gap-2.5">
              <kpi.icon className={cn('h-4 w-4 shrink-0', kpi.color)} />
              <div>
                <p className="text-lg font-bold text-foreground leading-none">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou número..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-background text-xs"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-full sm:w-[180px] text-xs">
                <SelectValue placeholder="Status follow-up" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Todos (exceto concluído)</SelectItem>
                {allStatuses.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {STATUS_FOLLOWUP_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {responsaveis.length > 0 && (
              <Select value={filterResponsavel} onValueChange={setFilterResponsavel}>
                <SelectTrigger className="h-9 w-full sm:w-[160px] text-xs">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Todos</SelectItem>
                  {responsaveis.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="h-9 w-full sm:w-[160px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data_retorno" className="text-xs">Ordenar: Retorno</SelectItem>
                <SelectItem value="data_criacao" className="text-xs">Ordenar: Criação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum orçamento na fila</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Ajuste os filtros para ver mais resultados.</p>
          </CardContent>
        </Card>
      ) : !isMobile ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground uppercase tracking-wide">
                  <th className="py-2.5 px-3 font-semibold w-16">#</th>
                  <th className="py-2.5 px-3 font-semibold">Cliente</th>
                  <th className="py-2.5 px-3 font-semibold w-32">Follow-up</th>
                  <th className="py-2.5 px-3 font-semibold text-right w-28">Valor</th>
                  <th className="py-2.5 px-3 font-semibold w-24">Retorno</th>
                  <th className="py-2.5 px-3 font-semibold w-28">Responsável</th>
                  <th className="py-2.5 px-3 font-semibold w-28">Última interação</th>
                  <th className="py-2.5 px-3 font-semibold w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => {
                  const stConfig = STATUS_FOLLOWUP_CONFIG[it.statusFollowUp];
                  const isOverdue = it.dataRetorno && new Date(it.dataRetorno) < today && it.statusFollowUp !== 'concluido';
                  const isRetornoToday = it.dataRetorno && new Date(it.dataRetorno).toDateString() === today.toDateString();
                  return (
                    <tr
                      key={it.orcamentoId}
                      className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => handleView(it)}
                    >
                      <td className="py-3 px-3 font-bold text-primary text-sm">#{it.numeroOrcamento}</td>
                      <td className="py-3 px-3 font-medium text-foreground truncate max-w-[180px]">{it.nomeCliente}</td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className={cn('text-[10px]', stConfig.color)}>{stConfig.label}</Badge>
                      </td>
                      <td className="py-3 px-3 text-right font-bold tabular-nums">{formatCurrency(it.valorFinal)}</td>
                      <td className="py-3 px-3 text-xs tabular-nums">
                        <span className={cn(
                          isOverdue && 'text-destructive font-semibold',
                          isRetornoToday && 'text-amber-600 font-semibold',
                          !isOverdue && !isRetornoToday && 'text-muted-foreground',
                        )}>
                          {fmtDate(it.dataRetorno)}
                          {isOverdue && ' ⚠'}
                          {isRetornoToday && ' 📌'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">{it.responsavelNome || '—'}</td>
                      <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums">{fmtDate(it.ultimaInteracaoEm)}</td>
                      <td className="py-3 px-3">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleView(it); }}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((it) => {
            const stConfig = STATUS_FOLLOWUP_CONFIG[it.statusFollowUp];
            const isOverdue = it.dataRetorno && new Date(it.dataRetorno) < today && it.statusFollowUp !== 'concluido';
            return (
              <Card
                key={it.orcamentoId}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => handleView(it)}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-primary">#{it.numeroOrcamento}</span>
                    <Badge variant="outline" className={cn('text-[10px]', stConfig.color)}>{stConfig.label}</Badge>
                    <span className="flex-1" />
                    <span className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(it.valorFinal)}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate mb-1.5">{it.nomeCliente}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1.5 border-t border-border/50">
                    {it.dataRetorno && (
                      <span className={cn(isOverdue && 'text-destructive font-medium')}>
                        Retorno: {fmtDate(it.dataRetorno)} {isOverdue && '⚠'}
                      </span>
                    )}
                    {it.responsavelNome && <span>{it.responsavelNome}</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
