

## Plano: Adicionar campo "Slogan" na configuração da empresa e corrigir PDF

### Problema

O PDF usa a frase "A solução está no nome" como **slogan** fixo (hardcoded), mas:
1. Não existe um campo "Slogan" no formulário de configuração da empresa.
2. O tipo `MinhaEmpresa` não tem propriedade `slogan`.
3. A tabela `empresa` no banco não tem coluna `slogan`.
4. O PDF deveria usar apenas dados que o usuário configurou — não textos fixos.

### O Que Será Feito

#### 1. Adicionar coluna `slogan` na tabela `empresa`
- Migration: `ALTER TABLE empresa ADD COLUMN slogan text DEFAULT '';`

#### 2. Atualizar tipo `MinhaEmpresa`
- Adicionar `slogan: string` na interface.

#### 3. Atualizar mappers no `useSupabaseData.ts`
- Incluir `slogan` nos mapeamentos `dbToEmpresa` e `empresaToDb`.

#### 4. Adicionar campo "Slogan" no formulário `Configuracoes.tsx`
- Novo input entre "Nome Fantasia / Razão Social" e "CNPJ", com placeholder "Ex: A solução está no nome".

#### 5. Corrigir `generatePdf.ts`
- No header: usar `empresa.slogan` em vez do texto fixo "A solução está no nome". Se vazio, não exibir.
- No footer: usar `empresa.slogan` ou apenas o nome fantasia.

### Arquivos Alterados
- **Migration SQL**: nova coluna `slogan`
- **`src/lib/types.ts`**: adicionar `slogan` à interface
- **`src/hooks/useSupabaseData.ts`**: atualizar mappers
- **`src/components/Configuracoes.tsx`**: novo campo no form
- **`src/lib/generatePdf.ts`**: usar slogan dinâmico

