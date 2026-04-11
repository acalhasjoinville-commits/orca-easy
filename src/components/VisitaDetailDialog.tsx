import { CalendarDays, Check, MapPin, Pencil, Phone, RefreshCcw, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateVisita } from "@/hooks/useVisitas";
import { STATUS_VISITA_CONFIG, StatusVisita, Visita } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VisitaDetailDialogProps {
  visita: Visita | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onReschedule?: () => void;
}

export function VisitaDetailDialog({
  visita,
  open,
  onOpenChange,
  onEdit,
  onReschedule,
}: VisitaDetailDialogProps) {
  const updateVisita = useUpdateVisita();

  if (!visita) return null;

  const cfg = STATUS_VISITA_CONFIG[visita.status];
  const whatsLink = `https://wa.me/55${visita.telefone.replace(/\D/g, "")}`;
  const canChangeStatus = visita.status === "agendada" || visita.status === "reagendada";

  const handleStatus = async (status: StatusVisita) => {
    try {
      await updateVisita.mutateAsync({
        id: visita.id,
        input: {
          nomeCliente: visita.nomeCliente,
          telefone: visita.telefone,
          enderecoCompleto: visita.enderecoCompleto,
          bairro: visita.bairro,
          cidade: visita.cidade,
          complemento: visita.complemento,
          pontoReferencia: visita.pontoReferencia,
          tipoServico: visita.tipoServico,
          observacoes: visita.observacoes,
          responsavelId: visita.responsavelId,
          responsavelNome: visita.responsavelNome,
          origemContato: visita.origemContato,
          dataVisita: visita.dataVisita,
          horaVisita: visita.horaVisita.slice(0, 5),
          status,
          clienteId: visita.clienteId,
          orcamentoId: visita.orcamentoId,
        },
      });
      toast.success(`Visita marcada como ${STATUS_VISITA_CONFIG[status].label.toLowerCase()}.`);
      onOpenChange(false);
    } catch {
      toast.error("Erro ao atualizar a visita.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da visita</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground">{visita.nomeCliente}</h3>
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
              <div className="min-w-0">
                <p className="text-foreground">{visita.enderecoCompleto}</p>
                {(visita.bairro || visita.cidade) && (
                  <p className="text-muted-foreground">
                    {[visita.bairro, visita.cidade].filter(Boolean).join(" • ")}
                  </p>
                )}
                {visita.complemento && <p className="text-muted-foreground">Complemento: {visita.complemento}</p>}
                {visita.pontoReferencia && <p className="text-muted-foreground">Referência: {visita.pontoReferencia}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(`${visita.dataVisita}T00:00:00`).toLocaleDateString("pt-BR")} às {visita.horaVisita.slice(0, 5)}
              </span>
            </div>

            {visita.tipoServico && <p className="text-muted-foreground">Tipo de serviço: {visita.tipoServico}</p>}
            {visita.origemContato && <p className="text-muted-foreground">Origem do contato: {visita.origemContato}</p>}
            {visita.responsavelNome && <p className="text-muted-foreground">Responsável: {visita.responsavelNome}</p>}

            {visita.observacoes && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">Observações</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{visita.observacoes}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {onEdit && (
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </Button>
            )}

            {onReschedule && canChangeStatus && (
              <Button size="sm" variant="outline" onClick={onReschedule}>
                <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
                Reagendar
              </Button>
            )}

            {canChangeStatus && (
              <>
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
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
