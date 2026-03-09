
-- 1. Add politica_comercial_id with real FK ON DELETE SET NULL
ALTER TABLE public.orcamentos
  ADD COLUMN IF NOT EXISTS politica_comercial_id uuid
    REFERENCES public.politicas_comerciais(id) ON DELETE SET NULL;

-- 2. Add snapshot columns (nullable - no default, intentional for legacy detection)
ALTER TABLE public.orcamentos
  ADD COLUMN IF NOT EXISTS validade_snapshot text,
  ADD COLUMN IF NOT EXISTS formas_pagamento_snapshot text,
  ADD COLUMN IF NOT EXISTS garantia_snapshot text,
  ADD COLUMN IF NOT EXISTS tempo_garantia_snapshot text,
  ADD COLUMN IF NOT EXISTS termo_recebimento_os_snapshot text;

-- 3. Conservative backfill per column using COALESCE
--    Only fills NULL snapshot cells; never overwrites an existing snapshot value.
UPDATE public.orcamentos
SET
  validade_snapshot         = COALESCE(validade_snapshot, validade),
  formas_pagamento_snapshot = COALESCE(formas_pagamento_snapshot, formas_pagamento),
  garantia_snapshot         = COALESCE(garantia_snapshot, garantia),
  tempo_garantia_snapshot   = COALESCE(tempo_garantia_snapshot, tempo_garantia)
WHERE
  validade_snapshot         IS NULL
  OR formas_pagamento_snapshot IS NULL
  OR garantia_snapshot      IS NULL
  OR tempo_garantia_snapshot IS NULL;
