import { useState, useMemo, useEffect } from "react";
import { useMotor1, useMotor2, useInsumos, useRegras, useServicos } from "@/hooks/useSupabaseTechnicalData";
import {
  calcCustoMetroMotor1,
  calcCustoMetroMotor2,
  calcInsumosDinamicos,
  getFatorDificuldade,
} from "@/lib/calcEngine";
import { calcServicoAvulso, buildItemServicoAvulso } from "@/lib/calcServicoAvulso";
import { Dificuldade, ItemServico, InsumoCalculado, MotorType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Loader2,
  Factory,
  Truck,
  Check,
  ChevronsUpDown,
  Ruler,
  Gauge,
  Package,
  Calculator,
  Info,
  AlertTriangle,
  Wrench,
} from "lucide-react";
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

  // Filter services: motor services matching the budget's motor + ALL avulso services
  const servicosList = useMemo(
    () => allServicos.filter((s) => s.tipoServico === "avulso" || s.motorType === motorType),
    [allServicos, motorType],
  );

  const [servicoId, setServicoId] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [metragem, setMetragem] = useState("");
  const [dificuldade, setDificuldade] = useState<Dificuldade>("facil");
  const [editQtds, setEditQtds] = useState<Record<string, number>>({});
  // Avulso-specific state
  const [avulsoValor, setAvulsoValor] = useState("");
  const [avulsoQuantidade, setAvulsoQuantidade] = useState("");
  const [avulsoCustoInterno, setAvulsoCustoInterno] = useState("");

  // Pre-populate when editing an existing item
  useEffect(() => {
    if (open && editingItem) {
      setServicoId(editingItem.servicoTemplateId);
      setMetragem(String(editingItem.metragem));
      setDificuldade(editingItem.dificuldade);
      setEditQtds(editingItem.insumosOverrides ?? {});
      if (editingItem.valorUnitario != null) setAvulsoValor(String(editingItem.valorUnitario));
      if (editingItem.quantidade != null) setAvulsoQuantidade(String(editingItem.quantidade));
      // Restore persisted internal cost snapshot
      if (editingItem.custoInternoAplicado != null) {
        setAvulsoCustoInterno(String(editingItem.custoInternoAplicado));
      } else {
        setAvulsoCustoInterno("");
      }
    }
  }, [open, editingItem]);

  const servico = servicosList.find((s) => s.id === servicoId);
  const isAvulso = servico?.tipoServico === "avulso";
  const modoCobranca = servico?.modoCobranca ?? "motor";
  const regra = servico ? regrasList.find((r) => r.id === servico.regraId) : null;

  // Validation for motor data availability (only for motor services)
  const motorValidationError = useMemo(() => {
    if (!servico || isAvulso) return null;
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
  }, [servico, isAvulso, motorType, motor1List, motor2List]);

  // ─── Motor service calculation (existing logic) ───
  const calcMotor = useMemo(() => {
    if (!servico || isAvulso || !regra || !metragem || motorValidationError) return null;
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
  }, [
    servico,
    isAvulso,
    regra,
    metragem,
    dificuldade,
    motorType,
    motorValidationError,
    motor1List,
    motor2List,
    insumosList,
  ]);

  // ─── Avulso calculation ───
  const calcAvulsoResult = useMemo(() => {
    if (!servico || !isAvulso) return null;
    const valorNum = parseFloat(avulsoValor) || servico.valorBase;
    const qtdNum = parseFloat(avulsoQuantidade) || 0;
    const custoNum = avulsoCustoInterno ? parseFloat(avulsoCustoInterno) : servico.custoBaseInterno;
    const metNum = parseFloat(metragem) || 0;

    if (modoCobranca === "valor_fechado" && valorNum <= 0) return null;
    if (modoCobranca === "por_unidade" && (valorNum <= 0 || qtdNum <= 0)) return null;
    if (modoCobranca === "por_metro" && (valorNum <= 0 || metNum <= 0)) return null;

    return calcServicoAvulso(servico, {
      modo: modoCobranca,
      valorInformado: valorNum,
      quantidade: modoCobranca === "por_metro" ? metNum : qtdNum,
      custoInternoInformado: custoNum,
      dificuldade: modoCobranca === "por_metro" ? dificuldade : undefined,
      regra: modoCobranca === "por_metro" ? regra : null,
      insumosList: modoCobranca === "por_metro" ? insumosList : [],
    });
  }, [
    servico,
    isAvulso,
    avulsoValor,
    avulsoQuantidade,
    avulsoCustoInterno,
    metragem,
    dificuldade,
    modoCobranca,
    regra,
    insumosList,
  ]);

  // Build real overrides for motor services
  const calc = calcMotor;
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
  const selectedServiceResumo =
    servico && !isAvulso ? `${servico.materialPadrao} · ${servico.espessuraPadrao}mm · ${servico.cortePadrao}mm` : null;
  const selectedServiceRule = regra?.nomeRegra ?? null;

  // Can save?
  const canSave = isAvulso ? !!calcAvulsoResult && !!servicoId : !!finalCalc && !!servicoId && !motorValidationError;

  const handleSave = () => {
    if (!servico) return;

    if (isAvulso && calcAvulsoResult) {
      const valorNum = parseFloat(avulsoValor) || servico.valorBase;
      const qtdNum = parseFloat(avulsoQuantidade) || 0;
      const metNum = parseFloat(metragem) || 0;
      const custoNum = avulsoCustoInterno ? parseFloat(avulsoCustoInterno) : null;
      const item = buildItemServicoAvulso(servico, calcAvulsoResult, {
        id: editingItem?.id,
        motorType,
        dificuldade,
        metragem: modoCobranca === "por_metro" ? metNum : 0,
        quantidade: modoCobranca === "por_unidade" ? qtdNum : modoCobranca === "valor_fechado" ? 1 : metNum,
        valorUnitario: valorNum,
        custoInternoAplicado: custoNum,
      });
      onSave(item);
      resetForm();
      return;
    }

    if (!finalCalc) return;
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
      tipoServico: "motor",
      modoCobranca: "motor",
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
    setAvulsoValor("");
    setAvulsoQuantidade("");
    setAvulsoCustoInterno("");
  };

  // Pre-fill avulso valor from template when service changes
  useEffect(() => {
    if (servico && isAvulso && !editingItem) {
      setAvulsoValor(servico.valorBase > 0 ? String(servico.valorBase) : "");
      setAvulsoCustoInterno(servico.custoBaseInterno != null ? String(servico.custoBaseInterno) : "");
    }
  }, [servicoId, servico, isAvulso, editingItem]);

  // ─── Render ───
  const renderAvulsoForm = () => {
    if (!servico || !isAvulso) return null;

    return (
      <div className="space-y-4">
        {/* Mode indicator */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-foreground">
              {modoCobranca === "valor_fechado"
                ? "Valor fechado"
                : modoCobranca === "por_unidade"
                  ? `Por ${servico.unidadeCobranca || "unidade"}`
                  : "Por metro"}
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {modoCobranca === "valor_fechado"
              ? "Informe ou ajuste o valor total deste serviço."
              : modoCobranca === "por_unidade"
                ? `Informe a quantidade de ${servico.unidadeCobranca || "unidades"} e o valor por ${servico.unidadeCobranca || "unidade"}.`
                : "Informe a metragem. O sistema usa o custo base por metro, soma os insumos da regra e aplica a dificuldade para calcular o valor de venda."}
          </p>
        </div>

        {/* valor_fechado */}
        {modoCobranca === "valor_fechado" && (
          <div className="rounded-xl border bg-background/80 p-4">
            <Label className="text-xs font-medium">Valor do serviço (R$)</Label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="Ex: 350"
              value={avulsoValor}
              onChange={(e) => setAvulsoValor(e.target.value)}
              className="h-11 mt-2"
            />
          </div>
        )}

        {/* por_unidade */}
        {modoCobranca === "por_unidade" && (
          <div className="rounded-xl border bg-background/80 p-4 space-y-3">
            <div>
              <Label className="text-xs font-medium">Quantidade de {servico.unidadeCobranca || "unidades"}</Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Ex: 3"
                value={avulsoQuantidade}
                onChange={(e) => setAvulsoQuantidade(e.target.value)}
                className="h-11 mt-2"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Valor por {servico.unidadeCobranca || "unidade"} (R$)</Label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="Ex: 80"
                value={avulsoValor}
                onChange={(e) => setAvulsoValor(e.target.value)}
                className="h-11 mt-2"
              />
            </div>
          </div>
        )}

        {/* por_metro */}
        {modoCobranca === "por_metro" && (
          <>
            <div className="rounded-xl border bg-background/80 p-4 space-y-3">
              <div>
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-muted-foreground" /> Metragem
                </Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Ex: 12.5"
                  value={metragem}
                  onChange={(e) => setMetragem(e.target.value)}
                  className="h-11 mt-2"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Custo base por metro (R$)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Ex: 25"
                  value={avulsoValor}
                  onChange={(e) => setAvulsoValor(e.target.value)}
                  className="h-11 mt-2"
                />
              </div>
            </div>

            {/* Dificuldade selector */}
            <div className="rounded-xl border bg-background/80 p-4">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-muted-foreground" /> Dificuldade
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
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
          </>
        )}

        {/* Custo interno warning for valor_fechado and por_unidade — uses actual form state */}
        {(modoCobranca === "valor_fechado" || modoCobranca === "por_unidade") && !avulsoCustoInterno && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-700">Custo interno não informado</p>
              <p className="text-[11px] text-amber-600 mt-0.5">
                Este item pode ser orçado normalmente, mas o financeiro ficará com custo e margem incompletos.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAvulsoPreview = () => {
    if (!servico || !isAvulso) return null;

    if (!calcAvulsoResult) {
      return (
        <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-center">
          <Calculator className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            {modoCobranca === "valor_fechado"
              ? "Informe o valor para ver a prévia"
              : modoCobranca === "por_unidade"
                ? "Informe quantidade e valor"
                : "Informe metragem e custo base por metro"}
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Prévia do cálculo</p>
          <p className="text-sm font-semibold text-foreground mt-1">
            {modoCobranca === "valor_fechado"
              ? "Valor fechado"
              : modoCobranca === "por_unidade"
                ? `${avulsoQuantidade || 0} ${servico.unidadeCobranca || "un"} × ${fmt(parseFloat(avulsoValor) || 0)}`
                : `${metragem || 0}m × custo base ${fmt(parseFloat(avulsoValor) || 0)}/m`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border bg-background/80 p-3">
            <p className="text-[11px] text-muted-foreground">
              {modoCobranca === "por_metro" ? "Custo calculado" : "Custo interno"}
            </p>
            <p className="text-sm font-semibold text-foreground mt-1 tabular-nums">
              {calcAvulsoResult.custoIncompleto ? (
                <span className="text-amber-600">Não informado</span>
              ) : (
                fmt(calcAvulsoResult.custoTotalObra)
              )}
            </p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-[11px] text-muted-foreground">Valor de venda</p>
            <p className="text-sm font-semibold text-primary mt-1 tabular-nums">{fmt(calcAvulsoResult.valorVenda)}</p>
          </div>
        </div>

        {modoCobranca === "por_metro" && calcAvulsoResult.insumosCalc.length > 0 && (
          <div className="rounded-lg border bg-background/80 p-3 space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Insumos calculados</p>
            {calcAvulsoResult.insumosCalc.map((insumo) => (
              <div key={insumo.insumoId} className="flex items-center justify-between text-xs">
                <span className="text-foreground truncate">{insumo.nomeInsumo}</span>
                <span className="text-muted-foreground">
                  {insumo.quantidade} × {fmt(insumo.custoUnitario)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs pt-1 border-t">
              <span className="text-muted-foreground">Multiplicador</span>
              <span className="font-medium text-foreground">×{calcAvulsoResult.fatorDificuldade}</span>
            </div>
          </div>
        )}

        {calcAvulsoResult.custoIncompleto && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2">
            <p className="text-[10px] text-amber-700">
              ⚠ Custo interno ausente — margem e lucro ficarão marcados como parciais no financeiro.
            </p>
          </div>
        )}
      </div>
    );
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
              : "Escolha o serviço, informe os dados e deixe o sistema calcular."}
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
                    Escolha o serviço e configure os parâmetros. Serviços avulsos e do motor estão disponíveis.
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                  {motorLabel}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                {/* Service selector */}
                <div className="rounded-xl border bg-background/80 p-4">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" /> Qual serviço será realizado?
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-1 mb-2">
                    Busque pelo nome. Serviços do motor e avulsos aparecem juntos.
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
                            <span className="text-[11px] text-muted-foreground">
                              {isAvulso
                                ? `Avulso — ${modoCobranca === "valor_fechado" ? "Valor fechado" : modoCobranca === "por_unidade" ? `Por ${servico.unidadeCobranca || "unidade"}` : "Por metro"}`
                                : selectedServiceResumo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Buscar por nome...</span>
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
                        <CommandInput placeholder="Nome do serviço..." />
                        <CommandList className="max-h-[220px]">
                          <CommandEmpty>
                            {servicosList.length === 0
                              ? "Nenhum serviço disponível. Cadastre na aba Configurações."
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
                                  service.tipoServico === "avulso" ? "avulso" : "",
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
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{service.nomeServico}</span>
                                    {service.tipoServico === "avulso" && (
                                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                                        Avulso
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-muted-foreground">
                                    {service.tipoServico === "avulso"
                                      ? service.modoCobranca === "valor_fechado"
                                        ? `Valor fechado · ${fmt(service.valorBase)}`
                                        : service.modoCobranca === "por_unidade"
                                          ? `Por ${service.unidadeCobranca || "un"} · ${fmt(service.valorBase)}`
                                          : `Custo base · ${fmt(service.valorBase)}/m`
                                      : `${service.materialPadrao} · ${service.espessuraPadrao}mm · ${service.cortePadrao}mm`}
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

                {/* Motor-specific fields */}
                {servico && !isAvulso && (
                  <>
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
                  </>
                )}

                {/* Avulso-specific form */}
                {isAvulso && renderAvulsoForm()}

                {motorValidationError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    {motorValidationError}
                  </div>
                )}
              </div>

              {/* Right panel: preview */}
              <div className="space-y-4">
                {servico ? (
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Serviço selecionado
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-1">{servico.nomeServico}</p>
                    </div>
                    {!isAvulso && (
                      <div className="rounded-lg border bg-background/80 p-3">
                        <p className="text-[11px] font-medium text-muted-foreground">Base do cálculo</p>
                        <p className="text-sm text-foreground mt-1">{selectedServiceResumo}</p>
                        <p className="text-[11px] text-muted-foreground mt-2">
                          {selectedServiceRule
                            ? `Regra aplicada: ${selectedServiceRule}`
                            : "Este serviço ainda não tem regra de cálculo vinculada."}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-center">
                    <Info className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">Selecione um serviço para começar</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Quando você escolher um serviço, mostramos a prévia do cálculo aqui ao lado.
                    </p>
                  </div>
                )}

                {servico && !isAvulso && !regra && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
                    Este serviço está sem regra vinculada. Ajuste isso em Configurações antes de continuar.
                  </div>
                )}

                {/* Motor preview */}
                {!isAvulso && finalCalc ? (
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
                ) : !isAvulso ? (
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
                ) : null}

                {/* Avulso preview */}
                {isAvulso && renderAvulsoPreview()}
              </div>
            </div>

            {!canSave && (
              <p className="text-[11px] text-muted-foreground text-center">
                {isAvulso
                  ? "Preencha os valores necessários para habilitar o salvamento."
                  : "Selecione um serviço válido e informe a metragem para habilitar o salvamento."}
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
