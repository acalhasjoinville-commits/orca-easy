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
const M = 15; // margin
const CW = PAGE_W - M * 2; // content width

function drawFooterBar(doc: jsPDF, empresa: MinhaEmpresa | null) {
  doc.setFillColor(50, 50, 50);
  doc.rect(0, PAGE_H - 14, PAGE_W, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const name = empresa?.nomeFantasia || 'OrçaCalhas';
  const footerText = empresa?.slogan ? `${name} — ${empresa.slogan}` : name;
  doc.text(footerText, PAGE_W / 2, PAGE_H - 6, { align: 'center' });
}

function ensureSpace(doc: jsPDF, y: number, needed: number, empresa: MinhaEmpresa | null): number {
  if (y + needed > PAGE_H - 20) {
    doc.addPage();
    drawFooterBar(doc, empresa);
    return M + 5;
  }
  return y;
}

export function generatePdf(orcamento: Orcamento, cliente: Cliente | undefined, empresa: MinhaEmpresa | null) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const corD = empresa?.corDestaque || '#F57C00';
  const rgbD = hexToRgb(corD);

  let y = 0;

  // ═══════════════════════════════════════════
  // HEADER — white bg, logo left, info right
  // ═══════════════════════════════════════════
  y = 10;

  if (empresa?.logoUrl) {
    try { doc.addImage(empresa.logoUrl, 'PNG', M, 6, 40, 25); } catch { /* skip */ }
  }

  // Company info — right aligned
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  const rightX = PAGE_W - M;
  let hy = 10;
  const endParts = [empresa?.endereco, empresa?.numero, empresa?.cidade, empresa?.estado].filter(Boolean);
  if (endParts.length) { doc.text(endParts.join(', '), rightX, hy, { align: 'right' }); hy += 4.5; }
  if (empresa?.cnpjCpf) { doc.text(`CNPJ: ${empresa.cnpjCpf}`, rightX, hy, { align: 'right' }); hy += 4.5; }
  if (empresa?.slogan) {
    doc.setTextColor(...rgbD);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(empresa.slogan, rightX, hy, { align: 'right' });
  }

  y = 34;

  // ═══════════════════════════════════════════
  // ORANGE CONTACT BAR
  // ═══════════════════════════════════════════
  doc.setFillColor(...rgbD);
  doc.rect(0, y, PAGE_W, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  const contactParts: string[] = [];
  if (empresa?.telefoneWhatsApp) contactParts.push(`📞 ${empresa.telefoneWhatsApp}`);
  if (empresa?.emailContato) contactParts.push(`✉ ${empresa.emailContato}`);
  doc.text(contactParts.join('     '), PAGE_W / 2, y + 6, { align: 'center' });
  y += 14;

  // ═══════════════════════════════════════════
  // TITLE: ORDEM DE SERVIÇO + #NUMBER
  // ═══════════════════════════════════════════
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDEM DE SERVIÇO', M, y + 5);

  // Number badge right
  doc.setTextColor(...rgbD);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const numStr = `#${String(orcamento.numeroOrcamento).padStart(4, '0')}`;
  doc.text(numStr, PAGE_W - M, y + 2, { align: 'right' });
  doc.setTextColor(140, 140, 140);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Orçamento', PAGE_W - M, y + 7, { align: 'right' });

  y += 14;

  // Thin separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(M, y, PAGE_W - M, y);
  y += 6;

  // ═══════════════════════════════════════════
  // INFO ROW: Emissão | Validade | Garantia | Responsável
  // ═══════════════════════════════════════════
  const colW = CW / 4;
  const dataFormatada = new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR');

  const infoItems = [
    { label: 'Emissão', value: dataFormatada },
    { label: 'Validade', value: orcamento.validade || '-' },
    { label: 'Garantia', value: orcamento.tempoGarantia || '-' },
    { label: 'Responsável', value: empresa?.nomeFantasia || '-' },
  ];

  infoItems.forEach((item, i) => {
    const x = M + i * colW;
    doc.setTextColor(140, 140, 140);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, x + 2, y);
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, x + 2, y + 5);
  });

  y += 12;

  // Separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(M, y, PAGE_W - M, y);
  y += 6;

  // ═══════════════════════════════════════════
  // DADOS DO CLIENTE — orange left border
  // ═══════════════════════════════════════════
  const clienteName = cliente?.nomeRazaoSocial || orcamento.nomeCliente;

  // Section title with orange bar
  doc.setFillColor(...rgbD);
  doc.rect(M, y - 2, 3, 7, 'F');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Cliente', M + 7, y + 3);
  y += 10;

  // Grid: left column (Nome, Telefone) | right column (CPF/CNPJ, Endereço)
  const halfW = CW / 2;
  const leftCol = M;
  const rightCol = M + halfW;

  // Row 1
  doc.setTextColor(140, 140, 140);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Nome', leftCol, y);
  doc.text('CPF/CNPJ', rightCol, y);
  y += 4.5;
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(clienteName, leftCol, y);
  doc.text(cliente?.documento || '-', rightCol, y);
  y += 7;

  // Row 2
  doc.setTextColor(140, 140, 140);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Telefone', leftCol, y);
  doc.text('Endereço', rightCol, y);
  y += 4.5;
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(cliente?.whatsapp || '-', leftCol, y);

  // Endereço can be multi-line
  doc.setFont('helvetica', 'bold');
  const enderecoFull = [cliente?.endereco, cliente?.numero].filter(Boolean).join(', nº ');
  doc.text(enderecoFull || '-', rightCol, y);
  y += 4.5;
  const bairroCidade = [
    cliente?.bairro ? `Bairro: ${cliente.bairro}` : null,
    [cliente?.cidade].filter(Boolean).join(' - '),
  ].filter(Boolean).join(' | ');
  if (bairroCidade) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(bairroCidade, rightCol, y);
    y += 5;
  }

  y += 5;

  // Separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(M, y, PAGE_W - M, y);
  y += 6;

  // ═══════════════════════════════════════════
  // DESCRIÇÃO DO SERVIÇO — orange left border
  // ═══════════════════════════════════════════
  if (orcamento.descricaoGeral) {
    y = ensureSpace(doc, y, 25, empresa);

    doc.setFillColor(...rgbD);
    doc.rect(M, y - 2, 3, 7, 'F');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Descrição do Serviço', M + 7, y + 3);
    y += 10;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(orcamento.descricaoGeral, CW - 5);
    doc.text(descLines, M, y);
    y += descLines.length * 4.5 + 5;

    // Separator
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(M, y, PAGE_W - M, y);
    y += 6;
  }

  // ═══════════════════════════════════════════
  // SERVIÇOS TABLE — orange header
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 30, empresa);

  // Section title
  doc.setFillColor(...rgbD);
  doc.rect(M, y - 2, 3, 7, 'F');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Serviços', M + 7, y + 3);
  y += 10;

  const tableHead = [['Serviço', 'Qtd', 'Valor Unit.', 'Subtotal']];
  const tableBody = orcamento.itensServico.map((item) => [
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
      fillColor: rgbD,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [50, 50, 50],
      cellPadding: 4,
      lineColor: [235, 235, 235],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 30, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      // Alternate row background
      if (data.section === 'body' && data.row.index % 2 === 1) {
        data.cell.styles.fillColor = [250, 250, 250];
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY;

  // TOTAL ROW — orange background
  doc.setFillColor(...rgbD);
  doc.rect(M, y, CW, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', M + 5, y + 8);

  // Show discount if any
  let totalText = fmt(orcamento.valorFinal);
  if (orcamento.desconto > 0) {
    // Show original + discount info above
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: ${fmt(orcamento.valorVenda)}  |  Desconto: -${fmt(orcamento.desconto)}`, PAGE_W - M - 5, y + 4, { align: 'right' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(totalText, PAGE_W - M - 5, y + 9, { align: 'right' });
  } else {
    doc.setFontSize(12);
    doc.text(totalText, PAGE_W - M - 5, y + 8, { align: 'right' });
  }

  y += 20;

  // ═══════════════════════════════════════════
  // PAGE 2: FORMAS DE PAGAMENTO
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 60, empresa);

  if (orcamento.formasPagamento || orcamento.garantia) {
    // Formas de Pagamento
    if (orcamento.formasPagamento) {
      doc.setFillColor(...rgbD);
      doc.rect(M, y - 2, 3, 7, 'F');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Formas de Pagamento', M + 7, y + 3);
      y += 10;

      // Parse payment text into bullet points
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

    // Garantia details box
    if (orcamento.garantia) {
      y = ensureSpace(doc, y, 25, empresa);

      doc.setFillColor(...rgbD);
      doc.rect(M, y - 2, 3, 7, 'F');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Garantia', M + 7, y + 3);
      y += 10;

      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const garLines = doc.splitTextToSize(orcamento.garantia, CW - 5);
      doc.text(garLines, M, y);
      y += garLines.length * 4.5 + 8;
    }
  }

  // ═══════════════════════════════════════════
  // SIGNATURES
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 35, empresa);
  y = Math.max(y + 10, PAGE_H - 55);

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
