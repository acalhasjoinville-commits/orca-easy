CREATE OR REPLACE FUNCTION public.sa_update_empresa(
  _empresa_id uuid,
  _nome_fantasia text,
  _razao_social text DEFAULT '',
  _cnpj_cpf text DEFAULT '',
  _email_contato text DEFAULT '',
  _telefone_whatsapp text DEFAULT '',
  _endereco text DEFAULT '',
  _numero text DEFAULT '',
  _bairro text DEFAULT '',
  _cidade text DEFAULT '',
  _estado text DEFAULT '',
  _slogan text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _before jsonb;
  _after jsonb;
  _clean_nome_fantasia text;
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  _clean_nome_fantasia := btrim(coalesce(_nome_fantasia, ''));
  IF _clean_nome_fantasia = '' THEN
    RAISE EXCEPTION 'Nome fantasia e obrigatorio';
  END IF;

  SELECT to_jsonb(e)
  INTO _before
  FROM public.empresa e
  WHERE e.id = _empresa_id;

  IF _before IS NULL THEN
    RAISE EXCEPTION 'Empresa nao encontrada';
  END IF;

  UPDATE public.empresa e
  SET
    nome_fantasia = _clean_nome_fantasia,
    razao_social = nullif(btrim(coalesce(_razao_social, '')), ''),
    cnpj_cpf = nullif(btrim(coalesce(_cnpj_cpf, '')), ''),
    email_contato = nullif(btrim(coalesce(_email_contato, '')), ''),
    telefone_whatsapp = nullif(btrim(coalesce(_telefone_whatsapp, '')), ''),
    endereco = nullif(btrim(coalesce(_endereco, '')), ''),
    numero = nullif(btrim(coalesce(_numero, '')), ''),
    bairro = nullif(btrim(coalesce(_bairro, '')), ''),
    cidade = nullif(btrim(coalesce(_cidade, '')), ''),
    estado = nullif(btrim(coalesce(_estado, '')), ''),
    slogan = nullif(btrim(coalesce(_slogan, '')), ''),
    updated_at = now()
  WHERE e.id = _empresa_id
  RETURNING to_jsonb(e) INTO _after;

  INSERT INTO public.platform_audit_log (admin_user_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(),
    'update_empresa',
    'empresa',
    _empresa_id,
    jsonb_build_object('before', _before, 'after', _after)
  );
END;
$$;
