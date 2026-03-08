import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Orcamento, MinhaEmpresa, Cliente } from './types';

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const pageH = 297;

function checkPage(doc: jsPDF, y: number, needed: number, margin: number): number {
  if (y + needed > pageH - 20) {
    doc.addPage();
    return margin;
  }
  return y;
}

export function generatePdf(orcamento: Orcamento, cliente: Cliente | undefined, empresa: MinhaEmpresa | null) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;

  const corPrimaria = empresa?.corPrimaria || '#0B1B32';
  const corDestaque = empresa?.corDestaque || '#F57C00';
  const rgbPrimaria = hexToRgb(corPrimaria);
  const rgbDestaque = hexToRgb(corDestaque);

  let y = 0;

  // ─── HEADER BAR ───
  doc.setFillColor(...rgbPrimaria);
  doc.rect(0, 0, pageW, 36, 'F');

  if (empresa?.logoUrl) {
    try { doc.addImage(empresa.logoUrl, 'PNG', margin, 4, 28, 28); } catch { /* */ }
  }

  const infoX = empresa?.logoUrl ? margin + 34 : margin;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa?.nomeFantasia || 'Minha Empresa', infoX, 13);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const companyLines: string[] = [];
  if (empresa?.cnpjCpf) companyLines.push(`CNPJ/CPF: ${empresa.cnpjCpf}`);
  if (empresa?.telefoneWhatsApp) companyLines.push(`WhatsApp: ${empresa.telefoneWhatsApp}`);
  if (empresa?.emailContato) companyLines.push(empresa.emailContato);
  const endParts = [empresa?.endereco, empresa?.numero, empresa?.bairro, empresa?.cidade, empresa?.estado].filter(Boolean);
  if (endParts.length) companyLines.push(endParts.join(', '));
  companyLines.forEach((line, i) => doc.text(line, infoX, 19 + i * 3.8));

  y = 42;

  // ─── TITLE BAR ───
  doc.setFillColor(...rgbPrimaria);
  doc.roundedRect(margin, y, contentW, 9, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`PROPOSTA COMERCIAL  Nº ${orcamento.numeroOrcamento}`, pageW / 2, y + 6.5, { align: 'center' });
  y += 14;

  // Date right-aligned
  const dataFormatada = new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR');
  doc.setTextColor(130, 130, 130);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${dataFormatada}`, pageW - margin, y, { align: 'right' });

  // ─── BLOCO 1: CLIENT INFO ───
  doc.setTextColor(...rgbPrimaria);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);

  const clienteName = cliente?.nomeRazaoSocial || orcamento.nomeCliente;
  doc.text(`Nome: ${clienteName}`, margin, y); y += 4;
  if (cliente?.documento) { doc.text(`CPF/CNPJ: ${cliente.documento}`, margin, y); y += 4; }
  if (cliente?.whatsapp) { doc.text(`WhatsApp: ${cliente.whatsapp}`, margin, y); y += 4; }
  const clienteEnd = [cliente?.endereco, cliente?.numero, cliente?.bairro, cliente?.cidade].filter(Boolean).join(', ');
  if (clienteEnd) { doc.text(`Endereço: ${clienteEnd}`, margin, y); y += 4; }

  // Thin separator
  y += 3;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  // ─── BLOCO 2: ESCOPO DO SERVIÇO ───
  if (orcamento.descricaoGeral) {
    doc.setFillColor(245, 247, 250);
    const escopoTextLines = doc.splitTextToSize(orcamento.descricaoGeral, contentW - 10);
    const escopoH = 8 + escopoTextLines.length * 4;
    doc.roundedRect(margin, y, contentW, escopoH, 2, 2, 'F');
    doc.setTextColor(...rgbPrimaria);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ESCOPO DO SERVIÇO', margin + 5, y + 5.5);
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(escopoTextLines, margin + 5, y + 11);
    y += escopoH + 5;
  }

  // ─── BLOCO 3: TABLE ───
  const tableHead = [['#', 'Descrição do Serviço', 'Medida', 'Preço Unit.', 'Total']];
  const tableBody = orcamento.itensServico.map((item, i) => [
    String(i + 1),
    item.nomeServico,
    `${item.metragem} m`,
    fmt(item.metragem > 0 ? item.valorVenda / item.metragem : 0),
    fmt(item.valorVenda),
  ]);

  autoTable(doc, {
    startY: y,
    head: tableHead,
    body: tableBody,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: rgbPrimaria,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50],
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 28 },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // ─── BLOCO 4: TOTALS ───
  y = checkPage(doc, y, 30, margin);

  const totalsX = pageW - margin - 82;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(totalsX, y, pageW - margin, y);
  y += 5;

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX, y);
  doc.text(fmt(orcamento.valorVenda), pageW - margin, y, { align: 'right' });
  y += 5;

  if (orcamento.desconto > 0) {
    doc.text('Desconto:', totalsX, y);
    doc.setTextColor(200, 50, 50);
    doc.text(`- ${fmt(orcamento.desconto)}`, pageW - margin, y, { align: 'right' });
    doc.setTextColor(80, 80, 80);
    y += 6;
  }

  // Valor Final highlight box
  doc.setFillColor(...rgbDestaque);
  doc.roundedRect(totalsX - 2, y - 4, 86, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR FINAL:', totalsX + 2, y + 5);
  doc.text(fmt(orcamento.valorFinal), pageW - margin - 2, y + 5, { align: 'right' });
  y += 22;

  // ─── CONDIÇÕES E GARANTIA ───
  y = checkPage(doc, y, 50, margin);

  doc.setDrawColor(...rgbPrimaria);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setTextColor(...rgbPrimaria);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDIÇÕES E GARANTIA', margin, y);
  y += 7;

  doc.setFontSize(8.5);

  const drawCondition = (label: string, value: string, highlight = false) => {
    y = checkPage(doc, y, 12, margin);
    if (highlight) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...rgbDestaque);
      doc.text(`${label}:`, margin + 2, y);
      doc.setFont('helvetica', 'bold');
      doc.text(value, margin + 42, y);
      doc.setTextColor(50, 50, 50);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(70, 70, 70);
      doc.text(`${label}:`, margin + 2, y);
      doc.setFont('helvetica', 'normal');
      const textLines = doc.splitTextToSize(value, contentW - 44);
      doc.text(textLines, margin + 42, y);
      y += Math.max(0, (textLines.length - 1) * 3.5);
    }
    y += 5;
  };

  if (orcamento.validade) drawCondition('Validade da Proposta', orcamento.validade);
  if (orcamento.formasPagamento) drawCondition('Formas de Pagamento', orcamento.formasPagamento);
  if (orcamento.tempoGarantia) drawCondition('Garantia', orcamento.tempoGarantia, true);
  if (orcamento.garantia) drawCondition('Detalhes da Garantia', orcamento.garantia);

  // ─── ASSINATURAS ───
  y = checkPage(doc, y, 40, margin);
  y = Math.max(y + 10, 245);

  const sigWidth = (contentW - 20) / 2;
  const sigLeftX = margin;
  const sigRightX = margin + sigWidth + 20;

  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.4);
  doc.line(sigLeftX, y, sigLeftX + sigWidth, y);
  doc.line(sigRightX, y, sigRightX + sigWidth, y);

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Assinatura do Cliente', sigLeftX + sigWidth / 2, y + 5, { align: 'center' });
  doc.text(clienteName, sigLeftX + sigWidth / 2, y + 9, { align: 'center' });

  doc.text('Assinatura do Responsável', sigRightX + sigWidth / 2, y + 5, { align: 'center' });
  doc.text(empresa?.nomeFantasia || '', sigRightX + sigWidth / 2, y + 9, { align: 'center' });

  // ─── FOOTER BRANDING ───
  const footerY = pageH - 8;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 3, pageW - margin, footerY - 3);
  doc.setTextColor(170, 170, 170);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.text('Orçamento gerado via OrçaCalhas — A solução está no nome', pageW / 2, footerY, { align: 'center' });

  // ─── OUTPUT ───
  const pdfDataUri = doc.output('datauristring');
  const newWindow = window.open();
  if (newWindow) {
    newWindow.document.write(
      `<html><head><title>Proposta ${orcamento.numeroOrcamento}</title></head>` +
      `<body style="margin:0"><iframe src="${pdfDataUri}" style="border:none;width:100%;height:100vh"></iframe></body></html>`
    );
    newWindow.document.close();
  } else {
    const link = document.createElement('a');
    link.href = pdfDataUri;
    link.download = `proposta-${orcamento.numeroOrcamento}.pdf`;
    link.click();
  }
}
