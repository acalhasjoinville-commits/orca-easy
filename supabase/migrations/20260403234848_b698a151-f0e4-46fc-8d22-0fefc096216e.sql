
-- =============================================
-- 1. Tabela orcamento_followups
-- =============================================
CREATE TABLE public.orcamento_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id uuid NOT NULL UNIQUE REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
  status_followup text NOT NULL DEFAULT 'sem_retorno',
  proxima_acao text NOT NULL DEFAULT '',
  data_retorno date,
  responsavel_id uuid,
  responsavel_nome text NOT NULL DEFAULT '',
  ultima_interacao_em timestamptz,
  observacoes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orcamento_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.orcamento_followups
  FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- =============================================
-- 2. Tabela orcamento_followup_logs
-- =============================================
CREATE TABLE public.orcamento_followup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id uuid NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  tipo text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orcamento_followup_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.orcamento_followup_logs
  FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- =============================================
-- 3. Índices para fila comercial
-- =============================================
CREATE INDEX idx_followups_fila ON public.orcamento_followups (empresa_id, status_followup, data_retorno);
CREATE INDEX idx_followups_orcamento ON public.orcamento_followups (orcamento_id);
CREATE INDEX idx_followup_logs_timeline ON public.orcamento_followup_logs (orcamento_id, created_at DESC);

-- =============================================
-- 4. Trigger: updated_at automático
-- =============================================
CREATE TRIGGER update_orcamento_followups_updated_at
  BEFORE UPDATE ON public.orcamento_followups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 5. Trigger: validar empresa_id consistente com orçamento
-- =============================================
CREATE OR REPLACE FUNCTION public.validate_followup_empresa_id()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
DECLARE
  v_orc_empresa uuid;
BEGIN
  SELECT empresa_id INTO v_orc_empresa FROM public.orcamentos WHERE id = NEW.orcamento_id;
  IF v_orc_empresa IS NULL THEN
    RAISE EXCEPTION 'Orçamento não encontrado: %', NEW.orcamento_id;
  END IF;
  IF NEW.empresa_id != v_orc_empresa THEN
    RAISE EXCEPTION 'empresa_id do follow-up (%) não corresponde ao orçamento (%)', NEW.empresa_id, v_orc_empresa;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_followup_empresa
  BEFORE INSERT OR UPDATE ON public.orcamento_followups
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_followup_empresa_id();

CREATE OR REPLACE FUNCTION public.validate_followup_log_empresa_id()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
DECLARE
  v_orc_empresa uuid;
BEGIN
  SELECT empresa_id INTO v_orc_empresa FROM public.orcamentos WHERE id = NEW.orcamento_id;
  IF v_orc_empresa IS NULL THEN
    RAISE EXCEPTION 'Orçamento não encontrado: %', NEW.orcamento_id;
  END IF;
  IF NEW.empresa_id != v_orc_empresa THEN
    RAISE EXCEPTION 'empresa_id do log (%) não corresponde ao orçamento (%)', NEW.empresa_id, v_orc_empresa;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_followup_log_empresa
  BEFORE INSERT OR UPDATE ON public.orcamento_followup_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_followup_log_empresa_id();

-- =============================================
-- 6. Trigger: atualizar ultima_interacao_em ao inserir log
-- =============================================
CREATE OR REPLACE FUNCTION public.update_followup_ultima_interacao()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.orcamento_followups
  SET ultima_interacao_em = NEW.created_at
  WHERE orcamento_id = NEW.orcamento_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_ultima_interacao
  AFTER INSERT ON public.orcamento_followup_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_followup_ultima_interacao();

-- =============================================
-- 7. Trigger: snapshot responsavel_nome a partir de responsavel_id
-- =============================================
CREATE OR REPLACE FUNCTION public.snapshot_responsavel_nome()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
DECLARE
  v_name text;
BEGIN
  IF NEW.responsavel_id IS NOT NULL THEN
    SELECT COALESCE(full_name, email, '') INTO v_name FROM public.profiles WHERE id = NEW.responsavel_id;
    NEW.responsavel_nome := COALESCE(v_name, '');
  ELSE
    NEW.responsavel_nome := '';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_snapshot_responsavel_nome
  BEFORE INSERT OR UPDATE ON public.orcamento_followups
  FOR EACH ROW
  EXECUTE FUNCTION public.snapshot_responsavel_nome();

-- =============================================
-- 8. Validação de status_followup e tipo via trigger (não CHECK)
-- =============================================
CREATE OR REPLACE FUNCTION public.validate_followup_status()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status_followup NOT IN ('sem_retorno','agendado','em_negociacao','aguardando_cliente','concluido') THEN
    RAISE EXCEPTION 'status_followup inválido: %', NEW.status_followup;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_followup_status
  BEFORE INSERT OR UPDATE ON public.orcamento_followups
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_followup_status();

CREATE OR REPLACE FUNCTION public.validate_followup_log_tipo()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = 'public'
AS $$
BEGIN
  IF NEW.tipo NOT IN ('contato','retorno_agendado','negociacao','cliente_sem_resposta','aprovado','encerrado','observacao') THEN
    RAISE EXCEPTION 'tipo de interação inválido: %', NEW.tipo;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_followup_log_tipo
  BEFORE INSERT OR UPDATE ON public.orcamento_followup_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_followup_log_tipo();
