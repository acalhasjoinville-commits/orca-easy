import { Orcamento, MinhaEmpresa, Cliente } from './types';
import html2pdf from 'html2pdf.js';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export async function generatePdf(orcamento: Orcamento, cliente: Cliente | undefined, empresa: MinhaEmpresa | null) {
  const corP = empresa?.corPrimaria || '#1B2A4A';
  const corD = empresa?.corDestaque || '#F57C00';
  const dataFormatada = new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR');

  const clienteName = cliente?.nomeRazaoSocial || orcamento.nomeCliente;
  const clienteDoc = cliente?.documento || '';
  const clienteTel = cliente?.whatsapp || '';
  const clienteEnd = [cliente?.endereco, cliente?.numero ? `nº ${cliente.numero}` : null, cliente?.bairro, cliente?.cidade].filter(Boolean).join(', ');
  const clienteCep = cliente?.cep || '';

  const nomeEmpresa = empresa?.nomeFantasia || '';
  const slogan = empresa?.slogan || '';
  const logoUrl = empresa?.logoUrl || '';

  const contactParts: string[] = [];
  if (empresa?.cnpjCpf) contactParts.push(`CNPJ: ${empresa.cnpjCpf}`);
  if (empresa?.telefoneWhatsApp) contactParts.push(empresa.telefoneWhatsApp);
  if (empresa?.emailContato) contactParts.push(empresa.emailContato);
  const contactLine = contactParts.join('  |  ');

  const addrParts = [empresa?.endereco, empresa?.numero ? `nº ${empresa.numero}` : null, empresa?.bairro, empresa?.cidade, empresa?.estado].filter(Boolean);
  const addressLine = addrParts.join(', ');

  const serviceRows = orcamento.itensServico.map((item, idx) => {
    const unitPrice = item.metragem > 0 ? item.valorVenda / item.metragem : 0;
    return `<tr class="${idx % 2 === 1 ? 'alt' : ''}">
      <td style="text-align:center;font-weight:bold;">${idx + 1}</td>
      <td class="svc-name">${item.nomeServico}</td>
      <td class="no-break" style="text-align:center;">${item.metragem}</td>
      <td class="no-break" style="text-align:right;">${fmt(unitPrice)}</td>
      <td class="no-break" style="text-align:right;font-weight:bold;">${fmt(item.valorVenda)}</td>
    </tr>`;
  }).join('');

  const paymentLines = orcamento.formasPagamento
    ? orcamento.formasPagamento.split(/[.\n]/).filter(l => l.trim()).map(l => `<div class="pay-line">– ${l.trim()}</div>`).join('')
    : '';

  const bodyHtml = buildBodyHtml({
    corP, corD, dataFormatada, clienteName, clienteDoc, clienteTel, clienteEnd, clienteCep,
    nomeEmpresa, slogan, logoUrl, contactLine, addressLine, serviceRows, paymentLines, orcamento
  });

  // Create hidden container
  const container = document.createElement('div');
  container.innerHTML = bodyHtml;
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;'; // 210mm ≈ 794px at 96dpi
  document.body.appendChild(container);

  try {
    await (html2pdf() as any).set({
      margin: 0,
      filename: `Proposta_${String(orcamento.numeroOrcamento).padStart(4, '0')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, width: 794, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).from(container).save();
  } finally {
    container.remove();
  }
}

interface HtmlParams {
  corP: string; corD: string; dataFormatada: string;
  clienteName: string; clienteDoc: string; clienteTel: string;
  clienteEnd: string; clienteCep: string;
  nomeEmpresa: string; slogan: string; logoUrl: string;
  contactLine: string; addressLine: string;
  serviceRows: string; paymentLines: string;
  orcamento: Orcamento;
}

function buildBodyHtml(p: HtmlParams): string {
  return `
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  .pdf-root {
    width: 794px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #333;
    font-size: 10pt;
    line-height: 1.4;
    background: #fff;
  }

  .page-wrap {
    width: 100%;
    padding: 8mm 10mm;
  }

  /* ===== WORD BREAK RULES ===== */
  .svc-name, .desc-text, .guarantee-text, .client-row span {
    word-break: break-word;
    overflow-wrap: break-word;
  }
  .no-break {
    white-space: nowrap;
  }
  .desc-text, .pay-line, .guarantee-text {
    white-space: pre-wrap;
    word-break: break-word;
  }
  .client-name-val {
    display: inline-block;
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }

  /* ===== HEADER ===== */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 2px solid ${p.corP};
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .header-logo img {
    max-height: 50px;
    max-width: 80px;
    object-fit: contain;
  }
  .header-company-name {
    font-size: 16pt;
    font-weight: bold;
    color: ${p.corP};
  }
  .header-slogan {
    font-size: 8pt;
    color: #888;
    font-style: italic;
  }
  .header-right { text-align: right; }
  .header-right .label { font-size: 8pt; color: #888; }
  .header-right .number { font-size: 18pt; font-weight: bold; color: ${p.corD}; }
  .header-right .date { font-size: 8pt; color: #888; }

  /* ===== CLIENT BOX ===== */
  .client-box {
    background: #f5f5f8;
    border-radius: 4px;
    padding: 10px 14px;
    margin-bottom: 10px;
    break-inside: avoid;
  }
  .client-box .section-title {
    font-size: 9pt;
    font-weight: bold;
    color: ${p.corP};
    margin-bottom: 6px;
  }
  .client-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 8.5pt;
    margin-bottom: 3px;
  }
  .client-row b { color: ${p.corP}; }

  /* ===== META GRID ===== */
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border: 1px solid #d2d2d2;
    margin-bottom: 14px;
  }
  .meta-cell {
    padding: 6px 10px;
    border-right: 1px solid #d2d2d2;
  }
  .meta-cell:last-child { border-right: none; }
  .meta-cell .meta-label { font-size: 7pt; color: #888; }
  .meta-cell .meta-value { font-size: 10pt; font-weight: bold; color: #333; white-space: nowrap; }

  /* ===== SECTIONS ===== */
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    margin-top: 14px;
  }
  .section-bar {
    width: 3px;
    height: 16px;
    background: ${p.corP};
    border-radius: 2px;
  }
  .section-header h2 {
    font-size: 11pt;
    font-weight: bold;
    color: ${p.corP};
    margin: 0;
  }
  .desc-text {
    font-size: 9pt;
    color: #555;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
  }

  /* ===== TABLE ===== */
  table.services {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
    font-size: 9pt;
  }
  table.services thead th {
    background: ${p.corP};
    color: #fff;
    font-weight: bold;
    padding: 8px 6px;
    font-size: 8.5pt;
  }
  table.services tbody td {
    padding: 7px 6px;
    border-bottom: 1px solid #e6e6e6;
    color: #333;
  }
  table.services tbody tr.alt td {
    background: #f8f8f8;
  }
  table.services tr {
    break-inside: avoid;
  }

  /* ===== TOTAL BAR ===== */
  .total-bar {
    background: ${p.corD};
    color: #fff;
    padding: 8px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    border-radius: 0 0 4px 4px;
    break-inside: avoid;
  }
  .total-bar .total-label { font-size: 12pt; font-weight: bold; }
  .total-bar .total-details { text-align: right; }
  .total-bar .total-sub { font-size: 7pt; white-space: nowrap; }
  .total-bar .total-value { font-size: 14pt; font-weight: bold; white-space: nowrap; }

  /* ===== PAYMENT ===== */
  .pay-line {
    font-size: 9pt;
    color: #555;
    margin-bottom: 3px;
    padding-left: 8px;
  }
  .guarantee-text { font-size: 9pt; color: #555; }

  /* ===== SIGNATURES ===== */
  .signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
    padding-top: 10px;
    break-inside: avoid;
  }
  .sig-block { width: 42%; text-align: center; }
  .sig-line {
    border-top: 1px solid #555;
    padding-top: 6px;
    font-size: 8.5pt;
    color: #555;
  }

  /* ===== FOOTER ===== */
  .footer {
    background: ${p.corP};
    color: #fff;
    padding: 8px 14px;
    font-size: 7pt;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    break-inside: avoid;
  }
  .footer-slogan { font-size: 10pt; font-weight: bold; margin-bottom: 2px; }
  .footer-contact { color: #bec8dc; font-size: 7pt; white-space: nowrap; }
  .footer-address { color: #aab4c8; font-size: 6.5pt; }
  .footer-right { display: flex; align-items: center; gap: 10px; }
  .footer-right img { max-height: 28px; max-width: 40px; object-fit: contain; }
</style>

<div class="pdf-root">
<div class="page-wrap">

  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      ${p.logoUrl ? `<div class="header-logo"><img src="${p.logoUrl}" alt="Logo"></div>` : ''}
      <div>
        <div class="header-company-name">${p.nomeEmpresa}</div>
        ${p.slogan ? `<div class="header-slogan">${p.slogan}</div>` : ''}
      </div>
    </div>
    <div class="header-right">
      <div class="label">Proposta nº</div>
      <div class="number">#${String(p.orcamento.numeroOrcamento).padStart(4, '0')}</div>
      <div class="date">${p.dataFormatada}</div>
    </div>
  </div>

  <!-- CLIENT -->
  <div class="client-box">
    <div class="section-title">DADOS DO CLIENTE</div>
    <div class="client-row">
      <span><b>Nome:</b> <span class="client-name-val">${p.clienteName}</span></span>
      ${p.clienteDoc ? `<span><b>CPF/CNPJ:</b> <span class="no-break">${p.clienteDoc}</span></span>` : ''}
      ${p.clienteTel ? `<span><b>Tel:</b> <span class="no-break">${p.clienteTel}</span></span>` : ''}
    </div>
    ${p.clienteEnd || p.clienteCep ? `<div class="client-row">
      <span><b>Endereço:</b> ${p.clienteEnd}${p.clienteCep ? ` — CEP: <span class="no-break">${p.clienteCep}</span>` : ''}</span>
    </div>` : ''}
  </div>

  <!-- META GRID -->
  <div class="meta-grid">
    <div class="meta-cell">
      <div class="meta-label">Emissão</div>
      <div class="meta-value no-break">${p.dataFormatada}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Validade</div>
      <div class="meta-value">${p.orcamento.validade || '—'}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Garantia</div>
      <div class="meta-value">${p.orcamento.tempoGarantia || '—'}</div>
    </div>
  </div>

  <!-- DESCRIÇÃO -->
  ${p.orcamento.descricaoGeral ? `
  <div class="section-header">
    <div class="section-bar"></div>
    <h2>Descrição do Serviço</h2>
  </div>
  <div class="desc-text">${p.orcamento.descricaoGeral}</div>
  ` : ''}

  <!-- SERVIÇOS -->
  <div class="section-header">
    <div class="section-bar"></div>
    <h2>Serviços</h2>
  </div>
  <table class="services">
    <thead>
      <tr>
        <th style="width:30px;text-align:center;">#</th>
        <th>Descrição do Serviço</th>
        <th style="width:80px;text-align:center;">Qtd/Metragem</th>
        <th style="width:90px;text-align:right;">Preço Unit.</th>
        <th style="width:90px;text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${p.serviceRows}
    </tbody>
  </table>

  <!-- TOTAL -->
  <div class="total-bar">
    <div class="total-label">TOTAL</div>
    <div class="total-details">
      ${p.orcamento.desconto > 0 ? `
        <div class="total-sub">Subtotal: ${fmt(p.orcamento.valorVenda)}  |  Desconto: -${fmt(p.orcamento.desconto)}</div>
      ` : ''}
      <div class="total-value">${fmt(p.orcamento.valorFinal)}</div>
    </div>
  </div>

  <!-- PAGAMENTO & GARANTIA -->
  ${p.orcamento.formasPagamento ? `
  <div class="section-header">
    <div class="section-bar"></div>
    <h2>Formas de Pagamento</h2>
  </div>
  ${p.paymentLines}
  ` : ''}

  ${p.orcamento.garantia ? `
  <div class="section-header" style="margin-top:12px;">
    <div class="section-bar"></div>
    <h2>Garantia</h2>
  </div>
  <div class="guarantee-text">${p.orcamento.garantia}</div>
  ` : ''}

  <!-- ASSINATURAS -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line">Assinatura do Cliente</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">Assinatura do Técnico</div>
    </div>
  </div>

</div>

<!-- FOOTER -->
<div class="footer">
  <div class="footer-left">
    ${p.slogan ? `<div class="footer-slogan">${p.slogan}</div>` : `<div class="footer-slogan">${p.nomeEmpresa}</div>`}
    ${p.contactLine ? `<div class="footer-contact">${p.contactLine}</div>` : ''}
    ${p.addressLine ? `<div class="footer-address">${p.addressLine}</div>` : ''}
  </div>
  <div class="footer-right">
    ${p.logoUrl ? `<img src="${p.logoUrl}" alt="Logo">` : ''}
  </div>
</div>
</div>`;
}
