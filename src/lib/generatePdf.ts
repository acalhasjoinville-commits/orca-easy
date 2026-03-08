import { Orcamento, MinhaEmpresa, Cliente } from './types';
import { buildProposalHtml, imageToDataUrl } from './printTemplate';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

/**
 * Opens a new browser window with the proposal HTML and triggers print dialog.
 * Falls back to PDF download if popup is blocked.
 */
export async function openPrintWindow(orcamento: Orcamento, cliente: Cliente | undefined, empresa: MinhaEmpresa | null) {
  const logoDataUrl = empresa?.logoUrl ? await imageToDataUrl(empresa.logoUrl) : undefined;
  const html = buildProposalHtml({ orcamento, cliente, empresa, logoDataUrl });

  const win = window.open('', '_blank');
  if (!win) {
    toast.info('Popup bloqueado. Gerando PDF para download...');
    await downloadPdf(orcamento, cliente, empresa, logoDataUrl);
    return;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();

  // Wait for images to load, then print
  win.onload = () => {
    setTimeout(() => {
      win.print();
    }, 400);
  };
  // Fallback if onload already fired
  setTimeout(() => {
    try { win.print(); } catch { /* ignore */ }
  }, 1500);
}

/**
 * Generates a PDF blob from the proposal HTML and opens it in a new tab.
 * Falls back to <a>.click() download if popup is blocked.
 */
export async function generatePdf(orcamento: Orcamento, cliente: Cliente | undefined, empresa: MinhaEmpresa | null) {
  const logoDataUrl = empresa?.logoUrl ? await imageToDataUrl(empresa.logoUrl) : undefined;
  await downloadPdf(orcamento, cliente, empresa, logoDataUrl);
}

async function downloadPdf(orcamento: Orcamento, cliente: Cliente | undefined, empresa: MinhaEmpresa | null, logoDataUrl?: string) {
  const html = buildProposalHtml({ orcamento, cliente, empresa, logoDataUrl });

  // Extract body content for html2pdf (it needs DOM, not full doc)
  const container = document.createElement('div');
  // Parse just the body content
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  // Copy body children + styles
  const style = doc.querySelector('style');
  if (style) container.appendChild(style.cloneNode(true));
  Array.from(doc.body.children).forEach(child => {
    container.appendChild(child.cloneNode(true));
  });

  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#fff;';
  document.body.appendChild(container);

  const filename = `Proposta_${String(orcamento.numeroOrcamento).padStart(4, '0')}.pdf`;

  try {
    const pdfBlob = await (html2pdf() as any).set({
      margin: [10, 10, 12, 10], // top, left, bottom, right in mm
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, width: 794, scrollY: 0, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).from(container).outputPdf('blob');

    const url = URL.createObjectURL(pdfBlob);
    const w = window.open(url, '_blank');
    if (!w) {
      // Fallback: direct download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  } finally {
    container.remove();
  }
}
