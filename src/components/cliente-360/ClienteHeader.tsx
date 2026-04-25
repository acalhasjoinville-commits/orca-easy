import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, FilePlus2, MapPin, Pencil, Phone, User, AlertCircle } from "lucide-react";
import type { Cliente } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  cliente: Cliente | null;
  /** Display name when cliente is null (avulso) */
  nomeAvulso?: string | null;
  isAvulso: boolean;
  primeiroEm?: string | null;
  ultimoEm?: string | null;
  onBack: () => void;
  onNovoOrcamento: () => void;
  onAgendarVisita: () => void;
  onEditarCliente?: () => void;
}

function formatDateOnly(iso: string | null | undefined): string {
  if (!iso) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
  }
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function ClienteHeader({
  cliente,
  nomeAvulso,
  isAvulso,
  primeiroEm,
  ultimoEm,
  onBack,
  onNovoOrcamento,
  onAgendarVisita,
  onEditarCliente,
}: Props) {
  const nome = cliente?.nomeRazaoSocial ?? nomeAvulso ?? "Cliente";
  const isPJ = cliente?.tipo === "PJ";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 lg:p-5">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            <div
              className={cn(
                "shrink-0 flex h-12 w-12 items-center justify-center rounded-xl",
                isPJ ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary",
              )}
            >
              {isPJ ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {cliente && (
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                      isPJ ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary",
                    )}
                  >
                    {cliente.tipo}
                  </span>
                )}
                {isAvulso && (
                  <span className="rounded-md bg-amber-500/15 text-amber-700 px-1.5 py-0.5 text-[10px] font-bold border border-amber-500/30">
                    AVULSO
                  </span>
                )}
                <h2 className="text-lg lg:text-xl font-bold text-foreground truncate">{nome}</h2>
              </div>

              {cliente && (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {cliente.documento && <span>{cliente.documento}</span>}
                  {cliente.whatsapp && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {cliente.whatsapp}
                    </span>
                  )}
                  {(cliente.cidade || cliente.bairro) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[cliente.bairro, cliente.cidade].filter(Boolean).join(" / ")}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                {primeiroEm && <span>Primeiro orçamento: {formatDateOnly(primeiroEm)}</span>}
                {ultimoEm && <span>Último orçamento: {formatDateOnly(ultimoEm)}</span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:flex-nowrap">
              <Button size="sm" onClick={onNovoOrcamento} className="gap-1.5">
                <FilePlus2 className="h-4 w-4" />
                Novo orçamento
              </Button>
              <Button size="sm" variant="outline" onClick={onAgendarVisita} className="gap-1.5">
                <MapPin className="h-4 w-4" />
                Agendar visita
              </Button>
              {cliente && onEditarCliente && (
                <Button size="sm" variant="ghost" onClick={onEditarCliente} className="gap-1.5">
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isAvulso && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Cliente não cadastrado. Estamos agrupando orçamentos por nome. Para histórico completo (visitas, edição
            de cadastro), cadastre este cliente.
          </p>
        </div>
      )}
    </div>
  );
}
