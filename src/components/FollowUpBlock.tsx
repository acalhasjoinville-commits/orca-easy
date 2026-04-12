import { useState } from "react";
import { useFollowUp, useTeamMembers } from "@/hooks/useFollowUp";
import { StatusFollowUp, TipoInteracao, STATUS_FOLLOWUP_CONFIG, TIPO_INTERACAO_CONFIG } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  MessageSquarePlus,
  Clock,
  User,
  CalendarDays,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getTodayLocal, toLocalDateStr } from "@/lib/dateUtils";

interface FollowUpBlockProps {
  orcamentoId: string;
  readOnly?: boolean;
}

const allStatuses = Object.keys(STATUS_FOLLOWUP_CONFIG) as StatusFollowUp[];
const allTipos = Object.keys(TIPO_INTERACAO_CONFIG) as TipoInteracao[];
const statusByInteractionType: Partial<Record<TipoInteracao, StatusFollowUp>> = {
  retorno_agendado: "agendado",
  negociacao: "em_negociacao",
  cliente_sem_resposta: "aguardando_cliente",
  aprovado: "concluido",
  encerrado: "concluido",
};

function formatShortDate(value: string | null | undefined) {
  const localDate = toLocalDateStr(value);
  if (!localDate) return null;
  const [year, month, day] = localDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
}

