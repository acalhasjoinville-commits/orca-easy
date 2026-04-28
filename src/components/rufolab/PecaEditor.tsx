// RufoLab — Editor de peça (criar/editar).
// Mantém estado local; recalcula snapshot a cada mudança via geometry.ts.
// Persistência fica a cargo do hook useRufoLabPieces no componente pai.
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookmarkPlus, FileDown, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useRufoLabTemplates } from "@/hooks/useRufoLab";
import { calcularSnapshot } from "@/lib/rufolab/geometry";
import type {
  RufoLabPiece,
  RufoLabPieceInput,
  RufoLabTemplate,
  Segmento,
  TipoPeca,
} from "@/lib/rufolab/types";

import { PecaCanvas } from "./PecaCanvas";

interface PecaEditorProps {
  projectId: string;
  initial?: RufoLabPiece | null;
  onCancel: () => void;
  onSubmit: (input: RufoLabPieceInput) => Promise<void>;
  isSaving?: boolean;
}

function novoSegmento(): Segmento {
  return {
    id: crypto.randomUUID(),
    tipo: "reto",
    medida: 100,
    anguloDeg: 90,
  };
}

function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function PecaEditor({ projectId, initial, onCancel, onSubmit, isSaving }: PecaEditorProps) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [tipoPeca, setTipoPeca] = useState<TipoPeca>(initial?.tipoPeca ?? "reta");
  const [comprimento, setComprimento] = useState<number>(initial?.comprimento ?? 1);
  const [quantidade, setQuantidade] = useState<number>(initial?.quantidade ?? 1);
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? "");
  const [segmentos, setSegmentos] = useState<Segmento[]>(
    initial?.segmentos && initial.segmentos.length > 0
      ? initial.segmentos
      : [novoSegmento(), { ...novoSegmento(), anguloDeg: 0 }],
  );

  // Recalcula snapshot a cada alteração relevante
  const snapshot = useMemo(
    () =>
      calcularSnapshot({
        tipoPeca,
        segmentos,
        comprimentoM: comprimento,
        quantidade,
      }),
    [tipoPeca, segmentos, comprimento, quantidade],
  );

  useEffect(() => {
    // sincroniza ao trocar a peça inicial (ex.: editar outra peça sem desmontar)
    if (!initial) return;
    setNome(initial.nome);
    setTipoPeca(initial.tipoPeca);
    setComprimento(initial.comprimento);
    setQuantidade(initial.quantidade);
    setObservacoes(initial.observacoes);
    setSegmentos(initial.segmentos.length > 0 ? initial.segmentos : [novoSegmento()]);
  }, [initial]);

  const updateSegmento = (id: string, patch: Partial<Segmento>) => {
    setSegmentos((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSegmento = (id: string) => {
    setSegmentos((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
  };

  const addSegmento = () => {
    setSegmentos((prev) => [...prev, novoSegmento()]);
  };

  const handleSubmit = async () => {
    if (!nome.trim()) return;
    await onSubmit({
      projectId,
      nome: nome.trim(),
      tipoPeca,
      comprimento: Number(comprimento) || 0,
      quantidade: Math.max(1, Math.floor(Number(quantidade) || 1)),
      observacoes,
      segmentos,
      calcSnapshot: snapshot,
    });
  };

  const podeSalvar = !!nome.trim() && segmentos.length > 0 && !isSaving;

  // ----- Templates -----
  const { templates, createTemplate } = useRufoLabTemplates();
  const [saveTplOpen, setSaveTplOpen] = useState(false);
  const [tplNome, setTplNome] = useState("");
  const [tplObs, setTplObs] = useState("");

  const aplicarTemplate = (templateId: string) => {
    const tpl: RufoLabTemplate | undefined = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    setTipoPeca(tpl.tipoPeca);
    setSegmentos(tpl.segmentos.map((s) => ({ ...s, id: crypto.randomUUID() })));
    toast.success(`Template "${tpl.nome}" aplicado.`);
  };

  const salvarComoTemplate = async () => {
    const n = tplNome.trim();
    if (!n) {
      toast.error("Informe um nome para o template.");
      return;
    }
    try {
      await createTemplate.mutateAsync({
        nome: n,
        tipoPeca,
        segmentos,
        observacoes: tplObs,
      });
      toast.success("Template salvo.");
      setSaveTplOpen(false);
      setTplNome("");
      setTplObs("");
    } catch {
      // toast exibido pelo hook
    }
  };

  return (
    <div className="space-y-5">
      {/* Topo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            {initial ? "Editar peça" : "Nova peça"}
          </h3>
        </div>
        <Button onClick={handleSubmit} disabled={!podeSalvar}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {initial ? "Salvar alterações" : "Criar peça"}
        </Button>
      </div>

      {/* Layout principal: canvas + dados */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Canvas */}
        <div className="space-y-3">
          <PecaCanvas segmentos={segmentos} height={320} />

          {/* KPIs do snapshot */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <KpiCard
              label="Desenvolvimento"
              value={`${formatNumber(snapshot.desenvolvimentoInicial, 0)} mm`}
            />
            <KpiCard label="Área total" value={`${formatNumber(snapshot.area, 3)} m²`} />
            <KpiCard label="Dobras" value={String(snapshot.numeroDobras)} />
            <KpiCard label="Segmentos" value={String(snapshot.numeroSegmentos)} />
          </div>
        </div>

        {/* Dados gerais */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="peca-nome">Nome da peça *</Label>
            <Input
              id="peca-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Rufo lateral fachada norte"
              maxLength={120}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="peca-tipo">Tipo</Label>
              <Select value={tipoPeca} onValueChange={(v) => setTipoPeca(v as TipoPeca)}>
                <SelectTrigger id="peca-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reta">Reta</SelectItem>
                  <SelectItem value="conica">Cônica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="peca-qtd">Quantidade</Label>
              <Input
                id="peca-qtd"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="peca-comp">Comprimento (m)</Label>
            <Input
              id="peca-comp"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={comprimento}
              onChange={(e) => setComprimento(Math.max(0, Number(e.target.value) || 0))}
            />
            <p className="text-[11px] text-muted-foreground">
              Comprimento longitudinal da peça. Multiplica o desenvolvimento para calcular a área.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="peca-obs">Observações</Label>
            <Textarea
              id="peca-obs"
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas técnicas, material previsto, etc."
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* Segmentos */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Segmentos da seção</h4>
            <p className="text-[11px] text-muted-foreground">
              Cada linha é uma faixa da chapa entre duas dobras. Medidas em milímetros.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addSegmento}>
            <Plus className="h-4 w-4" />
            Adicionar segmento
          </Button>
        </div>

        <div className="divide-y divide-border">
          {segmentos.map((s, idx) => {
            const isLast = idx === segmentos.length - 1;
            return (
              <div
                key={s.id}
                className="grid grid-cols-1 items-end gap-3 px-4 py-3 sm:grid-cols-[40px_1fr_1fr_1fr_40px]"
              >
                <div className="text-xs font-semibold text-muted-foreground">#{idx + 1}</div>

                <div className="space-y-1">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Tipo
                  </Label>
                  <Select
                    value={s.tipo}
                    onValueChange={(v) => updateSegmento(s.id, { tipo: v as Segmento["tipo"] })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reto">Reto</SelectItem>
                      <SelectItem value="diagonal">Diagonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Medida (mm)
                  </Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={s.medida}
                    onChange={(e) =>
                      updateSegmento(s.id, { medida: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Ângulo p/ próximo (°)
                  </Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step={1}
                    value={s.anguloDeg ?? 0}
                    onChange={(e) =>
                      updateSegmento(s.id, { anguloDeg: Number(e.target.value) || 0 })
                    }
                    disabled={isLast}
                    className="h-9"
                    title={isLast ? "O último segmento não tem dobra para o próximo." : undefined}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeSegmento(s.id)}
                  disabled={segmentos.length <= 1}
                  title="Remover segmento"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
