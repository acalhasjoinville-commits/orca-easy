
-- Migration 1: Add motor permission columns to servicos_catalogo
ALTER TABLE public.servicos_catalogo
  ADD COLUMN permite_motor1 boolean NOT NULL DEFAULT true,
  ADD COLUMN permite_motor2 boolean NOT NULL DEFAULT false,
  ADD COLUMN motor_preferencial text NOT NULL DEFAULT 'motor1';

-- Backfill from motor_padrao
UPDATE public.servicos_catalogo
SET
  permite_motor1 = CASE WHEN motor_padrao = 'motor2' THEN false ELSE true END,
  permite_motor2 = CASE WHEN motor_padrao = 'motor2' THEN true ELSE false END,
  motor_preferencial = CASE WHEN motor_padrao = 'motor2' THEN 'motor2' ELSE 'motor1' END;
