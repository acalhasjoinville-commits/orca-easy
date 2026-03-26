
-- Table to track seed execution: one row per empresa+table, created atomically
CREATE TABLE public.seed_control (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  table_name text NOT NULL,
  seeded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (empresa_id, table_name)
);

ALTER TABLE public.seed_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.seed_control
  FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- Atomic function: tries to claim seed for a table. Returns true if THIS call claimed it.
-- Uses INSERT ... ON CONFLICT to prevent race conditions.
CREATE OR REPLACE FUNCTION public.claim_seed(_empresa_id uuid, _table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_inserted boolean;
BEGIN
  INSERT INTO public.seed_control (empresa_id, table_name)
  VALUES (_empresa_id, _table_name)
  ON CONFLICT (empresa_id, table_name) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RETURN v_inserted > 0;
END;
$$;
