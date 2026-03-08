

# Plan: Restaurar Geração de PDF com @react-pdf/renderer

## Approach

Use `@react-pdf/renderer` to build the PDF entirely in React components (no HTML-to-canvas, no iframe, no print dialog). This generates a real PDF blob client-side that works on **all devices including iPhone**. The `<PDFDownloadLink>` component provides a direct download button.

## Files to Create/Edit

### 1. Install dependency
- `@react-pdf/renderer` (replaces html2pdf.js entirely)

### 2. Create `src/components/OrcamentoPDF.tsx`
React-PDF document component using `@react-pdf/renderer` primitives (`Document`, `Page`, `View`, `Text`, `Image`, `StyleSheet`).

**Layout (A4 vertical, 210×297mm):**

```text
┌─────────────────────────────────────┐
│  [LOGO]  Nome Fantasia              │
│          Slogan                     │
│          Tel · Email                │
├─────────────────────────────────────┤
│  PROPOSTA COMERCIAL                 │
│  #1001 (laranja)  │  Data: dd/mm/aa│
├─────────────────────────────────────┤
│  CLIENTE                            │
│  Nome/Razão Social · CPF/CNPJ      │
│  Telefone · Endereço                │
├─────────────────────────────────────┤
│  ESCOPO DO SERVIÇO                  │
│  (descricaoGeral)                   │
├─────────────────────────────────────┤
│  TABELA DE SERVIÇOS                 │
│  # │ Descrição │ Medida │ V.Unit │ Total │
│  (cabeçalho cor_primaria, linhas alternadas)│
├─────────────────────────────────────┤
│  Subtotal / Desconto / TOTAL (laranja)│
├─────────────────────────────────────┤
│  CONDIÇÕES COMERCIAIS               │
│  Validade │ Pagamento │ Garantia    │
├─────────────────────────────────────┤
│  ___________    ___________         │
│  Assinatura     Assinatura          │
│  Cliente        Empresa             │
├─────────────────────────────────────┤
│  [mini-logo] Contato · Rodapé       │
└─────────────────────────────────────┘
```

**Props:** `{ orcamento: Orcamento, cliente?: Cliente, empresa?: MinhaEmpresa }`

**Key details:**
- Colors from `empresa.corPrimaria` and `empresa.corDestaque`
- PF/PJ dynamic labels (Nome/CPF vs Razão Social/CNPJ)
- Logo fetched as base64 DataURL for PDF embedding (fetch + blob + FileReader)
- Currency formatting pt-BR
- Table header with `corPrimaria` background, alternating row colors
- Valor Final highlighted with `corDestaque`
- Footer repeated on all pages via `fixed` positioning

### 3. Create `src/lib/fetchLogoBase64.ts`
Utility to convert a Supabase Storage URL to a base64 data URL for embedding in @react-pdf. Handles CORS by fetching through the Supabase client.

### 4. Edit `src/components/OrcamentoWizard.tsx`
- Import `PDFDownloadLink` from `@react-pdf/renderer` and `OrcamentoPDF`
- In the bottom bar (line ~469), add a PDF download button next to "Salvar":
  - First saves the orcamento, then shows the `PDFDownloadLink`
  - Styled with `corDestaque` (orange), FileDown icon
  - Uses `useClientes` to resolve the full client object for the PDF

### 5. Edit `src/components/Dashboard.tsx`
- Import `PDFDownloadLink` and `OrcamentoPDF`
- Add a download icon button on each orcamento card (next to edit/delete)
- Resolves `cliente` from `useClientes` by `o.clienteId`
- Uses `useEmpresa` (already available) for company data

## Why @react-pdf/renderer
- Generates a **real PDF file** (not screenshot-based)
- Works on **iOS Safari, Android, Desktop** — no print dialog needed
- No iframe/popup hacks
- Clean React component API
- Supports images, tables, custom fonts, page numbers

