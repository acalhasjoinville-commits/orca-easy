
-- 1. Create empresa_status type as CHECK constraint on empresa
ALTER TABLE public.empresa ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ativa';

ALTER TABLE public.empresa ADD CONSTRAINT empresa_status_check
  CHECK (status IN ('ativa', 'suspensa', 'bloqueada'));

-- 2. platform_admins table
CREATE TABLE public.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- 3. platform_audit_log table
CREATE TABLE public.platform_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_audit_log ENABLE ROW LEVEL SECURITY;

-- 4. SECURITY DEFINER: is_platform_admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = _user_id
  )
$$;

-- 5. get_empresa_status for auth context
CREATE OR REPLACE FUNCTION public.get_empresa_status(_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.status
  FROM public.empresa e
  JOIN public.profiles p ON p.empresa_id = e.id
  WHERE p.id = _user_id
$$;

-- 6. RLS for platform_admins (only self-check SELECT)
CREATE POLICY "Users check own platform admin status"
  ON public.platform_admins FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 7. RLS for platform_audit_log
CREATE POLICY "Platform admins can read audit log"
  ON public.platform_audit_log FOR SELECT TO authenticated
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can insert audit log"
  ON public.platform_audit_log FOR INSERT TO authenticated
  WITH CHECK (is_platform_admin(auth.uid()));

-- 8. Additive RLS: platform admins can SELECT all empresas
CREATE POLICY "Platform admins read all empresas"
  ON public.empresa FOR SELECT TO authenticated
  USING (is_platform_admin(auth.uid()));

-- 9. Additive RLS: platform admins can UPDATE empresa (status)
CREATE POLICY "Platform admins update empresas"
  ON public.empresa FOR UPDATE TO authenticated
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

-- 10. Additive RLS: platform admins can INSERT empresa
CREATE POLICY "Platform admins insert empresas"
  ON public.empresa FOR INSERT TO authenticated
  WITH CHECK (is_platform_admin(auth.uid()));

-- 11. Additive RLS: platform admins can read all profiles
CREATE POLICY "Platform admins read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (is_platform_admin(auth.uid()));

-- 12. Additive RLS: platform admins can read all user_roles
CREATE POLICY "Platform admins read all user_roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (is_platform_admin(auth.uid()));

-- 13. Additive RLS: platform admins manage user_roles
CREATE POLICY "Platform admins insert user_roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins update user_roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins delete user_roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (is_platform_admin(auth.uid()));

-- 14. Additive RLS: platform admins can read/manage invites
CREATE POLICY "Platform admins read all invites"
  ON public.invites FOR SELECT TO authenticated
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins insert invites"
  ON public.invites FOR INSERT TO authenticated
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins update invites"
  ON public.invites FOR UPDATE TO authenticated
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins delete invites"
  ON public.invites FOR DELETE TO authenticated
  USING (is_platform_admin(auth.uid()));

-- ============================================================
-- SECURE RPCs for all sensitive super admin actions
-- ============================================================

-- 15. sa_update_empresa_status
CREATE OR REPLACE FUNCTION public.sa_update_empresa_status(
  _empresa_id uuid,
  _new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _old_status text;
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  IF _new_status NOT IN ('ativa', 'suspensa', 'bloqueada') THEN
    RAISE EXCEPTION 'Status inválido: %', _new_status;
  END IF;
  SELECT status INTO _old_status FROM empresa WHERE id = _empresa_id;
  IF _old_status IS NULL THEN
    RAISE EXCEPTION 'Empresa não encontrada';
  END IF;
  UPDATE empresa SET status = _new_status, updated_at = now() WHERE id = _empresa_id;
  INSERT INTO platform_audit_log (admin_user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'update_empresa_status', 'empresa', _empresa_id,
    jsonb_build_object('before', jsonb_build_object('status', _old_status), 'after', jsonb_build_object('status', _new_status)));
END;
$$;

-- 16. sa_create_empresa
CREATE OR REPLACE FUNCTION public.sa_create_empresa(
  _nome_fantasia text,
  _razao_social text DEFAULT '',
  _cnpj_cpf text DEFAULT '',
  _email_contato text DEFAULT '',
  _telefone text DEFAULT '',
  _invite_email text DEFAULT NULL,
  _invite_role app_role DEFAULT 'admin'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _empresa_id uuid;
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  INSERT INTO empresa (nome_fantasia, razao_social, cnpj_cpf, email_contato, telefone_whatsapp)
  VALUES (_nome_fantasia, _razao_social, _cnpj_cpf, _email_contato, _telefone)
  RETURNING id INTO _empresa_id;

  INSERT INTO empresa_orcamento_counters (empresa_id, ultimo_numero)
  VALUES (_empresa_id, 1000);

  INSERT INTO platform_audit_log (admin_user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'create_empresa', 'empresa', _empresa_id,
    jsonb_build_object('nome_fantasia', _nome_fantasia, 'invite_email', _invite_email));

  IF _invite_email IS NOT NULL AND _invite_email != '' THEN
    INSERT INTO invites (empresa_id, email, role, invited_by)
    VALUES (_empresa_id, LOWER(_invite_email), _invite_role, auth.uid());
  END IF;

  RETURN _empresa_id;
END;
$$;

-- 17. sa_upsert_user_role
CREATE OR REPLACE FUNCTION public.sa_upsert_user_role(
  _user_id uuid,
  _empresa_id uuid,
  _role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _old_role text;
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  SELECT role::text INTO _old_role FROM user_roles WHERE user_id = _user_id AND empresa_id = _empresa_id LIMIT 1;

  IF _old_role IS NOT NULL THEN
    UPDATE user_roles SET role = _role WHERE user_id = _user_id AND empresa_id = _empresa_id;
  ELSE
    INSERT INTO user_roles (user_id, role, empresa_id) VALUES (_user_id, _role, _empresa_id);
  END IF;

  INSERT INTO platform_audit_log (admin_user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'upsert_user_role', 'user', _user_id,
    jsonb_build_object('empresa_id', _empresa_id, 'before', jsonb_build_object('role', _old_role), 'after', jsonb_build_object('role', _role::text)));
END;
$$;

-- 18. sa_delete_user_role
CREATE OR REPLACE FUNCTION public.sa_delete_user_role(
  _user_id uuid,
  _empresa_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _old_role text;
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  SELECT role::text INTO _old_role FROM user_roles WHERE user_id = _user_id AND empresa_id = _empresa_id LIMIT 1;

  DELETE FROM user_roles WHERE user_id = _user_id AND empresa_id = _empresa_id;

  INSERT INTO platform_audit_log (admin_user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'delete_user_role', 'user', _user_id,
    jsonb_build_object('empresa_id', _empresa_id, 'before', jsonb_build_object('role', _old_role)));
END;
$$;

-- 19. sa_create_invite
CREATE OR REPLACE FUNCTION public.sa_create_invite(
  _empresa_id uuid,
  _email text,
  _role app_role
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite_id uuid;
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  INSERT INTO invites (empresa_id, email, role, invited_by)
  VALUES (_empresa_id, LOWER(_email), _role, auth.uid())
  RETURNING id INTO _invite_id;

  INSERT INTO platform_audit_log (admin_user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'create_invite', 'invite', _invite_id,
    jsonb_build_object('empresa_id', _empresa_id, 'email', _email, 'role', _role::text));

  RETURN _invite_id;
END;
$$;

-- 20. sa_revoke_invite
CREATE OR REPLACE FUNCTION public.sa_revoke_invite(_invite_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inv RECORD;
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  SELECT * INTO _inv FROM invites WHERE id = _invite_id;
  IF _inv.id IS NULL THEN
    RAISE EXCEPTION 'Convite não encontrado';
  END IF;

  DELETE FROM invites WHERE id = _invite_id;

  INSERT INTO platform_audit_log (admin_user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'revoke_invite', 'invite', _invite_id,
    jsonb_build_object('email', _inv.email, 'empresa_id', _inv.empresa_id, 'role', _inv.role::text));
END;
$$;

-- 21. sa_dashboard_stats
CREATE OR REPLACE FUNCTION public.sa_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  SELECT jsonb_build_object(
    'total_empresas', (SELECT count(*) FROM empresa),
    'empresas_ativas', (SELECT count(*) FROM empresa WHERE status = 'ativa'),
    'empresas_suspensas', (SELECT count(*) FROM empresa WHERE status = 'suspensa'),
    'empresas_bloqueadas', (SELECT count(*) FROM empresa WHERE status = 'bloqueada'),
    'total_usuarios', (SELECT count(*) FROM profiles),
    'usuarios_sem_papel', (SELECT count(*) FROM profiles p WHERE NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id)),
    'convites_pendentes', (SELECT count(*) FROM invites WHERE used_at IS NULL),
    'empresas_recentes', (SELECT coalesce(jsonb_agg(row_to_json(sub.*) ORDER BY sub.created_at DESC), '[]'::jsonb) FROM (SELECT id, nome_fantasia, status, created_at FROM empresa ORDER BY created_at DESC LIMIT 5) sub),
    'usuarios_recentes', (SELECT coalesce(jsonb_agg(row_to_json(sub.*) ORDER BY sub.created_at DESC), '[]'::jsonb) FROM (SELECT id, full_name, email, empresa_id, created_at FROM profiles ORDER BY created_at DESC LIMIT 5) sub)
  ) INTO result;
  RETURN result;
END;
$$;

-- 22. sa_list_empresas
CREATE OR REPLACE FUNCTION public.sa_list_empresas()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  RETURN (
    SELECT coalesce(jsonb_agg(row_to_json(sub.*)), '[]'::jsonb)
    FROM (
      SELECT e.id, e.nome_fantasia, e.razao_social, e.cnpj_cpf, e.email_contato, e.telefone_whatsapp, e.status, e.created_at,
        (SELECT count(*) FROM profiles p WHERE p.empresa_id = e.id) as total_usuarios,
        (SELECT count(*) FROM invites i WHERE i.empresa_id = e.id AND i.used_at IS NULL) as convites_pendentes,
        (SELECT coalesce(jsonb_agg(jsonb_build_object('user_id', ur.user_id, 'full_name', p2.full_name, 'email', p2.email)), '[]'::jsonb)
         FROM user_roles ur JOIN profiles p2 ON p2.id = ur.user_id WHERE ur.empresa_id = e.id AND ur.role = 'admin') as admins
      FROM empresa e
      ORDER BY e.created_at DESC
    ) sub
  );
END;
$$;

-- 23. sa_get_empresa_detail
CREATE OR REPLACE FUNCTION public.sa_get_empresa_detail(_empresa_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _empresa jsonb;
  _users jsonb;
  _invites jsonb;
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT row_to_json(e.*)::jsonb INTO _empresa FROM empresa e WHERE e.id = _empresa_id;
  IF _empresa IS NULL THEN
    RAISE EXCEPTION 'Empresa não encontrada';
  END IF;

  SELECT coalesce(jsonb_agg(row_to_json(sub.*)), '[]'::jsonb) INTO _users
  FROM (
    SELECT p.id as user_id, p.full_name, p.email, p.created_at,
      (SELECT coalesce(jsonb_agg(ur.role), '[]'::jsonb) FROM user_roles ur WHERE ur.user_id = p.id AND ur.empresa_id = _empresa_id) as roles
    FROM profiles p WHERE p.empresa_id = _empresa_id
    ORDER BY p.created_at
  ) sub;

  SELECT coalesce(jsonb_agg(row_to_json(sub.*)), '[]'::jsonb) INTO _invites
  FROM (
    SELECT i.id, i.email, i.role, i.created_at, i.used_at, i.invited_by
    FROM invites i WHERE i.empresa_id = _empresa_id
    ORDER BY i.created_at DESC
  ) sub;

  RETURN jsonb_build_object('empresa', _empresa, 'users', _users, 'invites', _invites);
END;
$$;

-- 24. sa_list_all_users
CREATE OR REPLACE FUNCTION public.sa_list_all_users()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  RETURN (
    SELECT coalesce(jsonb_agg(row_to_json(sub.*)), '[]'::jsonb)
    FROM (
      SELECT p.id as user_id, p.full_name, p.email, p.empresa_id, p.created_at,
        e.nome_fantasia as empresa_nome, e.status as empresa_status,
        (SELECT coalesce(jsonb_agg(jsonb_build_object('role', ur.role, 'empresa_id', ur.empresa_id)), '[]'::jsonb) FROM user_roles ur WHERE ur.user_id = p.id) as roles
      FROM profiles p
      LEFT JOIN empresa e ON e.id = p.empresa_id
      ORDER BY p.created_at DESC
    ) sub
  );
END;
$$;

-- 25. sa_list_all_invites
CREATE OR REPLACE FUNCTION public.sa_list_all_invites()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  RETURN (
    SELECT coalesce(jsonb_agg(row_to_json(sub.*)), '[]'::jsonb)
    FROM (
      SELECT i.id, i.email, i.role, i.empresa_id, i.invited_by, i.created_at, i.used_at,
        e.nome_fantasia as empresa_nome
      FROM invites i
      LEFT JOIN empresa e ON e.id = i.empresa_id
      ORDER BY i.created_at DESC
    ) sub
  );
END;
$$;

-- 26. sa_list_audit_log
CREATE OR REPLACE FUNCTION public.sa_list_audit_log(_limit int DEFAULT 100)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  RETURN (
    SELECT coalesce(jsonb_agg(row_to_json(sub.*)), '[]'::jsonb)
    FROM (
      SELECT al.id, al.action, al.target_type, al.target_id, al.details, al.created_at,
        p.full_name as admin_name, p.email as admin_email
      FROM platform_audit_log al
      LEFT JOIN profiles p ON p.id = al.admin_user_id
      ORDER BY al.created_at DESC
      LIMIT _limit
    ) sub
  );
END;
$$;

-- 27. sa_approve_user (set empresa_id on profile if missing, via invite match or manual)
CREATE OR REPLACE FUNCTION public.sa_approve_user(
  _user_id uuid,
  _empresa_id uuid,
  _role app_role DEFAULT 'vendedor'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  UPDATE profiles SET empresa_id = _empresa_id, updated_at = now() WHERE id = _user_id;

  INSERT INTO user_roles (user_id, role, empresa_id)
  VALUES (_user_id, _role, _empresa_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO platform_audit_log (admin_user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'approve_user', 'user', _user_id,
    jsonb_build_object('empresa_id', _empresa_id, 'role', _role::text));
END;
$$;
