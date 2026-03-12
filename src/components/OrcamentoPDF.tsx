import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
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
  try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return d; }
};

const fmtNum = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─── Status labels ─── */
const statusLabel: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  executado: 'Executado',
};

export function OrcamentoPDF({ orcamento, cliente, empresa, logoBase64 }: OrcamentoPDFProps) {
  const corPrimaria = empresa?.corPrimaria || '#0B1B32';
  const corDestaque = empresa?.corDestaque || '#F57C00';
  const nomeEmpresa = empresa?.nomeFantasia || 'Minha Empresa';
  const razaoSocial = empresa?.razaoSocial || '';
  const slogan = empresa?.slogan || '';
  const telefone = empresa?.telefoneWhatsApp || '';
  const email = empresa?.emailContato || '';
  const cnpjCpf = empresa?.cnpjCpf || '';
  const enderecoEmpresa = [empresa?.endereco, empresa?.numero, empresa?.bairro, empresa?.cidade, empresa?.estado]
    .filter(Boolean).join(', ');

  const isPJ = cliente?.tipo === 'PJ';
  const displayValue = (orcamento.desconto ?? 0) > 0 ? orcamento.valorFinal : orcamento.valorVenda;

  const s = StyleSheet.create({
    page: { paddingTop: 28, paddingBottom: 70, paddingHorizontal: 28, fontSize: 8, fontFamily: 'Helvetica', color: '#222' },

    /* ── Header ── */
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, borderBottomWidth: 2, borderBottomColor: corPrimaria, paddingBottom: 10 },
    logo: { width: 54, height: 54, marginRight: 10, objectFit: 'contain' as const },
    headerLeft: { flex: 1 },
    companyName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: corPrimaria },
    razaoSocial: { fontSize: 7, color: '#555', marginTop: 1 },
    sloganText: { fontSize: 7, color: corDestaque, marginTop: 2, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    headerRight: { alignItems: 'flex-end' as const, gap: 2 },
    headerContactLine: { fontSize: 6.5, color: '#555' },

    /* ── Identification bar ── */
    idBar: { flexDirection: 'row', backgroundColor: '#f5f5f5', borderRadius: 4, marginBottom: 14, borderWidth: 0.5, borderColor: '#e0e0e0' },
    idCell: { flex: 1, paddingVertical: 7, paddingHorizontal: 8, borderRightWidth: 0.5, borderRightColor: '#e0e0e0' },
    idCellLast: { flex: 1, paddingVertical: 7, paddingHorizontal: 8 },
    idLabel: { fontSize: 6, color: '#888', textTransform: 'uppercase' as const, marginBottom: 2, letterSpacing: 0.3 },
    idValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: corPrimaria },
    idValueAccent: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: corDestaque },

    /* ── Section titles ── */
    sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: corPrimaria, marginBottom: 6, marginTop: 14, textTransform: 'uppercase' as const, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 3 },

    /* ── Client data grid ── */
    gridRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e8e8e8' },
    gridCell: { paddingVertical: 5, paddingHorizontal: 7, borderRightWidth: 0.5, borderRightColor: '#e8e8e8' },
    gridCellLast: { paddingVertical: 5, paddingHorizontal: 7 },
    gridLabel: { fontSize: 6, color: '#888', textTransform: 'uppercase' as const, marginBottom: 2 },
    gridValue: { fontSize: 8, color: '#222' },

    /* ── Scope ── */
    scopeBox: { borderLeftWidth: 3, borderLeftColor: corDestaque, backgroundColor: '#fafafa', borderRadius: 3, padding: 10, marginBottom: 4 },
    scopeSubtitle: { fontSize: 6.5, color: corDestaque, textTransform: 'uppercase' as const, marginBottom: 4, letterSpacing: 0.3 },
    scopeText: { fontSize: 8.5, color: '#333', lineHeight: 1.5 },

    /* ── Services table ── */
    tableHeader: { flexDirection: 'row', backgroundColor: corPrimaria, borderTopLeftRadius: 4, borderTopRightRadius: 4, paddingVertical: 6, paddingHorizontal: 6 },
    tableHeaderText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#fff' },
    tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
    tableRowAlt: { backgroundColor: '#f9f9f9' },
    tableCell: { fontSize: 7.5, color: '#333' },
    colItem: { width: 24 },
    colDesc: { flex: 1 },
    colQtd: { width: 38, textAlign: 'center' as const },
    colUnit: { width: 62, textAlign: 'right' as const },
    colTotal: { width: 62, textAlign: 'right' as const },

    /* ── Financial summary ── */
    finRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
    finCard: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 4, paddingVertical: 8, paddingHorizontal: 10, borderWidth: 0.5, borderColor: '#e0e0e0' },
    finCardAccent: { flex: 1, backgroundColor: corDestaque, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 10 },
    finLabel: { fontSize: 6, color: '#888', textTransform: 'uppercase' as const, marginBottom: 3 },
    finLabelWhite: { fontSize: 6, color: '#fff', textTransform: 'uppercase' as const, marginBottom: 3, opacity: 0.9 },
    finValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#222' },
    finValueRed: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#d32f2f' },
    finValueWhite: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#fff' },
    finSubtitle: { fontSize: 7, color: '#fff', opacity: 0.85, marginTop: 1 },

    /* ── Conditions ── */
    condRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    condCard: { flex: 1, backgroundColor: '#f8f8f8', borderRadius: 4, padding: 8, borderWidth: 0.5, borderColor: '#e8e8e8' },
    condTitle: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: '#555', marginBottom: 3, textTransform: 'uppercase' as const },
    condValue: { fontSize: 8, color: '#333', lineHeight: 1.4 },

    /* ── Signatures ── */
    sigSection: { marginTop: 20 },
    sigDescription: { fontSize: 7.5, color: '#555', lineHeight: 1.4, marginBottom: 16 },
    sigRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
    sigBlock: { alignItems: 'center' as const, width: 200 },
    sigLine: { width: 180, borderBottomWidth: 1, borderBottomColor: '#333', marginBottom: 4 },
    sigName: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#333', textAlign: 'center' as const },
    sigLabel: { fontSize: 6.5, color: '#888', textAlign: 'center' as const, marginTop: 1 },

    /* ── Footer ── */
    footer: { position: 'absolute' as const, bottom: 16, left: 28, right: 28, backgroundColor: corPrimaria, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    footerLeft: { flex: 1 },
    footerCompany: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#fff' },
    footerDoc: { fontSize: 6, color: '#ccc', marginTop: 1 },
    footerContact: { fontSize: 6, color: '#ccc', marginTop: 1 },
    footerPage: { fontSize: 6, color: '#ccc' },
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ═══ HEADER ═══ */}
        <View style={s.header}>
          {logoBase64 && <Image src={logoBase64} style={s.logo} />}
          <View style={s.headerLeft}>
            <Text style={s.companyName}>{nomeEmpresa}</Text>
            {razaoSocial ? <Text style={s.razaoSocial}>{razaoSocial}</Text> : null}
            {slogan ? <Text style={s.sloganText}>{slogan}</Text> : null}
          </View>
          <View style={s.headerRight}>
            {cnpjCpf ? <Text style={s.headerContactLine}>{cnpjCpf}</Text> : null}
            {telefone ? <Text style={s.headerContactLine}>{telefone}</Text> : null}
            {email ? <Text style={s.headerContactLine}>{email}</Text> : null}
            {enderecoEmpresa ? <Text style={s.headerContactLine}>{enderecoEmpresa}</Text> : null}
          </View>
        </View>

        {/* ═══ IDENTIFICATION BAR ═══ */}
        <View style={s.idBar}>
          <View style={s.idCell}>
            <Text style={s.idLabel}>Orçamento</Text>
            <Text style={s.idValueAccent}>#{orcamento.numeroOrcamento}</Text>
          </View>
          <View style={s.idCell}>
            <Text style={s.idLabel}>Data</Text>
            <Text style={s.idValue}>{fmtDate(orcamento.dataCriacao)}</Text>
          </View>
          <View style={s.idCell}>
            <Text style={s.idLabel}>Validade</Text>
            <Text style={s.idValue}>{orcamento.validade || '—'}</Text>
          </View>
          <View style={s.idCellLast}>
            <Text style={s.idLabel}>Cliente</Text>
            <Text style={s.idValue}>{cliente?.nomeRazaoSocial || orcamento.nomeCliente}</Text>
          </View>
        </View>

        {/* ═══ CLIENT DATA GRID ═══ */}
        <Text style={s.sectionTitle}>Dados do Cliente</Text>
        <View style={{ borderWidth: 0.5, borderColor: '#e8e8e8', borderRadius: 4 }}>
          {/* Row 1: Tipo | Nome | Documento */}
          <View style={s.gridRow}>
            <View style={[s.gridCell, { width: '20%' }]}>
              <Text style={s.gridLabel}>Tipo</Text>
              <Text style={s.gridValue}>{isPJ ? 'Pessoa Jurídica' : 'Pessoa Física'}</Text>
            </View>
            <View style={[s.gridCell, { flex: 1 }]}>
              <Text style={s.gridLabel}>{isPJ ? 'Razão Social' : 'Nome'}</Text>
              <Text style={s.gridValue}>{cliente?.nomeRazaoSocial || orcamento.nomeCliente}</Text>
            </View>
            <View style={[s.gridCellLast, { width: '25%' }]}>
              <Text style={s.gridLabel}>{isPJ ? 'CNPJ' : 'CPF'}</Text>
              <Text style={s.gridValue}>{cliente?.documento || '—'}</Text>
            </View>
          </View>
          {/* Row 2: WhatsApp | CEP | Cidade | Bairro */}
          <View style={s.gridRow}>
            <View style={[s.gridCell, { width: '25%' }]}>
              <Text style={s.gridLabel}>WhatsApp</Text>
              <Text style={s.gridValue}>{cliente?.whatsapp || '—'}</Text>
            </View>
            <View style={[s.gridCell, { width: '18%' }]}>
              <Text style={s.gridLabel}>CEP</Text>
              <Text style={s.gridValue}>{cliente?.cep || '—'}</Text>
            </View>
            <View style={[s.gridCell, { flex: 1 }]}>
              <Text style={s.gridLabel}>Cidade</Text>
              <Text style={s.gridValue}>{cliente?.cidade || '—'}</Text>
            </View>
            <View style={[s.gridCellLast, { width: '25%' }]}>
              <Text style={s.gridLabel}>Bairro</Text>
              <Text style={s.gridValue}>{cliente?.bairro || '—'}</Text>
            </View>
          </View>
          {/* Row 3: Endereço | Número */}
          <View style={{ flexDirection: 'row' }}>
            <View style={[s.gridCell, { flex: 1 }]}>
              <Text style={s.gridLabel}>Endereço</Text>
              <Text style={s.gridValue}>{cliente?.endereco || '—'}</Text>
            </View>
            <View style={[s.gridCellLast, { width: '18%' }]}>
              <Text style={s.gridLabel}>Número</Text>
              <Text style={s.gridValue}>{cliente?.numero || '—'}</Text>
            </View>
          </View>
        </View>

        {/* ═══ SCOPE ═══ */}
        {orcamento.descricaoGeral ? (
          <>
            <Text style={s.sectionTitle}>Escopo do Serviço</Text>
            <View style={s.scopeBox}>
              <Text style={s.scopeSubtitle}>Descrição geral da proposta</Text>
              <Text style={s.scopeText}>{orcamento.descricaoGeral}</Text>
            </View>
          </>
        ) : null}

        {/* ═══ SERVICES TABLE ═══ */}
        <Text style={s.sectionTitle}>Serviços</Text>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colItem]}>Item</Text>
          <Text style={[s.tableHeaderText, s.colDesc]}>Descrição</Text>
          <Text style={[s.tableHeaderText, s.colQtd]}>Qtd.</Text>
          <Text style={[s.tableHeaderText, s.colUnit]}>Vlr. Unit.</Text>
          <Text style={[s.tableHeaderText, s.colTotal]}>Vlr. Total</Text>
        </View>
        {orcamento.itensServico.map((item, idx) => {
          const unitPrice = item.metragem > 0 ? item.valorVenda / item.metragem : item.valorVenda;
          return (
            <View key={item.id} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={[s.tableCell, s.colItem]}>{String(idx + 1).padStart(2, '0')}</Text>
              <Text style={[s.tableCell, s.colDesc]}>{item.nomeServico}</Text>
              <Text style={[s.tableCell, s.colQtd]}>{fmtNum(item.metragem)}</Text>
              <Text style={[s.tableCell, s.colUnit]}>{fmt(unitPrice)}</Text>
              <Text style={[s.tableCell, s.colTotal, { fontFamily: 'Helvetica-Bold' }]}>{fmt(item.valorVenda)}</Text>
            </View>
          );
        })}

        {/* ═══ FINANCIAL SUMMARY ═══ */}
        <Text style={s.sectionTitle}>Resumo Financeiro</Text>
        <View wrap={false}>
          <View style={s.finRow}>
            <View style={s.finCard}>
              <Text style={s.finLabel}>Valor de Venda</Text>
              <Text style={s.finValue}>{fmt(orcamento.valorVenda)}</Text>
            </View>
            <View style={s.finCard}>
              <Text style={s.finLabel}>Desconto</Text>
              <Text style={(orcamento.desconto ?? 0) > 0 ? s.finValueRed : s.finValue}>
                {(orcamento.desconto ?? 0) > 0 ? `-${fmt(orcamento.desconto)}` : '—'}
              </Text>
            </View>
            <View style={s.finCardAccent}>
              <Text style={s.finLabelWhite}>Total Final</Text>
              <Text style={s.finValueWhite}>{fmt(displayValue)}</Text>
              <Text style={s.finSubtitle}>Valor final da proposta comercial</Text>
            </View>
          </View>
        </View>

        {/* ═══ CONDITIONS ═══ */}
        {(orcamento.formasPagamento || orcamento.tempoGarantia || orcamento.validade) && (
          <>
            <Text style={s.sectionTitle}>Condições Comerciais</Text>
            <View style={s.condRow} wrap={false}>
              {orcamento.validade ? (
                <View style={s.condCard}>
                  <Text style={s.condTitle}>Validade da Proposta</Text>
                  <Text style={s.condValue}>{orcamento.validade}</Text>
                </View>
              ) : null}
              {orcamento.formasPagamento ? (
                <View style={s.condCard}>
                  <Text style={s.condTitle}>Formas de Pagamento</Text>
                  <Text style={s.condValue}>{orcamento.formasPagamento}</Text>
                </View>
              ) : null}
              {orcamento.tempoGarantia ? (
                <View style={s.condCard}>
                  <Text style={s.condTitle}>Garantia</Text>
                  <Text style={[s.condValue, { fontFamily: 'Helvetica-Bold', color: corDestaque }]}>{orcamento.tempoGarantia}</Text>
                  {orcamento.garantia ? <Text style={[s.condValue, { marginTop: 2 }]}>{orcamento.garantia}</Text> : null}
                </View>
              ) : null}
            </View>
          </>
        )}

        {/* ═══ SIGNATURES ═══ */}
        <View style={s.sigSection} wrap={false}>
          <Text style={s.sectionTitle}>Assinaturas</Text>
          <Text style={s.sigDescription}>
            Confirmando o aceite desta proposta, as partes declaram estar de acordo com o escopo, condições comerciais e valores apresentados neste documento.
          </Text>
          <View style={s.sigRow}>
            <View style={s.sigBlock}>
              <View style={s.sigLine} />
              <Text style={s.sigName}>{cliente?.nomeRazaoSocial || orcamento.nomeCliente}</Text>
              <Text style={s.sigLabel}>CLIENTE</Text>
            </View>
            <View style={s.sigBlock}>
              <View style={s.sigLine} />
              <Text style={s.sigName}>{nomeEmpresa}</Text>
              <Text style={s.sigLabel}>RESPONSÁVEL</Text>
            </View>
          </View>
        </View>

        {/* ═══ FOOTER ═══ */}
        <View style={s.footer} fixed>
          <View style={s.footerLeft}>
            <Text style={s.footerCompany}>{nomeEmpresa.toUpperCase()}</Text>
            {cnpjCpf ? <Text style={s.footerDoc}>{cnpjCpf}</Text> : null}
            <Text style={s.footerContact}>
              {[enderecoEmpresa, telefone, email].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <Text style={s.footerPage} render={({ pageNumber, totalPages }) => `Página ${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
