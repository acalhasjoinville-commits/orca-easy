import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { ReactNode } from "react";

import type { MinhaEmpresa } from "@/lib/types";
import type { PdfLogoAsset } from "@/lib/fetchLogoBase64";
import { fmtDateBR } from "@/lib/relatorios/format";

interface RelatorioBasePageProps {
  empresa?: MinhaEmpresa | null;
  logo?: PdfLogoAsset | null;
  title: string;
  periodoLabel: string;
  children: ReactNode;
}

const PALETTE = {
  defaultPrimary: "#0B1B32",
  defaultAccent: "#5866D6",
  border: "#e0e0e0",
  text: "#222",
  muted: "#666",
};

export function buildRelatorioStyles(corPrimaria: string, corDestaque: string) {
  return StyleSheet.create({
    page: {
      paddingTop: 28,
      paddingBottom: 60,
      paddingHorizontal: 28,
      fontSize: 9,
      fontFamily: "Helvetica",
      color: PALETTE.text,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      borderBottomWidth: 2,
      borderBottomColor: corPrimaria,
      paddingBottom: 10,
    },
    logoLockup: { width: 130, height: 46, marginRight: 10, objectFit: "contain" as const },
    logoIcon: { width: 46, height: 46, marginRight: 10, objectFit: "contain" as const },
    headerLeft: { flex: 1 },
    companyName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: corPrimaria },
    headerRight: { alignItems: "flex-end" as const, gap: 2 },
    headerLine: { fontSize: 7, color: PALETTE.muted },
    titleBar: {
      backgroundColor: corPrimaria,
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    titleText: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#fff" },
    periodoText: { fontSize: 8, color: "#fff", opacity: 0.85, marginTop: 2 },
    sectionTitle: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: corPrimaria,
      marginTop: 14,
      marginBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      paddingBottom: 3,
      textTransform: "uppercase" as const,
    },
    kpiRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
    kpiCard: {
      flex: 1,
      backgroundColor: "#f5f5f5",
      borderRadius: 4,
      padding: 8,
      borderWidth: 0.5,
      borderColor: PALETTE.border,
    },
    kpiCardAccent: {
      flex: 1,
      backgroundColor: corDestaque,
      borderRadius: 4,
      padding: 8,
    },
    kpiLabel: {
      fontSize: 6.5,
      color: "#888",
      textTransform: "uppercase" as const,
      marginBottom: 3,
    },
    kpiLabelWhite: {
      fontSize: 6.5,
      color: "#fff",
      textTransform: "uppercase" as const,
      marginBottom: 3,
      opacity: 0.9,
    },
    kpiValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: PALETTE.text },
    kpiValueWhite: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#fff" },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: corPrimaria,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      paddingVertical: 5,
      paddingHorizontal: 6,
    },
    tableHeaderText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#fff" },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 4,
      paddingHorizontal: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: "#eee",
    },
    tableRowAlt: { backgroundColor: "#f9f9f9" },
    tableCell: { fontSize: 7.5, color: "#333" },
    footer: {
      position: "absolute" as const,
      bottom: 16,
      left: 28,
      right: 28,
      backgroundColor: corPrimaria,
      borderRadius: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    footerText: { fontSize: 6.5, color: "#fff" },
  });
}

export function RelatorioBasePage({ empresa, logo, title, periodoLabel, children }: RelatorioBasePageProps) {
  const corPrimaria = empresa?.corPrimaria || PALETTE.defaultPrimary;
  const corDestaque = empresa?.corDestaque || PALETTE.defaultAccent;
  const nomeEmpresa = empresa?.nomeFantasia || "Minha Empresa";
  const telefone = empresa?.telefoneWhatsApp || "";
  const email = empresa?.emailContato || "";
  const cnpj = empresa?.cnpjCpf || "";
  const hasLogo = Boolean(logo?.dataUrl);
  const showBrandText = !hasLogo || logo?.kind === "icon";
  const s = buildRelatorioStyles(corPrimaria, corDestaque);
  const emissao = fmtDateBR(new Date().toISOString().slice(0, 10));

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.header}>
          {logo?.dataUrl && <Image src={logo.dataUrl} style={logo.kind === "icon" ? s.logoIcon : s.logoLockup} />}
          <View style={s.headerLeft}>
            {showBrandText && <Text style={s.companyName}>{nomeEmpresa}</Text>}
          </View>
          <View style={s.headerRight}>
            {cnpj ? <Text style={s.headerLine}>{cnpj}</Text> : null}
            {telefone ? <Text style={s.headerLine}>{telefone}</Text> : null}
            {email ? <Text style={s.headerLine}>{email}</Text> : null}
          </View>
        </View>

        <View style={s.titleBar}>
          <Text style={s.titleText}>{title}</Text>
          <Text style={s.periodoText}>Período: {periodoLabel}</Text>
        </View>

        {children}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>{nomeEmpresa}</Text>
          <Text style={s.footerText}>Emitido em {emissao}</Text>
        </View>
      </Page>
    </Document>
  );
}

export { PALETTE };
