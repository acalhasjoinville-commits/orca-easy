import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarRange,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Percent,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useRelatorios, type PeriodPreset } from "@/hooks/useRelatorios";
import { useClientes, useEmpresa } from "@/hooks/useSupabaseData";
import { useIsMobile } from "@/hooks/use-mobile";
import { fetchPdfLogoAsset, type PdfLogoAsset } from "@/lib/fetchLogoBase64";
import { downloadCsv } from "@/lib/relatorios/exportCsv";
import { downloadXlsx } from "@/lib/relatorios/exportXlsx";
import {
  fmtDateBR,
  fmtMoney,
  fmtNumber,
  fmtPct,
  slugify,
  statusLabel,
  todayStamp,
} from "@/lib/relatorios/format";
import type {
  ClientesABCAggregation,
  DREAggregation,
  ServicosAggregation,
  VendasAggregation,
} from "@/lib/relatorios/aggregations";

type ExportFormat = "pdf" | "csv" | "xlsx";
type RelatorioTab = "vendas" | "clientes" | "servicos" | "financeiro";

const TAB_STORAGE_KEY = "orcacalhas:relatorios-tab:v1";

function isRelatorioTab(value: string): value is RelatorioTab {
  return value === "vendas" || value === "clientes" || value === "servicos" || value === "financeiro";
}

// ─── Filter bar ──────────────────────────────────────────────────────────

interface FilterBarProps {
  filters: ReturnType<typeof useRelatorios>["filters"];
  setFilters: ReturnType<typeof useRelatorios>["setFilters"];
  clientes: { id: string; nomeRazaoSocial: string }[];
}

