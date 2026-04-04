import { j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { u as useAuth, B as Button, L as LogOut } from "./index-BN5a_yey.js";
import { C as Card, a as CardContent } from "./card-B4K8qJaR.js";
import { C as Clock } from "./clock-h-zti0qz.js";
import "./charts-vendor-BrW5ULH7.js";
import "./radix-vendor-CEzLCFk2.js";
import "./pdf-vendor-Dv6cUxDn.js";
import "./query-vendor-BLvK6anV.js";
import "./router-vendor-CCo6OTFM.js";
import "./supabase-vendor-BsjcsmU5.js";
function PendingApproval() {
  const { user, signOut } = useAuth();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "max-w-sm w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-8 text-center space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-16 w-16 text-accent mx-auto" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-foreground", children: "Aguardando Aprovação" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Sua conta ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: user == null ? void 0 : user.email }),
      " foi criada com sucesso, mas ainda não possui um papel de acesso atribuído."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Entre em contato com o administrador do sistema para que ele atribua seu papel (admin, vendedor ou financeiro)." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: signOut, className: "w-full mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "mr-2 h-4 w-4" }),
      "Sair"
    ] })
  ] }) }) });
}
export {
  PendingApproval
};
