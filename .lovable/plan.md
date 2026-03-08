

## Plano: Trocar jsPDF por página HTML de impressão (window.print)

### Abordagem

Em vez de gerar PDF com jsPDF (que tem problemas de fonte/encoding), vamos criar uma **página HTML formatada** que abre em nova aba e dispara `window.print()`. O navegador/celular cuida da renderização — fontes, acentos, emojis, tudo funciona perfeitamente.

### O que muda

1. **Reescrever `src/lib/generatePdf.ts`** — a função `generatePdf()` vai:
   - Criar HTML com CSS inline (layout A4, cores da empresa, tabela de serviços)
   - Abrir `window.open()` com o HTML
   - Chamar `window.print()` automaticamente
   - Usar `@media print` para esconder botões e ajustar margens
   - Manter a mesma assinatura da função (sem quebrar o OrcamentoWizard)

2. **Remover dependências `jspdf` e `jspdf-autotable`** do package.json (ficam desnecessárias)

### Layout HTML (mesmo conteúdo do plano anterior, agora em HTML/CSS)

```text
┌─────────────────────────────────────────────┐
│  [LOGO]  NOME FANTASIA       Proposta #0001 │
│          slogan               DD/MM/AAAA    │
├─────────────────────────────────────────────┤
│  DADOS DO CLIENTE                           │
│  Nome | CPF/CNPJ | WhatsApp                │
│  Endereço completo com CEP                  │
├─────────────────────────────────────────────┤
│  Emissão | Validade | Garantia  (3 colunas) │
├─────────────────────────────────────────────┤
│  Escopo do Serviço (se houver)              │
├─────────────────────────────────────────────┤
│  Tabela: # | Descrição | Qtd | Unit | Total│
│  TOTAL destacado                            │
├─────────────────────────────────────────────┤
│  Formas de Pagamento | Garantia             │
├─────────────────────────────────────────────┤
│  ________ Assinatura    ________ Assinatura │
├─────────────────────────────────────────────┤
│  FOOTER: slogan + CNPJ + Tel + Email + End  │
└─────────────────────────────────────────────┘
```

### Vantagens

- Sem problemas de fonte/encoding — o navegador renderiza tudo nativamente
- Acentos, emojis, caracteres especiais funcionam perfeitamente
- O usuário pode salvar como PDF pelo menu de impressão do celular
- Layout responsivo com CSS `@page` para A4
- Zero dependências externas

### Arquivos alterados
- **`src/lib/generatePdf.ts`** — reescrita completa (HTML + CSS + window.print)
- **`package.json`** — remover `jspdf` e `jspdf-autotable`

