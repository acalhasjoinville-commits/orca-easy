import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useClienteHistorico } from "@/hooks/useClienteHistorico";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ClienteHeader } from "./ClienteHeader";
import { ClienteResumoFinanceiro } from "./ClienteResumoFinanceiro";
import { ClienteAcompanhamento } from "./ClienteAcompanhamento";
import { ClienteTimeline } from "./ClienteTimeline";
import { ClienteAbas } from "./ClienteAbas";

interface Props {
  /** When set, opens cliente form modal in edit mode for the current cliente */
  onEditarCliente?: () => void;
}

export function ClienteHistorico({ onEditarCliente }: Props) {
  const navigate = useNavigate();
  const params = useParams<{ clienteId?: string; nome?: string }>();
  const { canCreateEditBudget, canManageAgenda, canManageClientes } = useAuth();

  // Routes:
  //   /clientes/:clienteId
  //   /clientes/avulso/:nome
  const isAvulsoRoute = params.clienteId === "avulso";
  const clienteId = isAvulsoRoute ? null : params.clienteId ?? null;
  const nomeAvulso = isAvulsoRoute && params.nome ? decodeURIComponent(params.nome) : null;

  const { data, isLoading, cliente, isAvulso } = useClienteHistorico({
    clienteId,
    nomeCliente: nomeAvulso,
  });

  const handleBack = () => navigate("/clientes");

  const handleOpenOrcamento = (orcamentoId: string) => {
    navigate(`/orcamentos/${orcamentoId}`);
  };

  const handleNovoOrcamento = () => {
    if (!canCreateEditBudget) {
      toast.error("Sem permissão para criar orçamentos.");
      return;
    }
    navigate("/orcamentos/novo");
  };

  const handleAgendarVisita = () => {
    if (!canManageAgenda) {
      toast.error("Sem permissão para agendar visitas.");
      return;
    }
    navigate("/agenda");
  };

  const handleEditar = onEditarCliente && cliente && canManageClientes ? onEditarCliente : undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-4 lg:px-6 py-8">
        <div className="mx-auto max-w-xl rounded-3xl border bg-card p-6 shadow-sm text-center">
          <h2 className="text-lg font-semibold text-foreground">Cliente não encontrado</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Não conseguimos localizar este cliente. Ele pode ter sido removido.
          </p>
          <button
            onClick={handleBack}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Voltar para clientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4 space-y-4">
      <ClienteHeader
        cliente={cliente}
        nomeAvulso={nomeAvulso}
        isAvulso={isAvulso}
        primeiroEm={data.resumo.primeiroOrcamentoEm}
        ultimoEm={data.resumo.ultimoOrcamentoEm}
        onBack={handleBack}
        onNovoOrcamento={handleNovoOrcamento}
        onAgendarVisita={handleAgendarVisita}
        onEditarCliente={handleEditar}
      />

      <ClienteResumoFinanceiro resumo={data.resumo} />

      {data.acompanhamentos.length > 0 && (
        <ClienteAcompanhamento items={data.acompanhamentos} onOpenOrcamento={handleOpenOrcamento} />
      )}

      <Tabs defaultValue="listas" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="listas">Listas</TabsTrigger>
          <TabsTrigger value="timeline">Linha do tempo</TabsTrigger>
        </TabsList>

        <TabsContent value="listas" className="mt-3">
          <ClienteAbas
            orcamentos={data.orcamentos}
            visitas={data.visitas}
            retornos={data.retornos}
            onOpenOrcamento={handleOpenOrcamento}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-3">
          <ClienteTimeline eventos={data.timeline} onOpenOrcamento={handleOpenOrcamento} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
