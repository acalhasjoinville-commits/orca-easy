import { lazy, Suspense, useMemo, useState } from "react";
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
} from "lucide-react";

import { useFilaComercial } from "@/hooks/useFollowUp";
import { useVisitas } from "@/hooks/useVisitas";
import { useAuth } from "@/hooks/useAuth";
import { Orcamento, Visita } from "@/lib/types";
import { addDaysLocal, formatDateLabel, getTodayLocal, toLocalDateStr } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VisitasManager = lazy(() =>
  import("@/components/VisitasManager").then((m) => ({ default: m.VisitasManager })),
);

type AreaType = "comercial" | "operacao" | "financeiro" | "visita";
type FilterType = "todos" | AreaType;

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
};

const filterOptions: { value: FilterType; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "visita", label: "Visitas" },
  { value: "comercial", label: "Comercial" },
  { value: "operacao", label: "Operação" },
  { value: "financeiro", label: "Financeiro" },
];

function compareAgendaEventos(a: AgendaEvento, b: AgendaEvento) {
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  if (a.area !== b.area) return a.area.localeCompare(b.area);
  return a.numero - b.numero;
}

export function Agenda({ orcamentos, onViewOrcamento, openNewVisitaRequest }: AgendaProps) {
  const { canViewFinanceiro } = useAuth();
  const { data: filaComercial, isLoading: filaLoading } = useFilaComercial();
  const { visitas, isLoading: visitasLoading } = useVisitas();
  const [filter, setFilter] = useState<FilterType>("todos");
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null);

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

    // Follow-ups comerciais
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

    // Orçamentos (operação + financeiro)
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

    // Visitas agendadas/reagendadas
    for (const v of visitas) {
      if (v.status !== "agendada" && v.status !== "reagendada") continue;
      if (v.dataVisita > limiteMax) continue;

      result.push({
        id: `vis-${v.id}`,
        date: v.dataVisita,
        area: "visita",
        subtype: v.dataVisita < hoje ? "Visita atrasada" : v.status === "reagendada" ? "Visita reagendada" : "Visita técnica",
        orcamentoId: null,
        visitaId: v.id,
        numero: 0,
        nomeCliente: v.nomeCliente,
        horaVisita: v.horaVisita?.slice(0, 5),
      });
    }

    return result;
  }, [canViewFinanceiro, filaComercial, hoje, limiteMax, limitePassado, orcamentos, visitas]);

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

  const handleClick = (evento: AgendaEvento) => {
    if (evento.visitaId) {
      const v = visitas.find((vis) => vis.id === evento.visitaId);
      if (v) setSelectedVisita(v);
      return;
    }
    if (evento.orcamentoId) {
      const orcamento = orcamentosMap.get(evento.orcamentoId);
      if (orcamento) onViewOrcamento(orcamento);
    }
  };

  const isTimelineLoading = filaLoading || visitasLoading;

  const timelineContent = (
    <>
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
              Quando houver visitas, retornos comerciais, execuções previstas ou registros financeiros, eles aparecerão
              aqui.
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
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", config.bgColor)}>
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

      {/* Visita Detail Dialog — reuse VisitasManager's detail for timeline clicks */}
      {selectedVisita && (
        <VisitaTimelineDetail visita={selectedVisita} onClose={() => setSelectedVisita(null)} />
      )}
    </>
  );

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

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="timeline" className="flex-1 sm:flex-initial">
            Linha do tempo
          </TabsTrigger>
          <TabsTrigger value="visitas" className="flex-1 sm:flex-initial">
            Gestão de visitas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {timelineContent}
        </TabsContent>

        <TabsContent value="visitas">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <VisitasManager openNewRequest={openNewVisitaRequest} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Inline detail dialog for timeline visita clicks ───

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X } from "lucide-react";
import { useUpdateVisita } from "@/hooks/useVisitas";
import { STATUS_VISITA_CONFIG, StatusVisita } from "@/lib/types";
import { toast } from "sonner";

function VisitaTimelineDetail({ visita, onClose }: { visita: Visita; onClose: () => void }) {
  const updateVisita = useUpdateVisita();
  const cfg = STATUS_VISITA_CONFIG[visita.status];
  const whatsLink = `https://wa.me/55${visita.telefone.replace(/\D/g, "")}`;

  const handleStatus = async (status: StatusVisita) => {
    try {
      await updateVisita.mutateAsync({
        id: visita.id,
        nomeCliente: visita.nomeCliente,
        telefone: visita.telefone,
        enderecoCompleto: visita.enderecoCompleto,
        dataVisita: visita.dataVisita,
        horaVisita: visita.horaVisita,
        status,
      });
      toast.success(`Visita marcada como ${STATUS_VISITA_CONFIG[status].label.toLowerCase()}.`);
      onClose();
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da visita</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">{visita.nomeCliente}</h3>
              <a
                href={whatsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {visita.telefone}
              </a>
            </div>
            <Badge variant="outline" className={cn("shrink-0", cfg.color)}>
              {cfg.label}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{visita.enderecoCompleto}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(visita.dataVisita + "T00:00:00").toLocaleDateString("pt-BR")} às{" "}
                {visita.horaVisita.slice(0, 5)}
              </span>
            </div>
            {visita.tipoServico && <p className="text-muted-foreground">Tipo: {visita.tipoServico}</p>}
            {visita.responsavelNome && <p className="text-muted-foreground">Responsável: {visita.responsavelNome}</p>}
            {visita.observacoes && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">Observações</p>
                <p className="mt-1 whitespace-pre-wrap">{visita.observacoes}</p>
              </div>
            )}
          </div>

          {(visita.status === "agendada" || visita.status === "reagendada") && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-50"
                onClick={() => handleStatus("realizada")}
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Realizada
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-600 hover:bg-red-50"
                onClick={() => handleStatus("cancelada")}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
