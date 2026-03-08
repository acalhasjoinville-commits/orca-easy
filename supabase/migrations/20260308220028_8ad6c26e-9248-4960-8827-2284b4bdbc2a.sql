
-- ============================================================
-- FASE 2: MULTI-TENANT — PART 1: SCHEMA CHANGES
-- Regra: 1 usuario pertence a 1 empresa. profiles.empresa_id nullable para novos signups.
-- ZERO alteracao em valores financeiros de orcamentos existentes.
-- ============================================================

-- 1) Add empresa_id to profiles (nullable — new users may not have empresa yet)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresa(id);
-- Add email to profiles (for admin panel display without touching auth.users)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text DEFAULT '';

-- 2) Add empresa_id to user_roles (nullable initially for backfill)
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresa(id);

-- 3) Add empresa_id to all 8 data tables
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresa(id);
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresa(id);
ALTER TABLE public.politicas_comerciais ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresa(id);
ALTER TABLE public.insumos ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresa(id);
ALTER TABLE public.motor1 ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresa(id);
ALTER TABLE public.motor2 ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresa(id);
ALTER TABLE public.regras_calculo ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresa(id);
ALTER TABLE public.servicos_catalogo ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresa(id);

-- 4) BACKFILL: assign existing empresa to ALL current records
-- This ONLY sets empresa_id. Zero changes to any financial/commercial fields.
UPDATE public.profiles SET empresa_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE empresa_id IS NULL;
UPDATE public.profiles SET email = 'admin@acalhas.com' WHERE id = '06257379-4a59-4323-a82f-a2267dde4810' AND (email IS NULL OR email = '');
UPDATE public.user_roles SET empresa_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE empresa_id IS NULL;
UPDATE public.clientes SET empresa_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE empresa_id IS NULL;
UPDATE public.orcamentos SET empresa_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE empresa_id IS NULL;
UPDATE public.politicas_comerciais SET empresa_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE empresa_id IS NULL;
UPDATE public.insumos SET empresa_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE empresa_id IS NULL;
UPDATE public.motor1 SET empresa_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE empresa_id IS NULL;
UPDATE public.motor2 SET empresa_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE empresa_id IS NULL;
UPDATE public.regras_calculo SET empresa_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE empresa_id IS NULL;
UPDATE public.servicos_catalogo SET empresa_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE empresa_id IS NULL;

-- 5) Make empresa_id NOT NULL on data tables and user_roles (profiles stays nullable for new signups)
ALTER TABLE public.user_roles ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.clientes ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.orcamentos ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.politicas_comerciais ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.insumos ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.motor1 ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.motor2 ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.regras_calculo ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.servicos_catalogo ALTER COLUMN empresa_id SET NOT NULL;
