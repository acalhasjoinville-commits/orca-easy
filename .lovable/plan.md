

## Plano: Corrigir problemas do PDF

### Problemas identificados no PDF gerado

1. **Dados da empresa repetidos** — CNPJ, telefone, email e endereço aparecem **duas vezes**: na barra de contato do header (linha 150-166) E no footer (linhas 50-67). Redundante.

2. **Emojis quebrados** — Os ícones 📞, ✉, 📍, 📅, ✅ não são suportados pelo jsPDF (usa fonte Helvetica). Aparecem como caracteres ilegíveis (`Ø=ÜÞ`).

3. **Barra de contato lotada** — Telefone + email + CNPJ + endereço completo em uma única linha de 7pt fica apertado e transborda.

### Correções

**Arquivo:** `src/lib/generatePdf.ts`

1. **Remover a barra de contato do header** (linhas 147-168) — os dados da empresa já estão no footer. Sem repetição.

2. **Substituir todos os emojis por texto simples** no grid de metadados:
   - `📅 Emissão` → `Emissão`
   - `📅 Validade` → `Validade`
   - `✅ Garantia` → `Garantia`

3. **Footer permanece** como única fonte dos dados de contato da empresa (CNPJ, tel, email, endereço, logo, slogan, paginação).

4. **Ajustar Y** após remoção da barra — o conteúdo do cliente sobe ~14mm, aproveitando melhor o espaço.

