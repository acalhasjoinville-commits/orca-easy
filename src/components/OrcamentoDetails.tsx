import { useState } from "react";
import { Orcamento, StatusOrcamento, Cliente, MinhaEmpresa } from "@/lib/types";
import { FollowUpBlock } from "./FollowUpBlock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Pencil,
  Copy,
  CalendarDays,
  CreditCard,
  Shield,
  FileText,
  Factory,
  Truck,
  Hammer,
  Receipt,
  Banknote,
  CalendarClock,
  Check,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { PDFDownloadButton } from "./PDFDownloadButton";
import { OSDownloadButton } from "./OSDownloadButton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toLocalDateStr } from "@/lib/dateUtils";

interface OrcamentoDetailsProps {
  orcamento: Orcamento;
  cliente?: Cliente;
  empresa?: MinhaEmpresa;
  onBack: () => void;
  onEdit: (orc: Orcamento) => void;
  onDuplicate?: (orc: Orcamento) => void;
  onMarkExecuted?: (orc: Orcamento) => void;
  onMarkFaturado?: (orc: Orcamento) => void;
  onMarkPago?: (orc: Orcamento) => void;
  onUpdateDataPrevista?: (orc: Orcamento, date: string | null) => void;
  onCancelOrcamento?: (orc: Orcamento) => void;
}

const statusConfig: Record<StatusOrcamento, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30" },
  aprovado: { label: "Aprovado", color: "bg-green-500/20 text-green-700 border-green-500/30" },
  rejeitado: { label: "Rejeitado", color: "bg-red-500/20 text-red-700 border-red-500/30" },
  executado: { label: "Executado", color: "bg-blue-500/20 text-blue-700 border-blue-500/30" },
  cancelado: { label: "Cancelado", color: "bg-gray-500/20 text-gray-600 border-gray-500/30" },
};

