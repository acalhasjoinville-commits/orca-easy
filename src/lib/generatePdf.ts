import { Orcamento, MinhaEmpresa, Cliente } from './types';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function generatePdf(orcamento: Orcamento, cliente: Cliente | undefined, empresa: MinhaEmpresa | null) {
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

  // Build services table rows
  const serviceRows = orcamento.itensServico.map((item, idx) => {
    const unitPrice = item.metragem > 0 ? item.valorVenda / item.metragem : 0;
    return `<tr class="${idx % 2 === 1 ? 'alt' : ''}">
      <td style="text-align:center;font-weight:bold;">${idx + 1}</td>
      <td>${item.nomeServico}</td>
      <td style="text-align:center;">${item.metragem}</td>
      <td style="text-align:right;">${fmt(unitPrice)}</td>
      <td style="text-align:right;font-weight:bold;">${fmt(item.valorVenda)}</td>
    </tr>`;
  }).join('');

  // Payment lines
  const paymentLines = orcamento.formasPagamento
    ? orcamento.formasPagamento.split(/[.\n]/).filter(l => l.trim()).map(l => `<div class="pay-line">– ${l.trim()}</div>`).join('')
    : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Proposta #${String(orcamento.numeroOrcamento).padStart(4, '0')}</title>
<style>
  @page {
    size: A4;
    margin: 12mm 15mm 35mm 15mm;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #333;
    font-size: 10pt;
    line-height: 1.4;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 2px solid ${corP};
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
    color: ${corP};
  }
  .header-slogan {
    font-size: 8pt;
    color: #888;
    font-style: italic;
  }
  .header-right {
    text-align: right;
  }
  .header-right .label {
    font-size: 8pt;
    color: #888;
  }
  .header-right .number {
    font-size: 18pt;
    font-weight: bold;
    color: ${corD};
  }
  .header-right .date {
    font-size: 8pt;
    color: #888;
  }

  .client-box {
    background: #f5f5f8;
    border-radius: 4px;
    padding: 10px 14px;
    margin-bottom: 10px;
  }
  .client-box .section-title {
    font-size: 9pt;
    font-weight: bold;
    color: ${corP};
    margin-bottom: 6px;
  }
  .client-row {
    display: flex;
    gap: 24px;
    font-size: 8.5pt;
    margin-bottom: 3px;
  }
  .client-row b { color: ${corP}; }

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
  .meta-cell .meta-label {
    font-size: 7pt;
    color: #888;
  }
  .meta-cell .meta-value {
    font-size: 10pt;
    font-weight: bold;
    color: #333;
  }

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
    background: ${corP};
    border-radius: 2px;
  }
  .section-header h2 {
    font-size: 11pt;
    font-weight: bold;
    color: ${corP};
    margin: 0;
  }

  .desc-text {
    font-size: 9pt;
    color: #555;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
  }

  table.services {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
    font-size: 9pt;
  }
  table.services thead th {
    background: ${corP};
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

  .total-bar {
    background: ${corD};
    color: #fff;
    padding: 8px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    border-radius: 0 0 4px 4px;
  }
  .total-bar .total-label {
    font-size: 12pt;
    font-weight: bold;
  }
  .total-bar .total-details {
    text-align: right;
  }
  .total-bar .total-sub {
    font-size: 7pt;
  }
  .total-bar .total-value {
    font-size: 14pt;
    font-weight: bold;
  }

  .pay-line {
    font-size: 9pt;
    color: #555;
    margin-bottom: 3px;
    padding-left: 8px;
  }
  .pay-line::first-letter {
    color: ${corD};
    font-weight: bold;
  }

  .guarantee-text {
    font-size: 9pt;
    color: #555;
  }

  .signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
    padding-top: 10px;
  }
  .sig-block {
    width: 42%;
    text-align: center;
  }
  .sig-line {
    border-top: 1px solid #555;
    padding-top: 6px;
    font-size: 8.5pt;
    color: #555;
  }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: ${corP};
    color: #fff;
    padding: 8px 15mm;
    font-size: 7pt;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-left {}
  .footer-slogan {
    font-size: 10pt;
    font-weight: bold;
    margin-bottom: 2px;
  }
  .footer-contact {
    color: #bec8dc;
    font-size: 7pt;
  }
  .footer-address {
    color: #aab4c8;
    font-size: 6.5pt;
  }
  .footer-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .footer-right img {
    max-height: 28px;
    max-width: 40px;
    object-fit: contain;
  }

  .no-print { display: none; }

  @media screen {
    body { max-width: 210mm; margin: 20px auto; padding: 20mm 15mm; background: #eee; }
    .page-wrap { background: #fff; padding: 15mm; box-shadow: 0 2px 20px rgba(0,0,0,0.1); min-height: 297mm; position: relative; }
    .footer { position: absolute; }
    .print-btn {
      display: block !important;
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${corD};
      color: #fff;
      border: none;
      padding: 12px 24px;
      font-size: 14pt;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      z-index: 999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .print-btn:hover { opacity: 0.9; }
  }
</style>
</head>
<body>
<button class="print-btn no-print" style="display:none;" onclick="window.print()">Imprimir / Salvar PDF</button>
<div class="page-wrap">

  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      ${logoUrl ? `<div class="header-logo"><img src="${logoUrl}" alt="Logo"></div>` : ''}
      <div>
        <div class="header-company-name">${nomeEmpresa}</div>
        ${slogan ? `<div class="header-slogan">${slogan}</div>` : ''}
      </div>
    </div>
    <div class="header-right">
      <div class="label">Proposta nº</div>
      <div class="number">#${String(orcamento.numeroOrcamento).padStart(4, '0')}</div>
      <div class="date">${dataFormatada}</div>
    </div>
  </div>

  <!-- CLIENT -->
  <div class="client-box">
    <div class="section-title">DADOS DO CLIENTE</div>
    <div class="client-row">
      <span><b>Nome:</b> ${clienteName}</span>
      ${clienteDoc ? `<span><b>CPF/CNPJ:</b> ${clienteDoc}</span>` : ''}
      ${clienteTel ? `<span><b>Tel:</b> ${clienteTel}</span>` : ''}
    </div>
    ${clienteEnd || clienteCep ? `<div class="client-row">
      <span><b>Endereço:</b> ${clienteEnd}${clienteCep ? ` — CEP: ${clienteCep}` : ''}</span>
    </div>` : ''}
  </div>

  <!-- META GRID -->
  <div class="meta-grid">
    <div class="meta-cell">
      <div class="meta-label">Emissão</div>
      <div class="meta-value">${dataFormatada}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Validade</div>
      <div class="meta-value">${orcamento.validade || '—'}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Garantia</div>
      <div class="meta-value">${orcamento.tempoGarantia || '—'}</div>
    </div>
  </div>

  <!-- DESCRIÇÃO -->
  ${orcamento.descricaoGeral ? `
  <div class="section-header">
    <div class="section-bar"></div>
    <h2>Descrição do Serviço</h2>
  </div>
  <div class="desc-text">${orcamento.descricaoGeral}</div>
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
      ${serviceRows}
    </tbody>
  </table>

  <!-- TOTAL -->
  <div class="total-bar">
    <div class="total-label">TOTAL</div>
    <div class="total-details">
      ${orcamento.desconto > 0 ? `
        <div class="total-sub">Subtotal: ${fmt(orcamento.valorVenda)}  |  Desconto: -${fmt(orcamento.desconto)}</div>
      ` : ''}
      <div class="total-value">${fmt(orcamento.valorFinal)}</div>
    </div>
  </div>

  <!-- PAGAMENTO & GARANTIA -->
  ${orcamento.formasPagamento ? `
  <div class="section-header">
    <div class="section-bar"></div>
    <h2>Formas de Pagamento</h2>
  </div>
  ${paymentLines}
  ` : ''}

  ${orcamento.garantia ? `
  <div class="section-header" style="margin-top:12px;">
    <div class="section-bar"></div>
    <h2>Garantia</h2>
  </div>
  <div class="guarantee-text">${orcamento.garantia}</div>
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
    ${slogan ? `<div class="footer-slogan">${slogan}</div>` : `<div class="footer-slogan">${nomeEmpresa}</div>`}
    ${contactLine ? `<div class="footer-contact">${contactLine}</div>` : ''}
    ${addressLine ? `<div class="footer-address">${addressLine}</div>` : ''}
  </div>
  <div class="footer-right">
    ${logoUrl ? `<img src="${logoUrl}" alt="Logo">` : ''}
  </div>
</div>

</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (!w) {
    window.location.href = url;
  }
}
