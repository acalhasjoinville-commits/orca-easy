

## Análise das Divergências

Após analisar os dois componentes PDF, identifiquei:

1. **Cabeçalho da OS incompleto**: Falta a linha de endereço da empresa (presente no Orçamento, linha 110, ausente na OS).
2. **Telefone no rodapé**: Ambos usam a variável `telefone` do banco, então o erro do telefone errado no rodapé da OS provavelmente já foi corrigido na última edição. Mas vou garantir que não haja nenhum texto fixo.
3. **Termo de recebimento**: Já está implementado corretamente — vem da prop `termoRecebimento` que é carregada da tabela `politicas_comerciais` via `OSDownloadButton`.

## Plano de Correções

### 1. OrdemServicoPDF.tsx — Adicionar endereço da empresa no cabeçalho

Adicionar a construção da variável `enderecoEmpresa` (igual ao Orçamento) e renderizar no cabeçalho após a linha de telefone/email:

```typescript
const enderecoEmpresa = [empresa?.endereco, empresa?.numero, empresa?.bairro, empresa?.cidade, empresa?.estado]
  .filter(Boolean).join(', ');
```

E no JSX do header, após `{[telefone, email].filter(Boolean).join(' · ')}`, adicionar:
```tsx
{enderecoEmpresa ? <Text style={s.contactLine}>{enderecoEmpresa}</Text> : null}
```

### 2. Confirmação de centralização de dados

Ambos os componentes já usam exclusivamente as variáveis `telefone`, `email`, `nomeEmpresa`, `slogan` extraídas das props `empresa` (que vem da tabela `empresa` do banco). Não há textos fixos de contato no código. A correção do cabeçalho da OS é a única divergência restante.

### 3. Sem alterações no OrcamentoPDF.tsx

O Orçamento já está correto — cabeçalho completo com endereço, rodapé dinâmico, preços e condições comerciais presentes.

### 4. Sem alterações na lógica do Termo de Recebimento

O `OSDownloadButton` já busca `termoRecebimentoOs` da tabela `politicas_comerciais` e passa como prop. O canhoto de entrega já está implementado com o título correto.

### Resumo

Uma única edição em `OrdemServicoPDF.tsx`: adicionar a variável `enderecoEmpresa` e renderizá-la no cabeçalho, unificando-o com o do Orçamento.

