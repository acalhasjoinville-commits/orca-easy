import { j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { S as StyleSheet, D as Document, P as Page, V as View, I as Image, T as Text } from "./pdf-vendor-Dv6cUxDn.js";
import "./charts-vendor-BrW5ULH7.js";
const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("pt-BR");
  } catch {
    return d;
  }
};
const fmtNum = (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const statusLabel = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  executado: "Executado"
};
function OrdemServicoPDF({ orcamento, cliente, empresa, logoBase64, termoRecebimento }) {
  const corPrimaria = (empresa == null ? void 0 : empresa.corPrimaria) || "#0B1B32";
  const corDestaque = (empresa == null ? void 0 : empresa.corDestaque) || "#F57C00";
  const nomeEmpresa = (empresa == null ? void 0 : empresa.nomeFantasia) || "Minha Empresa";
  const cnpjCpf = (empresa == null ? void 0 : empresa.cnpjCpf) || "";
  const telefone = (empresa == null ? void 0 : empresa.telefoneWhatsApp) || "";
  const email = (empresa == null ? void 0 : empresa.emailContato) || "";
  const s = StyleSheet.create({
    page: { paddingTop: 28, paddingBottom: 70, paddingHorizontal: 28, fontSize: 8, fontFamily: "Helvetica", color: "#222" },
    /* ── Header ── */
    header: { flexDirection: "row", alignItems: "center", marginBottom: 14, borderBottomWidth: 2, borderBottomColor: corPrimaria, paddingBottom: 10 },
    logo: { width: 50, height: 50, marginRight: 10, objectFit: "contain" },
    headerLeft: { flex: 1 },
    companyName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: corPrimaria },
    headerContact: { fontSize: 6.5, color: "#555", marginTop: 2 },
    headerBadge: { backgroundColor: corDestaque, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 14, alignItems: "center" },
    badgeSmall: { fontSize: 6, color: "#fff", opacity: 0.85, textTransform: "uppercase", marginBottom: 2 },
    badgeLarge: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#fff" },
    /* ── Identification bar ── */
    idBar: { flexDirection: "row", backgroundColor: "#f5f5f5", borderRadius: 4, marginBottom: 14, borderWidth: 0.5, borderColor: "#e0e0e0" },
    idCell: { flex: 1, paddingVertical: 6, paddingHorizontal: 6, borderRightWidth: 0.5, borderRightColor: "#e0e0e0" },
    idCellLast: { flex: 1, paddingVertical: 6, paddingHorizontal: 6 },
    idLabel: { fontSize: 5.5, color: "#888", textTransform: "uppercase", marginBottom: 2, letterSpacing: 0.3 },
    idValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#222" },
    idValueAccent: { fontSize: 8, fontFamily: "Helvetica-Bold", color: corDestaque },
    /* ── Section titles ── */
    sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: corPrimaria, marginBottom: 6, marginTop: 14, textTransform: "uppercase", borderBottomWidth: 1, borderBottomColor: "#ddd", paddingBottom: 3 },
    /* ── Grid (client/job data) ── */
    gridRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e8e8e8" },
    gridCell: { paddingVertical: 5, paddingHorizontal: 6, borderRightWidth: 0.5, borderRightColor: "#e8e8e8" },
    gridCellLast: { paddingVertical: 5, paddingHorizontal: 6 },
    gridLabel: { fontSize: 5.5, color: "#888", textTransform: "uppercase", marginBottom: 2 },
    gridValue: { fontSize: 8, color: "#222" },
    /* ── Execution table ── */
    tableHeader: { flexDirection: "row", backgroundColor: corPrimaria, borderTopLeftRadius: 4, borderTopRightRadius: 4, paddingVertical: 6, paddingHorizontal: 6 },
    tableHeaderText: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: "#fff" },
    tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: "#eee", alignItems: "center", minHeight: 18 },
    tableRowAlt: { backgroundColor: "#f9f9f9" },
    tableCell: { fontSize: 7, color: "#333" },
    tColNum: { width: 22 },
    tColServ: { flex: 1 },
    tColQtd: { width: 45, textAlign: "center" },
    tColMat: { width: 80 },
    tColEsp: { width: 42, textAlign: "center" },
    tColCorte: { width: 48, textAlign: "center" },
    /* ── Observations ── */
    obsBox: { backgroundColor: "#fffde7", borderRadius: 4, padding: 10, borderWidth: 1, borderColor: "#ffe082" },
    obsText: { fontSize: 8, color: "#333", lineHeight: 1.5 },
    /* ── Canhoto ── */
    canhotoDivider: { borderTopWidth: 1, borderTopColor: "#999", borderStyle: "dashed", marginBottom: 6 },
    canhotoCutLabel: { fontSize: 6, color: "#999", textAlign: "center", marginBottom: 8 },
    canhotoBorder: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 12 },
    canhotoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
    canhotoTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: corPrimaria },
    canhotoSubtitle: { fontSize: 7, color: "#666", marginTop: 1 },
    canhotoRefBadge: { backgroundColor: "#f5f5f5", borderRadius: 3, paddingVertical: 3, paddingHorizontal: 8, borderWidth: 0.5, borderColor: "#ddd" },
    canhotoRefLabel: { fontSize: 5.5, color: "#888", textTransform: "uppercase" },
    canhotoRefValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: corDestaque },
    canhotoMetaRow: { flexDirection: "row", gap: 10, marginBottom: 10, paddingBottom: 8, borderBottomWidth: 0.5, borderBottomColor: "#eee" },
    canhotoMetaCell: { flex: 1 },
    canhotoMetaLabel: { fontSize: 5.5, color: "#888", textTransform: "uppercase", marginBottom: 1 },
    canhotoMetaValue: { fontSize: 7.5, color: "#222" },
    canhotoTermText: { fontSize: 7.5, color: "#333", lineHeight: 1.5, marginBottom: 14, textAlign: "justify" },
    canhotoSigRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
    canhotoSigBlock: { alignItems: "center", width: 150 },
    canhotoSigLine: { width: 140, borderBottomWidth: 1, borderBottomColor: "#555", marginBottom: 3 },
    canhotoSigLabel: { fontSize: 6, color: "#666", textAlign: "center" },
    /* ── Footer ── */
    footer: { position: "absolute", bottom: 16, left: 28, right: 28, backgroundColor: corPrimaria, borderRadius: 4, paddingVertical: 7, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    footerCompany: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#fff" },
    footerContact: { fontSize: 5.5, color: "#ccc", marginTop: 1 },
    footerRight: { fontSize: 5.5, color: "#ccc", textAlign: "right" }
  });
  const osNumero = `OS-${orcamento.numeroOrcamento}`;
  const orcNumero = `ORC-${orcamento.numeroOrcamento}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Document, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page, { size: "A4", style: s.page, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.header, children: [
      logoBase64 && /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { src: logoBase64, style: s.logo }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.headerLeft, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.companyName, children: nomeEmpresa }),
        cnpjCpf ? /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.headerContact, children: cnpjCpf }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.headerContact, children: [telefone, email].filter(Boolean).join(" · ") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.headerBadge, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.badgeSmall, children: "Documento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.badgeLarge, children: "ORDEM DE SERVIÇO" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.idBar, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.idCell, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idLabel, children: "Nº da OS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idValueAccent, children: osNumero })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.idCell, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idLabel, children: "Data" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idValue, children: fmtDate(orcamento.dataCriacao) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.idCell, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idLabel, children: "Nº do Orçamento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idValue, children: orcNumero })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.idCell, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idLabel, children: "Técnico Responsável" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idValue, children: nomeEmpresa })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.idCellLast, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idLabel, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.idValue, children: statusLabel[orcamento.status] || orcamento.status })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sectionTitle, children: "Dados da Obra" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { borderWidth: 0.5, borderColor: "#e8e8e8", borderRadius: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.gridRow, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCell, { flex: 2 }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Cliente / Responsável" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.nomeRazaoSocial) || orcamento.nomeCliente })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCell, { flex: 1 }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Telefone / Contato" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.whatsapp) || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCellLast, { flex: 1 }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Documento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.documento) || "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.gridRow, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCell, { width: "16%" }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "CEP" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.cep) || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCell, { flex: 1 }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Endereço" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.endereco) || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCellLast, { width: "14%" }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Número" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.numero) || "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { flexDirection: "row" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCell, { flex: 1 }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Bairro" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.bairro) || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCell, { flex: 1 }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Cidade / UF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: (cliente == null ? void 0 : cliente.cidade) || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.gridCellLast, { flex: 1 }], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridLabel, children: "Observações Iniciais" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.gridValue, children: "—" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sectionTitle, children: "Serviços a Executar" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.tableHeader, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableHeaderText, s.tColNum], children: "#" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableHeaderText, s.tColServ], children: "Serviço" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableHeaderText, s.tColQtd], children: "Qtd." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableHeaderText, s.tColMat], children: "Material" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableHeaderText, s.tColEsp], children: "Esp." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableHeaderText, s.tColCorte], children: "Corte" })
    ] }),
    orcamento.itensServico.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}], children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableCell, s.tColNum], children: String(idx + 1).padStart(2, "0") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableCell, s.tColServ], children: item.nomeServico }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableCell, s.tColQtd], children: fmtNum(item.metragem) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableCell, s.tColMat], children: item.materialId || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableCell, s.tColEsp], children: item.espessura || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [s.tableCell, s.tColCorte], children: item.corte || "—" })
    ] }, item.id)),
    orcamento.descricaoGeral ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.sectionTitle, children: "Observações de Obra" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: s.obsBox, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.obsText, children: orcamento.descricaoGeral }) })
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { wrap: false, style: { marginTop: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: s.canhotoDivider }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoCutLabel, children: "✂  Destacar canhoto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.canhotoBorder, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.canhotoHeader, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoTitle, children: "Canhoto de Recebimento / Conclusão" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoSubtitle, children: "Confirmação de conclusão e aceite do serviço executado." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.canhotoRefBadge, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoRefLabel, children: "Ref. da OS" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoRefValue, children: osNumero })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.canhotoMetaRow, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.canhotoMetaCell, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoMetaLabel, children: "Cliente" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoMetaValue, children: (cliente == null ? void 0 : cliente.nomeRazaoSocial) || orcamento.nomeCliente })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.canhotoMetaCell, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoMetaLabel, children: "Data" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoMetaValue, children: fmtDate(orcamento.dataCriacao) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.canhotoMetaCell, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoMetaLabel, children: "Orçamento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoMetaValue, children: orcNumero })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoTermText, children: termoRecebimento || "Declaro que os serviços descritos nesta Ordem de Serviço foram executados de forma satisfatória e em conformidade com o combinado, sem ressalvas quanto ao prazo e qualidade da entrega." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.canhotoSigRow, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.canhotoSigBlock, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: s.canhotoSigLine }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoSigLabel, children: "Data de Conclusão" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.canhotoSigBlock, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: s.canhotoSigLine }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoSigLabel, children: "Assinatura do Cliente" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.canhotoSigBlock, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: s.canhotoSigLine }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.canhotoSigLabel, children: "Assinatura do Técnico" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: s.footer, fixed: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.footerCompany, children: nomeEmpresa.toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.footerContact, children: [cnpjCpf, telefone, email].filter(Boolean).join(" · ") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { alignItems: "flex-end" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.footerRight, children: osNumero }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: s.footerRight, render: ({ pageNumber, totalPages }) => `Página ${pageNumber}/${totalPages}` })
      ] })
    ] })
  ] }) });
}
export {
  OrdemServicoPDF
};
