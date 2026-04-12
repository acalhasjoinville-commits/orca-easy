-- Create retornos_servico table
CREATE TABLE public.retornos_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'outro',
  status TEXT NOT NULL DEFAULT 'aberto',
  descricao TEXT NOT NULL,
  data_retorno DATE,
  hora_retorno TIME,
  responsavel_id UUID DEFAULT NULL,
  responsavel_nome TEXT NOT NULL DEFAULT '',
  observacoes TEXT NOT NULL DEFAULT '',
  resolucao TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.retornos_servico ENABLE ROW LEVEL SECURITY;

-- Tenant isolation
CREATE POLICY "Tenant isolation" ON public.retornos_servico
  FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_retornos_servico_updated_at
  BEFORE UPDATE ON public.retornos_servico
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Snapshot responsavel_nome
CREATE TRIGGER snapshot_retornos_responsavel_nome
  BEFORE INSERT OR UPDATE ON public.retornos_servico
  FOR EACH ROW EXECUTE FUNCTION snapshot_responsavel_nome();

-- Validation trigger
CREATE OR REPLACE FUNCTION public.validate_retorno_servico()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path = 'public'
AS $$
BEGIN
  -- Validate tipo
  IF NEW.tipo NOT IN ('garantia', 'ajuste', 'reclamacao', 'vistoria', 'manutencao', 'outro') THEN
    RAISE EXCEPTION 'tipo inválido: %', NEW.tipo;
  END IF;

  -- Validate status
  IF NEW.status NOT IN ('aberto', 'agendado', 'em_atendimento', 'resolvido', 'encerrado', 'cancelado') THEN
    RAISE EXCEPTION 'status inválido: %', NEW.status;
  END IF;

  -- descricao must not be empty
  IF btrim(NEW.descricao) = '' THEN
    RAISE EXCEPTION 'descricao não pode ser vazia';
  END IF;

  -- If agendado, data_retorno is required
  IF NEW.status = 'agendado' AND NEW.data_retorno IS NULL THEN
    RAISE EXCEPTION 'data_retorno é obrigatória quando status é agendado';
  END IF;

  -- If resolvido, resolucao is required
  IF NEW.status = 'resolvido' AND btrim(NEW.resolucao) = '' THEN
    RAISE EXCEPTION 'resolucao é obrigatória quando status é resolvido';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_retorno_servico_trigger
  BEFORE INSERT OR UPDATE ON public.retornos_servico
  FOR EACH ROW EXECUTE FUNCTION validate_retorno_servico();

-- Index for fast lookups by orcamento
CREATE INDEX idx_retornos_servico_orcamento ON public.retornos_servico (orcamento_id);
CREATE INDEX idx_retornos_servico_empresa ON public.retornos_servico (empresa_id);