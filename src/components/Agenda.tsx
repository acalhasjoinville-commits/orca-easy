import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  ChevronRight,
  Clock,
  Hammer,
  MapPin,
  Phone,
  Receipt,
  RotateCcw,
} from "lucide-react";

import { useFilaComercial } from "@/hooks/useFollowUp";
import { useVisitas } from "@/hooks/useVisitas";
import { useAllRetornos } from "@/hooks/useRetornosServico";
import { useAuth } from "@/hooks/useAuth";
import { Orcamento, Visita, RetornoServico } from "@/lib/types";
import { addDaysLocal, formatDateLabel, getTodayLocal, toLocalDateStr } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisitaDetailDialog } from "@/components/VisitaDetailDialog";
import { RetornoDetailDialog } from "@/components/RetornoDetailDialog";
import { EditVisitaRequest, VisitasManager } from "@/components/VisitasManager";
import { WeekStrip } from "@/components/WeekStrip";

function getMondayOf(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  date.setDate(date.getDate() + diff);
  return toLocalDateStr(date.toISOString()) as string;
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toLocalDateStr(date.toISOString()) as string;
}

type AreaType = "comercial" | "operacao" | "financeiro" | "visita" | "retorno";
type FilterType = "todos" | AreaType;
type AgendaView = "timeline" | "visitas";

interface AgendaEvento {
  id: string;
  date: string;
  area: AreaType;
  subtype: string;
  orcamentoId: string | null;
  visitaId: string | null;
  numero: number;
  nomeCliente: string;
  horaVisita?: string;
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
  openNewVisitaRequest?: number;
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
  visita: {
    label: "Visita",
    color: "text-violet-600",
    bgColor: "bg-violet-100 dark:bg-violet-950",
    icon: MapPin,
  },
  retorno: {
    label: "Retorno",
    color: "text-rose-600",
    bgColor: "bg-rose-100 dark:bg-rose-950",
    icon: RotateCcw,
  },
};

const filterOptions: { value: FilterType; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "visita", label: "Visitas" },
  { value: "comercial", label: "Comercial" },
  { value: "operacao", label: "Operação" },
  { value: "retorno", label: "Retornos" },
  { value: "financeiro", label: "Financeiro" },
];

const AGENDA_FILTER_STORAGE_KEY = "orcacalhas:agenda-view:v1";
const AGENDA_TAB_STORAGE_KEY = "orcacalhas:agenda-tab:v1";

function compareAgendaEventos(a: AgendaEvento, b: AgendaEvento) {
  if (a.date !== b.date) return a.date.localeCompare(b.date);

  const timeA = a.horaVisita ?? "99:99";
  const timeB = b.horaVisita ?? "99:99";
  if (timeA !== timeB) return timeA.localeCompare(timeB);

  if (a.area !== b.area) return a.area.localeCompare(b.area);
  if (a.numero !== b.numero) return a.numero - b.numero;
  return a.nomeCliente.localeCompare(b.nomeCliente);
}

