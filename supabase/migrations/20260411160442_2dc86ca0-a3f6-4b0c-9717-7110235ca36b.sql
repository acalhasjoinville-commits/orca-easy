-- Tabela de visitas comerciais/técnicas (pré-orçamento)
CREATE TABLE public.visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
  nome_cliente TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco_completo TEXT NOT NULL,
  bairro TEXT NOT NULL DEFAULT '',
  cidade TEXT NOT NULL DEFAULT '',
  complemento TEXT NOT NULL DEFAULT '',
  ponto_referencia TEXT NOT NULL DEFAULT '',
  tipo_servico TEXT NOT NULL DEFAULT '',
  observacoes TEXT NOT NULL DEFAULT '',
  responsavel_id UUID DEFAULT NULL,
  responsavel_nome TEXT NOT NULL DEFAULT '',
  origem_contato TEXT NOT NULL DEFAULT '',
  data_visita DATE NOT NULL,
  hora_visita TIME NOT NULL DEFAULT '08:00',
  status TEXT NOT NULL DEFAULT 'agendada',
  -- Campos para evolução futura (vincular a cliente/orçamento)
  cliente_id UUID DEFAULT NULL,
  orcamento_id UUID DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Validação: campos obrigatórios não podem ser string vazia
CREATE OR REPLACE FUNCTION public.validate_visita_required_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF btrim(NEW.nome_cliente) = '' THEN
    RAISE EXCEPTION 'nome_cliente não pode ser vazio';
  END IF;
  IF btrim(NEW.telefone) = '' THEN
    RAISE EXCEPTION 'telefone não pode ser vazio';
  END IF;
  IF btrim(NEW.endereco_completo) = '' THEN
    RAISE EXCEPTION 'endereco_completo não pode ser vazio';
  END IF;
  IF NEW.status NOT IN ('agendada', 'realizada', 'cancelada', 'reagendada') THEN
    RAISE EXCEPTION 'status inválido: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_visita
  BEFORE INSERT OR UPDATE ON public.visitas
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_visita_required_fields();

-- Trigger updated_at
CREATE TRIGGER update_visitas_updated_at
  BEFORE UPDATE ON public.visitas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation"
  ON public.visitas
  FOR ALL
  TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- Índices para queries comuns
CREATE INDEX idx_visitas_empresa_data ON public.visitas (empresa_id, data_visita);
CREATE INDEX idx_visitas_status ON public.visitas (empresa_id, status);