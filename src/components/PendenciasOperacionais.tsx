import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  DollarSign,
  Hammer,
  MessageCircle,
  PhoneCall,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Pendencias, PendenciaItem } from '@/hooks/usePendencias';
import { Orcamento } from '@/lib/types';

interface Props {
  pendencias: Pendencias;
  canViewFinanceiro: boolean;
  onViewOrcamento: (orc: Orcamento) => void;
  /** Minimal orcamento lookup by id */
  orcamentosMap: Map<string, Orcamento>;
}

export function PendenciasOperacionais({ pendencias, canViewFinanceiro, onViewOrcamento, orcamentosMap }: Props) {
  const { comercial, operacao, financeiro, totalComercial, totalOperacao, totalFinanceiro } = pendencias;

  const grandTotal = totalComercial + totalOperacao + (canViewFinanceiro ? totalFinanceiro : 0);

  if (grandTotal === 0 && !pendencias.isLoading) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardContent className="flex items-center gap-3 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Tudo em dia</p>
            <p className="text-xs text-muted-foreground">Nenhuma pendência operacional no momento.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleClick = (item: PendenciaItem) => {
    const orc = orcamentosMap.get(item.orcamentoId);
    if (orc) onViewOrcamento(orc);
  };

  const cols = canViewFinanceiro ? 3 : 2;

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-foreground">Pendências operacionais</h2>
            {grandTotal > 0 && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                {grandTotal}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            O que exige atenção imediata nas áreas comercial, operação{canViewFinanceiro ? ' e financeiro' : ''}.
          </p>
        </div>

        <div className={cn('grid gap-4', cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
          {/* ── Comercial ── */}
          <PendenciaColumn
            title="Comercial"
            icon={PhoneCall}
            total={totalComercial}
            iconBg="bg-blue-500/15 text-blue-600 dark:text-blue-400"
          >
            <PendenciaGroup
              label="Follow-ups para hoje"
              items={comercial.followUpsHoje}
              tone="text-amber-600 dark:text-amber-400"
              icon={CalendarClock}
              onClick={handleClick}
            />
            <PendenciaGroup
              label="Follow-ups atrasados"
              items={comercial.followUpsAtrasados}
              tone="text-red-500"
              icon={AlertTriangle}
              onClick={handleClick}
            />
            <PendenciaGroup
              label="Sem retorno"
              items={comercial.semRetorno}
              tone="text-muted-foreground"
              icon={MessageCircle}
              onClick={handleClick}
            />
          </PendenciaColumn>

          {/* ── Operação ── */}
          <PendenciaColumn
            title="Operação"
            icon={Hammer}
            total={totalOperacao}
            iconBg="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          >
            <PendenciaGroup
              label="Aprovados sem data prevista"
              items={operacao.aprovadosSemDataPrevista}
              tone="text-muted-foreground"
              icon={Clock}
              onClick={handleClick}
            />
            <PendenciaGroup
              label="Execução prevista para hoje"
              items={operacao.execucaoHoje}
              tone="text-amber-600 dark:text-amber-400"
              icon={CalendarClock}
              onClick={handleClick}
            />
            <PendenciaGroup
              label="Execução atrasada"
              items={operacao.execucaoAtrasada}
              tone="text-red-500"
              icon={AlertTriangle}
              onClick={handleClick}
            />
          </PendenciaColumn>

          {/* ── Financeiro ── */}
          {canViewFinanceiro && (
            <PendenciaColumn
              title="Financeiro"
              icon={DollarSign}
              total={totalFinanceiro}
              iconBg="bg-violet-500/15 text-violet-600 dark:text-violet-400"
            >
              <PendenciaGroup
                label="Executados sem faturamento"
                items={financeiro.executadosSemFaturamento}
                tone="text-amber-600 dark:text-amber-400"
                icon={Clock}
                onClick={handleClick}
              />
              <PendenciaGroup
                label="Faturados sem pagamento"
                items={financeiro.faturadosSemPagamento}
                tone="text-red-500"
                icon={AlertTriangle}
                onClick={handleClick}
              />
            </PendenciaColumn>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Sub-components ───

function PendenciaColumn({
  title,
  icon: Icon,
  total,
  iconBg,
  children,
}: {
  title: string;
  icon: React.ElementType;
  total: number;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-full', iconBg)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-semibold text-foreground">{title}</span>
        {total > 0 && (
          <span className="ml-auto rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold text-foreground">
            {total}
          </span>
        )}
      </div>
      {total === 0 ? (
        <div className="flex items-center gap-2 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs text-muted-foreground">Tudo em dia</span>
        </div>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

function PendenciaGroup({
  label,
  items,
  tone,
  icon: Icon,
  onClick,
}: {
  label: string;
  items: PendenciaItem[];
  tone: string;
  icon: React.ElementType;
  onClick: (item: PendenciaItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className={cn('h-3 w-3', tone)} />
        <span className={cn('text-[11px] font-medium', tone)}>
          {items.length} {label.toLowerCase()}
        </span>
      </div>
      <div className="space-y-0.5">
        {items.slice(0, 5).map((item) => (
          <button
            key={item.orcamentoId}
            onClick={() => onClick(item)}
            className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-xs transition-colors hover:bg-background/60"
          >
            <span className="font-bold text-primary">#{item.numero}</span>
            <span className="truncate text-muted-foreground">— {item.nomeCliente}</span>
          </button>
        ))}
        {items.length > 5 && (
          <p className="pl-1.5 text-[10px] text-muted-foreground">+{items.length - 5} mais</p>
        )}
      </div>
    </div>
  );
}
