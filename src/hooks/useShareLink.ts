/**
 * Hooks do Portal do Cliente.
 *
 * - useShareLink: lista o link ativo (não revogado) de um orçamento (autenticado).
 * - useCreateShareLink: cria novo link (revoga o anterior automaticamente).
 * - useRevokeShareLink: revoga link existente.
 * - usePublicOrcamento: leitura pública via RPC (sem autenticação).
 * - useRespondPublicOrcamento: cliente aprova/rejeita.
 * - useCommentPublicOrcamento: cliente envia comentário.
 *
 * Geração de token: usa crypto.getRandomValues -> base64url (~43 chars).
 * RLS: leitura/escrita por empresa via tenant isolation.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ShareLink {
  id: string;
  orcamentoId: string;
  empresaId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  revokedAt: string | null;
  status: "ativo" | "expirado" | "revogado";
}

function computeStatus(row: { expires_at: string; revoked_at: string | null }): ShareLink["status"] {
  if (row.revoked_at) return "revogado";
  if (new Date(row.expires_at).getTime() < Date.now()) return "expirado";
  return "ativo";
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  // base64url
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Calcula expires_at a partir do orçamento (validade em dias do snapshot). */
function calcExpiresAt(validadeSnapshot: string | null | undefined): string {
  // validade é texto livre tipo "15 dias". Tentamos extrair número; default 15 dias.
  const m = (validadeSnapshot || "").match(/(\d+)/);
  const dias = m ? Math.max(1, Math.min(365, parseInt(m[1], 10))) : 15;
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString();
}

/** Lista link mais recente do orçamento. */
export function useShareLink(orcamentoId: string | null) {
  const { empresaId } = useAuth();
  return useQuery({
    queryKey: ["share-link", empresaId, orcamentoId],
    enabled: !!empresaId && !!orcamentoId,
    queryFn: async (): Promise<ShareLink | null> => {
      const { data, error } = await supabase
        .from("orcamento_share_links")
        .select("*")
        .eq("empresa_id", empresaId!)
        .eq("orcamento_id", orcamentoId!)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      const row = data?.[0];
      if (!row) return null;
      return {
        id: row.id,
        orcamentoId: row.orcamento_id,
        empresaId: row.empresa_id,
        token: row.token,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        revokedAt: row.revoked_at,
        status: computeStatus(row),
      };
    },
  });
}

export function useCreateShareLink() {
  const { user, empresaId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      orcamentoId: string;
      validadeSnapshot: string | null | undefined;
    }): Promise<ShareLink> => {
      if (!user || !empresaId) throw new Error("Usuário não autenticado");
      // 1) Revoga links ativos anteriores deste orçamento
      const { error: revokeErr } = await supabase
        .from("orcamento_share_links")
        .update({ revoked_at: new Date().toISOString() })
        .eq("empresa_id", empresaId)
        .eq("orcamento_id", input.orcamentoId)
        .is("revoked_at", null);
      if (revokeErr) throw revokeErr;

      // 2) Cria novo
      const token = generateToken();
      const expires_at = calcExpiresAt(input.validadeSnapshot);
      const { data, error } = await supabase
        .from("orcamento_share_links")
        .insert({
          orcamento_id: input.orcamentoId,
          empresa_id: empresaId,
          token,
          expires_at,
          created_by: user.id,
        })
        .select("*")
        .single();
      if (error) throw error;
      return {
        id: data.id,
        orcamentoId: data.orcamento_id,
        empresaId: data.empresa_id,
        token: data.token,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
        revokedAt: data.revoked_at,
        status: computeStatus(data),
      };
    },
    onSuccess: (_link, vars) => {
      qc.invalidateQueries({ queryKey: ["share-link", empresaId, vars.orcamentoId] });
    },
  });
}

export function useRevokeShareLink() {
  const { empresaId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; orcamentoId: string }) => {
      if (!empresaId) throw new Error("Sem empresa");
      const { error } = await supabase
        .from("orcamento_share_links")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", input.id)
        .eq("empresa_id", empresaId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["share-link", empresaId, vars.orcamentoId] });
    },
  });
}

// ─────────── Público (sem auth) ───────────

export interface PortalPayload {
  link_status: "ativo" | "expirado" | "revogado";
  expires_at: string;
  empresa: {
    nome_fantasia: string;
    razao_social: string | null;
    logo_url: string | null;
    cor_primaria: string | null;
    cor_destaque: string | null;
    slogan: string | null;
    telefone_whatsapp: string | null;
    email_contato: string | null;
    cidade: string | null;
    estado: string | null;
  };
  cliente: {
    nome_razao_social: string;
    documento: string | null;
    cidade: string | null;
  };
  orcamento: {
    id: string;
    numero_orcamento: number;
    status: "pendente" | "aprovado" | "rejeitado" | "executado" | "cancelado";
    data_criacao: string;
    data_execucao: string | null;
    data_cancelamento: string | null;
    descricao_geral: string | null;
    itens_servico: Array<Record<string, unknown>>;
    valor_venda: number;
    desconto: number;
    valor_final: number;
    validade_snapshot: string | null;
    formas_pagamento_snapshot: string | null;
    garantia_snapshot: string | null;
    tempo_garantia_snapshot: string | null;
    politica_nome_snapshot: string | null;
  };
}

export function usePublicOrcamento(token: string | undefined) {
  return useQuery({
    queryKey: ["public-orcamento", token],
    enabled: !!token,
    retry: false,
    queryFn: async (): Promise<PortalPayload> => {
      const { data, error } = await supabase.rpc("public_get_orcamento_by_token" as never, {
        _token: token,
      } as never);
      if (error) throw error;
      return data as unknown as PortalPayload;
    },
  });
}

export function useRespondPublicOrcamento(token: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { action: "aprovar" | "rejeitar"; comment?: string }) => {
      if (!token) throw new Error("Token ausente");
      const { data, error } = await supabase.rpc("public_respond_orcamento" as never, {
        _token: token,
        _action: input.action,
        _comment: input.comment || "",
      } as never);
      if (error) throw error;
      return data as { success: boolean; status: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["public-orcamento", token] });
    },
  });
}

export function useCommentPublicOrcamento(token: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { comment: string }) => {
      if (!token) throw new Error("Token ausente");
      const { data, error } = await supabase.rpc("public_comment_orcamento" as never, {
        _token: token,
        _comment: input.comment,
      } as never);
      if (error) throw error;
      return data as { success: boolean };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["public-orcamento", token] });
    },
  });
}
