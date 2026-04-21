import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, ShieldAlert, Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import { usePublicOrcamento } from "@/hooks/useShareLink";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalOrcamentoView } from "@/components/portal/PortalOrcamentoView";
import { PortalActionBar } from "@/components/portal/PortalActionBar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function StatusCard(props: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: "neutral" | "warn" | "success" | "danger";
}) {
  const toneClass =
    props.tone === "success"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : props.tone === "warn"
        ? "border-amber-500/30 bg-amber-500/5"
        : props.tone === "danger"
          ? "border-red-500/30 bg-red-500/5"
          : "border-border bg-card";
  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${toneClass}`}>
      <div className="mb-2 flex items-center gap-2">
        <div className="text-foreground">{props.icon}</div>
        <h2 className="text-sm font-semibold text-foreground">{props.title}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{props.description}</p>
    </div>
  );
}

export default function PortalOrcamento() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, isError, error } = usePublicOrcamento(token);

  // Page title
  useEffect(() => {
    if (data) {
      document.title = `Orçamento Nº ${data.orcamento.numero_orcamento} — ${data.empresa.nome_fantasia}`;
    } else {
      document.title = "Portal do cliente";
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    const msg = error instanceof Error ? error.message : "";
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <StatusCard
            icon={<ShieldAlert className="h-5 w-5 text-red-600" />}
            title="Link inválido ou indisponível"
            description={
              msg ||
              "Não foi possível abrir este orçamento. Peça ao fornecedor para gerar um novo link."
            }
            tone="danger"
          />
        </div>
      </div>
    );
  }

  const showActions =
    data.link_status === "ativo" && data.orcamento.status === "pendente";

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader empresa={data.empresa} />

      <main className="mx-auto max-w-3xl space-y-3 px-4 py-4 sm:space-y-4 sm:py-6">
        {/* Status do link / orçamento */}
        {data.link_status === "expirado" && (
          <StatusCard
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            title="Este link expirou"
            description={`Você ainda pode visualizar o conteúdo do orçamento, mas não é mais possível responder. Entre em contato com o fornecedor para receber um novo link. Expirou em ${format(new Date(data.expires_at), "dd/MM/yyyy", { locale: ptBR })}.`}
            tone="warn"
          />
        )}
        {data.link_status === "revogado" && (
          <StatusCard
            icon={<Ban className="h-5 w-5 text-red-600" />}
            title="Link revogado pelo fornecedor"
            description="Este link foi desativado. Entre em contato para receber um novo."
            tone="danger"
          />
        )}
        {data.orcamento.status === "aprovado" && (
          <StatusCard
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            title="Você aprovou este orçamento"
            description="O fornecedor foi notificado e dará andamento à execução."
            tone="success"
          />
        )}
        {data.orcamento.status === "rejeitado" && (
          <StatusCard
            icon={<XCircle className="h-5 w-5 text-red-600" />}
            title="Este orçamento foi rejeitado"
            description="Caso queira retomar a negociação, entre em contato com o fornecedor."
            tone="danger"
          />
        )}
        {data.orcamento.status === "executado" && (
          <StatusCard
            icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
            title="Serviço em execução"
            description="O fornecedor já iniciou os trabalhos referentes a este orçamento."
            tone="neutral"
          />
        )}
        {data.orcamento.status === "cancelado" && (
          <StatusCard
            icon={<Ban className="h-5 w-5 text-muted-foreground" />}
            title="Orçamento cancelado"
            description="Este orçamento foi cancelado pelo fornecedor."
            tone="neutral"
          />
        )}

        <PortalOrcamentoView payload={data} />

        {showActions ? <PortalActionBar token={token!} /> : null}

        <p className="pt-4 text-center text-[10px] text-muted-foreground">
          Documento seguro · gerado pelo OrcaEasy
        </p>
      </main>
    </div>
  );
}