const dificuldadeLabels: Record<string, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function parseDateValue(value: string | null | undefined): Date | null {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateValue(value: string | null | undefined, mode: "date" | "datetime" = "date") {
  const parsed = parseDateValue(value);
  if (!parsed) return null;

  return mode === "datetime"
    ? format(parsed, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : format(parsed, "dd/MM/yyyy", { locale: ptBR });
}

function toDateOnlyInput(date: Date): string {
  const localDate = toLocalDateStr(date.toISOString());
  return localDate ?? date.toISOString();
}

type TimelineEvent = {
  id: string;
  label: string;
  detail: string;
  dateLabel?: string | null;
  icon: React.ElementType;
  iconClass: string;
  badgeLabel: string;
  badgeClass: string;
};

function getOperationalTimeline(orcamento: Orcamento): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: "created",
      label: "Orçamento criado",
      detail: "A proposta foi registrada no sistema e entrou na rotina comercial.",
      dateLabel: formatDateValue(orcamento.dataCriacao, "datetime"),
      icon: FileText,
      iconClass: "bg-primary/10 text-primary",
      badgeLabel: "Registrado",
      badgeClass: "bg-primary/10 text-primary",
    },
  ];

  if (orcamento.status === "rejeitado") {
    events.push({
      id: "rejected",
      label: "Orçamento rejeitado",
      detail: "A proposta não avançou para a etapa operacional.",
      icon: Ban,
      iconClass: "bg-red-500/15 text-red-600",
      badgeLabel: "Encerrado",
      badgeClass: "bg-red-500/15 text-red-600",
    });
    return events;
  }

  if (orcamento.status === "cancelado") {
    events.push({
      id: "cancelled",
      label: "Orçamento cancelado",
      detail: "O fluxo foi encerrado e não seguirá para execução ou financeiro.",
      dateLabel: formatDateValue(orcamento.dataCancelamento),
      icon: Ban,
      iconClass: "bg-gray-500/15 text-gray-600",
      badgeLabel: "Encerrado",
      badgeClass: "bg-gray-500/15 text-gray-600",
    });
    return events;
  }

  if (orcamento.status !== "pendente") {
    events.push({
      id: "approved",
      label: "Venda aprovada",
      detail: "O orçamento saiu do comercial e entrou na operação.",
      icon: Check,
      iconClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      badgeLabel: "Confirmado",
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    });
  } else {
    events.push({
      id: "pending-approval",
      label: "Aguardando aprovação do cliente",
      detail: "O comercial ainda está conduzindo este orçamento.",
      icon: CalendarClock,
      iconClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      badgeLabel: "Em aberto",
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    });
  }

  if (orcamento.dataPrevista && orcamento.status !== "pendente") {
    events.push({
      id: "scheduled",
      label: "Data prevista definida",
      detail: "A equipe já tem uma previsão para executar este serviço.",
      dateLabel: formatDateValue(orcamento.dataPrevista),
      icon: CalendarClock,
      iconClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      badgeLabel: "Agendado",
      badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    });
  } else if (orcamento.status === "aprovado") {
    events.push({
      id: "schedule-pending",
      label: "Definir data prevista",
      detail: "A venda já foi aprovada e ainda precisa entrar em agenda.",
      icon: CalendarClock,
      iconClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      badgeLabel: "Pendente",
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    });
  }

  if (orcamento.dataExecucao) {
    events.push({
      id: "executed",
      label: "Serviço executado",
      detail: "A execução foi registrada e o fluxo pode seguir para faturamento.",
      dateLabel: formatDateValue(orcamento.dataExecucao),
      icon: Hammer,
      iconClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      badgeLabel: "Concluído",
      badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    });
  } else if (orcamento.status === "aprovado") {
    events.push({
      id: "execution-pending",
      label: "Execução aguardando equipe",
      detail: orcamento.dataPrevista
        ? `A execução está prevista para ${formatDateValue(orcamento.dataPrevista)}.`
        : "Aguardando a definição de agenda para a operação seguir.",
      icon: Hammer,
      iconClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      badgeLabel: "Aguardando",
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    });
  }

  if (orcamento.dataFaturamento) {
    events.push({
      id: "invoiced",
      label: "Orçamento faturado",
      detail: "O fluxo financeiro já foi iniciado para cobrança.",
      dateLabel: formatDateValue(orcamento.dataFaturamento),
      icon: Receipt,
      iconClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      badgeLabel: "Faturado",
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    });
  } else if (orcamento.status === "executado") {
    events.push({
      id: "invoice-pending",
      label: "Aguardando faturamento",
      detail: "O serviço já foi executado, mas ainda não entrou no financeiro.",
      icon: Receipt,
      iconClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      badgeLabel: "Pendente",
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    });
  }

  if (orcamento.dataPagamento) {
    events.push({
      id: "paid",
      label: "Pagamento confirmado",
      detail: "O ciclo operacional e financeiro deste orçamento foi concluído.",
      dateLabel: formatDateValue(orcamento.dataPagamento),
      icon: Banknote,
      iconClass: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
      badgeLabel: "Recebido",
      badgeClass: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
    });
  } else if (orcamento.dataFaturamento) {
    events.push({
      id: "payment-pending",
      label: "Aguardando pagamento",
      detail: "O orçamento já foi faturado e ainda está esperando recebimento.",
      icon: Banknote,
      iconClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      badgeLabel: "Em aberto",
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    });
  }

  return events;
}

// Pipeline steps
const pipelineSteps = [
  { key: "pendente", label: "Pendente" },
  { key: "aprovado", label: "Aprovado" },
  { key: "executado", label: "Executado" },
  { key: "faturado", label: "Faturado" },
  { key: "pago", label: "Pago" },
];

function getPipelineStep(orc: Orcamento): number {
  if (orc.dataPagamento) return 4;
  if (orc.dataFaturamento) return 3;
  if (orc.status === "executado") return 2;
  if (orc.status === "aprovado") return 1;
  return 0;
}

