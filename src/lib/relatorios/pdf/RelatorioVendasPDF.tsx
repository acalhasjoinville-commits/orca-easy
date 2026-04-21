import { View, Text } from "@react-pdf/renderer";

import type { MinhaEmpresa } from "@/lib/types";
import type { PdfLogoAsset } from "@/lib/fetchLogoBase64";
import type { VendasAggregation } from "@/lib/relatorios/aggregations";
import { fmtDateBR, fmtMoney, fmtPct, statusLabel } from "@/lib/relatorios/format";
import { RelatorioBasePage, buildRelatorioStyles } from "./shared";

interface Props {
  empresa?: MinhaEmpresa | null;
  logo?: PdfLogoAsset | null;
  data: VendasAggregation;
  periodoLabel: string;
}

export function RelatorioVendasPDF({ empresa, logo, data, periodoLabel }: Props) {
  const corPrimaria = empresa?.corPrimaria || "#0B1B32";
  const corDestaque = empresa?.corDestaque || "#5866D6";
  const s = buildRelatorioStyles(corPrimaria, corDestaque);

  return (
    <RelatorioBasePage empresa={empresa} logo={logo} title="Relatório de Vendas" periodoLabel={periodoLabel}>
      <View style={s.kpiRow}>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Faturamento</Text>
          <Text style={s.kpiValue}>{fmtMoney(data.faturamento)}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>{data.hasIncomplete ? "Custo (parcial)" : "Custo total"}</Text>
          <Text style={s.kpiValue}>{fmtMoney(data.custo)}</Text>
        </View>
        <View style={s.kpiCardAccent}>
          <Text style={s.kpiLabelWhite}>{data.hasIncomplete ? "Lucro (parcial)" : "Lucro bruto"}</Text>
          <Text style={s.kpiValueWhite}>{data.lucro != null ? fmtMoney(data.lucro) : "—"}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>{data.hasIncomplete ? "Margem (parcial)" : "Margem média"}</Text>
          <Text style={s.kpiValue}>{data.margem != null ? fmtPct(data.margem) : "—"}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Ticket médio</Text>
          <Text style={s.kpiValue}>{fmtMoney(data.ticketMedio)}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Conversão</Text>
          <Text style={s.kpiValue}>{data.conversao != null ? fmtPct(data.conversao) : "—"}</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Orçamentos do período ({data.qtdOrcamentos})</Text>

      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { width: 38 }]}>Nº</Text>
        <Text style={[s.tableHeaderText, { width: 60 }]}>Data</Text>
        <Text style={[s.tableHeaderText, { flex: 1 }]}>Cliente</Text>
        <Text style={[s.tableHeaderText, { width: 60 }]}>Status</Text>
        <Text style={[s.tableHeaderText, { width: 70, textAlign: "right" }]}>Valor</Text>
        <Text style={[s.tableHeaderText, { width: 70, textAlign: "right" }]}>Custo</Text>
        <Text style={[s.tableHeaderText, { width: 70, textAlign: "right" }]}>Lucro</Text>
        <Text style={[s.tableHeaderText, { width: 50, textAlign: "right" }]}>Margem</Text>
      </View>

      {data.rows.map((row, idx) => (
        <View key={row.id} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
          <Text style={[s.tableCell, { width: 38 }]}>{row.numero}</Text>
          <Text style={[s.tableCell, { width: 60 }]}>{fmtDateBR(row.data)}</Text>
          <Text style={[s.tableCell, { flex: 1 }]}>{row.cliente}</Text>
          <Text style={[s.tableCell, { width: 60 }]}>{statusLabel[row.status] ?? row.status}</Text>
          <Text style={[s.tableCell, { width: 70, textAlign: "right" }]}>{fmtMoney(row.valorFinal)}</Text>
          <Text style={[s.tableCell, { width: 70, textAlign: "right" }]}>
            {fmtMoney(row.custo)}
            {row.partial ? "*" : ""}
          </Text>
          <Text style={[s.tableCell, { width: 70, textAlign: "right" }]}>
            {row.lucro != null ? fmtMoney(row.lucro) : "—"}
          </Text>
          <Text style={[s.tableCell, { width: 50, textAlign: "right" }]}>
            {row.margem != null ? fmtPct(row.margem) : "—"}
          </Text>
        </View>
      ))}

      {data.hasIncomplete && (
        <Text style={{ marginTop: 10, fontSize: 7, color: "#888" }}>
          * Itens com custo interno não informado. Lucro e margem exibidos como parciais.
        </Text>
      )}
    </RelatorioBasePage>
  );
}
