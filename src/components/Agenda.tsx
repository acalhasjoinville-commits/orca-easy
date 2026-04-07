import { useMemo, useState } from "react";
import {
  CalendarDays,
  Phone,
  Hammer,
  Receipt,
  Banknote,
  AlertTriangle,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useFilaComercial } from "@/hooks/useFollowUp";
import { useAuth } from "@/hooks/useAuth";
import { Orcamento } from "@/lib/types";
import { toLocalDateStr, getTodayLocal, addDaysLocal, formatDateLabel } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// ─── Types ───

type AreaType = "comercial" | "operacao" | "financeiro";
type FilterType = "todos" | AreaType;

interface AgendaEvento {
  id: string;
  date: string; // YYYY-MM-DD local
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
  eventos: AgendaEvento[];
}

interface AgendaProps {
  orcamentos: Orcamento[];
  onViewOrcamento: (orc: Orcamento) => void;
}

// ─── Area config ───

const areaConfig: Record<AreaType, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  comercial: { label: "Comercial", color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-950", icon: Phone },
  operacao: { label: "Operação", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-950", icon: Hammer },
  financeiro: { label: "Financeiro", color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-950", icon: Receipt },
};

// ─── Filter pills ───

const filterOptions: { value: FilterType; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "comercial", label: "Comercial" },
  { value: "operacao", label: "Operação" },
  { value: "financeiro", label: "Financeiro" },
];

// ─── Component ───

export function Agenda({ orcamentos, onViewOrcamento }: AgendaProps) {
  const { canViewFinanceiro } = useAuth();
  const { data: filaComercial, isLoading: filaLoading } = useFilaComercial();
  const [filter, setFilter] = useState<FilterType>("todos");

  const hoje = getTodayLocal();
  const amanha = addDaysLocal(1);
  const limiteMax = addDaysLocal(7);
  const limitePassado = addDaysLocal(-7);

  const orcamentosMap = useMemo(() => {
    const map = new Map<string, Orcamento>();
    for (const o of orcamentos) map.set(o.id, o);
    return map;
  }, [orcamentos]);

  const eventos = useMemo(() => {
    const result: AgendaEvento[] = [];
    const fila = filaComercial ?? [];

    // ─── Comercial: follow-ups with data_retorno ───
    for (const item of fila) {
      if (item.statusFollowUp === "concluido") continue;
      if (item.statusOrcamento === "cancelado" || item.statusOrcamento === "rejeitado") continue;

      const retornoLocal = toLocalDateStr(item.dataRetorno);
      if (!retornoLocal) continue;

      // Show overdue (no limit) + future up to 7 days
      if (retornoLocal <= limiteMax) {
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
    }

    // ─── Operação: approved budgets with dataPrevista ───
    for (const orc of orcamentos) {
      if (orc.status !== "aprovado") continue;

      const previstaLocal = toLocalDateStr(orc.dataPrevista);
      if (!previstaLocal) continue;

      if (previstaLocal <= limiteMax) {
        result.push({
          id: `op-${orc.id}`,
          date: previstaLocal,
          area: "operacao",
          subtype: previstaLocal < hoje ? "Execução atrasada" : "Execução prevista",
          orcamentoId: orc.id,
          numero: orc.numeroOrcamento,
          nomeCliente: orc.nomeCliente,
        });
      }
    }

    // ─── Financeiro registrado (historical, last 7 days only) ───
    if (canViewFinanceiro) {
      for (const orc of orcamentos) {
        if (orc.status === "cancelado") continue;

        const fatLocal = toLocalDateStr(orc.dataFaturamento);
        if (fatLocal && fatLocal >= limitePassado && fatLocal <= hoje) {
          result.push({
            id: `fin-fat-${orc.id}`,
            date: fatLocal,
            area: "financeiro",
            subtype: "Faturamento registrado",
            orcamentoId: orc.id,
            numero: orc.numeroOrcamento,
            nomeCliente: orc.nomeCliente,
          });
        }

        const pagLocal = toLocalDateStr(orc.dataPagamento);
        if (pagLocal && pagLocal >= limitePassado && pagLocal <= hoje) {
          result.push({
            id: `fin-pag-${orc.id}`,
            date: pagLocal,
            area: "financeiro",
            subtype: "Pagamento registrado",
            orcamentoId: orc.id,
            numero: orc.numeroOrcamento,
            nomeCliente: orc.nomeCliente,
          });
        }
      }
    }

    return result;
  }, [filaComercial, orcamentos, canViewFinanceiro, hoje, limiteMax, limitePassado]);

  // ─── Filter ───
  const visibleFilters = canViewFinanceiro
    ? filterOptions
    : filterOptions.filter((f) => f.value !== "financeiro");

  const filtered = filter === "todos" ? eventos : eventos.filter((e) => e.area === filter);

  // ─── Group into sections ───
  const sections = useMemo(() => {
    const groups = new Map<string, AgendaEvento[]>();

    for (const ev of filtered) {
      const list = groups.get(ev.date) || [];
      list.push(ev);
      groups.set(ev.date, list);
    }

    // Sort dates
    const sortedDates = Array.from(groups.keys()).sort();

    const result: AgendaSection[] = [];
    const overdue: AgendaEvento[] = [];

    for (const date of sortedDates) {
      const items = groups.get(date)!;

      if (date < hoje) {
        // Only comercial and operacao can be "atrasados"
        const atrasados = items.filter((e) => e.area !== "financeiro");
        const financeiros = items.filter((e) => e.area === "financeiro");

        overdue.push(...atrasados);

        // Financeiro items in the past go under "Últimos registros"
        if (financeiros.length > 0) {
          result.push({
            key: `fin-${date}`,
            label: formatDateLabel(date, hoje, amanha),
            isOverdue: false,
            eventos: financeiros,
          });
        }
      } else {
        result.push({
          key: date,
          label: formatDateLabel(date, hoje, amanha),
          isOverdue: false,
          eventos: items,
        });
      }
    }

    // Prepend overdue section
    if (overdue.length > 0) {
      result.unshift({
        key: "atrasados",
        label: "Atrasados",
        isOverdue: true,
        eventos: overdue.sort((a, b) => a.date.localeCompare(b.date)),
      });
    }

    return result;
  }, [filtered, hoje, amanha]);

  const handleClick = (orcamentoId: string) => {
    const orc = orcamentosMap.get(orcamentoId);
    if (orc) onViewOrcamento(orc);
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {visibleFilters.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              filter === opt.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {filaLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
          <Clock className="h-4 w-4 animate-spin" />
          Carregando agenda…
        </div>
      )}

      {/* Empty */}
      {!filaLoading && sections.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum evento nos próximos dias</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Quando houver retornos comerciais, execuções previstas ou registros financeiros, eles aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.key} className="space-y-2">
          {/* Section header */}
          <div className="flex items-center gap-2">
            {section.isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
            <h3
              className={cn(
                "text-sm font-semibold",
                section.isOverdue ? "text-destructive" : "text-foreground",
              )}
            >
              {section.label}
            </h3>
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] px-1.5 py-0",
                section.isOverdue && "bg-destructive/10 text-destructive border-destructive/20",
              )}
            >
              {section.eventos.length}
            </Badge>
          </div>

          {/* Events */}
          <div className="space-y-1.5">
            {section.eventos.map((ev) => {
              const config = areaConfig[ev.area];
              const Icon = config.icon;

              return (
                <button
                  key={ev.id}
                  onClick={() => handleClick(ev.orcamentoId)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border bg-card px-3 py-3 text-left transition-colors hover:bg-muted/50",
                    section.isOverdue && ev.area !== "financeiro" && "border-destructive/20",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      config.bgColor,
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        #{ev.numero} — {ev.nomeCliente}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0 border-0", config.bgColor, config.color)}
                      >
                        {config.label}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{ev.subtype}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
