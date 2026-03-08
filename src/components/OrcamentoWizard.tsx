import { useState, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { calcCustoMetroMotor1, calcCustoMetroMotor2, calcInsumos, getFatorDificuldade } from '@/lib/calcEngine';
import { Dificuldade, MotorType, Orcamento } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props { onDone: () => void; }

export function OrcamentoWizard({ onDone }: Props) {
  const [step, setStep] = useState(1);
  const receitas = storage.getReceitas();
  const motor1List = storage.getMotor1();
  const motor2List = storage.getMotor2();
  const insumosList = storage.getInsumos();

  // Step 1
  const [nomeCliente, setNomeCliente] = useState('');
  // Step 2
  const [receitaId, setReceitaId] = useState('');
  // Step 3
  const [metragem, setMetragem] = useState('');
  const [espessura, setEspessura] = useState('');
  const [corte, setCorte] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [motorType, setMotorType] = useState<MotorType>('motor1');
  // Step 4
  const [dificuldade, setDificuldade] = useState<Dificuldade>('facil');

  // Step 5 editable quantities
  const [editQtdSuportes, setEditQtdSuportes] = useState<number | null>(null);
  const [editQtdPU, setEditQtdPU] = useState<number | null>(null);
  const [editQtdRebites, setEditQtdRebites] = useState<number | null>(null);

  const receita = receitas.find(r => r.id === receitaId);

  const materiaisUnicos = useMemo(() => {
    if (motorType === 'motor1') return motor1List;
    const nomes = [...new Set(motor2List.map(m => m.material))];
    return nomes.map(n => ({ id: n, material: n }));
  }, [motorType, motor1List, motor2List]);

  const calc = useMemo(() => {
    if (!receita || !metragem || !espessura || !corte || !materialId) return null;
    const m = parseFloat(metragem);
    const esp = parseFloat(espessura);
    const cor = parseFloat(corte);
    if (isNaN(m) || isNaN(esp) || isNaN(cor) || m <= 0) return null;

    let custoMetroLinear: number;
    if (motorType === 'motor1') {
      const motor1 = motor1List.find(e => e.id === materialId);
      if (!motor1) return null;
      custoMetroLinear = calcCustoMetroMotor1(esp, cor, motor1);
    } else {
      const mat = motor2List.find(e => e.material === materialId);
      const resultado = calcCustoMetroMotor2(materialId, esp, cor, motor2List);
      if (resultado === null) return null;
      custoMetroLinear = resultado;
    }

    const custoTotalMaterial = custoMetroLinear * m;
    const ins = calcInsumos(m, receita, insumosList);
    const fator = getFatorDificuldade(receita, dificuldade);

    return { custoMetroLinear, custoTotalMaterial, ...ins, fatorDificuldade: fator };
  }, [receita, metragem, espessura, corte, materialId, motorType, dificuldade, motor1List, motor2List, insumosList]);

  // Apply editable overrides
  const finalCalc = useMemo(() => {
    if (!calc) return null;
    const suporteInsumo = insumosList.find(i => i.nome.toLowerCase().includes('suporte'));
    const puInsumo = insumosList.find(i => i.nome.toLowerCase().includes('pu'));
    const rebiteInsumo = insumosList.find(i => i.nome.toLowerCase().includes('rebite'));

    const qs = editQtdSuportes ?? calc.qtdSuportes;
    const qp = editQtdPU ?? calc.qtdPU;
    const qr = editQtdRebites ?? calc.qtdRebites;

    const cs = qs * (suporteInsumo?.custoUnitario ?? 0);
    const cp = qp * (puInsumo?.custoUnitario ?? 0);
    const cr = qr * (rebiteInsumo?.custoUnitario ?? 0);
    const totalInsumos = cs + cp + cr;
    const custoObra = calc.custoTotalMaterial + totalInsumos;
    const valorVenda = custoObra * calc.fatorDificuldade;

    return {
      ...calc,
      qtdSuportes: qs, qtdPU: qp, qtdRebites: qr,
      custoSuportes: cs, custoPU: cp, custoRebites: cr,
      custoTotalInsumos: totalInsumos, custoTotalObra: custoObra, valorVenda,
    };
  }, [calc, editQtdSuportes, editQtdPU, editQtdRebites, insumosList]);

  const canNext = () => {
    if (step === 1) return nomeCliente.trim().length > 0;
    if (step === 2) return !!receitaId;
    if (step === 3) return !!materialId && !!metragem && !!espessura && !!corte;
    if (step === 4) return true;
    return !!finalCalc;
  };

  const handleSave = () => {
    if (!finalCalc || !receita) return;
    const orcamento: Orcamento = {
      id: crypto.randomUUID(),
      nomeCliente,
      receitaId,
      nomeServico: receita.nomeServico,
      motorType,
      materialId,
      espessura: parseFloat(espessura),
      corte: parseFloat(corte),
      metragem: parseFloat(metragem),
      dificuldade,
      fatorDificuldade: finalCalc.fatorDificuldade,
      custoMetroLinear: finalCalc.custoMetroLinear,
      custoTotalMaterial: finalCalc.custoTotalMaterial,
      qtdSuportes: finalCalc.qtdSuportes,
      qtdPU: finalCalc.qtdPU,
      qtdRebites: finalCalc.qtdRebites,
      custoSuportes: finalCalc.custoSuportes,
      custoPU: finalCalc.custoPU,
      custoRebites: finalCalc.custoRebites,
      custoTotalInsumos: finalCalc.custoTotalInsumos,
      custoTotalObra: finalCalc.custoTotalObra,
      valorVenda: finalCalc.valorVenda,
      dataCriacao: new Date().toISOString(),
    };
    storage.addOrcamento(orcamento);
    toast.success('Orçamento salvo com sucesso!');
    onDone();
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const steps = ['Cliente', 'Serviço', 'Medidas', 'Dificuldade', 'Resumo'];

  const dificuldadeLabel: Record<Dificuldade, string> = {
    facil: 'Fácil', medio: 'Médio', dificil: 'Difícil',
  };

  return (
    <div className="px-4 pb-24 pt-4">
      <div className="mb-4 flex items-center gap-3">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="text-primary">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-bold text-primary">Novo Orçamento</h1>
      </div>

      {/* Progress */}
      <div className="mb-6 flex gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 text-center">
            <div className={cn(
              'mx-auto mb-1 h-1.5 rounded-full transition-colors',
              i + 1 <= step ? 'bg-accent' : 'bg-muted'
            )} />
            <span className={cn('text-[10px]', i + 1 === step ? 'text-accent font-semibold' : 'text-muted-foreground')}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Label>Nome do Cliente</Label>
            <Input
              placeholder="Ex: João da Silva"
              value={nomeCliente}
              onChange={e => setNomeCliente(e.target.value)}
              autoFocus
            />
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Label>Tipo de Serviço</Label>
            <Select value={receitaId} onValueChange={setReceitaId}>
              <SelectTrigger><SelectValue placeholder="Selecione o serviço" /></SelectTrigger>
              <SelectContent>
                {receitas.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.nomeServico}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <Button
                variant={motorType === 'motor1' ? 'default' : 'outline'}
                className={cn('flex-1 text-xs', motorType === 'motor1' && 'bg-primary')}
                onClick={() => { setMotorType('motor1'); setMaterialId(''); }}
              >
                Fabricar (Motor 1)
              </Button>
              <Button
                variant={motorType === 'motor2' ? 'default' : 'outline'}
                className={cn('flex-1 text-xs', motorType === 'motor2' && 'bg-primary')}
                onClick={() => { setMotorType('motor2'); setMaterialId(''); }}
              >
                Comprar Dobrado (Motor 2)
              </Button>
            </div>

            <div>
              <Label>Material</Label>
              <Select value={materialId} onValueChange={setMaterialId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {materiaisUnicos.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.material}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Metragem (m)</Label>
                <Input type="number" inputMode="decimal" placeholder="12.5" value={metragem} onChange={e => setMetragem(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Espessura (mm)</Label>
                <Input type="number" inputMode="decimal" placeholder="0.5" value={espessura} onChange={e => setEspessura(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Corte (mm)</Label>
                <Input type="number" inputMode="decimal" placeholder="300" value={corte} onChange={e => setCorte(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 */}
      {step === 4 && receita && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Label>Nível de Dificuldade</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['facil', 'medio', 'dificil'] as Dificuldade[]).map(d => {
                const fator = getFatorDificuldade(receita, d);
                return (
                  <button
                    key={d}
                    onClick={() => setDificuldade(d)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-all',
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
          </CardContent>
        </Card>
      )}

      {/* Step 5 */}
      {step === 5 && finalCalc && (
        <div className="space-y-3">
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Material</h3>
              <div className="flex justify-between text-sm">
                <span>Custo/metro</span>
                <span className="font-medium">{fmt(finalCalc.custoMetroLinear)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total material ({metragem}m)</span>
                <span className="font-medium">{fmt(finalCalc.custoTotalMaterial)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Insumos (editável)</h3>
              {receita && receita.divisorSuporte > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm flex-1">Suportes</span>
                  <Input
                    type="number"
                    className="w-16 h-8 text-center text-sm"
                    value={editQtdSuportes ?? finalCalc.qtdSuportes}
                    onChange={e => setEditQtdSuportes(parseInt(e.target.value) || 0)}
                  />
                  <span className="text-sm w-20 text-right font-medium">{fmt(finalCalc.custoSuportes)}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm flex-1">PU</span>
                <Input
                  type="number"
                  className="w-16 h-8 text-center text-sm"
                  value={editQtdPU ?? finalCalc.qtdPU}
                  onChange={e => setEditQtdPU(parseInt(e.target.value) || 0)}
                />
                <span className="text-sm w-20 text-right font-medium">{fmt(finalCalc.custoPU)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm flex-1">Rebites</span>
                <Input
                  type="number"
                  className="w-16 h-8 text-center text-sm"
                  value={editQtdRebites ?? finalCalc.qtdRebites}
                  onChange={e => setEditQtdRebites(parseInt(e.target.value) || 0)}
                />
                <span className="text-sm w-20 text-right font-medium">{fmt(finalCalc.custoRebites)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm">
                <span>Total insumos</span>
                <span className="font-medium">{fmt(finalCalc.custoTotalInsumos)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Custo total</span>
                <span className="font-medium">{fmt(finalCalc.custoTotalObra)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Fator dificuldade</span>
                <span>×{finalCalc.fatorDificuldade}</span>
              </div>
              <div className="flex justify-between items-end pt-2 border-t">
                <span className="text-base font-semibold">Valor de Venda</span>
                <span className="text-2xl font-bold text-accent">{fmt(finalCalc.valorVenda)}</span>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base">
            <Check className="mr-2 h-5 w-5" /> Gerar Proposta
          </Button>
        </div>
      )}

      {/* Nav buttons */}
      {step < 5 && (
        <div className="mt-6">
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="w-full bg-primary text-primary-foreground h-12"
          >
            Próximo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
