import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useMotor1, useMotor2, useInsumos, useRegras, useServicos } from "@/hooks/useSupabaseTechnicalData";
import { useClientes, useOrcamentos, usePoliticas, useEmpresa } from "@/hooks/useSupabaseData";
import { ItemServico, Orcamento, Dificuldade, StatusOrcamento, MotorType, Cliente } from "@/lib/types";
import { useDraft } from "@/hooks/useDraft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Check,
  Trash2,
  ShoppingCart,
  Pencil,
  Save,
  Search,
  Users,
  FileText,
  Loader2,
  Factory,
  Truck,
  CreditCard,
  Shield,
  CalendarDays,
  UserPlus,
  RotateCcw,
  Copy,
  HelpCircle,
  Package,
} from "lucide-react";

import { toast } from "sonner";
import { AddServicoModal } from "./AddServicoModal";
import { ClienteFormModal } from "./ClienteFormModal";
import { PDFDownloadButton } from "./PDFDownloadButton";
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
import { cn } from "@/lib/utils";

interface Props {
  onDone: () => void;
  editingOrcamento?: Orcamento | null;
}

const statusOptions: { value: StatusOrcamento; label: string; color: string }[] = [
  { value: "pendente", label: "Pendente", color: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30" },
  { value: "aprovado", label: "Aprovado", color: "bg-green-500/20 text-green-700 border-green-500/30" },
  { value: "rejeitado", label: "Rejeitado", color: "bg-red-500/20 text-red-700 border-red-500/30" },
  { value: "executado", label: "Executado", color: "bg-blue-500/20 text-blue-700 border-blue-500/30" },
];

const FALLBACK_TERMO =
  "CONCLUÍDO: Declaro que, nesta data, os serviços acima descritos foram conferidos, executados e entregues em perfeitas condições.";

const steps = [
  { key: "cliente", label: "Cliente", description: "Quem é o cliente?" },
  { key: "motor", label: "Tipo", description: "Como calcular?" },
  { key: "carrinho", label: "Orçamento", description: "Monte o orçamento" },
];

function StepIndicator({ current }: { current: "cliente" | "motor" | "carrinho" }) {
  const currentIdx = steps.findIndex((s) => s.key === current);
  const currentStep = steps[currentIdx];
  return (
    <div className="mb-8">
      {/* Current step context */}
      <div className="text-center mb-5">
        <p className="text-xs font-medium text-primary">
          Passo {currentIdx + 1} de {steps.length}
        </p>
        <h2 className="text-base font-bold text-foreground mt-1">{currentStep.description}</h2>
      </div>
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, idx) => {
          const isActive = idx === currentIdx;
          const isDone = idx < currentIdx;
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center min-w-[72px]">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20"
                      : isDone
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={cn(
                    "text-[11px] mt-1.5 font-medium",
                    isActive ? "text-foreground" : isDone ? "text-primary/70" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-[2px] w-10 sm:w-14 mx-1 mt-[-16px] transition-all rounded-full",
                    idx < currentIdx ? "bg-primary/40" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OrcamentoWizard({ onDone, editingOrcamento }: Props) {
  const isEditing = !!editingOrcamento;

  const draftKey = isEditing ? `draft:orcamento-edit:${editingOrcamento!.id}` : "draft:orcamento-new";

  interface WizardDraft {
    phase: "cliente" | "motor" | "carrinho";
    selectedClienteId: string;
    motorType: MotorType;
    itens: ItemServico[];
    status: StatusOrcamento;
    desconto: string;
    validade: string;
    descricaoGeral: string;
    formasPagamento: string;
    garantia: string;
    tempoGarantia: string;
    loadedPoliticaId: string | null;
    politicaNomeSnapshot: string | null;
    termoRecebimentoOs: string;
  }

  const defaultDraft = useMemo<WizardDraft>(
    () => ({
      phase: isEditing ? "carrinho" : "cliente",
      selectedClienteId: editingOrcamento?.clienteId ?? "",
      motorType: editingOrcamento?.motorType ?? "motor1",
      itens: editingOrcamento?.itensServico ?? [],
      status: editingOrcamento?.status ?? "pendente",
      desconto: String(editingOrcamento?.desconto ?? 0),
      validade: editingOrcamento?.validade ?? "",
      descricaoGeral: editingOrcamento?.descricaoGeral ?? "",
      formasPagamento: editingOrcamento?.formasPagamento ?? "",
      garantia: editingOrcamento?.garantia ?? "",
      tempoGarantia: editingOrcamento?.tempoGarantia ?? "",
      loadedPoliticaId: editingOrcamento?.politicaComercialId ?? null,
      politicaNomeSnapshot: editingOrcamento?.politicaNomeSnapshot ?? null,
      termoRecebimentoOs: editingOrcamento?.termoRecebimentoOsSnapshot || FALLBACK_TERMO,
    }),
    [editingOrcamento, isEditing],
  );

  const [draft, setDraft, clearDraft, wasRestored] = useDraft<WizardDraft>(
    draftKey,
    defaultDraft,
    400,
    "session",
    !isEditing,
  );

  useEffect(() => {
    if (!isEditing && wasRestored) {
      toast.info("Rascunho restaurado.", { duration: 2500 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, wasRestored]);

  useEffect(() => {
    if (isEditing) {
      clearDraft();
    }
  }, [isEditing, clearDraft]);

  const phase = draft.phase;
  const selectedClienteId = draft.selectedClienteId;
  const motorType = draft.motorType;
  const itens = draft.itens;
  const status = draft.status;
  const desconto = draft.desconto;
  const validade = draft.validade;
  const descricaoGeral = draft.descricaoGeral;
  const formasPagamento = draft.formasPagamento;
  const garantia = draft.garantia;
  const tempoGarantia = draft.tempoGarantia;
  const loadedPoliticaId = draft.loadedPoliticaId;
  const politicaNomeSnapshot = draft.politicaNomeSnapshot;
  const termoRecebimentoOs = draft.termoRecebimentoOs;

  const updateDraft = useCallback(
    (partial: Partial<WizardDraft>) => {
      setDraft((prev) => ({ ...prev, ...partial }));
    },
    [setDraft],
  );

  const hasDraft =
    wasRestored ||
    (!isEditing &&
      (draft.selectedClienteId !== "" ||
        draft.itens.length > 0 ||
        draft.descricaoGeral !== "" ||
        draft.desconto !== "0"));

  const [discardOpen, setDiscardOpen] = useState(false);

  const handleDiscardDraft = useCallback(() => {
    clearDraft();
    setDraft(defaultDraft);
    setDiscardOpen(false);
    toast.info("Rascunho descartado.", { duration: 2500 });
  }, [clearDraft, setDraft, defaultDraft]);

  const [modalOpen, setModalOpen] = useState(false);
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [editingModalItem, setEditingModalItem] = useState<ItemServico | null>(null);
  const [clienteSearch, setClienteSearch] = useState("");
  const phaseTopRef = useRef<HTMLDivElement | null>(null);

  const { clientes, isLoading: loadingClientes, addCliente } = useClientes();
  const { politicas } = usePoliticas();
  const { getNextNumero, addOrcamento, updateOrcamento } = useOrcamentos();
  const { empresa } = useEmpresa();
  const { servicos: servicosList } = useServicos();
  const { regras: regrasList } = useRegras();
  const { motor1: motor1List } = useMotor1();
  const { motor2: motor2List } = useMotor2();
  const { insumos: insumosList } = useInsumos();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0 });
      const mainContainer = phaseTopRef.current?.closest("main");
      if (mainContainer instanceof HTMLElement) {
        mainContainer.scrollTo({ top: 0, left: 0 });
      }
      phaseTopRef.current?.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [phase]);

  const selectedCliente = clientes.find((c) => c.id === selectedClienteId);

  const filteredClientes = clientes.filter(
    (c) => c.nomeRazaoSocial.toLowerCase().includes(clienteSearch.toLowerCase()) || c.documento.includes(clienteSearch),
  );

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const totalCusto = itens.reduce((s, i) => s + i.custoTotalObra, 0);
  const totalVenda = itens.reduce((s, i) => s + i.valorVenda, 0);
  const descontoNum = parseFloat(desconto) || 0;
  const valorFinal = Math.max(totalVenda - descontoNum, 0);
  const hasItems = itens.length > 0;
  const margemPercentual = valorFinal > 0 ? ((valorFinal - totalCusto) / valorFinal) * 100 : null;
  const servicoTemplateMap = useMemo(
    () => new Map<string, (typeof servicosList)[number]>(servicosList.map((servico) => [servico.id, servico] as const)),
    [servicosList],
  );
  const regraMap = useMemo(
    () => new Map<string, string>(regrasList.map((regra) => [regra.id, regra.nomeRegra] as const)),
    [regrasList],
  );
  const itensComAjusteManual = itens.filter(
    (item) => item.insumosOverrides && Object.keys(item.insumosOverrides).length > 0,
  ).length;
  const clienteAtualNome =
    selectedCliente?.nomeRazaoSocial ?? editingOrcamento?.nomeCliente ?? "Cliente não selecionado";
  const clienteAtualResumo = selectedCliente
    ? [selectedCliente.documento || null, selectedCliente.whatsapp || null].filter(Boolean).join(" · ")
    : "Confira os dados do cliente antes de salvar.";
  const politicaAplicadaNome = loadedPoliticaId
    ? (politicas.find((politica) => politica.id === loadedPoliticaId)?.nomePolitica ?? politicaNomeSnapshot)
    : politicaNomeSnapshot;

  const getRegraName = (item: ItemServico): string | null => {
    const servico = servicoTemplateMap.get(item.servicoTemplateId);
    return servico ? (regraMap.get(servico.regraId) ?? null) : null;
  };

  const getMaterialResumo = (item: ItemServico) => {
    if (item.tipoServico === 'avulso') {
      if (item.modoCobranca === 'valor_fechado') return 'Valor fechado';
      if (item.modoCobranca === 'por_unidade') return `${item.quantidade ?? 0} ${item.unidadeCobranca || 'un'} × ${fmt(item.valorUnitario ?? 0)}`;
      return `${item.metragem}m × ${fmt(item.valorUnitario ?? 0)}/m`;
    }
    return `${item.materialId} · ${item.espessura}mm · ${item.corte}mm`;
  };

  const getAjustesCount = (item: ItemServico) =>
    item.insumosOverrides ? Object.keys(item.insumosOverrides).length : 0;

  const hasAnyCustoIncompleto = itens.some(i => i.custoIncompleto === true);

  const handleBackFromCart = () => {
    if (isEditing) {
      onDone();
      return;
    }
    if (hasItems) {
      toast.error("Motor travado após adicionar item. Remova os itens para alterar o motor.", { duration: 5000 });
      return;
    }
    updateDraft({ phase: "motor" });
  };

  const handleMotorSelect = (nextMotor: MotorType) => {
    if (hasItems && nextMotor !== motorType) {
      toast.error("Motor travado após adicionar item.", { duration: 5000 });
      return;
    }
    updateDraft({ motorType: nextMotor });
  };

  const handleAddItem = (item: ItemServico) => {
    updateDraft({ itens: [...itens, item] });
    setModalOpen(false);
    setEditingModalItem(null);
    toast.success("Serviço adicionado!");
  };

  const handleRemoveItem = (id: string) => {
    updateDraft({ itens: itens.filter((i) => i.id !== id) });
  };

  const startEditItem = (item: ItemServico) => {
    setEditingModalItem(item);
    setModalOpen(true);
  };

  const handleSaveEditedItem = (item: ItemServico) => {
    updateDraft({ itens: itens.map((i) => (i.id === item.id ? item : i)) });
    setModalOpen(false);
    setEditingModalItem(null);
    toast.success("Item atualizado!");
  };

  const TEMPO_GARANTIA_OPTIONS = ["3 meses", "6 meses", "1 ano", "2 anos", "3 anos", "5 anos"];

  const loadPolitica = (politicaId: string) => {
    const pol = politicas.find((p) => p.id === politicaId);
    if (!pol) return;
    updateDraft({
      loadedPoliticaId: pol.id,
      politicaNomeSnapshot: pol.nomePolitica,
      validade: `${pol.validadeDias} dias`,
      formasPagamento: pol.formasPagamento,
      garantia: pol.garantia,
      tempoGarantia: pol.tempoGarantia || "",
      termoRecebimentoOs: pol.termoRecebimentoOs || FALLBACK_TERMO,
    });
    toast(`Política "${pol.nomePolitica}" aplicada`, { duration: 2000 });
  };

  const handleNovoCliente = async (cliente: Cliente) => {
    try {
      const saved = await addCliente.mutateAsync(cliente);
      updateDraft({ selectedClienteId: saved.id });
      setClienteModalOpen(false);
      toast.success("Cliente cadastrado e selecionado!", { duration: 2500 });
    } catch {
      // Modal stays open on error; toast handled by mutation
    }
  };

  const dificuldadeLabel: Record<Dificuldade, string> = {
    facil: "Fácil",
    medio: "Médio",
    dificil: "Difícil",
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    if (itens.length === 0 || !selectedCliente) return;
    setIsSaving(true);
    const base = {
      clienteId: selectedCliente.id,
      nomeCliente: selectedCliente.nomeRazaoSocial,
      motorType,
      itensServico: itens,
      custoTotalObra: totalCusto,
      valorVenda: totalVenda,
      desconto: descontoNum,
      valorFinal,
      status,
      validade,
      descricaoGeral,
      formasPagamento,
      garantia,
      tempoGarantia,
      politicaComercialId: loadedPoliticaId ?? null,
      politicaNomeSnapshot: politicaNomeSnapshot ?? null,
      validadeSnapshot: validade,
      formasPagamentoSnapshot: formasPagamento,
      garantiaSnapshot: garantia,
      tempoGarantiaSnapshot: tempoGarantia,
      termoRecebimentoOsSnapshot: termoRecebimentoOs,
      dataPrevista: status === "pendente" ? null : (editingOrcamento?.dataPrevista ?? null),
    };
    try {
      if (isEditing && editingOrcamento) {
        await updateOrcamento.mutateAsync({ ...editingOrcamento, ...base });
        toast.success("Orçamento atualizado!", { duration: 2500 });
      } else {
        const nextNum = await getNextNumero();
        const orcamento: Orcamento = {
          id: crypto.randomUUID(),
          numeroOrcamento: nextNum,
          dataCriacao: new Date().toISOString(),
          ...base,
        };
        await addOrcamento.mutateAsync(orcamento);
        toast.success("Orçamento salvo com sucesso!", { duration: 2500 });
      }
      clearDraft();
      onDone();
    } catch {
      toast.error("Erro ao salvar orçamento.", { duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Phase 1: Client selection ─────────────────────────────────
  if (phase === "cliente") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-4 sm:px-5">
        <div ref={phaseTopRef} />
        <StepIndicator current="cliente" />

        {/* Welcome card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground">Escolha o cliente para começar</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Selecione o cliente que receberá este orçamento. Você pode buscar pelo nome ou documento.
                </p>
              </div>
              {hasDraft && !isEditing && (
                <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive h-8 gap-1.5 text-xs shrink-0 ml-2"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Descartar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Descartar rascunho?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Todo o progresso será perdido e você começará um orçamento do zero.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDiscardDraft}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Descartar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            {wasRestored && !isEditing && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-primary/70 bg-primary/10 rounded-md px-2.5 py-1.5 w-fit">
                <RotateCcw className="h-3 w-3" /> Rascunho em andamento — continuando de onde parou
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Search + New Client */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou documento..."
                value={clienteSearch}
                onChange={(e) => setClienteSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <Button
              variant="outline"
              className="h-10 w-full gap-1.5 border-primary/30 text-primary hover:bg-primary/10 sm:w-auto sm:shrink-0"
              onClick={() => setClienteModalOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              <span className="text-sm">Novo Cliente</span>
            </Button>
          </div>

          {/* Client list */}
          {loadingClientes ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {filteredClientes.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Users className="mb-3 h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {clientes.length === 0 ? "Nenhum cliente cadastrado ainda" : "Nenhum cliente encontrado"}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {clientes.length === 0
                        ? "Cadastre seu primeiro cliente para criar orçamentos"
                        : "Tente buscar com outro termo ou cadastre um novo"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => setClienteModalOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-1.5" /> Cadastrar novo cliente
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredClientes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateDraft({ selectedClienteId: c.id })}
                    className={cn(
                      "w-full text-left rounded-lg border p-3.5 transition-all",
                      selectedClienteId === c.id
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30 hover:bg-muted/30",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shrink-0",
                          selectedClienteId === c.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {c.nomeRazaoSocial.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{c.nomeRazaoSocial}</p>
                          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground shrink-0">
                            {c.tipo}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {c.documento} · {c.whatsapp}
                        </p>
                      </div>
                      {selectedClienteId === c.id && <Check className="h-5 w-5 text-primary shrink-0" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={() => updateDraft({ phase: "motor" })}
            disabled={!selectedClienteId}
            className="w-full h-12 text-base font-semibold gap-2"
          >
            Continuar para tipo de orçamento
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <ClienteFormModal
          open={clienteModalOpen}
          onClose={() => setClienteModalOpen(false)}
          onSave={handleNovoCliente}
        />
      </div>
    );
  }

  // ─── Phase 2: Motor selection ──────────────────────────────────
  if (phase === "motor") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-4 sm:px-5">
        <div ref={phaseTopRef} />
        <StepIndicator current="motor" />

        <div className="mb-6">
          <button
            onClick={() => (hasItems ? updateDraft({ phase: "carrinho" }) : updateDraft({ phase: "cliente" }))}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <h1 className="text-lg font-bold text-foreground">Como este orçamento será calculado?</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Escolha o método de cálculo de acordo com o tipo de serviço que será prestado.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {hasItems && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
              <HelpCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                Motor travado: remova todos os itens do carrinho para alterar o tipo de cálculo.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Motor 1 */}
            <button
              onClick={() => handleMotorSelect("motor1")}
              disabled={hasItems}
              className={cn(
                "flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-70",
                motorType === "motor1"
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30",
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  motorType === "motor1" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                <Factory className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-bold block text-foreground">Motor 1 — Fabricação</span>
                <span className="text-xs text-muted-foreground mt-1 block leading-relaxed">
                  Para peças fabricadas na empresa. O cálculo considera peso do material, densidade e preço por quilo.
                </span>
              </div>
              {motorType === "motor1" && (
                <div className="flex items-center gap-1 text-xs font-medium text-primary">
                  <Check className="h-3.5 w-3.5" /> Selecionado
                </div>
              )}
            </button>

            {/* Motor 2 */}
            <button
              onClick={() => handleMotorSelect("motor2")}
              disabled={hasItems}
              className={cn(
                "flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-70",
                motorType === "motor2"
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30",
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  motorType === "motor2" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-bold block text-foreground">Motor 2 — Compra Dobrada</span>
                <span className="text-xs text-muted-foreground mt-1 block leading-relaxed">
                  Para peças compradas já dobradas. O cálculo usa preço por metro linear com base em material, espessura
                  e corte.
                </span>
              </div>
              {motorType === "motor2" && (
                <div className="flex items-center gap-1 text-xs font-medium text-primary">
                  <Check className="h-3.5 w-3.5" /> Selecionado
                </div>
              )}
            </button>
          </div>

          <Button
            onClick={() => updateDraft({ phase: "carrinho" })}
            className="w-full h-12 text-base font-semibold gap-2"
          >
            Continuar para montagem do orçamento
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── Phase 3: Cart ─────────────────────────────────────────────
  const currentStatus = statusOptions.find((s) => s.value === status)!;
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-4 sm:px-5">
      <div ref={phaseTopRef} />
      {!isEditing && <StepIndicator current="carrinho" />}

      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleBackFromCart}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {isEditing ? "Voltar para lista" : "Voltar"}
          </button>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
            {hasDraft && !isEditing && (
              <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive h-8 gap-1.5 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Descartar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Descartar rascunho?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Todo o progresso será perdido e você começará um orçamento do zero.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDiscardDraft}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Descartar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Select value={status} onValueChange={(v) => updateDraft({ status: v as StatusOrcamento })}>
              <SelectTrigger
                className={cn("h-8 w-full text-xs font-semibold border rounded-md sm:w-auto", currentStatus.color)}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-foreground">
                  {isEditing
                    ? `Editando Orçamento #${editingOrcamento?.numeroOrcamento}`
                    : "Revise e monte o orçamento"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Confira os serviços, ajuste as condições comerciais e salve quando tudo estiver pronto para enviar ao
                  cliente.
                </p>
              </div>
              <div className="rounded-xl border border-primary/15 bg-background/80 px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Status atual</p>
                <p className="text-sm font-semibold text-foreground mt-1">{currentStatus.label}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 mt-4">
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Cliente</p>
                <p className="text-sm font-semibold text-foreground mt-1 truncate">{clienteAtualNome}</p>
                <p className="text-xs text-muted-foreground mt-1">{clienteAtualResumo}</p>
              </div>
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Tipo de cálculo</p>
                <p className="text-sm font-semibold text-foreground mt-1 flex items-center gap-1.5">
                  {motorType === "motor1" ? (
                    <Factory className="h-4 w-4 text-primary" />
                  ) : (
                    <Truck className="h-4 w-4 text-primary" />
                  )}
                  {motorType === "motor1" ? "Fabricação" : "Compra Dobrada"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {motorType === "motor1"
                    ? "Usa peso, densidade e preço por quilo."
                    : "Usa material, espessura, corte e preço por metro."}
                </p>
              </div>
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Andamento</p>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {itens.length} {itens.length === 1 ? "serviço no orçamento" : "serviços no orçamento"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasItems
                    ? itensComAjusteManual > 0
                      ? `${itensComAjusteManual} ${itensComAjusteManual === 1 ? "item com ajuste manual" : "itens com ajustes manuais"}`
                      : "Tudo pronto para revisar valores e condições."
                    : "Comece adicionando os serviços que serão executados."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {wasRestored && !isEditing && (
                <div className="flex items-center gap-1.5 text-xs text-primary/80 bg-primary/10 rounded-md px-2.5 py-1.5">
                  <RotateCcw className="h-3 w-3" /> Rascunho em andamento
                </div>
              )}
              {politicaAplicadaNome && (
                <div className="flex items-center gap-1.5 text-xs text-foreground bg-background/80 rounded-md px-2.5 py-1.5 border">
                  <Shield className="h-3 w-3 text-primary" /> Política aplicada: {politicaAplicadaNome}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Services section ─────────────────────── */}
      <div className="mb-6">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Serviços do orçamento</h2>
              {hasItems && (
                <span className="bg-muted text-muted-foreground text-[10px] font-bold rounded-full px-2 py-0.5">
                  {itens.length}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Adicione os serviços que serão executados e revise os valores antes de salvar.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} size="sm" className="w-full gap-1.5 sm:w-auto">
            <Plus className="h-4 w-4" /> Adicionar serviço
          </Button>
        </div>

        {hasItems && (
          <div className="mb-3 rounded-xl border bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {itens.length} {itens.length === 1 ? "serviço adicionado" : "serviços adicionados"}.
            </span>{" "}
            {itensComAjusteManual > 0
              ? `${itensComAjusteManual} ${itensComAjusteManual === 1 ? "item tem ajuste manual de insumo" : "itens têm ajustes manuais de insumos"}.`
              : "Todos os insumos seguem a regra padrão no momento."}
          </div>
        )}

        {itens.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum serviço adicionado ainda</p>
              <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
                Adicione os serviços que farão parte deste orçamento clicando no botão acima.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {itens.map((item, idx) => (
              <Card key={item.id} className="overflow-hidden border-border/80 hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-bold text-primary mt-0.5 shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{item.nomeServico}</p>
                            {getAjustesCount(item) > 0 && (
                              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                Insumos ajustados
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{getMaterialResumo(item)}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.tipoServico !== 'avulso' && (
                              <span className="inline-flex items-center bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {item.metragem}m
                              </span>
                            )}
                            {(item.tipoServico !== 'avulso' || item.modoCobranca === 'por_metro') && (
                              <span className="inline-flex items-center bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {dificuldadeLabel[item.dificuldade]}
                              </span>
                            )}
                            {item.tipoServico === 'avulso' && (
                              <span className="inline-flex items-center bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                Avulso
                              </span>
                            )}
                            {item.custoIncompleto && (
                              <span className="inline-flex items-center bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                Custo incompleto
                              </span>
                            )}
                            <span className="inline-flex items-center bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {item.insumosCalculados.length}{" "}
                              {item.insumosCalculados.length === 1 ? "insumo" : "insumos"}
                            </span>
                          </div>
                          {getRegraName(item) && (
                            <p className="text-[11px] text-muted-foreground/70 mt-2">
                              Regra aplicada: {getRegraName(item)}
                            </p>
                          )}
                          {getAjustesCount(item) > 0 && (
                            <p className="text-[11px] text-primary/80 mt-1">
                              {getAjustesCount(item)}{" "}
                              {getAjustesCount(item) === 1
                                ? "insumo foi ajustado manualmente"
                                : "insumos foram ajustados manualmente"}{" "}
                              neste item.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex w-full flex-wrap items-center gap-1.5 shrink-0 sm:w-auto">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const cloned: ItemServico = { ...item, id: crypto.randomUUID() };
                            updateDraft({
                              itens: (() => {
                                const copy = [...itens];
                                copy.splice(idx + 1, 0, cloned);
                                return copy;
                              })(),
                            });
                            toast.success("Item duplicado!");
                          }}
                          className="h-8 gap-1.5 text-muted-foreground hover:text-primary"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Duplicar</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditItem(item)}
                          className="h-8 gap-1.5 text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-8 gap-1.5 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Remover</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      <div className="rounded-xl border bg-muted/20 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Custo interno
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-1 tabular-nums">
                          {fmt(item.custoTotalObra)}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Material + insumos calculados para este serviço.
                        </p>
                      </div>
                      <div className="rounded-xl border bg-muted/20 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Valor do serviço
                        </p>
                        <p className="text-sm font-semibold text-primary mt-1 tabular-nums">{fmt(item.valorVenda)}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Valor atual que entra no orçamento do cliente.
                        </p>
                      </div>
                      <div className="rounded-xl border bg-muted/20 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Resumo rápido
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-1">{fmt(item.custoMetroLinear)}/m</p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Fator {item.fatorDificuldade.toFixed(1)} · {item.metragem}m executados
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Financial summary ─────────────────────── */}
      {hasItems && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-4 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" /> Resumo Financeiro
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Este bloco ajuda a conferir custo interno, valor de venda, desconto e total final antes de salvar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Custo interno total
                </p>
                <p className="text-lg font-semibold text-foreground mt-1 tabular-nums">{fmt(totalCusto)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Referência interna com material e insumos.</p>
              </div>
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Valor bruto do orçamento
                </p>
                <p className="text-lg font-semibold text-foreground mt-1 tabular-nums">{fmt(totalVenda)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Soma dos serviços antes do desconto.</p>
              </div>
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Desconto aplicado
                </p>
                <p
                  className={cn(
                    "text-lg font-semibold mt-1 tabular-nums",
                    descontoNum > 0 ? "text-destructive" : "text-foreground",
                  )}
                >
                  {descontoNum > 0 ? `-${fmt(descontoNum)}` : "Sem desconto"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">Use para registrar negociação com o cliente.</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Valor final para o cliente
                </p>
                <p className="text-xl font-bold text-primary mt-1 tabular-nums">{fmt(valorFinal)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Esse é o valor principal mostrado no orçamento.
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-background/80 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Itens no orçamento</span>
                <span className="font-medium">{itens.length}</span>
              </div>
              {margemPercentual !== null ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Margem estimada</span>
                  <span
                    className={cn(
                      "font-semibold",
                      margemPercentual >= 30
                        ? "text-green-600"
                        : margemPercentual >= 15
                          ? "text-yellow-600"
                          : "text-destructive",
                    )}
                  >
                    {margemPercentual.toFixed(1)}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Margem estimada</span>
                  <span className="font-medium text-muted-foreground">Indisponível com valor final zerado</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Commercial conditions ─────────────────── */}
      {hasItems && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" /> Condições Comerciais
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Organize aqui o que será combinado com o cliente. Esses dados aparecem no PDF e ajudam a deixar o
                orçamento claro.
              </p>
            </div>

            {politicas.length > 0 && (
              <div className="rounded-xl border bg-muted/30 p-3">
                <Label className="text-xs font-medium">Aplicar política comercial padrão</Label>
                <p className="text-[11px] text-muted-foreground mb-2">
                  Preenche automaticamente validade, pagamento e garantia para acelerar o preenchimento.
                </p>
                <Select onValueChange={loadPolitica}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione uma política..." />
                  </SelectTrigger>
                  <SelectContent>
                    {politicas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nomePolitica}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {politicaAplicadaNome && (
                  <p className="text-[11px] text-primary mt-2">Política ativa: {politicaAplicadaNome}</p>
                )}
              </div>
            )}

            {loadedPoliticaId && (
              <div className="rounded-xl border bg-muted/20 p-3">
                <Label className="text-xs font-medium">Termo de Recebimento (OS)</Label>
                <p className="text-[11px] text-muted-foreground mb-1.5">
                  Este texto vai para o canhoto de entrega da Ordem de Serviço.
                </p>
                <Textarea
                  value={termoRecebimentoOs}
                  onChange={(e) => updateDraft({ termoRecebimentoOs: e.target.value })}
                  rows={3}
                  className="text-sm"
                  placeholder="Texto do canhoto de entrega da OS..."
                />
              </div>
            )}

            <div className="rounded-xl border bg-muted/20 p-3 space-y-3">
              <div>
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /> Prazo e negociação
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Defina até quando o orçamento vale e se existe algum desconto combinado.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Validade</Label>
                  <Input
                    value={validade}
                    onChange={(e) => updateDraft({ validade: e.target.value })}
                    placeholder="Ex: 15 dias"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Desconto (R$)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={desconto}
                    onChange={(e) => updateDraft({ desconto: e.target.value })}
                    placeholder="0,00"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20 p-3">
              <Label className="text-xs flex items-center gap-1.5 font-medium">
                <FileText className="h-3 w-3 text-muted-foreground" /> Escopo do serviço
              </Label>
              <p className="text-[11px] text-muted-foreground mb-1.5">
                Descreva de forma simples o que será executado para o cliente entender o combinado.
              </p>
              <Textarea
                value={descricaoGeral}
                onChange={(e) => updateDraft({ descricaoGeral: e.target.value })}
                placeholder="Ex: Instalação de calhas no beiral frontal e rufos na platibanda lateral..."
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="rounded-xl border bg-muted/20 p-3">
              <Label className="text-xs flex items-center gap-1.5 font-medium">
                <CreditCard className="h-3 w-3 text-muted-foreground" /> Formas de pagamento
              </Label>
              <p className="text-[11px] text-muted-foreground mb-1.5">
                Registre como o cliente pode pagar este orçamento.
              </p>
              <Textarea
                value={formasPagamento}
                onChange={(e) => updateDraft({ formasPagamento: e.target.value })}
                placeholder="Ex: 50% na aprovação, 50% na entrega..."
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="rounded-xl border bg-muted/20 p-3 space-y-3">
              <div>
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" /> Garantia
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Defina o prazo e detalhe rapidamente o que está coberto para evitar dúvidas depois.
                </p>
              </div>
              <div>
                <Label className="text-xs">Tempo de Garantia</Label>
                <Select value={tempoGarantia} onValueChange={(v) => updateDraft({ tempoGarantia: v })}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o prazo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPO_GARANTIA_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Detalhes e condições da garantia</Label>
                <Textarea
                  value={garantia}
                  onChange={(e) => updateDraft({ garantia: e.target.value })}
                  placeholder="Ex: A garantia cobre defeitos de fabricação e instalação..."
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Sticky footer ─────────────────────────── */}
      {hasItems && (
        <div className="sticky bottom-20 z-30 mt-6 rounded-2xl border bg-card/95 shadow-lg backdrop-blur-sm sm:bottom-4">
          <div className="px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {itens.length} {itens.length === 1 ? "serviço" : "serviços"} · {clienteAtualNome}
                </p>
                <p className="text-lg font-bold tabular-nums text-primary">{fmt(valorFinal)}</p>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                {isEditing && editingOrcamento && (
                  <PDFDownloadButton
                    orcamento={{
                      ...editingOrcamento,
                      itensServico: itens,
                      custoTotalObra: totalCusto,
                      valorVenda: totalVenda,
                      desconto: descontoNum,
                      valorFinal,
                      status,
                      validade,
                      descricaoGeral,
                      formasPagamento,
                      garantia,
                      tempoGarantia,
                    }}
                    cliente={selectedCliente}
                    empresa={empresa}
                    size="default"
                    className="h-11 w-full sm:w-auto"
                  />
                )}
                <Button onClick={handleSave} disabled={isSaving} className="h-11 w-full px-6 sm:w-auto">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> {isEditing ? "Salvar Alterações" : "Salvar Orçamento"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddServicoModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingModalItem(null);
        }}
        onSave={editingModalItem ? handleSaveEditedItem : handleAddItem}
        motorType={motorType}
        editingItem={editingModalItem}
      />
    </div>
  );
}
