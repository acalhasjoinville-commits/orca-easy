-- Add new columns to servicos_catalogo for standalone services
ALTER TABLE public.servicos_catalogo
  ADD COLUMN tipo_servico TEXT NOT NULL DEFAULT 'motor',
  ADD COLUMN modo_cobranca TEXT NOT NULL DEFAULT 'motor',
  ADD COLUMN valor_base NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN unidade_cobranca TEXT NOT NULL DEFAULT '',
  ADD COLUMN custo_base_interno NUMERIC DEFAULT NULL;

-- Validation trigger for service catalog consistency
CREATE OR REPLACE FUNCTION public.validate_servico_catalogo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Validate tipo_servico
  IF NEW.tipo_servico NOT IN ('motor', 'avulso') THEN
    RAISE EXCEPTION 'tipo_servico inválido: %', NEW.tipo_servico;
  END IF;

  -- Validate modo_cobranca
  IF NEW.modo_cobranca NOT IN ('motor', 'valor_fechado', 'por_unidade', 'por_metro') THEN
    RAISE EXCEPTION 'modo_cobranca inválido: %', NEW.modo_cobranca;
  END IF;

  -- Motor services must use modo_cobranca = motor
  IF NEW.tipo_servico = 'motor' AND NEW.modo_cobranca != 'motor' THEN
    RAISE EXCEPTION 'Serviço do motor deve usar modo_cobranca = motor';
  END IF;

  -- Standalone services cannot use modo_cobranca = motor
  IF NEW.tipo_servico = 'avulso' AND NEW.modo_cobranca = 'motor' THEN
    RAISE EXCEPTION 'Serviço avulso não pode usar modo_cobranca = motor';
  END IF;

  -- por_metro requires regra_id
  IF NEW.modo_cobranca = 'por_metro' AND (NEW.regra_id IS NULL OR btrim(NEW.regra_id) = '') THEN
    RAISE EXCEPTION 'modo_cobranca por_metro exige regra_id preenchido';
  END IF;

  -- valor_fechado and por_unidade must not have regra_id
  IF NEW.modo_cobranca IN ('valor_fechado', 'por_unidade') THEN
    NEW.regra_id := '';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_servico_catalogo
  BEFORE INSERT OR UPDATE ON public.servicos_catalogo
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_servico_catalogo();