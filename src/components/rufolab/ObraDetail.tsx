// RufoLab — Detalhe da obra: lista de peças e abertura do editor.
import { useState } from "react";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";

import { useRufoLabPieces } from "@/hooks/useRufoLab";
import type { RufoLabPiece, RufoLabProject } from "@/lib/rufolab/types";

import { PecaCanvas } from "./PecaCanvas";
import { PecaEditor } from "./PecaEditor";
import { RufoLabPDFButton } from "./RufoLabPDFButton";

interface ObraDetailProps {
  project: RufoLabProject;
  onBack: () => void;
}

type View = { mode: "list" } | { mode: "create" } | { mode: "edit"; piece: RufoLabPiece };

function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function ObraDetail({ project, onBack }: ObraDetailProps) {
  const { pieces, isLoading, createPiece, updatePiece, deletePiece } = useRufoLabPieces(project.id);
  const [view, setView] = useState<View>({ mode: "list" });
  const [confirmDelete, setConfirmDelete] = useState<RufoLabPiece | null>(null);

  const isSaving = createPiece.isPending || updatePiece.isPending;

  if (view.mode !== "list") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-6">
        <PecaEditor
          projectId={project.id}
          initial={view.mode === "edit" ? view.piece : null}
          onCancel={() => setView({ mode: "list" })}
          isSaving={isSaving}
          onSubmit={async (input) => {
            try {
              if (view.mode === "edit") {
                await updatePiece.mutateAsync({ id: view.piece.id, input });
                toast.success("Peça atualizada.");
              } else {
                await createPiece.mutateAsync(input);
                toast.success("Peça criada.");
              }
              setView({ mode: "list" });
            } catch {
              // toast já é exibido pelo hook
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-2">
            <ArrowLeft className="h-4 w-4" />
            Obras
          </Button>
          <h2 className="truncate text-xl font-semibold text-foreground sm:text-2xl">
            {project.nome}
          </h2>
          {project.observacoes && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{project.observacoes}</p>
          )}
        </div>
        <Button onClick={() => setView({ mode: "create" })} className="self-start sm:self-end">
          <Plus className="h-4 w-4" />
          Nova peça
        </Button>
      </div>

      {/* Conteúdo */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : pieces.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <h3 className="text-base font-semibold text-foreground">Nenhuma peça nesta obra</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Crie a primeira peça para desenhar a seção e calcular desenvolvimento e área.
            </p>
            <Button onClick={() => setView({ mode: "create" })} className="mt-5">
              <Plus className="h-4 w-4" />
              Criar primeira peça
            </Button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pieces.map((piece) => (
              <li
                key={piece.id}
                className="group flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="p-3">
                  <PecaCanvas
                    segmentos={piece.segmentos}
                    height={160}
                    showCotas={false}
                    showAngulos={false}
                  />
                </div>
                <div className="flex items-start justify-between gap-3 border-t border-border px-4 py-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">{piece.nome}</h3>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {piece.tipoPeca === "conica" ? "Cônica" : "Reta"} · {piece.quantidade}x
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setView({ mode: "edit", piece })}
                      title="Editar peça"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setConfirmDelete(piece)}
                      title="Excluir peça"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-border px-4 py-3 text-xs">
                  <Kpi label="Desenv." value={`${formatNumber(piece.calcSnapshot.desenvolvimentoInicial, 0)} mm`} />
                  <Kpi label="Área" value={`${formatNumber(piece.calcSnapshot.area, 3)} m²`} />
                  <Kpi label="Dobras" value={String(piece.calcSnapshot.numeroDobras)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirmação de exclusão */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => (open ? null : setConfirmDelete(null))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta peça?</AlertDialogTitle>
            <AlertDialogDescription>
              A peça <strong>{confirmDelete?.nome}</strong> será removida desta obra. Não é possível desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePiece.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!confirmDelete) return;
                try {
                  await deletePiece.mutateAsync(confirmDelete.id);
                  toast.success("Peça removida.");
                  setConfirmDelete(null);
                } catch {
                  // toast já exibido
                }
              }}
              disabled={deletePiece.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePiece.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir peça
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
