import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, X, MessageSquare, Loader2 } from "lucide-react";
import { useCommentPublicOrcamento, useRespondPublicOrcamento } from "@/hooks/useShareLink";
import { toast } from "sonner";

interface Props {
  token: string;
}

export function PortalActionBar({ token }: Props) {
  const respond = useRespondPublicOrcamento(token);
  const comment = useCommentPublicOrcamento(token);

  const [rejectComment, setRejectComment] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);

  async function handleApprove() {
    try {
      await respond.mutateAsync({ action: "aprovar" });
      toast.success("Orçamento aprovado! O fornecedor foi notificado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível aprovar.");
    }
  }

  async function handleReject() {
    try {
      await respond.mutateAsync({ action: "rejeitar", comment: rejectComment });
      toast.success("Resposta registrada. Obrigado pelo retorno!");
      setRejectComment("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível registrar.");
    }
  }

  async function handleComment() {
    const v = commentText.trim();
    if (!v) {
      toast.error("Escreva o seu comentário antes de enviar.");
      return;
    }
    try {
      await comment.mutateAsync({ comment: v });
      toast.success("Comentário enviado!");
      setCommentText("");
      setCommentOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar.");
    }
  }

  const busy = respond.isPending || comment.isPending;

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h3 className="mb-1 text-sm font-semibold text-foreground">O que você gostaria de fazer?</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Sua resposta será enviada ao fornecedor automaticamente.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {/* Aprovar */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={busy}
                className="h-11 flex-1 bg-emerald-600 text-white hover:bg-emerald-700 sm:flex-none"
              >
                <Check className="mr-1.5 h-4 w-4" />
                Aprovar orçamento
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar aprovação?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ao aprovar, o fornecedor será notificado para iniciar a execução. Você ainda poderá ver
                  esta página depois.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleApprove}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Confirmar aprovação
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Comentar */}
          <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={busy} className="h-11 flex-1 sm:flex-none">
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Enviar comentário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar comentário</DialogTitle>
                <DialogDescription>
                  Deixe sua dúvida, sugestão de alteração ou observação. O fornecedor receberá no acompanhamento
                  comercial.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value.slice(0, 2000))}
                rows={5}
                placeholder="Ex.: Gostaria de incluir um item adicional..."
              />
              <p className="text-[11px] text-muted-foreground">{commentText.length}/2000</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCommentOpen(false)} disabled={comment.isPending}>
                  Cancelar
                </Button>
                <Button onClick={handleComment} disabled={comment.isPending || !commentText.trim()}>
                  {comment.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                  Enviar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Rejeitar */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={busy}
                className="h-11 flex-1 border-red-500/30 text-red-700 hover:bg-red-500/10 sm:flex-none"
              >
                <X className="mr-1.5 h-4 w-4" />
                Rejeitar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Rejeitar este orçamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você pode escrever um motivo (opcional) para o fornecedor entender melhor.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value.slice(0, 2000))}
                rows={4}
                placeholder="Motivo (opcional)"
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setRejectComment("")}>Voltar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Confirmar rejeição
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </Dialog>
        </div>

        {busy ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Enviando...
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
