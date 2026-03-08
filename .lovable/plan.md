

## Plano: Corrigir impressão que fecha rapidamente no celular

### Problema

O iframe é removido após 1 segundo (`setTimeout(() => iframe.remove(), 1000)`), o que no celular mata o diálogo de impressão antes do usuário interagir. Além disso, o HTML interno tem um `window.onload` com `window.print()` que pode conflitar com o `print()` externo.

### Solução

Trocar a abordagem de iframe oculto por **abrir uma nova aba com Blob URL** contendo o HTML completo. No celular, isso funciona melhor porque a aba persiste e o usuário controla quando fechar. O HTML já tem o botão "Imprimir / Salvar PDF" e o `window.onload` que dispara `window.print()` automaticamente.

### Alterações em `src/lib/generatePdf.ts`

Substituir o bloco do iframe (linhas 462-481) por:

```typescript
const blob = new Blob([html], { type: 'text/html' });
const url = URL.createObjectURL(blob);
const w = window.open(url, '_blank');
if (!w) {
  // Fallback: navega a própria janela
  window.location.href = url;
}
```

Também remover o `<script>window.onload` do HTML (linhas 454-457) — o auto-print pode ser indesejado no mobile pois o usuário quer ver o documento antes de imprimir. Manter apenas o botão visual "Imprimir / Salvar PDF".

