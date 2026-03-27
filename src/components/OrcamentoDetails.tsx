import { useState } from 'react';
import { Orcamento, StatusOrcamento, Cliente, MinhaEmpresa } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Copy, CalendarDays, CreditCard, Shield, FileText, Factory, Truck, Hammer, Receipt, Banknote, CalendarClock, Check, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { PDFDownloadButton } from './PDFDownloadButton';
import { OSDownloadButton } from './OSDownloadButton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
} from '@/components/ui/alert-dialog';

interface OrcamentoDetailsProps {
  orcamento: Orcamento;
  cliente?: Cliente;
  empresa?: MinhaEmpresa;
  onBack: () => void;
  onEdit: (orc: Orcamento) => void;
  onDuplicate?: (orc: Orcamento) => void;
  onMarkExecuted?: (orc: Orcamento) => void;
  onMarkFaturado?: (orc: Orcamento) => void;
  onMarkPago?: (orc: Orcamento) => void;
  onUpdateDataPrevista?: (orc: Orcamento, date: string | null) => void;
  onCancelOrcamento?: (orc: Orcamento) => void;
}

const statusConfig: Record<StatusOrcamento, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
  aprovado: { label: 'Aprovado', color: 'bg-green-500/20 text-green-700 border-green-500/30' },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-500/20 text-red-700 border-red-500/30' },
  executado: { label: 'Executado', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-500/20 text-gray-600 border-gray-500/30' },
};

const dificuldadeLabels: Record<string, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

const formatCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Pipeline steps
const pipelineSteps = [
  { key: 'pendente', label: 'Pendente' },
  { key: 'aprovado', label: 'Aprovado' },
  { key: 'executado', label: 'Executado' },
  { key: 'faturado', label: 'Faturado' },
  { key: 'pago', label: 'Pago' },
];

function getPipelineStep(orc: Orcamento): number {
  if (orc.dataPagamento) return 4;
  if (orc.dataFaturamento) return 3;
  if (orc.status === 'executado') return 2;
  if (orc.status === 'aprovado') return 1;
  return 0;
}

