import { j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { C as Card, a as CardContent } from "./card-B4K8qJaR.js";
import { S as ShieldAlert } from "./shield-alert-CxohshIv.js";
import "./charts-vendor-BrW5ULH7.js";
import "./index-BN5a_yey.js";
import "./radix-vendor-CEzLCFk2.js";
import "./pdf-vendor-Dv6cUxDn.js";
import "./query-vendor-BLvK6anV.js";
import "./router-vendor-CCo6OTFM.js";
import "./supabase-vendor-BsjcsmU5.js";
function AccessDenied({ message = "Você não tem permissão para acessar esta área." }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "flex items-center justify-center p-8",
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, {
      className: "max-w-sm w-full",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, {
        className: "pt-6 text-center space-y-3",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, {
            className: "h-12 w-12 text-muted-foreground/40 mx-auto",
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
            className: "text-lg font-semibold text-foreground",
            children: "Acesso Restrito",
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
        ],
      }),
    }),
  });
}
export { AccessDenied };
