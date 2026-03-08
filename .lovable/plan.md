

## Root Cause

iOS Safari's `window.print()` on an iframe **always prints the parent page** (the app UI), not the iframe content. This is a known, unfixable iOS limitation. No amount of iframe tweaks will solve it.

## Solution: Dedicated Print Page Route

Create a new route `/imprimir` that renders **only** the A4 document HTML (no app shell, no nav, no bottom bar). The flow:

1. User clicks "Imprimir" → save orcamento → build template HTML → store in `sessionStorage` → navigate to `/imprimir`
2. `/imprimir` page reads HTML from sessionStorage, renders it full-screen, auto-calls `window.print()` after render
3. After printing (or on "Voltar" button click), navigates back to the app
4. If `window.print()` fails or is unavailable, auto-fallback to PDF generation

### Files to Change

**1. Create `src/pages/PrintPage.tsx`**
- Reads `sessionStorage.getItem('printHtml')`
- Renders it via `dangerouslySetInnerHTML` in a full-page white container
- On mount: waits 500ms, calls `window.print()`
- Shows a small floating "Voltar" button (hidden in print via `@media print { display:none }`)
- If print fails or sessionStorage is empty, fallback: generate PDF blob and redirect back

**2. Edit `src/App.tsx`**
- Add route: `<Route path="/imprimir" element={<PrintPage />} />`

**3. Edit `src/components/OrcamentoWizard.tsx`** (Print button, ~lines 479-495)
- Instead of calling `printViaIframe(templateHtml)`:
  - `sessionStorage.setItem('printHtml', templateHtml)`
  - `window.location.href = '/imprimir'` (full navigation, not React Router, to ensure clean page)

**4. Delete or deprecate `src/lib/printViaIframe.ts`**
- No longer needed since we use a dedicated page

### Why This Works on iPhone
- iOS Safari prints whatever is on the **current page**. By navigating to a page that contains ONLY the A4 document, `window.print()` prints exactly that document.
- No iframe, no popup, no `about:blank` — just a clean page with the proposal HTML.

### Fallback
- If `window.print()` is blocked or unavailable, the page auto-generates a PDF using `html2pdf.js` with the same template and offers download.

