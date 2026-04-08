
CREATE TABLE public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta text NOT NULL,
  resposta text NOT NULL,
  categoria text NOT NULL DEFAULT 'Geral',
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Authenticated users read only active FAQs
CREATE POLICY "Authenticated read active faqs"
  ON public.faq_items FOR SELECT TO authenticated
  USING (ativo = true);

-- Platform admins read all (active and inactive)
CREATE POLICY "Platform admins read all faqs"
  ON public.faq_items FOR SELECT TO authenticated
  USING (is_platform_admin(auth.uid()));

-- Platform admins CRUD
CREATE POLICY "Platform admins insert faqs"
  ON public.faq_items FOR INSERT TO authenticated
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins update faqs"
  ON public.faq_items FOR UPDATE TO authenticated
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins delete faqs"
  ON public.faq_items FOR DELETE TO authenticated
  USING (is_platform_admin(auth.uid()));

-- Auto-update updated_at
CREATE TRIGGER update_faq_items_updated_at
  BEFORE UPDATE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
