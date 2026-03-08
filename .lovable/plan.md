

## Análise: Dados no PDF vs Configuração da Empresa

### Problema encontrado

O PDF tem o texto **"OrçaCalhas"** hardcoded como fallback no rodapé (linha 23 do `generatePdf.ts`):

```typescript
const name = empresa?.nomeFantasia || 'OrçaCalhas';
```

Se o Nome Fantasia estiver vazio, aparece "OrçaCalhas" — um valor fixo que não vem da configuração da empresa.

### Comparação completa

| Dado usado no PDF | Existe na Config? | Observação |
|---|---|---|
| Logo | ✅ | Upload via Storage |
| Nome Fantasia | ✅ | — |
| CNPJ | ✅ | — |
| Slogan | ✅ | Adicionado agora |
| Telefone/WhatsApp | ✅ | — |
| E-mail | ✅ | — |
| Endereço/Número/Cidade/Estado | ✅ | — |
| Cor Destaque | ✅ | — |
| **"OrçaCalhas" (fallback)** | ❌ | **Hardcoded** |

### Correção

Remover o fallback "OrçaCalhas". Se `nomeFantasia` estiver vazio, simplesmente não exibir o texto no rodapé (ou exibir vazio). O nome deve vir **exclusivamente** da configuração da empresa.

**Arquivo:** `src/lib/generatePdf.ts` — linha 23, trocar `'OrçaCalhas'` por `''`.

