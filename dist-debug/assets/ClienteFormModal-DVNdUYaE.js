import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogDescription } from "./dialog-ScvtRc5R.js";
import { c as createLucideIcon, d as ue, a as cn, I as Input, B as Button, e as LoaderCircle, k as Separator } from "./index-BN5a_yey.js";
import { L as Label } from "./label-BChNKNza.js";
import { u as useDraft } from "./useDraft-B2tUcsQY.js";
import { U as User } from "./user-A1J5wkwB.js";
import { B as Building2 } from "./building-2-DctO8KH6.js";
import { S as Search } from "./search-CUbuJP2V.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CircleAlert = createLucideIcon("CircleAlert", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const MapPin = createLucideIcon("MapPin", [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
]);
const EMPTY_FORM = {
  tipo: "PF",
  nome: "",
  documento: "",
  whatsapp: "",
  cep: "",
  endereco: "",
  numero: "",
  bairro: "",
  cidade: ""
};
function formFromCliente(c) {
  return {
    tipo: c.tipo,
    nome: c.nomeRazaoSocial,
    documento: c.documento,
    whatsapp: c.whatsapp,
    cep: c.cep,
    endereco: c.endereco,
    numero: c.numero,
    bairro: c.bairro,
    cidade: c.cidade
  };
}
function formatCPF(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function formatCNPJ(v) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
}
function formatPhone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}
function formatCEP(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d)/, "$1-$2");
}
function ClienteFormModal({ open, onClose, onSave, editing }) {
  const draftKey = editing ? `draft:cliente-edit:${editing.id}` : "draft:cliente-new";
  const initialForm = editing ? formFromCliente(editing) : EMPTY_FORM;
  const [draft, setDraft, clearDraft, wasRestored] = useDraft(draftKey, initialForm);
  const [loadingCNPJ, setLoadingCNPJ] = reactExports.useState(false);
  const [loadingCEP, setLoadingCEP] = reactExports.useState(false);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (open && wasRestored) {
      ue.info("Rascunho restaurado.", { duration: 2e3 });
    }
  }, [open, wasRestored]);
  reactExports.useEffect(() => {
    if (!open) return;
    if (editing) {
      const stored2 = sessionStorage.getItem(draftKey);
      if (!stored2) {
        setDraft(formFromCliente(editing));
      }
      return;
    }
    const stored = sessionStorage.getItem("draft:cliente-new");
    if (!stored) {
      setDraft(EMPTY_FORM);
    }
  }, [open, editing, draftKey, setDraft]);
  const { tipo, nome, documento, whatsapp, cep, endereco, numero, bairro, cidade } = draft;
  const updateField = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };
  const rawDoc = documento.replace(/\D/g, "");
  const rawCep = cep.replace(/\D/g, "");
  const rawPhone = whatsapp.replace(/\D/g, "");
  const docComplete = rawDoc.length === 0 || rawDoc.length >= (tipo === "PF" ? 11 : 14);
  const docPartiallyFilled = rawDoc.length > 0 && !docComplete;
  const nomeValid = nome.trim().length > 0;
  const phoneValid = rawPhone.length >= 10;
  const canSave = nomeValid && phoneValid && docComplete;
  const progressChecks = rawDoc.length > 0 ? [nomeValid, phoneValid, docComplete] : [nomeValid, phoneValid];
  const progressDone = progressChecks.filter(Boolean).length;
  const progressTotal = progressChecks.length;
  const progressLabel = canSave ? rawDoc.length > 0 ? "Cadastro completo" : "Pronto para salvar" : docPartiallyFilled ? `Documento incompleto (${progressDone}/${progressTotal})` : `${progressDone}/${progressTotal}`;
  const buscarCNPJ = async () => {
    if (rawDoc.length !== 14) {
      ue.error("CNPJ inválido", { duration: 5e3 });
      return;
    }
    setLoadingCNPJ(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${rawDoc}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDraft((prev) => ({
        ...prev,
        nome: data.razao_social || "",
        ...data.cep ? {
          cep: formatCEP(data.cep),
          endereco: `${data.descricao_tipo_de_logradouro || ""} ${data.logradouro || ""}`.trim(),
          numero: data.numero || "",
          bairro: data.bairro || "",
          cidade: `${data.municipio || ""} - ${data.uf || ""}`
        } : {}
      }));
      ue.success("Dados do CNPJ carregados!", { duration: 2500 });
    } catch {
      ue.error("Não foi possível buscar o CNPJ.", { duration: 5e3 });
    } finally {
      setLoadingCNPJ(false);
    }
  };
  const buscarCEP = async () => {
    if (rawCep.length !== 8) {
      ue.error("CEP inválido", { duration: 5e3 });
      return;
    }
    setLoadingCEP(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await res.json();
      if (data.erro) throw new Error();
      setDraft((prev) => ({
        ...prev,
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: `${data.localidade || ""} - ${data.uf || ""}`
      }));
      ue.success("Endereço carregado!", { duration: 2500 });
    } catch {
      ue.error("CEP não encontrado.", { duration: 5e3 });
    } finally {
      setLoadingCEP(false);
    }
  };
  const handleSave = async () => {
    if (isSaving || !canSave) return;
    setIsSaving(true);
    try {
      await Promise.resolve(
        onSave({
          id: (editing == null ? void 0 : editing.id) ?? crypto.randomUUID(),
          tipo,
          nomeRazaoSocial: nome.trim(),
          documento,
          whatsapp,
          cep,
          endereco,
          numero,
          bairro,
          cidade
        })
      );
      clearDraft();
    } finally {
      setIsSaving(false);
    }
  };
  const handleClose = () => {
    clearDraft();
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && handleClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Editar Cliente" : "Cadastrar Novo Cliente" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-xs", children: editing ? "Atualize os dados do cliente abaixo." : "Preencha os dados básicos para cadastrar o cliente. Campos com * são obrigatórios." })
    ] }),
    !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "h-full rounded-full transition-all duration-300",
            canSave ? "bg-emerald-500" : docPartiallyFilled ? "bg-amber-500" : "bg-primary"
          ),
          style: { width: `${progressDone / progressTotal * 100}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[10px]", docPartiallyFilled ? "text-amber-600" : "text-muted-foreground"), children: canSave ? `✓ ${progressLabel}` : progressLabel })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium", children: "Tipo de cliente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 mt-1.5", children: ["PF", "PJ"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              updateField("tipo", t);
              updateField("documento", "");
            },
            className: cn(
              "flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all",
              tipo === t ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
            ),
            children: [
              t === "PF" ? /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4" }),
              t === "PF" ? "Pessoa Física" : "Pessoa Jurídica"
            ]
          },
          t
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium", children: [
          tipo === "PF" ? "CPF" : "CNPJ",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(opcional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mb-1", children: tipo === "PF" ? "Opcional. Recomendado para organizar melhor o cadastro — você pode preencher depois." : "Opcional. Ao preencher, você pode buscar os dados da empresa automaticamente." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: documento,
              onChange: (e) => updateField("documento", tipo === "PF" ? formatCPF(e.target.value) : formatCNPJ(e.target.value)),
              placeholder: tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00",
              className: cn("flex-1", docPartiallyFilled && "border-amber-400 focus-visible:ring-amber-400")
            }
          ),
          tipo === "PJ" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: buscarCNPJ,
              disabled: loadingCNPJ || rawDoc.length !== 14,
              className: "gap-1",
              children: [
                loadingCNPJ ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs", children: "Buscar" })
              ]
            }
          )
        ] }),
        docPartiallyFilled && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1 text-[10px] text-amber-600 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3 shrink-0" }),
          tipo === "PF" ? "Complete os 11 dígitos do CPF ou apague para deixar em branco." : "Complete os 14 dígitos do CNPJ ou apague para deixar em branco."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium", children: [
          tipo === "PF" ? "Nome completo" : "Razão Social",
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mb-1", children: "Este é o nome que aparecerá no orçamento." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: nome,
            onChange: (e) => updateField("nome", e.target.value),
            placeholder: tipo === "PF" ? "Ex: João da Silva" : "Ex: Empresa Ltda.",
            className: "mt-1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium", children: "WhatsApp *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mb-1", children: "Número com DDD — usado para contato e envio do orçamento." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: whatsapp,
            onChange: (e) => updateField("whatsapp", formatPhone(e.target.value)),
            placeholder: "(11) 99999-9999"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-foreground flex items-center gap-1.5 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-muted-foreground" }),
          "Endereço ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(opcional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "CEP" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mb-1", children: "Digite o CEP para preencher o endereço automaticamente." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: cep,
                onChange: (e) => updateField("cep", formatCEP(e.target.value)),
                placeholder: "00000-000",
                className: "flex-1"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: buscarCEP,
                disabled: loadingCEP || rawCep.length !== 8,
                className: "gap-1",
                children: [
                  loadingCEP ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs", children: "Buscar" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Endereço" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: endereco,
                onChange: (e) => updateField("endereco", e.target.value),
                placeholder: "Rua, Avenida..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Nº" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: numero, onChange: (e) => updateField("numero", e.target.value), placeholder: "123" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Bairro" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bairro, onChange: (e) => updateField("bairro", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Cidade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: cidade, onChange: (e) => updateField("cidade", e.target.value) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, disabled: !canSave || isSaving, className: "w-full h-11", children: isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Salvando..."
      ] }) : editing ? "Salvar Alterações" : "Cadastrar Cliente" })
    ] })
  ] }) });
}
export {
  ClienteFormModal as C,
  MapPin as M
};
