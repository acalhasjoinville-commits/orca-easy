import { useMemo, useState } from "react";
import { AlertTriangle, Banknote, CalendarDays, ChevronRight, Clock, Hammer, Phone, Receipt } from "lucide-react";

import { useFilaComercial } from "@/hooks/useFollowUp";
import { useAuth } from "@/hooks/useAuth";
import { Orcamento } from "@/lib/types";
import { addDaysLocal, formatDateLabel, getTodayLocal, toLocalDateStr } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type AreaType = "comercial" | "operacao" | "financeiro";
type FilterType = "todos" | AreaType;

interface AgendaEvento {
  id: string;
  date: string;
  area: AreaType;
  subtype: string;
  orcamentoId: string;
  numero: number;
  nomeCliente: string;
}

interface AgendaSection {
  key: string;
  label: string;
  isOverdue: boolean;
  isHistory?: boolean;
  showItemDate?: boolean;
  eventos: AgendaEvento[];
}

interface AgendaProps {
  orcamentos: Orcamento[];
  onViewOrcamento: (orc: Orcamento) => void;
}

const areaConfig: Record<AreaType, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  comercial: {
    label: "Comercial",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-950",
    icon: Phone,
  },
  operacao: {
    label: "Operação",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950",
    icon: Hammer,
  },
  financeiro: {
    label: "Financeiro",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-950",
    icon: Receipt,
  },
};

const filterOptions: { value: FilterType; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "comercial", label: "Comercial" },
  { value: "operacao", label: "Operação" },
  { value: "financeiro", label: "Financeiro" },
];

function compareAgendaEventos(a: AgendaEvento, b: AgendaEvento) {
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  if (a.area !== b.area) return a.area.localeCompare(b.area);
  return a.numero - b.numero;
}

