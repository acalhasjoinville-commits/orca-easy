import { Orcamento, MinhaEmpresa, Cliente } from './types';
import { buildProposalHtml, imageToDataUrl } from './printTemplate';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

export async function generatePdf(orcamento: Orcamento, cliente: Cliente | undefined, empresa: MinhaEmpresa | null) {
  const logoDataUrl = empresa?.logoUrl ? await imageToDataUrl(empresa.logoUrl) : undefined;
  const templateHtml = buildProposalHtml({ orcamento, cliente, empresa, logoDataUrl });
  await generatePdfFromHtml(templateHtml, orcamento.numeroOrcamento);
}

export async function generatePdfFromHtml(templateHtml: string, numeroOrcamento: number) {
  const container = document.createElement('div');
  const parser = new DOMParser();
  const doc = parser.parseFromString(templateHtml, 'text/html');

  const style = doc.querySelector('style');
  if (style) container.appendChild(style.cloneNode(true));
  Array.from(doc.body.children).forEach((child) => {
    container.appendChild(child.cloneNode(true));
  });

  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#fff;';
  document.body.appendChild(container);

  const filename = `Proposta_${String(numeroOrcamento).padStart(4, '0')}.pdf`;

  try {
    const pdfBlob = await (html2pdf() as any)
      .set({
        margin: [10, 10, 12, 10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, width: 794, scrollY: 0, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(container)
      .outputPdf('blob');

    const url = URL.createObjectURL(pdfBlob);
    const w = window.open(url, '_blank');
    if (!w) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  } catch {
    toast.error('Não foi possível gerar o PDF.');
  } finally {
    container.remove();
  }
}
