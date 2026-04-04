import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { c as createLucideIcon, h as useClientes, g as useIsMobile, e as LoaderCircle, B as Button, P as Plus, U as Users, I as Input, a as cn, d as ue } from "./index-BN5a_yey.js";
import { C as Card, a as CardContent } from "./card-B4K8qJaR.js";
import { P as Pencil, A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-C9g92JDz.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, E as EllipsisVertical, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-Cw3zSzm8.js";
import { M as MapPin, C as ClienteFormModal } from "./ClienteFormModal-DVNdUYaE.js";
import { S as Search } from "./search-CUbuJP2V.js";
import { T as Trash2 } from "./trash-2-DvXBRZTj.js";
import "./charts-vendor-BrW5ULH7.js";
import "./radix-vendor-CEzLCFk2.js";
import "./pdf-vendor-Dv6cUxDn.js";
import "./query-vendor-BLvK6anV.js";
import "./router-vendor-CCo6OTFM.js";
import "./supabase-vendor-BsjcsmU5.js";
import "./chevron-right-DibYopn_.js";
import "./check-D0l1wUju.js";
import "./dialog-ScvtRc5R.js";
import "./label-BChNKNza.js";
import "./useDraft-B2tUcsQY.js";
import "./user-A1J5wkwB.js";
import "./building-2-DctO8KH6.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Phone = createLucideIcon("Phone", [
  [
    "path",
    {
      d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
      key: "foiqr5"
    }
  ]
]);
const getDocumentoLabel = (cliente) => {
  var _a;
  const documento = (_a = cliente.documento) == null ? void 0 : _a.trim();
  return documento ? documento : "Não informado";
};
function Clientes() {
  const { clientes, isLoading, addCliente, updateCliente, deleteCliente } = useClientes();
  const [search, setSearch] = reactExports.useState("");
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [deletingId, setDeletingId] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const isMobile = useIsMobile();
  const normalizedSearch = search.toLowerCase().trim();
  const clientesSemDocumento = clientes.filter((c) => {
    var _a;
    return !((_a = c.documento) == null ? void 0 : _a.trim());
  }).length;
  const filtered = clientes.filter((c) => {
    if (!normalizedSearch) return true;
    return c.nomeRazaoSocial.toLowerCase().includes(normalizedSearch) || c.documento.toLowerCase().includes(normalizedSearch) || c.whatsapp.toLowerCase().includes(normalizedSearch) || c.cidade.toLowerCase().includes(normalizedSearch);
  });
  const handleSave = async (c) => {
    try {
      if (editing) {
        await updateCliente.mutateAsync(c);
        ue.success("Cliente atualizado!", { duration: 2500 });
      } else {
        await addCliente.mutateAsync(c);
        ue.success("Cliente cadastrado!", { duration: 2500 });
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      ue.error("Erro ao salvar cliente.", { duration: 5e3 });
    }
  };
  const handleDelete = async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deleteCliente.mutateAsync(id);
      ue.success("Cliente removido.", { duration: 2500 });
    } catch {
      ue.error("Erro ao remover cliente.", { duration: 5e3 });
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };
  const handleEdit = (c) => {
    setEditing(c);
    setModalOpen(true);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 lg:px-6 pb-24 lg:pb-8 pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-foreground", children: "Clientes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: clientes.length > 0 ? `${clientes.length} cliente${clientes.length !== 1 ? "s" : ""} cadastrado${clientes.length !== 1 ? "s" : ""}${clientesSemDocumento > 0 ? ` • ${clientesSemDocumento} sem documento` : ""}` : "Gerencie sua base de clientes" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => {
            setEditing(null);
            setModalOpen(true);
          },
          size: "sm",
          className: "hidden sm:flex gap-1.5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "Novo Cliente"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4 border-dashed bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Base de clientes da operação" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Consulte contatos, documentos e cidade com mais rapidez antes de abrir novos orçamentos." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: search,
                onChange: (e) => setSearch(e.target.value),
                placeholder: "Buscar por nome, documento, WhatsApp ou cidade...",
                className: "h-9 bg-background pl-9"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[11px] text-muted-foreground", children: 'Clientes sem CPF/CNPJ continuam disponíveis para orçamento e aparecem como "Não informado".' })
    ] }) }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mb-4 h-12 w-12 text-muted-foreground/30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-lg font-semibold text-foreground", children: clientes.length === 0 ? "Nenhum cliente cadastrado" : "Nenhum resultado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 max-w-xs text-sm text-muted-foreground", children: clientes.length === 0 ? "Cadastre seu primeiro cliente para começar." : "Tente outra busca." }),
      clientes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => {
            setEditing(null);
            setModalOpen(true);
          },
          className: "gap-1.5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "Novo Cliente"
          ]
        }
      )
    ] }) : !isMobile ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b bg-muted/40 text-left text-[11px] text-muted-foreground uppercase tracking-wide", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-12", children: "Tipo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "Nome / Razao Social" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-36", children: "Documento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-36", children: "WhatsApp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-32", children: "Cidade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold w-10 text-right", children: "Acoes" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((c) => {
        var _a;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/30 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                c.tipo === "PJ" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
              ),
              children: c.tipo
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 font-medium truncate max-w-[250px]", children: c.nomeRazaoSocial }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "td",
            {
              className: cn(
                "py-2.5 px-3 text-xs",
                ((_a = c.documento) == null ? void 0 : _a.trim()) ? "text-muted-foreground" : "text-muted-foreground/70 italic"
              ),
              children: getDocumentoLabel(c)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-muted-foreground text-xs", children: c.whatsapp || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-muted-foreground text-xs", children: c.cidade || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "min-w-[120px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleEdit(c), className: "text-xs gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
                " Editar"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                DropdownMenuItem,
                {
                  onClick: () => setDeleteTarget(c),
                  className: "text-xs gap-2 text-destructive focus:text-destructive",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                    " Excluir"
                  ]
                }
              )
            ] })
          ] }) })
        ] }, c.id);
      }) })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filtered.map((c) => {
      var _a;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: cn(
            "overflow-hidden border-l-4",
            c.tipo === "PJ" ? "border-l-accent/60" : "border-l-primary/40"
          ),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                      c.tipo === "PJ" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                    ),
                    children: c.tipo
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: c.nomeRazaoSocial })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: !((_a = c.documento) == null ? void 0 : _a.trim()) ? "italic text-muted-foreground/70" : void 0, children: getDocumentoLabel(c) }),
                c.whatsapp && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
                  " ",
                  c.whatsapp
                ] }),
                c.cidade && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
                  " ",
                  c.cidade
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ml-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "h-4 w-4" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "min-w-[120px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleEdit(c), className: "text-xs gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
                  " Editar"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  DropdownMenuItem,
                  {
                    onClick: () => setDeleteTarget(c),
                    className: "text-xs gap-2 text-destructive focus:text-destructive",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                      " Excluir"
                    ]
                  }
                )
              ] })
            ] })
          ] }) })
        },
        c.id
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AlertDialog,
      {
        open: !!deleteTarget,
        onOpenChange: (open) => {
          if (!open) setDeleteTarget(null);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Confirmar exclusão" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
              "Deseja remover o cliente ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleteTarget == null ? void 0 : deleteTarget.nomeRazaoSocial }),
              "? Esta ação não pode ser desfeita."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                onClick: () => deleteTarget && handleDelete(deleteTarget.id),
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                children: "Excluir"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => {
          setEditing(null);
          setModalOpen(true);
        },
        className: "fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors sm:hidden",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-6 w-6" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ClienteFormModal,
      {
        open: modalOpen,
        onClose: () => {
          setModalOpen(false);
          setEditing(null);
        },
        onSave: handleSave,
        editing
      },
      (editing == null ? void 0 : editing.id) ?? "new"
    )
  ] });
}
export {
  Clientes
};
