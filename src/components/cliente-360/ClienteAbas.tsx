import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, MapPin, Wrench } from "lucide-react";
import type { Orcamento, RetornoServico, Visita } from "@/lib/types";
import {
  STATUS_RETORNO_CONFIG,
  STATUS_VISITA_CONFIG,
  TIPO_RETORNO_CONFIG,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
  }
  return new Date(iso).toLocaleDateString("pt-BR");
}

const STATUS_ORC_CONFIG: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  aprovado: { label: "Aprovado", color: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  executado: { label: "Executado", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  rejeitado: { label: "Rejeitado", color: "bg-red-500/15 text-red-600 border-red-500/30" },
  cancelado: { label: "Cancelado", color: "bg-gray-500/15 text-gray-600 border-gray-500/30" },
};

interface Props {
  orcamentos: Orcamento[];
  visitas: Visita[];
  retornos: RetornoServico[];
  onOpenOrcamento: (orcamentoId: string) => void;
}

export function ClienteAbas({ orcamentos, visitas, retornos, onOpenOrcamento }: Props) {
  return (
    <Tabs defaultValue="orcamentos" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="orcamentos" className="gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Orçamentos ({orcamentos.length})
        </TabsTrigger>
        <TabsTrigger value="visitas" className="gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          Visitas ({visitas.length})
        </TabsTrigger>
        <TabsTrigger value="retornos" className="gap-1.5">
          <Wrench className="h-3.5 w-3.5" />
          Retornos ({retornos.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="orcamentos" className="mt-3">
        {orcamentos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Nenhum orçamento para este cliente.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {orcamentos.map((o) => {
                  const cfg = STATUS_ORC_CONFIG[o.status] ?? STATUS_ORC_CONFIG.pendente;
                  return (
                    <li
                      key={o.id}
                      className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => onOpenOrcamento(o.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">#{o.numeroOrcamento}</span>
                          <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", cfg.color)}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground truncate">
                          {formatDate(o.dataCriacao)}
                          {o.descricaoGeral && <span className="ml-2">• {o.descricaoGeral}</span>}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-foreground">{formatBRL(o.valorFinal)}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="visitas" className="mt-3">
        {visitas.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma visita registrada para este cliente.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {visitas.map((v) => {
                  const cfg = STATUS_VISITA_CONFIG[v.status];
                  return (
                    <li key={v.id} className="px-4 py-3 flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", cfg.color)}>
                            {cfg.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(v.dataVisita)} • {v.horaVisita?.slice(0, 5)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-foreground truncate">
                          {v.tipoServico || "Visita técnica"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{v.enderecoCompleto}</p>
                        {v.observacoes && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{v.observacoes}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="retornos" className="mt-3">
        {retornos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Nenhum retorno do serviço registrado.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {retornos.map((r) => {
                  const cfgStatus = STATUS_RETORNO_CONFIG[r.status];
                  const cfgTipo = TIPO_RETORNO_CONFIG[r.tipo];
                  return (
                    <li
                      key={r.id}
                      className="px-4 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => onOpenOrcamento(r.orcamentoId)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground">{cfgTipo?.label}</span>
                          <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", cfgStatus.color)}>
                            {cfgStatus.label}
                          </span>
                          {r.dataRetorno && (
                            <span className="text-[11px] text-muted-foreground">
                              {formatDate(r.dataRetorno)}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-foreground line-clamp-2">{r.descricao}</p>
                        {r.resolucao && (
                          <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400 line-clamp-1">
                            ✓ {r.resolucao}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
