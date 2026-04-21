
-- 1. Tabela de links compartilhados
CREATE TABLE public.orcamento_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz NULL
);

CREATE INDEX idx_share_links_token ON public.orcamento_share_links(token);
CREATE INDEX idx_share_links_orcamento ON public.orcamento_share_links(orcamento_id);
CREATE INDEX idx_share_links_empresa ON public.orcamento_share_links(empresa_id);

ALTER TABLE public.orcamento_share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation share links"
  ON public.orcamento_share_links
  FOR ALL
  TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- 2. Permitir user_id NULL nos logs (para ações do cliente)
ALTER TABLE public.orcamento_followup_logs ALTER COLUMN user_id DROP NOT NULL;

-- 3. Atualizar validação de tipo para aceitar ações do cliente
CREATE OR REPLACE FUNCTION public.validate_followup_log_tipo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.tipo NOT IN (
    'contato','retorno_agendado','negociacao','cliente_sem_resposta',
    'aprovado','encerrado','observacao',
    'cliente_aprovou','cliente_rejeitou','cliente_comentou'
  ) THEN
    RAISE EXCEPTION 'tipo de interação inválido: %', NEW.tipo;
  END IF;
  RETURN NEW;
END;
$function$;

-- 4. RPC pública: buscar orçamento por token (apenas dados visíveis ao cliente)
CREATE OR REPLACE FUNCTION public.public_get_orcamento_by_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_link RECORD;
  v_orc RECORD;
  v_emp RECORD;
  v_cli RECORD;
  v_itens jsonb;
  v_link_status text;
BEGIN
  IF _token IS NULL OR length(_token) < 20 THEN
    RAISE EXCEPTION 'Link inválido' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_link FROM public.orcamento_share_links WHERE token = _token;

  IF v_link.id IS NULL THEN
    RAISE EXCEPTION 'Link inválido' USING ERRCODE = 'P0001';
  END IF;

  IF v_link.revoked_at IS NOT NULL THEN
    v_link_status := 'revogado';
  ELSIF v_link.expires_at < now() THEN
    v_link_status := 'expirado';
  ELSE
    v_link_status := 'ativo';
  END IF;

  SELECT * INTO v_orc FROM public.orcamentos WHERE id = v_link.orcamento_id;
  IF v_orc.id IS NULL THEN
    RAISE EXCEPTION 'Orçamento não encontrado' USING ERRCODE = 'P0001';
  END IF;

  SELECT id, nome_fantasia, razao_social, logo_url, cor_primaria, cor_destaque,
         slogan, telefone_whatsapp, email_contato, cidade, estado
  INTO v_emp FROM public.empresa WHERE id = v_orc.empresa_id;

  SELECT id, nome_razao_social, documento, cidade
  INTO v_cli FROM public.clientes WHERE id = v_orc.cliente_id;

  -- Filtrar itens: remover campos sensíveis
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', item->>'id',
      'nomeServico', item->>'nomeServico',
      'tipoServico', item->>'tipoServico',
      'modoCobranca', item->>'modoCobranca',
      'unidadeCobranca', item->>'unidadeCobranca',
      'metragem', item->'metragem',
      'quantidade', item->'quantidade',
      'dificuldade', item->>'dificuldade',
      'material', item->>'material',
      'espessura', item->'espessura',
      'corte', item->'corte',
      'descricao', item->>'descricao',
      'observacoes', item->>'observacoes',
      'valorVenda', item->'valorVenda',
      'valorUnitario', item->'valorUnitario',
      'valorTotal', item->'valorTotal'
    )
  ), '[]'::jsonb)
  INTO v_itens
  FROM jsonb_array_elements(coalesce(v_orc.itens_servico, '[]'::jsonb)) AS item;

  RETURN jsonb_build_object(
    'link_status', v_link_status,
    'expires_at', v_link.expires_at,
    'empresa', jsonb_build_object(
      'nome_fantasia', v_emp.nome_fantasia,
      'razao_social', v_emp.razao_social,
      'logo_url', v_emp.logo_url,
      'cor_primaria', v_emp.cor_primaria,
      'cor_destaque', v_emp.cor_destaque,
      'slogan', v_emp.slogan,
      'telefone_whatsapp', v_emp.telefone_whatsapp,
      'email_contato', v_emp.email_contato,
      'cidade', v_emp.cidade,
      'estado', v_emp.estado
    ),
    'cliente', jsonb_build_object(
      'nome_razao_social', coalesce(v_cli.nome_razao_social, v_orc.nome_cliente),
      'documento', v_cli.documento,
      'cidade', v_cli.cidade
    ),
    'orcamento', jsonb_build_object(
      'id', v_orc.id,
      'numero_orcamento', v_orc.numero_orcamento,
      'status', v_orc.status,
      'data_criacao', v_orc.data_criacao,
      'data_execucao', v_orc.data_execucao,
      'data_cancelamento', v_orc.data_cancelamento,
      'descricao_geral', v_orc.descricao_geral,
      'itens_servico', v_itens,
      'valor_venda', v_orc.valor_venda,
      'desconto', v_orc.desconto,
      'valor_final', v_orc.valor_final,
      'validade_snapshot', coalesce(v_orc.validade_snapshot, v_orc.validade),
      'formas_pagamento_snapshot', coalesce(v_orc.formas_pagamento_snapshot, v_orc.formas_pagamento),
      'garantia_snapshot', coalesce(v_orc.garantia_snapshot, v_orc.garantia),
      'tempo_garantia_snapshot', coalesce(v_orc.tempo_garantia_snapshot, v_orc.tempo_garantia),
      'politica_nome_snapshot', v_orc.politica_nome_snapshot
    )
  );
