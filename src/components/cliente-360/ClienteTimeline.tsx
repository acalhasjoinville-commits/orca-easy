import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarCheck,
  CalendarPlus,
  CircleDollarSign,
  FileText,
  PackageCheck,
  Receipt,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { TimelineEvento, TimelineEventoTipo } from "@/lib/cliente-360/types";

function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

function formatDateTime(iso: string): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso)
    ? (() => {
        const [y, m, day] = iso.split("-").map(Number);
        return new Date(y, m - 1, day);
      })()
    : new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ICON_MAP: Record<TimelineEventoTipo, { Icon: LucideIcon; tone: string; bg: string }> = {
  visita_agendada: { Icon: CalendarPlus, tone: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
  visita_realizada: { Icon: CalendarCheck, tone: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
  orcamento_criado: { Icon: FileText, tone: "text-primary", bg: "bg-primary/10" },
  orcamento_aprovado: { Icon: PackageCheck, tone: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  orcamento_executado: { Icon: PackageCheck, tone: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  orcamento_faturado: { Icon: Receipt, tone: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  orcamento_pago: { Icon: CircleDollarSign, tone: "text-accent", bg: "bg-accent/10" },
  orcamento_cancelado: { Icon: XCircle, tone: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  retorno_aberto: { Icon: Wrench, tone: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  retorno_resolvido: { Icon: Wrench, tone: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
};

interface Props {
  eventos: TimelineEvento[];
  onOpenOrcamento?: (orcamentoId: string) => void;
}

export function ClienteTimeline({ eventos, onOpenOrcamento }: Props) {
  if (eventos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Sem eventos para exibir ainda.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {eventos.map((ev) => {
            const cfg = ICON_MAP[ev.tipo];
            const clickable = !!ev.orcamentoId && !!onOpenOrcamento;
            return (
              <li
                key={ev.id}
                className={`px-4 py-3 flex items-start gap-3 ${clickable ? "cursor-pointer hover:bg-muted/30 transition-colors" : ""}`}
                onClick={clickable ? () => onOpenOrcamento!(ev.orcamentoId!) : undefined}
              >
                <div className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-lg ${cfg.bg} ${cfg.tone}`}>
                  <cfg.Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{ev.titulo}</p>
                  {ev.descricao && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ev.descricao}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1">{formatDateTime(ev.data)}</p>
                </div>
                {ev.valor !== undefined && (
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-foreground">{formatBRL(ev.valor)}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
