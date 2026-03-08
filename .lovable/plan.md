

## Plano: Corrigir download do PDF (html2pdf.js)

### Problema
O `html2pdf.js` usa internamente `<a download>.click()` para disparar o download. Isso falha silenciosamente em iOS Safari e dentro de iframes (como o preview do Lovable) -- o código roda sem erro, o toast de sucesso aparece, mas nenhum arquivo é baixado.

### Solução
Em vez de usar `.save()` (que depende de `<a>.click()`), usar `.outputPdf('blob')` para obter o blob do PDF e então abrir em nova aba com `window.open()`. Isso funciona em todos os navegadores incluindo iOS Safari.

### Alteração em `src/lib/generatePdf.ts`

Substituir o bloco `.save()` por:

```typescript
const pdfBlob = await (html2pdf() as any).set({
  margin: 0,
  filename: `Proposta_${String(orcamento.numeroOrcamento).padStart(4, '0')}.pdf`,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, width: 794, scrollY: 0 },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
}).from(container).outputPdf('blob');

// Abrir PDF em nova aba (funciona em iOS Safari e todos os browsers)
const url = URL.createObjectURL(pdfBlob);
const w = window.open(url, '_blank');
if (!w) {
  // Fallback: forçar navegação direta
  const a = document.createElement('a');
  a.href = url;
  a.download = `Proposta_${String(orcamento.numeroOrcamento).padStart(4, '0')}.pdf`;
  a.click();
}
```

Isso gera o PDF real (arquivo .pdf) e abre numa nova aba onde o usuário pode visualizar e salvar, sem depender de `<a>.click()` que falha silenciosamente.

