export function printViaIframe(htmlCompleto: string) {
  let iframe = document.getElementById('print-iframe') as HTMLIFrameElement | null;
  if (iframe) iframe.remove();

  iframe = document.createElement('iframe');
  iframe.id = 'print-iframe';
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:210mm;height:297mm;border:none;opacity:0;pointer-events:none;background:#fff;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    iframe.remove();
    throw new Error('PRINT_IFRAME_UNAVAILABLE');
  }

  iframeDoc.open();
  iframeDoc.write(htmlCompleto);
  iframeDoc.close();

  let printed = false;
  const triggerPrint = () => {
    if (printed) return;
    printed = true;
    iframe?.contentWindow?.focus();
    iframe?.contentWindow?.print();
    setTimeout(() => iframe?.remove(), 3000);
  };

  if (iframe.contentWindow) {
    iframe.contentWindow.onload = () => setTimeout(triggerPrint, 500);
  }

  setTimeout(triggerPrint, 1500);
}
