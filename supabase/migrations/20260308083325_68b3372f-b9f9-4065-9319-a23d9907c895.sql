
-- Tabela empresa (configurações globais, sem auth por enquanto)
CREATE TABLE public.empresa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url TEXT DEFAULT '',
  nome_fantasia TEXT NOT NULL DEFAULT '',
  razao_social TEXT DEFAULT '',
  cnpj_cpf TEXT DEFAULT '',
  telefone_whatsapp TEXT DEFAULT '',
  email_contato TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  numero TEXT DEFAULT '',
  bairro TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  estado TEXT DEFAULT '',
  cor_primaria TEXT NOT NULL DEFAULT '#0B1B32',
  cor_destaque TEXT NOT NULL DEFAULT '#F57C00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL DEFAULT 'PF' CHECK (tipo IN ('PF', 'PJ')),
  nome_razao_social TEXT NOT NULL,
  documento TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  cep TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  numero TEXT DEFAULT '',
  bairro TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela orçamentos
CREATE TABLE public.orcamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_orcamento INTEGER NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  nome_cliente TEXT NOT NULL,
  itens_servico JSONB NOT NULL DEFAULT '[]'::jsonb,
  custo_total_obra NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_venda NUMERIC(12,2) NOT NULL DEFAULT 0,
  desconto NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_final NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'executado')),
  validade TEXT DEFAULT '',
  descricao_geral TEXT DEFAULT '',
  formas_pagamento TEXT DEFAULT '',
  garantia TEXT DEFAULT '',
  tempo_garantia TEXT DEFAULT '',
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela políticas comerciais
CREATE TABLE public.politicas_comerciais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_politica TEXT NOT NULL,
  validade_dias INTEGER NOT NULL DEFAULT 15,
  formas_pagamento TEXT DEFAULT '',
  garantia TEXT DEFAULT '',
  tempo_garantia TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (permissivo para teste sem auth)
ALTER TABLE public.empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politicas_comerciais ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (temporárias, sem auth)
CREATE POLICY "Allow all on empresa" ON public.empresa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on orcamentos" ON public.orcamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on politicas" ON public.politicas_comerciais FOR ALL USING (true) WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_empresa_updated_at BEFORE UPDATE ON public.empresa FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON public.orcamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_politicas_updated_at BEFORE UPDATE ON public.politicas_comerciais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
