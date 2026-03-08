import { Orcamento, StatusOrcamento, Cliente, MinhaEmpresa } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PDFDownloadButton } from './PDFDownloadButton';
import { OSDownloadButton } from './OSDownloadButton';
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
  onDelete: (id: string) => void;
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

export function OrcamentoDetails({ orcamento, cliente, empresa, onBack, onEdit, onDelete }: OrcamentoDetailsProps) {
  const st = statusConfig[orcamento.status ?? 'pendente'];
  const displayValue = (orcamento.desconto ?? 0) > 0 ? (orcamento.valorFinal ?? orcamento.valorVenda) : orcamento.valorVenda;

  return (
    <div className="px-4 pt-4 pb-8 max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            <span className="text-accent">#{orcamento.numeroOrcamento ?? '—'}</span>
          </h1>
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold border', st.color)}>
            {st.label}
          </span>
        </div>
        <p className="text-lg font-medium text-foreground">{orcamento.nomeCliente}</p>
        <p className="text-sm text-muted-foreground">
          Criado em {new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR')}
          {orcamento.validade && !isNaN(new Date(orcamento.validade).getTime()) && ` · Válido até ${new Date(orcamento.validade).toLocaleDateString('pt-BR')}`}
        </p>
      </div>

      {/* Itens de Serviço */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Itens do Orçamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orcamento.itensServico.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum item adicionado.</p>
          ) : (
            orcamento.itensServico.map((item, idx) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-sm">{idx + 1}. {item.nomeServico}</p>
                  <p className="text-sm font-semibold text-accent">{formatCurrency(item.valorVenda)}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground/70">Material:</span>{' '}
                    {item.materialId}
                  </div>
                  <div>
                    <span className="font-medium text-foreground/70">Espessura:</span>{' '}
                    {item.espessura}mm
                  </div>
                  <div>
                    <span className="font-medium text-foreground/70">Metragem:</span>{' '}
                    {item.metragem}m
                  </div>
                  <div>
                    <span className="font-medium text-foreground/70">Dificuldade:</span>{' '}
                    {dificuldadeLabels[item.dificuldade] ?? item.dificuldade}
                  </div>
                </div>
                {item.insumosCalculados && item.insumosCalculados.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs font-medium text-foreground/70 mb-1">Insumos:</p>
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
            ))
          )}
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Custo Total</span>
            <span className="font-medium">{formatCurrency(orcamento.custoTotalObra)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valor de Venda</span>
            <span className="font-medium">{formatCurrency(orcamento.valorVenda)}</span>
          </div>
          {(orcamento.desconto ?? 0) > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desconto</span>
                <span className="font-medium text-destructive">-{formatCurrency(orcamento.desconto)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span>Valor Final</span>
                <span className="text-accent">{formatCurrency(orcamento.valorFinal)}</span>
              </div>
            </>
          )}
          {(orcamento.desconto ?? 0) === 0 && (
            <>
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span className="text-accent">{formatCurrency(displayValue)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between text-xs text-muted-foreground pt-2 pb-1">
            <span>Margem</span>
            <span>{((1 - orcamento.custoTotalObra / displayValue) * 100).toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Condições */}
      {(orcamento.formasPagamento || orcamento.garantia || orcamento.descricaoGeral) && (
        <Card className="mb-4 lg:mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Condições</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {orcamento.descricaoGeral && (
              <div>
                <span className="font-medium text-foreground/70">Descrição:</span>{' '}
                <span className="text-muted-foreground">{orcamento.descricaoGeral}</span>
              </div>
            )}
            {orcamento.formasPagamento && (
              <div>
                <span className="font-medium text-foreground/70">Pagamento:</span>{' '}
                <span className="text-muted-foreground">{orcamento.formasPagamento}</span>
              </div>
            )}
            {orcamento.garantia && (
              <div>
                <span className="font-medium text-foreground/70">Garantia:</span>{' '}
                <span className="text-muted-foreground">{orcamento.garantia} ({orcamento.tempoGarantia})</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Bar — inline, responsive */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6 mb-4">
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

        <Button
          variant="outline"
          onClick={() => onEdit(orcamento)}
          className="h-10 px-4 sm:px-5 text-xs sm:text-sm"
        >
          <Pencil className="mr-1.5 h-4 w-4" />
          Editar
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 text-destructive hover:text-destructive border-destructive/30">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O orçamento #{orcamento.numeroOrcamento} será removido permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(orcamento.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
