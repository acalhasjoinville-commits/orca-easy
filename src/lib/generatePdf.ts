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
const FOOTER_H = 30;

function drawFooterBar(doc: jsPDF, empresa: MinhaEmpresa | null, pageNum: number, totalPages: number) {
  const corP = empresa?.corPrimaria || '#1B2A4A';
  const rgbP = hexToRgb(corP);
  const footerY = PAGE_H - FOOTER_H;

  doc.setFillColor(...rgbP);
  doc.rect(0, footerY, PAGE_W, FOOTER_H, 'F');

  // Slogan bold left
  const slogan = empresa?.slogan || '';
  if (slogan) {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(slogan, M, footerY + 9);
  }

  // Nome fantasia right of slogan
  const nome = empresa?.nomeFantasia || '';
  if (nome && slogan) {
    doc.setTextColor(200, 215, 240);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`— ${nome}`, M + doc.getTextWidth(slogan) + 4, footerY + 9, { baseline: 'alphabetic' });
  } else if (nome) {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(nome, M, footerY + 9);
  }

  // Contact line
  const parts: string[] = [];
  if (empresa?.cnpjCpf) parts.push(`CNPJ: ${empresa.cnpjCpf}`);
  if (empresa?.telefoneWhatsApp) parts.push(empresa.telefoneWhatsApp);
  if (empresa?.emailContato) parts.push(empresa.emailContato);
  if (parts.length) {
    doc.setTextColor(190, 200, 220);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(parts.join('   |   '), M, footerY + 16);
  }

  // Address line
  const addr = [empresa?.endereco, empresa?.numero ? `nº ${empresa.numero}` : null, empresa?.bairro, empresa?.cidade, empresa?.estado].filter(Boolean);
  if (addr.length) {
    doc.setTextColor(170, 180, 200);
    doc.setFontSize(6.5);
    doc.text(addr.join(', '), M, footerY + 21);
  }

  // Page number
  doc.setTextColor(150, 165, 190);
  doc.setFontSize(7);
  doc.text(`Página ${pageNum} de ${totalPages}`, PAGE_W - M, footerY + 25, { align: 'right' });

  // Logo right
  if (empresa?.logoUrl) {
    try { doc.addImage(empresa.logoUrl, 'PNG', PAGE_W - M - 22, footerY + 4, 18, 16); } catch { /* skip */ }
  }
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - FOOTER_H - 5) {
    doc.addPage();
    return M + 5;
  }
  return y;
}

