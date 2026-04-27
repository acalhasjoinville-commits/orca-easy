import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AuthError, User, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "vendedor" | "financeiro";
export type EmpresaStatus = "ativa" | "suspensa" | "bloqueada";

const APP_ROLES: AppRole[] = ["admin", "vendedor", "financeiro"];
const EMPRESA_STATUSES: EmpresaStatus[] = ["ativa", "suspensa", "bloqueada"];
const AUTH_BOOTSTRAP_STORAGE_KEY = "orcacalhas:auth-bootstrap:v1";

type UserRoleRow = Pick<Tables<"user_roles">, "role">;

function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}

function isEmpresaStatus(value: string | null): value is EmpresaStatus {
  return value !== null && EMPRESA_STATUSES.includes(value as EmpresaStatus);
}

interface CachedAuthState {
  session: Session;
  roles: AppRole[];
  rolesLoaded: boolean;
  empresaId: string | null;
  empresaStatus: EmpresaStatus | null;
  isSuperAdmin: boolean;
}

function readCachedAuthState(): CachedAuthState | null {
  try {
    const raw = sessionStorage.getItem(AUTH_BOOTSTRAP_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CachedAuthState>;
    const cachedSession = parsed.session;

    if (!cachedSession?.user?.id) return null;

    return {
      session: cachedSession,
      roles: Array.isArray(parsed.roles) ? parsed.roles.filter(isAppRole) : [],
      rolesLoaded: parsed.rolesLoaded === true,
      empresaId: typeof parsed.empresaId === "string" ? parsed.empresaId : null,
      empresaStatus: isEmpresaStatus(parsed.empresaStatus ?? null) ? (parsed.empresaStatus ?? null) : null,
      isSuperAdmin: parsed.isSuperAdmin === true,
    };
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  rolesLoaded: boolean;
  roles: AppRole[];
  empresaId: string | null;
  empresaStatus: EmpresaStatus | null;
  isAdmin: boolean;
  isVendedor: boolean;
  isFinanceiro: boolean;
  isSuperAdmin: boolean;
  hasAnyRole: boolean;
  canManageSettings: boolean;
  canDeleteBudget: boolean;
  canViewFinanceiro: boolean;
  canManageAgenda: boolean;
  canCreateEditBudget: boolean;
  canManageClientes: boolean;
  canManageUsers: boolean;
  canManageRufoLab: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const cachedAuthState = readCachedAuthState();
  const [user, setUser] = useState<User | null>(cachedAuthState?.session.user ?? null);
  const [session, setSession] = useState<Session | null>(cachedAuthState?.session ?? null);
  const [loading, setLoading] = useState(cachedAuthState ? false : true);
  const [roles, setRoles] = useState<AppRole[]>(cachedAuthState?.roles ?? []);
  const [rolesLoaded, setRolesLoaded] = useState(cachedAuthState?.rolesLoaded ?? false);
  const [empresaId, setEmpresaId] = useState<string | null>(cachedAuthState?.empresaId ?? null);
  const [empresaStatus, setEmpresaStatus] = useState<EmpresaStatus | null>(cachedAuthState?.empresaStatus ?? null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(cachedAuthState?.isSuperAdmin ?? false);
  const currentUserIdRef = useRef<string | null>(cachedAuthState?.session.user.id ?? null);

  const fetchRolesAndEmpresa = useCallback(async (userId: string, resetBeforeFetch = true) => {
    if (resetBeforeFetch) {
      setRolesLoaded(false);
    }

    try {
      const { data: rolesData, error: rolesErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesErr) {
        console.error("Error fetching roles:", rolesErr);
        setRoles([]);
      } else {
        const nextRoles = (rolesData ?? []).map((roleRow: UserRoleRow) => roleRow.role).filter(isAppRole);
        setRoles(nextRoles);
      }

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("empresa_id")
        .eq("id", userId)
        .maybeSingle();

      if (profileErr) {
        console.error("Error fetching profile:", profileErr);
        setEmpresaId(null);
      } else {
        setEmpresaId(profile?.empresa_id ?? null);
      }

      const { data: saData, error: saErr } = await supabase.rpc("is_platform_admin", { _user_id: userId });
      if (saErr) {
        console.error("Error checking platform admin:", saErr);
        setIsSuperAdmin(false);
      } else {
        setIsSuperAdmin(Boolean(saData));
      }

      const { data: statusData, error: statusErr } = await supabase.rpc("get_empresa_status", { _user_id: userId });
      if (statusErr) {
        console.error("Error fetching empresa status:", statusErr);
        setEmpresaStatus(null);
      } else {
        setEmpresaStatus(isEmpresaStatus(statusData) ? statusData : null);
      }
    } catch (err) {
      console.error("Error fetching roles/empresa:", err);
      setRoles([]);
      setEmpresaId(null);
      setIsSuperAdmin(false);
      setEmpresaStatus(null);
    } finally {
      setRolesLoaded(true);
    }
  }, []);

  useEffect(() => {
    try {
      if (!session?.user) {
        sessionStorage.removeItem(AUTH_BOOTSTRAP_STORAGE_KEY);
        return;
      }

      const state: CachedAuthState = {
        session,
        roles,
        rolesLoaded,
        empresaId,
        empresaStatus,
        isSuperAdmin,
      };

      sessionStorage.setItem(AUTH_BOOTSTRAP_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [session, roles, rolesLoaded, empresaId, empresaStatus, isSuperAdmin]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      if (newSession?.user) {
        const isSameUser = currentUserIdRef.current === newSession.user.id;
        currentUserIdRef.current = newSession.user.id;

        if (!isSameUser) {
          setRoles([]);
          setEmpresaId(null);
          setIsSuperAdmin(false);
          setEmpresaStatus(null);
        }

        setTimeout(() => fetchRolesAndEmpresa(newSession.user.id, !isSameUser), 0);
      } else {
        currentUserIdRef.current = null;
        setRoles([]);
        setEmpresaId(null);
        setIsSuperAdmin(false);
        setEmpresaStatus(null);
        setRolesLoaded(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);

      if (existingSession?.user) {
        const isSameUser = currentUserIdRef.current === existingSession.user.id;
        currentUserIdRef.current = existingSession.user.id;
        fetchRolesAndEmpresa(existingSession.user.id, !isSameUser);
      } else {
        currentUserIdRef.current = null;
        setRolesLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchRolesAndEmpresa]);

  const isAdmin = roles.includes("admin");
  const isVendedor = roles.includes("vendedor");
  const isFinanceiro = roles.includes("financeiro");
  const hasAnyRole = rolesLoaded && roles.length > 0;

  const value: AuthContextType = {
    user,
    session,
    loading,
    rolesLoaded,
    roles,
    empresaId,
    empresaStatus,
    isAdmin,
    isVendedor,
    isFinanceiro,
    isSuperAdmin,
    hasAnyRole,
    canManageSettings: isAdmin,
    canDeleteBudget: isAdmin,
    canViewFinanceiro: isAdmin || isFinanceiro,
    canManageAgenda: isAdmin || isVendedor,
    canCreateEditBudget: isAdmin || isVendedor,
    canManageClientes: isAdmin || isVendedor,
    canManageUsers: isAdmin,
    canManageRufoLab: isAdmin || isVendedor,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    },
    signUp: async (email, password, fullName) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      return { error };
    },
    signOut: async () => {
      await supabase.auth.signOut();
      setRoles([]);
      setEmpresaId(null);
      setIsSuperAdmin(false);
      setEmpresaStatus(null);
      setRolesLoaded(true);
      currentUserIdRef.current = null;
      try {
        sessionStorage.removeItem(AUTH_BOOTSTRAP_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
