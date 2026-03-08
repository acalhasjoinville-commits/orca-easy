

## Plano: Novo layout de PDF usando todos os dados do sistema (exceto razaoSocial)

O PDF atual já está bem estruturado. Vou reescrever `generatePdf.ts` com um layout próprio, limpo e profissional, utilizando **todos** os campos disponíveis da empresa, cliente e orçamento — sem razaoSocial.

### Dados disponíveis que serão usados

**Empresa:** logoUrl, nomeFantasia, cnpjCpf, telefoneWhatsApp, emailContato, endereco, numero, bairro, cidade, estado, corPrimaria, corDestaque, slogan

**Cliente:** nomeRazaoSocial, documento, whatsapp, endereco, numero, bairro, cidade, cep

**Orçamento:** numeroOrcamento, dataCriacao, validade, tempoGarantia, descricaoGeral, itensServico, valorVenda, desconto, valorFinal, formasPagamento, garantia, status

### Layout proposto

```text
┌─────────────────────────────────────────────┐
│  [LOGO]  NOME FANTASIA          Proposta nº │
│          slogan (italic)        #0001       │
│                                 DD/MM/AAAA  │
├─────────────────────────────────────────────┤
│  ▌ Barra cor primária: telefone | email |   │
│    CNPJ | endereço completo                 │
├─────────────────────────────────────────────┤
│  DADOS DO CLIENTE                           │
│  Nome: xxx    CPF/CNPJ: xxx    Tel: xxx     │
│  Endereço: xxx, nº x, Bairro, Cidade - CEP  │
├─────────────────────────────────────────────┤
│  ┌──────────┬──────────┬──────────┐         │
│  │ Emissão  │ Validade │ Garantia │  (grid) │
│  └──────────┴──────────┴──────────┘         │
├─────────────────────────────────────────────┤
│  ▌ Descrição do Serviço (se houver)         │
│    texto...                                 │
├─────────────────────────────────────────────┤
│  ▌ Serviços                                 │
│  ┌────┬────────────┬─────┬────────┬────────┐│
│  │ #  │ Descrição  │ Qtd │ Unit.  │ Total  ││
│  ├────┼────────────┼─────┼────────┼────────┤│
│  │ 1  │ ...        │ ... │ ...    │ ...    ││
│  └────┴────────────┴─────┴────────┴────────┘│
│  ████████ TOTAL ████████████ R$ X.XXX,XX ████│
│         (subtotal + desconto se aplicável)   │
├─────────────────────────────────────────────┤
│  ▌ Formas de Pagamento   ▌ Garantia         │
│    – item 1                texto garantia   │
│    – item 2                                 │
├─────────────────────────────────────────────┤
│  _______________     _______________        │
│  Assin. Cliente      Assin. Técnico         │
├═════════════════════════════════════════════┤
│  FOOTER: cor primária                       │
│  Slogan (bold) | Nome Fantasia              │
│  CNPJ | Tel | Email | Endereço    [LOGO]    │
│  Pág X de Y                                 │
└─────────────────────────────────────────────┘
```

### Diferenças em relação ao atual

1. **Header simplificado** — logo + nome fantasia à esquerda, número da proposta à direita (sem badge laranja centralizado, mais limpo)
2. **Barra de contato** — faixa fina na cor primária com todos os dados da empresa em uma linha
3. **Dados do cliente** — seção com fundo cinza claro, incluindo **CEP** (campo que existe mas não era usado no PDF)
4. **Grid de metadados** — 3 colunas (emissão, validade, garantia) em vez de 4, sem "Responsável" redundante
5. **Footer com paginação** — "Página X de Y" adicionado
6. **Sem razaoSocial** — conforme solicitado

### Arquivo alterado
- `src/lib/generatePdf.ts` — reescrita completa

