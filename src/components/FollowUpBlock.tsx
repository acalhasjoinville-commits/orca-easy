import { useState } from 'react';
import { useFollowUp, useTeamMembers } from '@/hooks/useFollowUp';
import {
  StatusFollowUp,
  TipoInteracao,
  STATUS_FOLLOWUP_CONFIG,
  TIPO_INTERACAO_CONFIG,
} from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FollowUpBlockProps {
  orcamentoId: string;
}

const allStatuses = Object.keys(STATUS_FOLLOWUP_CONFIG) as StatusFollowUp[];
const allTipos = Object.keys(TIPO_INTERACAO_CONFIG) as TipoInteracao[];

export function FollowUpBlock({ orcamentoId }: FollowUpBlockProps) {
  const { followUp, isLoading, upsertFollowUp, logs, logsLoading, addLog } = useFollowUp(orcamentoId);
  const { data: teamMembers = [] } = useTeamMembers();

  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<StatusFollowUp>('sem_retorno');
  const [editProximaAcao, setEditProximaAcao] = useState('');
  const [editDataRetorno, setEditDataRetorno] = useState('');
  const [editObservacoes, setEditObservacoes] = useState('');
  const [editResponsavelId, setEditResponsavelId] = useState<string | null>(null);

  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logTipo, setLogTipo] = useState<TipoInteracao>('contato');
  const [logDescricao, setLogDescricao] = useState('');
  const [showAllLogs, setShowAllLogs] = useState(false);

  const startEdit = () => {
    setEditStatus(followUp.statusFollowUp);
    setEditProximaAcao(followUp.proximaAcao);
    setEditDataRetorno(followUp.dataRetorno || '');
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
      toast.success('Follow-up atualizado');
      setEditing(false);
    } catch {
      toast.error('Erro ao salvar follow-up');
    }
  };

  const handleAddLog = async () => {
    if (!logDescricao.trim()) {
      toast.error('Preencha a descrição');
      return;
    }
    try {
      await addLog.mutateAsync({ tipo: logTipo, descricao: logDescricao.trim() });
      toast.success('Interação registrada');
      setShowLogDialog(false);
      setLogDescricao('');
      setLogTipo('contato');
    } catch {
      toast.error('Erro ao registrar interação');
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-5 flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const stConfig = STATUS_FOLLOWUP_CONFIG[followUp.statusFollowUp];
  const displayedLogs = showAllLogs ? logs : logs.slice(0, 5);

  const isOverdue = followUp.dataRetorno && new Date(followUp.dataRetorno) < new Date(new Date().toDateString());
  const isToday = followUp.dataRetorno && new Date(followUp.dataRetorno).toDateString() === new Date().toDateString();

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Acompanhamento Comercial</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5" onClick={() => setShowLogDialog(true)}>
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Registrar Interação
              </Button>
              {!editing && (
                <Button variant="ghost" size="sm" className="text-xs h-8 gap-1" onClick={startEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Current state */}
          {!editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={cn('text-[11px]', stConfig.color)}>{stConfig.label}</Badge>
                </div>
                {followUp.proximaAcao && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">Próxima ação:</span>
                    <span className="text-xs text-foreground">{followUp.proximaAcao}</span>
                  </div>
                )}
                {followUp.dataRetorno && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3 w-3 text-muted-foreground" />
                    <span className={cn(
                      'text-xs font-medium',
                      isOverdue && 'text-destructive',
                      isToday && 'text-amber-600',
                      !isOverdue && !isToday && 'text-foreground'
                    )}>
                      Retorno: {new Date(followUp.dataRetorno).toLocaleDateString('pt-BR')}
                      {isOverdue && ' (atrasado)'}
                      {isToday && ' (hoje)'}
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
                      Última interação: {new Date(followUp.ultimaInteracaoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {followUp.observacoes && (
                  <p className="text-xs text-muted-foreground italic">{followUp.observacoes}</p>
                )}
              </div>
            </div>
          ) : (
            /* Editing form */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Status do Follow-up</label>
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
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Data de Retorno</label>
                  <Input
                    type="date"
                    value={editDataRetorno}
                    onChange={(e) => setEditDataRetorno(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Próxima Ação</label>
                <Input
                  value={editProximaAcao}
                  onChange={(e) => setEditProximaAcao(e.target.value)}
                  placeholder="Ex: Ligar para confirmar aprovação"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Observações</label>
                <Textarea
                  value={editObservacoes}
                  onChange={(e) => setEditObservacoes(e.target.value)}
                  placeholder="Notas internas sobre o andamento..."
                  className="text-xs min-h-[60px]"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" className="text-xs h-8 gap-1" onClick={saveEdit} disabled={upsertFollowUp.isPending}>
                  {upsertFollowUp.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Salvar
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-8 gap-1" onClick={() => setEditing(false)}>
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Timeline */}
          {logs.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-0">
                <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Histórico de Interações</p>
                {displayedLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 py-2 border-b border-border/50 last:border-0">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted shrink-0 mt-0.5">
                      <MessageCircle className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-foreground">
                          {TIPO_INTERACAO_CONFIG[log.tipo]?.label ?? log.tipo}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{log.descricao}</p>
                      {log.userName && (
                        <span className="text-[10px] text-muted-foreground/70">por {log.userName}</span>
                      )}
                    </div>
                  </div>
                ))}
                {logs.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 w-full mt-1 gap-1 text-muted-foreground"
                    onClick={() => setShowAllLogs(!showAllLogs)}
                  >
                    {showAllLogs ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {showAllLogs ? 'Mostrar menos' : `Ver todas (${logs.length})`}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Registrar Interação */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Registrar Interação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo</label>
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
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
              <Textarea
                value={logDescricao}
                onChange={(e) => setLogDescricao(e.target.value)}
                placeholder="Descreva o que aconteceu..."
                className="text-xs min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowLogDialog(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAddLog} disabled={addLog.isPending} className="gap-1">
              {addLog.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
