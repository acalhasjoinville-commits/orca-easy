import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Orcamento, MinhaEmpresa, Cliente } from './types';

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function generatePdf(orcamento: Orcamento, cliente: Cliente | undefined, empresa: MinhaEmpresa | null) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;

  const corPrimaria = empresa?.corPrimaria || '#0B1B32';
  const corDestaque = empresa?.corDestaque || '#F57C00';
  const rgbPrimaria = hexToRgb(corPrimaria);
  const rgbDestaque = hexToRgb(corDestaque);

  let y = margin;

  // === HEADER BAR ===
  doc.setFillColor(...rgbPrimaria);
  doc.rect(0, 0, pageW, 38, 'F');

  // Logo
  if (empresa?.logoUrl) {
    try {
      doc.addImage(empresa.logoUrl, 'PNG', margin, 5, 28, 28);
    } catch { /* ignore logo errors */ }
  }

  // Company info on the right
  const infoX = empresa?.logoUrl ? margin + 34 : margin;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa?.nomeFantasia || 'Minha Empresa', infoX, 13);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const companyLines: string[] = [];
  if (empresa?.cnpjCpf) companyLines.push(`CNPJ/CPF: ${empresa.cnpjCpf}`);
  if (empresa?.telefoneWhatsApp) companyLines.push(`WhatsApp: ${empresa.telefoneWhatsApp}`);
  if (empresa?.emailContato) companyLines.push(empresa.emailContato);
  const endParts = [empresa?.endereco, empresa?.numero, empresa?.bairro, empresa?.cidade, empresa?.estado].filter(Boolean);
  if (endParts.length) companyLines.push(endParts.join(', '));
  companyLines.forEach((line, i) => {
    doc.text(line, infoX, 19 + i * 4);
  });

  y = 46;

  // === TITLE BAR ===
  doc.setFillColor(...rgbPrimaria);
  doc.rect(margin, y, contentW, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`PROPOSTA COMERCIAL Nº ${orcamento.numeroOrcamento}`, pageW / 2, y + 7, { align: 'center' });
  y += 16;

  // Date
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const dataFormatada = new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR');
  doc.text(`Data: ${dataFormatada}`, pageW - margin, y, { align: 'right' });

  // === CLIENT INFO ===
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const clienteName = cliente?.nomeRazaoSocial || orcamento.nomeCliente;
  doc.text(`Nome: ${clienteName}`, margin, y);
  y += 4;
  if (cliente?.documento) { doc.text(`CPF/CNPJ: ${cliente.documento}`, margin, y); y += 4; }
  if (cliente?.whatsapp) { doc.text(`WhatsApp: ${cliente.whatsapp}`, margin, y); y += 4; }
  const clienteEnd = [cliente?.endereco, cliente?.numero, cliente?.bairro, cliente?.cidade].filter(Boolean).join(', ');
  if (clienteEnd) { doc.text(`Endereço: ${clienteEnd}`, margin, y); y += 4; }

  y += 4;

  // === ESCOPO DO SERVIÇO ===
  if (orcamento.descricaoGeral) {
    doc.setTextColor(...rgbPrimaria);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ESCOPO DO SERVIÇO', margin, y);
    y += 5;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const escopoLines = doc.splitTextToSize(orcamento.descricaoGeral, contentW);
    doc.text(escopoLines, margin, y);
    y += escopoLines.length * 4 + 4;
  }

  // === TABLE ===
  const tableHead = [['#', 'Descrição do Serviço', 'Qtd/Medida', 'Preço Unit.', 'Total']];
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
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [40, 40, 40],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 28 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // === TOTALS ===
  doc.setDrawColor(...rgbPrimaria);
  doc.setLineWidth(0.5);
  doc.line(pageW - margin - 80, y, pageW - margin, y);
  y += 6;

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', pageW - margin - 80, y);
  doc.text(fmt(orcamento.valorVenda), pageW - margin, y, { align: 'right' });
  y += 5;

  if (orcamento.desconto > 0) {
    doc.text('Desconto:', pageW - margin - 80, y);
    doc.setTextColor(200, 50, 50);
    doc.text(`-${fmt(orcamento.desconto)}`, pageW - margin, y, { align: 'right' });
    doc.setTextColor(40, 40, 40);
    y += 5;
  }

  // Valor Final - highlighted
  doc.setFillColor(...rgbDestaque);
  doc.roundedRect(pageW - margin - 82, y - 4, 84, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR FINAL:', pageW - margin - 78, y + 4);
  doc.text(fmt(orcamento.valorFinal), pageW - margin - 2, y + 4, { align: 'right' });
  y += 18;

  // === COMMERCIAL CONDITIONS ===
  doc.setTextColor(...rgbPrimaria);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDIÇÕES COMERCIAIS', margin, y);
  y += 6;

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const conditions: { label: string; value: string; highlight?: boolean }[] = [];
  if (orcamento.validade) conditions.push({ label: 'Validade', value: orcamento.validade });
  if (orcamento.formasPagamento) conditions.push({ label: 'Formas de Pagamento', value: orcamento.formasPagamento });
  if (orcamento.tempoGarantia) conditions.push({ label: 'Garantia', value: orcamento.tempoGarantia, highlight: true });
  if (orcamento.garantia) conditions.push({ label: 'Detalhes da Garantia', value: orcamento.garantia });

  conditions.forEach(c => {
    if (y > 270) { doc.addPage(); y = margin; }
    doc.setFont('helvetica', 'bold');
    if (c.highlight) {
      doc.setTextColor(...rgbDestaque);
      doc.text(`🛡️ ${c.label}: ${c.value}`, margin + 2, y);
      doc.setTextColor(40, 40, 40);
    } else {
      doc.setTextColor(60, 60, 60);
      doc.text(`• ${c.label}:`, margin + 2, y);
      doc.setFont('helvetica', 'normal');
      const textLines = doc.splitTextToSize(c.value, contentW - 6);
      doc.text(textLines, margin + 4, y + 4);
      y += 4 + textLines.length * 3.5;
    }
    y += 5;
  });

  // === FOOTER ===
  y = Math.max(y + 6, 270);
  if (y > 280) { doc.addPage(); y = 270; }
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('Orçamento gerado via OrçaCalhas — A solução está no nome', pageW / 2, y, { align: 'center' });

  // Use dataUrl approach for iOS/Safari compatibility
  const pdfDataUri = doc.output('datauristring');
  const newWindow = window.open();
  if (newWindow) {
    newWindow.document.write(
      `<html><head><title>Proposta ${orcamento.numeroOrcamento}</title></head>` +
      `<body style="margin:0"><iframe src="${pdfDataUri}" style="border:none;width:100%;height:100vh"></iframe></body></html>`
    );
    newWindow.document.close();
  } else {
    // Fallback: direct download
    const link = document.createElement('a');
    link.href = pdfDataUri;
    link.download = `proposta-${orcamento.numeroOrcamento}.pdf`;
    link.click();
  }
}
