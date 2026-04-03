import { useEffect } from "react";
import { toast } from "sonner";
import { useDraft } from "@/hooks/useDraft";
import { CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, LancamentoFinanceiro, TipoLancamento } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lancamento: LancamentoFinanceiro | null;
  onSave: (lancamento: LancamentoFinanceiro) => Promise<void>;
  isSaving: boolean;
  empresaId: string;
}

interface LancamentoDraft {
  tipo: TipoLancamento;
  descricao: string;
  valor: string;
  data: string;
  categoria: string;
  observacao: string;
}

const EMPTY_DRAFT: LancamentoDraft = {
  tipo: "despesa",
  descricao: "",
  valor: "",
  data: new Date().toISOString().slice(0, 10),
  categoria: "",
  observacao: "",
};

function draftFromLancamento(lancamento: LancamentoFinanceiro): LancamentoDraft {
  return {
    tipo: lancamento.tipo,
    descricao: lancamento.descricao,
    valor: String(lancamento.valor),
    data: lancamento.data,
    categoria: lancamento.categoria,
    observacao: lancamento.observacao,
  };
}

export function LancamentoFormModal({ open, onOpenChange, lancamento, onSave, isSaving, empresaId }: Props) {
  const isEdit = !!lancamento;
  const draftKey = lancamento ? `draft:lancamento-edit:${lancamento.id}` : "draft:lancamento-new";
  const initialDraft = lancamento ? draftFromLancamento(lancamento) : EMPTY_DRAFT;

  const [draft, setDraft, clearDraft, wasRestored] = useDraft<LancamentoDraft>(draftKey, initialDraft);

  useEffect(() => {
    if (open && wasRestored) {
      toast.info("Rascunho restaurado.", { duration: 2000 });
    }
  }, [open, wasRestored]);

  useEffect(() => {
    if (!open) return;

    if (lancamento) {
      const stored = sessionStorage.getItem(draftKey);
      if (!stored) {
        setDraft(draftFromLancamento(lancamento));
      }
    } else {
      const stored = sessionStorage.getItem("draft:lancamento-new");
      if (!stored) {
        setDraft({ ...EMPTY_DRAFT, data: new Date().toISOString().slice(0, 10) });
      }
    }
  }, [open, lancamento?.id, draftKey, lancamento, setDraft]);

  const { tipo, descricao, valor, data, categoria, observacao } = draft;

  const updateField = <K extends keyof LancamentoDraft>(field: K, value: LancamentoDraft[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const categorias = tipo === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  useEffect(() => {
    if (categoria && !(categorias as readonly string[]).includes(categoria)) {
      setDraft((prev) => ({ ...prev, categoria: "" }));
    }
  }, [categoria, categorias, setDraft]);

  const handleClose = () => {
    clearDraft();
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!descricao.trim()) {
      toast.error("Informe a descrição.");
      return;
    }

    const numericValue = parseFloat(valor);
    if (!numericValue || numericValue <= 0) {
      toast.error("Informe um valor positivo.");
      return;
    }

    if (!data) {
      toast.error("Informe a data.");
      return;
    }

    if (!categoria) {
      toast.error("Selecione a categoria.");
      return;
    }

    await onSave({
      id: lancamento?.id || crypto.randomUUID(),
      empresaId,
      tipo,
      descricao: descricao.trim(),
      valor: Math.abs(numericValue),
      data,
      categoria,
      observacao: observacao.trim(),
      origem: "manual",
    });

    clearDraft();
    onOpenChange(false);
    toast.success(isEdit ? "Lançamento atualizado." : "Lançamento criado.");
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/20 p-3">
            <p className="text-sm font-medium text-foreground">Registro manual do financeiro</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Escolha o tipo, informe o valor e categorize corretamente para manter a leitura financeira confiável.
            </p>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Tipo</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={tipo === "despesa" ? "default" : "outline"}
                className={
                  tipo === "despesa" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""
                }
                onClick={() => updateField("tipo", "despesa")}
              >
                Despesa
              </Button>
              <Button
                type="button"
                size="sm"
                variant={tipo === "receita" ? "default" : "outline"}
                className={tipo === "receita" ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
                onClick={() => updateField("tipo", "receita")}
              >
                Receita
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="lanc-descricao" className="text-xs text-muted-foreground">
              Descrição *
            </Label>
            <Input
              id="lanc-descricao"
              value={descricao}
              onChange={(event) => updateField("descricao", event.target.value)}
              placeholder="Ex: Compra de alumínio"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lanc-valor" className="text-xs text-muted-foreground">
                Valor (R$) *
              </Label>
              <Input
                id="lanc-valor"
                type="number"
                min="0.01"
                step="0.01"
                value={valor}
                onChange={(event) => updateField("valor", event.target.value)}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="lanc-data" className="text-xs text-muted-foreground">
                Data *
              </Label>
              <Input
                id="lanc-data"
                type="date"
                value={data}
                onChange={(event) => updateField("data", event.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Categoria *</Label>
            <Select value={categoria} onValueChange={(value) => updateField("categoria", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="lanc-obs" className="text-xs text-muted-foreground">
              Observação
            </Label>
            <Textarea
              id="lanc-obs"
              value={observacao}
              onChange={(event) => updateField("observacao", event.target.value)}
              placeholder="Opcional..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
