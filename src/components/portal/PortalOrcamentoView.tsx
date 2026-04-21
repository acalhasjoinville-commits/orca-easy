import type { PortalPayload } from "@/hooks/useShareLink";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  payload: PortalPayload;
}

const statusLabel: Record<PortalPayload["orcamento"]["status"], { label: string; tone: string }> = {
  pendente: { label: "Aguardando sua resposta", tone: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  aprovado: { label: "Aprovado", tone: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  rejeitado: { label: "Rejeitado", tone: "bg-red-500/15 text-red-700 border-red-500/30" },
  executado: { label: "Em execução", tone: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  cancelado: { label: "Cancelado", tone: "bg-gray-500/15 text-gray-600 border-gray-500/30" },
};

function fmtMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

function getNum(item: Record<string, unknown>, key: string): number {
  const v = item[key];
  return typeof v === "number" ? v : Number(v) || 0;
}

function getStr(item: Record<string, unknown>, key: string): string {
  const v = item[key];
  return typeof v === "string" ? v : "";
}

export function PortalOrcamentoView({ payload }: Props) {
  const { orcamento, cliente, empresa } = payload;
  const st = statusLabel[orcamento.status];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Hero */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Orçamento
              </p>
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                Nº {orcamento.numero_orcamento}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Emitido em {fmtDate(orcamento.data_criacao)}
              </p>
            </div>
            <Badge variant="outline" className={st.tone}>
              {st.label}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-4">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Valor total
            </span>
            <span className="text-2xl font-bold text-accent sm:text-3xl">
              {fmtMoney(orcamento.valor_final)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Cliente */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cliente
          </h3>
          <p className="text-sm font-medium text-foreground">{cliente.nome_razao_social}</p>
          {cliente.documento ? (
            <p className="text-xs text-muted-foreground">Documento: {cliente.documento}</p>
          ) : null}
          {cliente.cidade ? (
            <p className="text-xs text-muted-foreground">{cliente.cidade}</p>
          ) : null}
        </CardContent>
      </Card>

      {/* Descrição geral */}
      {orcamento.descricao_geral ? (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Descrição geral
            </h3>
            <p className="whitespace-pre-wrap text-sm text-foreground">{orcamento.descricao_geral}</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Itens */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Itens do orçamento
          </h3>
          <div className="space-y-3">
            {orcamento.itens_servico.map((item, idx) => {
              const nome = getStr(item, "nomeServico") || "Item";
              const modo = getStr(item, "modoCobranca");
              const metragem = getNum(item, "metragem");
              const quantidade = getNum(item, "quantidade");
              const unidade = getStr(item, "unidadeCobranca");
              const valorTotal = getNum(item, "valorTotal") || getNum(item, "valorVenda");
              const desc = getStr(item, "descricao");
              const obs = getStr(item, "observacoes");

              let detalhe = "";
              if (modo === "valor_fechado") {
                detalhe = "Valor fechado";
              } else if (modo === "por_unidade") {
                detalhe = `${quantidade} ${unidade || "un"}`;
              } else if (modo === "por_metro") {
                detalhe = `${metragem.toLocaleString("pt-BR")} m`;
              } else {
                detalhe = `${metragem.toLocaleString("pt-BR")} m`;
              }

              return (
                <div
                  key={(item.id as string) || idx}
                  className="rounded-md border border-border bg-card p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{nome}</p>
                      <p className="text-xs text-muted-foreground">{detalhe}</p>
                      {desc ? (
                        <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{desc}</p>
                      ) : null}
                      {obs ? (
                        <p className="mt-1 whitespace-pre-wrap text-[11px] italic text-muted-foreground">
                          {obs}
                        </p>
                      ) : null}
                    </div>
                    <span className="whitespace-nowrap text-sm font-semibold text-foreground">
                      {fmtMoney(valorTotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totais */}
          <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{fmtMoney(orcamento.valor_venda)}</span>
            </div>
            {orcamento.desconto > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Desconto</span>
                <span>− {fmtMoney(orcamento.desconto)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-semibold text-foreground">
              <span>Total</span>
              <span className="text-accent">{fmtMoney(orcamento.valor_final)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condições comerciais */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Condições comerciais
          </h3>
          <dl className="space-y-2 text-sm">
            {orcamento.validade_snapshot ? (
              <div>
                <dt className="text-xs text-muted-foreground">Validade</dt>
                <dd className="text-foreground">{orcamento.validade_snapshot}</dd>
              </div>
            ) : null}
            {orcamento.formas_pagamento_snapshot ? (
              <div>
                <dt className="text-xs text-muted-foreground">Formas de pagamento</dt>
                <dd className="whitespace-pre-wrap text-foreground">
                  {orcamento.formas_pagamento_snapshot}
                </dd>
              </div>
            ) : null}
            {orcamento.garantia_snapshot ? (
              <div>
                <dt className="text-xs text-muted-foreground">Garantia</dt>
                <dd className="whitespace-pre-wrap text-foreground">{orcamento.garantia_snapshot}</dd>
              </div>
            ) : null}
            {orcamento.tempo_garantia_snapshot ? (
              <div>
                <dt className="text-xs text-muted-foreground">Tempo de garantia</dt>
                <dd className="text-foreground">{orcamento.tempo_garantia_snapshot}</dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      {/* Contato empresa */}
      {empresa.telefone_whatsapp || empresa.email_contato ? (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fale conosco
            </h3>
            {empresa.telefone_whatsapp ? (
              <p className="text-sm text-foreground">📱 {empresa.telefone_whatsapp}</p>
            ) : null}
            {empresa.email_contato ? (
              <p className="text-sm text-foreground">✉️ {empresa.email_contato}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
