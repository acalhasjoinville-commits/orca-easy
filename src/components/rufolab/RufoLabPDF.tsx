// RufoLab — PDF técnico da obra.
// Documento em @react-pdf/renderer com identidade visual da empresa
// (logo + cor primária/destaque). Usado pelo RufoLabPDFButton.
import { Document, Image, Page, StyleSheet, Svg, Polyline, Text, View } from "@react-pdf/renderer";

import { construirDesenho } from "@/lib/rufolab/geometry";
import type { RufoLabPiece, RufoLabProject } from "@/lib/rufolab/types";
import type { MinhaEmpresa } from "@/lib/types";
import { type PdfLogoAsset } from "@/lib/fetchLogoBase64";

interface RufoLabPDFProps {
  project: RufoLabProject;
  pieces: RufoLabPiece[];
  empresa?: MinhaEmpresa | null;
  logo?: PdfLogoAsset | null;
}

const fmtNum = (v: number, digits = 2) =>
  (Number.isFinite(v) ? v : 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const fmtDate = (iso?: string) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
};

// ----- Mini canvas SVG para o PDF -----
// Reutiliza construirDesenho() para gerar polyline. Normaliza para caber
// numa caixa fixa (em pontos PDF), mantendo aspect ratio.
function PiecePreview({ piece, size = 130 }: { piece: RufoLabPiece; size?: number }) {
  const desenho = construirDesenho(piece.segmentos);
  const widthMm = Math.max(1, desenho.bbox.maxX - desenho.bbox.minX);
  const heightMm = Math.max(1, desenho.bbox.maxY - desenho.bbox.minY);
  const padding = 6;
  const viewMinX = desenho.bbox.minX - padding;
  const viewMinY = desenho.bbox.minY - padding;
  const viewW = widthMm + padding * 2;
  const viewH = heightMm + padding * 2;
  const aspect = viewW / viewH;
  const renderW = aspect >= 1 ? size : size * aspect;
  const renderH = aspect >= 1 ? size / aspect : size;

  const points = desenho.pontos.map((p) => `${p.x},${p.y}`).join(" ");
  const stroke = Math.max(0.6, Math.min(viewW, viewH) / 120);

  return (
    <Svg viewBox={`${viewMinX} ${viewMinY} ${viewW} ${viewH}`} width={renderW} height={renderH}>
      <Polyline
        points={points}
        stroke="#0B1B32"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function RufoLabPDF({ project, pieces, empresa, logo }: RufoLabPDFProps) {
  const corPrimaria = empresa?.corPrimaria || "#0B1B32";
  const corDestaque = empresa?.corDestaque || "#5866D6";
  const nomeEmpresa = empresa?.nomeFantasia || "Minha Empresa";
  const slogan = empresa?.slogan || "";
  const telefone = empresa?.telefoneWhatsApp || "";
  const email = empresa?.emailContato || "";
  const enderecoEmpresa = [
    empresa?.endereco,
    empresa?.numero,
    empresa?.bairro,
    empresa?.cidade,
    empresa?.estado,
  ]
    .filter(Boolean)
    .join(", ");

  const hasLogo = Boolean(logo?.dataUrl);
  const showBrandText = !hasLogo || logo?.kind === "icon";

  // Totais agregados
  const totalArea = pieces.reduce((acc, p) => acc + (p.calcSnapshot?.area ?? 0), 0);
  const totalDobras = pieces.reduce(
    (acc, p) => acc + (p.calcSnapshot?.numeroDobras ?? 0) * p.quantidade,
    0,
  );
  const totalPecas = pieces.reduce((acc, p) => acc + p.quantidade, 0);

  const s = StyleSheet.create({
    page: {
      paddingTop: 28,
      paddingBottom: 60,
      paddingHorizontal: 28,
      fontSize: 8,
      fontFamily: "Helvetica",
      color: "#222",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      borderBottomWidth: 2,
      borderBottomColor: corPrimaria,
      paddingBottom: 10,
    },
    logoLockup: { width: 130, height: 48, marginRight: 10, objectFit: "contain" as const },
    logoIcon: { width: 48, height: 48, marginRight: 10, objectFit: "contain" as const },
    headerLeft: { flex: 1 },
    companyName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: corPrimaria },
    sloganText: {
      fontSize: 7,
      color: corDestaque,
      marginTop: 2,
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
    },
    headerRight: { alignItems: "flex-end" as const },
    headerContactLine: { fontSize: 6.5, color: "#555" },
    docTitleBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#f5f5f5",
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderWidth: 0.5,
      borderColor: "#e0e0e0",
      marginBottom: 14,
    },
    docTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: corPrimaria },
    docSubtitle: { fontSize: 7, color: "#666", marginTop: 2 },
    docMeta: { fontSize: 7, color: "#666" },

    sectionTitle: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: corPrimaria,
      marginBottom: 6,
      marginTop: 10,
      textTransform: "uppercase" as const,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      paddingBottom: 3,
    },
    obsBox: {
      borderLeftWidth: 3,
      borderLeftColor: corDestaque,
      backgroundColor: "#fafafa",
      borderRadius: 3,
      padding: 8,
      marginBottom: 8,
    },
    obsText: { fontSize: 8, color: "#333", lineHeight: 1.5 },

    /* Resumo cards */
    sumRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
    sumCard: {
      flex: 1,
      backgroundColor: "#f5f5f5",
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderWidth: 0.5,
      borderColor: "#e0e0e0",
    },
    sumCardAccent: {
      flex: 1,
      backgroundColor: corDestaque,
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    sumLabel: { fontSize: 6, color: "#888", textTransform: "uppercase" as const, marginBottom: 3 },
    sumLabelWhite: {
      fontSize: 6,
      color: "#fff",
      textTransform: "uppercase" as const,
      marginBottom: 3,
      opacity: 0.9,
    },
    sumValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#222" },
    sumValueWhite: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#fff" },

    /* Peça */
    pieceBlock: {
      borderWidth: 0.5,
      borderColor: "#ddd",
      borderRadius: 4,
      marginBottom: 10,
      overflow: "hidden",
    },
    pieceHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: corPrimaria,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },
    pieceHeaderTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#fff" },
    pieceHeaderMeta: { fontSize: 7, color: "#fff", opacity: 0.9 },
    pieceBody: { flexDirection: "row", padding: 8, gap: 10 },
    pieceCanvasBox: {
      width: 150,
      height: 150,
      backgroundColor: "#fafafa",
      borderRadius: 3,
      borderWidth: 0.5,
      borderColor: "#eee",
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    pieceData: { flex: 1, gap: 4 },
    kpiRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
    kpiCell: {
      flex: 1,
      backgroundColor: "#f5f5f5",
      borderRadius: 3,
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    kpiLabel: { fontSize: 6, color: "#888", textTransform: "uppercase" as const, marginBottom: 1 },
    kpiValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#222" },

    segHeader: {
      flexDirection: "row",
      backgroundColor: "#f0f0f0",
      paddingVertical: 3,
      paddingHorizontal: 5,
      borderRadius: 2,
      marginTop: 4,
    },
    segHeaderText: { fontSize: 6, fontFamily: "Helvetica-Bold", color: "#555" },
    segRow: {
      flexDirection: "row",
      paddingVertical: 2,
      paddingHorizontal: 5,
      borderBottomWidth: 0.3,
      borderBottomColor: "#eee",
    },
    segCell: { fontSize: 7, color: "#333" },
    segColIdx: { width: 18 },
    segColTipo: { width: 50 },
    segColMed: { flex: 1, textAlign: "right" as const },
    segColAng: { width: 70, textAlign: "right" as const },

    obsPiece: { fontSize: 7, color: "#555", fontStyle: "italic" as const, marginTop: 4 },

    footer: {
      position: "absolute",
      bottom: 18,
      left: 28,
      right: 28,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 0.5,
      borderTopColor: "#ddd",
      paddingTop: 6,
      fontSize: 6.5,
      color: "#888",
    },
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header com identidade visual */}
        <View style={s.header}>
          {hasLogo ? (
            <Image
              src={logo!.dataUrl}
              style={logo?.kind === "icon" ? s.logoIcon : s.logoLockup}
            />
          ) : null}
          {showBrandText && (
            <View style={s.headerLeft}>
              <Text style={s.companyName}>{nomeEmpresa}</Text>
              {slogan ? <Text style={s.sloganText}>{slogan}</Text> : null}
            </View>
          )}
          {!showBrandText && <View style={s.headerLeft} />}
          <View style={s.headerRight}>
            {telefone ? <Text style={s.headerContactLine}>{telefone}</Text> : null}
            {email ? <Text style={s.headerContactLine}>{email}</Text> : null}
            {enderecoEmpresa ? (
              <Text style={s.headerContactLine}>{enderecoEmpresa}</Text>
            ) : null}
          </View>
        </View>

        {/* Title bar */}
        <View style={s.docTitleBar}>
          <View>
            <Text style={s.docTitle}>Ficha técnica de obra</Text>
            <Text style={s.docSubtitle}>{project.nome}</Text>
          </View>
          <View>
            <Text style={s.docMeta}>Emitido em {fmtDate(new Date().toISOString())}</Text>
            <Text style={s.docMeta}>Atualizada em {fmtDate(project.updatedAt)}</Text>
          </View>
        </View>

        {project.observacoes ? (
          <View style={s.obsBox}>
            <Text style={s.obsText}>{project.observacoes}</Text>
          </View>
        ) : null}

        {/* Resumo */}
        <Text style={s.sectionTitle}>Resumo da obra</Text>
        <View style={s.sumRow}>
          <View style={s.sumCard}>
            <Text style={s.sumLabel}>Tipos de peça</Text>
            <Text style={s.sumValue}>{pieces.length}</Text>
          </View>
          <View style={s.sumCard}>
            <Text style={s.sumLabel}>Total de peças</Text>
            <Text style={s.sumValue}>{totalPecas}</Text>
          </View>
          <View style={s.sumCard}>
            <Text style={s.sumLabel}>Dobras totais</Text>
            <Text style={s.sumValue}>{totalDobras}</Text>
          </View>
          <View style={s.sumCardAccent}>
            <Text style={s.sumLabelWhite}>Área total</Text>
            <Text style={s.sumValueWhite}>{fmtNum(totalArea, 3)} m²</Text>
          </View>
        </View>

        {/* Peças */}
        <Text style={s.sectionTitle}>Peças</Text>
        {pieces.length === 0 ? (
          <Text style={{ fontSize: 8, color: "#666" }}>
            Nenhuma peça cadastrada nesta obra.
          </Text>
        ) : (
          pieces.map((piece, idx) => (
            <View key={piece.id} style={s.pieceBlock} wrap={false}>
              <View style={s.pieceHeader}>
                <Text style={s.pieceHeaderTitle}>
                  #{idx + 1} · {piece.nome}
                </Text>
                <Text style={s.pieceHeaderMeta}>
                  {piece.tipoPeca === "conica" ? "Cônica" : "Reta"} · {piece.quantidade}x ·{" "}
                  {fmtNum(piece.comprimento, 2)} m
                </Text>
              </View>

              <View style={s.pieceBody}>
                <View style={s.pieceCanvasBox}>
                  <PiecePreview piece={piece} size={130} />
                </View>

                <View style={s.pieceData}>
                  <View style={s.kpiRow}>
                    <View style={s.kpiCell}>
                      <Text style={s.kpiLabel}>Desenvolvimento</Text>
                      <Text style={s.kpiValue}>
                        {fmtNum(piece.calcSnapshot.desenvolvimentoInicial, 0)} mm
                      </Text>
                    </View>
                    <View style={s.kpiCell}>
                      <Text style={s.kpiLabel}>Área (un.)</Text>
                      <Text style={s.kpiValue}>
                        {fmtNum(
                          piece.quantidade > 0
                            ? piece.calcSnapshot.area / piece.quantidade
                            : piece.calcSnapshot.area,
                          3,
                        )} m²
                      </Text>
                    </View>
                    <View style={s.kpiCell}>
                      <Text style={s.kpiLabel}>Área total</Text>
                      <Text style={s.kpiValue}>{fmtNum(piece.calcSnapshot.area, 3)} m²</Text>
                    </View>
                    <View style={s.kpiCell}>
                      <Text style={s.kpiLabel}>Dobras</Text>
                      <Text style={s.kpiValue}>{piece.calcSnapshot.numeroDobras}</Text>
                    </View>
                  </View>

                  <View style={s.segHeader}>
                    <Text style={[s.segHeaderText, s.segColIdx]}>#</Text>
                    <Text style={[s.segHeaderText, s.segColTipo]}>Tipo</Text>
                    <Text style={[s.segHeaderText, s.segColMed]}>Medida (mm)</Text>
                    <Text style={[s.segHeaderText, s.segColAng]}>Ângulo (°)</Text>
                  </View>
                  {piece.segmentos.map((seg, i) => {
                    const isLast = i === piece.segmentos.length - 1;
                    return (
                      <View key={seg.id} style={s.segRow}>
                        <Text style={[s.segCell, s.segColIdx]}>{i + 1}</Text>
                        <Text style={[s.segCell, s.segColTipo]}>
                          {seg.tipo === "diagonal" ? "Diagonal" : "Reto"}
                        </Text>
                        <Text style={[s.segCell, s.segColMed]}>{fmtNum(seg.medida, 0)}</Text>
                        <Text style={[s.segCell, s.segColAng]}>
                          {isLast ? "—" : fmtNum(seg.anguloDeg ?? 0, 0)}
                        </Text>
                      </View>
                    );
                  })}

                  {piece.observacoes ? (
                    <Text style={s.obsPiece}>Obs.: {piece.observacoes}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          ))
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>{nomeEmpresa} · RufoLab · Ficha técnica</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
