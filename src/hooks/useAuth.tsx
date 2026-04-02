import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'vendedor' | 'financeiro';
export type EmpresaStatus = 'ativa' | 'suspensa' | 'bloqueada';

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
  canCreateEditBudget: boolean;
  canManageClientes: boolean;
  canManageUsers: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaStatus, setEmpresaStatus] = useState<EmpresaStatus | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const fetchRolesAndEmpresa = useCallback(async (userId: string) => {
    try {
      // Fetch roles
      const { data: rolesData, error: rolesErr } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      if (rolesErr) {
        console.error('Error fetching roles:', rolesErr);
        setRoles([]);
      } else {
        setRoles((rolesData || []).map((r: any) => r.role as AppRole));
      }

      // Fetch empresa_id from profile
      const { data: profile, error: profileErr } = await (supabase as any)
        .from('profiles')
        .select('empresa_id')
        .eq('id', userId)
        .maybeSingle();
      if (profileErr) {
        console.error('Error fetching profile:', profileErr);
        setEmpresaId(null);
      } else {
        setEmpresaId(profile?.empresa_id || null);
      }

      // Fetch isSuperAdmin via RPC
      const { data: saData, error: saErr } = await supabase.rpc('is_platform_admin' as any, { _user_id: userId });
      if (saErr) {
        console.error('Error checking platform admin:', saErr);
        setIsSuperAdmin(false);
      } else {
        setIsSuperAdmin(!!saData);
      }

      // Fetch empresa status via RPC
      const { data: statusData, error: statusErr } = await supabase.rpc('get_empresa_status' as any, { _user_id: userId });
      if (statusErr) {
        console.error('Error fetching empresa status:', statusErr);
        setEmpresaStatus(null);
      } else {
        setEmpresaStatus((statusData as EmpresaStatus) || null);
      }
    } catch (err) {
      console.error('Error fetching roles/empresa:', err);
      setRoles([]);
      setEmpresaId(null);
      setIsSuperAdmin(false);
      setEmpresaStatus(null);
    } finally {
      setRolesLoaded(true);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          setRolesLoaded(false);
          setTimeout(() => fetchRolesAndEmpresa(newSession.user.id), 0);
        } else {
          setRoles([]);
          setEmpresaId(null);
          setIsSuperAdmin(false);
          setEmpresaStatus(null);
          setRolesLoaded(true);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchRolesAndEmpresa(existingSession.user.id).then(() => setLoading(false));
      } else {
        setRolesLoaded(true);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchRolesAndEmpresa]);

  const isAdmin = roles.includes('admin');
  const isVendedor = roles.includes('vendedor');
  const isFinanceiro = roles.includes('financeiro');
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
    canCreateEditBudget: isAdmin || isVendedor,
    canManageClientes: isAdmin || isVendedor,
    canManageUsers: isAdmin,
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
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
