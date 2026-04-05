import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Orcamento, Cliente, MinhaEmpresa } from "@/lib/types";
import { resolveEffectiveColor } from "@/lib/colorUtils";

interface OrdemServicoPDFProps {
  orcamento: Orcamento;
  cliente?: Cliente | null;
  empresa?: MinhaEmpresa | null;
  logoBase64?: string | null;
  termoRecebimento?: string | null;
  platformColor?: string;
}

const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("pt-BR");
  } catch {
    return d;
  }
};

const fmtNum = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  executado: "Executado",
};

export function OrdemServicoPDF({ orcamento, cliente, empresa, logoBase64, termoRecebimento }: OrdemServicoPDFProps) {
  const corPrimaria = empresa?.corPrimaria || "#0B1B32";
  const corDestaque = empresa?.corDestaque || "#5866D6";
  const nomeEmpresa = empresa?.nomeFantasia || "Minha Empresa";
  const cnpjCpf = empresa?.cnpjCpf || "";
  const telefone = empresa?.telefoneWhatsApp || "";
  const email = empresa?.emailContato || "";

  const s = StyleSheet.create({
    page: {
      paddingTop: 28,
      paddingBottom: 70,
      paddingHorizontal: 28,
      fontSize: 8,
      fontFamily: "Helvetica",
      color: "#222",
    },

    /* ── Header ── */
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      borderBottomWidth: 2,
      borderBottomColor: corPrimaria,
      paddingBottom: 10,
    },
    logo: { width: 50, height: 50, marginRight: 10, objectFit: "contain" as const },
    headerLeft: { flex: 1 },
    companyName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: corPrimaria },
    headerContact: { fontSize: 6.5, color: "#555", marginTop: 2 },
    headerBadge: {
      backgroundColor: corDestaque,
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 14,
      alignItems: "center" as const,
    },
    badgeSmall: { fontSize: 6, color: "#fff", opacity: 0.85, textTransform: "uppercase" as const, marginBottom: 2 },
    badgeLarge: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#fff" },

    /* ── Identification bar ── */
    idBar: {
      flexDirection: "row",
      backgroundColor: "#f5f5f5",
      borderRadius: 4,
      marginBottom: 14,
      borderWidth: 0.5,
      borderColor: "#e0e0e0",
    },
    idCell: { flex: 1, paddingVertical: 6, paddingHorizontal: 6, borderRightWidth: 0.5, borderRightColor: "#e0e0e0" },
    idCellLast: { flex: 1, paddingVertical: 6, paddingHorizontal: 6 },
    idLabel: { fontSize: 5.5, color: "#888", textTransform: "uppercase" as const, marginBottom: 2, letterSpacing: 0.3 },
    idValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#222" },
    idValueAccent: { fontSize: 8, fontFamily: "Helvetica-Bold", color: corDestaque },

    /* ── Section titles ── */
    sectionTitle: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: corPrimaria,
      marginBottom: 6,
      marginTop: 14,
      textTransform: "uppercase" as const,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      paddingBottom: 3,
    },

    /* ── Grid (client/job data) ── */
    gridRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e8e8e8" },
    gridCell: { paddingVertical: 5, paddingHorizontal: 6, borderRightWidth: 0.5, borderRightColor: "#e8e8e8" },
    gridCellLast: { paddingVertical: 5, paddingHorizontal: 6 },
    gridLabel: { fontSize: 5.5, color: "#888", textTransform: "uppercase" as const, marginBottom: 2 },
    gridValue: { fontSize: 8, color: "#222" },

    /* ── Execution table ── */
    tableHeader: {
      flexDirection: "row",
      backgroundColor: corPrimaria,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      paddingVertical: 6,
      paddingHorizontal: 6,
    },
    tableHeaderText: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: "#fff" },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 5,
      paddingHorizontal: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: "#eee",
      alignItems: "center" as const,
      minHeight: 18,
    },
    tableRowAlt: { backgroundColor: "#f9f9f9" },
    tableCell: { fontSize: 7, color: "#333" },
    tColNum: { width: 22 },
    tColServ: { flex: 1 },
    tColQtd: { width: 45, textAlign: "center" as const },
    tColMat: { width: 80 },
    tColEsp: { width: 42, textAlign: "center" as const },
    tColCorte: { width: 48, textAlign: "center" as const },

    /* ── Observations ── */
    obsBox: { backgroundColor: "#fffde7", borderRadius: 4, padding: 10, borderWidth: 1, borderColor: "#ffe082" },
    obsText: { fontSize: 8, color: "#333", lineHeight: 1.5 },

    /* ── Canhoto ── */
    canhotoDivider: { borderTopWidth: 1, borderTopColor: "#999", borderStyle: "dashed" as const, marginBottom: 6 },
    canhotoCutLabel: { fontSize: 6, color: "#999", textAlign: "center" as const, marginBottom: 8 },
    canhotoBorder: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 12 },
    canhotoHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start" as const,
      marginBottom: 10,
    },
    canhotoTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: corPrimaria },
    canhotoSubtitle: { fontSize: 7, color: "#666", marginTop: 1 },
    canhotoRefBadge: {
      backgroundColor: "#f5f5f5",
      borderRadius: 3,
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderWidth: 0.5,
      borderColor: "#ddd",
    },
    canhotoRefLabel: { fontSize: 5.5, color: "#888", textTransform: "uppercase" as const },
    canhotoRefValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: corDestaque },
    canhotoMetaRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 10,
      paddingBottom: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: "#eee",
    },
    canhotoMetaCell: { flex: 1 },
    canhotoMetaLabel: { fontSize: 5.5, color: "#888", textTransform: "uppercase" as const, marginBottom: 1 },
    canhotoMetaValue: { fontSize: 7.5, color: "#222" },
    canhotoTermText: { fontSize: 7.5, color: "#333", lineHeight: 1.5, marginBottom: 14, textAlign: "justify" as const },
    canhotoSigRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
    canhotoSigBlock: { alignItems: "center" as const, width: 150 },
    canhotoSigLine: { width: 140, borderBottomWidth: 1, borderBottomColor: "#555", marginBottom: 3 },
    canhotoSigLabel: { fontSize: 6, color: "#666", textAlign: "center" as const },

    /* ── Footer ── */
    footer: {
      position: "absolute" as const,
      bottom: 16,
      left: 28,
      right: 28,
      backgroundColor: corPrimaria,
      borderRadius: 4,
      paddingVertical: 7,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    footerCompany: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#fff" },
    footerContact: { fontSize: 5.5, color: "#ccc", marginTop: 1 },
    footerRight: { fontSize: 5.5, color: "#ccc", textAlign: "right" as const },
  });

  const osNumero = `OS-${orcamento.numeroOrcamento}`;
  const orcNumero = `ORC-${orcamento.numeroOrcamento}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ═══ HEADER ═══ */}
        <View style={s.header}>
          {logoBase64 && <Image src={logoBase64} style={s.logo} />}
          <View style={s.headerLeft}>
            <Text style={s.companyName}>{nomeEmpresa}</Text>
            {cnpjCpf ? <Text style={s.headerContact}>{cnpjCpf}</Text> : null}
            <Text style={s.headerContact}>{[telefone, email].filter(Boolean).join(" · ")}</Text>
          </View>
          <View style={s.headerBadge}>
            <Text style={s.badgeSmall}>Documento</Text>
            <Text style={s.badgeLarge}>ORDEM DE SERVIÇO</Text>
          </View>
        </View>

        {/* ═══ IDENTIFICATION BAR ═══ */}
        <View style={s.idBar}>
          <View style={s.idCell}>
            <Text style={s.idLabel}>Nº da OS</Text>
            <Text style={s.idValueAccent}>{osNumero}</Text>
          </View>
          <View style={s.idCell}>
            <Text style={s.idLabel}>Data</Text>
            <Text style={s.idValue}>{fmtDate(orcamento.dataCriacao)}</Text>
          </View>
          <View style={s.idCell}>
            <Text style={s.idLabel}>Nº do Orçamento</Text>
            <Text style={s.idValue}>{orcNumero}</Text>
          </View>
          <View style={s.idCell}>
            <Text style={s.idLabel}>Técnico Responsável</Text>
            <Text style={s.idValue}>{nomeEmpresa}</Text>
          </View>
          <View style={s.idCellLast}>
            <Text style={s.idLabel}>Status</Text>
            <Text style={s.idValue}>{statusLabel[orcamento.status] || orcamento.status}</Text>
          </View>
        </View>

        {/* ═══ JOB DATA GRID ═══ */}
        <Text style={s.sectionTitle}>Dados da Obra</Text>
        <View style={{ borderWidth: 0.5, borderColor: "#e8e8e8", borderRadius: 4 }}>
          <View style={s.gridRow}>
            <View style={[s.gridCell, { flex: 2 }]}>
              <Text style={s.gridLabel}>Cliente / Responsável</Text>
              <Text style={s.gridValue}>{cliente?.nomeRazaoSocial || orcamento.nomeCliente}</Text>
            </View>
            <View style={[s.gridCell, { flex: 1 }]}>
              <Text style={s.gridLabel}>Telefone / Contato</Text>
              <Text style={s.gridValue}>{cliente?.whatsapp || "—"}</Text>
            </View>
            <View style={[s.gridCellLast, { flex: 1 }]}>
              <Text style={s.gridLabel}>Documento</Text>
              <Text style={s.gridValue}>{cliente?.documento || "—"}</Text>
            </View>
          </View>
          <View style={s.gridRow}>
            <View style={[s.gridCell, { width: "16%" }]}>
              <Text style={s.gridLabel}>CEP</Text>
              <Text style={s.gridValue}>{cliente?.cep || "—"}</Text>
            </View>
            <View style={[s.gridCell, { flex: 1 }]}>
              <Text style={s.gridLabel}>Endereço</Text>
              <Text style={s.gridValue}>{cliente?.endereco || "—"}</Text>
            </View>
            <View style={[s.gridCellLast, { width: "14%" }]}>
              <Text style={s.gridLabel}>Número</Text>
              <Text style={s.gridValue}>{cliente?.numero || "—"}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={[s.gridCell, { flex: 1 }]}>
              <Text style={s.gridLabel}>Bairro</Text>
              <Text style={s.gridValue}>{cliente?.bairro || "—"}</Text>
            </View>
            <View style={[s.gridCell, { flex: 1 }]}>
              <Text style={s.gridLabel}>Cidade / UF</Text>
              <Text style={s.gridValue}>{cliente?.cidade || "—"}</Text>
            </View>
            <View style={[s.gridCellLast, { flex: 1 }]}>
              <Text style={s.gridLabel}>Observações Iniciais</Text>
              <Text style={s.gridValue}>—</Text>
            </View>
          </View>
        </View>

        {/* ═══ EXECUTION TABLE ═══ */}
        <Text style={s.sectionTitle}>Serviços a Executar</Text>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.tColNum]}>#</Text>
          <Text style={[s.tableHeaderText, s.tColServ]}>Serviço</Text>
          <Text style={[s.tableHeaderText, s.tColQtd]}>Qtd.</Text>
          <Text style={[s.tableHeaderText, s.tColMat]}>Material</Text>
          <Text style={[s.tableHeaderText, s.tColEsp]}>Esp.</Text>
          <Text style={[s.tableHeaderText, s.tColCorte]}>Corte</Text>
        </View>
        {orcamento.itensServico.map((item, idx) => (
          <View key={item.id} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}>
            <Text style={[s.tableCell, s.tColNum]}>{String(idx + 1).padStart(2, "0")}</Text>
            <Text style={[s.tableCell, s.tColServ]}>{item.nomeServico}</Text>
            <Text style={[s.tableCell, s.tColQtd]}>{fmtNum(item.metragem)}</Text>
            <Text style={[s.tableCell, s.tColMat]}>{item.materialId || "—"}</Text>
            <Text style={[s.tableCell, s.tColEsp]}>{item.espessura || "—"}</Text>
            <Text style={[s.tableCell, s.tColCorte]}>{item.corte || "—"}</Text>
          </View>
        ))}

        {/* ═══ OBSERVATIONS ═══ */}
        {orcamento.descricaoGeral ? (
          <>
            <Text style={s.sectionTitle}>Observações de Obra</Text>
            <View style={s.obsBox}>
              <Text style={s.obsText}>{orcamento.descricaoGeral}</Text>
            </View>
          </>
        ) : null}

        {/* ═══ CANHOTO ═══ */}
        <View wrap={false} style={{ marginTop: 24 }}>
          <View style={s.canhotoDivider} />
          <Text style={s.canhotoCutLabel}>✂ Destacar canhoto</Text>

          <View style={s.canhotoBorder}>
            <View style={s.canhotoHeader}>
              <View>
                <Text style={s.canhotoTitle}>Canhoto de Recebimento / Conclusão</Text>
                <Text style={s.canhotoSubtitle}>Confirmação de conclusão e aceite do serviço executado.</Text>
              </View>
              <View style={s.canhotoRefBadge}>
                <Text style={s.canhotoRefLabel}>Ref. da OS</Text>
                <Text style={s.canhotoRefValue}>{osNumero}</Text>
              </View>
            </View>

            <View style={s.canhotoMetaRow}>
              <View style={s.canhotoMetaCell}>
                <Text style={s.canhotoMetaLabel}>Cliente</Text>
                <Text style={s.canhotoMetaValue}>{cliente?.nomeRazaoSocial || orcamento.nomeCliente}</Text>
              </View>
              <View style={s.canhotoMetaCell}>
                <Text style={s.canhotoMetaLabel}>Data</Text>
                <Text style={s.canhotoMetaValue}>{fmtDate(orcamento.dataCriacao)}</Text>
              </View>
              <View style={s.canhotoMetaCell}>
                <Text style={s.canhotoMetaLabel}>Orçamento</Text>
                <Text style={s.canhotoMetaValue}>{orcNumero}</Text>
              </View>
            </View>

            <Text style={s.canhotoTermText}>
              {termoRecebimento ||
                "Declaro que os serviços descritos nesta Ordem de Serviço foram executados de forma satisfatória e em conformidade com o combinado, sem ressalvas quanto ao prazo e qualidade da entrega."}
            </Text>

            <View style={s.canhotoSigRow}>
              <View style={s.canhotoSigBlock}>
                <View style={s.canhotoSigLine} />
                <Text style={s.canhotoSigLabel}>Data de Conclusão</Text>
              </View>
              <View style={s.canhotoSigBlock}>
                <View style={s.canhotoSigLine} />
                <Text style={s.canhotoSigLabel}>Assinatura do Cliente</Text>
              </View>
              <View style={s.canhotoSigBlock}>
                <View style={s.canhotoSigLine} />
                <Text style={s.canhotoSigLabel}>Assinatura do Técnico</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ═══ FOOTER ═══ */}
        <View style={s.footer} fixed>
          <View>
            <Text style={s.footerCompany}>{nomeEmpresa.toUpperCase()}</Text>
            <Text style={s.footerContact}>{[cnpjCpf, telefone, email].filter(Boolean).join(" · ")}</Text>
          </View>
          <View style={{ alignItems: "flex-end" as const }}>
            <Text style={s.footerRight}>{osNumero}</Text>
            <Text style={s.footerRight} render={({ pageNumber, totalPages }) => `Página ${pageNumber}/${totalPages}`} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
