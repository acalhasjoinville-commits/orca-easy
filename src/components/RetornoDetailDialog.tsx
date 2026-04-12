import { RetornoServico, STATUS_RETORNO_CONFIG, TIPO_RETORNO_CONFIG, StatusRetorno } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, User, RotateCcw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateRetorno } from "@/hooks/useRetornosServico";
import { useTeamMembers } from "@/hooks/useFollowUp";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { toLocalDateStr, getTodayLocal } from "@/lib/dateUtils";

interface RetornoDetailDialogProps {
  retorno: RetornoServico | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenOrcamento?: () => void;
}

const editableStatuses: StatusRetorno[] = ["aberto", "agendado", "em_atendimento", "resolvido", "encerrado", "cancelado"];

export function RetornoDetailDialog({ retorno, open, onOpenChange, onOpenOrcamento }: RetornoDetailDialogProps) {
  const updateRetorno = useUpdateRetorno();
  const { data: teamMembers } = useTeamMembers();

  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<StatusRetorno>("aberto");
  const [editDataRetorno, setEditDataRetorno] = useState("");
  const [editHoraRetorno, setEditHoraRetorno] = useState("");
  const [editResponsavelId, setEditResponsavelId] = useState("");
  const [editObservacoes, setEditObservacoes] = useState("");
  const [editResolucao, setEditResolucao] = useState("");

  useEffect(() => {
    if (retorno && open) {
      setEditing(false);
      setEditStatus(retorno.status);
      setEditDataRetorno(retorno.dataRetorno ?? "");
      setEditHoraRetorno(retorno.horaRetorno?.slice(0, 5) ?? "");
      setEditResponsavelId(retorno.responsavelId ?? "");
      setEditObservacoes(retorno.observacoes);
      setEditResolucao(retorno.resolucao);
    }
  }, [retorno, open]);

  if (!retorno) return null;

  const stConfig = STATUS_RETORNO_CONFIG[retorno.status];
  const tipoConfig = TIPO_RETORNO_CONFIG[retorno.tipo];
  const retornoDate = toLocalDateStr(retorno.dataRetorno);
  const isOverdue = retornoDate ? retornoDate < getTodayLocal() : false;

  const handleSave = async () => {
    if (editStatus === "agendado" && !editDataRetorno) {
      toast.error("Defina a data do retorno para agendar.");
      return;
    }
    if (editStatus === "resolvido" && !editResolucao.trim()) {
      toast.error("Descreva a resolução.");
      return;
    }

    try {
      await updateRetorno.mutateAsync({
        id: retorno.id,
        orcamentoId: retorno.orcamentoId,
        status: editStatus,
        dataRetorno: editDataRetorno || null,
        horaRetorno: editHoraRetorno || null,
        responsavelId: editResponsavelId || null,
        observacoes: editObservacoes,
        resolucao: editResolucao,
      });
      toast.success("Retorno atualizado");
      setEditing(false);
    } catch {
      toast.error("Erro ao atualizar retorno");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <RotateCcw className="h-4 w-4 text-primary" />
            Retorno do serviço
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-[10px]", stConfig.color)}>
              {stConfig.label}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {tipoConfig.label}
            </Badge>
            {isOverdue && (
              <span className="flex items-center gap-1 text-[10px] text-destructive font-medium">
                <AlertTriangle className="h-3 w-3" />
                Atrasado
              </span>
            )}
          </div>

          <p className="text-sm text-foreground">{retorno.descricao}</p>

          {!editing ? (
            <>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {retorno.dataRetorno && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(retorno.dataRetorno + "T00:00:00").toLocaleDateString("pt-BR")}
                    {retorno.horaRetorno && ` às ${retorno.horaRetorno.slice(0, 5)}`}
                  </span>
                )}
                {retorno.responsavelNome && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {retorno.responsavelNome}
                  </span>
                )}
              </div>

              {retorno.observacoes && (
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Observações</p>
                  <p className="text-xs text-foreground">{retorno.observacoes}</p>
                </div>
              )}

              {retorno.resolucao && (
                <div className="rounded bg-emerald-500/10 px-2.5 py-1.5">
                  <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Resolução</p>
                  <p className="text-xs text-foreground">{retorno.resolucao}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setEditing(true)}>
                  Editar
                </Button>
                {onOpenOrcamento && (
                  <Button variant="ghost" size="sm" className="text-xs" onClick={onOpenOrcamento}>
                    Ver orçamento
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground">Status</label>
                  <Select value={editStatus} onValueChange={(v) => setEditStatus(v as StatusRetorno)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {editableStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_RETORNO_CONFIG[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Data do retorno</label>
                  <Input
                    type="date"
                    className="h-8 text-xs"
                    value={editDataRetorno}
                    onChange={(e) => setEditDataRetorno(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground">Hora</label>
                  <Input
                    type="time"
                    className="h-8 text-xs"
                    value={editHoraRetorno}
                    onChange={(e) => setEditHoraRetorno(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Responsável</label>
                  <Select value={editResponsavelId} onValueChange={setEditResponsavelId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {(teamMembers ?? []).map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground">Observações</label>
                <Textarea
                  className="text-xs min-h-[60px]"
                  value={editObservacoes}
                  onChange={(e) => setEditObservacoes(e.target.value)}
                />
              </div>

              {(editStatus === "resolvido" || editStatus === "encerrado") && (
                <div>
                  <label className="text-[11px] text-muted-foreground">
                    Resolução {editStatus === "resolvido" ? "*" : ""}
                  </label>
                  <Textarea
                    className="text-xs min-h-[60px]"
                    value={editResolucao}
                    onChange={(e) => setEditResolucao(e.target.value)}
                    placeholder="Descreva como o retorno foi resolvido"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
                <Button size="sm" className="text-xs" onClick={handleSave} disabled={updateRetorno.isPending}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
