import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { c as createLucideIcon, u as useAuth, I as Input, B as Button, e as LoaderCircle, F as FileText, U as Users, d as ue } from "./index-BN5a_yey.js";
import { C as Card, a as CardContent } from "./card-B4K8qJaR.js";
import { L as Label } from "./label-BChNKNza.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-Cr3helAi.js";
import { U as UserPlus } from "./user-plus-CKnt5lBi.js";
import { S as ShieldCheck } from "./shield-check-cwQSkSPa.js";
import "./charts-vendor-BrW5ULH7.js";
import "./radix-vendor-CEzLCFk2.js";
import "./pdf-vendor-Dv6cUxDn.js";
import "./query-vendor-BLvK6anV.js";
import "./router-vendor-CCo6OTFM.js";
import "./supabase-vendor-BsjcsmU5.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const LogIn = createLucideIcon("LogIn", [
  ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", key: "u53s6r" }],
  ["polyline", { points: "10 17 15 12 10 7", key: "1ail0h" }],
  ["line", { x1: "15", x2: "3", y1: "12", y2: "12", key: "v6grx8" }]
]);
const TAB_COPY = {
  login: {
    title: "Entrar no sistema",
    description: "Use seu e-mail e senha para continuar de onde parou.",
    helper: "Se o acesso ainda não funcionar, confirme com um administrador se seu papel já foi liberado.",
    button: "Entrar"
  },
  signup: {
    title: "Criar sua conta",
    description: "Cadastre seus dados para entrar na empresa e depois receber seu acesso.",
    helper: "Depois do cadastro, um administrador precisa definir seu papel antes do primeiro uso.",
    button: "Criar conta"
  }
};
const HIGHLIGHTS = [
  {
    icon: FileText,
    title: "Orçamentos organizados",
    description: "Monte, revise e acompanhe cada proposta com mais clareza."
  },
  {
    icon: ShieldCheck,
    title: "Acesso controlado",
    description: "Cada pessoa entra com o papel certo para a rotina dela."
  },
  {
    icon: Users,
    title: "Equipe alinhada",
    description: "Clientes, financeiro e operação no mesmo lugar."
  }
];
function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = reactExports.useState("login");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [fullName, setFullName] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const currentCopy = reactExports.useMemo(() => TAB_COPY[tab], [tab]);
  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      ue.error(error.message === "Invalid login credentials" ? "E-mail ou senha inválidos." : error.message, {
        duration: 5e3
      });
    }
  };
  const handleSignup = async (event) => {
    event.preventDefault();
    if (!email || !password || !fullName) return;
    if (password.length < 6) {
      ue.error("A senha deve ter no mínimo 6 caracteres.", { duration: 5e3 });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      ue.error(error.message, { duration: 5e3 });
    } else {
      ue.success("Conta criada! Verifique seu e-mail para confirmar o cadastro.", { duration: 3e3 });
      setTab("login");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative hidden overflow-hidden bg-primary p-10 lg:flex lg:w-[500px] lg:flex-col lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white", children: "OC" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold tracking-tight text-white", children: "OrçaCalhas" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-[0.18em] text-white/60", children: "Plataforma operacional" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-3xl font-bold leading-tight text-white", children: "Gestão de orçamentos, clientes e operação em um só lugar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-relaxed text-white/75", children: "Uma base mais organizada para acompanhar orçamento, execução, financeiro e atendimento sem depender de planilhas soltas." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 space-y-3", children: HIGHLIGHTS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-white", children: item.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-white/70", children: item.description })
        ] })
      ] }) }, item.title)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 text-xs text-white/40", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " OrçaCalhas"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -left-16 top-1/3 h-40 w-40 rounded-full bg-white/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-center lg:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground", children: "OC" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold tracking-tight text-foreground", children: "OrçaCalhas" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Sistema de gestão para calhas, rufos e operação diária." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground", children: "Acesso ao sistema" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground", children: currentCopy.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: currentCopy.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: tab, onValueChange: (value) => setTab(value), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "login", children: "Entrar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "signup", children: "Criar conta" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: currentCopy.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: currentCopy.helper })
        ] }),
        tab === "login" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium", children: "E-mail" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "email",
                value: email,
                onChange: (event) => setEmail(event.target.value),
                placeholder: "seu@email.com",
                autoComplete: "email",
                autoFocus: true,
                required: true,
                className: "h-11"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium", children: "Senha" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "password",
                value: password,
                onChange: (event) => setPassword(event.target.value),
                placeholder: "••••••••",
                autoComplete: "current-password",
                required: true,
                className: "h-11"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: loading, className: "h-11 w-full font-semibold", children: [
            loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "mr-2 h-4 w-4" }),
            currentCopy.button
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSignup, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium", children: "Nome completo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: fullName,
                onChange: (event) => setFullName(event.target.value),
                placeholder: "Seu nome",
                autoComplete: "name",
                autoFocus: true,
                required: true,
                className: "h-11"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium", children: "E-mail" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "email",
                value: email,
                onChange: (event) => setEmail(event.target.value),
                placeholder: "seu@email.com",
                autoComplete: "email",
                required: true,
                className: "h-11"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium", children: "Senha" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "password",
                value: password,
                onChange: (event) => setPassword(event.target.value),
                placeholder: "Mínimo 6 caracteres",
                autoComplete: "new-password",
                minLength: 6,
                required: true,
                className: "h-11"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-foreground", children: "O que acontece depois do cadastro?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: "Sua conta é criada primeiro. Depois, um administrador da empresa precisa liberar o papel certo para você usar o sistema." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: loading, className: "h-11 w-full font-semibold", children: [
            loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-2 h-4 w-4" }),
            currentCopy.button
          ] })
        ] })
      ] }) })
    ] }) })
  ] });
}
export {
  LoginPage
};
