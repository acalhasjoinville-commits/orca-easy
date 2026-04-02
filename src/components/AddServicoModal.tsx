import { useState, useMemo, useEffect } from "react";
import { useMotor1, useMotor2, useInsumos, useRegras, useServicos } from "@/hooks/useSupabaseTechnicalData";
import {
  calcCustoMetroMotor1,
  calcCustoMetroMotor2,
  calcInsumosDinamicos,
  getFatorDificuldade,
} from "@/lib/calcEngine";
import { Dificuldade, ItemServico, InsumoCalculado, MotorType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Loader2, Factory, Truck, Check, ChevronsUpDown, Ruler, Gauge, Package, Calculator, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/** Strip diacritics for accent-tolerant search */
function normalizeStr(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (item: ItemServico) => void;
  motorType: MotorType;
  /** When set, pre-populates all fields for editing an existing item */
  editingItem?: ItemServico | null;
}

export function AddServicoModal({ open, onClose, onSave, motorType, editingItem }: Props) {
  const { servicos: allServicos, isLoading: loadingServicos } = useServicos();
  const { regras: regrasList } = useRegras();
  const { motor1: motor1List } = useMotor1();
  const { motor2: motor2List } = useMotor2();
  const { insumos: insumosList } = useInsumos();

  // Filter services by the budget's motor
  const servicosList = useMemo(() => allServicos.filter((s) => s.motorType === motorType), [allServicos, motorType]);

  const [servicoId, setServicoId] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [metragem, setMetragem] = useState("");
  const [dificuldade, setDificuldade] = useState<Dificuldade>("facil");
  const [editQtds, setEditQtds] = useState<Record<string, number>>({});

  // Pre-populate when editing an existing item
  useEffect(() => {
    if (open && editingItem) {
      setServicoId(editingItem.servicoTemplateId);
      setMetragem(String(editingItem.metragem));
      setDificuldade(editingItem.dificuldade);
      setEditQtds(editingItem.insumosOverrides ?? {});
    }
  }, [open, editingItem]);

  const servico = servicosList.find((s) => s.id === servicoId);
  const regra = servico ? regrasList.find((r) => r.id === servico.regraId) : null;

  // Validation for motor data availability
  const motorValidationError = useMemo(() => {
    if (!servico) return null;
    if (motorType === "motor1") {
      const found = motor1List.find((e) => e.material === servico.materialPadrao);
      if (!found) return `Material "${servico.materialPadrao}" não encontrado na base do Motor 1.`;
    } else {
      const found = motor2List.find(
        (e) =>
          e.material === servico.materialPadrao &&
          e.espessura === servico.espessuraPadrao &&
          e.corte === servico.cortePadrao,
      );
      if (!found)
        return `Combinação ${servico.materialPadrao} ${servico.espessuraPadrao}mm ${servico.cortePadrao}mm não encontrada no Motor 2.`;
    }
    return null;
  }, [servico, motorType, motor1List, motor2List]);

  const calc = useMemo(() => {
    if (!servico || !regra || !metragem || motorValidationError) return null;
    const m = parseFloat(metragem);
    if (isNaN(m) || m <= 0) return null;

    let custoMetroLinear: number;
    if (motorType === "motor1") {
      const motor1 = motor1List.find((e) => e.material === servico.materialPadrao);
      if (!motor1) return null;
      custoMetroLinear = calcCustoMetroMotor1(servico.espessuraPadrao, servico.cortePadrao, motor1);
    } else {
      const resultado = calcCustoMetroMotor2(
        servico.materialPadrao,
        servico.espessuraPadrao,
        servico.cortePadrao,
        motor2List,
      );
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
      const base = calc.insumosCalc.find((ic) => ic.insumoId === insumoId);
      if (base && manualQty !== base.quantidade) {
        result[insumoId] = manualQty;
      }
    }
    return result;
  }, [calc, editQtds]);

  const finalCalc = useMemo(() => {
    if (!calc) return null;

    const insumosFinais: InsumoCalculado[] = calc.insumosCalc.map((ic) => {
      const qtdOverride = editQtds[ic.insumoId];
      const quantidade = qtdOverride !== undefined ? qtdOverride : ic.quantidade;
      return { ...ic, quantidade, custoTotal: quantidade * ic.custoUnitario };
    });

    const custoTotalInsumos = insumosFinais.reduce((s, i) => s + i.custoTotal, 0);
    const custoTotalObra = calc.custoTotalMaterial + custoTotalInsumos;
    const valorVenda = custoTotalObra * calc.fatorDificuldade;

    return { ...calc, insumosFinais, custoTotalInsumos, custoTotalObra, valorVenda };
  }, [calc, editQtds]);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const dificuldadeLabel: Record<Dificuldade, string> = {
    facil: "Fácil",
    medio: "Médio",
    dificil: "Difícil",
  };

  const dificuldadeHint: Record<Dificuldade, string> = {
    facil: "Acesso livre, sem obstáculos",
    medio: "Acesso parcial ou altura moderada",
    dificil: "Acesso restrito, altura elevada",
  };

  const motorLabel = motorType === "motor1" ? "Motor 1 — Fabricação" : "Motor 2 — Compra Dobrada";
  const motorHelper =
    motorType === "motor1"
      ? "Use quando a peça será fabricada na empresa, com cálculo por peso."
      : "Use quando a peça já é comprada dobrada, com preço por metro linear.";
  const overrideCount = Object.keys(realOverrides).length;
  const metragemNumero = parseFloat(metragem);
  const hasValidMetragem = !Number.isNaN(metragemNumero) && metragemNumero > 0;
  const selectedServiceResumo = servico
    ? `${servico.materialPadrao} · ${servico.espessuraPadrao}mm · ${servico.cortePadrao}mm`
    : null;
  const selectedServiceRule = regra?.nomeRegra ?? null;

  const canSave = !!finalCalc && !!servicoId && !motorValidationError;

  const handleSave = () => {
    if (!finalCalc || !servico) return;
    const item: ItemServico = {
      id: editingItem?.id ?? crypto.randomUUID(),
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
    setServicoId("");
    setMetragem("");
    setDificuldade("facil");
    setEditQtds({});
    setPopoverOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Editar Serviço" : "Adicionar Serviço ao Orçamento"}</DialogTitle>
          <DialogDescription className="text-xs">
            {editingItem
              ? "Altere serviço, metragem ou dificuldade. O cálculo será atualizado automaticamente."
              : "Escolha o serviço, informe a metragem e deixe o sistema calcular material, insumos e valor de venda."}
          </DialogDescription>
          <Badge variant="outline" className="w-fit text-[10px] mt-1">
            {motorType === "motor1" ? (
              <>
                <Factory className="mr-1 h-3 w-3" /> Motor 1 — Fabricação
              </>
            ) : (
              <>
                <Truck className="mr-1 h-3 w-3" /> Motor 2 — Compra Dobrada
              </>
            )}
          </Badge>
        </DialogHeader>

        {loadingServicos ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/20 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">Monte um serviço por vez</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Escolha o serviço, informe a metragem e ajuste os insumos apenas se precisar sair da regra padrão.
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                  {motorLabel}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">{motorHelper}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="rounded-xl border bg-background/80 p-4">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" /> Qual serviço será realizado?
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-1 mb-2">
                    Busque pelo nome, material, espessura ou corte para encontrar o serviço certo.
                  </p>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={popoverOpen}
                        className="w-full justify-between h-auto min-h-11 font-normal"
                      >
                        {servico ? (
                          <div className="flex flex-col items-start text-left">
                            <span className="text-sm font-medium">{servico.nomeServico}</span>
                            <span className="text-[11px] text-muted-foreground">{selectedServiceResumo}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Buscar por nome, material ou espessura...</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command
                        filter={(value, search, keywords) => {
                          if (!search) return 1;
                          const norm = normalizeStr(search);
                          const target = normalizeStr((keywords ?? []).join(" "));
                          return target.includes(norm) ? 1 : 0;
                        }}
                      >
                        <CommandInput placeholder="Nome, material, espessura, corte..." />
                        <CommandList className="max-h-[220px]">
                          <CommandEmpty>
                            {servicosList.length === 0
                              ? `Nenhum serviço cadastrado para ${motorType === "motor1" ? "Motor 1" : "Motor 2"}. Cadastre na aba Configurações.`
                              : "Nenhum serviço encontrado com este termo."}
                          </CommandEmpty>
                          <CommandGroup>
                            {servicosList.map((service) => (
                              <CommandItem
                                key={service.id}
                                value={service.id}
                                keywords={[
                                  service.nomeServico,
                                  service.materialPadrao,
                                  String(service.espessuraPadrao),
                                  String(service.cortePadrao),
                                ]}
                                onSelect={(value) => {
                                  setServicoId(value === servicoId ? "" : value);
                                  setEditQtds({});
                                  setPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 shrink-0",
                                    servicoId === service.id ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{service.nomeServico}</span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {service.materialPadrao} · {service.espessuraPadrao}mm · {service.cortePadrao}mm
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

                <div className="rounded-xl border bg-background/80 p-4">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5 text-muted-foreground" /> Quantos metros serão executados?
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-1 mb-2">
                    Informe a metragem total em metros lineares para este serviço.
                  </p>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="Ex: 12.5"
                    value={metragem}
                    onChange={(event) => setMetragem(event.target.value)}
                    className="h-11"
                  />
                </div>

                {servico && (
                  <div className="rounded-xl border bg-background/80 p-4">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5 text-muted-foreground" /> Nível de dificuldade da instalação
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-1 mb-3">
                      Quanto maior a dificuldade, maior o multiplicador sobre o custo final do serviço.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {(["facil", "medio", "dificil"] as Dificuldade[]).map((level) => {
                        const fator = getFatorDificuldade(servico, level);
                        return (
                          <button
                            key={level}
                            onClick={() => setDificuldade(level)}
                            className={cn(
                              "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all",
                              dificuldade === level
                                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                                : "border-border text-muted-foreground hover:border-primary/30",
                            )}
                          >
                            <span className="text-sm font-semibold">{dificuldadeLabel[level]}</span>
                            <span className="text-[10px] text-muted-foreground">{dificuldadeHint[level]}</span>
                            <span className="text-xs font-bold mt-1">×{fator}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {motorValidationError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    {motorValidationError}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {servico ? (
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Serviço selecionado
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-1">{servico.nomeServico}</p>
                    </div>
                    <div className="rounded-lg border bg-background/80 p-3">
                      <p className="text-[11px] font-medium text-muted-foreground">Base do cálculo</p>
                      <p className="text-sm text-foreground mt-1">{selectedServiceResumo}</p>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        {selectedServiceRule
                          ? `Regra aplicada: ${selectedServiceRule}`
                          : "Este serviço ainda não tem regra de cálculo vinculada."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-center">
                    <Info className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">Selecione um serviço para começar</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Quando você escolher um serviço, mostramos material, regra e a prévia do cálculo aqui ao lado.
                    </p>
                  </div>
                )}

                {servico && !regra && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
                    Este serviço está sem regra vinculada. Ajuste isso em Configurações antes de continuar.
                  </div>
                )}

                {finalCalc ? (
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Prévia do cálculo
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-1">
                          Veja como este serviço entra no orçamento
                        </p>
                      </div>
                      {overrideCount > 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          {overrideCount} ajuste{overrideCount > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border bg-background/80 p-3">
                        <p className="text-[11px] text-muted-foreground">Material base</p>
                        <p className="text-sm font-semibold text-foreground mt-1 tabular-nums">
                          {fmt(finalCalc.custoTotalMaterial)}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-background/80 p-3">
                        <p className="text-[11px] text-muted-foreground">Custo dos insumos</p>
                        <p className="text-sm font-semibold text-foreground mt-1 tabular-nums">
                          {fmt(finalCalc.custoTotalInsumos)}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-background/80 p-3">
                        <p className="text-[11px] text-muted-foreground">Custo total</p>
                        <p className="text-sm font-semibold text-foreground mt-1 tabular-nums">
                          {fmt(finalCalc.custoTotalObra)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <p className="text-[11px] text-muted-foreground">Valor de venda</p>
                        <p className="text-sm font-semibold text-primary mt-1 tabular-nums">
                          {fmt(finalCalc.valorVenda)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-background/80 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Insumos calculados
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {finalCalc.insumosFinais.length > 0
                            ? "Ajuste a quantidade se precisar."
                            : "Sem insumos adicionais."}
                        </p>
                      </div>

                      {finalCalc.insumosFinais.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Este serviço não adiciona insumos extras na regra atual.
                        </p>
                      ) : (
                        finalCalc.insumosFinais.map((insumo) => (
                          <div
                            key={insumo.insumoId}
                            className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-foreground truncate">{insumo.nomeInsumo}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {fmt(insumo.custoUnitario)} por unidade
                              </p>
                            </div>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              inputMode="numeric"
                              className="w-16 h-8 text-center text-xs"
                              value={
                                editQtds[insumo.insumoId] !== undefined ? editQtds[insumo.insumoId] : insumo.quantidade
                              }
                              onChange={(event) => {
                                const raw = event.target.value;
                                if (raw === "") {
                                  setEditQtds((current) => {
                                    const next = { ...current };
                                    delete next[insumo.insumoId];
                                    return next;
                                  });
                                  return;
                                }
                                const parsed = parseInt(raw, 10);
                                if (Number.isNaN(parsed) || parsed < 0) return;
                                setEditQtds((current) => ({ ...current, [insumo.insumoId]: parsed }));
                              }}
                            />
                            <span className="w-20 text-right text-xs font-medium tabular-nums">
                              {fmt(insumo.custoTotal)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Multiplicador de dificuldade</span>
                      <span className="font-medium text-foreground">×{finalCalc.fatorDificuldade}</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-center">
                    <Calculator className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">
                      {!servico
                        ? "Escolha um serviço para ver a prévia"
                        : motorValidationError
                          ? "Corrija a base do motor para continuar"
                          : !hasValidMetragem
                            ? "Informe a metragem para gerar o cálculo"
                            : "Complete os dados para ver a prévia"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {!servico
                        ? "A prévia mostra material, insumos, custo total e valor de venda."
                        : motorValidationError
                          ? "O serviço precisa existir corretamente na base do motor selecionado."
                          : !hasValidMetragem
                            ? "Assim que a metragem for preenchida, o sistema calcula tudo automaticamente."
                            : "Revise o serviço e a regra para continuar."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {!canSave && (
              <p className="text-[11px] text-muted-foreground text-center">
                Selecione um serviço válido e informe a metragem para habilitar o salvamento.
              </p>
            )}

            <Button onClick={handleSave} disabled={!canSave} className="w-full h-11 font-semibold">
              {editingItem ? "Salvar alterações do serviço" : "Adicionar este serviço ao orçamento"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
