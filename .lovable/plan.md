

## Plano: Redesenhar o PDF fiel ao modelo de referência

### Análise do modelo (imagem)

O layout da referência difere significativamente do PDF atual. Principais diferenças:

```text
ATUAL                              REFERÊNCIA
─────────────────────────────────  ─────────────────────────────────
Logo esquerda, info direita        Logo esquerda+slogan, badge laranja centro, logo direita
Barra laranja com contato          Sem barra laranja no topo
"ORDEM DE SERVIÇO"                 "PROPOSTA COMERCIAL / ORÇAMENTO"
Info row sem bordas                Info grid com células bordadas + ícones
Dados do Cliente em grid           "CLIENTE: Nome" e "ENDEREÇO: ..." inline
Tabela header laranja              Tabela header azul-escuro (cor primária)
Tabela sem coluna Item #           Tabela com coluna "Item" numerada
Footer simples (1 linha)           Footer robusto: slogan grande + dados + logo
```

### O Que Será Feito (arquivo único: `src/lib/generatePdf.ts`)

#### 1. Header
- Logo esquerda com slogan abaixo
- Badge laranja centralizado no topo: `#NÚMERO · DATA`
- Logo repetida no canto direito (menor)

#### 2. Título
- Trocar "ORDEM DE SERVIÇO" por "PROPOSTA COMERCIAL / ORÇAMENTO"

#### 3. Info Grid com bordas
- 4 colunas com bordas visíveis: Emissão, Validade, Garantia, Responsável
- Ícones de calendário/escudo simulados com texto (📅, ✅, 👤)

#### 4. Linha de contato com ícones
- Abaixo do grid: 📞 telefone | 📋 CNPJ | ✉ email
- Linha separada: 📍 endereço completo

#### 5. Dados do cliente inline
- `CLIENTE: Nome do Cliente`
- `ENDEREÇO: Rua..., nº X - Bairro - Cidade, UF`

#### 6. Tabela de serviços
- Header com **cor primária** (azul-escuro) em vez de laranja
- Colunas: Item | Descrição do Serviço | Quantidade/Metragem | Preço Unitário (Venda) | Total
- Coluna Item numerada (1, 2, 3...)
- TOTAL com valor destacado em laranja

#### 7. Seções Formas de Pagamento e Garantia
- Manter lado a lado ou sequencial conforme espaço

#### 8. Footer robusto (todas as páginas)
- Barra azul-escura (cor primária) mais alta (~25mm)
- Slogan em texto grande e bold
- Linha com CNPJ, WhatsApp, email
- Logo no canto inferior direito do footer

### Arquivo alterado
- **`src/lib/generatePdf.ts`** — reescrita completa da função `generatePdf` e `drawFooterBar`

