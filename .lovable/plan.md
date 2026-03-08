

# Fix: PDF Download on Mobile (iOS/Android)

## Problem
`<PDFDownloadLink>` uses declarative blob download which fails on iOS Safari and many Android browsers due to blob URL restrictions.

## Solution
Replace `<PDFDownloadLink>` with a manual approach using the `pdf()` function from `@react-pdf/renderer` to generate the blob programmatically, then open it in a new tab via `window.open()`.

## Changes

### Edit `src/components/PDFDownloadButton.tsx`
Replace the entire component:

- Remove `PDFDownloadLink` import, use `pdf` from `@react-pdf/renderer` instead
- Add `generating` state to track async PDF generation
- Create `handleDownload` async function:
  1. Set `generating = true`
  2. Use `setTimeout(0)` to yield to UI thread (shows loading state)
  3. Call `pdf(<OrcamentoPDF ... />).toBlob()`
  4. Create object URL from blob
  5. **iOS detection**: If iOS/Safari, use `window.open(url, '_blank')` to open PDF in new tab (most reliable on Apple devices)
  6. **Other browsers**: Create hidden `<a>` element with `download` attribute, click it programmatically, then revoke URL
  7. Set `generating = false`
  8. Wrap in try/catch with toast error
- Render a plain `<Button>` with `onClick={handleDownload}` instead of wrapping in `PDFDownloadLink`
- Show `<Loader2>` spinner + "Gerando..." text while `generating` is true
- Disable button while generating to prevent double-clicks

### Key iOS compatibility detail
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
if (isIOS) {
  window.open(url, '_blank');
} else {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
```

No changes needed to `OrcamentoPDF.tsx`, `Dashboard.tsx`, or `OrcamentoWizard.tsx` — only the button component changes.

