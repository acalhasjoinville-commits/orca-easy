import { useState, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { calcCustoMetroMotor1, calcCustoMetroMotor2, calcInsumos, getFatorDificuldade } from '@/lib/calcEngine';
import { Dificuldade, MotorType, ItemServico } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (item: ItemServico) => void;
}

export function AddServicoModal({ open, onClose, onSave }: Props) {
  const receitas = storage.getReceitas();
  const motor1List = storage.getMotor1();
  const motor2List = storage.getMotor2();
  const insumosList = storage.getInsumos();

  const [receitaId, setReceitaId] = useState('');
  const [metragem, setMetragem] = useState('');
  const [espessura, setEspessura] = useState('');
  const [corte, setCorte] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [motorType, setMotorType] = useState<MotorType>('motor1');
  const [dificuldade, setDificuldade] = useState<Dificuldade>('facil');

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
      const resultado = calcCustoMetroMotor2(materialId, esp, cor, motor2List);
      if (resultado === null) return null;
      custoMetroLinear = resultado;
    }

    const custoTotalMaterial = custoMetroLinear * m;
    const ins = calcInsumos(m, receita, insumosList);
    const fator = getFatorDificuldade(receita, dificuldade);

    return { custoMetroLinear, custoTotalMaterial, ...ins, fatorDificuldade: fator };
  }, [receita, metragem, espessura, corte, materialId, motorType, dificuldade, motor1List, motor2List, insumosList]);

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

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const dificuldadeLabel: Record<Dificuldade, string> = {
    facil: 'Fácil', medio: 'Médio', dificil: 'Difícil',
  };

  const canSave = !!finalCalc && !!receitaId && !!materialId;

  const handleSave = () => {
    if (!finalCalc || !receita) return;
    const item: ItemServico = {
      id: crypto.randomUUID(),
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
    };
    onSave(item);
    resetForm();
  };

  const resetForm = () => {
    setReceitaId('');
    setMetragem('');
    setEspessura('');
    setCorte('');
    setMaterialId('');
    setMotorType('motor1');
    setDificuldade('facil');
    setEditQtdSuportes(null);
    setEditQtdPU(null);
    setEditQtdRebites(null);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { resetForm(); onClose(); } }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-primary">Adicionar Serviço</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receita */}
          <div>
            <Label>Tipo de Serviço</Label>
            <Select value={receitaId} onValueChange={setReceitaId}>
              <SelectTrigger><SelectValue placeholder="Selecione o serviço" /></SelectTrigger>
              <SelectContent>
                {receitas.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.nomeServico}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Motor toggle */}
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

          {/* Material */}
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

          {/* Medidas */}
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

          {/* Dificuldade */}
          {receita && (
            <div>
              <Label>Dificuldade</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(['facil', 'medio', 'dificil'] as Dificuldade[]).map(d => {
                  const fator = getFatorDificuldade(receita, d);
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

          {/* Resumo do cálculo */}
          {finalCalc && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground">Resumo do Item</h4>
              <div className="flex justify-between text-sm">
                <span>Material ({metragem}m)</span>
                <span className="font-medium">{fmt(finalCalc.custoTotalMaterial)}</span>
              </div>

              {/* Editable insumos */}
              {receita && receita.divisorSuporte > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs flex-1">Suportes</span>
                  <Input type="number" className="w-14 h-7 text-center text-xs" value={editQtdSuportes ?? finalCalc.qtdSuportes} onChange={e => setEditQtdSuportes(parseInt(e.target.value) || 0)} />
                  <span className="text-xs w-16 text-right">{fmt(finalCalc.custoSuportes)}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs flex-1">PU</span>
                <Input type="number" className="w-14 h-7 text-center text-xs" value={editQtdPU ?? finalCalc.qtdPU} onChange={e => setEditQtdPU(parseInt(e.target.value) || 0)} />
                <span className="text-xs w-16 text-right">{fmt(finalCalc.custoPU)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs flex-1">Rebites</span>
                <Input type="number" className="w-14 h-7 text-center text-xs" value={editQtdRebites ?? finalCalc.qtdRebites} onChange={e => setEditQtdRebites(parseInt(e.target.value) || 0)} />
                <span className="text-xs w-16 text-right">{fmt(finalCalc.custoRebites)}</span>
              </div>

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
      </DialogContent>
    </Dialog>
  );
}