export function FollowUpBlock({ orcamentoId, readOnly = false }: FollowUpBlockProps) {
  const { followUp, isLoading, upsertFollowUp, logs, logsLoading, addLog } = useFollowUp(orcamentoId);
  const { data: teamMembers = [] } = useTeamMembers();

  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<StatusFollowUp>("sem_retorno");
  const [editProximaAcao, setEditProximaAcao] = useState("");
  const [editDataRetorno, setEditDataRetorno] = useState("");
  const [editObservacoes, setEditObservacoes] = useState("");
  const [editResponsavelId, setEditResponsavelId] = useState<string | null>(null);

  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logTipo, setLogTipo] = useState<TipoInteracao>("contato");
  const [logDescricao, setLogDescricao] = useState("");
  const [logDataRetorno, setLogDataRetorno] = useState("");
  const [showAllLogs, setShowAllLogs] = useState(false);

  const resetLogForm = () => {
    setLogTipo("contato");
    setLogDescricao("");
    setLogDataRetorno("");
  };

  const startEdit = () => {
    setEditStatus(followUp.statusFollowUp);
    setEditProximaAcao(followUp.proximaAcao);
    setEditDataRetorno(followUp.dataRetorno || "");
    setEditObservacoes(followUp.observacoes);
    setEditResponsavelId(followUp.responsavelId);
    setEditing(true);
  };

  const saveEdit = async () => {
    try {
      await upsertFollowUp.mutateAsync({
        statusFollowUp: editStatus,
        proximaAcao: editProximaAcao,
        dataRetorno: editDataRetorno || null,
        observacoes: editObservacoes,
        responsavelId: editResponsavelId,
      });
      toast.success("Acompanhamento atualizado");
      setEditing(false);
    } catch {
      toast.error("Erro ao salvar acompanhamento");
    }
  };

  const handleAddLog = async () => {
    if (!logDescricao.trim()) {
      toast.error("Preencha a descrição");
      return;
    }

    const nextStatus = statusByInteractionType[logTipo];
    const nextDataRetorno =
      logTipo === "retorno_agendado" ? logDataRetorno || followUp.dataRetorno : followUp.dataRetorno;

    if (logTipo === "retorno_agendado" && !nextDataRetorno) {
      toast.error("Defina a data do retorno para agendar o acompanhamento.");
      return;
    }

    try {
      if (nextStatus) {
        await upsertFollowUp.mutateAsync({
          statusFollowUp: nextStatus,
          proximaAcao: nextStatus === "concluido" ? "" : followUp.proximaAcao,
          dataRetorno: nextStatus === "concluido" ? null : nextDataRetorno,
          observacoes: followUp.observacoes,
          responsavelId: followUp.responsavelId,
        });
      }

      await addLog.mutateAsync({ tipo: logTipo, descricao: logDescricao.trim() });
      toast.success(nextStatus ? "Interação registrada e acompanhamento atualizado" : "Interação registrada");
      setShowLogDialog(false);
      resetLogForm();
    } catch {
      toast.error("Erro ao registrar interação");
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="flex items-center justify-center py-8 p-5">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const stConfig = STATUS_FOLLOWUP_CONFIG[followUp.statusFollowUp];
  const displayedLogs = showAllLogs ? logs : logs.slice(0, 5);
  const retornoLocal = toLocalDateStr(followUp.dataRetorno);
  const todayLocal = getTodayLocal();
  const isOverdue = retornoLocal ? retornoLocal < todayLocal : false;
  const isToday = retornoLocal ? retornoLocal === todayLocal : false;

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Acompanhamento Comercial</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setShowLogDialog(true)}
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Registrar Interação
              </Button>
              {!editing && (
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={startEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {!editing ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={cn("text-[11px]", stConfig.color)}>
                    {stConfig.label}
                  </Badge>
                </div>
                {followUp.proximaAcao && (
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 text-xs text-muted-foreground">Proxima acao:</span>
                    <span className="text-xs text-foreground">{followUp.proximaAcao}</span>
                  </div>
                )}
                {followUp.dataRetorno && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3 w-3 text-muted-foreground" />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isOverdue && "text-destructive",
                        isToday && "text-amber-600",
                        !isOverdue && !isToday && "text-foreground",
                      )}
                    >
                      Retorno: {formatShortDate(followUp.dataRetorno)}
                      {isOverdue && " (atrasado)"}
                      {isToday && " (hoje)"}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {followUp.responsavelNome && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-foreground">{followUp.responsavelNome}</span>
                  </div>
                )}
                {followUp.ultimaInteracaoEm && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Ultima interacao:{" "}
                      {new Date(followUp.ultimaInteracaoEm).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                {followUp.observacoes && <p className="text-xs italic text-muted-foreground">{followUp.observacoes}</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Status do Follow-up</label>
                  <Select value={editStatus} onValueChange={(v) => setEditStatus(v as StatusFollowUp)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allStatuses.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {STATUS_FOLLOWUP_CONFIG[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Data de Retorno</label>
                  <Input
                    type="date"
                    value={editDataRetorno}
                    onChange={(e) => setEditDataRetorno(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Responsavel</label>
                  <Select
                    value={editResponsavelId || "_none"}
                    onValueChange={(v) => setEditResponsavelId(v === "_none" ? null : v)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none" className="text-xs">
                        Nenhum
                      </SelectItem>
                      {teamMembers.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-xs">
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Proxima Acao</label>
                <Input
                  value={editProximaAcao}
                  onChange={(e) => setEditProximaAcao(e.target.value)}
                  placeholder="Ex: Ligar para confirmar aprovacao"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Observacoes</label>
                <Textarea
                  value={editObservacoes}
                  onChange={(e) => setEditObservacoes(e.target.value)}
                  placeholder="Notas internas sobre o andamento..."
                  className="min-h-[60px] text-xs"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" className="h-8 gap-1 text-xs" onClick={saveEdit} disabled={upsertFollowUp.isPending}>
                  {upsertFollowUp.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Salvar
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => setEditing(false)}>
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-0">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Historico de Interacoes
                </p>
                {displayedLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 border-b border-border/50 py-2 last:border-0">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <MessageCircle className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">
                          {TIPO_INTERACAO_CONFIG[log.tipo]?.label ?? log.tipo}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{log.descricao}</p>
                      {log.userName && <span className="text-[10px] text-muted-foreground/70">por {log.userName}</span>}
                    </div>
                  </div>
                ))}
                {logs.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-7 w-full gap-1 text-xs text-muted-foreground"
                    onClick={() => setShowAllLogs(!showAllLogs)}
                  >
                    {showAllLogs ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {showAllLogs ? "Mostrar menos" : `Ver todas (${logs.length})`}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showLogDialog}
        onOpenChange={(open) => {
          setShowLogDialog(open);
          if (!open) resetLogForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Registrar Interacao</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Tipo</label>
              <Select value={logTipo} onValueChange={(v) => setLogTipo(v as TipoInteracao)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allTipos.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {TIPO_INTERACAO_CONFIG[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {statusByInteractionType[logTipo] && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Ao registrar, o status passara para{" "}
                  <span className="font-medium text-foreground">
                    {STATUS_FOLLOWUP_CONFIG[statusByInteractionType[logTipo]!].label}
                  </span>
                  .
                </p>
              )}
            </div>
            {logTipo === "retorno_agendado" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Data do retorno</label>
                <Input
                  type="date"
                  value={logDataRetorno}
                  onChange={(e) => setLogDataRetorno(e.target.value)}
                  className="h-9 text-xs"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Essa data sera usada para colocar o retorno corretamente na fila e na agenda comercial.
                </p>
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Descricao</label>
              <Textarea
                value={logDescricao}
                onChange={(e) => setLogDescricao(e.target.value)}
                placeholder="Descreva o que aconteceu..."
                className="min-h-[80px] text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowLogDialog(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleAddLog}
              disabled={addLog.isPending || upsertFollowUp.isPending}
              className="gap-1"
            >
              {(addLog.isPending || upsertFollowUp.isPending) && <Loader2 className="h-3 w-3 animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
