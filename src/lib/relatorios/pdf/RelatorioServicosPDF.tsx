import { View, Text } from "@react-pdf/renderer";

import type { MinhaEmpresa } from "@/lib/types";
import type { PdfLogoAsset } from "@/lib/fetchLogoBase64";
import type { ServicosAggregation } from "@/lib/relatorios/aggregations";
import { fmtMoney, fmtPct } from "@/lib/relatorios/format";
import { RelatorioBasePage, buildRelatorioStyles } from "./shared";

interface Props {
  empresa?: MinhaEmpresa | null;
  logo?: PdfLogoAsset | null;
  data: ServicosAggregation;
  periodoLabel: string;
}

export function RelatorioServicosPDF({ empresa, logo, data, periodoLabel }: Props) {
  const corPrimaria = empresa?.corPrimaria || "#0B1B32";
  const corDestaque = empresa?.corDestaque || "#5866D6";
  const s = buildRelatorioStyles(corPrimaria, corDestaque);

  const totalReceita = data.rows.reduce((acc, r) => acc + r.receita, 0);

  return (
    <RelatorioBasePage empresa={empresa} logo={logo} title="Relatório de Serviços" periodoLabel={periodoLabel}>
      <View style={s.kpiRow}>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Receita total</Text>
          <Text style={s.kpiValue}>{fmtMoney(totalReceita)}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Serviços distintos</Text>
          <Text style={s.kpiValue}>{data.rows.length}</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Por serviço</Text>

      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { flex: 1 }]}>Serviço</Text>
        <Text style={[s.tableHeaderText, { width: 50, textAlign: "right" }]}>Qtd.</Text>
        <Text style={[s.tableHeaderText, { width: 90, textAlign: "right" }]}>Receita</Text>
        <Text style={[s.tableHeaderText, { width: 90, textAlign: "right" }]}>Custo</Text>
        <Text style={[s.tableHeaderText, { width: 90, textAlign: "right" }]}>Lucro</Text>
        <Text style={[s.tableHeaderText, { width: 60, textAlign: "right" }]}>Margem</Text>
      </View>

      {data.rows.map((row, idx) => (
        <View key={row.nomeServico + idx} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
          <Text style={[s.tableCell, { flex: 1 }]}>{row.nomeServico}</Text>
          <Text style={[s.tableCell, { width: 50, textAlign: "right" }]}>{row.qtdItens}</Text>
          <Text style={[s.tableCell, { width: 90, textAlign: "right" }]}>{fmtMoney(row.receita)}</Text>
          <Text style={[s.tableCell, { width: 90, textAlign: "right" }]}>
            {fmtMoney(row.custo)}
            {row.partial ? "*" : ""}
          </Text>
          <Text style={[s.tableCell, { width: 90, textAlign: "right" }]}>
            {row.lucro != null ? fmtMoney(row.lucro) : "—"}
          </Text>
          <Text style={[s.tableCell, { width: 60, textAlign: "right" }]}>
            {row.margem != null ? fmtPct(row.margem) : "—"}
          </Text>
        </View>
      ))}
    </RelatorioBasePage>
  );
}
