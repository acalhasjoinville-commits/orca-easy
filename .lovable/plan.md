
## Plano: Sistema de Impressão com Detecção de Navegador

### Problema Atual

O código atual abre um Blob URL em nova aba, mas navegadores móveis (especialmente iOS Chrome/Firefox) ignoram ou distorcem os estilos `@media print` e `@page { size: A4 }`. A abordagem atual tenta forçar A4 via CSS, mas os navegadores móveis não-Safari não respeitam essas regras no diálogo de impressão.

### Solução: Duas Estratégias por Navegador

Implementar detecção de User Agent para aplicar a melhor estratégia:

**1. Safari (iOS/macOS) e Desktop**: Usa **iframe invisível** que clona o conteúdo e dispara `window.print()` direto
- Vantagem: não abre nova aba, experiência mais limpa
- O Safari respeita `@page { size: A4 }` corretamente

**2. iOS não-Safari (Chrome, Firefox, Edge)**: Abre **nova aba com HTML completo** + instrução visual
- Esses navegadores têm bugs conhecidos com impressão via iframe
- A nova aba mostra o documento formatado em A4 (190mm width fixo)
- Botão visível "Imprimir / Salvar PDF" no topo

### Alterações em `src/lib/generatePdf.ts`

```typescript
function detectBrowser() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isDesktop = !isIOS && !/Android/.test(ua);
  return { isIOS, isSafari, isDesktop, useIframe: isSafari || isDesktop };
}

export function generatePdf(...) {
  const { useIframe } = detectBrowser();
  
  // CSS base: forçar largura fixa 190mm (não depender de @page)
  const printStyles = `
    html, body { 
      width: 190mm !important; 
      margin: 0 auto !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page { size: A4 portrait; margin: 8mm; }
  `;
  
  if (useIframe) {
    // Estratégia iframe: cria iframe oculto, injeta HTML, print()
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;width:210mm;height:297mm;';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
    iframe.onload = () => {
      iframe.contentWindow.print();
      setTimeout(() => iframe.remove(), 2000);
    };
  } else {
    // Estratégia nova aba: Blob URL (atual)
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank') || (window.location.href = url);
  }
}
```

### CSS: Forçar 190mm em TODOS os cenários

Mover de `@media print` para o body principal com `!important`, garantindo que mesmo navegadores problemáticos renderizem em largura fixa A4:

```css
html { width: 210mm; }
body { width: 190mm; margin: 0 auto; }
.page-wrap { width: 190mm; }
```

### Detalhes Técnicos

| Navegador | Estratégia | Por quê |
|-----------|------------|---------|
| Safari iOS/Mac | iframe | Respeita @page corretamente |
| Chrome Desktop | iframe | Suporte completo a print CSS |
| Chrome iOS | nova aba | Bugs conhecidos com iframe.print() |
| Firefox iOS | nova aba | Usa WebKit limitado |

### Resultado Esperado

- **Safari/Desktop**: impressão direta sem abrir nova aba
- **iOS Chrome/Firefox**: abre preview A4 com botão de imprimir visível
- **Layout**: sempre 190mm de largura independente do device
