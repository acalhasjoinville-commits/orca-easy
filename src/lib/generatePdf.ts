import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Orcamento, MinhaEmpresa, Cliente } from './types';

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PAGE_H = 297;
const PAGE_W = 210;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_ZONE = 25;

function drawFooter(doc: jsPDF) {
  const footerY = PAGE_H - 10;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, footerY - 4, PAGE_W - MARGIN, footerY - 4);
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.text('Documento gerado via OrçaCalhas — A solução está no nome', PAGE_W / 2, footerY, { align: 'center' });
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - FOOTER_ZONE) {
    doc.addPage();
    drawFooter(doc);
    return MARGIN + 5;
  }
  return y;
}

export function generatePdf(orcamento: Orcamento, cliente: Cliente | undefined, empresa: MinhaEmpresa | null) {
  const doc = new jsPDF('p', 'mm', 'a4');

  const corPrimaria = empresa?.corPrimaria || '#0B1B32';
  const corDestaque = empresa?.corDestaque || '#F57C00';
  const rgbP = hexToRgb(corPrimaria);
  const rgbD = hexToRgb(corDestaque);

  let y = 0;

  // ═══════════════════════════════════════════
  // HEADER — 42mm tall bar
  // ═══════════════════════════════════════════
  const headerH = 42;
  doc.setFillColor(...rgbP);
  doc.rect(0, 0, PAGE_W, headerH, 'F');

  if (empresa?.logoUrl) {
    try { doc.addImage(empresa.logoUrl, 'PNG', MARGIN, 5, 32, 32); } catch { /* skip */ }
  }

  const infoX = empresa?.logoUrl ? MARGIN + 38 : MARGIN;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa?.nomeFantasia || 'Minha Empresa', infoX, 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const lines: string[] = [];
  if (empresa?.cnpjCpf) lines.push(`CNPJ/CPF: ${empresa.cnpjCpf}`);
  if (empresa?.telefoneWhatsApp) lines.push(`WhatsApp: ${empresa.telefoneWhatsApp}`);
  if (empresa?.emailContato) lines.push(empresa.emailContato);
  const endParts = [empresa?.endereco, empresa?.numero, empresa?.bairro, empresa?.cidade, empresa?.estado].filter(Boolean);
  if (endParts.length) lines.push(endParts.join(', '));
  lines.forEach((l, i) => doc.text(l, infoX, 23 + i * 4.5));

  y = headerH + 6;

  // ═══════════════════════════════════════════
  // TITLE BANNER
  // ═══════════════════════════════════════════
  doc.setFillColor(...rgbP);
  doc.roundedRect(MARGIN, y, CONTENT_W, 11, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`PROPOSTA COMERCIAL  Nº ${orcamento.numeroOrcamento}`, PAGE_W / 2, y + 7.5, { align: 'center' });
  y += 15;

  // Date
  const dataFormatada = new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR');
  doc.setTextColor(140, 140, 140);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${dataFormatada}`, PAGE_W - MARGIN, y, { align: 'right' });

  // ═══════════════════════════════════════════
  // CLIENT CARD — light gray background
  // ═══════════════════════════════════════════
  const clienteName = cliente?.nomeRazaoSocial || orcamento.nomeCliente;
  const clienteDoc = cliente?.documento || '';
  const clienteWpp = cliente?.whatsapp || '';
  const clienteEnd = [cliente?.endereco, cliente?.numero, cliente?.bairro, cliente?.cidade].filter(Boolean).join(', ');

  const clientLines = [clienteName, clienteDoc, clienteWpp, clienteEnd].filter(Boolean);
  const cardH = 10 + clientLines.length * 5;

  doc.setFillColor(248, 249, 250);
  doc.roundedRect(MARGIN, y - 2, CONTENT_W, cardH, 2, 2, 'F');

  // Left accent bar
  doc.setFillColor(...rgbP);
  doc.rect(MARGIN, y - 2, 3, cardH, 'F');

  doc.setTextColor(...rgbP);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', MARGIN + 8, y + 4);
  y += 9;

  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);

  const drawField = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}: `, MARGIN + 8, y);
    const labelW = doc.getTextWidth(`${label}: `);
    doc.setFont('helvetica', 'normal');
    doc.text(value, MARGIN + 8 + labelW, y);
    y += 5;
  };

  drawField('Nome', clienteName);
  if (clienteDoc) drawField('CPF/CNPJ', clienteDoc);
  if (clienteWpp) drawField('WhatsApp', clienteWpp);
  if (clienteEnd) drawField('Endereço', clienteEnd);

  y += 6;

  // ═══════════════════════════════════════════
  // ESCOPO DO SERVIÇO — left border style
  // ═══════════════════════════════════════════
  if (orcamento.descricaoGeral) {
    y = ensureSpace(doc, y, 30);
    const escopoLines = doc.splitTextToSize(orcamento.descricaoGeral, CONTENT_W - 16);
    const escopoH = 12 + escopoLines.length * 4.2;

    doc.setFillColor(248, 249, 250);
    doc.roundedRect(MARGIN, y, CONTENT_W, escopoH, 2, 2, 'F');
    doc.setFillColor(...rgbP);
    doc.rect(MARGIN, y, 3, escopoH, 'F');

    doc.setTextColor(...rgbP);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ESCOPO DO SERVIÇO', MARGIN + 8, y + 6);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(escopoLines, MARGIN + 8, y + 13);
    y += escopoH + 6;
  }

  // ═══════════════════════════════════════════
  // SERVICES TABLE — striped theme
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 30);

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
    margin: { left: MARGIN, right: MARGIN },
    theme: 'striped',
    headStyles: {
      fillColor: rgbP,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [50, 50, 50],
      cellPadding: 3.5,
    },
    alternateRowStyles: {
      fillColor: [245, 246, 248],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 24 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ═══════════════════════════════════════════
  // TOTALS
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 40);

  const totalsX = PAGE_W - MARGIN - 90;

  // Subtotal
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX, y);
  doc.text(fmt(orcamento.valorVenda), PAGE_W - MARGIN, y, { align: 'right' });
  y += 6;

  // Discount
  if (orcamento.desconto > 0) {
    doc.text('Desconto:', totalsX, y);
    doc.setTextColor(200, 60, 60);
    doc.text(`- ${fmt(orcamento.desconto)}`, PAGE_W - MARGIN, y, { align: 'right' });
    y += 7;
  }

  // VALOR FINAL highlight box
  doc.setFillColor(...rgbD);
  doc.roundedRect(totalsX - 4, y - 5, 98, 18, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR FINAL:', totalsX + 2, y + 5);
  doc.setFontSize(16);
  doc.text(fmt(orcamento.valorFinal), PAGE_W - MARGIN - 3, y + 5, { align: 'right' });
  y += 28;

  // ═══════════════════════════════════════════
  // CONDIÇÕES E GARANTIA
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 50);

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 7;

  doc.setTextColor(...rgbP);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDIÇÕES E GARANTIA', MARGIN, y);
  y += 8;

  const drawCondition = (label: string, value: string, highlight = false) => {
    y = ensureSpace(doc, y, 14);
    doc.setFontSize(8.5);

    // Bullet
    if (highlight) {
      doc.setFillColor(...rgbD);
    } else {
      doc.setFillColor(...rgbP);
    }
    doc.circle(MARGIN + 3, y - 1.2, 1.2, 'F');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(highlight ? rgbD[0] : 80, highlight ? rgbD[1] : 80, highlight ? rgbD[2] : 80);
    doc.text(`${label}:`, MARGIN + 7, y);

    // Value
    const valX = MARGIN + 48;
    doc.setFont('helvetica', highlight ? 'bold' : 'normal');
    doc.setTextColor(60, 60, 60);
    const textLines = doc.splitTextToSize(value, CONTENT_W - 50);
    doc.text(textLines, valX, y);
    y += Math.max(6, textLines.length * 4.5);
  };

  if (orcamento.validade) drawCondition('Validade', orcamento.validade);
  if (orcamento.formasPagamento) drawCondition('Pagamento', orcamento.formasPagamento);
  if (orcamento.tempoGarantia) drawCondition('Garantia', orcamento.tempoGarantia, true);
  if (orcamento.garantia) drawCondition('Detalhes', orcamento.garantia);

  // ═══════════════════════════════════════════
  // SIGNATURES — dotted lines
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 45);
  y = Math.max(y + 15, 248);

  const sigWidth = (CONTENT_W - 30) / 2;
  const sigLeftX = MARGIN;
  const sigRightX = MARGIN + sigWidth + 30;

  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(sigLeftX, y, sigLeftX + sigWidth, y);
  doc.line(sigRightX, y, sigRightX + sigWidth, y);
  doc.setLineDashPattern([], 0);

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.text('Assinatura do Cliente', sigLeftX + sigWidth / 2, y + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(clienteName, sigLeftX + sigWidth / 2, y + 9, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('Assinatura do Responsável', sigRightX + sigWidth / 2, y + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(empresa?.nomeFantasia || '', sigRightX + sigWidth / 2, y + 9, { align: 'center' });

  // ═══════════════════════════════════════════
  // FOOTER on all pages
  // ═══════════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc);
  }

  // ═══════════════════════════════════════════
  // OUTPUT — direct download
  // ═══════════════════════════════════════════
  doc.save(`proposta-${orcamento.numeroOrcamento}.pdf`);
}
