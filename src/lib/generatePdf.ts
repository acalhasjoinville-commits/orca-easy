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
const M = 15;
const CW = PAGE_W - M * 2;

function drawFooterBar(doc: jsPDF, empresa: MinhaEmpresa | null) {
  const corP = empresa?.corPrimaria || '#1B2A4A';
  const rgbP = hexToRgb(corP);
  const footerH = 28;
  const footerY = PAGE_H - footerH;

  // Dark primary bar
  doc.setFillColor(...rgbP);
  doc.rect(0, footerY, PAGE_W, footerH, 'F');

  // Slogan large
  const slogan = empresa?.slogan || '';
  if (slogan) {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(slogan, M, footerY + 10);
  }

  // Contact line
  const contactParts: string[] = [];
  if (empresa?.cnpjCpf) contactParts.push(`CNPJ: ${empresa.cnpjCpf}`);
  if (empresa?.telefoneWhatsApp) contactParts.push(empresa.telefoneWhatsApp);
  if (empresa?.emailContato) contactParts.push(empresa.emailContato);

  if (contactParts.length) {
    doc.setTextColor(200, 210, 230);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(contactParts.join('   |   '), M, footerY + 17);
  }

  // Address line
  const addrParts = [empresa?.endereco, empresa?.numero ? `nº ${empresa.numero}` : null, empresa?.bairro, empresa?.cidade, empresa?.estado].filter(Boolean);
  if (addrParts.length) {
    doc.setTextColor(180, 190, 210);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(addrParts.join(', '), M, footerY + 22);
  }

  // Logo right side of footer
  if (empresa?.logoUrl) {
    try { doc.addImage(empresa.logoUrl, 'PNG', PAGE_W - M - 25, footerY + 5, 20, 18); } catch { /* skip */ }
  }
}

function ensureSpace(doc: jsPDF, y: number, needed: number, empresa: MinhaEmpresa | null): number {
  if (y + needed > PAGE_H - 35) {
    doc.addPage();
    drawFooterBar(doc, empresa);
    return M + 5;
  }
  return y;
}

