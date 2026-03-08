
-- Migration 2: Drop legacy motor_padrao column now that frontend uses new fields
ALTER TABLE public.servicos_catalogo DROP COLUMN motor_padrao;
