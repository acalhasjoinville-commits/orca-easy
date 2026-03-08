import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'vendedor' | 'financeiro';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  rolesLoaded: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isVendedor: boolean;
  isFinanceiro: boolean;
  hasAnyRole: boolean;
  canManageSettings: boolean;
  canDeleteBudget: boolean;
  canViewFinanceiro: boolean;
  canCreateEditBudget: boolean;
  canManageClientes: boolean;
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

  const fetchRoles = useCallback(async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      if (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
      } else {
        setRoles((data || []).map((r: any) => r.role as AppRole));
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setRoles([]);
    } finally {
      setRolesLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Set up auth listener BEFORE checking existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          setRolesLoaded(false);
          setTimeout(() => fetchRoles(newSession.user.id), 0);
        } else {
          setRoles([]);
          setRolesLoaded(true);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchRoles(existingSession.user.id).then(() => setLoading(false));
      } else {
        setRolesLoaded(true);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchRoles]);

  const isAdmin = roles.includes('admin');
  const isVendedor = roles.includes('vendedor');
  const isFinanceiro = roles.includes('financeiro');
  const hasAnyRole = rolesLoaded && roles.length > 0;

  const value: AuthContextType = {
    user,
    session,
    loading,
    roles,
    isAdmin,
    isVendedor,
    isFinanceiro,
    hasAnyRole,
    // Permission helpers
    canManageSettings: isAdmin,
    canDeleteBudget: isAdmin,
    canViewFinanceiro: isAdmin || isFinanceiro,
    canCreateEditBudget: isAdmin || isVendedor,
    canManageClientes: isAdmin || isVendedor,
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
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
