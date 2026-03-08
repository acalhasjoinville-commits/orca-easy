-- 1) Add motor_type to servicos_catalogo
ALTER TABLE public.servicos_catalogo ADD COLUMN motor_type text NOT NULL DEFAULT 'motor1';

-- Backfill from legacy fields
UPDATE public.servicos_catalogo
SET motor_type = CASE
  WHEN permite_motor2 = true AND permite_motor1 = false THEN 'motor2'
  WHEN permite_motor1 = false AND permite_motor2 = false THEN 'motor1'
  ELSE COALESCE(motor_preferencial, 'motor1')
END;

-- 2) Add motor_type to orcamentos (NULLABLE - conservative approach)
ALTER TABLE public.orcamentos ADD COLUMN motor_type text;

-- Conservative backfill: only infer when ALL items agree on motorType
UPDATE public.orcamentos
SET motor_type = (
  SELECT CASE
    WHEN COUNT(DISTINCT item->>'motorType') = 1 
         AND (array_agg(DISTINCT item->>'motorType'))[1] IN ('motor1', 'motor2')
    THEN (array_agg(DISTINCT item->>'motorType'))[1]
    ELSE NULL
  END
  FROM jsonb_array_elements(itens_servico) AS item
)
WHERE jsonb_array_length(itens_servico) > 0;