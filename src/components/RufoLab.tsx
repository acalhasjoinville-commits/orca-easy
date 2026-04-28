// RufoLab — tela inicial: lista de obras (projetos) por empresa.
// Fase 4: criar/renomear/excluir obra. O editor de peças virá em fase posterior.
import { useMemo, useState } from "react";
import { FlaskConical, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { useRufoLabProjects } from "@/hooks/useRufoLab";
import type { RufoLabProject } from "@/lib/rufolab/types";
import { ObraDetail } from "./rufolab/ObraDetail";

interface ProjectDialogState {
  open: boolean;
  mode: "create" | "edit";
  target: RufoLabProject | null;
  nome: string;
  observacoes: string;
}

const EMPTY_DIALOG: ProjectDialogState = {
  open: false,
  mode: "create",
  target: null,
  nome: "",
  observacoes: "",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "-";
  }
}

export function RufoLab() {
  const { projects, isLoading, createProject, updateProject, deleteProject } = useRufoLabProjects();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<ProjectDialogState>(EMPTY_DIALOG);
  const [confirmDelete, setConfirmDelete] = useState<RufoLabProject | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter(
      (project) =>
        project.nome.toLowerCase().includes(term) || project.observacoes.toLowerCase().includes(term),
    );
  }, [projects, search]);

  if (activeProject) {
    return <ObraDetail project={activeProject} onBack={() => setActiveProjectId(null)} />;
  }

  const openCreate = () => {
    setDialog({ ...EMPTY_DIALOG, open: true, mode: "create" });
  };

  const openEdit = (project: RufoLabProject) => {
    setDialog({
      open: true,
      mode: "edit",
      target: project,
      nome: project.nome,
      observacoes: project.observacoes,
    });
  };

  const closeDialog = () => {
    if (createProject.isPending || updateProject.isPending) return;
    setDialog(EMPTY_DIALOG);
  };

  const submitDialog = async () => {
    const nome = dialog.nome.trim();
    if (!nome) {
      toast.error("Informe o nome da obra.");
      return;
    }

    try {
      if (dialog.mode === "create") {
        await createProject.mutateAsync({ nome, observacoes: dialog.observacoes });
        toast.success("Obra criada.");
      } else if (dialog.target) {
        await updateProject.mutateAsync({
          id: dialog.target.id,
          input: { nome, observacoes: dialog.observacoes },
        });
        toast.success("Obra atualizada.");
      }
      setDialog(EMPTY_DIALOG);
    } catch {
      // Toast já é exibido pelo hook em onError.
    }
  };

  const confirmDeleteProject = async () => {
    if (!confirmDelete) return;
    try {
      await deleteProject.mutateAsync(confirmDelete.id);
      toast.success("Obra removida.");
      setConfirmDelete(null);
    } catch {
      // Toast já é exibido pelo hook em onError.
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <FlaskConical className="h-3.5 w-3.5" />
            RufoLab
          </div>
          <h2 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">Obras técnicas</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Organize peças (rufos, calhas, pingadeiras) por obra. Cada obra agrupa várias peças, com cálculo
            de desenvolvimento, área e dobras.
          </p>
        </div>
        <Button onClick={openCreate} className="self-start sm:self-end">
          <Plus className="h-4 w-4" />
          Nova obra
        </Button>
      </div>

      {/* Busca */}
      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar obra por nome ou observação"
          className="border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      {/* Conteúdo */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <FlaskConical className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-base font-semibold text-foreground">
              {projects.length === 0 ? "Nenhuma obra cadastrada" : "Nenhuma obra encontrada"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {projects.length === 0
                ? "Crie sua primeira obra para começar a desenhar peças e calcular áreas."
                : "Tente ajustar a busca ou limpar o filtro."}
            </p>
            {projects.length === 0 && (
              <Button onClick={openCreate} className="mt-5">
                <Plus className="h-4 w-4" />
                Criar primeira obra
              </Button>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => (
              <li
                key={project.id}
                className="group flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">{project.nome}</h3>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                      Atualizada em {formatDate(project.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openEdit(project)}
                      title="Renomear obra"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setConfirmDelete(project)}
                      title="Excluir obra"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {project.observacoes ? (
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{project.observacoes}</p>
                ) : (
                  <p className="mt-3 text-sm italic text-muted-foreground/70">Sem observações.</p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <p className="text-[11px] text-muted-foreground">Peças e desenhos técnicos</p>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => setActiveProjectId(project.id)}
                  >
                    Abrir obra
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal criar/editar */}
      <Dialog open={dialog.open} onOpenChange={(open) => (open ? null : closeDialog())}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog.mode === "create" ? "Nova obra" : "Editar obra"}</DialogTitle>
            <DialogDescription>
              {dialog.mode === "create"
                ? "Cadastre uma obra para agrupar peças técnicas."
                : "Atualize o nome e observações desta obra."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rufolab-project-nome">Nome da obra *</Label>
              <Input
                id="rufolab-project-nome"
                value={dialog.nome}
                onChange={(event) => setDialog((prev) => ({ ...prev, nome: event.target.value }))}
                placeholder="Ex.: Edifício Vista Mar — Bloco A"
                autoFocus
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rufolab-project-obs">Observações</Label>
              <Textarea
                id="rufolab-project-obs"
                value={dialog.observacoes}
                onChange={(event) =>
                  setDialog((prev) => ({ ...prev, observacoes: event.target.value }))
                }
                placeholder="Notas técnicas, contato no canteiro, particularidades…"
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={closeDialog}
              disabled={createProject.isPending || updateProject.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={submitDialog}
              disabled={createProject.isPending || updateProject.isPending}
            >
              {(createProject.isPending || updateProject.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {dialog.mode === "create" ? "Criar obra" : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => (open ? null : setConfirmDelete(null))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta obra?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove a obra <strong>{confirmDelete?.nome}</strong> e todas as peças associadas.
              Não é possível desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProject.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              disabled={deleteProject.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProject.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir obra
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
