import { useOrcamentos } from '@/hooks/useSupabaseData';
import { Orcamento, StatusOrcamento } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Search, Loader2, MoreVertical, Check, Eye, Pencil, Hammer, CalendarClock, Receipt, Banknote } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OrcamentosProps {
  onNewOrcamento: () => void;
  onViewOrcamento: (orc: Orcamento) => void;
  onEditOrcamento?: (orc: Orcamento) => void;
}

const statusConfig: Record<StatusOrcamento, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30' },
  aprovado: { label: 'Aprovado', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-500/15 text-red-600 border-red-500/30' },
  executado: { label: 'Executado', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-500/15 text-gray-600 border-gray-500/30' },
};

const allStatuses: StatusOrcamento[] = ['pendente', 'aprovado', 'rejeitado', 'executado', 'cancelado'];

const filterChips: { key: StatusOrcamento; label: string }[] = [
  { key: 'pendente', label: 'Pendentes' },
  { key: 'aprovado', label: 'Aprovados' },
  { key: 'executado', label: 'Executados' },
  { key: 'rejeitado', label: 'Rejeitados' },
  { key: 'cancelado', label: 'Cancelados' },
];

const statusPriority: Record<string, number> = {
  pendente: 0,
  aprovado: 1,
  executado: 2,
  rejeitado: 3,
  cancelado: 4,
};

const defaultActiveFilters = new Set<StatusOrcamento>(['pendente', 'aprovado']);

const fmtDate = (d: string | null | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export function Orcamentos({ onNewOrcamento, onViewOrcamento, onEditOrcamento }: OrcamentosProps) {
  const { orcamentos, isLoading, updateOrcamento } = useOrcamentos();
  const { canCreateEditBudget } = useAuth();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<StatusOrcamento>>(new Set(defaultActiveFilters));
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingReject, setPendingReject] = useState<Orcamento | null>(null);

  const allSelected = filterChips.every(f => activeFilters.has(f.key));

  const toggleFilter = (status: StatusOrcamento) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setActiveFilters(new Set());
    else setActiveFilters(new Set(filterChips.map(f => f.key)));
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleStatusChange = async (orc: Orcamento, newStatus: StatusOrcamento) => {
    if (newStatus === orc.status) return;
    if (newStatus === 'rejeitado') {
      setPendingReject(orc);
      return;
    }
    await applyStatusChange(orc, newStatus);
  };

  const applyStatusChange = async (orc: Orcamento, newStatus: StatusOrcamento) => {
    if (updatingId) return;
    setUpdatingId(orc.id);
    try {
      await updateOrcamento.mutateAsync({ ...orc, status: newStatus });
      toast.success(`Status alterado para ${statusConfig[newStatus].label}.`, { duration: 2500 });
    } catch {
      toast.error('Erro ao alterar status.', { duration: 5000 });
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmReject = async () => {
    if (!pendingReject) return;
    await applyStatusChange(pendingReject, 'rejeitado');
    setPendingReject(null);
  };

  const filtered = useMemo(() => {
    const showAll = activeFilters.size === 0;
    const result = orcamentos.filter(o => {
      if (!showAll && !activeFilters.has(o.status as StatusOrcamento)) return false;
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        o.nomeCliente.toLowerCase().includes(q) ||
        String(o.numeroOrcamento ?? '').includes(q) ||
        formatCurrency(o.valorFinal).toLowerCase().includes(q)
      );
    });
    result.sort((a, b) => {
      const pa = statusPriority[a.status] ?? 99;
      const pb = statusPriority[b.status] ?? 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
    });
    return result;
  }, [orcamentos, activeFilters, search]);

  const groupedByStatus = useMemo(() => {
    const statusOrder: string[] = ['pendente', 'aprovado', 'executado', 'rejeitado', 'cancelado'];
    const groups: { status: string; label: string; items: typeof filtered }[] = [];
    for (const s of statusOrder) {
      const items = filtered.filter(o => o.status === s);
      if (items.length > 0) {
        const label = statusConfig[s as StatusOrcamento]?.label ?? s;
        groups.push({ status: s, label: `${label}s`, items });
      }
    }
    const known = new Set(statusOrder);
    const rest = filtered.filter(o => !known.has(o.status));
    if (rest.length > 0) groups.push({ status: 'outros', label: 'Outros', items: rest });
    return groups;
  }, [filtered]);

  const motorLabel = (mt?: string) => {
    if (mt === 'motor1') return 'M1';
    if (mt === 'motor2') return 'M2';
    return null;
  };

  // Get the most relevant date for a given orcamento based on its lifecycle
  const getRelevantDate = (o: Orcamento): { label: string; value: string } | null => {
    if (o.dataPagamento) return { label: 'Pago', value: fmtDate(o.dataPagamento) };
    if (o.dataFaturamento) return { label: 'Faturado', value: fmtDate(o.dataFaturamento) };
    if (o.dataExecucao) return { label: 'Executado', value: fmtDate(o.dataExecucao) };
    if (o.dataPrevista) return { label: 'Previsto', value: fmtDate(o.dataPrevista) };
    return null;
  };

  const renderStatusBadge = (o: Orcamento) => {
    const st = statusConfig[o.status ?? 'pendente'];
    const isUpdating = updatingId === o.id;

    if (canCreateEditBudget) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <button
              disabled={isUpdating}
              className={cn(
                'rounded-md px-2 py-0.5 text-[10px] font-semibold border cursor-pointer transition-all',
                st.color,
                isUpdating && 'opacity-50'
              )}
            >
              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin inline" /> : st.label}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px]" onClick={e => e.stopPropagation()}>
            {allStatuses.map(s => (
              <DropdownMenuItem key={s} onClick={() => handleStatusChange(o, s)} className="text-xs gap-2">
                {s === o.status && <Check className="h-3 w-3" />}
                {s !== o.status && <span className="w-3" />}
                <span className={cn('rounded-full w-2 h-2 shrink-0', statusConfig[s].color.split(' ')[0])} />
                {statusConfig[s].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-semibold border', st.color)}>
        {st.label}
      </span>
    );
  };

  const renderRowActions = (o: Orcamento) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
        <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]" onClick={e => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onViewOrcamento(o)} className="text-xs gap-2">
          <Eye className="h-3.5 w-3.5" /> Ver detalhes
        </DropdownMenuItem>
        {canCreateEditBudget && onEditOrcamento && (
          <DropdownMenuItem onClick={() => onEditOrcamento(o)} className="text-xs gap-2">
            <Pencil className="h-3.5 w-3.5" /> Editar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {orcamentos.length > 0
              ? `${orcamentos.length} orçamento${orcamentos.length > 1 ? 's' : ''} cadastrado${orcamentos.length > 1 ? 's' : ''}`
              : 'Crie e acompanhe seus orçamentos de calhas e rufos'}
          </p>
        </div>
        {canCreateEditBudget && orcamentos.length > 0 && (
          <Button onClick={onNewOrcamento} size="sm" className="hidden sm:flex bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1.5 h-4 w-4" /> Novo Orçamento
          </Button>
        )}
      </div>

      {orcamentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <FileText className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Nenhum orçamento ainda</h2>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            {canCreateEditBudget ? 'Crie seu primeiro orçamento e veja os cálculos automatizados em segundos.' : 'Nenhum orçamento cadastrado no sistema.'}
          </p>
          {canCreateEditBudget && (
            <Button onClick={onNewOrcamento} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou número..." value={search}
                onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            {canCreateEditBudget && (
              <Button onClick={onNewOrcamento} size="sm" className="sm:hidden bg-accent text-accent-foreground hover:bg-accent/90 shrink-0 h-9">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            <button
              onClick={toggleAll}
              className={cn(
                'shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium border transition-colors',
                allSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
              )}
            >
              Todos
            </button>
            {filterChips.map(f => {
              const isActive = activeFilters.has(f.key);
              const chipColor = statusConfig[f.key].color;
              return (
                <button
                  key={f.key}
                  onClick={() => toggleFilter(f.key)}
                  className={cn(
                    'shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium border transition-colors',
                    isActive ? chipColor : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Desktop: Table view with all operational dates */}
          {!isMobile ? (
            <div className="space-y-4">
              {groupedByStatus.map(group => (
                <div key={group.status}>
                  <div className="flex items-center gap-2.5 pt-2 pb-2">
                    <span className={cn(
                      'text-[11px] font-bold uppercase tracking-wider',
                      statusConfig[group.status as StatusOrcamento]?.color.split(' ')[1] ?? 'text-muted-foreground'
                    )}>
                      {group.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium bg-muted rounded-md px-1.5 py-0.5">
                      {group.items.length}
                    </span>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/30 text-left text-[11px] text-muted-foreground">
                            <th className="py-2.5 px-3 font-medium w-16">#</th>
                            <th className="py-2.5 px-3 font-medium">Cliente</th>
                            <th className="py-2.5 px-3 font-medium w-24">Status</th>
                            <th className="py-2.5 px-3 font-medium text-right w-28">Valor</th>
                            <th className="py-2.5 px-3 font-medium w-20 text-center">Criação</th>
                            <th className="py-2.5 px-3 font-medium w-20 text-center">Previsto</th>
                            <th className="py-2.5 px-3 font-medium w-20 text-center">Execução</th>
                            <th className="py-2.5 px-3 font-medium w-20 text-center">Faturado</th>
                            <th className="py-2.5 px-3 font-medium w-20 text-center">Pago</th>
                            <th className="py-2.5 px-3 font-medium w-12 text-center">Motor</th>
                            <th className="py-2.5 px-3 font-medium w-10 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map(o => {
                            const displayValue = (o.desconto ?? 0) > 0 ? (o.valorFinal ?? o.valorVenda) : o.valorVenda;
                            const motor = motorLabel(o.motorType);
                            return (
                              <tr
                                key={o.id}
                                className="border-b last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                                onClick={() => onViewOrcamento(o)}
                              >
                                <td className="py-2.5 px-3 font-bold text-primary">#{o.numeroOrcamento ?? '—'}</td>
                                <td className="py-2.5 px-3 font-medium truncate max-w-[180px]">{o.nomeCliente}</td>
                                <td className="py-2.5 px-3">{renderStatusBadge(o)}</td>
                                <td className="py-2.5 px-3 text-right font-semibold tabular-nums">{formatCurrency(displayValue)}</td>
                                <td className="py-2.5 px-3 text-center text-xs text-muted-foreground tabular-nums">{fmtDate(o.dataCriacao)}</td>
                                <td className="py-2.5 px-3 text-center text-xs text-muted-foreground tabular-nums">{fmtDate(o.dataPrevista)}</td>
                                <td className="py-2.5 px-3 text-center text-xs text-muted-foreground tabular-nums">{fmtDate(o.dataExecucao)}</td>
                                <td className="py-2.5 px-3 text-center text-xs text-muted-foreground tabular-nums">{fmtDate(o.dataFaturamento)}</td>
                                <td className="py-2.5 px-3 text-center text-xs text-muted-foreground tabular-nums">{fmtDate(o.dataPagamento)}</td>
                                <td className="py-2.5 px-3 text-center">
                                  {motor && (
                                    <span className="text-[10px] font-bold rounded px-1.5 py-0.5 bg-muted text-muted-foreground">
                                      {motor}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right">{renderRowActions(o)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            /* Mobile: Cards view */
            <div>
              {groupedByStatus.map(group => (
                <div key={group.status}>
                  <div className="flex items-center gap-2.5 pt-3 pb-2">
                    <span className={cn(
                      'text-[11px] font-bold uppercase tracking-wider',
                      statusConfig[group.status as StatusOrcamento]?.color.split(' ')[1] ?? 'text-muted-foreground'
                    )}>
                      {group.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium bg-muted rounded-md px-1.5 py-0.5">
                      {group.items.length}
                    </span>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>
                  <div className="space-y-2">
                    {group.items.map(o => {
                      const displayValue = (o.desconto ?? 0) > 0 ? (o.valorFinal ?? o.valorVenda) : o.valorVenda;
                      const relevantDate = getRelevantDate(o);
                      return (
                        <Card key={o.id} className="overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/20 transition-all" onClick={() => onViewOrcamento(o)}>
                          <CardContent className="p-3">
                            {/* Row 1: number + status + menu + value */}
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm font-bold text-primary shrink-0">#{o.numeroOrcamento ?? '—'}</span>
                              {renderStatusBadge(o)}
                              <span className="flex-1" />
                              {renderRowActions(o)}
                              <p className="text-base font-bold text-foreground shrink-0">{formatCurrency(displayValue)}</p>
                            </div>
                            {/* Row 2: client */}
                            <p className="text-sm font-medium text-foreground truncate mb-1">{o.nomeCliente}</p>
                            {/* Row 3: dates */}
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                              <span>{new Date(o.dataCriacao).toLocaleDateString('pt-BR')}</span>
                              {relevantDate && (
                                <>
                                  <span className="text-border">·</span>
                                  <span className="font-medium">{relevantDate.label}: {relevantDate.value}</span>
                                </>
                              )}
                              <span className="ml-auto text-[10px]">{o.itensServico.length} {o.itensServico.length === 1 ? 'serviço' : 'serviços'}</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhum orçamento encontrado.</p>
          )}
        </div>
      )}

      {/* Rejection confirmation dialog */}
      <AlertDialog open={!!pendingReject} onOpenChange={open => { if (!open) setPendingReject(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como Rejeitado?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja marcar o orçamento <strong>#{pendingReject?.numeroOrcamento}</strong> como rejeitado?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
