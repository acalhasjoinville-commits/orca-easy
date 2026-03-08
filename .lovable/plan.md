

## Plano: Corrigir botão PDF que não funciona

### Problema

O `window.open('', '_blank')` está sendo **bloqueado pelo navegador** como popup. Em contextos de iframe (como o preview do Lovable) ou em celulares, popups são silenciosamente bloqueados — o botão clica mas nada acontece.

### Solução

Trocar `window.open` por um **iframe oculto** injetado na própria página. O fluxo:

1. Criar um `<iframe>` invisível no DOM
2. Escrever o HTML da proposta dentro dele
3. Chamar `iframe.contentWindow.print()` 
4. Remover o iframe após a impressão

Se o iframe também falhar (alguns mobile bloqueiam), usar **fallback**: navegar a própria janela com o HTML e adicionar um botão "Voltar".

### Alteração

**Arquivo:** `src/lib/generatePdf.ts` — substituir as linhas 462-466 (o bloco `window.open`) pela lógica de iframe com fallback:

```typescript
// Tenta via iframe oculto
const iframe = document.createElement('iframe');
iframe.style.position = 'fixed';
iframe.style.width = '0';
iframe.style.height = '0';
iframe.style.border = 'none';
document.body.appendChild(iframe);
const iframeDoc = iframe.contentWindow?.document;
if (iframeDoc) {
  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 1000);
  }, 500);
} else {
  // Fallback: abre em nova aba (ou navega)
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank') || (window.location.href = url);
}
```

