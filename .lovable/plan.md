

## Plano: PDF Direto + Autoescala iOS + Quebra de Linha

### Problema
- A impressão via `window.print()` não funciona bem no iOS (fica pequeno, precisa 150%)
- Sem controle real sobre margens e escala
- Quebras de linha inconsistentes

### Solução: Gerar PDF real com html2pdf.js

Usar a biblioteca **html2pdf.js** (wrapper de jsPDF + html2canvas) para gerar um arquivo PDF real diretamente no navegador, sem depender do diálogo de impressão. O usuário recebe um download direto do PDF.

### Dependência nova
- `html2pdf.js` (via CDN no HTML gerado, ou instalação npm)

### Alterações

**1. `src/lib/generatePdf.ts` - Reescrever completamente**

- Manter toda a lógica de montagem do HTML (buildHtml) como está
- Remover o botão "Imprimir" e o script `doPrint()`
- Criar um elemento DOM temporário invisível com o HTML
- Usar html2pdf para renderizar esse DOM em PDF A4
- Disparar download automático do arquivo `.pdf`
- CSS: sem `@media print`, sem `@page` - tudo controlado pela lib

```typescript
import html2pdf from 'html2pdf.js';

export async function generatePdf(orcamento, cliente, empresa) {
  const html = buildHtml({...});
  
  // Criar container temporário
  const container = document.createElement('div');
  container.innerHTML = html; // só o conteúdo do body
  container.style.width = '210mm';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  document.body.appendChild(container);
  
  // Gerar PDF
  await html2pdf().set({
    margin: 0, // sem margem
    filename: `Proposta_${orcamento.numeroOrcamento}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, width: 794 }, // 210mm em px
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(container).save();
  
  container.remove();
}
```

**2. CSS do HTML gerado - Ajustes**

- Remover `@media print` e `@media screen` (não são mais necessários)
- Forçar `width: 210mm` no body sem margem (`margin: 0`)
- Área útil `.page-wrap`: `width: 100%; padding: 8mm 10mm`
- Quebra de linha:
  - `word-break: break-word` em células de texto
  - `white-space: nowrap` em valores monetários e documentos
  - `overflow: hidden; text-overflow: ellipsis` em campos de nome (max 2 linhas)
  - `.desc-text, .pay-line`: `white-space: pre-wrap` para multilinha livre

**3. Quebra de página**
- `page-break-inside: avoid` nas seções (client-box, signatures, footer)
- html2pdf lida com paginação automática

### Resultado
- Botão PDF gera download direto `.pdf` no celular e desktop
- Sem diálogo de impressão, sem zoom manual
- Layout 210mm real, sem margem
- Funciona identicamente em iOS Safari, Chrome, Android

