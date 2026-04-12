import { useEffect, useMemo, useState } from "react";
import { useFilaComercial, FilaComercialItem } from "@/hooks/useFollowUp";
import { Orcamento, StatusFollowUp, STATUS_FOLLOWUP_CONFIG } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CalendarDays, Clock, Eye, Loader2, MessageCircle, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { getTodayLocal, toLocalDateStr } from "@/lib/dateUtils";

interface FilaComercialProps {
  onViewOrcamento: (orc: Orcamento) => void;
  orcamentos: Orcamento[];
}

type QueueSort = "prioridade" | "data_criacao";
const FILA_COMERCIAL_VIEW_STORAGE_KEY = "orcacalhas:fila-comercial-view:v1";

const allStatuses = Object.keys(STATUS_FOLLOWUP_CONFIG) as StatusFollowUp[];

interface StoredFilaComercialViewState {
  search?: string;
  filterStatus?: string;
  filterResponsavel?: string;
  sortBy?: QueueSort;
}

const fmtDate = (dateValue: string | null | undefined) => {
  const localDate = toLocalDateStr(dateValue);
  if (!localDate) return "Sem data";
  const [year, month, day] = localDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

const formatCurrency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function getDayTimestamp(dateValue: string | null | undefined) {
  const localDate = toLocalDateStr(dateValue);
  if (!localDate) return null;
  const [year, month, day] = localDate.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function getPriorityRank(item: FilaComercialItem, todayTs: number) {
  const retornoTs = getDayTimestamp(item.dataRetorno);

  if (retornoTs !== null) {
    if (retornoTs < todayTs && item.statusFollowUp !== "concluido") return 0;
    if (retornoTs === todayTs) return 1;
    return 3;
  }

  if (item.statusFollowUp === "sem_retorno") return 2;
  return 4;
}

function compareByPriority(a: FilaComercialItem, b: FilaComercialItem, todayTs: number) {
  const rankA = getPriorityRank(a, todayTs);
  const rankB = getPriorityRank(b, todayTs);

  if (rankA !== rankB) return rankA - rankB;

  const retornoA = getDayTimestamp(a.dataRetorno);
  const retornoB = getDayTimestamp(b.dataRetorno);

  if (retornoA !== null && retornoB !== null && retornoA !== retornoB) {
    return retornoA - retornoB;
  }

  const createdA = new Date(a.dataCriacao).getTime();
  const createdB = new Date(b.dataCriacao).getTime();

  // Orcamentos sem acompanhamento sobem pelo mais antigo primeiro.
  if (rankA === 2) {
    return createdA - createdB;
  }

  return createdB - createdA;
}

function getRetornoLabel(item: FilaComercialItem) {
  if (item.dataRetorno) return fmtDate(item.dataRetorno);
  if (item.statusFollowUp === "sem_retorno") return "Sem agenda";
  return "Nao agendado";
}

export function FilaComercial({ onViewOrcamento, orcamentos }: FilaComercialProps) {
  const { user } = useAuth();
  const { data: items, isLoading } = useFilaComercial();
  const isMobile = useIsMobile();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterResponsavel, setFilterResponsavel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<QueueSort>("prioridade");

  useEffect(() => {
    if (!user) return;
    try {
      const raw = sessionStorage.getItem(`${FILA_COMERCIAL_VIEW_STORAGE_KEY}:${user.id}`);
      if (!raw) return;

      const parsed = JSON.parse(raw) as StoredFilaComercialViewState;
      if (typeof parsed.search === "string") setSearch(parsed.search);
      if (typeof parsed.filterStatus === "string") setFilterStatus(parsed.filterStatus);
      if (typeof parsed.filterResponsavel === "string") setFilterResponsavel(parsed.filterResponsavel);
      if (parsed.sortBy === "prioridade" || parsed.sortBy === "data_criacao") setSortBy(parsed.sortBy);
    } catch {
      // ignore restore failures
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try {
      const state: StoredFilaComercialViewState = {
        search,
        filterStatus,
        filterResponsavel,
        sortBy,
      };
      sessionStorage.setItem(`${FILA_COMERCIAL_VIEW_STORAGE_KEY}:${user.id}`, JSON.stringify(state));
    } catch {
      // ignore persistence failures
    }
  }, [user, search, filterStatus, filterResponsavel, sortBy]);

  const todayTs = useMemo(() => {
    const [year, month, day] = getTodayLocal().split("-").map(Number);
    return new Date(year, month - 1, day).getTime();
  }, []);

  const kpis = useMemo(() => {
    if (!items) {
      return {
        semRetorno: 0,
        hoje: 0,
        atrasados: 0,
        emNegociacao: 0,
        aguardando: 0,
      };
    }

    let semRetorno = 0;
    let hoje = 0;
    let atrasados = 0;
    let emNegociacao = 0;
    let aguardando = 0;

    for (const item of items) {
      if (item.statusFollowUp === "sem_retorno") semRetorno++;
      if (item.statusFollowUp === "em_negociacao") emNegociacao++;
      if (item.statusFollowUp === "aguardando_cliente") aguardando++;

      if (item.dataRetorno) {
        const retornoTs = getDayTimestamp(item.dataRetorno);
        if (retornoTs === todayTs) hoje++;
        else if (retornoTs !== null && retornoTs < todayTs && item.statusFollowUp !== "concluido") {
          atrasados++;
        }
      }
    }

    return { semRetorno, hoje, atrasados, emNegociacao, aguardando };
  }, [items, todayTs]);

  const responsaveis = useMemo(() => {
    if (!items) return [];
    const names = new Set<string>();

    for (const item of items) {
      if (item.responsavelNome) names.add(item.responsavelNome);
    }

    return Array.from(names).sort();
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    let result = [...items];

    if (filterStatus === "all") {
      result = result.filter((item) => item.statusFollowUp !== "concluido");
    } else {
      result = result.filter((item) => item.statusFollowUp === filterStatus);
    }

    if (filterResponsavel !== "all") {
      result = result.filter((item) => item.responsavelNome === filterResponsavel);
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter(
        (item) => item.nomeCliente.toLowerCase().includes(query) || String(item.numeroOrcamento).includes(query),
      );
    }

    result.sort((a, b) => {
      if (sortBy === "prioridade") {
        return compareByPriority(a, b, todayTs);
      }
      return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
    });

    return result;
  }, [filterResponsavel, filterStatus, items, search, sortBy, todayTs]);

  const handleView = (item: FilaComercialItem) => {
    const orcamento = orcamentos.find((orc) => orc.id === item.orcamentoId);
    if (orcamento) onViewOrcamento(orcamento);
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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          { label: "Sem retorno", value: kpis.semRetorno, icon: MessageCircle, color: "text-gray-600" },
          { label: "Retorno hoje", value: kpis.hoje, icon: CalendarDays, color: "text-blue-600" },
          { label: "Atrasados", value: kpis.atrasados, icon: AlertTriangle, color: "text-destructive" },
          { label: "Em negociacao", value: kpis.emNegociacao, icon: Users, color: "text-amber-600" },
          { label: "Aguardando", value: kpis.aguardando, icon: Clock, color: "text-purple-600" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-dashed">
            <CardContent className="flex items-center gap-2.5 p-3">
              <kpi.icon className={cn("h-4 w-4 shrink-0", kpi.color)} />
              <div>
                <p className="text-lg font-bold leading-none text-foreground">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou numero..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 bg-background pl-9 text-xs"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-full text-xs sm:w-[180px]">
                <SelectValue placeholder="Status do acompanhamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  Todos (exceto concluido)
                </SelectItem>
                {allStatuses.map((status) => (
                  <SelectItem key={status} value={status} className="text-xs">
                    {STATUS_FOLLOWUP_CONFIG[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {responsaveis.length > 0 && (
              <Select value={filterResponsavel} onValueChange={setFilterResponsavel}>
                <SelectTrigger className="h-9 w-full text-xs sm:w-[170px]">
                  <SelectValue placeholder="Responsavel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    Todos
                  </SelectItem>
                  {responsaveis.map((responsavel) => (
                    <SelectItem key={responsavel} value={responsavel} className="text-xs">
                      {responsavel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as QueueSort)}>
              <SelectTrigger className="h-9 w-full text-xs sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prioridade" className="text-xs">
                  Prioridade comercial
                </SelectItem>
                <SelectItem value="data_criacao" className="text-xs">
                  Mais recentes
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sortBy === "prioridade" && (
            <div className="mt-2 space-y-1">
              <p className="text-[11px] text-muted-foreground">
                A ordem padrao destaca atrasados, retornos de hoje e orcamentos que ainda nao receberam acompanhamento.
              </p>
              <p className="text-[11px] text-muted-foreground">
                A fila comercial mostra somente orcamentos pendentes que ainda estao em negociacao.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum orcamento pendente na fila</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Ajuste os filtros ou registre um novo acompanhamento.
            </p>
          </CardContent>
        </Card>
      ) : !isMobile ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="w-16 px-3 py-2.5 font-semibold">#</th>
                  <th className="px-3 py-2.5 font-semibold">Cliente</th>
                  <th className="w-32 px-3 py-2.5 font-semibold">Acompanhamento</th>
                  <th className="w-28 px-3 py-2.5 text-right font-semibold">Valor</th>
                  <th className="w-28 px-3 py-2.5 font-semibold">Retorno</th>
                  <th className="w-32 px-3 py-2.5 font-semibold">Responsavel</th>
                  <th className="w-32 px-3 py-2.5 font-semibold">Ultima interacao</th>
                  <th className="w-10 px-3 py-2.5 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const statusConfig = STATUS_FOLLOWUP_CONFIG[item.statusFollowUp];
                  const retornoTs = getDayTimestamp(item.dataRetorno);
                  const isOverdue = retornoTs !== null && retornoTs < todayTs && item.statusFollowUp !== "concluido";
                  const isToday = retornoTs !== null && retornoTs === todayTs;
                  const needsFirstTouch = !item.dataRetorno && item.statusFollowUp === "sem_retorno";

                  return (
                    <tr
                      key={item.orcamentoId}
                      className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/30"
                      onClick={() => handleView(item)}
                    >
                      <td className="px-3 py-3 text-sm font-bold text-primary">#{item.numeroOrcamento}</td>
                      <td className="max-w-[200px] truncate px-3 py-3 font-medium text-foreground">
                        {item.nomeCliente}
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="outline" className={cn("text-[10px]", statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-right font-bold tabular-nums">{formatCurrency(item.valorFinal)}</td>
                      <td className="px-3 py-3 text-xs tabular-nums">
                        <span
                          className={cn(
                            isOverdue && "font-semibold text-destructive",
                            isToday && "font-semibold text-amber-600",
                            needsFirstTouch && "font-semibold text-amber-700",
                            !isOverdue && !isToday && !needsFirstTouch && "text-muted-foreground",
                          )}
                        >
                          {getRetornoLabel(item)}
                          {isOverdue && " (atrasado)"}
                          {isToday && " (hoje)"}
                          {needsFirstTouch && " (primeiro contato)"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {item.responsavelNome || "Sem responsavel"}
                      </td>
                      <td className="px-3 py-3 text-xs tabular-nums text-muted-foreground">
                        {item.ultimaInteracaoEm ? fmtDate(item.ultimaInteracaoEm) : "Sem historico"}
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleView(item);
                          }}
                        >
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
          {filtered.map((item) => {
            const statusConfig = STATUS_FOLLOWUP_CONFIG[item.statusFollowUp];
            const retornoTs = getDayTimestamp(item.dataRetorno);
            const isOverdue = retornoTs !== null && retornoTs < todayTs && item.statusFollowUp !== "concluido";
            const isToday = retornoTs !== null && retornoTs === todayTs;
            const needsFirstTouch = !item.dataRetorno && item.statusFollowUp === "sem_retorno";

            return (
              <Card
                key={item.orcamentoId}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => handleView(item)}
              >
                <CardContent className="p-3.5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">#{item.numeroOrcamento}</span>
                    <Badge variant="outline" className={cn("text-[10px]", statusConfig.color)}>
                      {statusConfig.label}
                    </Badge>
                    <span className="flex-1" />
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {formatCurrency(item.valorFinal)}
                    </span>
                  </div>

                  <p className="mb-1.5 truncate text-sm font-medium text-foreground">{item.nomeCliente}</p>

                  <div className="flex items-center gap-3 border-t border-border/50 pt-1.5 text-[11px] text-muted-foreground">
                    <span
                      className={cn(
                        isOverdue && "font-medium text-destructive",
                        isToday && "font-medium text-amber-600",
                        needsFirstTouch && "font-medium text-amber-700",
                      )}
                    >
                      Retorno: {getRetornoLabel(item)}
                      {isOverdue && " (atrasado)"}
                      {isToday && " (hoje)"}
                      {needsFirstTouch && " (primeiro contato)"}
                    </span>
                    <span>{item.responsavelNome || "Sem responsavel"}</span>
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