export function generatePdf(orcamento: Orcamento, cliente: Cliente | undefined, empresa: MinhaEmpresa | null) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const corD = empresa?.corDestaque || '#F57C00';
  const corP = empresa?.corPrimaria || '#1B2A4A';
  const rgbD = hexToRgb(corD);
  const rgbP = hexToRgb(corP);

  let y = 0;

  // ═══════════════════════════════════════════
  // HEADER — Logo left + slogan, Badge center, Logo right
  // ═══════════════════════════════════════════
  y = 8;

  // Logo left
  if (empresa?.logoUrl) {
    try { doc.addImage(empresa.logoUrl, 'PNG', M, y, 38, 22); } catch { /* skip */ }
  }

  // Slogan below logo
  if (empresa?.slogan) {
    doc.setTextColor(...rgbD);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.text(empresa.slogan, M, y + 27);
  }

  // Center badge — orange rounded rect with number + date
  const badgeW = 70;
  const badgeH = 14;
  const badgeX = (PAGE_W - badgeW) / 2;
  const badgeY = y + 4;
  doc.setFillColor(...rgbD);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const numStr = `#${String(orcamento.numeroOrcamento).padStart(4, '0')}`;
  const dataFormatada = new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR');
  doc.text(`${numStr}  ·  ${dataFormatada}`, PAGE_W / 2, badgeY + 9.5, { align: 'center' });

  // Company name right
  const nomeEmpresa = empresa?.nomeFantasia || '';
  if (nomeEmpresa) {
    doc.setTextColor(...rgbP);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(nomeEmpresa, PAGE_W - M, y + 8, { align: 'right' });
  }

  // Small info right
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const endParts = [empresa?.endereco, empresa?.numero, empresa?.cidade, empresa?.estado].filter(Boolean);
  if (endParts.length) {
    doc.text(endParts.join(', '), PAGE_W - M, y + 14, { align: 'right' });
  }

  y = 38;

  // ═══════════════════════════════════════════
  // TITLE: PROPOSTA COMERCIAL / ORÇAMENTO
  // ═══════════════════════════════════════════
  doc.setFillColor(...rgbP);
  doc.rect(0, y, PAGE_W, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPOSTA COMERCIAL / ORÇAMENTO', PAGE_W / 2, y + 7, { align: 'center' });
  y += 14;

  // ═══════════════════════════════════════════
  // INFO GRID — 4 columns with borders
  // ═══════════════════════════════════════════
  const colW = CW / 4;
  const gridH = 14;

  const infoItems = [
    { icon: '📅', label: 'Emissão', value: dataFormatada },
    { icon: '📅', label: 'Validade', value: orcamento.validade || '-' },
    { icon: '✅', label: 'Garantia', value: orcamento.tempoGarantia || '-' },
    { icon: '👤', label: 'Responsável', value: empresa?.nomeFantasia || '-' },
  ];

  infoItems.forEach((item, i) => {
    const x = M + i * colW;
    // Cell border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(x, y, colW, gridH);

    // Icon + label
    doc.setTextColor(140, 140, 140);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.icon} ${item.label}`, x + 3, y + 5);

    // Value
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, x + 3, y + 11);
  });

  y += gridH + 4;

  // ═══════════════════════════════════════════
  // CONTACT LINE with icons
  // ═══════════════════════════════════════════
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');

  const contactItems: string[] = [];
  if (empresa?.telefoneWhatsApp) contactItems.push(`📞 ${empresa.telefoneWhatsApp}`);
  if (empresa?.cnpjCpf) contactItems.push(`📋 CNPJ: ${empresa.cnpjCpf}`);
  if (empresa?.emailContato) contactItems.push(`✉ ${empresa.emailContato}`);

  if (contactItems.length) {
    doc.text(contactItems.join('     |     '), M, y);
    y += 4;
  }

  const addrFull = [empresa?.endereco, empresa?.numero ? `nº ${empresa.numero}` : null, empresa?.bairro, empresa?.cidade, empresa?.estado].filter(Boolean);
  if (addrFull.length) {
    doc.text(`📍 ${addrFull.join(', ')}`, M, y);
    y += 4;
  }

  y += 3;

  // Separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(M, y, PAGE_W - M, y);
  y += 5;

  // ═══════════════════════════════════════════
  // CLIENTE — inline style
  // ═══════════════════════════════════════════
  const clienteName = cliente?.nomeRazaoSocial || orcamento.nomeCliente;

  doc.setTextColor(...rgbP);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE: ', M, y);
  const clienteLabelW = doc.getTextWidth('CLIENTE: ');
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(clienteName, M + clienteLabelW, y);
  y += 5;

  // Documento
  if (cliente?.documento) {
    doc.setTextColor(...rgbP);
    doc.setFont('helvetica', 'bold');
    doc.text('CPF/CNPJ: ', M, y);
    const docLabelW = doc.getTextWidth('CPF/CNPJ: ');
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(cliente.documento, M + docLabelW, y);

    // Telefone on same line
    if (cliente?.whatsapp) {
      const midX = PAGE_W / 2;
      doc.setTextColor(...rgbP);
      doc.setFont('helvetica', 'bold');
      doc.text('TEL: ', midX, y);
      const telLabelW = doc.getTextWidth('TEL: ');
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      doc.text(cliente.whatsapp, midX + telLabelW, y);
    }
    y += 5;
  }

  // Endereço
  const endCliente = [cliente?.endereco, cliente?.numero ? `nº ${cliente.numero}` : null, cliente?.bairro, cliente?.cidade].filter(Boolean).join(', ');
  if (endCliente) {
    doc.setTextColor(...rgbP);
    doc.setFont('helvetica', 'bold');
    doc.text('ENDEREÇO: ', M, y);
    const endLabelW = doc.getTextWidth('ENDEREÇO: ');
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(endCliente, M + endLabelW, y);
    y += 5;
  }

  y += 3;

  // ═══════════════════════════════════════════
  // DESCRIÇÃO DO SERVIÇO
  // ═══════════════════════════════════════════
  if (orcamento.descricaoGeral) {
    y = ensureSpace(doc, y, 25, empresa);

    doc.setFillColor(...rgbP);
    doc.rect(M, y - 1, 3, 6, 'F');
    doc.setTextColor(...rgbP);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Descrição do Serviço', M + 6, y + 3);
    y += 9;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(orcamento.descricaoGeral, CW - 5);
    doc.text(descLines, M, y);
    y += descLines.length * 4.5 + 5;

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(M, y, PAGE_W - M, y);
    y += 5;
  }

  // ═══════════════════════════════════════════
  // TABELA DE SERVIÇOS — header azul-escuro (cor primária)
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 30, empresa);

  doc.setFillColor(...rgbP);
  doc.rect(M, y - 1, 3, 6, 'F');
  doc.setTextColor(...rgbP);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Serviços', M + 6, y + 3);
  y += 9;

  const tableHead = [['Item', 'Descrição do Serviço', 'Qtd/Metragem', 'Preço Unit.', 'Total']];
  const tableBody = orcamento.itensServico.map((item, idx) => [
    String(idx + 1),
    item.nomeServico,
    String(item.metragem),
    fmt(item.metragem > 0 ? item.valorVenda / item.metragem : 0),
    fmt(item.valorVenda),
  ]);

  autoTable(doc, {
    startY: y,
    head: tableHead,
    body: tableBody,
    margin: { left: M, right: M },
    theme: 'plain',
    headStyles: {
      fillColor: rgbP,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [50, 50, 50],
      cellPadding: 4,
      lineColor: [230, 230, 230],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 28 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index % 2 === 1) {
        data.cell.styles.fillColor = [248, 248, 248];
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY;

  // TOTAL ROW — orange
  doc.setFillColor(...rgbD);
  doc.rect(M, y, CW, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', M + 5, y + 8);

  let totalText = fmt(orcamento.valorFinal);
  if (orcamento.desconto > 0) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: ${fmt(orcamento.valorVenda)}  |  Desconto: -${fmt(orcamento.desconto)}`, PAGE_W - M - 5, y + 4, { align: 'right' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(totalText, PAGE_W - M - 5, y + 10, { align: 'right' });
  } else {
    doc.setFontSize(13);
    doc.text(totalText, PAGE_W - M - 5, y + 8, { align: 'right' });
  }

  y += 20;

  // ═══════════════════════════════════════════
  // FORMAS DE PAGAMENTO & GARANTIA
  // ═══════════════════════════════════════════
  if (orcamento.formasPagamento || orcamento.garantia) {
    y = ensureSpace(doc, y, 40, empresa);

    if (orcamento.formasPagamento) {
      doc.setFillColor(...rgbP);
      doc.rect(M, y - 1, 3, 6, 'F');
      doc.setTextColor(...rgbP);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Formas de Pagamento', M + 6, y + 3);
      y += 9;

      const payLines = orcamento.formasPagamento.split(/[.\n]/).filter(l => l.trim());
      payLines.forEach(line => {
        y = ensureSpace(doc, y, 8, empresa);
        doc.setTextColor(...rgbD);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('–', M + 2, y);
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        const wrappedLines = doc.splitTextToSize(line.trim(), CW - 12);
        doc.text(wrappedLines, M + 8, y);
        y += wrappedLines.length * 4.5 + 2;
      });
      y += 5;
    }

    if (orcamento.garantia) {
      y = ensureSpace(doc, y, 25, empresa);

      doc.setFillColor(...rgbP);
      doc.rect(M, y - 1, 3, 6, 'F');
      doc.setTextColor(...rgbP);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Garantia', M + 6, y + 3);
      y += 9;

      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const garLines = doc.splitTextToSize(orcamento.garantia, CW - 5);
      doc.text(garLines, M, y);
      y += garLines.length * 4.5 + 8;
    }
  }

  // ═══════════════════════════════════════════
  // ASSINATURAS
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 35, empresa);
  y = Math.max(y + 10, PAGE_H - 65);

  const sigW = (CW - 20) / 2;
  const sigL = M;
  const sigR = M + sigW + 20;

  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.5);
  doc.line(sigL, y, sigL + sigW, y);
  doc.line(sigR, y, sigR + sigW, y);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Assinatura do Cliente', sigL, y + 6);
  doc.text('Assinatura do Técnico', sigR, y + 6);

  // ═══════════════════════════════════════════
  // FOOTER on all pages
  // ═══════════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooterBar(doc, empresa);
  }

  // ═══════════════════════════════════════════
  // OUTPUT
  // ═══════════════════════════════════════════
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const newWindow = window.open(blobUrl, '_blank');
  if (!newWindow) {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `proposta-${orcamento.numeroOrcamento}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}