function PipelineBar({ orcamento }: { orcamento: Orcamento }) {
  const currentStep = getPipelineStep(orcamento);
  return (
    <div className="flex items-center gap-0 mb-6 px-2">
      {pipelineSteps.map((step, idx) => {
        const isActive = idx <= currentStep;
        const isCurrent = idx === currentStep;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 relative">
              {/* Connector line */}
              {idx > 0 && (
                <div
                  className={cn("absolute top-3 right-1/2 w-full h-0.5 -z-10", isActive ? "bg-accent" : "bg-border")}
                />
              )}
              {/* Circle */}
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all border-2",
                  isCurrent
                    ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/20 scale-110"
                    : isActive
                      ? "bg-accent/20 text-accent border-accent/40"
                      : "bg-muted text-muted-foreground border-border",
                )}
              >
                {isActive && idx < currentStep ? <Check className="h-3 w-3" /> : idx + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1.5 font-semibold truncate",
                  isCurrent ? "text-accent" : isActive ? "text-accent/70" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OperationalTimeline({ orcamento }: { orcamento: Orcamento }) {
  const events = getOperationalTimeline(orcamento);

  return (
    <Card className="mb-4">
      <CardContent className="p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">Linha do tempo operacional</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Uma visão rápida do que já aconteceu e do próximo passo esperado neste orçamento.
          </p>
        </div>

        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", event.iconClass)}>
                  <event.icon className="h-4 w-4" />
                </div>
                {index < events.length - 1 && <div className="mt-2 h-full w-px bg-border" />}
              </div>

              <div className="min-w-0 flex-1 rounded-xl border bg-muted/20 px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{event.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{event.detail}</p>
                  </div>

                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", event.badgeClass)}>
                      {event.badgeLabel}
                    </span>
                    {event.dateLabel && <span className="text-[11px] text-muted-foreground">{event.dateLabel}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function OrcamentoDetails({
  orcamento,
  cliente,
  empresa,
  onBack,
  onEdit,
  onDuplicate,
  onMarkExecuted,
  onMarkFaturado,
  onMarkPago,
  onUpdateDataPrevista,
  onCancelOrcamento,
}: OrcamentoDetailsProps) {
  const { canCreateEditBudget } = useAuth();
  const st = statusConfig[orcamento.status ?? "pendente"];
  const displayValue =
    (orcamento.desconto ?? 0) > 0 ? (orcamento.valorFinal ?? orcamento.valorVenda) : orcamento.valorVenda;
  // Compute known cost only from items that have cost data
  const custoConhecidoTotal = orcamento.itensServico.reduce((s, i) => {
    if (i.custoIncompleto) return s;
    return s + (i.custoConhecido ?? i.custoTotalObra);
  }, 0);
  const margem = displayValue > 0 ? (1 - custoConhecidoTotal / displayValue) * 100 : 0;
  const hasAnyCustoIncompleto = orcamento.itensServico.some(i => i.custoIncompleto === true);
  const dataPrevistaSelecionada = parseDateValue(orcamento.dataPrevista) ?? undefined;
  const showDataPrevista = Boolean(orcamento.dataPrevista && orcamento.status !== "pendente");

  const showPipeline = orcamento.status !== "rejeitado" && orcamento.status !== "cancelado";

  // Data prevista picker state — only saves on explicit action
  const [dataPrevPopoverOpen, setDataPrevPopoverOpen] = useState(false);

  const handleDataPrevistaSelect = (date: Date | undefined) => {
    if (onUpdateDataPrevista) {
      onUpdateDataPrevista(orcamento, date ? toDateOnlyInput(date) : null);
    }
    setDataPrevPopoverOpen(false);
  };

  return (
    <div className="px-4 lg:px-6 pt-4 pb-24 lg:pb-8 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista
      </button>

      {/* Pipeline */}
      {showPipeline && <PipelineBar orcamento={orcamento} />}

      {/* Follow-up Comercial */}
      <FollowUpBlock orcamentoId={orcamento.id} />

      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl font-bold text-accent">#{orcamento.numeroOrcamento ?? "—"}</h1>
                <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold border", st.color)}>
                  {st.label}
                </span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                  {orcamento.motorType === "motor1" ? (
                    <span className="flex items-center gap-1">
                      <Factory className="h-3 w-3" /> Motor 1
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" /> Motor 2
                    </span>
                  )}
                </span>
              </div>
              <p className="text-lg font-medium text-foreground">{orcamento.nomeCliente}</p>
            </div>
            <p className="text-xl font-bold text-accent">{formatCurrency(displayValue)}</p>
          </div>
          {/* Dates in order: criação → prevista → execução → faturamento → pagamento */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              Criado em {formatDateValue(orcamento.dataCriacao) ?? "—"}
            </span>
            {showDataPrevista && (
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                Previsto {formatDateValue(orcamento.dataPrevista)}
              </span>
            )}
            {orcamento.dataExecucao && (
              <span className="flex items-center gap-1">
                <Hammer className="h-3 w-3" />
                Executado em {formatDateValue(orcamento.dataExecucao)}
              </span>
            )}
            {orcamento.dataFaturamento && (
              <span className="flex items-center gap-1">
                <Receipt className="h-3 w-3" />
                Faturado em {formatDateValue(orcamento.dataFaturamento)}
              </span>
            )}
            {orcamento.dataPagamento && (
              <span className="flex items-center gap-1">
                <Banknote className="h-3 w-3" />
                Pago em {formatDateValue(orcamento.dataPagamento)}
              </span>
            )}
            {formatDateValue(orcamento.validade) && <span>Válido até {formatDateValue(orcamento.validade)}</span>}
          </div>

          {/* Data prevista editor — only when status = aprovado */}
          {canCreateEditBudget && orcamento.status === "aprovado" && onUpdateDataPrevista && (
            <div className="mt-3 flex items-center gap-2">
              <Popover open={dataPrevPopoverOpen} onOpenChange={setDataPrevPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
                    {orcamento.dataPrevista
                      ? `Previsto: ${formatDateValue(orcamento.dataPrevista)}`
                      : "Definir data prevista"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataPrevistaSelecionada}
                    onSelect={handleDataPrevistaSelect}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {orcamento.dataPrevista && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-destructive"
                  onClick={() => onUpdateDataPrevista(orcamento, null)}
                >
                  Limpar
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <OperationalTimeline orcamento={orcamento} />

      {/* Itens de Serviço */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Itens do Orçamento</h2>
            <span className="text-xs text-muted-foreground">
              {orcamento.itensServico.length} {orcamento.itensServico.length === 1 ? "item" : "itens"}
            </span>
          </div>
           {orcamento.itensServico.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum item adicionado.</p>
          ) : (
            <div className="space-y-0">
              {orcamento.itensServico.map((item, idx) => (
                <div key={item.id} className={cn("py-3.5", idx > 0 && "border-t border-border")}>
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground mt-0.5 shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{item.nomeServico}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                          {item.tipoServico === 'avulso' ? (
                            <>
                              {item.modoCobranca === 'valor_fechado' && <span>Valor fechado</span>}
                              {item.modoCobranca === 'por_unidade' && <span>{item.quantidade ?? 0} {item.unidadeCobranca || 'un'}</span>}
                              {item.modoCobranca === 'por_metro' && (
                                <>
                                  <span>{item.metragem}m</span>
                                  <span>{dificuldadeLabels[item.dificuldade] ?? item.dificuldade}</span>
                                </>
                              )}
                              <span className="text-primary font-medium">Avulso</span>
                              {item.custoIncompleto && <span className="text-amber-600 font-medium">Custo incompleto</span>}
                            </>
                          ) : (
                            <>
                              <span>{item.materialId}</span>
                              <span>{item.espessura}mm</span>
                              <span>{item.metragem}m</span>
                              <span>{dificuldadeLabels[item.dificuldade] ?? item.dificuldade}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-accent shrink-0 ml-2">{formatCurrency(item.valorVenda)}</p>
                  </div>
                  {item.insumosCalculados && item.insumosCalculados.length > 0 && (
                    <div className="ml-[34px] mt-2 rounded-md bg-muted/50 p-2.5">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                        Insumos
                      </p>
                      <div className="space-y-0.5">
                        {item.insumosCalculados.map((ins) => (
                          <div key={ins.insumoId} className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {ins.nomeInsumo} (×{ins.quantidade.toFixed(2)})
                            </span>
                            <span>{formatCurrency(ins.custoTotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Resumo Financeiro</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{hasAnyCustoIncompleto ? "Custo Conhecido" : "Custo Total"}</span>
              <span className="font-medium">{formatCurrency(custoConhecidoTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor de Venda</span>
              <span className="font-medium">{formatCurrency(orcamento.valorVenda)}</span>
            </div>
            {(orcamento.desconto ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desconto</span>
                <span className="font-medium text-destructive">-{formatCurrency(orcamento.desconto)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-baseline rounded-lg bg-muted/50 px-3 py-2.5 -mx-1">
              <span className="text-sm font-semibold">Valor Final</span>
              <span className="text-xl font-bold text-accent">{formatCurrency(displayValue)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-muted-foreground">Margem</span>
              <Badge variant={hasAnyCustoIncompleto ? "secondary" : margem >= 30 ? "default" : "secondary"} className="text-[10px] px-2">
                {hasAnyCustoIncompleto ? `${margem.toFixed(1)}% (parcial)` : `${margem.toFixed(1)}%`}
              </Badge>
            </div>
            {hasAnyCustoIncompleto && (
              <p className="text-[11px] text-amber-600 mt-1">
                Custo incompleto: um ou mais serviços avulsos não possuem custo interno. Margem e lucro podem estar parciais.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Condições */}
      {(orcamento.formasPagamento || orcamento.garantia || orcamento.descricaoGeral) && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Condições Comerciais</h2>
            <div className="space-y-3 text-sm">
              {orcamento.descricaoGeral && (
                <div className="flex items-start gap-2.5">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Descrição</span>
                    <p className="text-foreground">{orcamento.descricaoGeral}</p>
                  </div>
                </div>
              )}
              {orcamento.formasPagamento && (
                <div className="flex items-start gap-2.5">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Pagamento</span>
                    <p className="text-foreground">{orcamento.formasPagamento}</p>
                  </div>
                </div>
              )}
              {orcamento.garantia && (
                <div className="flex items-start gap-2.5">
                  <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Garantia</span>
                    <p className="text-foreground">
                      {orcamento.garantia}
                      {orcamento.tempoGarantia ? ` (${orcamento.tempoGarantia})` : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Primary actions */}
        <PDFDownloadButton
          orcamento={orcamento}
          cliente={cliente}
          empresa={empresa}
          className="h-10 px-4 sm:px-5 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-xs sm:text-sm"
        />

        {(orcamento.status === "aprovado" || orcamento.status === "executado") && (
          <OSDownloadButton
            orcamento={orcamento}
            cliente={cliente}
            empresa={empresa}
            className="h-10 px-4 sm:px-5 text-xs sm:text-sm"
          />
        )}

        <div className="hidden sm:block h-6 w-px bg-border mx-1" />

        {/* Mark as executed — only if approved and not yet executed */}
        {canCreateEditBudget && orcamento.status === "aprovado" && onMarkExecuted && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 text-xs sm:text-sm border-blue-500/30 text-blue-700 hover:bg-blue-500/10"
              >
                <Hammer className="mr-1.5 h-4 w-4" />
                Marcar Executado
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Marcar como Executado?</AlertDialogTitle>
                <AlertDialogDescription>
                  O orçamento <strong>#{orcamento.numeroOrcamento}</strong> será marcado como executado com a data de
                  hoje.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onMarkExecuted(orcamento)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Mark as faturado — only if executed and not yet faturado */}
        {canCreateEditBudget && orcamento.status === "executado" && !orcamento.dataFaturamento && onMarkFaturado && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 text-xs sm:text-sm border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10"
              >
                <Receipt className="mr-1.5 h-4 w-4" />
                Marcar Faturado
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Marcar como Faturado?</AlertDialogTitle>
                <AlertDialogDescription>
                  O orçamento <strong>#{orcamento.numeroOrcamento}</strong> será marcado como faturado com a data de
                  hoje.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onMarkFaturado(orcamento)}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Mark as pago — only if faturado and not yet pago */}
        {canCreateEditBudget && orcamento.dataFaturamento && !orcamento.dataPagamento && onMarkPago && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 text-xs sm:text-sm border-violet-500/30 text-violet-700 hover:bg-violet-500/10"
              >
                <Banknote className="mr-1.5 h-4 w-4" />
                Marcar Pago
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Marcar como Pago?</AlertDialogTitle>
                <AlertDialogDescription>
                  O orçamento <strong>#{orcamento.numeroOrcamento}</strong> será marcado como pago com a data de hoje.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onMarkPago(orcamento)}
                  className="bg-violet-600 text-white hover:bg-violet-700"
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Cancel — only if pendente or aprovado */}
        {canCreateEditBudget &&
          (orcamento.status === "pendente" || orcamento.status === "aprovado") &&
          onCancelOrcamento && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 text-xs sm:text-sm border-gray-500/30 text-gray-600 hover:bg-gray-500/10"
                >
                  <Ban className="mr-1.5 h-4 w-4" />
                  Cancelar Orçamento
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Orçamento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O orçamento <strong>#{orcamento.numeroOrcamento}</strong> será cancelado. Esta ação não pode ser
                    desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onCancelOrcamento(orcamento)}
                    className="bg-gray-600 text-white hover:bg-gray-700"
                  >
                    Confirmar Cancelamento
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

        {/* Secondary actions */}
        {canCreateEditBudget && (
          <Button variant="outline" onClick={() => onEdit(orcamento)} className="h-10 px-4 text-xs sm:text-sm">
            <Pencil className="mr-1.5 h-4 w-4" />
            Editar
          </Button>
        )}

        {canCreateEditBudget && onDuplicate && (
          <Button variant="outline" onClick={() => onDuplicate(orcamento)} className="h-10 px-4 text-xs sm:text-sm">
            <Copy className="mr-1.5 h-4 w-4" />
            Duplicar
          </Button>
        )}
      </div>
    </div>
  );
}
