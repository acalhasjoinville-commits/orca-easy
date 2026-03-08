-- Migration de limpeza: remover policies duplicadas e recriar como PERMISSIVE
-- Tabelas afetadas: clientes, empresa, insumos, motor1, motor2, orcamentos, politicas_comerciais, regras_calculo, servicos_catalogo
-- NAO altera dados. NAO toca em profiles, user_roles ou storage.

-- === clientes ===
DROP POLICY IF EXISTS "Allow all on clientes" ON public.clientes;
DROP POLICY IF EXISTS "Allow all on clientes " ON public.clientes;
DROP POLICY IF EXISTS "Authenticated access" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated access " ON public.clientes;
CREATE POLICY "Authenticated full access" ON public.clientes
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- === empresa ===
DROP POLICY IF EXISTS "Allow all on empresa" ON public.empresa;
DROP POLICY IF EXISTS "Allow all on empresa " ON public.empresa;
DROP POLICY IF EXISTS "Authenticated access" ON public.empresa;
DROP POLICY IF EXISTS "Authenticated access " ON public.empresa;
CREATE POLICY "Authenticated full access" ON public.empresa
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- === insumos ===
DROP POLICY IF EXISTS "Allow all on insumos" ON public.insumos;
DROP POLICY IF EXISTS "Allow all on insumos " ON public.insumos;
DROP POLICY IF EXISTS "Authenticated access" ON public.insumos;
DROP POLICY IF EXISTS "Authenticated access " ON public.insumos;
CREATE POLICY "Authenticated full access" ON public.insumos
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- === motor1 ===
DROP POLICY IF EXISTS "Allow all on motor1" ON public.motor1;
DROP POLICY IF EXISTS "Allow all on motor1 " ON public.motor1;
DROP POLICY IF EXISTS "Authenticated access" ON public.motor1;
DROP POLICY IF EXISTS "Authenticated access " ON public.motor1;
CREATE POLICY "Authenticated full access" ON public.motor1
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- === motor2 ===
DROP POLICY IF EXISTS "Allow all on motor2" ON public.motor2;
DROP POLICY IF EXISTS "Allow all on motor2 " ON public.motor2;
DROP POLICY IF EXISTS "Authenticated access" ON public.motor2;
DROP POLICY IF EXISTS "Authenticated access " ON public.motor2;
CREATE POLICY "Authenticated full access" ON public.motor2
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- === orcamentos ===
DROP POLICY IF EXISTS "Allow all on orcamentos" ON public.orcamentos;
DROP POLICY IF EXISTS "Allow all on orcamentos " ON public.orcamentos;
DROP POLICY IF EXISTS "Authenticated access" ON public.orcamentos;
DROP POLICY IF EXISTS "Authenticated access " ON public.orcamentos;
CREATE POLICY "Authenticated full access" ON public.orcamentos
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- === politicas_comerciais ===
DROP POLICY IF EXISTS "Allow all on politicas" ON public.politicas_comerciais;
DROP POLICY IF EXISTS "Allow all on politicas " ON public.politicas_comerciais;
DROP POLICY IF EXISTS "Allow all on politicas_comerciais" ON public.politicas_comerciais;
DROP POLICY IF EXISTS "Allow all on politicas_comerciais " ON public.politicas_comerciais;
DROP POLICY IF EXISTS "Authenticated access" ON public.politicas_comerciais;
DROP POLICY IF EXISTS "Authenticated access " ON public.politicas_comerciais;
CREATE POLICY "Authenticated full access" ON public.politicas_comerciais
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- === regras_calculo ===
DROP POLICY IF EXISTS "Allow all on regras_calculo" ON public.regras_calculo;
DROP POLICY IF EXISTS "Allow all on regras_calculo " ON public.regras_calculo;
DROP POLICY IF EXISTS "Authenticated access" ON public.regras_calculo;
DROP POLICY IF EXISTS "Authenticated access " ON public.regras_calculo;
CREATE POLICY "Authenticated full access" ON public.regras_calculo
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- === servicos_catalogo ===
DROP POLICY IF EXISTS "Allow all on servicos_catalogo" ON public.servicos_catalogo;
DROP POLICY IF EXISTS "Allow all on servicos_catalogo " ON public.servicos_catalogo;
DROP POLICY IF EXISTS "Authenticated access" ON public.servicos_catalogo;
DROP POLICY IF EXISTS "Authenticated access " ON public.servicos_catalogo;
CREATE POLICY "Authenticated full access" ON public.servicos_catalogo
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);