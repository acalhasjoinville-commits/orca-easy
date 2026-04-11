import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useVisitas, useAddVisita, useUpdateVisita, type VisitaInput } from "@/hooks/useVisitas";
import { Visita, StatusVisita, STATUS_VISITA_CONFIG } from "@/lib/types";
import { getTodayLocal, addDaysLocal, formatDateLabel } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

type FilterStatus = "todos" | StatusVisita;

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: "todos", label: "Todas" },
  { value: "agendada", label: "Agendadas" },
  { value: "reagendada", label: "Reagendadas" },
  { value: "realizada", label: "Realizadas" },
  { value: "cancelada", label: "Canceladas" },
];

const origemOptions = [
  "WhatsApp",
  "Telefone",
  "Indicação",
  "Redes sociais",
  "Site",
  "Presencial",
  "Outro",
];

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
  dataVisita: string;
  horaVisita: string;
}

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
  dataVisita: "",
  horaVisita: "08:00",
};

interface VisitaDetailProps {
  visita: Visita;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (status: StatusVisita) => void;
}

function VisitaDetailSheet({ visita, onClose, onEdit, onStatusChange }: VisitaDetailProps) {
  const cfg = STATUS_VISITA_CONFIG[visita.status];
  const whatsLink = `https://wa.me/55${visita.telefone.replace(/\D/g, "")}`;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground">{visita.nomeCliente}</h3>
          <a
            href={whatsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Phone className="h-3.5 w-3.5" />
            {visita.telefone}
          </a>
        </div>
        <Badge variant="outline" className={cn("shrink-0", cfg.color)}>
          {cfg.label}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-foreground">{visita.enderecoCompleto}</span>
        </div>
        {visita.bairro && <p className="pl-6 text-muted-foreground">Bairro: {visita.bairro}</p>}
        {visita.cidade && <p className="pl-6 text-muted-foreground">Cidade: {visita.cidade}</p>}
        {visita.pontoReferencia && (
          <p className="pl-6 text-muted-foreground">Ref: {visita.pontoReferencia}</p>
        )}

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span>
            {new Date(visita.dataVisita + "T00:00:00").toLocaleDateString("pt-BR")} às{" "}
            {visita.horaVisita.slice(0, 5)}
          </span>
        </div>

        {visita.tipoServico && <p className="text-muted-foreground">Tipo: {visita.tipoServico}</p>}
        {visita.origemContato && (
          <p className="text-muted-foreground">Origem: {visita.origemContato}</p>
        )}
        {visita.responsavelNome && (
          <p className="text-muted-foreground">Responsável: {visita.responsavelNome}</p>
        )}
        {visita.observacoes && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Observações</p>
            <p className="mt-1 text-sm whitespace-pre-wrap">{visita.observacoes}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Editar
        </Button>
        {(visita.status === "agendada" || visita.status === "reagendada") && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-50"
              onClick={() => onStatusChange("realizada")}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Realizada
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-500/30 text-red-600 hover:bg-red-50"
              onClick={() => onStatusChange("cancelada")}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Cancelar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

interface VisitasManagerProps {
  openNewRequest?: number;
}

export function VisitasManager({ openNewRequest }: VisitasManagerProps) {
  const { visitas, isLoading } = useVisitas();
  const addVisita = useAddVisita();
  const updateVisita = useUpdateVisita();
  const { user } = useAuth();

  const [filter, setFilter] = useState<FilterStatus>("todos");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailVisita, setDetailVisita] = useState<Visita | null>(null);
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null);
  const [form, setForm] = useState<VisitaFormData>(emptyForm);

  const hoje = getTodayLocal();
  const amanha = addDaysLocal(1);

  // Auto-open when parent triggers
  const [lastRequest, setLastRequest] = useState(0);
  if (openNewRequest && openNewRequest !== lastRequest) {
    setLastRequest(openNewRequest);
    setEditingVisita(null);
    setForm({ ...emptyForm, dataVisita: hoje });
    setFormOpen(true);
  }

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtered = useMemo(() => {
    let list = visitas;
    if (filter !== "todos") list = list.filter((v) => v.status === filter);
    if (search.trim()) {
      const q = normalize(search);
      list = list.filter(
        (v) =>
          normalize(v.nomeCliente).includes(q) ||
          normalize(v.telefone).includes(q) ||
          normalize(v.enderecoCompleto).includes(q),
      );
    }
    return list;
  }, [visitas, filter, search]);

  // Group by temporal section
  const sections = useMemo(() => {
    const overdue: Visita[] = [];
    const todayList: Visita[] = [];
    const tomorrowList: Visita[] = [];
    const upcoming: Visita[] = [];
    const past: Visita[] = [];

    for (const v of filtered) {
      if (v.status === "cancelada") {
        past.push(v);
        continue;
      }
      if (v.status === "realizada") {
        past.push(v);
        continue;
      }
      if (v.dataVisita < hoje) {
        overdue.push(v);
      } else if (v.dataVisita === hoje) {
        todayList.push(v);
      } else if (v.dataVisita === amanha) {
        tomorrowList.push(v);
      } else {
        upcoming.push(v);
      }
    }

    const result: { key: string; label: string; isOverdue: boolean; items: Visita[] }[] = [];
    if (overdue.length > 0) result.push({ key: "atrasadas", label: "Atrasadas", isOverdue: true, items: overdue });
    if (todayList.length > 0) result.push({ key: "hoje", label: "Hoje", isOverdue: false, items: todayList });
    if (tomorrowList.length > 0)
      result.push({ key: "amanha", label: "Amanhã", isOverdue: false, items: tomorrowList });
    if (upcoming.length > 0)
      result.push({ key: "proximas", label: "Próximas", isOverdue: false, items: upcoming });
    if (past.length > 0)
      result.push({ key: "concluidas", label: "Realizadas / Canceladas", isOverdue: false, items: past });

    return result;
  }, [filtered, hoje, amanha]);

  const openCreate = () => {
    setEditingVisita(null);
    setForm({ ...emptyForm, dataVisita: hoje });
    setFormOpen(true);
  };

  const openEdit = (v: Visita) => {
    setEditingVisita(v);
    setForm({
      nomeCliente: v.nomeCliente,
      telefone: v.telefone,
      enderecoCompleto: v.enderecoCompleto,
      bairro: v.bairro,
      cidade: v.cidade,
      complemento: v.complemento,
      pontoReferencia: v.pontoReferencia,
      tipoServico: v.tipoServico,
      observacoes: v.observacoes,
      origemContato: v.origemContato,
      dataVisita: v.dataVisita,
      horaVisita: v.horaVisita.slice(0, 5),
    });
    setDetailVisita(null);
    setFormOpen(true);
  };

  const handleStatusChange = async (visita: Visita, status: StatusVisita) => {
    try {
      await updateVisita.mutateAsync({
        id: visita.id,
        nomeCliente: visita.nomeCliente,
        telefone: visita.telefone,
        enderecoCompleto: visita.enderecoCompleto,
        dataVisita: visita.dataVisita,
        horaVisita: visita.horaVisita,
        status,
      });
      toast.success(`Visita marcada como ${STATUS_VISITA_CONFIG[status].label.toLowerCase()}.`);
      setDetailVisita(null);
    } catch {
      toast.error("Erro ao atualizar status.");
    }
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
      toast.error("Endereço é obrigatório.");
      return;
    }
    if (!form.dataVisita) {
      toast.error("Data da visita é obrigatória.");
      return;
    }
    if (!form.horaVisita || !/^\d{2}:\d{2}$/.test(form.horaVisita)) {
      toast.error("Hora da visita é obrigatória (formato HH:MM).");
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
      dataVisita: form.dataVisita,
      horaVisita: form.horaVisita,
      responsavelNome: user?.user_metadata?.full_name ?? "",
    };

    try {
      if (editingVisita) {
        const isRescheduling =
          form.dataVisita !== editingVisita.dataVisita || form.horaVisita !== editingVisita.horaVisita.slice(0, 5);
        await updateVisita.mutateAsync({
          id: editingVisita.id,
          ...input,
          status: isRescheduling && editingVisita.status === "agendada" ? "reagendada" : editingVisita.status,
        });
        toast.success(isRescheduling ? "Visita reagendada!" : "Visita atualizada!");
      } else {
        await addVisita.mutateAsync(input);
        toast.success("Visita agendada!");
      }
      setFormOpen(false);
    } catch {
      toast.error("Erro ao salvar visita.");
    }
  };

  const updateField = <K extends keyof VisitaFormData>(field: K, value: VisitaFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou endereço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Nova visita
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              filter === opt.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin" />
          Carregando visitas...
        </div>
      )}

      {/* Empty */}
      {!isLoading && sections.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma visita encontrada</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Agende visitas comerciais e técnicas para organizar os atendimentos.
            </p>
            <Button className="mt-4" size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Agendar primeira visita
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.key} className="space-y-2">
          <div className="flex items-center gap-2">
            {section.isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
            <h3
              className={cn(
                "text-sm font-semibold",
                section.isOverdue ? "text-destructive" : "text-foreground",
              )}
            >
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
            {section.items.map((v) => {
              const cfg = STATUS_VISITA_CONFIG[v.status];
              return (
                <button
                  key={v.id}
                  onClick={() => setDetailVisita(v)}
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
                      <span className="truncate text-sm font-medium text-foreground">
                        {v.nomeCliente}
                      </span>
                      <Badge variant="outline" className={cn("shrink-0 text-[10px] px-1.5 py-0", cfg.color)}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatDateLabel(v.dataVisita, hoje, amanha)}</span>
                      <span>•</span>
                      <span>{v.horaVisita.slice(0, 5)}</span>
                      {v.enderecoCompleto && (
                        <>
                          <span>•</span>
                          <span className="truncate">{v.enderecoCompleto}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Detail Dialog */}
      <Dialog open={!!detailVisita} onOpenChange={(open) => !open && setDetailVisita(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da visita</DialogTitle>
          </DialogHeader>
          {detailVisita && (
            <VisitaDetailSheet
              visita={detailVisita}
              onClose={() => setDetailVisita(null)}
              onEdit={() => openEdit(detailVisita)}
              onStatusChange={(status) => handleStatusChange(detailVisita, status)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVisita ? "Editar visita" : "Nova visita"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Required */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="v-nome">Nome do cliente *</Label>
                <Input
                  id="v-nome"
                  placeholder="Nome completo ou empresa"
                  value={form.nomeCliente}
                  onChange={(e) => updateField("nomeCliente", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="v-tel">Telefone / WhatsApp *</Label>
                <Input
                  id="v-tel"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={(e) => updateField("telefone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="v-end">Endereço completo *</Label>
                <Input
                  id="v-end"
                  placeholder="Rua, nº - Bairro, Cidade"
                  value={form.enderecoCompleto}
                  onChange={(e) => updateField("enderecoCompleto", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="v-data">Data da visita *</Label>
                  <Input
                    id="v-data"
                    type="date"
                    value={form.dataVisita}
                    onChange={(e) => updateField("dataVisita", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="v-hora">Hora *</Label>
                  <Input
                    id="v-hora"
                    type="time"
                    value={form.horaVisita}
                    onChange={(e) => updateField("horaVisita", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Optional */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Campos opcionais
              </summary>
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="v-bairro">Bairro</Label>
                    <Input
                      id="v-bairro"
                      value={form.bairro}
                      onChange={(e) => updateField("bairro", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="v-cidade">Cidade</Label>
                    <Input
                      id="v-cidade"
                      value={form.cidade}
                      onChange={(e) => updateField("cidade", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="v-comp">Complemento</Label>
                  <Input
                    id="v-comp"
                    value={form.complemento}
                    onChange={(e) => updateField("complemento", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="v-ref">Ponto de referência</Label>
                  <Input
                    id="v-ref"
                    value={form.pontoReferencia}
                    onChange={(e) => updateField("pontoReferencia", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="v-tipo">Tipo de serviço</Label>
                  <Input
                    id="v-tipo"
                    placeholder="Ex: Calha, Rufos, Coifa..."
                    value={form.tipoServico}
                    onChange={(e) => updateField("tipoServico", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="v-origem">Origem do contato</Label>
                  <Select value={form.origemContato} onValueChange={(v) => updateField("origemContato", v)}>
                    <SelectTrigger id="v-origem">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {origemOptions.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="v-obs">Observações</Label>
                  <Textarea
                    id="v-obs"
                    rows={3}
                    value={form.observacoes}
                    onChange={(e) => updateField("observacoes", e.target.value)}
                  />
                </div>
              </div>
            </details>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={addVisita.isPending || updateVisita.isPending}>
                {editingVisita ? "Salvar" : "Agendar visita"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