function FilterBar({ filters, setFilters, clientes }: FilterBarProps) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="space-y-1.5 sm:w-[200px]">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Período
            </Label>
            <Select
              value={filters.preset}
              onValueChange={(v) => setFilters({ ...filters, preset: v as PeriodPreset })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês atual</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="year">Ano atual</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filters.preset === "custom" && (
            <>
              <div className="space-y-1.5 sm:w-[160px]">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Início
                </Label>
                <Input
                  type="date"
                  className="h-9"
                  value={filters.customStart}
                  onChange={(e) => setFilters({ ...filters, customStart: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:w-[160px]">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Fim
                </Label>
                <Input
                  type="date"
                  className="h-9"
                  value={filters.customEnd}
                  onChange={(e) => setFilters({ ...filters, customEnd: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="space-y-1.5 sm:flex-1 sm:min-w-[200px]">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Cliente (opcional)
            </Label>
            <Select
              value={filters.clienteId || "all"}
              onValueChange={(v) => setFilters({ ...filters, clienteId: v === "all" ? "" : v })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nomeRazaoSocial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  icon: Icon,
  color = "text-foreground",
  iconBg = "bg-muted",
  highlight = false,
  badge,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color?: string;
  iconBg?: string;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <Card className={highlight ? "border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.06]" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </div>
        <p className={`text-xl lg:text-2xl font-bold ${color}`}>{value}</p>
        {badge && <p className="mt-1 text-[10px] text-amber-600">{badge}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Export dropdown ─────────────────────────────────────────────────────

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  busy: boolean;
  disabled?: boolean;
}

function ExportButton({ onExport, busy, disabled }: ExportButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="h-9 gap-2" disabled={busy || disabled}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {busy ? "Gerando..." : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => void onExport("pdf")} className="gap-2 text-xs">
          <FileText className="h-3.5 w-3.5" /> PDF (formatado)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void onExport("xlsx")} className="gap-2 text-xs">
          <FileSpreadsheet className="h-3.5 w-3.5" /> Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void onExport("csv")} className="gap-2 text-xs">
          <FileSpreadsheet className="h-3.5 w-3.5" /> CSV (Excel BR)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Helpers to build artifacts (pdf via dynamic import keeps bundle small) ──

async function exportPdf(buildDoc: () => Promise<{ doc: React.ReactElement; filename: string }>) {
  const { pdf } = await import("@react-pdf/renderer");
  const { doc, filename } = await buildDoc();
  const blob = await pdf(doc).toBlob();
  const { triggerBlobDownload } = await import("@/lib/relatorios/exportCsv");
  triggerBlobDownload(filename, blob);
}

// ─── Vendas tab ──────────────────────────────────────────────────────────

function VendasPanel({
  data,
  periodoLabel,
  empresa,
  empresaSlug,
  logo,
}: {
  data: VendasAggregation;
  periodoLabel: string;
  empresa: ReturnType<typeof useEmpresa>["empresa"];
  empresaSlug: string;
  logo: PdfLogoAsset | null;
}) {
  const isMobile = useIsMobile();
  const [busy, setBusy] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (busy) return;
    setBusy(true);
    try {
      const baseName = `relatorio-vendas-${empresaSlug}-${todayStamp()}`;
      if (format === "csv") {
        downloadCsv(`${baseName}.csv`, {
          headers: ["Nº", "Data", "Cliente", "Status", "Valor final", "Custo", "Lucro", "Margem %", "Parcial"],
          rows: data.rows.map((r) => [
            r.numero,
            fmtDateBR(r.data),
            r.cliente,
            statusLabel[r.status] ?? r.status,
            r.valorFinal,
            r.custo,
            r.lucro != null ? r.lucro : "",
            r.margem != null ? r.margem.toFixed(2) : "",
            r.partial ? "Sim" : "Não",
          ]),
        });
      } else if (format === "xlsx") {
        await downloadXlsx(`${baseName}.xlsx`, [
          {
            name: "Resumo",
            data: [
              ["Período", periodoLabel],
              ["Faturamento", data.faturamento],
              ["Custo conhecido", data.custo],
              ["Lucro bruto", data.lucro ?? ""],
              ["Margem média (%)", data.margem ?? ""],
              ["Ticket médio", data.ticketMedio],
              ["Conversão (%)", data.conversao ?? ""],
              ["Qtd. orçamentos", data.qtdOrcamentos],
              ["Custo parcial?", data.hasIncomplete ? "Sim" : "Não"],
            ],
          },
          {
            name: "Orçamentos",
            data: [
              ["Nº", "Data", "Cliente", "Status", "Valor final", "Custo", "Lucro", "Margem %", "Parcial"],
              ...data.rows.map((r) => [
                r.numero,
                fmtDateBR(r.data),
                r.cliente,
                statusLabel[r.status] ?? r.status,
                r.valorFinal,
                r.custo,
                r.lucro ?? "",
                r.margem ?? "",
                r.partial ? "Sim" : "Não",
              ]),
            ],
          },
        ]);
      } else {
        await exportPdf(async () => {
          const { RelatorioVendasPDF } = await import("@/lib/relatorios/pdf/RelatorioVendasPDF");
          return {
            doc: <RelatorioVendasPDF empresa={empresa} logo={logo} data={data} periodoLabel={periodoLabel} />,
            filename: `${baseName}.pdf`,
          };
        });
      }
    } catch (err) {
      console.error("Erro ao exportar vendas:", err);
      toast.error("Erro ao gerar o arquivo. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {data.qtdOrcamentos} orçamento{data.qtdOrcamentos === 1 ? "" : "s"} no período • {periodoLabel}
        </p>
        <ExportButton onExport={handleExport} busy={busy} disabled={data.qtdOrcamentos === 0} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <KpiCard
          title="Faturamento"
          value={fmtMoney(data.faturamento)}
          icon={DollarSign}
          iconBg="bg-primary/10"
          color="text-primary"
        />
        <KpiCard
          title={data.hasIncomplete ? "Custo (parcial)" : "Custo total"}
          value={fmtMoney(data.custo)}
          icon={BarChart3}
          iconBg="bg-muted"
          color="text-muted-foreground"
        />
        <KpiCard
          title={data.hasIncomplete ? "Lucro bruto (parcial)" : "Lucro bruto"}
          value={data.lucro != null ? fmtMoney(data.lucro) : "—"}
          icon={TrendingUp}
          iconBg="bg-emerald-500/10"
          color={data.hasIncomplete ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}
          highlight={!data.hasIncomplete}
        />
        <KpiCard
          title={data.hasIncomplete ? "Margem (parcial)" : "Margem média"}
          value={data.margem != null ? fmtPct(data.margem) : "—"}
          icon={Percent}
          iconBg="bg-amber-500/10"
          color="text-amber-600 dark:text-amber-400"
        />
        <KpiCard
          title="Ticket médio"
          value={fmtMoney(data.ticketMedio)}
          icon={DollarSign}
          iconBg="bg-muted"
          color="text-foreground"
        />
        <KpiCard
          title="Conversão"
          value={data.conversao != null ? fmtPct(data.conversao) : "—"}
          icon={Percent}
          iconBg="bg-emerald-500/10"
          color="text-emerald-600 dark:text-emerald-400"
          badge={data.conversao == null ? "Sem aprovados/rejeitados" : undefined}
        />
      </div>

      {data.hasIncomplete && (
        <p className="text-xs text-amber-600 px-1">
          Alguns orçamentos possuem itens sem custo interno informado. Lucro e margem exibidos como parciais.
        </p>
      )}

      <Card>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Receita vs Custo</h2>
            <span className="text-[10px] text-muted-foreground">Por mês</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.serieMensal} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: number) => fmtMoney(v)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="custo" name="Custo" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Orçamentos do período</h2>
            <span className="text-[10px] text-muted-foreground">{data.rows.length} registros</span>
          </div>
          {data.rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <BarChart3 className="h-10 w-10 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum orçamento aprovado ou executado no período.</p>
            </div>
          ) : isMobile ? (
            <div className="space-y-3">
              {data.rows.map((r) => (
                <div key={r.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">#{r.numero} • {r.cliente}</p>
                      <p className="text-xs text-muted-foreground">{fmtDateBR(r.data)}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {statusLabel[r.status] ?? r.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Valor</p>
                      <p className="font-medium">{fmtMoney(r.valorFinal)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Custo</p>
                      <p className="font-medium">
                        {fmtMoney(r.custo)} {r.partial && <span className="text-[10px] text-amber-600">parcial</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lucro</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {r.lucro != null ? fmtMoney(r.lucro) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[11px] text-muted-foreground bg-muted/30">
                    <th className="py-2.5 px-3 font-medium">Nº</th>
                    <th className="py-2.5 px-3 font-medium">Data</th>
                    <th className="py-2.5 px-3 font-medium">Cliente</th>
                    <th className="py-2.5 px-3 font-medium">Status</th>
                    <th className="py-2.5 px-3 font-medium text-right">Valor final</th>
                    <th className="py-2.5 px-3 font-medium text-right">Custo</th>
                    <th className="py-2.5 px-3 font-medium text-right">Lucro</th>
                    <th className="py-2.5 px-3 font-medium text-right">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium">#{r.numero}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{fmtDateBR(r.data)}</td>
                      <td className="py-2.5 px-3">{r.cliente}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant="secondary" className="text-[10px]">
                          {statusLabel[r.status] ?? r.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmtMoney(r.valorFinal)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <div className="flex flex-col items-end">
                          <span>{fmtMoney(r.custo)}</span>
                          {r.partial && <span className="text-[10px] text-amber-600">parcial</span>}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {r.lucro != null ? fmtMoney(r.lucro) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {r.margem != null ? fmtPct(r.margem) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Clientes ABC tab ────────────────────────────────────────────────────

function ClientesPanel({
  data,
  periodoLabel,
  empresa,
  empresaSlug,
  logo,
}: {
  data: ClientesABCAggregation;
  periodoLabel: string;
  empresa: ReturnType<typeof useEmpresa>["empresa"];
  empresaSlug: string;
  logo: PdfLogoAsset | null;
}) {
  const isMobile = useIsMobile();
  const [busy, setBusy] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (busy) return;
    setBusy(true);
    try {
      const baseName = `relatorio-clientes-${empresaSlug}-${todayStamp()}`;
      const headers = ["#", "Cliente", "Orçamentos", "Faturamento", "% total", "Acumulado", "Ticket médio", "Classe"];
      const rows = data.rows.map((r, idx) => [
        idx + 1,
        r.cliente,
        r.qtdOrcamentos,
        r.faturamento,
        Number(r.participacaoPct.toFixed(2)),
        Number(r.acumuladoPct.toFixed(2)),
        Number(r.ticketMedio.toFixed(2)),
        r.classe,
      ]);
      if (format === "csv") {
        downloadCsv(`${baseName}.csv`, { headers, rows });
      } else if (format === "xlsx") {
        await downloadXlsx(`${baseName}.xlsx`, [
          {
            name: "Resumo",
            data: [
              ["Período", periodoLabel],
              ["Faturamento total", data.total],
              ["Clientes ativos", data.rows.length],
            ],
          },
          { name: "Curva ABC", data: [headers, ...rows] },
        ]);
      } else {
        await exportPdf(async () => {
          const { RelatorioClientesPDF } = await import("@/lib/relatorios/pdf/RelatorioClientesPDF");
          return {
            doc: <RelatorioClientesPDF empresa={empresa} logo={logo} data={data} periodoLabel={periodoLabel} />,
            filename: `${baseName}.pdf`,
          };
        });
      }
    } catch (err) {
      console.error("Erro ao exportar clientes:", err);
      toast.error("Erro ao gerar o arquivo. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  const top10 = data.rows.slice(0, 10);

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {data.rows.length} cliente{data.rows.length === 1 ? "" : "s"} • {periodoLabel}
        </p>
        <ExportButton onExport={handleExport} busy={busy} disabled={data.rows.length === 0} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          title="Faturamento total"
          value={fmtMoney(data.total)}
          icon={DollarSign}
          iconBg="bg-primary/10"
          color="text-primary"
        />
        <KpiCard
          title="Clientes ativos"
          value={String(data.rows.length)}
          icon={Users}
          iconBg="bg-muted"
          color="text-foreground"
        />
      </div>

      {top10.length > 0 && (
        <Card>
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Top 10 — Maior faturamento</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={top10.map((r, idx) => ({ name: `${idx + 1}. ${r.cliente.slice(0, 18)}`, faturamento: r.faturamento }))}
                layout="vertical"
                margin={{ left: 10, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10 }}
                />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={140} />
                <Tooltip formatter={(v: number) => fmtMoney(v)} />
                <Bar dataKey="faturamento" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Curva ABC</h2>
            <span className="text-[10px] text-muted-foreground">{"A ≤ 80% • B 80–95% • C > 95%"}</span>
          </div>
          {data.rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Users className="h-10 w-10 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum cliente com faturamento no período.</p>
            </div>
          ) : isMobile ? (
            <div className="space-y-2">
              {data.rows.map((r, idx) => (
                <div key={r.clienteId || r.cliente + idx} className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">
                      {idx + 1}. {r.cliente}
                    </p>
                    <Badge
                      variant={r.classe === "A" ? "default" : r.classe === "B" ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      Classe {r.classe}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Faturamento</p>
                      <p className="font-medium">{fmtMoney(r.faturamento)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">% total</p>
                      <p className="font-medium">{fmtPct(r.participacaoPct)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ticket</p>
                      <p className="font-medium">{fmtMoney(r.ticketMedio)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[11px] text-muted-foreground bg-muted/30">
                    <th className="py-2.5 px-3 font-medium w-10">#</th>
                    <th className="py-2.5 px-3 font-medium">Cliente</th>
                    <th className="py-2.5 px-3 font-medium text-right">Orç.</th>
                    <th className="py-2.5 px-3 font-medium text-right">Faturamento</th>
                    <th className="py-2.5 px-3 font-medium text-right">% total</th>
                    <th className="py-2.5 px-3 font-medium text-right">Acumul.</th>
                    <th className="py-2.5 px-3 font-medium text-right">Ticket médio</th>
                    <th className="py-2.5 px-3 font-medium text-center">Classe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r, idx) => (
                    <tr key={r.clienteId || r.cliente + idx} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2.5 px-3 text-muted-foreground tabular-nums">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium">{r.cliente}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{r.qtdOrcamentos}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmtMoney(r.faturamento)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmtPct(r.participacaoPct)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                        {fmtPct(r.acumuladoPct)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmtMoney(r.ticketMedio)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge
                          variant={r.classe === "A" ? "default" : r.classe === "B" ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          {r.classe}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Serviços tab ────────────────────────────────────────────────────────

function ServicosPanel({
  data,
  periodoLabel,
  empresa,
  empresaSlug,
  logo,
}: {
  data: ServicosAggregation;
  periodoLabel: string;
  empresa: ReturnType<typeof useEmpresa>["empresa"];
  empresaSlug: string;
  logo: PdfLogoAsset | null;
}) {
  const isMobile = useIsMobile();
  const [busy, setBusy] = useState(false);

  const totalReceita = data.rows.reduce((acc, r) => acc + r.receita, 0);
  const top10 = data.rows.slice(0, 10);

  const handleExport = async (format: ExportFormat) => {
    if (busy) return;
    setBusy(true);
    try {
      const baseName = `relatorio-servicos-${empresaSlug}-${todayStamp()}`;
      const headers = ["Serviço", "Quantidade", "Receita", "Custo", "Lucro", "Margem %", "Parcial"];
      const rows = data.rows.map((r) => [
        r.nomeServico,
        r.qtdItens,
        r.receita,
        r.custo,
        r.lucro ?? "",
        r.margem != null ? Number(r.margem.toFixed(2)) : "",
        r.partial ? "Sim" : "Não",
      ]);
      if (format === "csv") {
        downloadCsv(`${baseName}.csv`, { headers, rows });
      } else if (format === "xlsx") {
        await downloadXlsx(`${baseName}.xlsx`, [
          {
            name: "Resumo",
            data: [
              ["Período", periodoLabel],
              ["Receita total", totalReceita],
              ["Serviços distintos", data.rows.length],
            ],
          },
          { name: "Por serviço", data: [headers, ...rows] },
        ]);
      } else {
        await exportPdf(async () => {
          const { RelatorioServicosPDF } = await import("@/lib/relatorios/pdf/RelatorioServicosPDF");
          return {
            doc: <RelatorioServicosPDF empresa={empresa} logo={logo} data={data} periodoLabel={periodoLabel} />,
            filename: `${baseName}.pdf`,
          };
        });
      }
    } catch (err) {
      console.error("Erro ao exportar serviços:", err);
      toast.error("Erro ao gerar o arquivo. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {data.rows.length} serviço{data.rows.length === 1 ? "" : "s"} distintos • {periodoLabel}
        </p>
        <ExportButton onExport={handleExport} busy={busy} disabled={data.rows.length === 0} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          title="Receita total"
          value={fmtMoney(totalReceita)}
          icon={DollarSign}
          iconBg="bg-primary/10"
          color="text-primary"
        />
        <KpiCard
          title="Serviços distintos"
          value={String(data.rows.length)}
          icon={Wrench}
          iconBg="bg-muted"
          color="text-foreground"
        />
      </div>

      {top10.length > 0 && (
        <Card>
          <CardContent className="p-4 lg:p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Top 10 serviços por receita</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={top10.map((r) => ({ name: r.nomeServico.slice(0, 18), receita: r.receita }))}
                layout="vertical"
                margin={{ left: 10, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10 }}
                />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={140} />
                <Tooltip formatter={(v: number) => fmtMoney(v)} />
                <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Por serviço</h2>
          </div>
          {data.rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Wrench className="h-10 w-10 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum serviço vendido no período.</p>
            </div>
          ) : isMobile ? (
            <div className="space-y-2">
              {data.rows.map((r) => (
                <div key={r.nomeServico} className="rounded-lg border p-3 space-y-1">
                  <p className="text-sm font-medium">{r.nomeServico}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Qtd.</p>
                      <p className="font-medium">{fmtNumber(r.qtdItens, 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Receita</p>
                      <p className="font-medium">{fmtMoney(r.receita)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Margem</p>
                      <p className="font-medium">{r.margem != null ? fmtPct(r.margem) : "—"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[11px] text-muted-foreground bg-muted/30">
                    <th className="py-2.5 px-3 font-medium">Serviço</th>
                    <th className="py-2.5 px-3 font-medium text-right">Quantidade</th>
                    <th className="py-2.5 px-3 font-medium text-right">Receita</th>
                    <th className="py-2.5 px-3 font-medium text-right">Custo</th>
                    <th className="py-2.5 px-3 font-medium text-right">Lucro</th>
                    <th className="py-2.5 px-3 font-medium text-right">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.nomeServico} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2.5 px-3 font-medium">{r.nomeServico}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmtNumber(r.qtdItens, 0)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmtMoney(r.receita)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {fmtMoney(r.custo)} {r.partial && <span className="text-[10px] text-amber-600">parcial</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {r.lucro != null ? fmtMoney(r.lucro) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {r.margem != null ? fmtPct(r.margem) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Financeiro (DRE) tab ────────────────────────────────────────────────

function FinanceiroPanel({
  data,
  periodoLabel,
  empresa,
  empresaSlug,
  logo,
}: {
  data: DREAggregation;
  periodoLabel: string;
  empresa: ReturnType<typeof useEmpresa>["empresa"];
  empresaSlug: string;
  logo: PdfLogoAsset | null;
}) {
  const [busy, setBusy] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (busy) return;
    setBusy(true);
    try {
      const baseName = `relatorio-financeiro-${empresaSlug}-${todayStamp()}`;
      const monthHeaders = data.meses.map((m) => m.label);
      const headers = ["Categoria", ...monthHeaders, "Total"];
      const receitaRows = data.receitas.map((r) => [
        r.categoria,
        ...data.meses.map((m) => r.porMes[m.key] ?? 0),
        r.total,
      ]);
      const despesaRows = data.despesas.map((r) => [
        r.categoria,
        ...data.meses.map((m) => r.porMes[m.key] ?? 0),
        r.total,
      ]);

      if (format === "csv") {
        downloadCsv(`${baseName}.csv`, {
          headers,
          rows: [
            ["RECEITAS"],
            ...receitaRows,
            ["DESPESAS"],
            ...despesaRows,
            ["RESULTADO LÍQUIDO", ...data.meses.map((m) => m.resultado), data.resultadoLiquido],
          ],
        });
      } else if (format === "xlsx") {
        await downloadXlsx(`${baseName}.xlsx`, [
          {
            name: "Resumo",
            data: [
              ["Período", periodoLabel],
              ["Total receitas", data.totalReceitas],
              ["Total despesas", data.totalDespesas],
              ["Resultado líquido", data.resultadoLiquido],
              ["Faturado no período", data.faturadoNoPeriodo],
              ["Recebido no período", data.recebidoNoPeriodo],
            ],
          },
          { name: "Receitas", data: [headers, ...receitaRows] },
          { name: "Despesas", data: [headers, ...despesaRows] },
          {
            name: "Resultado mensal",
            data: [
              ["Mês", "Receita", "Despesa", "Resultado"],
              ...data.meses.map((m) => [m.label, m.receitaExecutada + m.receitaManual, m.despesa, m.resultado]),
            ],
          },
        ]);
      } else {
        await exportPdf(async () => {
          const { RelatorioFinanceiroPDF } = await import("@/lib/relatorios/pdf/RelatorioFinanceiroPDF");
          return {
            doc: <RelatorioFinanceiroPDF empresa={empresa} logo={logo} data={data} periodoLabel={periodoLabel} />,
            filename: `${baseName}.pdf`,
          };
        });
      }
    } catch (err) {
      console.error("Erro ao exportar financeiro:", err);
      toast.error("Erro ao gerar o arquivo. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  const totalReceitaMes = data.meses.map((m) => m.receitaExecutada + m.receitaManual);

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">DRE simplificado • {periodoLabel}</p>
        <ExportButton onExport={handleExport} busy={busy} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KpiCard
          title="Receitas"
          value={fmtMoney(data.totalReceitas)}
          icon={TrendingUp}
          iconBg="bg-emerald-500/10"
          color="text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          title="Despesas"
          value={fmtMoney(data.totalDespesas)}
          icon={TrendingUp}
          iconBg="bg-red-500/10"
          color="text-red-600 dark:text-red-400"
        />
        <KpiCard
          title="Resultado líquido"
          value={fmtMoney(data.resultadoLiquido)}
          icon={DollarSign}
          iconBg={data.resultadoLiquido >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}
          color={
            data.resultadoLiquido >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }
          highlight
        />
        <KpiCard
          title="Faturado no período"
          value={fmtMoney(data.faturadoNoPeriodo)}
          icon={CalendarRange}
          iconBg="bg-muted"
          color="text-foreground"
        />
        <KpiCard
          title="Recebido no período"
          value={fmtMoney(data.recebidoNoPeriodo)}
          icon={CalendarRange}
          iconBg="bg-muted"
          color="text-foreground"
        />
      </div>

      <Card>
        <CardContent className="p-4 lg:p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Resultado mensal</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data.meses.map((m, i) => ({
                label: m.label,
                Receita: totalReceitaMes[i],
                Despesa: m.despesa,
                Resultado: m.resultado,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(v: number) => fmtMoney(v)} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesa" fill="hsl(0 70% 50% / 0.55)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Resultado" fill="hsl(var(--muted-foreground) / 0.45)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 lg:p-5 space-y-6">
          <DRESection title="Receitas" rows={data.receitas} meses={data.meses} emptyHint="Sem receitas no período." />
          <DRESection title="Despesas" rows={data.despesas} meses={data.meses} emptyHint="Sem despesas no período." />
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Resultado líquido</p>
            <p
              className={
                data.resultadoLiquido >= 0
                  ? "text-lg font-bold text-emerald-600 dark:text-emerald-400"
                  : "text-lg font-bold text-red-600 dark:text-red-400"
              }
            >
              {fmtMoney(data.resultadoLiquido)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DRESection({
  title,
  rows,
  meses,
  emptyHint,
}: {
  title: string;
  rows: DREAggregation["receitas"];
  meses: DREAggregation["meses"];
  emptyHint: string;
}) {
  if (rows.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold mb-2">{title}</h3>
        <p className="text-xs text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] text-muted-foreground bg-muted/30">
              <th className="py-2 px-3 font-medium">Categoria</th>
              {meses.map((m) => (
                <th key={m.key} className="py-2 px-3 font-medium text-right whitespace-nowrap">
                  {m.label}
                </th>
              ))}
              <th className="py-2 px-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.categoria} className="border-b last:border-0 hover:bg-muted/40">
                <td className="py-2 px-3">{r.categoria}</td>
                {meses.map((m) => (
                  <td key={m.key} className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                    {fmtMoney(r.porMes[m.key] ?? 0)}
                  </td>
                ))}
                <td className="py-2 px-3 text-right font-semibold tabular-nums">{fmtMoney(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────

export function Relatorios() {
  const { user } = useAuth();
  const { empresa } = useEmpresa();
  const { clientes } = useClientes();
  const { filters, setFilters, periodoLabel, isLoading, vendas, clientes: clientesAgg, servicos, dre } =
    useRelatorios();

  const [activeTab, setActiveTab] = useState<RelatorioTab>("vendas");
  const [logo, setLogo] = useState<PdfLogoAsset | null>(null);

  // Persist tab choice
  useEffect(() => {
    if (!user) return;
    try {
      const stored = sessionStorage.getItem(`${TAB_STORAGE_KEY}:${user.id}`);
      if (stored && isRelatorioTab(stored)) setActiveTab(stored);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try {
      sessionStorage.setItem(`${TAB_STORAGE_KEY}:${user.id}`, activeTab);
    } catch {
      // ignore
    }
  }, [activeTab, user]);

  // Pre-fetch logo for PDFs
  useEffect(() => {
    let cancelled = false;
    if (empresa?.logoUrl) {
      fetchPdfLogoAsset(empresa.logoUrl).then((asset) => {
        if (!cancelled) setLogo(asset);
      });
    } else {
      setLogo(null);
    }
    return () => {
      cancelled = true;
    };
  }, [empresa?.logoUrl]);

  const empresaSlug = useMemo(() => slugify(empresa?.nomeFantasia || "empresa"), [empresa?.nomeFantasia]);

  const sortedClientes = useMemo(
    () =>
      [...clientes]
        .map((c) => ({ id: c.id, nomeRazaoSocial: c.nomeRazaoSocial }))
        .sort((a, b) => a.nomeRazaoSocial.localeCompare(b.nomeRazaoSocial, "pt-BR")),
    [clientes],
  );

  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4 space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Relatórios consolidados de vendas, clientes, serviços e financeiro. Exporte em PDF, Excel ou CSV.
        </p>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} clientes={sortedClientes} />

      <Tabs
        value={activeTab}
        onValueChange={(v) => isRelatorioTab(v) && setActiveTab(v)}
        className="w-full"
      >
        <TabsList className="w-full sm:w-auto h-10">
          <TabsTrigger value="vendas" className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="servicos" className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4">
            <Wrench className="h-3.5 w-3.5 mr-1.5" />
            Serviços
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4">
            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
            Financeiro
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="vendas">
              <VendasPanel
                data={vendas}
                periodoLabel={periodoLabel}
                empresa={empresa}
                empresaSlug={empresaSlug}
                logo={logo}
              />
            </TabsContent>
            <TabsContent value="clientes">
              <ClientesPanel
                data={clientesAgg}
                periodoLabel={periodoLabel}
                empresa={empresa}
                empresaSlug={empresaSlug}
                logo={logo}
              />
            </TabsContent>
            <TabsContent value="servicos">
              <ServicosPanel
                data={servicos}
                periodoLabel={periodoLabel}
                empresa={empresa}
                empresaSlug={empresaSlug}
                logo={logo}
              />
            </TabsContent>
            <TabsContent value="financeiro">
              <FinanceiroPanel
                data={dre}
                periodoLabel={periodoLabel}
                empresa={empresa}
                empresaSlug={empresaSlug}
                logo={logo}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
