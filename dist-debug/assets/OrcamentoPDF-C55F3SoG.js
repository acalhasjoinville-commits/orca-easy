import { j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { S as StyleSheet, D as Document, P as Page, V as View, I as Image, T as Text } from "./pdf-vendor-Dv6cUxDn.js";
import "./charts-vendor-BrW5ULH7.js";
const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("pt-BR");
  } catch {
    return d;
  }
};
const fmtNum = (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function OrcamentoPDF({ orcamento, cliente, empresa, logoBase64 }) {
  const corPrimaria = (empresa == null ? void 0 : empresa.corPrimaria) || "#0B1B32";
  const corDestaque = (empresa == null ? void 0 : empresa.corDestaque) || "#F57C00";
  const nomeEmpresa = (empresa == null ? void 0 : empresa.nomeFantasia) || "Minha Empresa";
  const razaoSocial = (empresa == null ? void 0 : empresa.razaoSocial) || "";
  const slogan = (empresa == null ? void 0 : empresa.slogan) || "";
  const telefone = (empresa == null ? void 0 : empresa.telefoneWhatsApp) || "";
  const email = (empresa == null ? void 0 : empresa.emailContato) || "";
  const cnpjCpf = (empresa == null ? void 0 : empresa.cnpjCpf) || "";
  const enderecoEmpresa = [empresa == null ? void 0 : empresa.endereco, empresa == null ? void 0 : empresa.numero, empresa == null ? void 0 : empresa.bairro, empresa == null ? void 0 : empresa.cidade, empresa == null ? void 0 : empresa.estado].filter(Boolean).join(", ");
  const isPJ = (cliente == null ? void 0 : cliente.tipo) === "PJ";
  const displayValue = (orcamento.desconto ?? 0) > 0 ? orcamento.valorFinal : orcamento.valorVenda;
  const s = StyleSheet.create({
    page: { paddingTop: 28, paddingBottom: 70, paddingHorizontal: 28, fontSize: 8, fontFamily: "Helvetica", color: "#222" },
    /* ── Header ── */
    header: { flexDirection: "row", alignItems: "center", marginBottom: 14, borderBottomWidth: 2, borderBottomColor: corPrimaria, paddingBottom: 10 },
    logo: { width: 54, height: 54, marginRight: 10, objectFit: "contain" },
    headerLeft: { flex: 1 },
    companyName: { fontSize: 15, fontFamily: "Helvetica-Bold", color: corPrimaria },
    razaoSocial: { fontSize: 7, color: "#555", marginTop: 1 },
    sloganText: { fontSize: 7, color: corDestaque, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
    headerRight: { alignItems: "flex-end", gap: 2 },
    headerContactLine: { fontSize: 6.5, color: "#555" },
    /* ── Identification bar ── */
    idBar: { flexDirection: "row", backgroundColor: "#f5f5f5", borderRadius: 4, marginBottom: 14, borderWidth: 0.5, borderColor: "#e0e0e0" },
    idCell: { flex: 1, paddingVertical: 7, paddingHorizontal: 8, borderRightWidth: 0.5, borderRightColor: "#e0e0e0" },
    idCellLast: { flex: 1, paddingVertical: 7, paddingHorizontal: 8 },
    idLabel: { fontSize: 6, color: "#888", textTransform: "uppercase", marginBottom: 2, letterSpacing: 0.3 },
    idValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: corPrimaria },
    idValueAccent: { fontSize: 9, fontFamily: "Helvetica-Bold", color: corDestaque },
    /* ── Section titles ── */
    sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: corPrimaria, marginBottom: 6, marginTop: 14, textTransform: "uppercase", borderBottomWidth: 1, borderBottomColor: "#ddd", paddingBottom: 3 },
    /* ── Client data grid ── */
    gridRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e8e8e8" },
    gridCell: { paddingVertical: 5, paddingHorizontal: 7, borderRightWidth: 0.5, borderRightColor: "#e8e8e8" },
    gridCellLast: { paddingVertical: 5, paddingHorizontal: 7 },
    gridLabel: { fontSize: 6, color: "#888", textTransform: "uppercase", marginBottom: 2 },
    gridValue: { fontSize: 8, color: "#222" },
    /* ── Scope ── */
    scopeBox: { borderLeftWidth: 3, borderLeftColor: corDestaque, backgroundColor: "#fafafa", borderRadius: 3, padding: 10, marginBottom: 4 },
    scopeSubtitle: { fontSize: 6.5, color: corDestaque, textTransform: "uppercase", marginBottom: 4, letterSpacing: 0.3 },
    scopeText: { fontSize: 8.5, color: "#333", lineHeight: 1.5 },
    /* ── Services table ── */
    tableHeader: { flexDirection: "row", backgroundColor: corPrimaria, borderTopLeftRadius: 4, borderTopRightRadius: 4, paddingVertical: 6, paddingHorizontal: 6 },
    tableHeaderText: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#fff" },
    tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: "#eee" },
    tableRowAlt: { backgroundColor: "#f9f9f9" },
    tableCell: { fontSize: 7.5, color: "#333" },
    colItem: { width: 24 },
    colDesc: { flex: 1 },
    colQtd: { width: 38, textAlign: "center" },
    colUnit: { width: 62, textAlign: "right" },
    colTotal: { width: 62, textAlign: "right" },
    /* ── Financial summary ── */
    finRow: { flexDirection: "row", gap: 8, marginTop: 6 },
    finCard: { flex: 1, backgroundColor: "#f5f5f5", borderRadius: 4, paddingVertical: 8, paddingHorizontal: 10, borderWidth: 0.5, borderColor: "#e0e0e0" },
    finCardAccent: { flex: 1, backgroundColor: corDestaque, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 10 },
    finLabel: { fontSize: 6, color: "#888", textTransform: "uppercase", marginBottom: 3 },
    finLabelWhite: { fontSize: 6, color: "#fff", textTransform: "uppercase", marginBottom: 3, opacity: 0.9 },
    finValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#222" },
    finValueRed: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#d32f2f" },
    finValueWhite: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#fff" },
    finSubtitle: { fontSize: 7, color: "#fff", opacity: 0.85, marginTop: 1 },
    /* ── Conditions ── */
    condRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
    condCard: { flex: 1, backgroundColor: "#f8f8f8", borderRadius: 4, padding: 8, borderWidth: 0.5, borderColor: "#e8e8e8" },
    condTitle: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: "#555", marginBottom: 3, textTransform: "uppercase" },
    condValue: { fontSize: 8, color: "#333", lineHeight: 1.4 },
    /* ── Signatures ── */
    sigSection: { marginTop: 20 },
    sigDescription: { fontSize: 7.5, color: "#555", lineHeight: 1.4, marginBottom: 16 },
    sigRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
    sigBlock: { alignItems: "center", width: 200 },
    sigLine: { width: 180, borderBottomWidth: 1, borderBottomColor: "#333", marginBottom: 4 },
    sigName: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#333", textAlign: "center" },
    sigLabel: { fontSize: 6.5, color: "#888", textAlign: "center", marginTop: 1 },
    /* ── Footer ── */
    footer: { position: "absolute", bottom: 16, left: 28, right: 28, backgroundColor: corPrimaria, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    footerLeft: { flex: 1 },
    footerCompany: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#fff" },
    footerDoc: { fontSize: 6, color: "#ccc", marginTop: 1 },
    footerContact: { fontSize: 6, color: "#ccc", marginTop: 1 },
    footerPage: { fontSize: 6, color: "#ccc" }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Document, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page, { size: "A4", style: s.page, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.header, children: [
      logoBase64 && /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { src: logoBase64, style: s.logo }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.headerLeft, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.companyName, children: nomeEmpresa }),
        razaoSocial ? /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.razaoSocial, children: razaoSocial }) : null,
        slogan ? /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sloganText, children: slogan }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.headerRight, children: [
        cnpjCpf ? /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.headerContactLine, children: cnpjCpf }) : null,
        telefone ? /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.headerContactLine, children: telefone }) : null,
        email ? /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.headerContactLine, children: email }) : null,
        enderecoEmpresa ? /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.headerContactLine, children: enderecoEmpresa }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.idBar, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.idCell, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idLabel, children: "Orçamento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: s.idValueAccent, children: [
          "#",
          orcamento.numeroOrcamento
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.idCell, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idLabel, children: "Data" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idValue, children: fmtDate(orcamento.dataCriacao) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.idCell, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idLabel, children: "Validade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idValue, children: orcamento.validade || "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.idCellLast, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idLabel, children: "Cliente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idValue, children: (cliente == null ? void 0 : cliente.nomeRazaoSocial) || orcamento.nomeCliente })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sectionTitle, children: "Dados do Cliente" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { borderWidth: 0.5, borderColor: "#e8e8e8", borderRadius: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.gridRow, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCell, { width: "20%" }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Tipo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: isPJ ? "Pessoa Jurídica" : "Pessoa Física" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCell, { flex: 1 }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: isPJ ? "Razão Social" : "Nome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.nomeRazaoSocial) || orcamento.nomeCliente })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCellLast, { width: "25%" }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: isPJ ? "CNPJ" : "CPF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.documento) || "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.gridRow, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCell, { width: "25%" }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "WhatsApp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.whatsapp) || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCell, { width: "18%" }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "CEP" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.cep) || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCell, { flex: 1 }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Cidade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.cidade) || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCellLast, { width: "25%" }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Bairro" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.bairro) || "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { flexDirection: "row" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCell, { flex: 1 }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Endereço" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.endereco) || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCellLast, { width: "18%" }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Número" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.numero) || "—" })
        ] })
      ] })
    ] }),
    orcamento.descricaoGeral ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sectionTitle, children: "Escopo do Serviço" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.scopeBox, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.scopeSubtitle, children: "Descrição geral da proposta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.scopeText, children: orcamento.descricaoGeral })
      ] })
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sectionTitle, children: "Serviços" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.tableHeader, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableHeaderText, s.colItem], children: "Item" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableHeaderText, s.colDesc], children: "Descrição" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableHeaderText, s.colQtd], children: "Qtd." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableHeaderText, s.colUnit], children: "Vlr. Unit." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableHeaderText, s.colTotal], children: "Vlr. Total" })
    ] }),
    orcamento.itensServico.map((item, idx) => {
      const unitPrice = item.metragem > 0 ? item.valorVenda / item.metragem : item.valorVenda;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}], children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableCell, s.colItem], children: String(idx + 1).padStart(2, "0") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableCell, s.colDesc], children: item.nomeServico }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableCell, s.colQtd], children: fmtNum(item.metragem) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableCell, s.colUnit], children: fmt(unitPrice) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableCell, s.colTotal, { fontFamily: "Helvetica-Bold" }], children: fmt(item.valorVenda) })
      ] }, item.id);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sectionTitle, children: "Resumo Financeiro" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(View, { wrap: false, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.finRow, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.finCard, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.finLabel, children: "Valor de Venda" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.finValue, children: fmt(orcamento.valorVenda) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.finCard, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.finLabel, children: "Desconto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: (orcamento.desconto ?? 0) > 0 ? s.finValueRed : s.finValue, children: (orcamento.desconto ?? 0) > 0 ? `-${fmt(orcamento.desconto)}` : "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.finCardAccent, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.finLabelWhite, children: "Total Final" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.finValueWhite, children: fmt(displayValue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.finSubtitle, children: "Valor final da proposta comercial" })
      ] })
    ] }) }),
    (orcamento.formasPagamento || orcamento.tempoGarantia || orcamento.validade) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sectionTitle, children: "Condições Comerciais" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.condRow, wrap: false, children: [
        orcamento.validade ? /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.condCard, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.condTitle, children: "Validade da Proposta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.condValue, children: orcamento.validade })
        ] }) : null,
        orcamento.formasPagamento ? /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.condCard, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.condTitle, children: "Formas de Pagamento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.condValue, children: orcamento.formasPagamento })
        ] }) : null,
        orcamento.tempoGarantia ? /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.condCard, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.condTitle, children: "Garantia" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.condValue, { fontFamily: "Helvetica-Bold", color: corDestaque }], children: orcamento.tempoGarantia }),
          orcamento.garantia ? /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.condValue, { marginTop: 2 }], children: orcamento.garantia }) : null
        ] }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.sigSection, wrap: false, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sectionTitle, children: "Assinaturas" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sigDescription, children: "Confirmando o aceite desta proposta, as partes declaram estar de acordo com o escopo, condições comerciais e valores apresentados neste documento." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.sigRow, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.sigBlock, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: s.sigLine }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sigName, children: (cliente == null ? void 0 : cliente.nomeRazaoSocial) || orcamento.nomeCliente }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sigLabel, children: "CLIENTE" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.sigBlock, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: s.sigLine }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sigName, children: nomeEmpresa }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sigLabel, children: "RESPONSÁVEL" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.footer, fixed: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.footerLeft, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.footerCompany, children: nomeEmpresa.toUpperCase() }),
        cnpjCpf ? /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.footerDoc, children: cnpjCpf }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.footerContact, children: [enderecoEmpresa, telefone, email].filter(Boolean).join(" · ") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.footerPage, render: ({ pageNumber, totalPages }) => `Página ${pageNumber}/${totalPages}` })
    ] })
  ] }) });
}
export {
  OrcamentoPDF
};
