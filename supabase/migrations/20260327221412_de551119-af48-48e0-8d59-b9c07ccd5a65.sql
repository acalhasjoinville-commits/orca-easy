-- Feature 1: data_cancelamento on orcamentos
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS data_cancelamento timestamptz;

-- Feature 2: invites table
CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
  email text NOT NULL,
  role app_role NOT NULL,
  invited_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz,
  UNIQUE(empresa_id, email)
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages invites" ON public.invites
  FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- Update handle_new_user to check invites
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invite RECORD;
BEGIN
  SELECT * INTO v_invite
  FROM public.invites
  WHERE email = LOWER(COALESCE(NEW.email, ''))
    AND used_at IS NULL
  LIMIT 1;

  IF v_invite.id IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name, email, empresa_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.email, ''),
      v_invite.empresa_id
    );

    INSERT INTO public.user_roles (user_id, role, empresa_id)
    VALUES (NEW.id, v_invite.role, v_invite.empresa_id);

    UPDATE public.invites SET used_at = now() WHERE id = v_invite.id;
  ELSE
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.email, '')
    );
  END IF;

  RETURN NEW;
END;
$$;