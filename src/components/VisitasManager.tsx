import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock, MapPin, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTeamMembers } from "@/hooks/useFollowUp";
import { useAddVisita, useUpdateVisita, useVisitas, type VisitaInput } from "@/hooks/useVisitas";
import { STATUS_VISITA_CONFIG, StatusVisita, Visita } from "@/lib/types";
import { addDaysLocal, formatDateLabel, getTodayLocal } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { VisitaDetailDialog } from "@/components/VisitaDetailDialog";

type FilterStatus = "todos" | StatusVisita;
type FormMode = "create" | "edit" | "reschedule";

export interface EditVisitaRequest {
  key: number;
  visita: Visita;
  mode: "edit" | "reschedule";
}

interface VisitasManagerProps {
  openNewRequest?: number;
  editRequest?: EditVisitaRequest | null;
}

interface VisitaFormData {
  nomeCliente: string;
  telefone: string;
  enderecoCompleto: string;
  bairro: string;
  cidade: string;
  complemento: string;
  pontoReferencia: string;
  tipoServico: string;
  observacoes: string;
  origemContato: string;
  responsavelId: string;
  responsavelNome: string;
  dataVisita: string;
  horaVisita: string;
}

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: "todos", label: "Todas" },
  { value: "agendada", label: "Agendadas" },
  { value: "reagendada", label: "Reagendadas" },
  { value: "realizada", label: "Realizadas" },
  { value: "cancelada", label: "Canceladas" },
];

const origemOptions = ["WhatsApp", "Telefone", "Indicação", "Redes sociais", "Site", "Presencial", "Outro"];

