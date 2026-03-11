import { useState, useMemo } from 'react';
import { useMotor1, useMotor2, useInsumos, useRegras, useServicos } from '@/hooks/useSupabaseTechnicalData';
import { calcCustoMetroMotor1, calcCustoMetroMotor2, calcInsumosDinamicos, getFatorDificuldade } from '@/lib/calcEngine';
import { Dificuldade, ItemServico, InsumoCalculado, MotorType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Loader2, Factory, Truck, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/** Strip diacritics for accent-tolerant search */
function normalizeStr(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (item: ItemServico) => void;
  motorType: MotorType;
}

export function AddServicoModal({ open, onClose, onSave, motorType }: Props) {
  const { servicos: allServicos, isLoading: loadingServicos } = useServicos();
  const { regras: regrasList } = useRegras();
  const { motor1: motor1List } = useMotor1();
  const { motor2: motor2List } = useMotor2();
  const { insumos: insumosList } = useInsumos();

  // Filter services by the budget's motor
  const servicosList = useMemo(
    () => allServicos.filter(s => s.motorType === motorType),
    [allServicos, motorType]
  );

  const [servicoId, setServicoId] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [metragem, setMetragem] = useState('');
  const [dificuldade, setDificuldade] = useState<Dificuldade>('facil');
  const [editQtds, setEditQtds] = useState<Record<string, number>>({});

  const servico = servicosList.find(s => s.id === servicoId);
  const regra = servico ? regrasList.find(r => r.id === servico.regraId) : null;

  // Validation for motor data availability
  const motorValidationError = useMemo(() => {
    if (!servico) return null;
    if (motorType === 'motor1') {
      const found = motor1List.find(e => e.material === servico.materialPadrao);
      if (!found) return `Material "${servico.materialPadrao}" não encontrado na base do Motor 1.`;
    } else {
      const found = motor2List.find(
        e => e.material === servico.materialPadrao && e.espessura === servico.espessuraPadrao && e.corte === servico.cortePadrao
      );
      if (!found) return `Combinação ${servico.materialPadrao} ${servico.espessuraPadrao}mm ${servico.cortePadrao}mm não encontrada no Motor 2.`;
    }
    return null;
  }, [servico, motorType, motor1List, motor2List]);

  const calc = useMemo(() => {
    if (!servico || !regra || !metragem || motorValidationError) return null;
    const m = parseFloat(metragem);
    if (isNaN(m) || m <= 0) return null;

    let custoMetroLinear: number;
    if (motorType === 'motor1') {
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
  }, [servico, regra, metragem, dificuldade, motorType, motorValidationError, motor1List, motor2List, insumosList]);

  // Build real overrides: only entries where manual qty differs from calculated base
  const realOverrides = useMemo(() => {
    if (!calc) return {};
    const result: Record<string, number> = {};
    for (const [insumoId, manualQty] of Object.entries(editQtds)) {
      const base = calc.insumosCalc.find(ic => ic.insumoId === insumoId);
      if (base && manualQty !== base.quantidade) {
        result[insumoId] = manualQty;
      }
    }
    return result;
  }, [calc, editQtds]);

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

  const canSave = !!finalCalc && !!servicoId && !motorValidationError;

  const handleSave = () => {
    if (!finalCalc || !servico) return;
    const item: ItemServico = {
      id: crypto.randomUUID(),
      servicoTemplateId: servico.id,
      nomeServico: servico.nomeServico,
      motorType,
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
      insumosOverrides: Object.keys(realOverrides).length > 0 ? realOverrides : undefined,
    };
    onSave(item);
    resetForm();
  };

  const resetForm = () => {
    setServicoId('');
    setMetragem('');
    setDificuldade('facil');
    setEditQtds({});
    setPopoverOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { resetForm(); onClose(); } }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-primary">Adicionar Serviço</DialogTitle>
          <Badge variant="outline" className="w-fit text-[10px] mt-1">
            {motorType === 'motor1' ? (
              <><Factory className="mr-1 h-3 w-3" /> Motor 1 — Fabricar</>
            ) : (
              <><Truck className="mr-1 h-3 w-3" /> Motor 2 — Comprar Dobrado</>
            )}
          </Badge>
        </DialogHeader>

        {loadingServicos ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Serviço</Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full justify-between h-auto min-h-10 font-normal"
                  >
                    {servico ? (
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm">{servico.nomeServico}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {servico.materialPadrao} · {servico.espessuraPadrao}mm · {servico.cortePadrao}mm
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Buscar serviço...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command filter={(value, search, keywords) => {
                    if (!search) return 1;
                    const norm = normalizeStr(search);
                    const target = normalizeStr((keywords ?? []).join(' '));
                    return target.includes(norm) ? 1 : 0;
                  }}>
                    <CommandInput placeholder="Nome, material, espessura, corte..." />
                    <CommandList className="max-h-[220px]">
                      <CommandEmpty>
                        {servicosList.length === 0
                          ? `Nenhum serviço cadastrado para ${motorType === 'motor1' ? 'Motor 1' : 'Motor 2'}.`
                          : 'Nenhum serviço encontrado.'}
                      </CommandEmpty>
                      <CommandGroup>
                        {servicosList.map(s => (
                          <CommandItem
                            key={s.id}
                            value={s.id}
                            keywords={[s.nomeServico, s.materialPadrao, String(s.espessuraPadrao), String(s.cortePadrao)]}
                            onSelect={(val) => {
                              setServicoId(val === servicoId ? '' : val);
                              setEditQtds({});
                              setPopoverOpen(false);
                            }}
                          >
                            <Check className={cn('mr-2 h-4 w-4 shrink-0', servicoId === s.id ? 'opacity-100' : 'opacity-0')} />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{s.nomeServico}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {s.materialPadrao} · {s.espessuraPadrao}mm · {s.cortePadrao}mm
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {servico && regra && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">Material:</span> {servico.materialPadrao} · {servico.espessuraPadrao}mm · {servico.cortePadrao}mm</p>
                <p><span className="font-medium text-foreground">Regra:</span> {regra.nomeRegra}</p>
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
                <h4 className="text-xs font-semibold text-muted-foreground">Resumo do Item</h4>
                <div className="flex justify-between text-sm">
                  <span>Material ({metragem}m)</span>
                  <span className="font-medium">{fmt(finalCalc.custoTotalMaterial)}</span>
                </div>

                {finalCalc.insumosFinais.map(ic => (
                  <div key={ic.insumoId} className="flex items-center justify-between gap-2">
                    <span className="text-xs flex-1 truncate">{ic.nomeInsumo}</span>
                     <Input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      className="w-14 h-7 text-center text-xs"
                      value={editQtds[ic.insumoId] !== undefined ? editQtds[ic.insumoId] : ic.quantidade}
                      onChange={e => {
                        const raw = e.target.value;
                        if (raw === '') {
                          // Empty field = remove override (revert to calculated)
                          setEditQtds(prev => {
                            const next = { ...prev };
                            delete next[ic.insumoId];
                            return next;
                          });
                          return;
                        }
                        const parsed = parseInt(raw, 10);
                        if (isNaN(parsed) || parsed < 0) return;
                        setEditQtds(prev => ({ ...prev, [ic.insumoId]: parsed }));
                      }}
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
