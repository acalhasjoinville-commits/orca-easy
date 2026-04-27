-- ============================================================
-- RufoLab — Fase 1: tabelas, RLS, triggers e índices
-- ============================================================

-- 1) Obras / projetos
CREATE TABLE public.rufolab_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
  nome text NOT NULL,
  observacoes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Necessário para servir de alvo da FK composta de pieces
ALTER TABLE public.rufolab_projects
  ADD CONSTRAINT rufolab_projects_id_empresa_unique UNIQUE (id, empresa_id);

-- 2) Peças (filhas de uma obra) com FK composta tenant-safe
CREATE TABLE public.rufolab_pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
  project_id uuid NOT NULL,
  nome text NOT NULL,
  tipo_peca text NOT NULL DEFAULT 'reta',
  comprimento numeric NOT NULL DEFAULT 0,
  quantidade integer NOT NULL DEFAULT 1,
  observacoes text NOT NULL DEFAULT '',
  segmentos jsonb NOT NULL DEFAULT '[]'::jsonb,
  calc_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rufolab_pieces_project_tenant_fk
    FOREIGN KEY (project_id, empresa_id)
    REFERENCES public.rufolab_projects (id, empresa_id)
    ON DELETE CASCADE
);

-- 3) Templates de peças por empresa
CREATE TABLE public.rufolab_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo_peca text NOT NULL DEFAULT 'reta',
  segmentos jsonb NOT NULL DEFAULT '[]'::jsonb,
  observacoes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Validações de domínio (tipo_peca, quantidade, comprimento)
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_rufolab_piece()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.tipo_peca NOT IN ('reta', 'conica') THEN
    RAISE EXCEPTION 'tipo_peca inválido: %', NEW.tipo_peca;
  END IF;
  IF btrim(NEW.nome) = '' THEN
    RAISE EXCEPTION 'nome da peça não pode ser vazio';
  END IF;
  IF NEW.quantidade IS NULL OR NEW.quantidade < 1 THEN
    RAISE EXCEPTION 'quantidade deve ser >= 1';
  END IF;
  IF NEW.comprimento IS NULL OR NEW.comprimento < 0 THEN
    RAISE EXCEPTION 'comprimento não pode ser negativo';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_rufolab_project()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF btrim(NEW.nome) = '' THEN
    RAISE EXCEPTION 'nome da obra não pode ser vazio';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_rufolab_template()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.tipo_peca NOT IN ('reta', 'conica') THEN
    RAISE EXCEPTION 'tipo_peca inválido: %', NEW.tipo_peca;
  END IF;
  IF btrim(NEW.nome) = '' THEN
    RAISE EXCEPTION 'nome do template não pode ser vazio';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_rufolab_projects_validate
  BEFORE INSERT OR UPDATE ON public.rufolab_projects
  FOR EACH ROW EXECUTE FUNCTION public.validate_rufolab_project();

CREATE TRIGGER trg_rufolab_pieces_validate
  BEFORE INSERT OR UPDATE ON public.rufolab_pieces
  FOR EACH ROW EXECUTE FUNCTION public.validate_rufolab_piece();

CREATE TRIGGER trg_rufolab_templates_validate
  BEFORE INSERT OR UPDATE ON public.rufolab_templates
  FOR EACH ROW EXECUTE FUNCTION public.validate_rufolab_template();

-- ============================================================
-- Triggers de updated_at (reusa função existente)
-- ============================================================
CREATE TRIGGER trg_rufolab_projects_updated
  BEFORE UPDATE ON public.rufolab_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_rufolab_pieces_updated
  BEFORE UPDATE ON public.rufolab_pieces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_rufolab_templates_updated
  BEFORE UPDATE ON public.rufolab_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RLS — isolamento por empresa
-- ============================================================
ALTER TABLE public.rufolab_projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rufolab_pieces    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rufolab_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation"
  ON public.rufolab_projects
  FOR ALL
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Tenant isolation"
  ON public.rufolab_pieces
  FOR ALL
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Tenant isolation"
  ON public.rufolab_templates
  FOR ALL
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

-- ============================================================
-- Índices
-- ============================================================
CREATE INDEX idx_rufolab_projects_empresa  ON public.rufolab_projects(empresa_id);
CREATE INDEX idx_rufolab_pieces_empresa    ON public.rufolab_pieces(empresa_id);
CREATE INDEX idx_rufolab_pieces_project    ON public.rufolab_pieces(project_id);
CREATE INDEX idx_rufolab_templates_empresa ON public.rufolab_templates(empresa_id);