import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Loader2,
  Send,
  Link2,
  CheckCircle2,
  Clock,
  Ban,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Cliente, Orcamento } from "@/lib/types";
import {
  useShareLink,
  useCreateShareLink,
  useRevokeShareLink,
} from "@/hooks/useShareLink";
import { buildPortalUrl, buildShareMessage, buildWhatsappUrl, sanitizePhone } from "@/lib/shareLink";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orcamento: Orcamento;
  cliente?: Cliente;
  empresaNome: string;
}

export function CompartilharOrcamentoModal({
  open,
  onOpenChange,
  orcamento,
  cliente,
  empresaNome,
}: Props) {
  const link = useShareLink(open ? orcamento.id : null);
  const create = useCreateShareLink();
  const revoke = useRevokeShareLink();
  const [confirmRegen, setConfirmRegen] = useState(false);

  const current = link.data;
  const isActive = current?.status === "ativo";
  const url = current ? buildPortalUrl(current.token) : "";

  async function handleCreate() {
    try {
      await create.mutateAsync({
        orcamentoId: orcamento.id,
        validadeSnapshot: orcamento.validadeSnapshot ?? orcamento.validade,
      });
      setConfirmRegen(false);
      toast.success("Link gerado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar link.");
    }
  }

  async function handleRevoke() {
    if (!current) return;
    try {
      await revoke.mutateAsync({ id: current.id, orcamentoId: orcamento.id });
      toast.success("Link revogado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao revogar.");
    }
  }

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar. Selecione manualmente.");
    }
  }

  function handleWhatsapp() {
    if (!url) return;
    const message = buildShareMessage({
      empresaNome,
      numeroOrcamento: orcamento.numeroOrcamento,
      url,
    });
    const phone = cliente?.whatsapp;
    const wa = buildWhatsappUrl(phone, message);
    window.open(wa, "_blank", "noopener,noreferrer");
  }

  const phoneOk = !!sanitizePhone(cliente?.whatsapp);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Compartilhar com cliente
          </DialogTitle>
          <DialogDescription>
            Gere um link seguro para o cliente visualizar e responder ao orçamento.
          </DialogDescription>
        </DialogHeader>

        {link.isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !current ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ainda não há link para este orçamento.
            </p>
            <Button onClick={handleCreate} disabled={create.isPending} className="w-full">
              {create.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="mr-1.5 h-4 w-4" />
              )}
              Gerar link
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                {current.status === "ativo" && (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700">
                      Ativo
                    </Badge>
                  </>
                )}
                {current.status === "expirado" && (
                  <>
                    <Clock className="h-4 w-4 text-amber-600" />
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/15 text-amber-700">
                      Expirado
                    </Badge>
                  </>
                )}
                {current.status === "revogado" && (
                  <>
                    <Ban className="h-4 w-4 text-red-600" />
                    <Badge variant="outline" className="border-red-500/30 bg-red-500/15 text-red-700">
                      Revogado
                    </Badge>
                  </>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {current.status === "ativo" ? "Expira em " : "Expirou em "}
                {format(new Date(current.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Link</label>
              <div className="flex gap-2">
                <Input value={url} readOnly className="text-xs" onFocus={(e) => e.target.select()} />
                <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copiar link">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Ações */}
            {isActive ? (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleCopy} variant="outline">
                  <Copy className="mr-1.5 h-4 w-4" />
                  Copiar
                </Button>
                <Button onClick={handleWhatsapp} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <Send className="mr-1.5 h-4 w-4" />
                  WhatsApp
                </Button>
                {!phoneOk ? (
                  <p className="col-span-2 text-[11px] text-amber-700">
                    O cliente não tem WhatsApp cadastrado válido — o WhatsApp abrirá sem destinatário pré-definido.
                  </p>
                ) : null}
              </div>
            ) : (
              <Button onClick={handleCreate} disabled={create.isPending} className="w-full">
                {create.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                )}
                Gerar novo link
              </Button>
            )}

            {/* Revogar / regenerar */}
            {isActive && (
              <div className="border-t border-border pt-3">
                {!confirmRegen ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmRegen(true)}
                      className="text-xs"
                    >
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Gerar novo link
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRevoke}
                      disabled={revoke.isPending}
                      className="text-xs text-red-700 hover:bg-red-500/10 hover:text-red-700"
                    >
                      <Ban className="mr-1.5 h-3.5 w-3.5" />
                      Revogar link atual
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
                    <p className="mb-2 text-xs text-amber-800">
                      Gerar um novo link irá revogar o atual. O cliente que tiver o link antigo perderá acesso.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleCreate}
                        disabled={create.isPending}
                        className="bg-amber-600 text-white hover:bg-amber-700"
                      >
                        Confirmar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmRegen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
