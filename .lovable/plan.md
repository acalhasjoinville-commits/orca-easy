

## Plano: Correções na Configuração da Empresa

### Problemas Identificados

1. **Tab padrão errada**: O componente `Configuracoes` inicia com `tab = 'motor1'` (linha 184), mas a aba "Empresa" é a primeira visualmente. O usuário precisa clicar manualmente para chegar nela.

2. **Logo não persiste**: O upload de logo converte para base64 (Data URL), que pode gerar strings enormes (>1MB). O campo `logo_url` na tabela `empresa` é do tipo `text`, mas o Supabase tem limites de tamanho no payload REST. A logo deveria ser salva no **Storage** do backend e o campo armazenar apenas a URL pública.

3. **Bug na mutação `saveEmpresa`**: A mutation usa `query.data` do closure para decidir entre `insert` e `update`. Se o query for invalidado e refetched entre a leitura e a escrita, o `_dbId` pode se perder. Isso pode causar tentativas duplicadas de insert. Solução: buscar o registro existente diretamente na mutação.

4. **Formulário não usa `useEffect` para sincronizar**: A lógica de inicialização (linhas 27-33) usa `if (!initialized && ...)` no corpo do render em vez de `useEffect`, o que pode causar re-renders desnecessários e inconsistências.

---

### O Que Será Feito

#### 1. Tab padrão como "empresa"
- Alterar o `useState` de `tab` para iniciar em `'empresa'` no `Configuracoes`.

#### 2. Upload de logo via Storage
- Criar um bucket `logos` no Storage do backend.
- No upload, enviar o arquivo ao bucket e salvar a URL pública no campo `logo_url`.
- Remover a conversão base64, usando o file diretamente.

#### 3. Corrigir lógica de save da empresa
- Na `mutationFn`, fazer um `select` direto para verificar se já existe um registro antes de decidir entre `upsert`/`insert`.
- Usar `upsert` para simplificar e evitar race conditions.

#### 4. Sincronização com useEffect
- Trocar a lógica imperativa de inicialização do form por `useEffect` que observa `existing` e `isLoading`.

---

### Arquivos Alterados

- **`src/hooks/useSupabaseData.ts`**: Corrigir `saveEmpresa` para usar `upsert` e upload de logo via Storage.
- **`src/components/Configuracoes.tsx`**: Tab padrão `'empresa'`, `useEffect` para sync do form, upload de logo via Storage.

