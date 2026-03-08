-- Drop legacy motor columns from servicos_catalogo
ALTER TABLE public.servicos_catalogo DROP COLUMN IF EXISTS permite_motor1;
ALTER TABLE public.servicos_catalogo DROP COLUMN IF EXISTS permite_motor2;
ALTER TABLE public.servicos_catalogo DROP COLUMN IF EXISTS motor_preferencial;