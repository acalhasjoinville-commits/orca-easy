import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { u as useServicos, a as useRegras, b as useMotor1, c as useMotor2, d as useInsumos, C as ChevronsUpDown, e as Command, f as CommandInput, g as CommandList, h as CommandEmpty, i as CommandGroup, j as CommandItem, k as Calculator } from "./command-Bw2vydg5.js";
import { c as createLucideIcon, e as LoaderCircle, B as Button, a as cn, I as Input, d as ue, h as useClientes, i as usePoliticas, f as useOrcamentos, j as useEmpresa, U as Users, S as Shield, P as Plus, F as FileText } from "./index-BN5a_yey.js";
import { u as useDraft } from "./useDraft-B2tUcsQY.js";
import { T as Textarea } from "./textarea-B24Ov2Sw.js";
import { C as Card, a as CardContent } from "./card-B4K8qJaR.js";
import { L as Label } from "./label-BChNKNza.js";
import { B as Badge, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DQUVPZUM.js";
import { g as getCustoUnitario } from "./types-DSYQLPIT.js";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogDescription } from "./dialog-ScvtRc5R.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent, S as Save } from "./popover-Bh9k5wbj.js";
import { F as Factory, T as Truck, C as Copy, a as CreditCard, P as PDFDownloadButton } from "./PDFDownloadButton-B9hfEiE-.js";
import { C as Check } from "./check-D0l1wUju.js";
import { C as ClienteFormModal } from "./ClienteFormModal-DVNdUYaE.js";
import { A as AlertDialog, h as AlertDialogTrigger, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction, P as Pencil } from "./alert-dialog-C9g92JDz.js";
import { S as Search } from "./search-CUbuJP2V.js";
import { U as UserPlus } from "./user-plus-CKnt5lBi.js";
import { A as ArrowRight } from "./arrow-right-CwcInH32.js";
import { A as ArrowLeft } from "./arrow-left-lde2cEfB.js";
import { T as Trash2 } from "./trash-2-DvXBRZTj.js";
import { C as CalendarDays } from "./calendar-days-3Dqi55VX.js";
import "./charts-vendor-BrW5ULH7.js";
import "./query-vendor-BLvK6anV.js";
import "./radix-vendor-CEzLCFk2.js";
import "./pdf-vendor-Dv6cUxDn.js";
import "./router-vendor-CCo6OTFM.js";
import "./supabase-vendor-BsjcsmU5.js";
import "./user-A1J5wkwB.js";
import "./building-2-DctO8KH6.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CircleHelp = createLucideIcon("CircleHelp", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Gauge = createLucideIcon("Gauge", [
  ["path", { d: "m12 14 4-4", key: "9kzdfg" }],
  ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0", key: "19p75a" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Info = createLucideIcon("Info", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Package = createLucideIcon("Package", [
  [
    "path",
    {
      d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
      key: "1a0edw"
    }
  ],
  ["path", { d: "M12 22V12", key: "d0xqtd" }],
  ["path", { d: "m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7", key: "yx3hmr" }],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const RotateCcw = createLucideIcon("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ruler = createLucideIcon("Ruler", [
  [
    "path",
    {
      d: "M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z",
      key: "icamh8"
    }
  ],
  ["path", { d: "m14.5 12.5 2-2", key: "inckbg" }],
  ["path", { d: "m11.5 9.5 2-2", key: "fmmyf7" }],
  ["path", { d: "m8.5 6.5 2-2", key: "vc6u1g" }],
  ["path", { d: "m17.5 15.5 2-2", key: "wo5hmg" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ShoppingCart = createLucideIcon("ShoppingCart", [
  ["circle", { cx: "8", cy: "21", r: "1", key: "jimo8o" }],
  ["circle", { cx: "19", cy: "21", r: "1", key: "13723u" }],
  [
    "path",
    {
      d: "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",
      key: "9zh506"
    }
  ]
]);
function calcCustoMetroMotor1(espessura, corte, motor1) {
  const pesoMetro = espessura * corte * 100 * motor1.densidade / 1e5;
  return pesoMetro * motor1.precoQuilo;
}
function calcCustoMetroMotor2(material, espessura, corte, motor2List) {
  const entry = motor2List.find(
    (e) => e.material === material && e.espessura === espessura && e.corte === corte
  );
  return entry ? entry.precoMetroLinear : null;
}
function calcInsumosDinamicos(metragem, regra, insumosList) {
  return regra.itensRegra.map((itemRegra) => {
    const insumo = insumosList.find((i) => i.id === itemRegra.insumoId);
    if (!insumo) return { insumoId: itemRegra.insumoId, nomeInsumo: "?", quantidade: 0, custoUnitario: 0, custoTotal: 0 };
    const quantidade = itemRegra.metodoCalculo === "multiplicar" ? Math.ceil(metragem * itemRegra.fator) : Math.ceil(metragem / itemRegra.fator);
    const custoUnitario = getCustoUnitario(insumo);
    return {
      insumoId: insumo.id,
      nomeInsumo: insumo.nomeEmbalagemCompra,
      quantidade,
      custoUnitario,
      custoTotal: quantidade * custoUnitario
    };
  });
}
function getFatorDificuldade(servico, dificuldade) {
  if (dificuldade === "facil") return servico.dificuldadeFacil;
  if (dificuldade === "medio") return servico.dificuldadeMedia;
  return servico.dificuldadeDificil;
}
function normalizeStr(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function AddServicoModal({ open, onClose, onSave, motorType, editingItem }) {
  const { servicos: allServicos, isLoading: loadingServicos } = useServicos();
  const { regras: regrasList } = useRegras();
  const { motor1: motor1List } = useMotor1();
  const { motor2: motor2List } = useMotor2();
  const { insumos: insumosList } = useInsumos();
  const servicosList = reactExports.useMemo(() => allServicos.filter((s) => s.motorType === motorType), [allServicos, motorType]);
  const [servicoId, setServicoId] = reactExports.useState("");
  const [popoverOpen, setPopoverOpen] = reactExports.useState(false);
  const [metragem, setMetragem] = reactExports.useState("");
  const [dificuldade, setDificuldade] = reactExports.useState("facil");
  const [editQtds, setEditQtds] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (open && editingItem) {
      setServicoId(editingItem.servicoTemplateId);
      setMetragem(String(editingItem.metragem));
      setDificuldade(editingItem.dificuldade);
      setEditQtds(editingItem.insumosOverrides ?? {});
    }
  }, [open, editingItem]);
  const servico = servicosList.find((s) => s.id === servicoId);
  const regra = servico ? regrasList.find((r) => r.id === servico.regraId) : null;
  const motorValidationError = reactExports.useMemo(() => {
    if (!servico) return null;
    if (motorType === "motor1") {
      const found = motor1List.find((e) => e.material === servico.materialPadrao);
      if (!found) return `Material "${servico.materialPadrao}" não encontrado na base do Motor 1.`;
    } else {
      const found = motor2List.find(
        (e) => e.material === servico.materialPadrao && e.espessura === servico.espessuraPadrao && e.corte === servico.cortePadrao
      );
      if (!found)
        return `Combinação ${servico.materialPadrao} ${servico.espessuraPadrao}mm ${servico.cortePadrao}mm não encontrada no Motor 2.`;
    }
    return null;
  }, [servico, motorType, motor1List, motor2List]);
  const calc = reactExports.useMemo(() => {
    if (!servico || !regra || !metragem || motorValidationError) return null;
    const m = parseFloat(metragem);
    if (isNaN(m) || m <= 0) return null;
    let custoMetroLinear;
    if (motorType === "motor1") {
      const motor1 = motor1List.find((e) => e.material === servico.materialPadrao);
      if (!motor1) return null;
      custoMetroLinear = calcCustoMetroMotor1(servico.espessuraPadrao, servico.cortePadrao, motor1);
    } else {
      const resultado = calcCustoMetroMotor2(
        servico.materialPadrao,
        servico.espessuraPadrao,
        servico.cortePadrao,
        motor2List
      );
      if (resultado === null) return null;
      custoMetroLinear = resultado;
    }
    const custoTotalMaterial = custoMetroLinear * m;
    const insumosCalc = calcInsumosDinamicos(m, regra, insumosList);
    const fator = getFatorDificuldade(servico, dificuldade);
    return { custoMetroLinear, custoTotalMaterial, insumosCalc, fatorDificuldade: fator };
  }, [servico, regra, metragem, dificuldade, motorType, motorValidationError, motor1List, motor2List, insumosList]);
  const realOverrides = reactExports.useMemo(() => {
    if (!calc) return {};
    const result = {};
    for (const [insumoId, manualQty] of Object.entries(editQtds)) {
      const base = calc.insumosCalc.find((ic) => ic.insumoId === insumoId);
      if (base && manualQty !== base.quantidade) {
        result[insumoId] = manualQty;
      }
    }
    return result;
  }, [calc, editQtds]);
  const finalCalc = reactExports.useMemo(() => {
    if (!calc) return null;
    const insumosFinais = calc.insumosCalc.map((ic) => {
      const qtdOverride = editQtds[ic.insumoId];
      const quantidade = qtdOverride !== void 0 ? qtdOverride : ic.quantidade;
      return { ...ic, quantidade, custoTotal: quantidade * ic.custoUnitario };
    });
    const custoTotalInsumos = insumosFinais.reduce((s, i) => s + i.custoTotal, 0);
    const custoTotalObra = calc.custoTotalMaterial + custoTotalInsumos;
    const valorVenda = custoTotalObra * calc.fatorDificuldade;
    return { ...calc, insumosFinais, custoTotalInsumos, custoTotalObra, valorVenda };
  }, [calc, editQtds]);
  const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const dificuldadeLabel = {
    facil: "Fácil",
    medio: "Médio",
    dificil: "Difícil"
  };
  const dificuldadeHint = {
    facil: "Acesso livre, sem obstáculos",
    medio: "Acesso parcial ou altura moderada",
    dificil: "Acesso restrito, altura elevada"
  };
  const motorLabel = motorType === "motor1" ? "Motor 1 — Fabricação" : "Motor 2 — Compra Dobrada";
  const motorHelper = motorType === "motor1" ? "Use quando a peça será fabricada na empresa, com cálculo por peso." : "Use quando a peça já é comprada dobrada, com preço por metro linear.";
  const overrideCount = Object.keys(realOverrides).length;
  const metragemNumero = parseFloat(metragem);
  const hasValidMetragem = !Number.isNaN(metragemNumero) && metragemNumero > 0;
  const selectedServiceResumo = servico ? `${servico.materialPadrao} · ${servico.espessuraPadrao}mm · ${servico.cortePadrao}mm` : null;
  const selectedServiceRule = (regra == null ? void 0 : regra.nomeRegra) ?? null;
  const canSave = !!finalCalc && !!servicoId && !motorValidationError;
  const handleSave = () => {
    if (!finalCalc || !servico) return;
    const item = {
      id: (editingItem == null ? void 0 : editingItem.id) ?? crypto.randomUUID(),
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
      insumosOverrides: Object.keys(realOverrides).length > 0 ? realOverrides : void 0
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onOpenChange: (v) => {
        if (!v) {
          resetForm();
          onClose();
        }
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto max-w-3xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingItem ? "Editar Serviço" : "Adicionar Serviço ao Orçamento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-xs", children: editingItem ? "Altere serviço, metragem ou dificuldade. O cálculo será atualizado automaticamente." : "Escolha o serviço, informe a metragem e deixe o sistema calcular material, insumos e valor de venda." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "w-fit text-[10px] mt-1", children: motorType === "motor1" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Factory, { className: "mr-1 h-3 w-3" }),
            " Motor 1 — Fabricação"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "mr-1 h-3 w-3" }),
            " Motor 2 — Compra Dobrada"
          ] }) })
        ] }),
        loadingServicos ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground", children: "Monte um serviço por vez" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Escolha o serviço, informe a metragem e ajuste os insumos apenas se precisar sair da regra padrão." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] whitespace-nowrap", children: motorLabel })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-2", children: motorHelper })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-background/80 p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                  " Qual serviço será realizado?"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1 mb-2", children: "Busque pelo nome, material, espessura ou corte para encontrar o serviço certo." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: popoverOpen, onOpenChange: setPopoverOpen, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      variant: "outline",
                      role: "combobox",
                      "aria-expanded": popoverOpen,
                      className: "w-full justify-between h-auto min-h-11 font-normal",
                      children: [
                        servico ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start text-left", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: servico.nomeServico }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: selectedServiceResumo })
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Buscar por nome, material ou espessura..." }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Command,
                    {
                      filter: (value, search, keywords) => {
                        if (!search) return 1;
                        const norm = normalizeStr(search);
                        const target = normalizeStr((keywords ?? []).join(" "));
                        return target.includes(norm) ? 1 : 0;
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Nome, material, espessura, corte..." }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { className: "max-h-[220px]", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: servicosList.length === 0 ? `Nenhum serviço cadastrado para ${motorType === "motor1" ? "Motor 1" : "Motor 2"}. Cadastre na aba Configurações.` : "Nenhum serviço encontrado com este termo." }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: servicosList.map((service) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            CommandItem,
                            {
                              value: service.id,
                              keywords: [
                                service.nomeServico,
                                service.materialPadrao,
                                String(service.espessuraPadrao),
                                String(service.cortePadrao)
                              ],
                              onSelect: (value) => {
                                setServicoId(value === servicoId ? "" : value);
                                setEditQtds({});
                                setPopoverOpen(false);
                              },
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Check,
                                  {
                                    className: cn(
                                      "mr-2 h-4 w-4 shrink-0",
                                      servicoId === service.id ? "opacity-100" : "opacity-0"
                                    )
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: service.nomeServico }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
                                    service.materialPadrao,
                                    " · ",
                                    service.espessuraPadrao,
                                    "mm · ",
                                    service.cortePadrao,
                                    "mm"
                                  ] })
                                ] })
                              ]
                            },
                            service.id
                          )) })
                        ] })
                      ]
                    }
                  ) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-background/80 p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Ruler, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                  " Quantos metros serão executados?"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1 mb-2", children: "Informe a metragem total em metros lineares para este serviço." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    inputMode: "decimal",
                    placeholder: "Ex: 12.5",
                    value: metragem,
                    onChange: (event) => setMetragem(event.target.value),
                    className: "h-11"
                  }
                )
              ] }),
              servico && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-background/80 p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                  " Nível de dificuldade da instalação"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1 mb-3", children: "Quanto maior a dificuldade, maior o multiplicador sobre o custo final do serviço." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: ["facil", "medio", "dificil"].map((level) => {
                  const fator = getFatorDificuldade(servico, level);
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => setDificuldade(level),
                      className: cn(
                        "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all",
                        dificuldade === level ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20" : "border-border text-muted-foreground hover:border-primary/30"
                      ),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: dificuldadeLabel[level] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: dificuldadeHint[level] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold mt-1", children: [
                          "×",
                          fator
                        ] })
                      ]
                    },
                    level
                  );
                }) })
              ] }),
              motorValidationError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive", children: motorValidationError })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              servico ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-4 space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Serviço selecionado" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground mt-1", children: servico.nomeServico })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-background/80 p-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-muted-foreground", children: "Base do cálculo" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground mt-1", children: selectedServiceResumo }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-2", children: selectedServiceRule ? `Regra aplicada: ${selectedServiceRule}` : "Este serviço ainda não tem regra de cálculo vinculada." })
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed bg-muted/20 p-4 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-8 w-8 text-muted-foreground/30 mx-auto mb-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Selecione um serviço para começar" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Quando você escolher um serviço, mostramos material, regra e a prévia do cálculo aqui ao lado." })
              ] }),
              servico && !regra && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive", children: "Este serviço está sem regra vinculada. Ajuste isso em Configurações antes de continuar." }),
              finalCalc ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-4 space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Prévia do cálculo" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground mt-1", children: "Veja como este serviço entra no orçamento" })
                  ] }),
                  overrideCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px]", children: [
                    overrideCount,
                    " ajuste",
                    overrideCount > 1 ? "s" : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-background/80 p-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Material base" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground mt-1 tabular-nums", children: fmt(finalCalc.custoTotalMaterial) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-background/80 p-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Custo dos insumos" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground mt-1 tabular-nums", children: fmt(finalCalc.custoTotalInsumos) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-background/80 p-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Custo total" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground mt-1 tabular-nums", children: fmt(finalCalc.custoTotalObra) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-primary/20 bg-primary/5 p-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Valor de venda" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-primary mt-1 tabular-nums", children: fmt(finalCalc.valorVenda) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-background/80 p-3 space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Insumos calculados" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: finalCalc.insumosFinais.length > 0 ? "Ajuste a quantidade se precisar." : "Sem insumos adicionais." })
                  ] }),
                  finalCalc.insumosFinais.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Este serviço não adiciona insumos extras na regra atual." }) : finalCalc.insumosFinais.map((insumo) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-foreground truncate", children: insumo.nomeInsumo }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                            fmt(insumo.custoUnitario),
                            " por unidade"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Input,
                          {
                            type: "number",
                            min: "0",
                            step: "1",
                            inputMode: "numeric",
                            className: "w-16 h-8 text-center text-xs",
                            value: editQtds[insumo.insumoId] !== void 0 ? editQtds[insumo.insumoId] : insumo.quantidade,
                            onChange: (event) => {
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
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-20 text-right text-xs font-medium tabular-nums", children: fmt(insumo.custoTotal) })
                      ]
                    },
                    insumo.insumoId
                  ))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Multiplicador de dificuldade" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
                    "×",
                    finalCalc.fatorDificuldade
                  ] })
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed bg-muted/20 p-4 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-8 w-8 text-muted-foreground/30 mx-auto mb-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: !servico ? "Escolha um serviço para ver a prévia" : motorValidationError ? "Corrija a base do motor para continuar" : !hasValidMetragem ? "Informe a metragem para gerar o cálculo" : "Complete os dados para ver a prévia" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: !servico ? "A prévia mostra material, insumos, custo total e valor de venda." : motorValidationError ? "O serviço precisa existir corretamente na base do motor selecionado." : !hasValidMetragem ? "Assim que a metragem for preenchida, o sistema calcula tudo automaticamente." : "Revise o serviço e a regra para continuar." })
              ] })
            ] })
          ] }),
          !canSave && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground text-center", children: "Selecione um serviço válido e informe a metragem para habilitar o salvamento." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, disabled: !canSave, className: "w-full h-11 font-semibold", children: editingItem ? "Salvar alterações do serviço" : "Adicionar este serviço ao orçamento" })
        ] })
      ] })
    }
  );
}
const statusOptions = [
  { value: "pendente", label: "Pendente", color: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30" },
  { value: "aprovado", label: "Aprovado", color: "bg-green-500/20 text-green-700 border-green-500/30" },
  { value: "rejeitado", label: "Rejeitado", color: "bg-red-500/20 text-red-700 border-red-500/30" },
  { value: "executado", label: "Executado", color: "bg-blue-500/20 text-blue-700 border-blue-500/30" }
];
const FALLBACK_TERMO = "CONCLUÍDO: Declaro que, nesta data, os serviços acima descritos foram conferidos, executados e entregues em perfeitas condições.";
const steps = [
  { key: "cliente", label: "Cliente", description: "Quem é o cliente?" },
  { key: "motor", label: "Tipo", description: "Como calcular?" },
  { key: "carrinho", label: "Orçamento", description: "Monte o orçamento" }
];
function StepIndicator({ current }) {
  const currentIdx = steps.findIndex((s) => s.key === current);
  const currentStep = steps[currentIdx];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-primary", children: [
        "Passo ",
        currentIdx + 1,
        " de ",
        steps.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold text-foreground mt-1", children: currentStep.description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center gap-0", children: steps.map((step, idx) => {
      const isActive = idx === currentIdx;
      const isDone = idx < currentIdx;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center min-w-[72px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all",
                isActive ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20" : isDone ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              ),
              children: isDone ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) : idx + 1
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "text-[11px] mt-1.5 font-medium",
                isActive ? "text-foreground" : isDone ? "text-primary/70" : "text-muted-foreground"
              ),
              children: step.label
            }
          )
        ] }),
        idx < steps.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "h-[2px] w-10 sm:w-14 mx-1 mt-[-16px] transition-all rounded-full",
              idx < currentIdx ? "bg-primary/40" : "bg-border"
            )
          }
        )
      ] }, step.key);
    }) })
  ] });
}
function OrcamentoWizard({ onDone, editingOrcamento }) {
  var _a;
  const isEditing = !!editingOrcamento;
  const draftKey = isEditing ? `draft:orcamento-edit:${editingOrcamento.id}` : "draft:orcamento-new";
  const defaultDraft = reactExports.useMemo(
    () => ({
      phase: isEditing ? "carrinho" : "cliente",
      selectedClienteId: (editingOrcamento == null ? void 0 : editingOrcamento.clienteId) ?? "",
      motorType: (editingOrcamento == null ? void 0 : editingOrcamento.motorType) ?? "motor1",
      itens: (editingOrcamento == null ? void 0 : editingOrcamento.itensServico) ?? [],
      status: (editingOrcamento == null ? void 0 : editingOrcamento.status) ?? "pendente",
      desconto: String((editingOrcamento == null ? void 0 : editingOrcamento.desconto) ?? 0),
      validade: (editingOrcamento == null ? void 0 : editingOrcamento.validade) ?? "",
      descricaoGeral: (editingOrcamento == null ? void 0 : editingOrcamento.descricaoGeral) ?? "",
      formasPagamento: (editingOrcamento == null ? void 0 : editingOrcamento.formasPagamento) ?? "",
      garantia: (editingOrcamento == null ? void 0 : editingOrcamento.garantia) ?? "",
      tempoGarantia: (editingOrcamento == null ? void 0 : editingOrcamento.tempoGarantia) ?? "",
      loadedPoliticaId: (editingOrcamento == null ? void 0 : editingOrcamento.politicaComercialId) ?? null,
      politicaNomeSnapshot: (editingOrcamento == null ? void 0 : editingOrcamento.politicaNomeSnapshot) ?? null,
      termoRecebimentoOs: (editingOrcamento == null ? void 0 : editingOrcamento.termoRecebimentoOsSnapshot) || FALLBACK_TERMO
    }),
    [editingOrcamento, isEditing]
  );
  const [draft, setDraft, clearDraft, wasRestored] = useDraft(draftKey, defaultDraft);
  reactExports.useEffect(() => {
    if (wasRestored) {
      ue.info("Rascunho restaurado.", { duration: 2500 });
    }
  }, []);
  const phase = draft.phase;
  const selectedClienteId = draft.selectedClienteId;
  const motorType = draft.motorType;
  const itens = draft.itens;
  const status = draft.status;
  const desconto = draft.desconto;
  const validade = draft.validade;
  const descricaoGeral = draft.descricaoGeral;
  const formasPagamento = draft.formasPagamento;
  const garantia = draft.garantia;
  const tempoGarantia = draft.tempoGarantia;
  const loadedPoliticaId = draft.loadedPoliticaId;
  const politicaNomeSnapshot = draft.politicaNomeSnapshot;
  const termoRecebimentoOs = draft.termoRecebimentoOs;
  const updateDraft = reactExports.useCallback(
    (partial) => {
      setDraft((prev) => ({ ...prev, ...partial }));
    },
    [setDraft]
  );
  const hasDraft = wasRestored || !isEditing && (draft.selectedClienteId !== "" || draft.itens.length > 0 || draft.descricaoGeral !== "" || draft.desconto !== "0");
  const [discardOpen, setDiscardOpen] = reactExports.useState(false);
  const handleDiscardDraft = reactExports.useCallback(() => {
    clearDraft();
    setDraft(defaultDraft);
    setDiscardOpen(false);
    ue.info("Rascunho descartado.", { duration: 2500 });
  }, [clearDraft, setDraft, defaultDraft]);
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [clienteModalOpen, setClienteModalOpen] = reactExports.useState(false);
  const [editingModalItem, setEditingModalItem] = reactExports.useState(null);
  const [clienteSearch, setClienteSearch] = reactExports.useState("");
  const { clientes, isLoading: loadingClientes, addCliente } = useClientes();
  const { politicas } = usePoliticas();
  const { getNextNumero, addOrcamento, updateOrcamento } = useOrcamentos();
  const { empresa } = useEmpresa();
  const { servicos: servicosList } = useServicos();
  const { regras: regrasList } = useRegras();
  useMotor1();
  useMotor2();
  useInsumos();
  const selectedCliente = clientes.find((c) => c.id === selectedClienteId);
  const filteredClientes = clientes.filter(
    (c) => c.nomeRazaoSocial.toLowerCase().includes(clienteSearch.toLowerCase()) || c.documento.includes(clienteSearch)
  );
  const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const totalCusto = itens.reduce((s, i) => s + i.custoTotalObra, 0);
  const totalVenda = itens.reduce((s, i) => s + i.valorVenda, 0);
  const descontoNum = parseFloat(desconto) || 0;
  const valorFinal = Math.max(totalVenda - descontoNum, 0);
  const hasItems = itens.length > 0;
  const margemPercentual = valorFinal > 0 ? (valorFinal - totalCusto) / valorFinal * 100 : null;
  const servicoTemplateMap = reactExports.useMemo(
    () => new Map(servicosList.map((servico) => [servico.id, servico])),
    [servicosList]
  );
  const regraMap = reactExports.useMemo(
    () => new Map(regrasList.map((regra) => [regra.id, regra.nomeRegra])),
    [regrasList]
  );
  const itensComAjusteManual = itens.filter(
    (item) => item.insumosOverrides && Object.keys(item.insumosOverrides).length > 0
  ).length;
  const clienteAtualNome = (selectedCliente == null ? void 0 : selectedCliente.nomeRazaoSocial) ?? (editingOrcamento == null ? void 0 : editingOrcamento.nomeCliente) ?? "Cliente não selecionado";
  const clienteAtualResumo = selectedCliente ? [selectedCliente.documento || null, selectedCliente.whatsapp || null].filter(Boolean).join(" · ") : "Confira os dados do cliente antes de salvar.";
  const politicaAplicadaNome = loadedPoliticaId ? ((_a = politicas.find((politica) => politica.id === loadedPoliticaId)) == null ? void 0 : _a.nomePolitica) ?? politicaNomeSnapshot : politicaNomeSnapshot;
  const getRegraName = (item) => {
    const servico = servicoTemplateMap.get(item.servicoTemplateId);
    return servico ? regraMap.get(servico.regraId) ?? null : null;
  };
  const getMaterialResumo = (item) => `${item.materialId} · ${item.espessura}mm · ${item.corte}mm`;
  const getAjustesCount = (item) => item.insumosOverrides ? Object.keys(item.insumosOverrides).length : 0;
  const handleBackFromCart = () => {
    if (isEditing) {
      onDone();
      return;
    }
    if (hasItems) {
      ue.error("Motor travado após adicionar item. Remova os itens para alterar o motor.", { duration: 5e3 });
      return;
    }
    updateDraft({ phase: "motor" });
  };
  const handleMotorSelect = (nextMotor) => {
    if (hasItems && nextMotor !== motorType) {
      ue.error("Motor travado após adicionar item.", { duration: 5e3 });
      return;
    }
    updateDraft({ motorType: nextMotor });
  };
  const handleAddItem = (item) => {
    updateDraft({ itens: [...itens, item] });
    setModalOpen(false);
    setEditingModalItem(null);
    ue.success("Serviço adicionado!");
  };
  const handleRemoveItem = (id) => {
    updateDraft({ itens: itens.filter((i) => i.id !== id) });
  };
  const startEditItem = (item) => {
    setEditingModalItem(item);
    setModalOpen(true);
  };
  const handleSaveEditedItem = (item) => {
    updateDraft({ itens: itens.map((i) => i.id === item.id ? item : i) });
    setModalOpen(false);
    setEditingModalItem(null);
    ue.success("Item atualizado!");
  };
  const TEMPO_GARANTIA_OPTIONS = ["3 meses", "6 meses", "1 ano", "2 anos", "3 anos", "5 anos"];
  const loadPolitica = (politicaId) => {
    const pol = politicas.find((p) => p.id === politicaId);
    if (!pol) return;
    updateDraft({
      loadedPoliticaId: pol.id,
      politicaNomeSnapshot: pol.nomePolitica,
      validade: `${pol.validadeDias} dias`,
      formasPagamento: pol.formasPagamento,
      garantia: pol.garantia,
      tempoGarantia: pol.tempoGarantia || "",
      termoRecebimentoOs: pol.termoRecebimentoOs || FALLBACK_TERMO
    });
    ue(`Política "${pol.nomePolitica}" aplicada`, { duration: 2e3 });
  };
  const handleNovoCliente = async (cliente) => {
    try {
      const saved = await addCliente.mutateAsync(cliente);
      updateDraft({ selectedClienteId: saved.id });
      setClienteModalOpen(false);
      ue.success("Cliente cadastrado e selecionado!", { duration: 2500 });
    } catch {
    }
  };
  const dificuldadeLabel = {
    facil: "Fácil",
    medio: "Médio",
    dificil: "Difícil"
  };
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const handleSave = async () => {
    if (isSaving) return;
    if (itens.length === 0 || !selectedCliente) return;
    setIsSaving(true);
    const base = {
      clienteId: selectedCliente.id,
      nomeCliente: selectedCliente.nomeRazaoSocial,
      motorType,
      itensServico: itens,
      custoTotalObra: totalCusto,
      valorVenda: totalVenda,
      desconto: descontoNum,
      valorFinal,
      status,
      validade,
      descricaoGeral,
      formasPagamento,
      garantia,
      tempoGarantia,
      politicaComercialId: loadedPoliticaId ?? null,
      politicaNomeSnapshot: politicaNomeSnapshot ?? null,
      validadeSnapshot: validade,
      formasPagamentoSnapshot: formasPagamento,
      garantiaSnapshot: garantia,
      tempoGarantiaSnapshot: tempoGarantia,
      termoRecebimentoOsSnapshot: termoRecebimentoOs
    };
    try {
      if (isEditing && editingOrcamento) {
        await updateOrcamento.mutateAsync({ ...editingOrcamento, ...base });
        ue.success("Orçamento atualizado!", { duration: 2500 });
      } else {
        const nextNum = await getNextNumero();
        const orcamento = {
          id: crypto.randomUUID(),
          numeroOrcamento: nextNum,
          dataCriacao: (/* @__PURE__ */ new Date()).toISOString(),
          ...base
        };
        await addOrcamento.mutateAsync(orcamento);
        ue.success("Orçamento salvo com sucesso!", { duration: 2500 });
      }
      clearDraft();
      onDone();
    } catch {
      ue.error("Erro ao salvar orçamento.", { duration: 5e3 });
    } finally {
      setIsSaving(false);
    }
  };
  if (phase === "cliente") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-24 pt-4 max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StepIndicator, { current: "cliente" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 border-primary/20 bg-primary/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-foreground", children: "Escolha o cliente para começar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Selecione o cliente que receberá este orçamento. Você pode buscar pelo nome ou documento." })
          ] }),
          hasDraft && !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { open: discardOpen, onOpenChange: setDiscardOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "text-muted-foreground hover:text-destructive h-8 gap-1.5 text-xs shrink-0 ml-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
                  " Descartar"
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Descartar rascunho?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Todo o progresso será perdido e você começará um orçamento do zero." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  AlertDialogAction,
                  {
                    onClick: handleDiscardDraft,
                    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                    children: "Descartar"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        wasRestored && !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-1.5 text-xs text-primary/70 bg-primary/10 rounded-md px-2.5 py-1.5 w-fit", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3 w-3" }),
          " Rascunho em andamento — continuando de onde parou"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Buscar por nome ou documento...",
                value: clienteSearch,
                onChange: (e) => setClienteSearch(e.target.value),
                className: "pl-9",
                autoFocus: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              className: "shrink-0 h-10 gap-1.5 border-primary/30 text-primary hover:bg-primary/10",
              onClick: () => setClienteModalOpen(true),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-sm", children: "Novo Cliente" })
              ]
            }
          )
        ] }),
        loadingClientes ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-80 overflow-y-auto space-y-2 pr-1", children: filteredClientes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center justify-center py-10 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mb-3 h-10 w-10 text-muted-foreground/30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: clientes.length === 0 ? "Nenhum cliente cadastrado ainda" : "Nenhum cliente encontrado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70 mt-1", children: clientes.length === 0 ? "Cadastre seu primeiro cliente para criar orçamentos" : "Tente buscar com outro termo ou cadastre um novo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "mt-4 border-primary/30 text-primary hover:bg-primary/10",
              onClick: () => setClienteModalOpen(true),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4 mr-1.5" }),
                " Cadastrar novo cliente"
              ]
            }
          )
        ] }) }) : filteredClientes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => updateDraft({ selectedClienteId: c.id }),
            className: cn(
              "w-full text-left rounded-lg border p-3.5 transition-all",
              selectedClienteId === c.id ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border hover:border-primary/30 hover:bg-muted/30"
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shrink-0",
                    selectedClienteId === c.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  ),
                  children: c.nomeRazaoSocial.charAt(0).toUpperCase()
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: c.nomeRazaoSocial }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground shrink-0", children: c.tipo })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                  c.documento,
                  " · ",
                  c.whatsapp
                ] })
              ] }),
              selectedClienteId === c.id && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 text-primary shrink-0" })
            ] })
          },
          c.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => updateDraft({ phase: "motor" }),
            disabled: !selectedClienteId,
            className: "w-full h-12 text-base font-semibold gap-2",
            children: [
              "Continuar para tipo de orçamento",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ClienteFormModal,
        {
          open: clienteModalOpen,
          onClose: () => setClienteModalOpen(false),
          onSave: handleNovoCliente
        }
      )
    ] });
  }
  if (phase === "motor") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-24 pt-4 max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StepIndicator, { current: "motor" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => hasItems ? updateDraft({ phase: "carrinho" }) : updateDraft({ phase: "cliente" }),
            className: "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
              " Voltar"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-primary/20 bg-primary/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-foreground", children: "Como este orçamento será calculado?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Escolha o método de cálculo de acordo com o tipo de serviço que será prestado." })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        hasItems && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleHelp, { className: "h-4 w-4 text-destructive shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Motor travado: remova todos os itens do carrinho para alterar o tipo de cálculo." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleMotorSelect("motor1"),
              disabled: hasItems,
              className: cn(
                "flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-70",
                motorType === "motor1" ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border hover:border-primary/30"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      motorType === "motor1" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    ),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Factory, { className: "h-6 w-6" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold block text-foreground", children: "Motor 1 — Fabricação" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground mt-1 block leading-relaxed", children: "Para peças fabricadas na empresa. O cálculo considera peso do material, densidade e preço por quilo." })
                ] }),
                motorType === "motor1" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs font-medium text-primary", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
                  " Selecionado"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleMotorSelect("motor2"),
              disabled: hasItems,
              className: cn(
                "flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-70",
                motorType === "motor2" ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border hover:border-primary/30"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      motorType === "motor2" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    ),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-6 w-6" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold block text-foreground", children: "Motor 2 — Compra Dobrada" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground mt-1 block leading-relaxed", children: "Para peças compradas já dobradas. O cálculo usa preço por metro linear com base em material, espessura e corte." })
                ] }),
                motorType === "motor2" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs font-medium text-primary", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
                  " Selecionado"
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => updateDraft({ phase: "carrinho" }),
            className: "w-full h-12 text-base font-semibold gap-2",
            children: [
              "Continuar para montagem do orçamento",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
            ]
          }
        )
      ] })
    ] });
  }
  const currentStatus = statusOptions.find((s) => s.value === status);
  const corDestaque = (empresa == null ? void 0 : empresa.corDestaque) || "#F57C00";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-28 pt-4 max-w-2xl mx-auto", children: [
    !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsx(StepIndicator, { current: "carrinho" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleBackFromCart,
            className: "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
              " ",
              isEditing ? "Voltar para lista" : "Voltar"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          hasDraft && !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { open: discardOpen, onOpenChange: setDiscardOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "text-muted-foreground hover:text-destructive h-8 gap-1.5 text-xs",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
                  " Descartar"
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Descartar rascunho?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Todo o progresso será perdido e você começará um orçamento do zero." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  AlertDialogAction,
                  {
                    onClick: handleDiscardDraft,
                    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                    children: "Descartar"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: (v) => updateDraft({ status: v }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: cn("h-8 w-auto text-xs font-semibold border rounded-md", currentStatus.color), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: statusOptions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-primary/20 bg-primary/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-foreground", children: isEditing ? `Editando Orçamento #${editingOrcamento == null ? void 0 : editingOrcamento.numeroOrcamento}` : "Revise e monte o orçamento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 max-w-xl", children: "Confira os serviços, ajuste as condições comerciais e salve quando tudo estiver pronto para enviar ao cliente." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/15 bg-background/80 px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Status atual" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground mt-1", children: currentStatus.label })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-background/80 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Cliente" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground mt-1 truncate", children: clienteAtualNome }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: clienteAtualResumo })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-background/80 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Tipo de cálculo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-foreground mt-1 flex items-center gap-1.5", children: [
              motorType === "motor1" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Factory, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-4 w-4 text-primary" }),
              motorType === "motor1" ? "Fabricação" : "Compra Dobrada"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: motorType === "motor1" ? "Usa peso, densidade e preço por quilo." : "Usa material, espessura, corte e preço por metro." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-background/80 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Andamento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-foreground mt-1", children: [
              itens.length,
              " ",
              itens.length === 1 ? "serviço no orçamento" : "serviços no orçamento"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: hasItems ? itensComAjusteManual > 0 ? `${itensComAjusteManual} ${itensComAjusteManual === 1 ? "item com ajuste manual" : "itens com ajustes manuais"}` : "Tudo pronto para revisar valores e condições." : "Comece adicionando os serviços que serão executados." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-4", children: [
          wasRestored && !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-primary/80 bg-primary/10 rounded-md px-2.5 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3 w-3" }),
            " Rascunho em andamento"
          ] }),
          politicaAplicadaNome && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-foreground bg-background/80 rounded-md px-2.5 py-1.5 border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3 text-primary" }),
            " Política aplicada: ",
            politicaAplicadaNome
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Serviços do orçamento" }),
            hasItems && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-muted text-muted-foreground text-[10px] font-bold rounded-full px-2 py-0.5", children: itens.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Adicione os serviços que serão executados e revise os valores antes de salvar." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setModalOpen(true), size: "sm", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " Adicionar serviço"
        ] })
      ] }),
      hasItems && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-xl border bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
          itens.length,
          " ",
          itens.length === 1 ? "serviço adicionado" : "serviços adicionados",
          "."
        ] }),
        " ",
        itensComAjusteManual > 0 ? `${itensComAjusteManual} ${itensComAjusteManual === 1 ? "item tem ajuste manual de insumo" : "itens têm ajustes manuais de insumos"}.` : "Todos os insumos seguem a regra padrão no momento."
      ] }),
      itens.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "mb-3 h-10 w-10 text-muted-foreground/30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Nenhum serviço adicionado ainda" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70 mt-1 max-w-xs", children: "Adicione os serviços que farão parte deste orçamento clicando no botão acima." })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: itens.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden border-border/80 hover:shadow-sm transition-shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-bold text-primary mt-0.5 shrink-0", children: idx + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: item.nomeServico }),
                getAjustesCount(item) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary", children: "Insumos ajustados" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: getMaterialResumo(item) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground", children: [
                  item.metragem,
                  "m"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground", children: dificuldadeLabel[item.dificuldade] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground", children: [
                  item.insumosCalculados.length,
                  " ",
                  item.insumosCalculados.length === 1 ? "insumo" : "insumos"
                ] })
              ] }),
              getRegraName(item) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground/70 mt-2", children: [
                "Regra aplicada: ",
                getRegraName(item)
              ] }),
              getAjustesCount(item) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-primary/80 mt-1", children: [
                getAjustesCount(item),
                " ",
                getAjustesCount(item) === 1 ? "insumo foi ajustado manualmente" : "insumos foram ajustados manualmente",
                " ",
                "neste item."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                onClick: () => {
                  const cloned = { ...item, id: crypto.randomUUID() };
                  updateDraft({
                    itens: (() => {
                      const copy = [...itens];
                      copy.splice(idx + 1, 0, cloned);
                      return copy;
                    })()
                  });
                  ue.success("Item duplicado!");
                },
                className: "h-8 gap-1.5 text-muted-foreground hover:text-primary",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Duplicar" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                onClick: () => startEditItem(item),
                className: "h-8 gap-1.5 text-muted-foreground hover:text-primary",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Editar" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                onClick: () => handleRemoveItem(item.id),
                className: "h-8 gap-1.5 text-muted-foreground hover:text-destructive",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Remover" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Custo interno" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground mt-1 tabular-nums", children: fmt(item.custoTotalObra) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Material + insumos calculados para este serviço." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Valor do serviço" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-primary mt-1 tabular-nums", children: fmt(item.valorVenda) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Valor atual que entra no orçamento do cliente." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Resumo rápido" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-foreground mt-1", children: [
              fmt(item.custoMetroLinear),
              "/m"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground mt-1", children: [
              "Fator ",
              item.fatorDificuldade.toFixed(1),
              " · ",
              item.metragem,
              "m executados"
            ] })
          ] })
        ] })
      ] }) }) }, item.id)) })
    ] }),
    hasItems && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-muted-foreground" }),
          " Resumo Financeiro"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Este bloco ajuda a conferir custo interno, valor de venda, desconto e total final antes de salvar." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Custo interno total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-foreground mt-1 tabular-nums", children: fmt(totalCusto) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Referência interna com material e insumos." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Valor bruto do orçamento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-foreground mt-1 tabular-nums", children: fmt(totalVenda) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Soma dos serviços antes do desconto." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Desconto aplicado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: cn(
                "text-lg font-semibold mt-1 tabular-nums",
                descontoNum > 0 ? "text-destructive" : "text-foreground"
              ),
              children: descontoNum > 0 ? `-${fmt(descontoNum)}` : "Sem desconto"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Use para registrar negociação com o cliente." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/20 bg-primary/5 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Valor final para o cliente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-primary mt-1 tabular-nums", children: fmt(valorFinal) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Esse é o valor principal mostrado no orçamento." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-background/80 p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Itens no orçamento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: itens.length })
        ] }),
        margemPercentual !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Margem estimada" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: cn(
                "font-semibold",
                margemPercentual >= 30 ? "text-green-600" : margemPercentual >= 15 ? "text-yellow-600" : "text-destructive"
              ),
              children: [
                margemPercentual.toFixed(1),
                "%"
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Margem estimada" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-muted-foreground", children: "Indisponível com valor final zerado" })
        ] })
      ] })
    ] }) }),
    hasItems && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }),
          " Condições Comerciais"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Organize aqui o que será combinado com o cliente. Esses dados aparecem no PDF e ajudam a deixar o orçamento claro." })
      ] }),
      politicas.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/30 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium", children: "Aplicar política comercial padrão" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mb-2", children: "Preenche automaticamente validade, pagamento e garantia para acelerar o preenchimento." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: loadPolitica, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecione uma política..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: politicas.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.id, children: p.nomePolitica }, p.id)) })
        ] }),
        politicaAplicadaNome && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-primary mt-2", children: [
          "Política ativa: ",
          politicaAplicadaNome
        ] })
      ] }),
      loadedPoliticaId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium", children: "Termo de Recebimento (OS)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mb-1.5", children: "Este texto vai para o canhoto de entrega da Ordem de Serviço." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: termoRecebimentoOs,
            onChange: (e) => updateDraft({ termoRecebimentoOs: e.target.value }),
            rows: 3,
            className: "text-sm",
            placeholder: "Texto do canhoto de entrega da OS..."
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-semibold text-foreground flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            " Prazo e negociação"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Defina até quando o orçamento vale e se existe algum desconto combinado." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Validade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: validade,
                onChange: (e) => updateDraft({ validade: e.target.value }),
                placeholder: "Ex: 15 dias",
                className: "h-9"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Desconto (R$)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                inputMode: "decimal",
                value: desconto,
                onChange: (e) => updateDraft({ desconto: e.target.value }),
                placeholder: "0,00",
                className: "h-9"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1.5 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3 text-muted-foreground" }),
          " Escopo do serviço"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mb-1.5", children: "Descreva de forma simples o que será executado para o cliente entender o combinado." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: descricaoGeral,
            onChange: (e) => updateDraft({ descricaoGeral: e.target.value }),
            placeholder: "Ex: Instalação de calhas no beiral frontal e rufos na platibanda lateral...",
            rows: 3,
            className: "text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1.5 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-3 w-3 text-muted-foreground" }),
          " Formas de pagamento"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mb-1.5", children: "Registre como o cliente pode pagar este orçamento." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: formasPagamento,
            onChange: (e) => updateDraft({ formasPagamento: e.target.value }),
            placeholder: "Ex: 50% na aprovação, 50% na entrega...",
            rows: 2,
            className: "text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-semibold text-foreground flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            " Garantia"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Defina o prazo e detalhe rapidamente o que está coberto para evitar dúvidas depois." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tempo de Garantia" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tempoGarantia, onValueChange: (v) => updateDraft({ tempoGarantia: v }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecione o prazo..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TEMPO_GARANTIA_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Detalhes e condições da garantia" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: garantia,
              onChange: (e) => updateDraft({ garantia: e.target.value }),
              placeholder: "Ex: A garantia cobre defeitos de fabricação e instalação...",
              rows: 2,
              className: "text-sm"
            }
          )
        ] })
      ] })
    ] }) }),
    hasItems && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-16 lg:bottom-0 left-0 lg:left-64 right-0 z-40 border-t bg-card/95 backdrop-blur-sm shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-2xl px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          itens.length,
          " ",
          itens.length === 1 ? "serviço" : "serviços",
          " · ",
          clienteAtualNome
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums", style: { color: corDestaque }, children: fmt(valorFinal) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        isEditing && editingOrcamento && /* @__PURE__ */ jsxRuntimeExports.jsx(
          PDFDownloadButton,
          {
            orcamento: {
              ...editingOrcamento,
              itensServico: itens,
              custoTotalObra: totalCusto,
              valorVenda: totalVenda,
              desconto: descontoNum,
              valorFinal,
              status,
              validade,
              descricaoGeral,
              formasPagamento,
              garantia,
              tempoGarantia
            },
            cliente: selectedCliente,
            empresa,
            size: "default",
            className: "h-11"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleSave,
            disabled: isSaving,
            className: "h-11 px-6",
            style: { backgroundColor: corDestaque, color: "#fff" },
            children: isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
              " Salvando..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
              " ",
              isEditing ? "Salvar Alterações" : "Salvar Orçamento"
            ] })
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AddServicoModal,
      {
        open: modalOpen,
        onClose: () => {
          setModalOpen(false);
          setEditingModalItem(null);
        },
        onSave: editingModalItem ? handleSaveEditedItem : handleAddItem,
        motorType,
        editingItem: editingModalItem
      }
    )
  ] });
}
export {
  OrcamentoWizard
};
