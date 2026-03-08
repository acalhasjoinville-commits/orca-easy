

## Migration de Limpeza — Remover Policies Duplicadas

### Problema
Todas as 9 tabelas de dados possuem **duas policies RESTRICTIVE** simultaneamente:
- `"Allow all on X "` (antiga, deveria ter sido removida)
- `"Authenticated access "` (nova, mas criada sem `AS PERMISSIVE` explicito)

Ambas marcadas como RESTRICTIVE no banco. Precisam ser removidas e recriadas corretamente.

### Solucao: 1 migration SQL

Uma unica migration que:

1. **Remove TODAS as policies** das 9 tabelas (ambas variantes, com e sem trailing space)
2. **Recria UMA policy por tabela** como `AS PERMISSIVE` explicita, `FOR ALL TO authenticated`

```sql
-- Para cada tabela (clientes, empresa, insumos, motor1, motor2, 
-- orcamentos, politicas_comerciais, regras_calculo, servicos_catalogo):

DROP POLICY IF EXISTS "Allow all on clientes" ON public.clientes;
DROP POLICY IF EXISTS "Allow all on clientes " ON public.clientes;
DROP POLICY IF EXISTS "Authenticated access" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated access " ON public.clientes;

CREATE POLICY "Authenticated full access" ON public.clientes
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- (repetir para as 8 tabelas restantes)
```

### O que NAO muda
- Zero alteracao em dados de `orcamentos` ou qualquer outra tabela
- Policies de `profiles` e `user_roles` permanecem intactas (estao corretas)
- Policies de storage `logos` permanecem intactas (estao corretas)
- Nenhum arquivo frontend alterado

### Entregavel
- 1 arquivo SQL de migration versionado no repositorio
- Nome exato do arquivo sera informado apos criacao

