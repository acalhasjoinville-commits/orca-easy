import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { b as useMotor1, c as useMotor2, d as useInsumos, a as useRegras, u as useServicos, k as Calculator, C as ChevronsUpDown, e as Command, f as CommandInput, g as CommandList, h as CommandEmpty, i as CommandGroup, j as CommandItem } from "./command-Bw2vydg5.js";
import { c as createLucideIcon, i as usePoliticas, F as FileText, e as LoaderCircle, a as cn, B as Button, j as useEmpresa, I as Input, d as ue, s as supabase, P as Plus } from "./index-BN5a_yey.js";
import { g as getCustoUnitario } from "./types-DSYQLPIT.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-Cr3helAi.js";
import { C as Card, a as CardContent } from "./card-B4K8qJaR.js";
import { T as Textarea } from "./textarea-B24Ov2Sw.js";
import { L as Label } from "./label-BChNKNza.js";
import { B as Badge, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DQUVPZUM.js";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogDescription, f as DialogFooter } from "./dialog-ScvtRc5R.js";
import { P as Pencil, A as AlertDialog, h as AlertDialogTrigger, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-C9g92JDz.js";
import { S as Save, P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-Bh9k5wbj.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, E as EllipsisVertical, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-Cw3zSzm8.js";
import { B as Building2 } from "./building-2-DctO8KH6.js";
import { S as Search } from "./search-CUbuJP2V.js";
import { T as Trash2 } from "./trash-2-DvXBRZTj.js";
import { C as Check } from "./check-D0l1wUju.js";
import "./charts-vendor-BrW5ULH7.js";
import "./query-vendor-BLvK6anV.js";
import "./radix-vendor-CEzLCFk2.js";
import "./pdf-vendor-Dv6cUxDn.js";
import "./router-vendor-CCo6OTFM.js";
import "./supabase-vendor-BsjcsmU5.js";
import "./chevron-right-DibYopn_.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const BookOpen = createLucideIcon("BookOpen", [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Layers = createLucideIcon("Layers", [
  [
    "path",
    {
      d: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",
      key: "8b97xw"
    }
  ],
  ["path", { d: "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65", key: "dd6zsq" }],
  ["path", { d: "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65", key: "ep9fru" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Upload = createLucideIcon("Upload", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "17 8 12 3 7 8", key: "t8dd8p" }],
  ["line", { x1: "12", x2: "12", y1: "3", y2: "15", key: "widbto" }]
]);
function InsumoCombobox({
  insumos,
  value,
  onSelect
}) {
  const [open, setOpen] = reactExports.useState(false);
  const selected = insumos.find((i) => i.id === value);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "outline",
        role: "combobox",
        "aria-expanded": open,
        className: "h-8 text-xs flex-1 justify-between font-normal",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: selected ? selected.nomeEmbalagemCompra : "Buscar insumo..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-1 h-3 w-3 shrink-0 opacity-50" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-[280px] p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Filtrar insumo...", className: "h-8 text-xs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { className: "py-3 text-xs", children: "Nenhum insumo encontrado." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: insumos.map((ins) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          CommandItem,
          {
            value: ins.nomeEmbalagemCompra,
            onSelect: () => {
              onSelect(ins.id);
              setOpen(false);
            },
            className: "text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: cn("mr-2 h-3 w-3", value === ins.id ? "opacity-100" : "opacity-0") }),
              ins.nomeEmbalagemCompra
            ]
          },
          ins.id
        )) })
      ] })
    ] }) })
  ] });
}
const tabMeta = {
  empresa: {
    title: "Empresa e identidade",
    description: "Define os dados institucionais e a identidade visual usada no sistema e nos PDFs.",
    helper: "Ajuste logo, cores e dados de contato sem alterar a lógica comercial do sistema.",
    icon: Building2
  },
  materiais: {
    title: "Base de materiais",
    description: "Cadastre os materiais que alimentam o cálculo de custo dos serviços.",
    helper: "Motor 2 é a base principal do sistema. Motor 1 permanece disponível para casos específicos.",
    icon: Layers
  },
  regras: {
    title: "Regras de consumo",
    description: "Definem como os insumos entram no cálculo padrão de cada serviço.",
    helper: "As regras são base padrão: o usuário ainda pode ajustar os insumos depois no orçamento.",
    icon: Calculator
  },
  catalogo: {
    title: "Catálogo de serviços",
    description: "Conecta material, regra e serviço para automatizar o orçamento.",
    helper: "Cada serviço do catálogo direciona o motor, o material e a regra aplicada automaticamente.",
    icon: BookOpen
  },
  politicas: {
    title: "Políticas comerciais",
    description: "Centralizam validade, garantia e textos operacionais usados no atendimento.",
    helper: "Esses textos aparecem em orçamentos e OS, então vale manter um padrão claro e profissional.",
    icon: FileText
  }
};
function MinhaEmpresaForm() {
  const { empresa: existing, isLoading, saveEmpresa } = useEmpresa();
  const [initialized, setInitialized] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    logoUrl: "",
    nomeFantasia: "",
    razaoSocial: "",
    cnpjCpf: "",
    telefoneWhatsApp: "",
    emailContato: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    corPrimaria: "#0B1B32",
    corDestaque: "#F57C00",
    slogan: ""
  });
  const [uploading, setUploading] = reactExports.useState(false);
  const fileRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!initialized && !isLoading) {
      if (existing) setForm(existing);
      setInitialized(true);
    }
  }, [isLoading, existing, initialized]);
  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const handleLogoUpload = async (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      ue.error("Arquivo muito grande. Máximo 2MB.", { duration: 5e3 });
      return;
    }
    setUploading(true);
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("empresa_id").eq("id", user == null ? void 0 : user.id).maybeSingle();
      const empresaPrefix = (profile == null ? void 0 : profile.empresa_id) || "default";
      const ext = file.name.split(".").pop() || "png";
      const path = `${empresaPrefix}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
      set("logoUrl", urlData.publicUrl);
      ue.success("Logo enviada!", { duration: 2500 });
    } catch (err) {
      console.error(err);
      ue.error("Erro ao enviar logo.", { duration: 5e3 });
    } finally {
      setUploading(false);
    }
  };
  const handleSave = async () => {
    try {
      await saveEmpresa.mutateAsync(form);
      ue.success("Dados da empresa salvos!", { duration: 2500 });
    } catch {
      ue.error("Erro ao salvar dados da empresa.", { duration: 5e3 });
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Esses dados aparecem no sistema, nos orçamentos e nos PDFs." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Ajuste logo, cores e dados institucionais aqui para manter a apresentação da empresa consistente." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-foreground", children: "Identidade Visual" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Logomarca e cores do sistema e PDF" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
        form.logoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: form.logoUrl, alt: "Logo", className: "h-16 w-16 rounded-lg object-contain border bg-background" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-5 w-5 text-muted-foreground/40" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              size: "sm",
              variant: "outline",
              onClick: () => {
                var _a;
                return (_a = fileRef.current) == null ? void 0 : _a.click();
              },
              disabled: uploading,
              children: [
                uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-1 h-3 w-3" }),
                uploading ? "Enviando..." : "Upload Logo"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: handleLogoUpload }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "PNG ou JPG, máx 2MB" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-muted-foreground mb-1.5", children: "🎨 Cor Primária" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "color",
                value: form.corPrimaria,
                onChange: (e) => set("corPrimaria", e.target.value),
                className: "h-9 w-12 rounded-md border cursor-pointer"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.corPrimaria,
                onChange: (e) => set("corPrimaria", e.target.value),
                placeholder: "#0044CC",
                className: "h-9 font-mono text-xs flex-1"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-muted-foreground mb-1.5", children: "✨ Cor Destaque" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "color",
                value: form.corDestaque,
                onChange: (e) => set("corDestaque", e.target.value),
                className: "h-9 w-12 rounded-md border cursor-pointer"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.corDestaque,
                onChange: (e) => set("corDestaque", e.target.value),
                placeholder: "#16A34A",
                className: "h-9 font-mono text-xs flex-1"
              }
            )
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-foreground mb-4", children: "Dados da Empresa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Nome Fantasia" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.nomeFantasia,
                onChange: (e) => set("nomeFantasia", e.target.value),
                placeholder: "Nome comercial",
                className: "h-9 mt-1"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Razão Social" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.razaoSocial,
                onChange: (e) => set("razaoSocial", e.target.value),
                placeholder: "Razão social",
                className: "h-9 mt-1"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Slogan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.slogan,
              onChange: (e) => set("slogan", e.target.value),
              placeholder: "Ex: A solução está no nome",
              className: "h-9 mt-1"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "CNPJ / CPF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.cnpjCpf,
                onChange: (e) => set("cnpjCpf", e.target.value),
                placeholder: "00.000.000/0001-00",
                className: "h-9 mt-1"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "WhatsApp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.telefoneWhatsApp,
                onChange: (e) => set("telefoneWhatsApp", e.target.value),
                placeholder: "(00) 00000-0000",
                className: "h-9 mt-1"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "E-mail de Contato" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "email",
              value: form.emailContato,
              onChange: (e) => set("emailContato", e.target.value),
              placeholder: "contato@empresa.com",
              className: "h-9 mt-1"
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-foreground mb-4", children: "Endereço" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Endereço" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.endereco,
                onChange: (e) => set("endereco", e.target.value),
                placeholder: "Rua / Av.",
                className: "h-9 mt-1"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Número" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.numero,
                onChange: (e) => set("numero", e.target.value),
                placeholder: "Nº",
                className: "h-9 mt-1"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Bairro" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.bairro, onChange: (e) => set("bairro", e.target.value), className: "h-9 mt-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Cidade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidade, onChange: (e) => set("cidade", e.target.value), className: "h-9 mt-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Estado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.estado,
                onChange: (e) => set("estado", e.target.value),
                placeholder: "UF",
                className: "h-9 mt-1"
              }
            )
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: saveEmpresa.isPending, className: "w-full h-10", children: [
      saveEmpresa.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
      "Salvar Dados da Empresa"
    ] })
  ] });
}
function normalize(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function SubSection({
  title,
  description,
  onAdd,
  isEmpty,
  emptyText,
  children,
  searchValue,
  onSearchChange,
  totalCount,
  filteredCount,
  searchPlaceholder,
  tag,
  addLabel
}) {
  const showSearch = onSearchChange !== void 0;
  const showCount = totalCount !== void 0 && totalCount > 0;
  const isFiltering = searchValue && searchValue.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-foreground", children: title }),
          tag && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0", children: tag }),
          showCount && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: isFiltering ? `${filteredCount}/${totalCount}` : totalCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: onAdd, className: "shrink-0 h-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3 w-3" }),
        " ",
        addLabel || "Novo"
      ] })
    ] }),
    showSearch && (totalCount ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: searchPlaceholder || "Buscar...",
          value: searchValue || "",
          onChange: (e) => onSearchChange(e.target.value),
          className: "h-9 pl-9 text-sm"
        }
      )
    ] }),
    isEmpty ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-dashed border-muted-foreground/20 py-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: emptyText }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border -mx-5", children })
  ] }) });
}
function ItemRow({
  children,
  item,
  section,
  onEdit,
  onDelete,
  deletingId
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1", children }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ml-2 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "min-w-[120px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => onEdit(item, section), className: "text-xs gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
          " Editar"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DropdownMenuItem,
            {
              onSelect: (e) => e.preventDefault(),
              className: "text-xs gap-2 text-destructive focus:text-destructive",
              children: [
                deletingId === item.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                "Excluir"
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Confirmar exclusão" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Deseja remover este item? Esta ação não pode ser desfeita." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AlertDialogAction,
                {
                  onClick: () => onDelete(item.id, section),
                  className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                  children: "Excluir"
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function Configuracoes() {
  const [tab, setTab] = reactExports.useState("empresa");
  const [activeSection, setActiveSection] = reactExports.useState("motor1");
  const { motor1, isLoading: loadingM1, addMotor1, updateMotor1, deleteMotor1 } = useMotor1();
  const { motor2, isLoading: loadingM2, addMotor2, updateMotor2, deleteMotor2 } = useMotor2();
  const { insumos, isLoading: loadingIns, addInsumo, updateInsumo, deleteInsumo } = useInsumos();
  const { regras, isLoading: loadingReg, addRegra, updateRegra, deleteRegra } = useRegras();
  const { servicos, isLoading: loadingSrv, addServico, updateServico, deleteServico } = useServicos();
  const { politicas, addPolitica, updatePolitica, deletePolitica } = usePoliticas();
  const isLoadingTech = loadingM1 || loadingM2 || loadingIns || loadingReg || loadingSrv;
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [deletingId, setDeletingId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const [searchMotor1, setSearchMotor1] = reactExports.useState("");
  const [searchMotor2, setSearchMotor2] = reactExports.useState("");
  const [searchInsumos, setSearchInsumos] = reactExports.useState("");
  const [searchRegras, setSearchRegras] = reactExports.useState("");
  const [searchCatalogo, setSearchCatalogo] = reactExports.useState("");
  const [searchPoliticas, setSearchPoliticas] = reactExports.useState("");
  const [regraItens, setRegraItens] = reactExports.useState([]);
  const openAdd = (section) => {
    setActiveSection(section);
    setEditItem(null);
    setForm({});
    setRegraItens([]);
    setDialogOpen(true);
  };
  const openEdit = (item, section) => {
    setActiveSection(section);
    setEditItem(item);
    const f = {};
    Object.entries(item).forEach(([k, v]) => {
      if (k !== "id" && k !== "itensRegra") f[k] = String(v);
    });
    setForm(f);
    if ("itensRegra" in item && item.itensRegra) setRegraItens([...item.itensRegra]);
    setDialogOpen(true);
  };
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const id = (editItem == null ? void 0 : editItem.id) || crypto.randomUUID();
    try {
      if (activeSection === "motor1") {
        const entry = {
          id,
          material: form.material || "",
          densidade: parseFloat(form.densidade) || 0,
          precoQuilo: parseFloat(form.precoQuilo) || 0
        };
        if (editItem) await updateMotor1.mutateAsync(entry);
        else await addMotor1.mutateAsync(entry);
      } else if (activeSection === "motor2") {
        const entry = {
          id,
          material: form.material || "",
          espessura: parseFloat(form.espessura) || 0,
          corte: parseFloat(form.corte) || 0,
          precoMetroLinear: parseFloat(form.precoMetroLinear) || 0
        };
        if (editItem) await updateMotor2.mutateAsync(entry);
        else await addMotor2.mutateAsync(entry);
      } else if (activeSection === "insumos") {
        const entry = {
          id,
          nomeEmbalagemCompra: form.nomeEmbalagemCompra || "",
          nomeUnidadeConsumo: form.nomeUnidadeConsumo || "",
          precoEmbalagem: parseFloat(form.precoEmbalagem) || 0,
          qtdEmbalagem: parseFloat(form.qtdEmbalagem) || 1
        };
        if (editItem) await updateInsumo.mutateAsync(entry);
        else await addInsumo.mutateAsync(entry);
      } else if (activeSection === "regras") {
        const entry = { id, nomeRegra: form.nomeRegra || "", itensRegra: regraItens };
        if (editItem) await updateRegra.mutateAsync(entry);
        else await addRegra.mutateAsync(entry);
      } else if (activeSection === "catalogo") {
        const entry = {
          id,
          nomeServico: form.nomeServico || "",
          regraId: form.regraId || "",
          motorType: form.motorType || "motor1",
          materialPadrao: form.materialPadrao || "",
          espessuraPadrao: parseFloat(form.espessuraPadrao) || 0,
          cortePadrao: parseFloat(form.cortePadrao) || 0,
          dificuldadeFacil: parseFloat(form.dificuldadeFacil) || 2.6,
          dificuldadeMedia: parseFloat(form.dificuldadeMedia) || 3.5,
          dificuldadeDificil: parseFloat(form.dificuldadeDificil) || 4.6
        };
        if (editItem) await updateServico.mutateAsync(entry);
        else await addServico.mutateAsync(entry);
      } else if (activeSection === "politicas") {
        const entry = {
          id,
          nomePolitica: form.nomePolitica || "",
          validadeDias: parseInt(form.validadeDias) || 15,
          formasPagamento: form.formasPagamento || "",
          garantia: form.garantia || "",
          tempoGarantia: form.tempoGarantia || "1 ano",
          termoRecebimentoOs: form.termoRecebimentoOs || ""
        };
        if (editItem) await updatePolitica.mutateAsync(entry);
        else await addPolitica.mutateAsync(entry);
      }
      setDialogOpen(false);
      ue.success(editItem ? "Atualizado!" : "Adicionado!", { duration: 2500 });
    } catch {
      ue.error("Erro ao salvar.", { duration: 5e3 });
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async (id, section) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      if (section === "motor1") await deleteMotor1.mutateAsync(id);
      else if (section === "motor2") await deleteMotor2.mutateAsync(id);
      else if (section === "insumos") await deleteInsumo.mutateAsync(id);
      else if (section === "regras") await deleteRegra.mutateAsync(id);
      else if (section === "catalogo") await deleteServico.mutateAsync(id);
      else if (section === "politicas") await deletePolitica.mutateAsync(id);
      ue.success("Removido!", { duration: 2500 });
    } catch {
      ue.error("Erro ao remover.", { duration: 5e3 });
    } finally {
      setDeletingId(null);
    }
  };
  const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const materiaisUnicos = [.../* @__PURE__ */ new Set([...motor1.map((m) => m.material), ...motor2.map((m) => m.material)])];
  const regraName = (id) => {
    var _a;
    return ((_a = regras.find((r) => r.id === id)) == null ? void 0 : _a.nomeRegra) || "—";
  };
  const regraMap = reactExports.useMemo(() => new Map(regras.map((r) => [r.id, r.nomeRegra])), [regras]);
  const currentTabMeta = tabMeta[tab];
  const addRegraItem = () => {
    setRegraItens((prev) => [...prev, { id: crypto.randomUUID(), insumoId: "", metodoCalculo: "dividir", fator: 1 }]);
  };
  const updateRegraItem = (idx, field, value) => {
    setRegraItens((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const removeRegraItem = (idx) => {
    setRegraItens((prev) => prev.filter((_, i) => i !== idx));
  };
  const renderRegraForm = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/20 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-foreground", children: "Essa regra define o consumo padrão de insumos por serviço." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Ela permanece ajustável no orçamento. Aqui você cadastra somente a base automática usada pelo sistema." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Nome da Regra" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.nomeRegra || "", onChange: (e) => setField("nomeRegra", e.target.value), className: "mt-1" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-semibold", children: "Insumos da Regra" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", onClick: addRegraItem, className: "h-7 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3 w-3" }),
          " Adicionar"
        ] })
      ] }),
      regraItens.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center py-4", children: "Nenhum insumo adicionado." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: regraItens.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg border bg-muted/20 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          InsumoCombobox,
          {
            insumos,
            value: item.insumoId,
            onSelect: (v) => updateRegraItem(idx, "insumoId", v)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: item.metodoCalculo,
            onValueChange: (v) => updateRegraItem(idx, "metodoCalculo", v),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "multiplicar", children: "Por metro" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dividir", children: "A cada X m" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            inputMode: "decimal",
            className: "h-8 w-16 text-xs text-center",
            value: item.fator,
            onChange: (e) => updateRegraItem(idx, "fator", parseFloat(e.target.value) || 0)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => removeRegraItem(idx),
            className: "p-1 text-muted-foreground hover:text-destructive shrink-0",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
          }
        )
      ] }, item.id)) })
    ] })
  ] });
  const renderCatalogoForm = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/20 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-foreground", children: "O catálogo conecta serviço, material e regra." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Ao usar esse serviço no orçamento, o sistema vai buscar o material, aplicar a regra e calcular os insumos automaticamente." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Nome do Serviço" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: form.nomeServico || "",
          onChange: (e) => setField("nomeServico", e.target.value),
          className: "mt-1"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Regra de Cálculo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.regraId || "", onValueChange: (v) => setField("regraId", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecione" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: regras.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.id, children: r.nomeRegra }, r.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Motor" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.motorType || "motor1", onValueChange: (v) => setField("motorType", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "motor1", children: "Fabricar (Motor 1)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "motor2", children: "Comprar Dobrado (Motor 2)" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Material Padrão" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.materialPadrao || "", onValueChange: (v) => setField("materialPadrao", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecione" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: materiaisUnicos.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Espessura (mm)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            inputMode: "decimal",
            value: form.espessuraPadrao || "",
            onChange: (e) => setField("espessuraPadrao", e.target.value),
            className: "mt-1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Corte (mm)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            inputMode: "decimal",
            value: form.cortePadrao || "",
            onChange: (e) => setField("cortePadrao", e.target.value),
            className: "mt-1"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Fator Fácil" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            inputMode: "decimal",
            value: form.dificuldadeFacil || "",
            onChange: (e) => setField("dificuldadeFacil", e.target.value),
            className: "mt-1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Fator Médio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            inputMode: "decimal",
            value: form.dificuldadeMedia || "",
            onChange: (e) => setField("dificuldadeMedia", e.target.value),
            className: "mt-1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Fator Difícil" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            inputMode: "decimal",
            value: form.dificuldadeDificil || "",
            onChange: (e) => setField("dificuldadeDificil", e.target.value),
            className: "mt-1"
          }
        )
      ] })
    ] })
  ] });
  const TEMPO_GARANTIA_OPTIONS = ["3 meses", "6 meses", "1 ano", "2 anos", "3 anos", "5 anos"];
  const renderPoliticaForm = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/20 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-foreground", children: "Esses textos padronizam o atendimento comercial." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Use esta área para definir validade, garantia e condições que aparecem no orçamento e na OS." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Nome da Política" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: form.nomePolitica || "",
          onChange: (e) => setField("nomePolitica", e.target.value),
          placeholder: "Ex: Padrão Residencial",
          className: "mt-1"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Validade (dias)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "number",
          inputMode: "numeric",
          value: form.validadeDias || "",
          onChange: (e) => setField("validadeDias", e.target.value),
          placeholder: "15",
          className: "mt-1"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Tempo de Garantia" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.tempoGarantia || "1 ano", onValueChange: (v) => setField("tempoGarantia", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecione..." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TEMPO_GARANTIA_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Formas de Pagamento" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: form.formasPagamento || "",
          onChange: (e) => setField("formasPagamento", e.target.value),
          placeholder: "Condições de pagamento padrão...",
          rows: 2,
          className: "text-sm mt-1"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Termos de Garantia" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: form.garantia || "",
          onChange: (e) => setField("garantia", e.target.value),
          placeholder: "Detalhes dos termos de garantia...",
          rows: 2,
          className: "text-sm mt-1"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: "Termo de Recebimento (OS)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: form.termoRecebimentoOs || "",
          onChange: (e) => setField("termoRecebimentoOs", e.target.value),
          placeholder: "Texto do canhoto de entrega da OS...",
          rows: 3,
          className: "text-sm mt-1"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "Exibido no canhoto de entrega da OS." })
    ] })
  ] });
  const simpleFields = {
    motor1: [
      { label: "Material", key: "material" },
      { label: "Densidade (g/cm³)", key: "densidade", type: "number" },
      { label: "Preço/Kg (R$)", key: "precoQuilo", type: "number" }
    ],
    motor2: [
      { label: "Material", key: "material" },
      { label: "Espessura (mm)", key: "espessura", type: "number" },
      { label: "Corte/Largura (mm)", key: "corte", type: "number" },
      { label: "Preço/Metro (R$)", key: "precoMetroLinear", type: "number" }
    ],
    insumos: [
      { label: "Nome da Embalagem", key: "nomeEmbalagemCompra" },
      { label: "Nome da Unidade de Consumo", key: "nomeUnidadeConsumo" },
      { label: "Preço da Embalagem (R$)", key: "precoEmbalagem", type: "number" },
      { label: "Qtd na Embalagem", key: "qtdEmbalagem", type: "number" }
    ]
  };
  const simpleSectionHelp = {
    motor1: {
      title: "Material calculado por peso",
      description: "Use esta área para materiais do Motor 1. Ela continua disponível, mas costuma ser menos usada no dia a dia."
    },
    motor2: {
      title: "Base principal do cálculo",
      description: "Cadastre material, espessura, corte e preço por metro. Essa é a combinação principal do sistema."
    },
    insumos: {
      title: "Custo unitário automático",
      description: "O sistema usa preço da embalagem e quantidade para calcular automaticamente o custo unitário de cada insumo."
    }
  };
  const renderFormContent = () => {
    var _a, _b, _c;
    if (activeSection === "catalogo") return renderCatalogoForm();
    if (activeSection === "regras") return renderRegraForm();
    if (activeSection === "politicas") return renderPoliticaForm();
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      simpleSectionHelp[activeSection] && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/20 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-foreground", children: (_a = simpleSectionHelp[activeSection]) == null ? void 0 : _a.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: (_b = simpleSectionHelp[activeSection]) == null ? void 0 : _b.description })
      ] }),
      (_c = simpleFields[activeSection]) == null ? void 0 : _c.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-medium text-muted-foreground", children: f.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: f.type || "text",
            inputMode: f.type === "number" ? "decimal" : "text",
            value: form[f.key] || "",
            onChange: (e) => setField(f.key, e.target.value),
            className: "mt-1"
          }
        )
      ] }, f.key))
    ] });
  };
  const sectionLabels = {
    motor1: "Motor 1",
    motor2: "Motor 2",
    insumos: "Insumo",
    regras: "Regra de Cálculo",
    catalogo: "Serviço",
    politicas: "Política Comercial"
  };
  const dialogTitle = `${editItem ? "Editar" : "Adicionar"} ${sectionLabels[activeSection]}`;
  const filteredMotor1 = reactExports.useMemo(() => {
    if (!searchMotor1) return motor1;
    const q = normalize(searchMotor1);
    return motor1.filter((e) => normalize(e.material).includes(q) || String(e.densidade).includes(q));
  }, [motor1, searchMotor1]);
  const filteredMotor2 = reactExports.useMemo(() => {
    if (!searchMotor2) return motor2;
    const q = normalize(searchMotor2);
    return motor2.filter(
      (e) => normalize(e.material).includes(q) || String(e.espessura).includes(q) || String(e.corte).includes(q)
    );
  }, [motor2, searchMotor2]);
  const filteredInsumos = reactExports.useMemo(() => {
    if (!searchInsumos) return insumos;
    const q = normalize(searchInsumos);
    return insumos.filter(
      (e) => normalize(e.nomeUnidadeConsumo).includes(q) || normalize(e.nomeEmbalagemCompra).includes(q)
    );
  }, [insumos, searchInsumos]);
  const filteredRegras = reactExports.useMemo(() => {
    if (!searchRegras) return regras;
    const q = normalize(searchRegras);
    return regras.filter((e) => normalize(e.nomeRegra).includes(q));
  }, [regras, searchRegras]);
  const filteredCatalogo = reactExports.useMemo(() => {
    if (!searchCatalogo) return servicos;
    const q = normalize(searchCatalogo);
    return servicos.filter(
      (e) => normalize(e.nomeServico).includes(q) || normalize(e.materialPadrao).includes(q) || normalize(regraMap.get(e.regraId) ?? "").includes(q)
    );
  }, [servicos, searchCatalogo, regraMap]);
  const filteredPoliticas = reactExports.useMemo(() => {
    if (!searchPoliticas) return politicas;
    const q = normalize(searchPoliticas);
    return politicas.filter(
      (e) => normalize(e.nomePolitica).includes(q) || normalize(e.formasPagamento || "").includes(q) || normalize(e.garantia || "").includes(q)
    );
  }, [politicas, searchPoliticas]);
  const renderMateriaisTab = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SubSection,
      {
        title: "Motor 1 — Chapas e Bobinas",
        description: "Materiais comprados em bobina/chapa, com cálculo por peso.",
        onAdd: () => openAdd("motor1"),
        isEmpty: filteredMotor1.length === 0 && motor1.length === 0,
        emptyText: "Nenhum material cadastrado no Motor 1.",
        searchValue: searchMotor1,
        onSearchChange: setSearchMotor1,
        totalCount: motor1.length,
        filteredCount: filteredMotor1.length,
        searchPlaceholder: "Buscar por material ou densidade...",
        addLabel: "Novo material",
        children: filteredMotor1.length === 0 && motor1.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground text-center py-4 px-5", children: [
          'Nenhum resultado para "',
          searchMotor1,
          '"'
        ] }) : filteredMotor1.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ItemRow,
          {
            item: e,
            section: "motor1",
            onEdit: openEdit,
            onDelete: handleDelete,
            deletingId,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: e.material }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                e.densidade,
                " g/cm³ · ",
                fmt(e.precoQuilo),
                "/kg"
              ] })
            ]
          },
          e.id
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SubSection,
      {
        title: "Motor 2 — Material Dobrado",
        description: "Materiais comprados já dobrados, com preço por metro linear.",
        onAdd: () => openAdd("motor2"),
        isEmpty: filteredMotor2.length === 0 && motor2.length === 0,
        emptyText: "Nenhum material cadastrado no Motor 2.",
        searchValue: searchMotor2,
        onSearchChange: setSearchMotor2,
        totalCount: motor2.length,
        filteredCount: filteredMotor2.length,
        searchPlaceholder: "Buscar por material, espessura...",
        tag: "Principal",
        addLabel: "Novo material",
        children: filteredMotor2.length === 0 && motor2.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground text-center py-4 px-5", children: [
          'Nenhum resultado para "',
          searchMotor2,
          '"'
        ] }) : filteredMotor2.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ItemRow,
          {
            item: e,
            section: "motor2",
            onEdit: openEdit,
            onDelete: handleDelete,
            deletingId,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: e.material }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: [
                  e.espessura,
                  "mm"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: [
                  e.corte,
                  "mm"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] font-semibold text-primary", children: [
                  fmt(e.precoMetroLinear),
                  "/m"
                ] })
              ] })
            ]
          },
          e.id
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SubSection,
      {
        title: "Insumos",
        description: "Materiais consumíveis usados nas regras de cálculo.",
        onAdd: () => openAdd("insumos"),
        isEmpty: filteredInsumos.length === 0 && insumos.length === 0,
        emptyText: "Nenhum insumo cadastrado.",
        searchValue: searchInsumos,
        onSearchChange: setSearchInsumos,
        totalCount: insumos.length,
        filteredCount: filteredInsumos.length,
        searchPlaceholder: "Buscar por nome do insumo...",
        addLabel: "Novo insumo",
        children: filteredInsumos.length === 0 && insumos.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground text-center py-4 px-5", children: [
          'Nenhum resultado para "',
          searchInsumos,
          '"'
        ] }) : filteredInsumos.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ItemRow,
          {
            item: e,
            section: "insumos",
            onEdit: openEdit,
            onDelete: handleDelete,
            deletingId,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: e.nomeEmbalagemCompra }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                e.nomeUnidadeConsumo,
                " · ",
                fmt(e.precoEmbalagem),
                " / ",
                e.qtdEmbalagem,
                " →",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-primary", children: [
                  fmt(getCustoUnitario(e)),
                  "/un"
                ] })
              ] })
            ]
          },
          e.id
        ))
      }
    )
  ] });
  const renderRegrasTab = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6 max-w-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    SubSection,
    {
      title: "Regras de Cálculo",
      description: "Definem como os insumos entram no cálculo do orçamento.",
      onAdd: () => openAdd("regras"),
      isEmpty: filteredRegras.length === 0 && regras.length === 0,
      emptyText: "Nenhuma regra cadastrada.",
      searchValue: searchRegras,
      onSearchChange: setSearchRegras,
      totalCount: regras.length,
      filteredCount: filteredRegras.length,
      searchPlaceholder: "Buscar por nome da regra...",
      addLabel: "Nova regra",
      children: filteredRegras.length === 0 && regras.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground text-center py-4 px-5", children: [
        'Nenhum resultado para "',
        searchRegras,
        '"'
      ] }) : filteredRegras.map((e) => {
        const insNames = e.itensRegra.map((ir) => {
          var _a;
          return (_a = insumos.find((ins) => ins.id === ir.insumoId)) == null ? void 0 : _a.nomeEmbalagemCompra;
        }).filter(Boolean);
        const displayNames = insNames.length <= 3 ? insNames.join(", ") : `${insNames.slice(0, 3).join(", ")} +${insNames.length - 3}`;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ItemRow,
          {
            item: e,
            section: "regras",
            onEdit: openEdit,
            onDelete: handleDelete,
            deletingId,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: e.nomeRegra }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: insNames.length > 0 ? displayNames : "Nenhum insumo vinculado" })
            ]
          },
          e.id
        );
      })
    }
  ) });
  const renderCatalogoTab = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6 max-w-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    SubSection,
    {
      title: "Catálogo de Serviços",
      description: "Serviços disponíveis para orçamento, com motor, material e fatores de dificuldade.",
      onAdd: () => openAdd("catalogo"),
      isEmpty: filteredCatalogo.length === 0 && servicos.length === 0,
      emptyText: "Nenhum serviço cadastrado.",
      searchValue: searchCatalogo,
      onSearchChange: setSearchCatalogo,
      totalCount: servicos.length,
      filteredCount: filteredCatalogo.length,
      searchPlaceholder: "Buscar por nome, material ou regra...",
      addLabel: "Novo serviço",
      children: filteredCatalogo.length === 0 && servicos.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground text-center py-4 px-5", children: [
        'Nenhum resultado para "',
        searchCatalogo,
        '"'
      ] }) : filteredCatalogo.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        ItemRow,
        {
          item: e,
          section: "catalogo",
          onEdit: openEdit,
          onDelete: handleDelete,
          deletingId,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: e.nomeServico }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: e.motorType === "motor1" ? "default" : "secondary", className: "text-[10px] px-1.5 py-0", children: e.motorType === "motor1" ? "M1" : "M2" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              e.materialPadrao,
              " · ",
              e.espessuraPadrao,
              "mm · ",
              e.cortePadrao,
              "mm"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground/70", children: [
              "Regra: ",
              regraName(e.regraId)
            ] })
          ]
        },
        e.id
      ))
    }
  ) });
  const renderPoliticasTab = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6 max-w-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    SubSection,
    {
      title: "Políticas Comerciais",
      description: "Condições comerciais usadas no orçamento e na Ordem de Serviço.",
      onAdd: () => openAdd("politicas"),
      isEmpty: filteredPoliticas.length === 0 && politicas.length === 0,
      searchValue: searchPoliticas,
      onSearchChange: setSearchPoliticas,
      totalCount: politicas.length,
      filteredCount: filteredPoliticas.length,
      searchPlaceholder: "Buscar por nome, pagamento ou garantia...",
      addLabel: "Nova política",
      emptyText: "Nenhuma política cadastrada.",
      children: filteredPoliticas.length === 0 && politicas.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground text-center py-4 px-5", children: [
        'Nenhum resultado para "',
        searchPoliticas,
        '"'
      ] }) : filteredPoliticas.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        ItemRow,
        {
          item: e,
          section: "politicas",
          onEdit: openEdit,
          onDelete: handleDelete,
          deletingId,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: e.nomePolitica }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              e.validadeDias,
              " dias · Garantia: ",
              e.tempoGarantia || "—"
            ] }),
            e.formasPagamento && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground/70 truncate max-w-[300px]", children: e.formasPagamento })
          ]
        },
        e.id
      ))
    }
  ) });
  const dialogDescription = {
    motor1: "Cadastre materiais usados no cálculo por peso. Essa área costuma ser menos frequente no uso diário.",
    motor2: "Cadastre a base principal de material por metro: material, espessura, corte e preço.",
    insumos: "Defina os itens de consumo. O custo unitário continua sendo calculado automaticamente pelo sistema.",
    regras: "Monte a regra padrão de consumo que será aplicada automaticamente aos serviços do catálogo.",
    catalogo: "Conecte serviço, material e regra sem alterar a estrutura do cálculo existente.",
    politicas: "Edite os textos e condições comerciais usados no orçamento e na ordem de serviço."
  };
  const dialogWidthClass = activeSection === "catalogo" || activeSection === "politicas" ? "max-w-2xl" : activeSection === "regras" ? "max-w-xl" : "max-w-lg";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 lg:px-6 pb-24 lg:pb-8 pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-foreground", children: "Configurações" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Gerencie os dados base do seu sistema" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: (value) => setTab(value), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full grid grid-cols-5 gap-1 mb-6 h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "empresa", className: "text-[11px] px-2 py-2.5 gap-1 flex-col sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Empresa" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "materiais", className: "text-[11px] px-2 py-2.5 gap-1 flex-col sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Materiais" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "regras", className: "text-[11px] px-2 py-2.5 gap-1 flex-col sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Regras" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "catalogo", className: "text-[11px] px-2 py-2.5 gap-1 flex-col sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Catálogo" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "politicas", className: "text-[11px] px-2 py-2.5 gap-1 flex-col sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Políticas" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 border-dashed bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(currentTabMeta.icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: currentTabMeta.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: currentTabMeta.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-2", children: currentTabMeta.helper })
        ] })
      ] }) }) }),
      tab === "empresa" && /* @__PURE__ */ jsxRuntimeExports.jsx(MinhaEmpresaForm, {}),
      tab !== "empresa" && isLoadingTech ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        tab === "materiais" && renderMateriaisTab(),
        tab === "regras" && renderRegrasTab(),
        tab === "catalogo" && renderCatalogoTab(),
        tab === "politicas" && renderPoliticasTab()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: cn(dialogWidthClass, "max-h-[85vh] overflow-y-auto"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dialogTitle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-xs text-muted-foreground", children: dialogDescription[activeSection] })
      ] }),
      renderFormContent(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDialogOpen(false), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, disabled: isSaving, children: isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
          " Salvando..."
        ] }) : "Salvar" })
      ] })
    ] }) })
  ] });
}
export {
  Configuracoes
};