function PipelineBar({ orcamento }: { orcamento: Orcamento }) {
  const currentStep = getPipelineStep(orcamento);
  return (
    <div className="flex items-center gap-0 mb-8 px-2">
      {pipelineSteps.map((step, idx) => {
        const isActive = idx <= currentStep;
        const isCurrent = idx === currentStep;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 relative">
              {/* Connector line */}
              {idx > 0 && (
                <div className={cn(
                  'absolute top-3 right-1/2 w-full h-0.5 -z-10',
                  isActive ? 'bg-accent' : 'bg-border'
                )} />
              )}
              {/* Circle */}
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all border-2',
                isCurrent
                  ? 'bg-accent text-accent-foreground border-accent shadow-md shadow-accent/20 scale-110'
                  : isActive
                    ? 'bg-accent/20 text-accent border-accent/40'
                    : 'bg-muted text-muted-foreground border-border'
              )}>
                {isActive && idx < currentStep ? (
                  <Check className="h-3 w-3" />
                ) : (
                  idx + 1
                )}
              </div>
              <span className={cn(
                'text-[10px] mt-1.5 font-semibold truncate',
                isCurrent ? 'text-accent' : isActive ? 'text-accent/70' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function OrcamentoDetails({ orcamento, cliente, empresa, onBack, onEdit, onDuplicate, onMarkExecuted, onMarkFaturado, onMarkPago, onUpdateDataPrevista, onCancelOrcamento }: OrcamentoDetailsProps) {
  const { canCreateEditBudget } = useAuth();
  const st = statusConfig[orcamento.status ?? 'pendente'];
  const displayValue = (orcamento.desconto ?? 0) > 0 ? (orcamento.valorFinal ?? orcamento.valorVenda) : orcamento.valorVenda;
  const margem = displayValue > 0 ? ((1 - orcamento.custoTotalObra / displayValue) * 100) : 0;

  const showPipeline = orcamento.status !== 'rejeitado' && orcamento.status !== 'cancelado';

  // Data prevista picker state — only saves on explicit action
  const [dataPrevPopoverOpen, setDataPrevPopoverOpen] = useState(false);

  const handleDataPrevistaSelect = (date: Date | undefined) => {
    if (onUpdateDataPrevista) {
      onUpdateDataPrevista(orcamento, date ? date.toISOString() : null);
    }
    setDataPrevPopoverOpen(false);
  };

  return (
    <div className="px-4 lg:px-6 pt-4 pb-8 max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista
      </button>

      {/* Pipeline */}
      {showPipeline && <PipelineBar orcamento={orcamento} />}

      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl font-bold text-accent">#{orcamento.numeroOrcamento ?? '—'}</h1>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold border', st.color)}>
                  {st.label}
                </span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                  {orcamento.motorType === 'motor1' ? (
                    <span className="flex items-center gap-1"><Factory className="h-3 w-3" /> Motor 1</span>
                  ) : (
                    <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Motor 2</span>
                  )}
                </span>
              </div>
              <p className="text-lg font-medium text-foreground">{orcamento.nomeCliente}</p>
            </div>
            <p className="text-xl font-bold text-accent">{formatCurrency(displayValue)}</p>
          </div>
          {/* Dates in order: criação → prevista → execução → faturamento → pagamento */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              Criado em {new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR')}
            </span>
            {orcamento.dataPrevista && (
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                Previsto {new Date(orcamento.dataPrevista).toLocaleDateString('pt-BR')}
              </span>
            )}
            {orcamento.dataExecucao && (
              <span className="flex items-center gap-1">
                <Hammer className="h-3 w-3" />
                Executado em {new Date(orcamento.dataExecucao).toLocaleDateString('pt-BR')}
              </span>
            )}
            {orcamento.dataFaturamento && (
              <span className="flex items-center gap-1">
                <Receipt className="h-3 w-3" />
                Faturado em {new Date(orcamento.dataFaturamento).toLocaleDateString('pt-BR')}
              </span>
            )}
            {orcamento.dataPagamento && (
              <span className="flex items-center gap-1">
                <Banknote className="h-3 w-3" />
                Pago em {new Date(orcamento.dataPagamento).toLocaleDateString('pt-BR')}
              </span>
            )}
            {orcamento.validade && !isNaN(new Date(orcamento.validade).getTime()) && (
              <span>Válido até {new Date(orcamento.validade).toLocaleDateString('pt-BR')}</span>
            )}
          </div>

          {/* Data prevista editor — only when status = aprovado */}
          {canCreateEditBudget && orcamento.status === 'aprovado' && onUpdateDataPrevista && (
            <div className="mt-3 flex items-center gap-2">
              <Popover open={dataPrevPopoverOpen} onOpenChange={setDataPrevPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
                    {orcamento.dataPrevista
                      ? `Previsto: ${new Date(orcamento.dataPrevista).toLocaleDateString('pt-BR')}`
                      : 'Definir data prevista'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={orcamento.dataPrevista ? new Date(orcamento.dataPrevista) : undefined}
                    onSelect={handleDataPrevistaSelect}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {orcamento.dataPrevista && (
                <Button variant="ghost" size="sm" className="text-xs h-8 text-destructive" onClick={() => onUpdateDataPrevista(orcamento, null)}>
                  Limpar
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Itens de Serviço */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Itens do Orçamento</h2>
            <span className="text-xs text-muted-foreground">{orcamento.itensServico.length} {orcamento.itensServico.length === 1 ? 'item' : 'itens'}</span>
          </div>
          {orcamento.itensServico.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum item adicionado.</p>
          ) : (
            <div className="space-y-0">
              {orcamento.itensServico.map((item, idx) => (
                <div key={item.id} className={cn("py-3.5", idx > 0 && "border-t border-border")}>
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground mt-0.5 shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{item.nomeServico}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                          <span>{item.materialId}</span>
                          <span>{item.espessura}mm</span>
                          <span>{item.metragem}m</span>
                          <span>{dificuldadeLabels[item.dificuldade] ?? item.dificuldade}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-accent shrink-0 ml-2">{formatCurrency(item.valorVenda)}</p>
                  </div>
                  {item.insumosCalculados && item.insumosCalculados.length > 0 && (
                    <div className="ml-[34px] mt-2 rounded-md bg-muted/50 p-2.5">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Insumos</p>
                      <div className="space-y-0.5">
                        {item.insumosCalculados.map((ins) => (
                          <div key={ins.insumoId} className="flex justify-between text-xs text-muted-foreground">
                            <span>{ins.nomeInsumo} (×{ins.quantidade.toFixed(2)})</span>
                            <span>{formatCurrency(ins.custoTotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Resumo Financeiro</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Custo Total</span>
              <span className="font-medium">{formatCurrency(orcamento.custoTotalObra)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor de Venda</span>
              <span className="font-medium">{formatCurrency(orcamento.valorVenda)}</span>
            </div>
            {(orcamento.desconto ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desconto</span>
                <span className="font-medium text-destructive">-{formatCurrency(orcamento.desconto)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-baseline rounded-lg bg-muted/50 px-3 py-2.5 -mx-1">
              <span className="text-sm font-semibold">Valor Final</span>
              <span className="text-xl font-bold text-accent">{formatCurrency(displayValue)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-muted-foreground">Margem</span>
              <Badge variant={margem >= 30 ? 'default' : 'secondary'} className="text-[10px] px-2">
                {margem.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condições */}
      {(orcamento.formasPagamento || orcamento.garantia || orcamento.descricaoGeral) && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Condições Comerciais</h2>
            <div className="space-y-3 text-sm">
              {orcamento.descricaoGeral && (
                <div className="flex items-start gap-2.5">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Descrição</span>
                    <p className="text-foreground">{orcamento.descricaoGeral}</p>
                  </div>
                </div>
              )}
              {orcamento.formasPagamento && (
                <div className="flex items-start gap-2.5">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Pagamento</span>
                    <p className="text-foreground">{orcamento.formasPagamento}</p>
                  </div>
                </div>
              )}
              {orcamento.garantia && (
                <div className="flex items-start gap-2.5">
                  <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Garantia</span>
                    <p className="text-foreground">{orcamento.garantia}{orcamento.tempoGarantia ? ` (${orcamento.tempoGarantia})` : ''}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Primary actions */}
        <PDFDownloadButton
          orcamento={orcamento}
          cliente={cliente}
          empresa={empresa}
          className="h-10 px-4 sm:px-5 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-xs sm:text-sm"
        />

        {(orcamento.status === 'aprovado' || orcamento.status === 'executado') && (
          <OSDownloadButton
            orcamento={orcamento}
            cliente={cliente}
            empresa={empresa}
            className="h-10 px-4 sm:px-5 text-xs sm:text-sm"
          />
        )}

        <div className="hidden sm:block h-6 w-px bg-border mx-1" />

        {/* Mark as executed — only if approved and not yet executed */}
        {canCreateEditBudget && orcamento.status === 'aprovado' && onMarkExecuted && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 text-xs sm:text-sm border-blue-500/30 text-blue-700 hover:bg-blue-500/10"
              >
                <Hammer className="mr-1.5 h-4 w-4" />
                Marcar Executado
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Marcar como Executado?</AlertDialogTitle>
                <AlertDialogDescription>
                  O orçamento <strong>#{orcamento.numeroOrcamento}</strong> será marcado como executado com a data de hoje.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onMarkExecuted(orcamento)} className="bg-blue-600 text-white hover:bg-blue-700">
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Mark as faturado — only if executed and not yet faturado */}
        {canCreateEditBudget && orcamento.status === 'executado' && !orcamento.dataFaturamento && onMarkFaturado && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 text-xs sm:text-sm border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10"
              >
                <Receipt className="mr-1.5 h-4 w-4" />
                Marcar Faturado
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Marcar como Faturado?</AlertDialogTitle>
                <AlertDialogDescription>
                  O orçamento <strong>#{orcamento.numeroOrcamento}</strong> será marcado como faturado com a data de hoje.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onMarkFaturado(orcamento)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Mark as pago — only if faturado and not yet pago */}
        {canCreateEditBudget && orcamento.dataFaturamento && !orcamento.dataPagamento && onMarkPago && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 text-xs sm:text-sm border-violet-500/30 text-violet-700 hover:bg-violet-500/10"
              >
                <Banknote className="mr-1.5 h-4 w-4" />
                Marcar Pago
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Marcar como Pago?</AlertDialogTitle>
                <AlertDialogDescription>
                  O orçamento <strong>#{orcamento.numeroOrcamento}</strong> será marcado como pago com a data de hoje.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onMarkPago(orcamento)} className="bg-violet-600 text-white hover:bg-violet-700">
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Cancel — only if pendente or aprovado */}
        {canCreateEditBudget && (orcamento.status === 'pendente' || orcamento.status === 'aprovado') && onCancelOrcamento && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 text-xs sm:text-sm border-gray-500/30 text-gray-600 hover:bg-gray-500/10"
              >
                <Ban className="mr-1.5 h-4 w-4" />
                Cancelar Orçamento
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar Orçamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  O orçamento <strong>#{orcamento.numeroOrcamento}</strong> será cancelado. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onCancelOrcamento(orcamento)} className="bg-gray-600 text-white hover:bg-gray-700">
                  Confirmar Cancelamento
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Secondary actions */}
        {canCreateEditBudget && (
          <Button
            variant="outline"
            onClick={() => onEdit(orcamento)}
            className="h-10 px-4 text-xs sm:text-sm"
          >
            <Pencil className="mr-1.5 h-4 w-4" />
            Editar
          </Button>
        )}

        {canCreateEditBudget && onDuplicate && (
          <Button
            variant="outline"
            onClick={() => onDuplicate(orcamento)}
            className="h-10 px-4 text-xs sm:text-sm"
          >
            <Copy className="mr-1.5 h-4 w-4" />
            Duplicar
          </Button>
        )}

      </div>
    </div>
  );
}