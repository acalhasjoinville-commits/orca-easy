

## Plano: Simplificar para Blob URL + Nova Aba (Sempre)

### Problema
A estratégia atual com iframe não funciona em vários navegadores móveis. A detecção de navegador adiciona complexidade sem resolver o problema real.

### Solução
Remover toda a lógica de detecção de navegador e iframe. Usar **sempre** a estratégia simples: Blob URL → `window.open()`. Isso é o que funciona de forma mais confiável em todos os dispositivos.

O HTML já está correto com CSS A4 fixo (190mm width, `@page { size: A4 }`). O problema é apenas a forma de entrega (iframe quebrando).

### Alterações em `src/lib/generatePdf.ts`

1. **Remover** `detectBrowser()`, `printViaIframe()`, `printViaNewTab()`
2. **Simplificar** `generatePdf()` para apenas:
   ```typescript
   const blob = new Blob([html], { type: 'text/html' });
   const url = URL.createObjectURL(blob);
   const w = window.open(url, '_blank');
   if (!w) {
     window.location.href = url;
   }
   ```
3. O botão "Imprimir / Salvar PDF" já existe no HTML gerado e chama `window.print()` — isso continuará funcionando na nova aba

### Resultado
- Sem detecção de navegador, sem iframe
- Sempre abre nova aba com o documento A4 completo
- Botão flutuante visível para o usuário disparar impressão/salvamento
- Funciona em Safari, Chrome iOS, Desktop — todos os cenários

