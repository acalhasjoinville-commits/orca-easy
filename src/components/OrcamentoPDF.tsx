import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { Orcamento, Cliente, MinhaEmpresa } from '@/lib/types';

interface OrcamentoPDFProps {
  orcamento: Orcamento;
  cliente?: Cliente | null;
  empresa?: MinhaEmpresa | null;
  logoBase64?: string | null;
}

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('pt-BR');
  } catch {
    return d;
  }
};

export function OrcamentoPDF({ orcamento, cliente, empresa, logoBase64 }: OrcamentoPDFProps) {
  const corPrimaria = empresa?.corPrimaria || '#0B1B32';
  const corDestaque = empresa?.corDestaque || '#F57C00';
  const nomeEmpresa = empresa?.nomeFantasia || 'Minha Empresa';
  const slogan = empresa?.slogan || '';
  const telefone = empresa?.telefoneWhatsApp || '';
  const email = empresa?.emailContato || '';
  const enderecoEmpresa = [empresa?.endereco, empresa?.numero, empresa?.bairro, empresa?.cidade, empresa?.estado]
    .filter(Boolean).join(', ');

  const isPJ = cliente?.tipo === 'PJ';
  const displayValue = (orcamento.desconto ?? 0) > 0 ? orcamento.valorFinal : orcamento.valorVenda;

  const s = StyleSheet.create({
    page: { paddingTop: 30, paddingBottom: 80, paddingHorizontal: 30, fontSize: 9, fontFamily: 'Helvetica', color: '#333' },
    // Header
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 2, borderBottomColor: corPrimaria, paddingBottom: 10 },
    logo: { width: 60, height: 60, marginRight: 12, objectFit: 'contain' },
    headerText: { flex: 1 },
    companyName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: corPrimaria },
    slogan: { fontSize: 8, color: '#666', marginTop: 2 },
    contactLine: { fontSize: 7, color: '#666', marginTop: 3 },
    // Title bar
    titleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: corPrimaria, borderRadius: 4, padding: 10, marginBottom: 12 },
    titleText: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#fff' },
    titleNumber: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: corDestaque },
    titleDate: { fontSize: 9, color: '#ddd' },
    // Section
    sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: corPrimaria, marginBottom: 6, marginTop: 14, textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 3 },
    // Client
    clientBox: { backgroundColor: '#f8f8f8', borderRadius: 4, padding: 10, marginBottom: 4 },
    clientRow: { flexDirection: 'row', marginBottom: 3 },
    clientLabel: { width: 80, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#555' },
    clientValue: { flex: 1, fontSize: 9, color: '#333' },
    // Scope
    scopeBox: { backgroundColor: '#f8f8f8', borderRadius: 4, padding: 10, marginBottom: 4 },
    scopeText: { fontSize: 9, color: '#333', lineHeight: 1.5 },
    // Table
    tableHeader: { flexDirection: 'row', backgroundColor: corPrimaria, borderTopLeftRadius: 4, borderTopRightRadius: 4, paddingVertical: 6, paddingHorizontal: 8 },
    tableHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#fff' },
    tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
    tableRowAlt: { backgroundColor: '#f9f9f9' },
    tableCell: { fontSize: 8, color: '#333' },
    colNum: { width: 25 },
    colDesc: { flex: 1 },
    colMedida: { width: 55, textAlign: 'center' as const },
    colUnit: { width: 70, textAlign: 'right' as const },
    colTotal: { width: 70, textAlign: 'right' as const },
    // Totals
    totalsBox: { marginTop: 8, alignItems: 'flex-end' as const, paddingRight: 8 },
    totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 3, gap: 12 },
    totalLabel: { fontSize: 9, color: '#555', width: 100, textAlign: 'right' as const },
    totalValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', width: 80, textAlign: 'right' as const },
    totalFinalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: corPrimaria, width: 100, textAlign: 'right' as const },
    totalFinalValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: corDestaque, width: 80, textAlign: 'right' as const },
    // Conditions
    conditionsGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    conditionCard: { flex: 1, backgroundColor: '#f8f8f8', borderRadius: 4, padding: 8 },
    conditionTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#555', marginBottom: 3, textTransform: 'uppercase' as const },
    conditionValue: { fontSize: 9, color: '#333' },
    conditionHighlight: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: corDestaque },
    // Signatures
    signaturesRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, paddingTop: 10 },
    signatureBlock: { alignItems: 'center' as const, width: 200 },
    signatureLine: { width: 180, borderBottomWidth: 1, borderBottomColor: '#333', marginBottom: 5 },
    signatureName: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#333' },
    signatureRole: { fontSize: 7, color: '#666' },
    // Footer
    footer: { position: 'absolute' as const, bottom: 20, left: 30, right: 30, borderTopWidth: 1, borderTopColor: corPrimaria, paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    footerLogo: { width: 24, height: 24, marginRight: 6, objectFit: 'contain' as const },
    footerLeft: { flexDirection: 'row', alignItems: 'center' },
    footerText: { fontSize: 6, color: '#888' },
    footerRight: { fontSize: 6, color: '#888' },
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* HEADER */}
        <View style={s.header}>
          {logoBase64 && <Image src={logoBase64} style={s.logo} />}
          <View style={s.headerText}>
            <Text style={s.companyName}>{nomeEmpresa}</Text>
            {slogan ? <Text style={s.slogan}>{slogan}</Text> : null}
            <Text style={s.contactLine}>
              {[telefone, email].filter(Boolean).join(' · ')}
            </Text>
            {enderecoEmpresa ? <Text style={s.contactLine}>{enderecoEmpresa}</Text> : null}
          </View>
        </View>

        {/* TITLE BAR */}
        <View style={s.titleBar}>
          <View>
            <Text style={s.titleText}>PROPOSTA COMERCIAL</Text>
            <Text style={s.titleNumber}>#{orcamento.numeroOrcamento}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' as const }}>
            <Text style={s.titleDate}>Emissão: {fmtDate(orcamento.dataCriacao)}</Text>
            {orcamento.validade ? <Text style={s.titleDate}>Validade: {orcamento.validade}</Text> : null}
          </View>
        </View>

        {/* CLIENT */}
        <Text style={s.sectionTitle}>Cliente</Text>
        <View style={s.clientBox}>
          <View style={s.clientRow}>
            <Text style={s.clientLabel}>{isPJ ? 'Razão Social' : 'Nome'}</Text>
            <Text style={s.clientValue}>{cliente?.nomeRazaoSocial || orcamento.nomeCliente}</Text>
          </View>
          {cliente?.documento ? (
            <View style={s.clientRow}>
              <Text style={s.clientLabel}>{isPJ ? 'CNPJ' : 'CPF'}</Text>
              <Text style={s.clientValue}>{cliente.documento}</Text>
            </View>
          ) : null}
          {cliente?.whatsapp ? (
            <View style={s.clientRow}>
              <Text style={s.clientLabel}>Telefone</Text>
              <Text style={s.clientValue}>{cliente.whatsapp}</Text>
            </View>
          ) : null}
          {cliente?.endereco ? (
            <View style={s.clientRow}>
              <Text style={s.clientLabel}>Endereço</Text>
              <Text style={s.clientValue}>
                {[cliente.endereco, cliente.numero, cliente.bairro, cliente.cidade].filter(Boolean).join(', ')}
              </Text>
            </View>
          ) : null}
        </View>

        {/* SCOPE */}
        {orcamento.descricaoGeral ? (
          <>
            <Text style={s.sectionTitle}>Escopo do Serviço</Text>
            <View style={s.scopeBox}>
              <Text style={s.scopeText}>{orcamento.descricaoGeral}</Text>
            </View>
          </>
        ) : null}

        {/* TABLE */}
        <Text style={s.sectionTitle}>Serviços</Text>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colNum]}>#</Text>
          <Text style={[s.tableHeaderText, s.colDesc]}>Descrição</Text>
          <Text style={[s.tableHeaderText, s.colMedida]}>Medida</Text>
          <Text style={[s.tableHeaderText, s.colUnit]}>V. Unitário</Text>
          <Text style={[s.tableHeaderText, s.colTotal]}>Total</Text>
        </View>
        {orcamento.itensServico.map((item, idx) => {
          const unitPrice = item.metragem > 0 ? item.valorVenda / item.metragem : item.valorVenda;
          return (
            <View key={item.id} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={[s.tableCell, s.colNum]}>{idx + 1}</Text>
              <Text style={[s.tableCell, s.colDesc]}>{item.nomeServico}</Text>
              <Text style={[s.tableCell, s.colMedida]}>{item.metragem}m</Text>
              <Text style={[s.tableCell, s.colUnit]}>{fmt(unitPrice)}</Text>
              <Text style={[s.tableCell, s.colTotal]}>{fmt(item.valorVenda)}</Text>
            </View>
          );
        })}

        {/* TOTALS */}
        <View style={s.totalsBox}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{fmt(orcamento.valorVenda)}</Text>
          </View>
          {(orcamento.desconto ?? 0) > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Desconto</Text>
              <Text style={[s.totalValue, { color: '#e53935' }]}>-{fmt(orcamento.desconto)}</Text>
            </View>
          )}
          <View style={[s.totalRow, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#ddd' }]}>
            <Text style={s.totalFinalLabel}>TOTAL</Text>
            <Text style={s.totalFinalValue}>{fmt(displayValue)}</Text>
          </View>
        </View>

        {/* CONDITIONS */}
        {(orcamento.formasPagamento || orcamento.garantia || orcamento.tempoGarantia) && (
          <>
            <Text style={s.sectionTitle}>Condições Comerciais</Text>
            <View style={s.conditionsGrid}>
              {orcamento.validade ? (
                <View style={s.conditionCard}>
                  <Text style={s.conditionTitle}>Validade</Text>
                  <Text style={s.conditionValue}>{orcamento.validade}</Text>
                </View>
              ) : null}
              {orcamento.formasPagamento ? (
                <View style={s.conditionCard}>
                  <Text style={s.conditionTitle}>Pagamento</Text>
                  <Text style={s.conditionValue}>{orcamento.formasPagamento}</Text>
                </View>
              ) : null}
              {orcamento.tempoGarantia ? (
                <View style={s.conditionCard}>
                  <Text style={s.conditionTitle}>Garantia</Text>
                  <Text style={s.conditionHighlight}>{orcamento.tempoGarantia}</Text>
                  {orcamento.garantia ? <Text style={[s.conditionValue, { marginTop: 2 }]}>{orcamento.garantia}</Text> : null}
                </View>
              ) : null}
            </View>
          </>
        )}

        {/* SIGNATURES */}
        <View style={s.signaturesRow}>
          <View style={s.signatureBlock}>
            <View style={s.signatureLine} />
            <Text style={s.signatureName}>{cliente?.nomeRazaoSocial || orcamento.nomeCliente}</Text>
            <Text style={s.signatureRole}>Cliente</Text>
          </View>
          <View style={s.signatureBlock}>
            <View style={s.signatureLine} />
            <Text style={s.signatureName}>{nomeEmpresa}</Text>
            <Text style={s.signatureRole}>Prestador</Text>
          </View>
        </View>

        {/* FOOTER (fixed on all pages) */}
        <View style={s.footer} fixed>
          <View style={s.footerLeft}>
            {logoBase64 && <Image src={logoBase64} style={s.footerLogo} />}
            <View>
              <Text style={s.footerText}>{nomeEmpresa}{slogan ? ` · ${slogan}` : ''}</Text>
              <Text style={s.footerText}>{[telefone, email].filter(Boolean).join(' · ')}</Text>
            </View>
          </View>
          <Text style={s.footerRight} render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
