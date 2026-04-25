import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, AlertCircle } from "lucide-react";
import { STATUS_FOLLOWUP_CONFIG } from "@/lib/types";
import type { AcompanhamentoPendente } from "@/lib/cliente-360/types";
import { cn } from "@/lib/utils";

function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
  }
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface Props {
  items: AcompanhamentoPendente[];
  onOpenOrcamento: (orcamentoId: string) => void;
}

export function ClienteAcompanhamento({ items, onOpenOrcamento }: Props) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-5 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum orçamento pendente em acompanhamento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <p className="text-sm font-semibold text-foreground">Acompanhamento comercial pendente</p>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </span>
        </div>
        <ul className="divide-y">
          {items.map((it) => {
            const status = it.followUp?.statusFollowUp ?? "sem_retorno";
            const cfg = STATUS_FOLLOWUP_CONFIG[status];
            return (
              <li key={it.orcamentoId} className="px-4 py-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">#{it.numeroOrcamento}</span>
                    <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", cfg.color)}>
                      {cfg.label}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{formatBRL(it.valorFinal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {it.followUp?.proximaAcao || "Sem próxima ação definida"}
                    {it.followUp?.dataRetorno && (
                      <span className="ml-2">• Retorno: {formatDate(it.followUp.dataRetorno)}</span>
                    )}
                    {it.followUp?.responsavelNome && (
                      <span className="ml-2">• {it.followUp.responsavelNome}</span>
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onOpenOrcamento(it.orcamentoId)}
                  className="shrink-0 gap-1"
                >
                  Abrir
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
