
CREATE OR REPLACE FUNCTION public.update_followup_ultima_interacao()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.orcamento_followups (orcamento_id, empresa_id, ultima_interacao_em)
  VALUES (NEW.orcamento_id, NEW.empresa_id, NEW.created_at)
  ON CONFLICT (orcamento_id)
  DO UPDATE SET ultima_interacao_em = EXCLUDED.ultima_interacao_em;
  RETURN NEW;
END;
$$;
