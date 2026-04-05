
# Cor Principal com Herança Plataforma → Empresa

## Regra de herança

```
corEfetiva = empresa.cor_primaria (se NOT NULL) || platformSettings.primary_color || '#4F46E5'
```

- `cor_primaria = NULL` na empresa significa "herdar da plataforma"
- Nunca usar valor antigo `#0B1B32` como sinal de herança

## 1. Banco de dados (migration)

### Tabela `platform_settings`
- `id` text PK default `'global'` (linha única via CHECK `id = 'global'`)
- `primary_color` text NOT NULL default `'#4F46E5'`
- `updated_at` timestamptz NOT NULL default now()
- RLS: SELECT para authenticated; escrita apenas via RPC
- Trigger `updated_at`

### Alterar `empresa.cor_primaria`
- `ALTER TABLE empresa ALTER COLUMN cor_primaria SET DEFAULT NULL;`
- `ALTER TABLE empresa ALTER COLUMN cor_primaria DROP NOT NULL;`
- `UPDATE empresa SET cor_primaria = NULL WHERE cor_primaria = '#0B1B32';`
- Empresas que tinham o valor padrão antigo passam a herdar automaticamente

### RPC `sa_get_platform_settings` (STABLE, SECURITY DEFINER)
- Acessível a qualquer authenticated (é só a cor)
- Retorna `primary_color` da linha global

### RPC `sa_update_platform_settings` (SECURITY DEFINER)
- Valida `is_platform_admin`
- UPSERT na linha única
- Registra no `platform_audit_log`

## 2. Hook central: `usePlatformColor`

Arquivo: `src/hooks/usePlatformColor.ts`

- Query `sa_get_platform_settings` com staleTime 5min
- Exporta `platformPrimaryColor: string` (com fallback `#4F46E5`)

## 3. Função pura de resolução: `resolveEffectiveColor`

Arquivo: `src/lib/colorUtils.ts`

```ts
const FALLBACK = '#4F46E5';

export function resolveEffectiveColor(
  empresaCorPrimaria: string | null | undefined,
  platformColor: string | null | undefined
): string {
  return empresaCorPrimaria || platformColor || FALLBACK;
}

export function hexToHSL(hex: string): string { /* ... */ }
```

- Usada na UI (tema CSS) e nos PDFs (cor de cabeçalho)
- Ponto único de resolução — sem duplicação

## 4. Aplicação do tema CSS

Arquivo: `src/components/ThemeApplicator.tsx` (novo componente)

- Renderizado dentro da área autenticada da empresa (NÃO no super admin)
- Recebe `effectiveColor` via props ou contexto
- `useEffect` aplica `--primary`, `--ring`, `--sidebar-primary` via `document.documentElement.style.setProperty`
- **Cleanup obrigatório**: no `return` do useEffect, reseta as variáveis para o valor original do CSS (ou remove os overrides)
- Super admin NÃO renderiza este componente → tema fixo garantido

## 5. PDFs

Os componentes `OrcamentoPDF` e `OrdemServicoPDF` já recebem dados da empresa. Ajustar para que recebam `corEfetiva` (resolvida com `resolveEffectiveColor`) em vez de usar `empresa.corPrimaria` diretamente.

- Quem monta os dados para o PDF chama `resolveEffectiveColor(empresa.corPrimaria, platformColor)`
- O PDF usa essa cor resolvida

## 6. Super Admin — UI de cor padrão

Novo componente: `src/components/super-admin/SuperAdminConfiguracoes.tsx`

- Nova tab `configuracoes` no `SATab`
- Card simples: input color + input hex + preview + botão salvar
- Microcopy: "Esta é a cor principal padrão da plataforma. Empresas que não definirem cor própria usarão esta cor."
- Mutation para `sa_update_platform_settings`

## 7. Configurações da empresa

Em `Configuracoes.tsx`, seção de cor primária:

- Se `cor_primaria` da empresa for NULL → mostrar "Usando cor padrão da plataforma" com preview
- Se tiver valor próprio → mostrar "Cor personalizada" com opção de "Restaurar padrão da plataforma" (seta cor_primaria para NULL)
- Input color + hex para definir cor própria

## 8. Mapper `dbToEmpresa`

Em `useSupabaseData.ts`, ao converter empresa do banco:

- Se `cor_primaria` for `'#0B1B32'` ou vazio → mapear para `null` (compatibilidade)
- Ou confiar no UPDATE da migration que já limpou os valores antigos

## Arquivos criados/modificados

| Arquivo | Ação |
|---|---|
| migration SQL | Nova tabela, RPCs, alter empresa |
| `src/lib/colorUtils.ts` | Novo — resolveEffectiveColor + hexToHSL |
| `src/hooks/usePlatformColor.ts` | Novo — query platform_settings |
| `src/components/ThemeApplicator.tsx` | Novo — aplica CSS vars com cleanup |
| `src/components/super-admin/SuperAdminConfiguracoes.tsx` | Novo — UI cor padrão |
| `src/components/super-admin/SuperAdminLayout.tsx` | Adicionar tab configuracoes |
| `src/pages/SuperAdmin.tsx` | Case para nova tab |
| `src/hooks/useSuperAdmin.ts` | Mutation platform settings |
| `src/hooks/useSupabaseData.ts` | Mapper corPrimaria null-aware |
| `src/components/Configuracoes.tsx` | UX herança/override |
| `src/pages/Index.tsx` | Renderizar ThemeApplicator |
| `src/components/OrcamentoPDF.tsx` | Receber cor efetiva |
| `src/components/OrdemServicoPDF.tsx` | Receber cor efetiva |
