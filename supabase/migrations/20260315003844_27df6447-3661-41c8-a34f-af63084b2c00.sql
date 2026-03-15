-- Lançamentos financeiros (livro-caixa simples)
CREATE TABLE public.lancamentos_financeiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'despesa',
  descricao text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  data date NOT NULL DEFAULT CURRENT_DATE,
  categoria text NOT NULL DEFAULT 'Outros',
  observacao text DEFAULT '',
  origem text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lancamentos_financeiros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.lancamentos_financeiros
  FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

CREATE TRIGGER update_lancamentos_financeiros_updated_at
  BEFORE UPDATE ON public.lancamentos_financeiros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();