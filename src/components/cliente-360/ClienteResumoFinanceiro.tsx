import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet, Receipt, BarChart3 } from "lucide-react";
import type { ResumoFinanceiroCliente } from "@/lib/cliente-360/types";

function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

function formatPct(v: number): string {
  return `${(v * 100).toFixed(0)}%`;
}

interface Props {
  resumo: ResumoFinanceiroCliente;
}

export function ClienteResumoFinanceiro({ resumo }: Props) {
  const items = [
    {
      label: "Total faturado",
      value: formatBRL(resumo.totalFaturado),
      hint: `${resumo.qtdConcluidos} ${resumo.qtdConcluidos === 1 ? "orçamento concluído" : "orçamentos concluídos"}`,
      Icon: TrendingUp,
      tone: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Ticket médio",
      value: formatBRL(resumo.ticketMedio),
      hint: "Considera apenas executados+",
      Icon: BarChart3,
      tone: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Em aberto",
      value: formatBRL(resumo.emAberto),
      hint: "Aprovados/executados sem pagamento",
      Icon: Wallet,
      tone: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Taxa de conversão",
      value: formatPct(resumo.taxaConversao),
      hint: `${resumo.qtdOrcamentos} ${resumo.qtdOrcamentos === 1 ? "orçamento total" : "orçamentos totais"}`,
      Icon: Receipt,
      tone: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(({ label, value, hint, Icon, tone, bg }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
                <p className="mt-1 text-lg font-bold text-foreground truncate">{value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
              </div>
              <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${tone}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
