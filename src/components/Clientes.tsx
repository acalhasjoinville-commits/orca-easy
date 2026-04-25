import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientes } from "@/hooks/useSupabaseData";
import { Cliente } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, Loader2, Phone, MapPin, MoreVertical, Pencil, Trash2, History } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ClienteFormModal } from "./ClienteFormModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { getClienteHistoricoPath } from "@/lib/appShellRoutes";

const getDocumentoLabel = (cliente: Cliente) => {
  const documento = cliente.documento?.trim();
  return documento ? documento : "Não informado";
};

interface ClientesProps {
  openNewRequest?: number;
}

export function Clientes({ openNewRequest = 0 }: ClientesProps) {
  const { clientes, isLoading, addCliente, updateCliente, deleteCliente } = useClientes();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleOpenHistorico = (c: Cliente) => navigate(getClienteHistoricoPath(c.id));

  const normalizedSearch = search.toLowerCase().trim();
  const clientesSemDocumento = clientes.filter((c) => !c.documento?.trim()).length;

  const filtered = clientes.filter((c) => {
    if (!normalizedSearch) return true;

    return (
      c.nomeRazaoSocial.toLowerCase().includes(normalizedSearch) ||
      c.documento.toLowerCase().includes(normalizedSearch) ||
      c.whatsapp.toLowerCase().includes(normalizedSearch) ||
      c.cidade.toLowerCase().includes(normalizedSearch)
    );
  });

  const handleSave = async (c: Cliente) => {
    try {
      if (editing) {
        await updateCliente.mutateAsync(c);
        toast.success("Cliente atualizado!", { duration: 2500 });
      } else {
        await addCliente.mutateAsync(c);
        toast.success("Cliente cadastrado!", { duration: 2500 });
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Erro ao salvar cliente.", { duration: 5000 });
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;

    setDeletingId(id);
    try {
      await deleteCliente.mutateAsync(id);
      toast.success("Cliente removido.", { duration: 2500 });
    } catch {
      toast.error("Erro ao remover cliente.", { duration: 5000 });
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const handleEdit = (c: Cliente) => {
    setEditing(c);
    setModalOpen(true);
  };

  useEffect(() => {
    if (openNewRequest <= 0) return;
    setEditing(null);
    setModalOpen(true);
  }, [openNewRequest]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {clientes.length > 0
              ? `${clientes.length} cliente${clientes.length !== 1 ? "s" : ""} cadastrado${clientes.length !== 1 ? "s" : ""}${clientesSemDocumento > 0 ? ` • ${clientesSemDocumento} sem documento` : ""}`
              : "Gerencie sua base de clientes"}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          size="sm"
          className="hidden sm:flex gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card className="mb-4 border-dashed bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Base de clientes da operação</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Consulte contatos, documentos e cidade com mais rapidez antes de abrir novos orçamentos.
              </p>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, documento, WhatsApp ou cidade..."
                  className="h-9 bg-background pl-9"
                />
              </div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Clientes sem CPF/CNPJ continuam disponíveis para orçamento e aparecem como "Não informado".
          </p>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            {clientes.length === 0 ? "Nenhum cliente cadastrado" : "Nenhum resultado"}
          </h2>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            {clientes.length === 0 ? "Cadastre seu primeiro cliente para começar." : "Tente outra busca."}
          </p>
          {clientes.length === 0 && (
            <Button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          )}
        </div>
      ) : !isMobile ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground uppercase tracking-wide">
                  <th className="py-2.5 px-3 font-semibold w-12">Tipo</th>
                  <th className="py-2.5 px-3 font-semibold">Nome / Razao Social</th>
                  <th className="py-2.5 px-3 font-semibold w-36">Documento</th>
                  <th className="py-2.5 px-3 font-semibold w-36">WhatsApp</th>
                  <th className="py-2.5 px-3 font-semibold w-32">Cidade</th>
                  <th className="py-2.5 px-3 font-semibold w-10 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                          c.tipo === "PJ" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary",
                        )}
                      >
                        {c.tipo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium truncate max-w-[250px]">{c.nomeRazaoSocial}</td>
                    <td
                      className={cn(
                        "py-2.5 px-3 text-xs",
                        c.documento?.trim() ? "text-muted-foreground" : "text-muted-foreground/70 italic",
                      )}
                    >
                      {getDocumentoLabel(c)}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{c.whatsapp || "—"}</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{c.cidade || "—"}</td>
                    <td className="py-2.5 px-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[120px]">
                          <DropdownMenuItem onClick={() => handleEdit(c)} className="text-xs gap-2">
                            <Pencil className="h-3.5 w-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(c)}
                            className="text-xs gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className={cn(
                "overflow-hidden border-l-4",
                c.tipo === "PJ" ? "border-l-accent/60" : "border-l-primary/40",
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                          c.tipo === "PJ" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary",
                        )}
                      >
                        {c.tipo}
                      </span>
                      <p className="text-sm font-medium truncate">{c.nomeRazaoSocial}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span className={!c.documento?.trim() ? "italic text-muted-foreground/70" : undefined}>
                        {getDocumentoLabel(c)}
                      </span>
                      {c.whatsapp && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {c.whatsapp}
                        </span>
                      )}
                      {c.cidade && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {c.cidade}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ml-2">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[120px]">
                      <DropdownMenuItem onClick={() => handleEdit(c)} className="text-xs gap-2">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(c)}
                        className="text-xs gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover o cliente <strong>{deleteTarget?.nomeRazaoSocial}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <button
        onClick={() => {
          setEditing(null);
          setModalOpen(true);
        }}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors sm:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      <ClienteFormModal
        key={editing?.id ?? "new"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        editing={editing}
      />
    </div>
  );
}