export function Agenda({ orcamentos, onViewOrcamento, openNewVisitaRequest }: AgendaProps) {
  const { canViewFinanceiro, user } = useAuth();
  const { data: filaComercial, isLoading: filaLoading } = useFilaComercial();
  const { visitas, isLoading: visitasLoading } = useVisitas();
  const { data: retornosServico } = useAllRetornos();

  const [filter, setFilter] = useState<FilterType>("todos");
  const [activeView, setActiveView] = useState<AgendaView>("timeline");
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null);
  const [selectedRetorno, setSelectedRetorno] = useState<RetornoServico | null>(null);
  const [editRequest, setEditRequest] = useState<EditVisitaRequest | null>(null);

  const hoje = getTodayLocal();
  const amanha = addDaysLocal(1);
  const limiteMax = addDaysLocal(7);
  const limitePassado = addDaysLocal(-7);

  useEffect(() => {
    if (!user) return;

    try {
      const storedFilter = sessionStorage.getItem(`${AGENDA_FILTER_STORAGE_KEY}:${user.id}`);
      if (
        storedFilter === "todos" ||
        storedFilter === "comercial" ||
        storedFilter === "operacao" ||
        storedFilter === "financeiro" ||
        storedFilter === "visita" ||
        storedFilter === "retorno"
      ) {
        setFilter(storedFilter);
      }

      const storedTab = sessionStorage.getItem(`${AGENDA_TAB_STORAGE_KEY}:${user.id}`);
      if (storedTab === "timeline" || storedTab === "visitas") {
        setActiveView(storedTab);
      }
    } catch {
      // ignore restore failures
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    try {
      sessionStorage.setItem(`${AGENDA_FILTER_STORAGE_KEY}:${user.id}`, filter);
      sessionStorage.setItem(`${AGENDA_TAB_STORAGE_KEY}:${user.id}`, activeView);
    } catch {
      // ignore persistence failures
    }
  }, [activeView, filter, user]);

  useEffect(() => {
    if (!openNewVisitaRequest) return;

    setSelectedVisita(null);
    setActiveView("visitas");
  }, [openNewVisitaRequest]);

  const effectiveFilter = !canViewFinanceiro && filter === "financeiro" ? "todos" : filter;

  const orcamentosMap = useMemo(() => {
    const map = new Map<string, Orcamento>();
    for (const orcamento of orcamentos) {
      map.set(orcamento.id, orcamento);
    }
    return map;
  }, [orcamentos]);

  const visitasMap = useMemo(() => {
    const map = new Map<string, Visita>();
    for (const visita of visitas) map.set(visita.id, visita);
    return map;
  }, [visitas]);

  const retornosMap = useMemo(() => {
    const map = new Map<string, RetornoServico>();
    for (const r of retornosServico ?? []) map.set(r.id, r);
    return map;
  }, [retornosServico]);

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
        visitaId: null,
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
            subtype: previstaLocal < hoje ? "Execucao atrasada" : "Execucao prevista",
            orcamentoId: orcamento.id,
            visitaId: null,
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
          visitaId: null,
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
          visitaId: null,
          numero: orcamento.numeroOrcamento,
          nomeCliente: orcamento.nomeCliente,
        });
      }
    }

    for (const visita of visitas) {
      if (visita.status !== "agendada" && visita.status !== "reagendada") continue;
      if (visita.dataVisita > limiteMax) continue;

      result.push({
        id: `vis-${visita.id}`,
        date: visita.dataVisita,
        area: "visita",
        subtype:
          visita.dataVisita < hoje
            ? "Visita atrasada"
            : visita.status === "reagendada"
              ? "Visita reagendada"
              : "Visita técnica",
        orcamentoId: null,
        visitaId: visita.id,
        numero: 0,
        nomeCliente: visita.nomeCliente,
        horaVisita: visita.horaVisita.slice(0, 5),
      });
    }

    // Retornos do serviço
    for (const retorno of retornosServico ?? []) {
      if (retorno.status === "encerrado" || retorno.status === "cancelado") continue;
      if (!retorno.dataRetorno) continue;
      if (retorno.dataRetorno > limiteMax) continue;

      const orc = orcamentosMap.get(retorno.orcamentoId);
      result.push({
        id: `ret-${retorno.id}`,
        date: retorno.dataRetorno,
        area: "retorno",
        subtype: retorno.dataRetorno < hoje ? "Retorno atrasado" : "Retorno agendado",
        orcamentoId: retorno.orcamentoId,
        visitaId: null,
        numero: orc?.numeroOrcamento ?? 0,
        nomeCliente: orc?.nomeCliente ?? "—",
        horaVisita: retorno.horaRetorno?.slice(0, 5),
      });
    }

    return result;
  }, [canViewFinanceiro, filaComercial, hoje, limiteMax, limitePassado, orcamentos, retornosServico, orcamentosMap, visitas]);

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
        label: "Ultimos registros financeiros",
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

  const handleClick = (evento: AgendaEvento) => {
    if (evento.visitaId) {
      const visita = visitasMap.get(evento.visitaId);
      if (visita) setSelectedVisita(visita);
      return;
    }

    // Retorno do serviço — open contextual detail
    if (evento.area === "retorno") {
      const retornoId = evento.id.replace("ret-", "");
      const retorno = retornosMap.get(retornoId);
      if (retorno) {
        setSelectedRetorno(retorno);
        return;
      }
    }

    if (evento.orcamentoId) {
      const orcamento = orcamentosMap.get(evento.orcamentoId);
      if (orcamento) onViewOrcamento(orcamento);
    }
  };

  const handleTimelineEdit = (mode: EditVisitaRequest["mode"]) => {
    if (!selectedVisita) return;

    setEditRequest({
      key: Date.now(),
      visita: selectedVisita,
      mode,
    });
    setSelectedVisita(null);
    setActiveView("visitas");
  };

  const isTimelineLoading = filaLoading || visitasLoading;

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
                Veja visitas técnicas, retornos comerciais, execuções previstas e registros recentes em uma linha do
                tempo simples para a semana.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as AgendaView)} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="timeline" className="flex-1 sm:flex-initial">
            Linha do tempo
          </TabsTrigger>
          <TabsTrigger value="visitas" className="flex-1 sm:flex-initial">
            Gestão de visitas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6 pt-2">
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

          {isTimelineLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 animate-spin" />
              Carregando agenda...
            </div>
          )}

          {!isTimelineLoading && sections.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum evento nos próximos dias</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Quando houver visitas, retornos comerciais, execuções previstas ou registros financeiros, eles
                  aparecerão aqui.
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
                      onClick={() => handleClick(evento)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border bg-card px-3 py-3 text-left transition-colors hover:bg-muted/50",
                        section.isOverdue && evento.area !== "financeiro" && "border-destructive/20",
                      )}
                    >
                      <div
                        className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", config.bgColor)}
                      >
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {evento.area === "visita"
                              ? evento.nomeCliente
                              : `#${evento.numero} - ${evento.nomeCliente}`}
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
                          {evento.horaVisita && (
                            <>
                              <span className="text-[11px] text-muted-foreground/50">•</span>
                              <span className="text-[11px] text-muted-foreground">{evento.horaVisita}</span>
                            </>
                          )}
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
        </TabsContent>

        <TabsContent value="visitas" className="pt-2">
          <VisitasManager openNewRequest={openNewVisitaRequest} editRequest={editRequest} />
        </TabsContent>
      </Tabs>

      <VisitaDetailDialog
        visita={selectedVisita}
        open={!!selectedVisita}
        onOpenChange={(open) => {
          if (!open) setSelectedVisita(null);
        }}
        onEdit={selectedVisita ? () => handleTimelineEdit("edit") : undefined}
        onReschedule={selectedVisita ? () => handleTimelineEdit("reschedule") : undefined}
      />

      <RetornoDetailDialog
        retorno={selectedRetorno}
        open={!!selectedRetorno}
        onOpenChange={(open) => {
          if (!open) setSelectedRetorno(null);
        }}
        onOpenOrcamento={
          selectedRetorno
            ? () => {
                const orc = orcamentosMap.get(selectedRetorno.orcamentoId);
                if (orc) {
                  setSelectedRetorno(null);
                  onViewOrcamento(orc);
                }
              }
            : undefined
        }
      />
    </div>
  );
}
