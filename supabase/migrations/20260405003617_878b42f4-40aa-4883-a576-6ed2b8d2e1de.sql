
-- 1. Create platform_settings table (single-row)
CREATE TABLE public.platform_settings (
  id text PRIMARY KEY DEFAULT 'global',
  primary_color text NOT NULL DEFAULT '#4F46E5',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 'global')
);

-- Seed the single row
INSERT INTO public.platform_settings (id) VALUES ('global');

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read (it's just a color)
CREATE POLICY "Authenticated users can read platform settings"
  ON public.platform_settings FOR SELECT
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Alter empresa.cor_primaria to nullable
ALTER TABLE public.empresa ALTER COLUMN cor_primaria DROP NOT NULL;
ALTER TABLE public.empresa ALTER COLUMN cor_primaria SET DEFAULT NULL;

-- 3. RPC: read platform settings
CREATE OR REPLACE FUNCTION public.sa_get_platform_settings()
  RETURNS jsonb
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object('primary_color', primary_color, 'updated_at', updated_at)
  FROM public.platform_settings
  WHERE id = 'global'
$$;

-- 4. RPC: update platform settings (super admin only, with audit)
CREATE OR REPLACE FUNCTION public.sa_update_platform_settings(_primary_color text)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  _old_color text;
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF _primary_color IS NULL OR btrim(_primary_color) = '' THEN
    RAISE EXCEPTION 'Cor primária é obrigatória';
  END IF;

  SELECT primary_color INTO _old_color FROM platform_settings WHERE id = 'global';

  UPDATE platform_settings
  SET primary_color = btrim(_primary_color)
  WHERE id = 'global';

  INSERT INTO platform_audit_log (admin_user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'update_platform_settings', 'platform', NULL,
    jsonb_build_object('before', jsonb_build_object('primary_color', _old_color),
                       'after', jsonb_build_object('primary_color', btrim(_primary_color))));
END;
$$;