export function Agenda({ orcamentos, onViewOrcamento }: AgendaProps) {
  const { canViewFinanceiro } = useAuth();
  const { data: filaComercial, isLoading: filaLoading } = useFilaComercial();
  const [filter, setFilter] = useState<FilterType>("todos");

  const hoje = getTodayLocal();
  const amanha = addDaysLocal(1);
  const limiteMax = addDaysLocal(7);
  const limitePassado = addDaysLocal(-7);

  const effectiveFilter = !canViewFinanceiro && filter === "financeiro" ? "todos" : filter;

  const orcamentosMap = useMemo(() => {
    const map = new Map<string, Orcamento>();
    for (const orcamento of orcamentos) {
      map.set(orcamento.id, orcamento);
    }
    return map;
  }, [orcamentos]);

  const eventos = useMemo(() => {
    const result: AgendaEvento[] = [];
    const fila = filaComercial ?? [];

    for (const item of fila) {
      if (item.statusFollowUp === "concluido") continue;
      if (item.statusOrcamento === "cancelado" || item.statusOrcamento === "rejeitado") continue;

      const retornoLocal = toLocalDateStr(item.dataRetorno);
      if (!retornoLocal || retornoLocal > limiteMax) continue;

      result.push({
        id: `com-${item.orcamentoId}`,
        date: retornoLocal,
        area: "comercial",
        subtype: retornoLocal < hoje ? "Retorno vencido" : "Retorno comercial",
        orcamentoId: item.orcamentoId,
        numero: item.numeroOrcamento,
        nomeCliente: item.nomeCliente,
      });
    }

    for (const orcamento of orcamentos) {
      if (orcamento.status === "aprovado") {
        const previstaLocal = toLocalDateStr(orcamento.dataPrevista);
        if (previstaLocal && previstaLocal <= limiteMax) {
          result.push({
            id: `op-${orcamento.id}`,
            date: previstaLocal,
            area: "operacao",
            subtype: previstaLocal < hoje ? "Execução atrasada" : "Execução prevista",
            orcamentoId: orcamento.id,
            numero: orcamento.numeroOrcamento,
            nomeCliente: orcamento.nomeCliente,
          });
        }
      }

      if (!canViewFinanceiro || orcamento.status === "cancelado") continue;

      const faturamentoLocal = toLocalDateStr(orcamento.dataFaturamento);
      if (faturamentoLocal && faturamentoLocal >= limitePassado && faturamentoLocal <= hoje) {
        result.push({
          id: `fin-fat-${orcamento.id}`,
          date: faturamentoLocal,
          area: "financeiro",
          subtype: "Faturamento registrado",
          orcamentoId: orcamento.id,
          numero: orcamento.numeroOrcamento,
          nomeCliente: orcamento.nomeCliente,
        });
      }

      const pagamentoLocal = toLocalDateStr(orcamento.dataPagamento);
      if (pagamentoLocal && pagamentoLocal >= limitePassado && pagamentoLocal <= hoje) {
        result.push({
          id: `fin-pag-${orcamento.id}`,
          date: pagamentoLocal,
          area: "financeiro",
          subtype: "Pagamento registrado",
          orcamentoId: orcamento.id,
          numero: orcamento.numeroOrcamento,
          nomeCliente: orcamento.nomeCliente,
        });
      }
    }

    return result;
  }, [canViewFinanceiro, filaComercial, hoje, limiteMax, limitePassado, orcamentos]);

  const visibleFilters = canViewFinanceiro
    ? filterOptions
    : filterOptions.filter((option) => option.value !== "financeiro");

  const filtered = effectiveFilter === "todos" ? eventos : eventos.filter((evento) => evento.area === effectiveFilter);

  const sections = useMemo(() => {
    const groups = new Map<string, AgendaEvento[]>();
    const result: AgendaSection[] = [];
    const overdue: AgendaEvento[] = [];
    const financeToday: AgendaEvento[] = [];
    const financeHistory: AgendaEvento[] = [];

    for (const evento of filtered) {
      if (evento.area === "financeiro") {
        if (evento.date === hoje) {
          financeToday.push(evento);
        } else {
          financeHistory.push(evento);
        }
        continue;
      }

      if (evento.date < hoje) {
        overdue.push(evento);
        continue;
      }

      const list = groups.get(evento.date) || [];
      list.push(evento);
      groups.set(evento.date, list);
    }

    if (overdue.length > 0) {
      result.push({
        key: "atrasados",
        label: "Atrasados",
        isOverdue: true,
        eventos: overdue.sort(compareAgendaEventos),
      });
    }

    for (const date of Array.from(groups.keys()).sort()) {
      result.push({
        key: date,
        label: formatDateLabel(date, hoje, amanha),
        isOverdue: false,
        eventos: (groups.get(date) || []).sort(compareAgendaEventos),
      });
    }

    if (financeToday.length > 0) {
      result.push({
        key: "financeiro-hoje",
        label: effectiveFilter === "financeiro" ? "Hoje" : "Registros financeiros de hoje",
        isOverdue: false,
        isHistory: true,
        eventos: financeToday.sort(compareAgendaEventos),
      });
    }

    if (financeHistory.length > 0) {
      result.push({
        key: "financeiro-historico",
        label: "Últimos registros financeiros",
        isOverdue: false,
        isHistory: true,
        showItemDate: true,
        eventos: financeHistory.sort((a, b) => {
          if (a.date === b.date) return a.numero - b.numero;
          return b.date.localeCompare(a.date);
        }),
      });
    }

    return result;
  }, [amanha, effectiveFilter, filtered, hoje]);

  const handleClick = (orcamentoId: string) => {
    const orcamento = orcamentosMap.get(orcamentoId);
    if (orcamento) onViewOrcamento(orcamento);
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-4 pb-24 pt-5 lg:px-6 lg:pb-8">
      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Agenda da operação</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Veja retornos comerciais, execuções previstas e registros recentes em uma linha do tempo simples para a
                semana.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {visibleFilters.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              effectiveFilter === option.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filaLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin" />
          Carregando agenda...
        </div>
      )}

      {!filaLoading && sections.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum evento nos próximos dias</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Quando houver retornos comerciais, execuções previstas ou registros financeiros, eles aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      )}

      {sections.map((section) => (
        <div key={section.key} className="space-y-2">
          <div className="flex items-center gap-2">
            {section.isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
            <h3
              className={cn(
                "text-sm font-semibold",
                section.isOverdue
                  ? "text-destructive"
                  : section.isHistory
                    ? "text-muted-foreground"
                    : "text-foreground",
              )}
            >
              {section.label}
            </h3>
            <Badge
              variant="secondary"
              className={cn(
                "px-1.5 py-0 text-[10px]",
                section.isOverdue && "border-destructive/20 bg-destructive/10 text-destructive",
                section.isHistory && "bg-muted text-muted-foreground",
              )}
            >
              {section.eventos.length}
            </Badge>
          </div>

          <div className="space-y-1.5">
            {section.eventos.map((evento) => {
              const config = areaConfig[evento.area];
              const Icon = config.icon;

              return (
                <button
                  key={evento.id}
                  onClick={() => handleClick(evento.orcamentoId)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border bg-card px-3 py-3 text-left transition-colors hover:bg-muted/50",
                    section.isOverdue && evento.area !== "financeiro" && "border-destructive/20",
                  )}
                >
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", config.bgColor)}>
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        #{evento.numero} - {evento.nomeCliente}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("border-0 px-1.5 py-0 text-[10px]", config.bgColor, config.color)}
                      >
                        {config.label}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{evento.subtype}</span>
                      {section.showItemDate && (
                        <>
                          <span className="text-[11px] text-muted-foreground/50">•</span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDateLabel(evento.date, hoje, amanha)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {evento.area === "financeiro" ? (
                    <Banknote className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
