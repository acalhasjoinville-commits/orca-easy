import { useState } from "react";
import { useRetornosByOrcamento, useAddRetorno, useUpdateRetorno } from "@/hooks/useRetornosServico";
import { useTeamMembers } from "@/hooks/useFollowUp";
import { RetornoServico, StatusRetorno, TipoRetorno, STATUS_RETORNO_CONFIG, TIPO_RETORNO_CONFIG } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, Plus, Clock, User, CalendarDays, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toLocalDateStr, getTodayLocal } from "@/lib/dateUtils";

interface RetornosServicoBlockProps {
  orcamentoId: string;
}

const allTipos = Object.keys(TIPO_RETORNO_CONFIG) as TipoRetorno[];
const allStatuses = Object.keys(STATUS_RETORNO_CONFIG) as StatusRetorno[];
const editableStatuses: StatusRetorno[] = ["aberto", "agendado", "em_atendimento", "resolvido"];

export function RetornosServicoBlock({ orcamentoId }: RetornosServicoBlockProps) {
  const { data: retornos, isLoading } = useRetornosByOrcamento(orcamentoId);
  const addRetorno = useAddRetorno();
  const updateRetorno = useUpdateRetorno();
  const { data: teamMembers } = useTeamMembers();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add form state
  const [addTipo, setAddTipo] = useState<TipoRetorno>("outro");
  const [addDescricao, setAddDescricao] = useState("");
  const [addDataRetorno, setAddDataRetorno] = useState("");
  const [addHoraRetorno, setAddHoraRetorno] = useState("");
  const [addResponsavelId, setAddResponsavelId] = useState("");
  const [addObservacoes, setAddObservacoes] = useState("");
  const [addStatus, setAddStatus] = useState<StatusRetorno>("aberto");

  // Edit form state
  const [editStatus, setEditStatus] = useState<StatusRetorno>("aberto");
  const [editDataRetorno, setEditDataRetorno] = useState("");
  const [editHoraRetorno, setEditHoraRetorno] = useState("");
  const [editResponsavelId, setEditResponsavelId] = useState("");
  const [editObservacoes, setEditObservacoes] = useState("");
  const [editResolucao, setEditResolucao] = useState("");

  const resetAddForm = () => {
    setAddTipo("outro");
    setAddDescricao("");
    setAddDataRetorno("");
    setAddHoraRetorno("");
    setAddResponsavelId("");
    setAddObservacoes("");
    setAddStatus("aberto");
  };

  const handleAdd = async () => {
    if (!addDescricao.trim()) {
      toast.error("Preencha a descrição do retorno.");
      return;
    }
    if (addStatus === "agendado" && !addDataRetorno) {
      toast.error("Defina a data do retorno para agendar.");
      return;
    }

    try {
      await addRetorno.mutateAsync({
        orcamentoId,
        tipo: addTipo,
        status: addStatus,
        descricao: addDescricao.trim(),
        dataRetorno: addDataRetorno || null,
        horaRetorno: addHoraRetorno || null,
        responsavelId: addResponsavelId || null,
        observacoes: addObservacoes.trim(),
      });
      toast.success("Retorno registrado");
      setShowAddDialog(false);
      resetAddForm();
    } catch {
      toast.error("Erro ao registrar retorno");
    }
  };

  const startEdit = (retorno: RetornoServico) => {
    setEditingId(retorno.id);
    setEditStatus(retorno.status);
    setEditDataRetorno(retorno.dataRetorno ?? "");
    setEditHoraRetorno(retorno.horaRetorno?.slice(0, 5) ?? "");
    setEditResponsavelId(retorno.responsavelId ?? "");
    setEditObservacoes(retorno.observacoes);
    setEditResolucao(retorno.resolucao);
  };

  const handleUpdate = async (retorno: RetornoServico) => {
    if (editStatus === "agendado" && !editDataRetorno) {
      toast.error("Defina a data do retorno para agendar.");
      return;
    }
    if (editStatus === "resolvido" && !editResolucao.trim()) {
      toast.error("Descreva a resolução para marcar como resolvido.");
      return;
    }

    try {
      await updateRetorno.mutateAsync({
        id: retorno.id,
        orcamentoId,
        status: editStatus,
        dataRetorno: editDataRetorno || null,
        horaRetorno: editHoraRetorno || null,
        responsavelId: editResponsavelId || null,
        observacoes: editObservacoes,
        resolucao: editResolucao,
      });
      toast.success("Retorno atualizado");
      setEditingId(null);
    } catch {
      toast.error("Erro ao atualizar retorno");
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="flex items-center gap-2 p-5">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Carregando retornos...</span>
        </CardContent>
      </Card>
    );
  }

  const active = (retornos ?? []).filter((r) => r.status !== "encerrado" && r.status !== "cancelado");
  const closed = (retornos ?? []).filter((r) => r.status === "encerrado" || r.status === "cancelado");
  const hoje = getTodayLocal();

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Retornos do serviço</h2>
              {active.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {active.length} ativo{active.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-3.5 w-3.5" />
              Abrir retorno
            </Button>
          </div>

          {active.length === 0 && closed.length === 0 && (
            <div className="flex items-center gap-2 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Nenhum retorno registrado para este orçamento.</span>
            </div>
          )}

          {active.length > 0 && (
            <div className="space-y-3">
              {active.map((retorno) => {
                const stConfig = STATUS_RETORNO_CONFIG[retorno.status];
                const tipoConfig = TIPO_RETORNO_CONFIG[retorno.tipo];
                const isEditing = editingId === retorno.id;
                const retornoDate = toLocalDateStr(retorno.dataRetorno);
                const isOverdue = retornoDate ? retornoDate < hoje : false;

                return (
                  <div key={retorno.id} className="rounded-lg border bg-muted/20 p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
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
                      {!isEditing && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => startEdit(retorno)}>
                          Editar
                        </Button>
                      )}
                    </div>

                    <p className="text-sm text-foreground mb-2">{retorno.descricao}</p>

                    {isEditing ? (
                      <div className="space-y-3 mt-3">
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
                                <SelectItem value="encerrado">Encerrado</SelectItem>
                                <SelectItem value="cancelado">Cancelado</SelectItem>
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
                            <Select
                              value={editResponsavelId || "_none"}
                              onValueChange={(value) => setEditResponsavelId(value === "_none" ? "" : value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Selecionar" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="_none">Nenhum</SelectItem>
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
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingId(null)}>
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleUpdate(retorno)}
                            disabled={updateRetorno.isPending}
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
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
                    )}

                    {retorno.resolucao && !isEditing && (
                      <div className="mt-2 rounded bg-emerald-500/10 px-2.5 py-1.5">
                        <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Resolução</p>
                        <p className="text-xs text-foreground">{retorno.resolucao}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {closed.length > 0 && (
            <>
              <Separator className="my-4" />
              <p className="text-[11px] font-medium text-muted-foreground mb-2">
                Encerrados / Cancelados ({closed.length})
              </p>
              <div className="space-y-2">
                {closed.slice(0, 3).map((retorno) => {
                  const stConfig = STATUS_RETORNO_CONFIG[retorno.status];
                  const tipoConfig = TIPO_RETORNO_CONFIG[retorno.tipo];
                  return (
                    <div key={retorno.id} className="rounded-lg border bg-muted/10 p-2.5 opacity-70">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={cn("text-[10px]", stConfig.color)}>
                          {stConfig.label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {tipoConfig.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{retorno.descricao}</p>
                      {retorno.resolucao && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">✓ {retorno.resolucao}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Abrir retorno do serviço</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Tipo *</label>
                <Select value={addTipo} onValueChange={(v) => setAddTipo(v as TipoRetorno)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allTipos.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TIPO_RETORNO_CONFIG[t].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status inicial</label>
                <Select value={addStatus} onValueChange={(v) => setAddStatus(v as StatusRetorno)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Descrição *</label>
              <Textarea
                className="text-xs min-h-[80px]"
                value={addDescricao}
                onChange={(e) => setAddDescricao(e.target.value)}
                placeholder="Descreva o motivo do retorno"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">
                  Data do retorno {addStatus === "agendado" ? "*" : ""}
                </label>
                <Input
                  type="date"
                  className="h-9 text-xs"
                  value={addDataRetorno}
                  onChange={(e) => setAddDataRetorno(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Hora</label>
                <Input
                  type="time"
                  className="h-9 text-xs"
                  value={addHoraRetorno}
                  onChange={(e) => setAddHoraRetorno(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Responsável</label>
              <Select
                value={addResponsavelId || "_none"}
                onValueChange={(value) => setAddResponsavelId(value === "_none" ? "" : value)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Selecionar responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Nenhum</SelectItem>
                  {(teamMembers ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Observações</label>
              <Textarea
                className="text-xs min-h-[60px]"
                value={addObservacoes}
                onChange={(e) => setAddObservacoes(e.target.value)}
                placeholder="Informações adicionais (opcional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddDialog(false);
                resetAddForm();
              }}
            >
              Cancelar
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={addRetorno.isPending}>
              {addRetorno.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Registrar retorno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
