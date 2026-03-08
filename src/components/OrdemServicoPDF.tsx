import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { Orcamento, Cliente, MinhaEmpresa } from '@/lib/types';

interface OrdemServicoPDFProps {
  orcamento: Orcamento;
  cliente?: Cliente | null;
  empresa?: MinhaEmpresa | null;
  logoBase64?: string | null;
  termoRecebimento?: string | null;
}

const fmtDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return d; }
};

const dificuldadeLabel: Record<string, string> = {
  facil: 'Fácil',
  medio: 'Média',
  dificil: 'Difícil',
};

export function OrdemServicoPDF({ orcamento, cliente, empresa, logoBase64, termoRecebimento }: OrdemServicoPDFProps) {
  const corPrimaria = empresa?.corPrimaria || '#0B1B32';
  const corDestaque = empresa?.corDestaque || '#F57C00';
  const nomeEmpresa = empresa?.nomeFantasia || 'Minha Empresa';
  const slogan = empresa?.slogan || '';
  const telefone = empresa?.telefoneWhatsApp || '';
  const email = empresa?.emailContato || '';

  const clienteEndereco = [cliente?.endereco, cliente?.numero, cliente?.bairro, cliente?.cidade]
    .filter(Boolean).join(', ');
  const clienteCep = cliente?.cep ? `CEP: ${cliente.cep}` : '';
  const enderecoCompleto = [clienteEndereco, clienteCep].filter(Boolean).join(' — ');

  const s = StyleSheet.create({
    page: { paddingTop: 30, paddingBottom: 80, paddingHorizontal: 30, fontSize: 9, fontFamily: 'Helvetica', color: '#333' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 2, borderBottomColor: corPrimaria, paddingBottom: 10 },
    logo: { width: 60, height: 60, marginRight: 12, objectFit: 'contain' },
    headerText: { flex: 1 },
    companyName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: corPrimaria },
    sloganText: { fontSize: 8, color: '#666', marginTop: 2 },
    contactLine: { fontSize: 7, color: '#666', marginTop: 3 },
    titleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: corDestaque, borderRadius: 4, padding: 10, marginBottom: 12 },
    titleText: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#fff' },
    titleNumber: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#fff' },
    titleDate: { fontSize: 9, color: '#fff' },
    sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: corPrimaria, marginBottom: 6, marginTop: 14, textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 3 },
    infoBox: { backgroundColor: '#f8f8f8', borderRadius: 4, padding: 10, marginBottom: 4 },
    infoRow: { flexDirection: 'row', marginBottom: 3 },
    infoLabel: { width: 100, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#555' },
    infoValue: { flex: 1, fontSize: 9, color: '#333' },
    tableHeader: { flexDirection: 'row', backgroundColor: corPrimaria, borderTopLeftRadius: 4, borderTopRightRadius: 4, paddingVertical: 6, paddingHorizontal: 8 },
    tableHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#fff' },
    tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
    tableRowAlt: { backgroundColor: '#f9f9f9' },
    tableCell: { fontSize: 8, color: '#333' },
    colNum: { width: 22 },
    colDesc: { flex: 1 },
    colMaterial: { width: 90 },
    colMetragem: { width: 55, textAlign: 'center' as const },
    colDificuldade: { width: 60, textAlign: 'center' as const },
    obsBox: { backgroundColor: '#fffde7', borderRadius: 4, padding: 10, marginBottom: 4, borderWidth: 1, borderColor: '#ffe082' },
    obsText: { fontSize: 9, color: '#333', lineHeight: 1.5 },
    termoBox: { backgroundColor: '#f1f8e9', borderRadius: 4, padding: 12, marginTop: 14, borderWidth: 1, borderColor: '#c5e1a5' },
    termoText: { fontSize: 9, color: '#333', lineHeight: 1.5, textAlign: 'justify' as const },
    signaturesRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 50, paddingTop: 10 },
    signatureBlock: { alignItems: 'center' as const, width: 210 },
    signatureLine: { width: 190, borderBottomWidth: 1, borderBottomColor: '#333', marginBottom: 5 },
    signatureName: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#333', textAlign: 'center' as const },
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
            {slogan ? <Text style={s.sloganText}>{slogan}</Text> : null}
            <Text style={s.contactLine}>
              {[telefone, email].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </View>

        {/* TITLE BAR - Orange for OS */}
        <View style={s.titleBar}>
          <View>
            <Text style={s.titleText}>ORDEM DE SERVIÇO</Text>
            <Text style={s.titleNumber}>#{orcamento.numeroOrcamento}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' as const }}>
            <Text style={s.titleDate}>Data: {fmtDate(orcamento.dataCriacao)}</Text>
          </View>
        </View>

        {/* DADOS DA OBRA */}
        <Text style={s.sectionTitle}>Dados da Obra</Text>
        <View style={s.infoBox}>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Cliente</Text>
            <Text style={s.infoValue}>{cliente?.nomeRazaoSocial || orcamento.nomeCliente}</Text>
          </View>
          {cliente?.whatsapp ? (
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Contato</Text>
              <Text style={s.infoValue}>{cliente.whatsapp}</Text>
            </View>
          ) : null}
          {enderecoCompleto ? (
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Endereço da Obra</Text>
              <Text style={s.infoValue}>{enderecoCompleto}</Text>
            </View>
          ) : null}
        </View>

        {/* SERVIÇOS - sem preços */}
        <Text style={s.sectionTitle}>Descrição de Execução</Text>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colNum]}>#</Text>
          <Text style={[s.tableHeaderText, s.colDesc]}>Descrição</Text>
          <Text style={[s.tableHeaderText, s.colMaterial]}>Material</Text>
          <Text style={[s.tableHeaderText, s.colMetragem]}>Metragem</Text>
          <Text style={[s.tableHeaderText, s.colDificuldade]}>Dificuldade</Text>
        </View>
        {orcamento.itensServico.map((item, idx) => (
          <View key={item.id} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}>
            <Text style={[s.tableCell, s.colNum]}>{idx + 1}</Text>
            <Text style={[s.tableCell, s.colDesc]}>{item.nomeServico}</Text>
            <Text style={[s.tableCell, s.colMaterial]}>{item.materialId || '—'}</Text>
            <Text style={[s.tableCell, s.colMetragem]}>{item.metragem} m</Text>
            <Text style={[s.tableCell, s.colDificuldade]}>{dificuldadeLabel[item.dificuldade] || item.dificuldade}</Text>
          </View>
        ))}

        {/* OBSERVAÇÕES DE OBRA */}
        {orcamento.descricaoGeral ? (
          <>
            <Text style={s.sectionTitle}>Observações de Obra</Text>
            <View style={s.obsBox}>
              <Text style={s.obsText}>{orcamento.descricaoGeral}</Text>
            </View>
          </>
        ) : null}

        {/* CANHOTO DE ENTREGA */}
        <Text style={s.sectionTitle}>Canhoto de Entrega (Assinar somente após a execução)</Text>
        <View style={s.termoBox}>
          <Text style={s.termoText}>
            {termoRecebimento || 'CONCLUÍDO: Declaro que, nesta data, os serviços acima descritos foram conferidos, executados e entregues em perfeitas condições.'}
          </Text>
        </View>

        {/* ASSINATURAS */}
        <View style={s.signaturesRow}>
          <View style={s.signatureBlock}>
            <View style={s.signatureLine} />
            <Text style={s.signatureName}>Técnico Responsável</Text>
          </View>
          <View style={s.signatureBlock}>
            <View style={s.signatureLine} />
            <Text style={s.signatureName}>Cliente (Recebimento)</Text>
          </View>
        </View>

        {/* FOOTER */}
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
