import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { u as useQueryClient, a as useQuery, b as useMutation } from "./query-vendor-BLvK6anV.js";
import { c as createLucideIcon, u as useAuth, e as LoaderCircle, U as Users, I as Input, B as Button, X, P as Plus, a as cn, s as supabase, d as ue } from "./index-BN5a_yey.js";
import { C as Card, a as CardContent } from "./card-B4K8qJaR.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, B as Badge } from "./select-DQUVPZUM.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, E as EllipsisVertical, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-Cw3zSzm8.js";
import { M as Mail } from "./mail-Q0ipnaDG.js";
import { S as Search } from "./search-CUbuJP2V.js";
import { S as ShieldCheck } from "./shield-check-cwQSkSPa.js";
import { S as ShieldAlert } from "./shield-alert-CxohshIv.js";
import { U as UserPlus } from "./user-plus-CKnt5lBi.js";
import "./charts-vendor-BrW5ULH7.js";
import "./radix-vendor-CEzLCFk2.js";
import "./pdf-vendor-Dv6cUxDn.js";
import "./router-vendor-CCo6OTFM.js";
import "./supabase-vendor-BsjcsmU5.js";
import "./check-D0l1wUju.js";
import "./chevron-right-DibYopn_.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Send = createLucideIcon("Send", [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
]);
const ROLE_LABELS = {
  admin: "Administrador",
  vendedor: "Vendedor",
  financeiro: "Financeiro"
};
const ROLE_HELPERS = {
  admin: "Gerencia usuários, permissões e configurações.",
  vendedor: "Acessa clientes e orçamentos.",
  financeiro: "Acompanha e registra movimentações financeiras."
};
const ROLE_COLORS = {
  admin: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  vendedor: "bg-primary/10 text-primary border-primary/20",
  financeiro: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
};
const ROLE_OPTIONS = ["admin", "vendedor", "financeiro"];
function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string") return message;
  }
  return null;
}
function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR");
}
function getInitials(name, email) {
  const base = name.trim() || email.trim();
  const parts = base.split(" ").filter(Boolean);
  if (parts.length === 0) return "US";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
function Usuarios() {
  const { empresaId, user } = useAuth();
  const qc = useQueryClient();
  const [inviteEmail, setInviteEmail] = reactExports.useState("");
  const [inviteRole, setInviteRole] = reactExports.useState("vendedor");
  const [approvalRoles, setApprovalRoles] = reactExports.useState({});
  const [search, setSearch] = reactExports.useState("");
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["empresa-users", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data: profilesRaw, error: profileError } = await supabase.from("profiles").select("id, full_name, email, empresa_id").eq("empresa_id", empresaId);
      if (profileError) throw profileError;
      const { data: rolesRaw, error: rolesError } = await supabase.from("user_roles").select("user_id, role").eq("empresa_id", empresaId);
      if (rolesError) throw rolesError;
      const profiles = profilesRaw ?? [];
      const roles = rolesRaw ?? [];
      const roleMap = /* @__PURE__ */ new Map();
      roles.forEach((roleRow) => {
        const existing = roleMap.get(roleRow.user_id) || [];
        existing.push(roleRow.role);
        roleMap.set(roleRow.user_id, existing);
      });
      return profiles.map(
        (profile) => ({
          id: profile.id,
          fullName: profile.full_name || "",
          email: profile.email || "—",
          roles: roleMap.get(profile.id) || []
        })
      );
    },
    enabled: !!empresaId
  });
  const { data: invites = [] } = useQuery({
    queryKey: ["invites", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase.from("invites").select("id, email, role, created_at, used_at").eq("empresa_id", empresaId).is("used_at", null).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!empresaId
  });
  const addRole = useMutation({
    mutationFn: async ({ userId, role }) => {
      if (!empresaId) throw new Error("Sem empresa vinculada.");
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role,
        empresa_id: empresaId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["empresa-users", empresaId] });
      ue.success("Acesso atualizado!", { duration: 2500 });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      if (message == null ? void 0 : message.includes("duplicate")) ue.error("Este usuário já possui esse acesso.", { duration: 5e3 });
      else ue.error(message || "Erro ao adicionar acesso.", { duration: 5e3 });
    }
  });
  const removeRole = useMutation({
    mutationFn: async ({ userId, role }) => {
      var _a;
      if (!empresaId) throw new Error("Sem empresa vinculada.");
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role).eq("empresa_id", empresaId);
      if (error) {
        if ((_a = error.message) == null ? void 0 : _a.includes("último administrador")) {
          throw new Error("Não é possível remover o último administrador da empresa.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["empresa-users", empresaId] });
      ue.success("Acesso removido.", { duration: 2500 });
    },
    onError: (error) => {
      ue.error(getErrorMessage(error) || "Erro ao remover acesso.", { duration: 5e3 });
    }
  });
  const createInvite = useMutation({
    mutationFn: async ({ email, role }) => {
      var _a;
      if (!empresaId || !user) throw new Error("Sem empresa vinculada.");
      const { error } = await supabase.from("invites").insert({
        empresa_id: empresaId,
        email: email.toLowerCase().trim(),
        role,
        invited_by: user.id
      });
      if (error) {
        if (((_a = error.message) == null ? void 0 : _a.includes("duplicate")) || error.code === "23505") {
          throw new Error("Já existe um convite pendente para este e-mail.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invites", empresaId] });
      setInviteEmail("");
      ue.success("Convite criado!", { duration: 4e3 });
    },
    onError: (error) => {
      ue.error(getErrorMessage(error) || "Erro ao criar convite.", { duration: 5e3 });
    }
  });
  const revokeInvite = useMutation({
    mutationFn: async (inviteId) => {
      const { error } = await supabase.from("invites").delete().eq("id", inviteId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invites", empresaId] });
      ue.success("Convite revogado.", { duration: 2500 });
    },
    onError: () => {
      ue.error("Erro ao revogar convite.", { duration: 5e3 });
    }
  });
  const handleSendInvite = () => {
    const email = inviteEmail.trim();
    if (!email || !email.includes("@")) {
      ue.error("Informe um e-mail válido.", { duration: 4e3 });
      return;
    }
    createInvite.mutate({ email, role: inviteRole });
  };
  const getAvailableRoles = (roles) => ROLE_OPTIONS.filter((role) => !roles.includes(role));
  const searchQuery = normalize(search.trim());
  const filteredUsers = reactExports.useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(
      (profile) => normalize(profile.fullName).includes(searchQuery) || normalize(profile.email).includes(searchQuery)
    );
  }, [searchQuery, users]);
  const filteredInvites = reactExports.useMemo(() => {
    if (!searchQuery) return invites;
    return invites.filter(
      (invite) => normalize(invite.email).includes(searchQuery) || normalize(ROLE_LABELS[invite.role]).includes(searchQuery)
    );
  }, [invites, searchQuery]);
  const usersWithRoles = filteredUsers.filter((profile) => profile.roles.length > 0);
  const usersPending = filteredUsers.filter((profile) => profile.roles.length === 0);
  const hasAnyResult = filteredUsers.length > 0 || filteredInvites.length > 0;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 lg:px-6 pb-24 lg:pb-8 pt-4 space-y-6 max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-foreground", children: "Usuários" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Convide, aprove e organize os acessos da equipe." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Como funcionam os acessos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cada papel libera partes diferentes do sistema. Você pode convidar alguém por e-mail, aprovar quem já entrou na empresa e ajustar acessos sem mexer no restante da conta." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ROLE_OPTIONS.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-background/80 px-2.5 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground", children: ROLE_LABELS[role] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: ROLE_HELPERS[role] })
        ] }, role)) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Usuários ativos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-foreground mt-2", children: users.filter((profile) => profile.roles.length > 0).length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Membros com acesso liberado ao sistema." })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Aguardando aprovação" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-foreground mt-2", children: users.filter((profile) => profile.roles.length === 0).length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Pessoas que já entraram, mas ainda sem papel definido." })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Convites pendentes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-foreground mt-2", children: invites.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Convites enviados e ainda não utilizados." })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Convidar alguém para a equipe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "O convite fica vinculado ao e-mail informado. Quando a pessoa entrar com esse e-mail, o sistema já saberá qual acesso liberar." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-[1fr_180px_auto]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "email@empresa.com",
            value: inviteEmail,
            onChange: (event) => setInviteEmail(event.target.value),
            className: "h-10",
            type: "email"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inviteRole, onValueChange: (value) => setInviteRole(value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ROLE_OPTIONS.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: role, children: ROLE_LABELS[role] }, role)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSendInvite, disabled: createInvite.isPending, className: "h-10 gap-2", children: createInvite.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          "Enviando..."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
          "Criar convite"
        ] }) })
      ] }),
      filteredInvites.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Convites pendentes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Revogue apenas se o convite não for mais necessário." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filteredInvites.map((invite) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate", children: invite.email }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                  ROLE_LABELS[invite.role],
                  " · Enviado em ",
                  formatDate(invite.created_at)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-8 gap-1.5 text-destructive hover:text-destructive",
                  onClick: () => revokeInvite.mutate(invite.id),
                  disabled: revokeInvite.isPending,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Revogar" })
                  ]
                }
              )
            ]
          },
          invite.id
        )) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: search,
          onChange: (event) => setSearch(event.target.value),
          placeholder: "Buscar por nome, e-mail ou papel...",
          className: "h-10 pl-9"
        }
      )
    ] }) }) }),
    !hasAnyResult && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-10 w-10 text-muted-foreground/20 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Nenhum resultado encontrado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Ajuste a busca ou limpe o filtro para visualizar usuários e convites." })
    ] }) }),
    hasAnyResult && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Usuários ativos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: usersWithRoles.length })
        ] }),
        usersWithRoles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-10 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-8 w-8 text-muted-foreground/20 mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Nenhum usuário ativo nesta busca" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Quando um usuário receber um papel, ele aparecerá aqui." })
        ] }) }) : usersWithRoles.map((profile) => {
          const availableRoles = getAvailableRoles(profile.roles);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary", children: getInitials(profile.fullName, profile.email) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: profile.fullName || "Sem nome" }),
                    profile.id === (user == null ? void 0 : user.id) && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: "Você" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate mt-1", children: profile.email }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-2", children: "Use o menu para adicionar ou remover acessos deste usuário." })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "h-4 w-4" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-56", children: [
                  availableRoles.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    DropdownMenuItem,
                    {
                      onClick: () => addRole.mutate({ userId: profile.id, role }),
                      className: "text-xs gap-2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
                        "Adicionar ",
                        ROLE_LABELS[role]
                      ]
                    },
                    `add-${profile.id}-${role}`
                  )),
                  profile.roles.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    DropdownMenuItem,
                    {
                      onClick: () => removeRole.mutate({ userId: profile.id, role }),
                      className: "text-xs gap-2 text-destructive focus:text-destructive",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
                        "Remover ",
                        ROLE_LABELS[role]
                      ]
                    },
                    `remove-${profile.id}-${role}`
                  ))
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-4", children: profile.roles.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: cn("text-[10px] px-2 py-1", ROLE_COLORS[role]),
                children: ROLE_LABELS[role]
              },
              role
            )) })
          ] }) }, profile.id);
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 text-amber-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Aguardando aprovação" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: usersPending.length })
        ] }),
        usersPending.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-10 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-8 w-8 text-muted-foreground/20 mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Nenhum usuário aguardando aprovação" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Quando alguém entrar sem papel definido, aparecerá aqui para você liberar o acesso." })
        ] }) }) : usersPending.map((profile) => {
          const selectedApprovalRole = approvalRoles[profile.id] || "vendedor";
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed border-amber-500/30 bg-amber-500/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: profile.fullName || "Sem nome" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate mt-1", children: profile.email }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-2", children: "Esta pessoa já pertence à empresa, mas ainda não consegue usar o sistema porque não tem papel definido." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-2 sm:items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: selectedApprovalRole,
                  onValueChange: (value) => setApprovalRoles((current) => ({ ...current, [profile.id]: value })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-full sm:w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ROLE_OPTIONS.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: role, children: ROLE_LABELS[role] }, role)) })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  className: "h-9 gap-2",
                  onClick: () => addRole.mutate({ userId: profile.id, role: selectedApprovalRole }),
                  disabled: addRole.isPending,
                  children: [
                    addRole.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
                    "Aprovar acesso"
                  ]
                }
              )
            ] })
          ] }) }) }, profile.id);
        })
      ] })
    ] })
  ] });
}
export {
  Usuarios
};