export function generatePdf(orcamento: Orcamento, cliente: Cliente | undefined, empresa: MinhaEmpresa | null) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const corP = empresa?.corPrimaria || '#1B2A4A';
  const corD = empresa?.corDestaque || '#F57C00';
  const rgbP = hexToRgb(corP);
  const rgbD = hexToRgb(corD);

  let y = 0;
  const dataFormatada = new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR');

  // ═══════════════════════════════════════════
  // HEADER — Logo+Name left, Proposal # right
  // ═══════════════════════════════════════════
  y = 10;

  // Logo left
  let logoEndX = M;
  if (empresa?.logoUrl) {
    try {
      doc.addImage(empresa.logoUrl, 'PNG', M, y, 30, 18);
      logoEndX = M + 33;
    } catch { /* skip */ }
  }

  // Nome Fantasia
  const nomeEmpresa = empresa?.nomeFantasia || '';
  if (nomeEmpresa) {
    doc.setTextColor(...rgbP);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(nomeEmpresa, logoEndX, y + 7);
  }

  // Slogan
  if (empresa?.slogan) {
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(empresa.slogan, logoEndX, y + 13);
  }

  // Proposal number right
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Proposta nº', PAGE_W - M, y + 4, { align: 'right' });

  doc.setTextColor(...rgbD);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`#${String(orcamento.numeroOrcamento).padStart(4, '0')}`, PAGE_W - M, y + 12, { align: 'right' });

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(dataFormatada, PAGE_W - M, y + 17, { align: 'right' });

  y = 34;

  // ═══════════════════════════════════════════
  // CLIENT SECTION — light gray background
  // ═══════════════════════════════════════════
  const clienteName = cliente?.nomeRazaoSocial || orcamento.nomeCliente;
  const clienteDoc = cliente?.documento || '';
  const clienteTel = cliente?.whatsapp || '';
  const clienteEnd = [cliente?.endereco, cliente?.numero ? `nº ${cliente.numero}` : null, cliente?.bairro, cliente?.cidade].filter(Boolean).join(', ');
  const clienteCep = cliente?.cep || '';

  // Estimate height
  const clienteH = 22;
  doc.setFillColor(245, 245, 248);
  doc.roundedRect(M, y, CW, clienteH, 2, 2, 'F');

  // Section title
  doc.setTextColor(...rgbP);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', M + 4, y + 5);

  // Row 1: Nome | CPF/CNPJ | Tel
  let cy = y + 11;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...rgbP);
  doc.text('Nome: ', M + 4, cy);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(clienteName, M + 4 + doc.getTextWidth('Nome: '), cy);

  if (clienteDoc) {
    const docX = M + 90;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...rgbP);
    doc.text('CPF/CNPJ: ', docX, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(clienteDoc, docX + doc.getTextWidth('CPF/CNPJ: '), cy);
  }

  if (clienteTel) {
    const telX = M + 145;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...rgbP);
    doc.text('Tel: ', telX, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(clienteTel, telX + doc.getTextWidth('Tel: '), cy);
  }

  // Row 2: Endereço + CEP
  cy += 5;
  if (clienteEnd || clienteCep) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...rgbP);
    doc.text('Endereço: ', M + 4, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    let endText = clienteEnd;
    if (clienteCep) endText += (endText ? ` — CEP: ${clienteCep}` : `CEP: ${clienteCep}`);
    doc.text(endText, M + 4 + doc.getTextWidth('Endereço: '), cy);
  }

  y += clienteH + 5;

  // ═══════════════════════════════════════════
  // METADATA GRID — 3 columns
  // ═══════════════════════════════════════════
  const colW = CW / 3;
  const gridH = 13;
  const gridItems = [
    { label: 'Emissao', value: dataFormatada },
    { label: 'Validade', value: orcamento.validade || '—' },
    { label: 'Garantia', value: orcamento.tempoGarantia || '—' },
  ];

  gridItems.forEach((item, i) => {
    const x = M + i * colW;
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.rect(x, y, colW, gridH);

    doc.setTextColor(130, 130, 130);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, x + 3, y + 5);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, x + 3, y + 10.5);
  });

  y += gridH + 6;

  // ═══════════════════════════════════════════
  // DESCRIÇÃO DO SERVIÇO
  // ═══════════════════════════════════════════
  if (orcamento.descricaoGeral) {
    y = ensureSpace(doc, y, 25);

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
  // TABELA DE SERVIÇOS
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 30);

  doc.setFillColor(...rgbP);
  doc.rect(M, y - 1, 3, 6, 'F');
  doc.setTextColor(...rgbP);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Serviços', M + 6, y + 3);
  y += 9;

  const tableHead = [['#', 'Descrição do Serviço', 'Qtd/Metragem', 'Preço Unit.', 'Total']];
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
      0: { halign: 'center', cellWidth: 12, fontStyle: 'bold' },
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

  // TOTAL ROW
  doc.setFillColor(...rgbD);
  doc.rect(M, y, CW, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', M + 5, y + 8);

  if (orcamento.desconto > 0) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: ${fmt(orcamento.valorVenda)}  |  Desconto: -${fmt(orcamento.desconto)}`, PAGE_W - M - 5, y + 4, { align: 'right' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(fmt(orcamento.valorFinal), PAGE_W - M - 5, y + 10, { align: 'right' });
  } else {
    doc.setFontSize(13);
    doc.text(fmt(orcamento.valorFinal), PAGE_W - M - 5, y + 8, { align: 'right' });
  }

  y += 20;

  // ═══════════════════════════════════════════
  // FORMAS DE PAGAMENTO & GARANTIA
  // ═══════════════════════════════════════════
  if (orcamento.formasPagamento || orcamento.garantia) {
    y = ensureSpace(doc, y, 40);

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
        y = ensureSpace(doc, y, 8);
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
      y = ensureSpace(doc, y, 25);

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
  y = ensureSpace(doc, y, 35);
  y = Math.max(y + 10, PAGE_H - FOOTER_H - 35);

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
  // FOOTER on all pages with pagination
  // ═══════════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooterBar(doc, empresa, i, totalPages);
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
