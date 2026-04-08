import { useMemo, useState } from "react";
import { HelpCircle, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFaqAdmin, useFaqMutations, type FaqItem } from "@/hooks/useFaq";

const emptyForm = { pergunta: "", resposta: "", categoria: "Geral", ordem: 0, ativo: true };

export function SuperAdminFaq() {
  const { data: faqs, isLoading } = useFaqAdmin();
  const { createFaq, updateFaq, deleteFaq } = useFaqMutations();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const normalize = (v: string) =>
    (v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtered = useMemo(() => {
    if (!faqs) return [];
    const q = normalize(search);
    if (!q) return faqs;
    return faqs.filter(
      (f) => normalize(f.pergunta).includes(q) || normalize(f.categoria).includes(q),
    );
  }, [faqs, search]);

  const stats = useMemo(() => {
    const all = faqs || [];
    return {
      total: all.length,
      ativas: all.filter((f) => f.ativo).length,
      inativas: all.filter((f) => !f.ativo).length,
      categorias: new Set(all.map((f) => f.categoria)).size,
    };
  }, [faqs]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (faq: FaqItem) => {
    setEditing(faq);
    setForm({
      pergunta: faq.pergunta,
      resposta: faq.resposta,
      categoria: faq.categoria,
      ordem: faq.ordem,
      ativo: faq.ativo,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.pergunta.trim() || !form.resposta.trim()) return;
    if (editing) {
      await updateFaq.mutateAsync({ id: editing.id, ...form });
    } else {
      await createFaq.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  const isSaving = createFaq.isPending || updateFaq.isPending;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">FAQ</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Gerencie as perguntas frequentes exibidas na Central de Ajuda do sistema.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova FAQ
        </Button>
      </div>

      {/* Context card */}
      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Conteúdo de ajuda</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                FAQs ativas aparecem na Central de Ajuda para todos os usuários autenticados. Itens inativos ficam ocultos até serem reativados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total" value={stats.total} helper="Perguntas cadastradas" />
        <MetricCard label="Ativas" value={stats.ativas} helper="Visíveis na Central de Ajuda" />
        <MetricCard label="Inativas" value={stats.inativas} helper="Ocultas dos usuários" />
        <MetricCard label="Categorias" value={stats.categorias} helper="Agrupamentos distintos" />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por pergunta ou categoria..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Perguntas frequentes</CardTitle>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              {filtered.length} exibidas
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pergunta</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((faq) => (
                <TableRow key={faq.id} className="cursor-pointer" onClick={() => openEdit(faq)}>
                  <TableCell className="max-w-xs truncate text-sm font-medium">{faq.pergunta}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{faq.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{faq.ordem}</TableCell>
                  <TableCell>
                    {faq.ativo ? (
                      <Badge className="text-xs">Ativa</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Inativa</Badge>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir FAQ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação é irreversível. A pergunta será removida permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteFaq.mutate(faq.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Nenhuma FAQ encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar FAQ" : "Nova FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pergunta</Label>
              <Input
                value={form.pergunta}
                onChange={(e) => setForm((f) => ({ ...f, pergunta: e.target.value }))}
                placeholder="Ex: Como criar um orçamento?"
              />
            </div>
            <div>
              <Label>Resposta</Label>
              <Textarea
                value={form.resposta}
                onChange={(e) => setForm((f) => ({ ...f, resposta: e.target.value }))}
                placeholder="Explique de forma clara..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <Input
                  value={form.categoria}
                  onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                  placeholder="Geral"
                />
              </div>
              <div>
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={form.ordem}
                  onChange={(e) => setForm((f) => ({ ...f, ordem: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.ativo}
                onCheckedChange={(v) => setForm((f) => ({ ...f, ativo: v }))}
              />
              <Label className="cursor-pointer">Ativa</Label>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Salvar alterações" : "Criar FAQ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
