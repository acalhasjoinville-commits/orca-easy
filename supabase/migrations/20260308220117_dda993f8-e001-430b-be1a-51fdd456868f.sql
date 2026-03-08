
-- ============================================================
-- FASE 2: PART 2 — FUNCTIONS, RLS POLICIES, TRIGGERS
-- ============================================================

-- 1) Helper: get empresa_id for a user
CREATE OR REPLACE FUNCTION public.get_user_empresa_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id FROM public.profiles WHERE id = _user_id
$$;

-- 2) Update handle_new_user trigger to also copy email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

-- 3) Prevent removing last admin of an empresa
CREATE OR REPLACE FUNCTION public.prevent_last_admin_removal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count integer;
BEGIN
  -- Only care about admin role removals
  IF OLD.role != 'admin' THEN
    RETURN OLD;
  END IF;
  
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE empresa_id = OLD.empresa_id
    AND role = 'admin'
    AND id != OLD.id;
  
  IF admin_count = 0 THEN
    RAISE EXCEPTION 'Não é possível remover o último administrador da empresa.';
  END IF;
  
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_prevent_last_admin_removal
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_last_admin_removal();

-- Also prevent UPDATE that changes role away from admin if last admin
CREATE OR REPLACE FUNCTION public.prevent_last_admin_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count integer;
BEGIN
  -- Only care if changing FROM admin to something else
  IF OLD.role != 'admin' OR NEW.role = 'admin' THEN
    RETURN NEW;
  END IF;
  
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE empresa_id = OLD.empresa_id
    AND role = 'admin'
    AND id != OLD.id;
  
  IF admin_count = 0 THEN
    RAISE EXCEPTION 'Não é possível remover o último administrador da empresa.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_last_admin_update
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_last_admin_update();

-- ============================================================
-- 4) REPLACE ALL RLS POLICIES WITH TENANT-ISOLATED ONES
-- ============================================================

-- === clientes ===
DROP POLICY IF EXISTS "Authenticated full access" ON public.clientes;
CREATE POLICY "Tenant isolation" ON public.clientes
  AS PERMISSIVE FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- === orcamentos ===
DROP POLICY IF EXISTS "Authenticated full access" ON public.orcamentos;
CREATE POLICY "Tenant isolation" ON public.orcamentos
  AS PERMISSIVE FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- === politicas_comerciais ===
DROP POLICY IF EXISTS "Authenticated full access" ON public.politicas_comerciais;
CREATE POLICY "Tenant isolation" ON public.politicas_comerciais
  AS PERMISSIVE FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- === insumos ===
DROP POLICY IF EXISTS "Authenticated full access" ON public.insumos;
CREATE POLICY "Tenant isolation" ON public.insumos
  AS PERMISSIVE FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- === motor1 ===
DROP POLICY IF EXISTS "Authenticated full access" ON public.motor1;
CREATE POLICY "Tenant isolation" ON public.motor1
  AS PERMISSIVE FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- === motor2 ===
DROP POLICY IF EXISTS "Authenticated full access" ON public.motor2;
CREATE POLICY "Tenant isolation" ON public.motor2
  AS PERMISSIVE FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- === regras_calculo ===
DROP POLICY IF EXISTS "Authenticated full access" ON public.regras_calculo;
CREATE POLICY "Tenant isolation" ON public.regras_calculo
  AS PERMISSIVE FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- === servicos_catalogo ===
DROP POLICY IF EXISTS "Authenticated full access" ON public.servicos_catalogo;
CREATE POLICY "Tenant isolation" ON public.servicos_catalogo
  AS PERMISSIVE FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- === empresa: user can only see their own empresa ===
DROP POLICY IF EXISTS "Authenticated full access" ON public.empresa;
CREATE POLICY "Tenant isolation" ON public.empresa
  AS PERMISSIVE FOR ALL TO authenticated
  USING (id = get_user_empresa_id(auth.uid()))
  WITH CHECK (id = get_user_empresa_id(auth.uid()));

-- === profiles: update existing policies ===
-- Users read own profile (keep)
-- Admin reads all profiles in same empresa
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin reads empresa profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    empresa_id = get_user_empresa_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- === user_roles: isolated by empresa ===
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins select all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins delete roles" ON public.user_roles;

-- Users read own roles
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admin reads all roles in same empresa
CREATE POLICY "Admin reads empresa roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    empresa_id = get_user_empresa_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

-- Admin inserts roles in same empresa only
CREATE POLICY "Admin inserts empresa roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    empresa_id = get_user_empresa_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

-- Admin updates roles in same empresa only
CREATE POLICY "Admin updates empresa roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (
    empresa_id = get_user_empresa_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    empresa_id = get_user_empresa_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

-- Admin deletes roles in same empresa only
CREATE POLICY "Admin deletes empresa roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (
    empresa_id = get_user_empresa_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

-- === Storage: logos bucket RLS for empresa-segregated paths ===
-- Allow authenticated users to upload to their empresa folder
DROP POLICY IF EXISTS "Authenticated users upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read logos" ON storage.objects;

CREATE POLICY "Empresa upload logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = (get_user_empresa_id(auth.uid()))::text
  );

CREATE POLICY "Empresa manage own logos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = (get_user_empresa_id(auth.uid()))::text
  );

CREATE POLICY "Empresa delete own logos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = (get_user_empresa_id(auth.uid()))::text
  );

CREATE POLICY "Public read logos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'logos');
