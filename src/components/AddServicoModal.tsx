import { useState, useMemo, useEffect } from 'react';
import { useMotor1, useMotor2, useInsumos, useRegras, useServicos } from '@/hooks/useSupabaseTechnicalData';
import { calcCustoMetroMotor1, calcCustoMetroMotor2, calcInsumosDinamicos, getFatorDificuldade } from '@/lib/calcEngine';
import { Dificuldade, ItemServico, InsumoCalculado, MotorType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Factory, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (item: ItemServico) => void;
}

export function AddServicoModal({ open, onClose, onSave }: Props) {
  const { servicos: servicosList, isLoading: loadingServicos } = useServicos();
  const { regras: regrasList } = useRegras();
  const { motor1: motor1List } = useMotor1();
  const { motor2: motor2List } = useMotor2();
  const { insumos: insumosList } = useInsumos();

  const [servicoId, setServicoId] = useState('');
  const [motorSelecionado, setMotorSelecionado] = useState<MotorType | ''>('');
  const [metragem, setMetragem] = useState('');
  const [dificuldade, setDificuldade] = useState<Dificuldade>('facil');
  const [editQtds, setEditQtds] = useState<Record<string, number>>({});

  const servico = servicosList.find(s => s.id === servicoId);
  const regra = servico ? regrasList.find(r => r.id === servico.regraId) : null;

  // Determine allowed motors and set motorSelecionado when servico changes
  useEffect(() => {
    if (!servico) { setMotorSelecionado(''); return; }
    if (servico.permiteMotor1 && !servico.permiteMotor2) {
      setMotorSelecionado('motor1');
    } else if (!servico.permiteMotor1 && servico.permiteMotor2) {
      setMotorSelecionado('motor2');
    } else if (servico.permiteMotor1 && servico.permiteMotor2) {
      setMotorSelecionado(servico.motorPreferencial);
    } else {
      setMotorSelecionado('');
    }
  }, [servico]);

  const allowsBoth = servico ? servico.permiteMotor1 && servico.permiteMotor2 : false;

  // Validation for motor data availability
  const motorValidationError = useMemo(() => {
    if (!servico || !motorSelecionado) return null;
    if (motorSelecionado === 'motor1') {
      const found = motor1List.find(e => e.material === servico.materialPadrao);
      if (!found) return `Material "${servico.materialPadrao}" não encontrado na base do Motor 1.`;
    } else {
      const found = motor2List.find(
        e => e.material === servico.materialPadrao && e.espessura === servico.espessuraPadrao && e.corte === servico.cortePadrao
      );
      if (!found) return `Combinação ${servico.materialPadrao} ${servico.espessuraPadrao}mm ${servico.cortePadrao}mm não encontrada no Motor 2.`;
    }
    return null;
  }, [servico, motorSelecionado, motor1List, motor2List]);

  const calc = useMemo(() => {
    if (!servico || !regra || !metragem || !motorSelecionado || motorValidationError) return null;
    const m = parseFloat(metragem);
    if (isNaN(m) || m <= 0) return null;

    let custoMetroLinear: number;
    if (motorSelecionado === 'motor1') {
      const motor1 = motor1List.find(e => e.material === servico.materialPadrao);
      if (!motor1) return null;
      custoMetroLinear = calcCustoMetroMotor1(servico.espessuraPadrao, servico.cortePadrao, motor1);
    } else {
      const resultado = calcCustoMetroMotor2(servico.materialPadrao, servico.espessuraPadrao, servico.cortePadrao, motor2List);
      if (resultado === null) return null;
      custoMetroLinear = resultado;
    }

    const custoTotalMaterial = custoMetroLinear * m;
    const insumosCalc = calcInsumosDinamicos(m, regra, insumosList);
    const fator = getFatorDificuldade(servico, dificuldade);

    return { custoMetroLinear, custoTotalMaterial, insumosCalc, fatorDificuldade: fator };
  }, [servico, regra, metragem, dificuldade, motorSelecionado, motorValidationError, motor1List, motor2List, insumosList]);

  const finalCalc = useMemo(() => {
    if (!calc) return null;

    const insumosFinais: InsumoCalculado[] = calc.insumosCalc.map(ic => {
      const qtdOverride = editQtds[ic.insumoId];
      const quantidade = qtdOverride !== undefined ? qtdOverride : ic.quantidade;
      return { ...ic, quantidade, custoTotal: quantidade * ic.custoUnitario };
    });

    const custoTotalInsumos = insumosFinais.reduce((s, i) => s + i.custoTotal, 0);
    const custoTotalObra = calc.custoTotalMaterial + custoTotalInsumos;
    const valorVenda = custoTotalObra * calc.fatorDificuldade;

    return { ...calc, insumosFinais, custoTotalInsumos, custoTotalObra, valorVenda };
  }, [calc, editQtds]);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const dificuldadeLabel: Record<Dificuldade, string> = {
    facil: 'Fácil', medio: 'Médio', dificil: 'Difícil',
  };

  const canSave = !!finalCalc && !!servicoId && !!motorSelecionado && !motorValidationError;

  const handleSave = () => {
    if (!finalCalc || !servico || !motorSelecionado) return;
    const item: ItemServico = {
      id: crypto.randomUUID(),
      servicoTemplateId: servico.id,
      nomeServico: servico.nomeServico,
      motorType: motorSelecionado,
      materialId: servico.materialPadrao,
      espessura: servico.espessuraPadrao,
      corte: servico.cortePadrao,
      metragem: parseFloat(metragem),
      dificuldade,
      fatorDificuldade: finalCalc.fatorDificuldade,
      custoMetroLinear: finalCalc.custoMetroLinear,
      custoTotalMaterial: finalCalc.custoTotalMaterial,
      insumosCalculados: finalCalc.insumosFinais,
      custoTotalInsumos: finalCalc.custoTotalInsumos,
      custoTotalObra: finalCalc.custoTotalObra,
      valorVenda: finalCalc.valorVenda,
    };
    onSave(item);
    resetForm();
  };

  const resetForm = () => {
    setServicoId('');
    setMotorSelecionado('');
    setMetragem('');
    setDificuldade('facil');
    setEditQtds({});
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { resetForm(); onClose(); } }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-primary">Adicionar Serviço</DialogTitle>
        </DialogHeader>

        {loadingServicos ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Serviço</Label>
              <Select value={servicoId} onValueChange={v => { setServicoId(v); setEditQtds({}); }}>
                <SelectTrigger><SelectValue placeholder="Selecione do catálogo" /></SelectTrigger>
                <SelectContent>
                  {servicosList.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.nomeServico}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {servico && regra && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">Material:</span> {servico.materialPadrao} · {servico.espessuraPadrao}mm · {servico.cortePadrao}mm</p>
                <p><span className="font-medium text-foreground">Regra:</span> {regra.nomeRegra}</p>
                <p>
                  <span className="font-medium text-foreground">Motores:</span>{' '}
                  {servico.permiteMotor1 && 'Fabricar'}{servico.permiteMotor1 && servico.permiteMotor2 && ' · '}{servico.permiteMotor2 && 'Comprar Dobrado'}
                </p>
              </div>
            )}

            {/* Motor selector - only when both are allowed */}
            {servico && allowsBoth && (
              <div>
                <Label>Motor do Item</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setMotorSelecionado('motor1')}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all',
                      motorSelecionado === 'motor1'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30'
                    )}
                  >
                    <Factory className="h-5 w-5" />
                    <span className="text-xs font-semibold">Fabricar (Motor 1)</span>
                  </button>
                  <button
                    onClick={() => setMotorSelecionado('motor2')}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all',
                      motorSelecionado === 'motor2'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30'
                    )}
                  >
                    <Truck className="h-5 w-5" />
                    <span className="text-xs font-semibold">Comprar Dobrado (Motor 2)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Motor validation error */}
            {motorValidationError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {motorValidationError}
              </div>
            )}

            <div>
              <Label>Metragem Total (m)</Label>
              <Input type="number" inputMode="decimal" placeholder="Ex: 12.5" value={metragem} onChange={e => setMetragem(e.target.value)} />
            </div>

            {servico && (
              <div>
                <Label>Dificuldade</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['facil', 'medio', 'dificil'] as Dificuldade[]).map(d => {
                    const fator = getFatorDificuldade(servico, d);
                    return (
                      <button
                        key={d}
                        onClick={() => setDificuldade(d)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all',
                          dificuldade === d
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border text-muted-foreground hover:border-primary/30'
                        )}
                      >
                        <span className="text-sm font-semibold">{dificuldadeLabel[d]}</span>
                        <span className="text-xs">×{fator}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {finalCalc && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-muted-foreground">Resumo do Item</h4>
                  <Badge variant="outline" className="text-[10px]">
                    {motorSelecionado === 'motor1' ? (
                      <><Factory className="mr-1 h-3 w-3" /> Fabricado internamente</>
                    ) : (
                      <><Truck className="mr-1 h-3 w-3" /> Comprado dobrado</>
                    )}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Material ({metragem}m)</span>
                  <span className="font-medium">{fmt(finalCalc.custoTotalMaterial)}</span>
                </div>

                {finalCalc.insumosFinais.map(ic => (
                  <div key={ic.insumoId} className="flex items-center justify-between gap-2">
                    <span className="text-xs flex-1 truncate">{ic.nomeInsumo}</span>
                    <Input
                      type="number"
                      className="w-14 h-7 text-center text-xs"
                      value={editQtds[ic.insumoId] !== undefined ? editQtds[ic.insumoId] : ic.quantidade}
                      onChange={e => setEditQtds(prev => ({ ...prev, [ic.insumoId]: parseInt(e.target.value) || 0 }))}
                    />
                    <span className="text-xs w-16 text-right">{fmt(ic.custoTotal)}</span>
                  </div>
                ))}

                <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                  <span>Valor de Venda</span>
                  <span className="text-accent">{fmt(finalCalc.valorVenda)}</span>
                </div>
              </div>
            )}

            <Button onClick={handleSave} disabled={!canSave} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11">
              Salvar Serviço
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