const emptyForm: VisitaFormData = {
  nomeCliente: "",
  telefone: "",
  enderecoCompleto: "",
  bairro: "",
  cidade: "",
  complemento: "",
  pontoReferencia: "",
  tipoServico: "",
  observacoes: "",
  origemContato: "",
  responsavelId: "",
  responsavelNome: "",
  dataVisita: "",
  horaVisita: "08:00",
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sortVisitasAsc(a: Visita, b: Visita) {
  const dateCompare = a.dataVisita.localeCompare(b.dataVisita);
  if (dateCompare !== 0) return dateCompare;
  return a.horaVisita.localeCompare(b.horaVisita);
}

function sortVisitasDesc(a: Visita, b: Visita) {
  const dateCompare = b.dataVisita.localeCompare(a.dataVisita);
  if (dateCompare !== 0) return dateCompare;
  return b.horaVisita.localeCompare(a.horaVisita);
}

function toFormData(visita: Visita): VisitaFormData {
  return {
    nomeCliente: visita.nomeCliente,
    telefone: visita.telefone,
    enderecoCompleto: visita.enderecoCompleto,
    bairro: visita.bairro,
    cidade: visita.cidade,
    complemento: visita.complemento,
    pontoReferencia: visita.pontoReferencia,
    tipoServico: visita.tipoServico,
    observacoes: visita.observacoes,
    origemContato: visita.origemContato,
    responsavelId: visita.responsavelId ?? "",
    responsavelNome: visita.responsavelNome,
    dataVisita: visita.dataVisita,
    horaVisita: visita.horaVisita.slice(0, 5),
  };
}

export function VisitasManager({ openNewRequest, editRequest }: VisitasManagerProps) {
  const { visitas, isLoading } = useVisitas();
  const addVisita = useAddVisita();
  const updateVisita = useUpdateVisita();
  const { data: teamMembers = [] } = useTeamMembers();

  const [filter, setFilter] = useState<FilterStatus>("todos");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null);
  const [detailVisita, setDetailVisita] = useState<Visita | null>(null);
  const [form, setForm] = useState<VisitaFormData>(emptyForm);

  const hoje = getTodayLocal();
  const amanha = addDaysLocal(1);

  useEffect(() => {
    if (!openNewRequest) return;

    setFormMode("create");
    setEditingVisita(null);
    setDetailVisita(null);
    setForm({ ...emptyForm, dataVisita: hoje });
    setFormOpen(true);
  }, [hoje, openNewRequest]);

  useEffect(() => {
    if (!editRequest) return;

    setFormMode(editRequest.mode);
    setEditingVisita(editRequest.visita);
    setDetailVisita(null);
    setForm(toFormData(editRequest.visita));
    setFormOpen(true);
  }, [editRequest]);

  const filtered = useMemo(() => {
    let list = visitas;

    if (filter !== "todos") {
      list = list.filter((visita) => visita.status === filter);
    }

    if (search.trim()) {
      const query = normalize(search);
      list = list.filter(
        (visita) =>
          normalize(visita.nomeCliente).includes(query) ||
          normalize(visita.telefone).includes(query) ||
          normalize(visita.enderecoCompleto).includes(query),
      );
    }

    return list;
  }, [filter, search, visitas]);

  const sections = useMemo(() => {
    const atrasadas: Visita[] = [];
    const hojeItems: Visita[] = [];
    const amanhaItems: Visita[] = [];
    const proximas: Visita[] = [];
    const historico: Visita[] = [];

    for (const visita of filtered) {
      if (visita.status === "realizada" || visita.status === "cancelada") {
        historico.push(visita);
        continue;
      }

      if (visita.dataVisita < hoje) {
        atrasadas.push(visita);
      } else if (visita.dataVisita === hoje) {
        hojeItems.push(visita);
      } else if (visita.dataVisita === amanha) {
        amanhaItems.push(visita);
      } else {
        proximas.push(visita);
      }
    }

    const result: { key: string; label: string; isOverdue: boolean; items: Visita[] }[] = [];

    if (atrasadas.length > 0)
      result.push({ key: "atrasadas", label: "Atrasadas", isOverdue: true, items: atrasadas.sort(sortVisitasAsc) });
    if (hojeItems.length > 0)
      result.push({ key: "hoje", label: "Hoje", isOverdue: false, items: hojeItems.sort(sortVisitasAsc) });
    if (amanhaItems.length > 0)
      result.push({ key: "amanha", label: "Amanhã", isOverdue: false, items: amanhaItems.sort(sortVisitasAsc) });
    if (proximas.length > 0)
      result.push({ key: "proximas", label: "Próximas", isOverdue: false, items: proximas.sort(sortVisitasAsc) });
    if (historico.length > 0) {
      result.push({
        key: "historico",
        label: "Realizadas / Canceladas",
        isOverdue: false,
        items: historico.sort(sortVisitasDesc),
      });
    }

    return result;
  }, [amanha, filtered, hoje]);

  const openCreate = () => {
    setFormMode("create");
    setEditingVisita(null);
    setForm({ ...emptyForm, dataVisita: hoje });
    setFormOpen(true);
  };

  const openEdit = (visita: Visita, mode: FormMode = "edit") => {
    setFormMode(mode);
    setEditingVisita(visita);
    setDetailVisita(null);
    setForm(toFormData(visita));
    setFormOpen(true);
  };

  const updateField = <K extends keyof VisitaFormData>(field: K, value: VisitaFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleResponsavelChange = (value: string) => {
    if (value === "__none__") {
      setForm((prev) => ({ ...prev, responsavelId: "", responsavelNome: "" }));
      return;
    }

    const selected = teamMembers.find((member) => member.id === value);
    setForm((prev) => ({
      ...prev,
      responsavelId: value,
      responsavelNome: selected?.name ?? prev.responsavelNome,
    }));
  };

  const handleSubmit = async () => {
    if (!form.nomeCliente.trim()) {
      toast.error("Nome do cliente é obrigatório.");
      return;
    }
    if (!form.telefone.trim()) {
      toast.error("Telefone é obrigatório.");
      return;
    }
    if (!form.enderecoCompleto.trim()) {
      toast.error("Endereço completo é obrigatório.");
      return;
    }
    if (!form.dataVisita) {
      toast.error("Data da visita é obrigatória.");
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(form.horaVisita)) {
      toast.error("Hora da visita deve estar no formato HH:MM.");
      return;
    }

    const input: VisitaInput = {
      nomeCliente: form.nomeCliente,
      telefone: form.telefone,
      enderecoCompleto: form.enderecoCompleto,
      bairro: form.bairro,
      cidade: form.cidade,
      complemento: form.complemento,
      pontoReferencia: form.pontoReferencia,
      tipoServico: form.tipoServico,
      observacoes: form.observacoes,
      origemContato: form.origemContato,
      responsavelId: form.responsavelId || null,
      responsavelNome: form.responsavelNome,
      dataVisita: form.dataVisita,
      horaVisita: form.horaVisita,
    };

    try {
      if (editingVisita) {
        const scheduleChanged =
          form.dataVisita !== editingVisita.dataVisita || form.horaVisita !== editingVisita.horaVisita.slice(0, 5);

        const nextStatus =
          scheduleChanged && (editingVisita.status === "agendada" || editingVisita.status === "reagendada")
            ? "reagendada"
            : editingVisita.status;

        await updateVisita.mutateAsync({
          id: editingVisita.id,
          input: {
            ...input,
            status: nextStatus,
            clienteId: editingVisita.clienteId,
            orcamentoId: editingVisita.orcamentoId,
          },
        });
        toast.success(formMode === "reschedule" ? "Visita reagendada." : "Visita atualizada.");
      } else {
        await addVisita.mutateAsync(input);
        toast.success("Visita agendada.");
      }

      setFormOpen(false);
      setEditingVisita(null);
    } catch {
      toast.error("Erro ao salvar a visita.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou endereço..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>

        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Nova visita
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              filter === option.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin" />
          Carregando visitas...
        </div>
      )}

      {!isLoading && sections.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma visita encontrada</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Agende visitas comerciais e técnicas para organizar os atendimentos iniciais.
            </p>
            <Button className="mt-4" size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Agendar primeira visita
            </Button>
          </CardContent>
        </Card>
      )}

      {sections.map((section) => (
        <div key={section.key} className="space-y-2">
          <div className="flex items-center gap-2">
            {section.isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
            <h3 className={cn("text-sm font-semibold", section.isOverdue ? "text-destructive" : "text-foreground")}>
              {section.label}
            </h3>
            <Badge
              variant="secondary"
              className={cn(
                "px-1.5 py-0 text-[10px]",
                section.isOverdue && "border-destructive/20 bg-destructive/10 text-destructive",
              )}
            >
              {section.items.length}
            </Badge>
          </div>

          <div className="space-y-1.5">
            {section.items.map((visita) => {
              const cfg = STATUS_VISITA_CONFIG[visita.status];

              return (
                <button
                  key={visita.id}
                  onClick={() => setDetailVisita(visita)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border bg-card px-3 py-3 text-left transition-colors hover:bg-muted/50",
                    section.isOverdue && "border-destructive/20",
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                    <MapPin className="h-4 w-4 text-violet-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">{visita.nomeCliente}</span>
                      <Badge variant="outline" className={cn("shrink-0 px-1.5 py-0 text-[10px]", cfg.color)}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatDateLabel(visita.dataVisita, hoje, amanha)}</span>
                      <span>•</span>
                      <span>{visita.horaVisita.slice(0, 5)}</span>
                      <span>•</span>
                      <span className="truncate">{visita.enderecoCompleto}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <VisitaDetailDialog
        visita={detailVisita}
        open={!!detailVisita}
        onOpenChange={(open) => !open && setDetailVisita(null)}
        onEdit={detailVisita ? () => openEdit(detailVisita, "edit") : undefined}
        onReschedule={detailVisita ? () => openEdit(detailVisita, "reschedule") : undefined}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Nova visita" : formMode === "reschedule" ? "Reagendar visita" : "Editar visita"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-3">
              <div>
                <Label htmlFor="visita-nome">Nome do cliente *</Label>
                <Input
                  id="visita-nome"
                  placeholder="Nome completo ou empresa"
                  value={form.nomeCliente}
                  onChange={(event) => updateField("nomeCliente", event.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="visita-telefone">Telefone / WhatsApp *</Label>
                <Input
                  id="visita-telefone"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={(event) => updateField("telefone", event.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="visita-endereco">Endereço completo *</Label>
                <Input
                  id="visita-endereco"
                  placeholder="Rua, número, bairro, cidade"
                  value={form.enderecoCompleto}
                  onChange={(event) => updateField("enderecoCompleto", event.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="visita-data">Data da visita *</Label>
                  <Input
                    id="visita-data"
                    type="date"
                    value={form.dataVisita}
                    onChange={(event) => updateField("dataVisita", event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="visita-hora">Hora *</Label>
                  <Input
                    id="visita-hora"
                    type="time"
                    value={form.horaVisita}
                    onChange={(event) => updateField("horaVisita", event.target.value)}
                  />
                </div>
              </div>
            </div>

            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Campos opcionais
              </summary>

              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="visita-bairro">Bairro</Label>
                    <Input
                      id="visita-bairro"
                      value={form.bairro}
                      onChange={(event) => updateField("bairro", event.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="visita-cidade">Cidade</Label>
                    <Input
                      id="visita-cidade"
                      value={form.cidade}
                      onChange={(event) => updateField("cidade", event.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="visita-complemento">Complemento</Label>
                  <Input
                    id="visita-complemento"
                    value={form.complemento}
                    onChange={(event) => updateField("complemento", event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="visita-referencia">Ponto de referência</Label>
                  <Input
                    id="visita-referencia"
                    value={form.pontoReferencia}
                    onChange={(event) => updateField("pontoReferencia", event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="visita-tipo-servico">Tipo de serviço</Label>
                  <Input
                    id="visita-tipo-servico"
                    placeholder="Ex: Calha, rufos, coifa..."
                    value={form.tipoServico}
                    onChange={(event) => updateField("tipoServico", event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="visita-origem">Origem do contato</Label>
                  <Select
                    value={form.origemContato || "__none__"}
                    onValueChange={(value) => updateField("origemContato", value === "__none__" ? "" : value)}
                  >
                    <SelectTrigger id="visita-origem">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Não informar</SelectItem>
                      {origemOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visita-responsavel">Responsável</Label>
                  <Select value={form.responsavelId || "__none__"} onValueChange={handleResponsavelChange}>
                    <SelectTrigger id="visita-responsavel">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Sem responsável</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.responsavelNome && !form.responsavelId && (
                    <p className="mt-1 text-[11px] text-muted-foreground">Responsável atual: {form.responsavelNome}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="visita-observacoes">Observações</Label>
                  <Textarea
                    id="visita-observacoes"
                    rows={3}
                    value={form.observacoes}
                    onChange={(event) => updateField("observacoes", event.target.value)}
                  />
                </div>
              </div>
            </details>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={addVisita.isPending || updateVisita.isPending}>
                {formMode === "create" ? "Agendar visita" : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
