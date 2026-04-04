import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { c as createLucideIcon, u as useAuth, s as supabase, n as Sheet, o as SheetContent, p as SheetHeader, q as SheetTitle, I as Input, B as Button, e as LoaderCircle, k as Separator, d as ue } from "./index-BN5a_yey.js";
import { L as Label } from "./label-BChNKNza.js";
import { u as useQueryClient, a as useQuery } from "./query-vendor-BLvK6anV.js";
import { U as User } from "./user-A1J5wkwB.js";
import "./charts-vendor-BrW5ULH7.js";
import "./radix-vendor-CEzLCFk2.js";
import "./pdf-vendor-Dv6cUxDn.js";
import "./router-vendor-CCo6OTFM.js";
import "./supabase-vendor-BsjcsmU5.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Lock = createLucideIcon("Lock", [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
]);
function EditarPerfil({ open, onOpenChange }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["my-profile", user == null ? void 0 : user.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
  const [fullName, setFullName] = reactExports.useState("");
  const [nameLoaded, setNameLoaded] = reactExports.useState(false);
  const [savingName, setSavingName] = reactExports.useState(false);
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [savingPassword, setSavingPassword] = reactExports.useState(false);
  if (profile && !nameLoaded) {
    setFullName(profile.full_name || "");
    setNameLoaded(true);
  }
  const handleOpenChange = (v) => {
    if (!v) {
      setNameLoaded(false);
      setNewPassword("");
      setConfirmPassword("");
    }
    onOpenChange(v);
  };
  const handleSaveName = async () => {
    if (!user) return;
    setSavingName(true);
    try {
      const { error } = await supabase.from("profiles").update({ full_name: fullName.trim() }).eq("id", user.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      ue.success("Nome atualizado!");
    } catch {
      ue.error("Erro ao salvar nome.");
    } finally {
      setSavingName(false);
    }
  };
  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      ue.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      ue.error("As senhas não coincidem.");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      ue.success("Senha alterada com sucesso!");
    } catch {
      ue.error("Erro ao alterar senha.");
    } finally {
      setSavingPassword(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "sm:max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5" }),
      "Meu Perfil"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "profile-name", className: "text-sm font-medium", children: "Nome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "profile-name",
            value: fullName,
            onChange: (e) => setFullName(e.target.value),
            placeholder: "Seu nome completo"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "E-mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: (profile == null ? void 0 : profile.email) || (user == null ? void 0 : user.email) || "", disabled: true, className: "bg-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSaveName, disabled: savingName, size: "sm", children: [
          savingName && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }),
          "Salvar Nome"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Alterar Senha" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "password",
            placeholder: "Nova senha",
            value: newPassword,
            onChange: (e) => setNewPassword(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "password",
            placeholder: "Confirmar nova senha",
            value: confirmPassword,
            onChange: (e) => setConfirmPassword(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleChangePassword, disabled: savingPassword || !newPassword, size: "sm", children: [
          savingPassword && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }),
          "Alterar Senha"
        ] })
      ] })
    ] })
  ] }) });
}
export {
  EditarPerfil
};