END;
$function$;

-- 5. RPC pública: aprovar / rejeitar
CREATE OR REPLACE FUNCTION public.public_respond_orcamento(_token text, _action text, _comment text DEFAULT '')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_link RECORD;
  v_orc RECORD;
  v_new_status text;
  v_log_tipo text;
  v_clean_comment text;
BEGIN
  IF _token IS NULL OR length(_token) < 20 THEN
    RAISE EXCEPTION 'Link inválido';
  END IF;

  IF _action NOT IN ('aprovar','rejeitar') THEN
    RAISE EXCEPTION 'Ação inválida';
  END IF;

  SELECT * INTO v_link FROM public.orcamento_share_links WHERE token = _token;
  IF v_link.id IS NULL THEN
    RAISE EXCEPTION 'Link inválido';
  END IF;
  IF v_link.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'Este link foi revogado';
  END IF;
  IF v_link.expires_at < now() THEN
    RAISE EXCEPTION 'Este link expirou';
  END IF;

  SELECT * INTO v_orc FROM public.orcamentos WHERE id = v_link.orcamento_id FOR UPDATE;
  IF v_orc.id IS NULL THEN
    RAISE EXCEPTION 'Orçamento não encontrado';
  END IF;

  IF v_orc.status <> 'pendente' THEN
    RAISE EXCEPTION 'Este orçamento não está mais aguardando resposta';
  END IF;

  IF _action = 'aprovar' THEN
    v_new_status := 'aprovado';
    v_log_tipo := 'cliente_aprovou';
  ELSE
    v_new_status := 'rejeitado';
    v_log_tipo := 'cliente_rejeitou';
  END IF;

  v_clean_comment := left(btrim(coalesce(_comment, '')), 2000);

  UPDATE public.orcamentos
    SET status = v_new_status, updated_at = now()
    WHERE id = v_orc.id;

  INSERT INTO public.orcamento_followup_logs (
    orcamento_id, empresa_id, user_id, user_name, tipo, descricao
  ) VALUES (
    v_orc.id, v_orc.empresa_id, NULL,
    'Cliente (' || v_orc.nome_cliente || ')',
    v_log_tipo,
    v_clean_comment
  );

  RETURN jsonb_build_object('success', true, 'status', v_new_status);
END;
$function$;

-- 6. RPC pública: comentar (sem mudar status)
CREATE OR REPLACE FUNCTION public.public_comment_orcamento(_token text, _comment text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_link RECORD;
  v_orc RECORD;
  v_clean text;
  v_last_at timestamptz;
BEGIN
  IF _token IS NULL OR length(_token) < 20 THEN
    RAISE EXCEPTION 'Link inválido';
  END IF;

  v_clean := btrim(coalesce(_comment, ''));
  IF length(v_clean) = 0 THEN
    RAISE EXCEPTION 'Comentário não pode ser vazio';
  END IF;
  IF length(v_clean) > 2000 THEN
    v_clean := left(v_clean, 2000);
  END IF;

  SELECT * INTO v_link FROM public.orcamento_share_links WHERE token = _token;
  IF v_link.id IS NULL THEN
    RAISE EXCEPTION 'Link inválido';
  END IF;
  IF v_link.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'Este link foi revogado';
  END IF;
  IF v_link.expires_at < now() THEN
    RAISE EXCEPTION 'Este link expirou';
  END IF;

  SELECT * INTO v_orc FROM public.orcamentos WHERE id = v_link.orcamento_id;
  IF v_orc.id IS NULL THEN
    RAISE EXCEPTION 'Orçamento não encontrado';
  END IF;

  -- Anti-spam: 30s entre comentários do cliente neste orçamento
  SELECT max(created_at) INTO v_last_at
    FROM public.orcamento_followup_logs
    WHERE orcamento_id = v_orc.id AND tipo = 'cliente_comentou';

  IF v_last_at IS NOT NULL AND v_last_at > now() - interval '30 seconds' THEN
    RAISE EXCEPTION 'Aguarde alguns segundos antes de enviar outro comentário';
  END IF;

  INSERT INTO public.orcamento_followup_logs (
    orcamento_id, empresa_id, user_id, user_name, tipo, descricao
  ) VALUES (
    v_orc.id, v_orc.empresa_id, NULL,
    'Cliente (' || v_orc.nome_cliente || ')',
    'cliente_comentou',
    v_clean
  );

  RETURN jsonb_build_object('success', true);
END;
$function$;

-- 7. Conceder execução para anon (público) e authenticated
GRANT EXECUTE ON FUNCTION public.public_get_orcamento_by_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_respond_orcamento(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_comment_orcamento(text, text) TO anon, authenticated;
