import { useEffect, useMemo, useState } from "react";
import { HelpCircle, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useFaqAdmin, useFaqMutations, type FaqInput, type FaqItem } from "@/hooks/useFaq";
import { useDraft } from "@/hooks/useDraft";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const EMPTY_FORM: FaqInput = {
  pergunta: "",
  resposta: "",
  categoria: "Geral",
  ordem: 0,
  ativo: true,
};

function formFromFaq(item: FaqItem): FaqInput {
  return {
    pergunta: item.pergunta,
    resposta: item.resposta,
    categoria: item.categoria,
    ordem: item.ordem,
    ativo: item.ativo,
  };
}

function getDraftSuffix(prefix: string) {
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(prefix)) {
        return key.slice(prefix.length);
      }
    }
  } catch {
    // ignore localStorage failures
  }

  return null;
}

export function SuperAdminFaq() {
  const { data: faqs = [], isLoading } = useFaqAdmin();
  const { createFaq, updateFaq, deleteFaq } = useFaqMutations();
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null);
  const draftKey = editing ? `draft:faq-edit:${editing.id}` : "draft:faq-new";
  const [form, setForm, clearDraft, wasRestored] = useDraft<FaqInput>(
    draftKey,
    editing ? formFromFaq(editing) : EMPTY_FORM,
    400,
    "local",
  );

  const categorias = useMemo(() => {
    const values = Array.from(new Set(faqs.map((item) => item.categoria.trim()).filter(Boolean)));
    return ["Todas", ...values];
  }, [faqs]);

  const filtered = useMemo(() => {
    const query = normalize(search.trim());

    return faqs.filter((item) => {
      const matchCategory = categoria === "Todas" || item.categoria === categoria;
      const haystack = normalize(`${item.pergunta} ${item.resposta} ${item.categoria}`);
      const matchSearch = !query || haystack.includes(query);
      return matchCategory && matchSearch;
    });
  }, [faqs, search, categoria]);

  const stats = useMemo(() => {
    return {
      total: faqs.length,
      ativas: faqs.filter((item) => item.ativo).length,
      inativas: faqs.filter((item) => !item.ativo).length,
      categorias: new Set(faqs.map((item) => item.categoria)).size,
    };
  }, [faqs]);

  const handleOpenCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: FaqItem) => {
    setEditing(item);
    setForm(formFromFaq(item));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.pergunta.trim() || !form.resposta.trim()) {
      return;
    }

    if (editing) {
      await updateFaq.mutateAsync({ id: editing.id, input: form });
    } else {
      await createFaq.mutateAsync(form);
    }

    clearDraft();
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const isSaving = createFaq.isPending || updateFaq.isPending;

  useEffect(() => {
    if (!dialogOpen || !wasRestored) return;
    toast.info("Rascunho da FAQ restaurado.", { duration: 2000 });
  }, [dialogOpen, wasRestored]);

  useEffect(() => {
    if (dialogOpen) return;

    try {
      if (localStorage.getItem("draft:faq-new")) {
        setEditing(null);
        setDialogOpen(true);
        return;
      }
    } catch {
      return;
    }

    const draftId = getDraftSuffix("draft:faq-edit:");
    if (!draftId) return;

    const target = faqs.find((item) => item.id === draftId);
    if (!target) return;

    setEditing(target);
    setDialogOpen(true);
  }, [dialogOpen, faqs]);

  useEffect(() => {
    if (!dialogOpen) return;

    if (editing) {
      try {
        const stored = localStorage.getItem(draftKey);
        if (!stored) {
          setForm(formFromFaq(editing));
        }
      } catch {
        setForm(formFromFaq(editing));
      }
      return;
    }

    try {
      const stored = localStorage.getItem("draft:faq-new");
      if (!stored) {
        setForm(EMPTY_FORM);
      }
    } catch {
      setForm(EMPTY_FORM);
    }
  }, [dialogOpen, editing, draftKey, setForm]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">FAQ</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Gerencie as perguntas e respostas exibidas na central de ajuda do sistema sem depender de novo deploy.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              Nova FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar FAQ" : "Nova FAQ"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="faq-pergunta">Pergunta</Label>
                <Input
                  id="faq-pergunta"
                  value={form.pergunta}
                  onChange={(event) => setForm((current) => ({ ...current, pergunta: event.target.value }))}
                  placeholder="Ex: Como criar um novo orçamento?"
                />
              </div>

              <div>
                <Label htmlFor="faq-resposta">Resposta</Label>
                <Textarea
                  id="faq-resposta"
                  value={form.resposta}
                  onChange={(event) => setForm((current) => ({ ...current, resposta: event.target.value }))}
                  rows={6}
                  placeholder="Escreva uma resposta simples e objetiva..."
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="faq-categoria">Categoria</Label>
                  <Input
                    id="faq-categoria"
                    value={form.categoria}
                    onChange={(event) => setForm((current) => ({ ...current, categoria: event.target.value }))}
                    placeholder="Ex: Orçamentos"
                  />
                </div>
                <div>
                  <Label htmlFor="faq-ordem">Ordem</Label>
                  <Input
                    id="faq-ordem"
                    type="number"
                    min="0"
                    value={String(form.ordem)}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, ordem: Number(event.target.value || 0) }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">FAQ ativa</p>
                  <p className="text-xs text-muted-foreground">
                    Apenas FAQs ativas aparecem para os usuários na central de ajuda.
                  </p>
                </div>
                <Switch
                  checked={form.ativo}
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, ativo: checked }))}
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? "Salvando..." : editing ? "Salvar alterações" : "Criar FAQ"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Conteúdo da ajuda</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Use esta área para manter a ajuda sempre alinhada com os fluxos reais do sistema e com as dúvidas mais comuns da operação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="FAQs" value={stats.total} helper="Itens cadastrados" />
        <MetricCard label="Ativas" value={stats.ativas} helper="Visíveis no app" />
        <MetricCard label="Inativas" value={stats.inativas} helper="Ocultas para usuários" />
        <MetricCard label="Categorias" value={stats.categorias} helper="Temas organizados" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por pergunta, resposta ou categoria..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categorias.map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={categoria === item ? "default" : "outline"}
                  onClick={() => setCategoria(item)}
                  className="h-9 rounded-full px-3 text-xs"
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.ativo ? "default" : "secondary"} className="text-[10px] uppercase tracking-wide">
                      {item.ativo ? "Ativa" : "Inativa"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                      {item.categoria}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">Ordem {item.ordem}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.pergunta}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {item.resposta}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleOpenEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/25" />
              <p className="text-sm font-medium text-foreground">Nenhuma FAQ encontrada</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajuste os filtros ou crie um novo item para começar a montar a central de ajuda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove a pergunta e a resposta definitivamente da central de ajuda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteFaq.mutate(deleteTarget.id)}
              disabled={deleteFaq.isPending}
            >
              {deleteFaq.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        <p className="mt-3 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
