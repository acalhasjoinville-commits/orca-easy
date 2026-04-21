import { View, Text } from "@react-pdf/renderer";

import type { MinhaEmpresa } from "@/lib/types";
import type { PdfLogoAsset } from "@/lib/fetchLogoBase64";
import type { ClientesABCAggregation } from "@/lib/relatorios/aggregations";
import { fmtMoney, fmtPct } from "@/lib/relatorios/format";
import { RelatorioBasePage, buildRelatorioStyles } from "./shared";

interface Props {
  empresa?: MinhaEmpresa | null;
  logo?: PdfLogoAsset | null;
  data: ClientesABCAggregation;
  periodoLabel: string;
}

export function RelatorioClientesPDF({ empresa, logo, data, periodoLabel }: Props) {
  const corPrimaria = empresa?.corPrimaria || "#0B1B32";
  const corDestaque = empresa?.corDestaque || "#5866D6";
  const s = buildRelatorioStyles(corPrimaria, corDestaque);

  return (
    <RelatorioBasePage empresa={empresa} logo={logo} title="Curva ABC de Clientes" periodoLabel={periodoLabel}>
      <View style={s.kpiRow}>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Faturamento total</Text>
          <Text style={s.kpiValue}>{fmtMoney(data.total)}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Clientes ativos</Text>
          <Text style={s.kpiValue}>{data.rows.length}</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Ranking ({data.rows.length} clientes)</Text>

      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { width: 24 }]}>#</Text>
        <Text style={[s.tableHeaderText, { flex: 1 }]}>Cliente</Text>
        <Text style={[s.tableHeaderText, { width: 40, textAlign: "right" }]}>Orç.</Text>
        <Text style={[s.tableHeaderText, { width: 90, textAlign: "right" }]}>Faturamento</Text>
        <Text style={[s.tableHeaderText, { width: 60, textAlign: "right" }]}>% total</Text>
        <Text style={[s.tableHeaderText, { width: 60, textAlign: "right" }]}>Acumul.</Text>
        <Text style={[s.tableHeaderText, { width: 80, textAlign: "right" }]}>Ticket médio</Text>
        <Text style={[s.tableHeaderText, { width: 40, textAlign: "center" }]}>Classe</Text>
      </View>

      {data.rows.map((row, idx) => (
        <View key={row.clienteId || row.cliente + idx} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
          <Text style={[s.tableCell, { width: 24 }]}>{idx + 1}</Text>
          <Text style={[s.tableCell, { flex: 1 }]}>{row.cliente}</Text>
          <Text style={[s.tableCell, { width: 40, textAlign: "right" }]}>{row.qtdOrcamentos}</Text>
          <Text style={[s.tableCell, { width: 90, textAlign: "right" }]}>{fmtMoney(row.faturamento)}</Text>
          <Text style={[s.tableCell, { width: 60, textAlign: "right" }]}>{fmtPct(row.participacaoPct)}</Text>
          <Text style={[s.tableCell, { width: 60, textAlign: "right" }]}>{fmtPct(row.acumuladoPct)}</Text>
          <Text style={[s.tableCell, { width: 80, textAlign: "right" }]}>{fmtMoney(row.ticketMedio)}</Text>
          <Text style={[s.tableCell, { width: 40, textAlign: "center", fontFamily: "Helvetica-Bold" }]}>
            {row.classe}
          </Text>
        </View>
      ))}
    </RelatorioBasePage>
  );
}
