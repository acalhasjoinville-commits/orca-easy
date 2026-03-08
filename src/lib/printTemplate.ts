import { Orcamento, MinhaEmpresa, Cliente } from './types';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export interface TemplateParams {
  orcamento: Orcamento;
  cliente: Cliente | undefined;
  empresa: MinhaEmpresa | null;
  logoDataUrl?: string;
}

/**
 * Converts a remote image URL to a data URL to avoid CORS issues in html2canvas/print.
 * Returns the original URL on failure.
 */
export async function imageToDataUrl(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  try {
    const resp = await fetch(url, { mode: 'cors' });
    const blob = await resp.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

/**
 * Builds the full HTML string for the A4 proposal document.
 * Used by both generatePdf (html2pdf.js) and openPrintWindow.
 */
export function buildProposalHtml(params: TemplateParams): string {
  const { orcamento, cliente, empresa, logoDataUrl } = params;

  const corP = empresa?.corPrimaria || '#1B2A4A';
  const corD = empresa?.corDestaque || '#F57C00';
  const dataFormatada = new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR');

  const isPJ = cliente?.tipo === 'PJ';
  const nameLabel = cliente ? (isPJ ? 'Razão Social' : 'Nome') : 'Nome/Razão Social';
  const docLabel = cliente ? (isPJ ? 'CNPJ' : 'CPF') : 'CPF/CNPJ';
  const clienteName = cliente?.nomeRazaoSocial || orcamento.nomeCliente;
  const clienteDoc = cliente?.documento || '';
  const clienteTel = cliente?.whatsapp || '';
  const clienteEnd = [cliente?.endereco, cliente?.numero ? `nº ${cliente.numero}` : null, cliente?.bairro, cliente?.cidade].filter(Boolean).join(', ');
  const clienteCep = cliente?.cep || '';

  const nomeEmpresa = empresa?.nomeFantasia || '';
  const slogan = empresa?.slogan || '';
  const logoUrl = logoDataUrl || empresa?.logoUrl || '';

  const contactParts: string[] = [];
  if (empresa?.cnpjCpf) contactParts.push(`CNPJ: ${empresa.cnpjCpf}`);
  if (empresa?.telefoneWhatsApp) contactParts.push(empresa.telefoneWhatsApp);
  if (empresa?.emailContato) contactParts.push(empresa.emailContato);
  const contactLine = contactParts.join('  |  ');

  const addrParts = [empresa?.endereco, empresa?.numero ? `nº ${empresa.numero}` : null, empresa?.bairro, empresa?.cidade, empresa?.estado].filter(Boolean);
  const addressLine = addrParts.join(', ');

  const serviceRows = orcamento.itensServico.map((item, idx) => {
    const unitPrice = item.metragem > 0 ? item.valorVenda / item.metragem : 0;
    const unidade = 'm';
    return `<tr class="${idx % 2 === 1 ? 'alt' : ''}">
      <td style="text-align:center;font-weight:bold;">${idx + 1}</td>
      <td class="svc-name">${item.nomeServico}</td>
      <td class="no-break" style="text-align:center;">${unidade}</td>
      <td class="no-break" style="text-align:center;">${item.metragem}</td>
      <td class="no-break" style="text-align:right;">${fmt(unitPrice)}</td>
      <td class="no-break" style="text-align:right;font-weight:bold;">${fmt(item.valorVenda)}</td>
    </tr>`;
  }).join('');

  const paymentLines = orcamento.formasPagamento
    ? orcamento.formasPagamento.split(/[.\n]/).filter(l => l.trim()).map(l => `<div class="pay-line">– ${l.trim()}</div>`).join('')
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Proposta nº ${String(orcamento.numeroOrcamento).padStart(4, '0')}</title>
<style>
  @page {
    size: A4 portrait;
    margin: 10mm 10mm 12mm 10mm;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }

  html, body {
    width: 210mm;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #333;
    font-size: 10pt;
    line-height: 1.45;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page-wrap {
    width: 100%;
    padding: 0;
  }

  /* ===== WORD BREAK RULES ===== */
  .svc-name, .desc-text, .guarantee-text, .client-row span {
    word-break: break-word;
    overflow-wrap: break-word;
  }
  .no-break { white-space: nowrap; }
  .desc-text, .pay-line, .guarantee-text {
    white-space: pre-wrap;
    word-break: break-word;
  }
  .client-line { font-size: 9pt; margin-bottom: 3px; }
  .client-line b { color: ${corP}; }

  /* ===== HEADER ===== */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 2.5px solid ${corP};
  }
  .header-left { display: flex; align-items: center; gap: 12px; }
  .header-logo img { max-height: 54px; max-width: 90px; object-fit: contain; }
  .header-company-name { font-size: 16pt; font-weight: bold; color: ${corP}; }
  .header-slogan { font-size: 8pt; color: #888; font-style: italic; }
  .header-right { text-align: right; }
  .header-right .label { font-size: 8pt; color: #888; }
  .header-right .number { font-size: 18pt; font-weight: bold; color: ${corD}; }
  .header-right .date { font-size: 8pt; color: #888; }

  /* ===== CLIENT BOX ===== */
  .client-box {
    background: #f5f5f8;
    border-radius: 4px;
    padding: 10px 14px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }
  .client-box .section-title { font-size: 9pt; font-weight: bold; color: ${corP}; margin-bottom: 6px; }
  .client-row { font-size: 9pt; margin-bottom: 3px; }
  .client-row b { color: ${corP}; }

  /* ===== META GRID ===== */
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border: 1px solid #d2d2d2;
    margin-bottom: 14px;
  }
  .meta-cell { padding: 6px 10px; border-right: 1px solid #d2d2d2; }
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
    page-break-after: avoid;
  }
  .section-bar { width: 3px; height: 16px; background: ${corP}; border-radius: 2px; }
  .section-header h2 { font-size: 11pt; font-weight: bold; color: ${corP}; margin: 0; }
  .desc-text {
    font-size: 9pt;
    color: #555;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
  }

  /* ===== TABLE ===== */
  table.services { width: 100%; border-collapse: collapse; margin-bottom: 0; font-size: 9pt; }
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
  table.services tbody tr.alt td { background: #f8f8f8; }
  table.services tr { page-break-inside: avoid; }

  /* ===== TOTAL BAR ===== */
  .total-bar {
    background: ${corD};
    color: #fff;
    padding: 8px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    border-radius: 0 0 4px 4px;
    page-break-inside: avoid;
  }
  .total-bar .total-label { font-size: 12pt; font-weight: bold; }
  .total-bar .total-details { text-align: right; }
  .total-bar .total-sub { font-size: 7pt; white-space: nowrap; }
  .total-bar .total-value { font-size: 14pt; font-weight: bold; white-space: nowrap; }

  /* ===== PAYMENT ===== */
  .pay-line { font-size: 9pt; color: #555; margin-bottom: 3px; padding-left: 8px; }
  .guarantee-text { font-size: 9pt; color: #555; }

  /* ===== SIGNATURES ===== */
  .signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
    padding-top: 10px;
    page-break-inside: avoid;
  }
  .sig-block { width: 42%; text-align: center; }
  .sig-line { border-top: 1px solid #555; padding-top: 6px; font-size: 8.5pt; color: #555; }
  .sig-sub { font-size: 7pt; color: #999; margin-top: 2px; }

  /* ===== FOOTER ===== */
  .footer {
    background: ${corP};
    color: #fff;
    padding: 8px 14px;
    font-size: 7pt;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    page-break-inside: avoid;
  }
  .footer-slogan { font-size: 10pt; font-weight: bold; margin-bottom: 2px; }
  .footer-contact { color: #bec8dc; font-size: 7pt; white-space: nowrap; }
  .footer-address { color: #aab4c8; font-size: 6.5pt; }
  .footer-right { display: flex; align-items: center; gap: 10px; }
  .footer-right img { max-height: 28px; max-width: 40px; object-fit: contain; }

  /* ===== PRINT SPECIFIC ===== */
  @media print {
    html, body { width: auto; }
    .page-wrap { padding: 0; }
  }
</style>
</head>
<body>
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
    <div class="client-line"><b>${nameLabel}:</b> ${clienteName}</div>
    ${clienteDoc ? `<div class="client-line"><b>${docLabel}:</b> <span class="no-break">${clienteDoc}</span></div>` : ''}
    ${clienteTel ? `<div class="client-line"><b>Telefone:</b> <span class="no-break">${clienteTel}</span></div>` : ''}
    ${clienteEnd || clienteCep ? `<div class="client-line"><b>Endereço:</b> ${clienteEnd}${clienteCep ? ` — CEP: <span class="no-break">${clienteCep}</span>` : ''}</div>` : ''}
  </div>

  <!-- META GRID -->
  <div class="meta-grid">
    <div class="meta-cell">
      <div class="meta-label">Emissão</div>
      <div class="meta-value no-break">${dataFormatada}</div>
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
        <th style="width:28px;text-align:center;">#</th>
        <th>Serviço / Descrição</th>
        <th style="width:50px;text-align:center;">Unid.</th>
        <th style="width:60px;text-align:center;">Qtd.</th>
        <th style="width:90px;text-align:right;">Valor Unit.</th>
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
        <div class="total-sub">Subtotal: ${fmt(orcamento.valorVenda)}</div>
        <div class="total-sub">Desconto: -${fmt(orcamento.desconto)}</div>
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
}
