// Hooks React Query para o módulo RufoLab.
// Persistência em Supabase com isolamento por empresa_id (RLS + check explícito).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type {
  CalcSnapshot,
  RufoLabPiece,
  RufoLabPieceInput,
  RufoLabProject,
  RufoLabProjectInput,
  RufoLabTemplate,
  RufoLabTemplateInput,
  Segmento,
  TipoPeca,
} from "@/lib/rufolab/types";

// ---------- Mappers (DB row -> domain) ----------

type ProjectRow = {
  id: string;
  empresa_id: string;
  nome: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
};

type PieceRow = {
  id: string;
  empresa_id: string;
  project_id: string;
  nome: string;
  tipo_peca: string;
  comprimento: number;
  quantidade: number;
  observacoes: string;
  segmentos: unknown;
  calc_snapshot: unknown;
  created_at: string;
  updated_at: string;
};

type TemplateRow = {
  id: string;
  empresa_id: string;
  nome: string;
  tipo_peca: string;
  segmentos: unknown;
  observacoes: string;
  created_at: string;
  updated_at: string;
};

function mapProject(row: ProjectRow): RufoLabProject {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    nome: row.nome,
    observacoes: row.observacoes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function asSegmentos(raw: unknown): Segmento[] {
  if (!Array.isArray(raw)) return [];
  return raw as Segmento[];
}

function asCalcSnapshot(raw: unknown): CalcSnapshot {
  if (raw && typeof raw === "object") return raw as CalcSnapshot;
  return {
    desenvolvimentoInicial: 0,
    area: 0,
    numeroDobras: 0,
    numeroSegmentos: 0,
    comprimento: 0,
    quantidade: 1,
    calculadoEm: new Date().toISOString(),
  };
}

function mapPiece(row: PieceRow): RufoLabPiece {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    projectId: row.project_id,
    nome: row.nome,
    tipoPeca: (row.tipo_peca as TipoPeca) ?? "reta",
    comprimento: Number(row.comprimento ?? 0),
    quantidade: Number(row.quantidade ?? 1),
    observacoes: row.observacoes ?? "",
    segmentos: asSegmentos(row.segmentos),
    calcSnapshot: asCalcSnapshot(row.calc_snapshot),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTemplate(row: TemplateRow): RufoLabTemplate {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    nome: row.nome,
    tipoPeca: (row.tipo_peca as TipoPeca) ?? "reta",
    segmentos: asSegmentos(row.segmentos),
    observacoes: row.observacoes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------- Query keys ----------

export const rufolabKeys = {
  projects: (empresaId: string | null | undefined) => ["rufolab", "projects", empresaId] as const,
  pieces: (empresaId: string | null | undefined, projectId: string | null | undefined) =>
    ["rufolab", "pieces", empresaId, projectId] as const,
  templates: (empresaId: string | null | undefined) => ["rufolab", "templates", empresaId] as const,
};

// ---------- Projects ----------

export function useRufoLabProjects() {
  const { empresaId } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: rufolabKeys.projects(empresaId),
    enabled: !!empresaId,
    queryFn: async (): Promise<RufoLabProject[]> => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from("rufolab_projects")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => mapProject(row as ProjectRow));
    },
  });

  const createProject = useMutation({
    mutationFn: async (input: RufoLabProjectInput): Promise<RufoLabProject> => {
      if (!empresaId) throw new Error("Empresa não identificada");
      const { data, error } = await supabase
        .from("rufolab_projects")
        .insert({
          empresa_id: empresaId,
          nome: input.nome.trim(),
          observacoes: input.observacoes ?? "",
        })
        .select("*")
        .single();
      if (error) throw error;
      return mapProject(data as ProjectRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rufolabKeys.projects(empresaId) });
    },
    onError: (err: unknown) => {
      toast({
        title: "Não foi possível criar a obra",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const updateProject = useMutation({
    mutationFn: async (params: { id: string; input: RufoLabProjectInput }): Promise<RufoLabProject> => {
      if (!empresaId) throw new Error("Empresa não identificada");
      const { data, error } = await supabase
        .from("rufolab_projects")
        .update({
          nome: params.input.nome.trim(),
          observacoes: params.input.observacoes ?? "",
        })
        .eq("id", params.id)
        .eq("empresa_id", empresaId)
        .select("*")
        .single();
      if (error) throw error;
      return mapProject(data as ProjectRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rufolabKeys.projects(empresaId) });
    },
    onError: (err: unknown) => {
      toast({
        title: "Não foi possível atualizar a obra",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!empresaId) throw new Error("Empresa não identificada");
      // Apaga peças primeiro (FK composta exige consistência de tenant).
      const { error: errPieces } = await supabase
        .from("rufolab_pieces")
        .delete()
        .eq("project_id", id)
        .eq("empresa_id", empresaId);
      if (errPieces) throw errPieces;

      const { error } = await supabase
        .from("rufolab_projects")
        .delete()
        .eq("id", id)
        .eq("empresa_id", empresaId);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: rufolabKeys.projects(empresaId) });
      queryClient.invalidateQueries({ queryKey: rufolabKeys.pieces(empresaId, id) });
    },
    onError: (err: unknown) => {
      toast({
        title: "Não foi possível remover a obra",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  return {
    projects: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createProject,
    updateProject,
    deleteProject,
  };
}

// ---------- Pieces ----------

export function useRufoLabPieces(projectId: string | null | undefined) {
  const { profile } = useAuth();
  const empresaId = profile?.empresaId ?? null;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: rufolabKeys.pieces(empresaId, projectId ?? null),
    enabled: !!empresaId && !!projectId,
    queryFn: async (): Promise<RufoLabPiece[]> => {
      if (!empresaId || !projectId) return [];
      const { data, error } = await supabase
        .from("rufolab_pieces")
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => mapPiece(row as PieceRow));
    },
  });

  const createPiece = useMutation({
    mutationFn: async (input: RufoLabPieceInput): Promise<RufoLabPiece> => {
      if (!empresaId) throw new Error("Empresa não identificada");
      const { data, error } = await supabase
        .from("rufolab_pieces")
        .insert({
          empresa_id: empresaId,
          project_id: input.projectId,
          nome: input.nome.trim(),
          tipo_peca: input.tipoPeca,
          comprimento: input.comprimento,
          quantidade: input.quantidade,
          observacoes: input.observacoes ?? "",
          segmentos: input.segmentos as unknown as never,
          calc_snapshot: input.calcSnapshot as unknown as never,
        })
        .select("*")
        .single();
      if (error) throw error;
      return mapPiece(data as PieceRow);
    },
    onSuccess: (piece) => {
      queryClient.invalidateQueries({ queryKey: rufolabKeys.pieces(empresaId, piece.projectId) });
    },
    onError: (err: unknown) => {
      toast({
        title: "Não foi possível criar a peça",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const updatePiece = useMutation({
    mutationFn: async (params: { id: string; input: RufoLabPieceInput }): Promise<RufoLabPiece> => {
      if (!empresaId) throw new Error("Empresa não identificada");
      const { data, error } = await supabase
        .from("rufolab_pieces")
        .update({
          nome: params.input.nome.trim(),
          tipo_peca: params.input.tipoPeca,
          comprimento: params.input.comprimento,
          quantidade: params.input.quantidade,
          observacoes: params.input.observacoes ?? "",
          segmentos: params.input.segmentos as unknown as never,
          calc_snapshot: params.input.calcSnapshot as unknown as never,
        })
        .eq("id", params.id)
        .eq("empresa_id", empresaId)
        .select("*")
        .single();
      if (error) throw error;
      return mapPiece(data as PieceRow);
    },
    onSuccess: (piece) => {
      queryClient.invalidateQueries({ queryKey: rufolabKeys.pieces(empresaId, piece.projectId) });
    },
    onError: (err: unknown) => {
      toast({
        title: "Não foi possível atualizar a peça",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const deletePiece = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!empresaId) throw new Error("Empresa não identificada");
      const { error } = await supabase
        .from("rufolab_pieces")
        .delete()
        .eq("id", id)
        .eq("empresa_id", empresaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rufolabKeys.pieces(empresaId, projectId ?? null) });
    },
    onError: (err: unknown) => {
      toast({
        title: "Não foi possível remover a peça",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  return {
    pieces: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createPiece,
    updatePiece,
    deletePiece,
  };
}

// ---------- Templates ----------

export function useRufoLabTemplates() {
  const { profile } = useAuth();
  const empresaId = profile?.empresaId ?? null;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: rufolabKeys.templates(empresaId),
    enabled: !!empresaId,
    queryFn: async (): Promise<RufoLabTemplate[]> => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from("rufolab_templates")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("nome", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => mapTemplate(row as TemplateRow));
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (input: RufoLabTemplateInput): Promise<RufoLabTemplate> => {
      if (!empresaId) throw new Error("Empresa não identificada");
      const { data, error } = await supabase
        .from("rufolab_templates")
        .insert({
          empresa_id: empresaId,
          nome: input.nome.trim(),
          tipo_peca: input.tipoPeca,
          segmentos: input.segmentos as unknown as never,
          observacoes: input.observacoes ?? "",
        })
        .select("*")
        .single();
      if (error) throw error;
      return mapTemplate(data as TemplateRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rufolabKeys.templates(empresaId) });
    },
    onError: (err: unknown) => {
      toast({
        title: "Não foi possível salvar o template",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async (params: { id: string; input: RufoLabTemplateInput }): Promise<RufoLabTemplate> => {
      if (!empresaId) throw new Error("Empresa não identificada");
      const { data, error } = await supabase
        .from("rufolab_templates")
        .update({
          nome: params.input.nome.trim(),
          tipo_peca: params.input.tipoPeca,
          segmentos: params.input.segmentos as unknown as never,
          observacoes: params.input.observacoes ?? "",
        })
        .eq("id", params.id)
        .eq("empresa_id", empresaId)
        .select("*")
        .single();
      if (error) throw error;
      return mapTemplate(data as TemplateRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rufolabKeys.templates(empresaId) });
    },
    onError: (err: unknown) => {
      toast({
        title: "Não foi possível atualizar o template",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!empresaId) throw new Error("Empresa não identificada");
      const { error } = await supabase
        .from("rufolab_templates")
        .delete()
        .eq("id", id)
        .eq("empresa_id", empresaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rufolabKeys.templates(empresaId) });
    },
    onError: (err: unknown) => {
      toast({
        title: "Não foi possível remover o template",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const templatesOrdenados = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [query.data],
  );

  return {
    templates: templatesOrdenados,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
