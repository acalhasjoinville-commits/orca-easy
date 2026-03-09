-- ═══════════════════════════════════════════════════════════════════════════
-- SECURE BUDGET NUMBERING: Per-tenant, database-generated, gap-tolerant
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══ STEP 1: VALIDATE NO HISTORICAL DUPLICATES ════════════════════════════
-- If duplicates exist, the migration FAILS with a clear diagnostic message.
DO $$
DECLARE
  dup_count INTEGER;
  dup_info TEXT;
BEGIN
  SELECT COUNT(*), string_agg(info, '; ' ORDER BY info)
  INTO dup_count, dup_info
  FROM (
    SELECT empresa_id || ': #' || numero_orcamento || ' (' || COUNT(*) || 'x)' as info
    FROM orcamentos
    GROUP BY empresa_id, numero_orcamento
    HAVING COUNT(*) > 1
  ) dups;
  
  IF dup_count > 0 THEN
    RAISE EXCEPTION 'DUPLICATAS DE NUMERO_ORCAMENTO ENCONTRADAS: %. Corrija manualmente antes de prosseguir.', dup_info;
  END IF;
  
  RAISE NOTICE 'Validação OK: nenhuma duplicata encontrada.';
END $$;

-- ═══ STEP 2: CREATE TECHNICAL COUNTER TABLE ═══════════════════════════════
-- This is an internal table. Frontend must NOT access it directly.
-- Only the RPC function next_orcamento_number() should touch it.
CREATE TABLE IF NOT EXISTS empresa_orcamento_counters (
  empresa_id UUID PRIMARY KEY REFERENCES empresa(id) ON DELETE CASCADE,
  ultimo_numero INTEGER NOT NULL DEFAULT 1000
);

COMMENT ON TABLE empresa_orcamento_counters IS 'Tabela técnica interna. Não acessar diretamente. Usar RPC next_orcamento_number().';

-- Enable RLS but with no permissive policies = no direct access
ALTER TABLE empresa_orcamento_counters ENABLE ROW LEVEL SECURITY;

-- ═══ STEP 3: INITIALIZE COUNTERS DYNAMICALLY ══════════════════════════════
-- For companies WITH existing budgets: set counter to MAX(numero_orcamento)
INSERT INTO empresa_orcamento_counters (empresa_id, ultimo_numero)
SELECT empresa_id, MAX(numero_orcamento)
FROM orcamentos
GROUP BY empresa_id
ON CONFLICT (empresa_id) DO UPDATE SET ultimo_numero = EXCLUDED.ultimo_numero;

-- For companies WITHOUT budgets yet: initialize at 1000
INSERT INTO empresa_orcamento_counters (empresa_id, ultimo_numero)
SELECT id, 1000 FROM empresa
WHERE id NOT IN (SELECT empresa_id FROM empresa_orcamento_counters)
ON CONFLICT (empresa_id) DO NOTHING;

-- ═══ STEP 4: CREATE SECURE RPC FUNCTION ═══════════════════════════════════
-- The function derives empresa_id from the authenticated user.
-- It does NOT trust any parameter from the frontend.
-- SECURITY DEFINER allows it to bypass RLS on the counter table.
CREATE OR REPLACE FUNCTION public.next_orcamento_number()
RETURNS INTEGER
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_empresa_id UUID;
  v_next INTEGER;
BEGIN
  -- Derive empresa_id from authenticated user (never trust frontend)
  v_empresa_id := get_user_empresa_id(auth.uid());
  
  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não está vinculado a nenhuma empresa.';
  END IF;
  
  -- Ensure counter exists for this empresa (handles new companies post-migration)
  INSERT INTO empresa_orcamento_counters (empresa_id, ultimo_numero)
  VALUES (v_empresa_id, 1000)
  ON CONFLICT (empresa_id) DO NOTHING;
  
  -- Atomically increment and return the next number
  -- Note: If transaction fails after this, there will be a gap. This is by design.
  UPDATE empresa_orcamento_counters
  SET ultimo_numero = ultimo_numero + 1
  WHERE empresa_id = v_empresa_id
  RETURNING ultimo_numero INTO v_next;
  
  RETURN v_next;
END;
$$;

COMMENT ON FUNCTION public.next_orcamento_number() IS 
'Gera próximo número de orçamento para a empresa do usuário autenticado. '
'Único e crescente por empresa. Pode haver lacunas em caso de falha. '
'Não recebe parâmetros do frontend por segurança.';

-- ═══ STEP 5: ADD COMPOSITE UNIQUE CONSTRAINT ══════════════════════════════
-- Ensures uniqueness at database level as final safeguard
ALTER TABLE orcamentos
ADD CONSTRAINT orcamentos_empresa_numero_unique 
UNIQUE (empresa_id, numero_orcamento);