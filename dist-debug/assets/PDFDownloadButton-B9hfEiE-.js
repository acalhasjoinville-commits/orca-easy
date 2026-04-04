const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/pdf-vendor-Dv6cUxDn.js","assets/charts-vendor-BrW5ULH7.js","assets/react-vendor-ivNAblfg.js","assets/OrcamentoPDF-C55F3SoG.js"])))=>i.map(i=>d[i]);
import { c as createLucideIcon, B as Button, e as LoaderCircle, _ as __vitePreload } from "./index-BN5a_yey.js";
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Copy = createLucideIcon("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CreditCard = createLucideIcon("CreditCard", [
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2", key: "ynyp8z" }],
  ["line", { x1: "2", x2: "22", y1: "10", y2: "10", key: "1b3vmo" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Factory = createLucideIcon("Factory", [
  [
    "path",
    {
      d: "M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
      key: "159hny"
    }
  ],
  ["path", { d: "M17 18h1", key: "uldtlt" }],
  ["path", { d: "M12 18h1", key: "s9uhes" }],
  ["path", { d: "M7 18h1", key: "1neino" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Share2 = createLucideIcon("Share2", [
  ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
  ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
  ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
  ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }],
  ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Truck = createLucideIcon("Truck", [
  ["path", { d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2", key: "wrbu53" }],
  ["path", { d: "M15 18H9", key: "1lyqi6" }],
  [
    "path",
    {
      d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
      key: "lysw3i"
    }
  ],
  ["circle", { cx: "17", cy: "18", r: "2", key: "332jqn" }],
  ["circle", { cx: "7", cy: "18", r: "2", key: "19iecd" }]
]);
async function fetchLogoBase64(url) {
  if (!url) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8e3);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      console.warn(`Falha ao carregar logo para PDF: HTTP ${res.status}`);
      return null;
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("image/")) {
      console.warn("Falha ao carregar logo para PDF: arquivo não é imagem válida.");
      return null;
    }
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Falha ao converter logo em base64 para PDF.", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t)
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function PDFDownloadButton({ orcamento, cliente, empresa, size = "default", className }) {
  const [logoBase64, setLogoBase64] = reactExports.useState(null);
  const [generating, setGenerating] = reactExports.useState(false);
  const corDestaque = (empresa == null ? void 0 : empresa.corDestaque) || "#F57C00";
  reactExports.useEffect(() => {
    let cancelled = false;
    if (empresa == null ? void 0 : empresa.logoUrl) {
      fetchLogoBase64(empresa.logoUrl).then((b64) => {
        if (!cancelled) setLogoBase64(b64);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [empresa == null ? void 0 : empresa.logoUrl]);
  const handleShare = async () => {
    if (generating) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 50));
    try {
      const [{ pdf }, { OrcamentoPDF }] = await Promise.all([
        __vitePreload(() => import("./pdf-vendor-Dv6cUxDn.js").then((n) => n.r), true ? __vite__mapDeps([0,1,2]) : void 0),
        __vitePreload(() => import("./OrcamentoPDF-C55F3SoG.js"), true ? __vite__mapDeps([3,2,1,0]) : void 0)
      ]);
      const buildBlob = async (withLogo) => {
        const OrcamentoPDFComponent = OrcamentoPDF;
        return pdf(
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            OrcamentoPDFComponent,
            {
              orcamento,
              cliente,
              empresa,
              logoBase64: withLogo ? logoBase64 : null
            }
          )
        ).toBlob();
      };
      let blob;
      try {
        blob = await buildBlob(Boolean(logoBase64));
      } catch (firstError) {
        if (!logoBase64) throw firstError;
        console.warn("Falha ao renderizar PDF com logo, tentando sem logo.", firstError);
        blob = await buildBlob(false);
      }
      const nomeCliente = ((cliente == null ? void 0 : cliente.nomeRazaoSocial) || orcamento.nomeCliente || "Cliente_Nao_Identificado").trim().replace(/\s+/g, "_");
      const nomeArquivo = `Orcamento_${nomeCliente}_${orcamento.numeroOrcamento || "novo"}.pdf`;
      const file = new File([blob], nomeArquivo, { type: "application/pdf" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Orçamento OrçaCalhas",
          text: "Segue o orçamento solicitado."
        });
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 3e4);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Erro ao gerar/enviar PDF:", err);
      toast({ title: "Erro ao gerar PDF", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      size,
      className,
      style: { backgroundColor: corDestaque, color: "#fff" },
      disabled: generating,
      onClick: (e) => {
        e.stopPropagation();
        handleShare();
      },
      children: generating ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        size !== "icon" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", children: "Gerando..." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }),
        size !== "icon" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", children: "Enviar Orçamento" })
      ] })
    }
  );
}
export {
  Copy as C,
  Factory as F,
  PDFDownloadButton as P,
  Truck as T,
  CreditCard as a,
  fetchLogoBase64 as f,
  toast as t
};
