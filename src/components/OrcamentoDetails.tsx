import { Orcamento, StatusOrcamento, Cliente, MinhaEmpresa } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Copy, CalendarDays, CreditCard, Shield, FileText, Factory, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { PDFDownloadButton } from './PDFDownloadButton';
import { OSDownloadButton } from './OSDownloadButton';

interface OrcamentoDetailsProps {
  orcamento: Orcamento;
  cliente?: Cliente;
  empresa?: MinhaEmpresa;
  onBack: () => void;
  onEdit: (orc: Orcamento) => void;
  onDuplicate?: (orc: Orcamento) => void;
}

const statusConfig: Record<StatusOrcamento, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
  aprovado: { label: 'Aprovado', color: 'bg-green-500/20 text-green-700 border-green-500/30' },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-500/20 text-red-700 border-red-500/30' },
  executado: { label: 'Executado', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
};

const dificuldadeLabels: Record<string, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

const formatCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function OrcamentoDetails({ orcamento, cliente, empresa, onBack, onEdit, onDuplicate }: OrcamentoDetailsProps) {
  const { canCreateEditBudget } = useAuth();
  const st = statusConfig[orcamento.status ?? 'pendente'];
  const displayValue = (orcamento.desconto ?? 0) > 0 ? (orcamento.valorFinal ?? orcamento.valorVenda) : orcamento.valorVenda;
  const margem = displayValue > 0 ? ((1 - orcamento.custoTotalObra / displayValue) * 100) : 0;

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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              Criado em {new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR')}
            </span>
            {orcamento.validade && !isNaN(new Date(orcamento.validade).getTime()) && (
              <span>Válido até {new Date(orcamento.validade).toLocaleDateString('pt-BR')}</span>
            )}
          </div>
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

      </div>
    </div>
  );
}
