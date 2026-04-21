import { View, Text } from "@react-pdf/renderer";

import type { MinhaEmpresa } from "@/lib/types";
import type { PdfLogoAsset } from "@/lib/fetchLogoBase64";
import type { DREAggregation } from "@/lib/relatorios/aggregations";
import { fmtMoney } from "@/lib/relatorios/format";
import { RelatorioBasePage, buildRelatorioStyles } from "./shared";

interface Props {
  empresa?: MinhaEmpresa | null;
  logo?: PdfLogoAsset | null;
  data: DREAggregation;
  periodoLabel: string;
}

export function RelatorioFinanceiroPDF({ empresa, logo, data, periodoLabel }: Props) {
  const corPrimaria = empresa?.corPrimaria || "#0B1B32";
  const corDestaque = empresa?.corDestaque || "#5866D6";
  const s = buildRelatorioStyles(corPrimaria, corDestaque);

  const meses = data.meses;
  const colWidth = Math.max(45, 540 / Math.max(1, meses.length + 1));

  return (
    <RelatorioBasePage empresa={empresa} logo={logo} title="DRE Simplificado" periodoLabel={periodoLabel}>
      <View style={s.kpiRow}>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Receita total</Text>
          <Text style={s.kpiValue}>{fmtMoney(data.totalReceitas)}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Despesa total</Text>
          <Text style={s.kpiValue}>{fmtMoney(data.totalDespesas)}</Text>
        </View>
        <View style={s.kpiCardAccent}>
          <Text style={s.kpiLabelWhite}>Resultado líquido</Text>
          <Text style={s.kpiValueWhite}>{fmtMoney(data.resultadoLiquido)}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Faturado no período</Text>
          <Text style={s.kpiValue}>{fmtMoney(data.faturadoNoPeriodo)}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Recebido no período</Text>
          <Text style={s.kpiValue}>{fmtMoney(data.recebidoNoPeriodo)}</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Receitas</Text>
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { flex: 1 }]}>Categoria</Text>
        {meses.map((m) => (
          <Text key={m.key} style={[s.tableHeaderText, { width: colWidth, textAlign: "right" }]}>
            {m.label}
          </Text>
        ))}
        <Text style={[s.tableHeaderText, { width: colWidth, textAlign: "right" }]}>Total</Text>
      </View>
      {data.receitas.map((row, idx) => (
        <View key={row.categoria + idx} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
          <Text style={[s.tableCell, { flex: 1 }]}>{row.categoria}</Text>
          {meses.map((m) => (
            <Text key={m.key} style={[s.tableCell, { width: colWidth, textAlign: "right" }]}>
              {fmtMoney(row.porMes[m.key] ?? 0)}
            </Text>
          ))}
          <Text style={[s.tableCell, { width: colWidth, textAlign: "right", fontFamily: "Helvetica-Bold" }]}>
            {fmtMoney(row.total)}
          </Text>
        </View>
      ))}

      <Text style={s.sectionTitle}>Despesas</Text>
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { flex: 1 }]}>Categoria</Text>
        {meses.map((m) => (
          <Text key={m.key} style={[s.tableHeaderText, { width: colWidth, textAlign: "right" }]}>
            {m.label}
          </Text>
        ))}
        <Text style={[s.tableHeaderText, { width: colWidth, textAlign: "right" }]}>Total</Text>
      </View>
      {data.despesas.length === 0 ? (
        <View style={s.tableRow} wrap={false}>
          <Text style={[s.tableCell, { flex: 1, color: "#888" }]}>Nenhuma despesa registrada no período.</Text>
        </View>
      ) : (
        data.despesas.map((row, idx) => (
          <View key={row.categoria + idx} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
            <Text style={[s.tableCell, { flex: 1 }]}>{row.categoria}</Text>
            {meses.map((m) => (
              <Text key={m.key} style={[s.tableCell, { width: colWidth, textAlign: "right" }]}>
                {fmtMoney(row.porMes[m.key] ?? 0)}
              </Text>
            ))}
            <Text style={[s.tableCell, { width: colWidth, textAlign: "right", fontFamily: "Helvetica-Bold" }]}>
              {fmtMoney(row.total)}
            </Text>
          </View>
        ))
      )}

      <Text style={s.sectionTitle}>Resultado mensal</Text>
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { flex: 1 }]}>Mês</Text>
        <Text style={[s.tableHeaderText, { width: 110, textAlign: "right" }]}>Receita</Text>
        <Text style={[s.tableHeaderText, { width: 110, textAlign: "right" }]}>Despesa</Text>
        <Text style={[s.tableHeaderText, { width: 110, textAlign: "right" }]}>Resultado</Text>
      </View>
      {meses.map((m, idx) => (
        <View key={m.key} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
          <Text style={[s.tableCell, { flex: 1 }]}>{m.label}</Text>
          <Text style={[s.tableCell, { width: 110, textAlign: "right" }]}>
            {fmtMoney(m.receitaExecutada + m.receitaManual)}
          </Text>
          <Text style={[s.tableCell, { width: 110, textAlign: "right" }]}>{fmtMoney(m.despesa)}</Text>
          <Text style={[s.tableCell, { width: 110, textAlign: "right", fontFamily: "Helvetica-Bold" }]}>
            {fmtMoney(m.resultado)}
          </Text>
        </View>
      ))}
    </RelatorioBasePage>
  );
}
