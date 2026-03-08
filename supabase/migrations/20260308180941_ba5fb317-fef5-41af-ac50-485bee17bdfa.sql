
-- Motor 1 (Fabricação/Peso)
CREATE TABLE public.motor1 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material text NOT NULL,
  densidade numeric NOT NULL DEFAULT 0,
  preco_quilo numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Motor 2 (Compra/Dobra)
CREATE TABLE public.motor2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material text NOT NULL,
  espessura numeric NOT NULL DEFAULT 0,
  corte numeric NOT NULL DEFAULT 0,
  preco_metro_linear numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insumos
CREATE TABLE public.insumos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_embalagem_compra text NOT NULL,
  nome_unidade_consumo text NOT NULL,
  preco_embalagem numeric NOT NULL DEFAULT 0,
  qtd_embalagem numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Regras de Cálculo
CREATE TABLE public.regras_calculo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_regra text NOT NULL,
  itens_regra jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Catálogo de Serviços
CREATE TABLE public.servicos_catalogo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_servico text NOT NULL,
  regra_id text NOT NULL DEFAULT '',
  motor_padrao text NOT NULL DEFAULT 'motor1',
  material_padrao text NOT NULL DEFAULT '',
  espessura_padrao numeric NOT NULL DEFAULT 0,
  corte_padrao numeric NOT NULL DEFAULT 0,
  dificuldade_facil numeric NOT NULL DEFAULT 2.6,
  dificuldade_media numeric NOT NULL DEFAULT 3.5,
  dificuldade_dificil numeric NOT NULL DEFAULT 4.6,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.motor1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motor2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regras_calculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos_catalogo ENABLE ROW LEVEL SECURITY;

-- Open policies (same pattern as existing tables)
CREATE POLICY "Allow all on motor1" ON public.motor1 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on motor2" ON public.motor2 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on insumos" ON public.insumos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on regras_calculo" ON public.regras_calculo FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on servicos_catalogo" ON public.servicos_catalogo FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_motor1_updated_at BEFORE UPDATE ON public.motor1 FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_motor2_updated_at BEFORE UPDATE ON public.motor2 FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_insumos_updated_at BEFORE UPDATE ON public.insumos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_regras_calculo_updated_at BEFORE UPDATE ON public.regras_calculo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_servicos_catalogo_updated_at BEFORE UPDATE ON public.servicos_catalogo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
