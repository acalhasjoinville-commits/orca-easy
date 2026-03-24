ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS data_prevista timestamptz;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS data_faturamento timestamptz;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS data_pagamento timestamptz;