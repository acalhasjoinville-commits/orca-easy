import { useState, useRef, useEffect, useMemo } from "react";
import { useMotor1, useMotor2, useInsumos, useRegras, useServicos } from "@/hooks/useSupabaseTechnicalData";
import { Search } from "lucide-react";
import { useEmpresa, usePoliticas } from "@/hooks/useSupabaseData";
import {
  Motor1Entry,
  Motor2Entry,
  InsumoEntry,
  RegraCalculo,
  ServicoTemplate,
  PoliticaComercial,
  MotorType,
  ItemRegra,
  MetodoCalculo,
  getCustoUnitario,
  MinhaEmpresa,
} from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Upload,
  Save,
  Loader2,
  Layers,
  Calculator,
  BookOpen,
  FileText,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type EntitySection = "motor1" | "motor2" | "insumos" | "regras" | "catalogo" | "politicas";
type ConfigTab = "empresa" | "materiais" | "regras" | "catalogo" | "politicas";
type ConfigEntity = Motor1Entry | Motor2Entry | InsumoEntry | RegraCalculo | ServicoTemplate | PoliticaComercial;

const tabMeta: Record<ConfigTab, { title: string; description: string; helper: string; icon: React.ElementType }> = {
  empresa: {
    title: "Empresa e identidade",
    description: "Define os dados institucionais e a identidade visual usada no sistema e nos PDFs.",
    helper: "Ajuste logo, cores e dados de contato sem alterar a logica comercial do sistema.",
    icon: Building2,
  },
  materiais: {
    title: "Base de materiais",
    description: "Cadastre os materiais que alimentam o calculo de custo dos servicos.",
    helper: "Motor 2 e a base principal do sistema. Motor 1 permanece disponivel para casos especificos.",
    icon: Layers,
  },
  regras: {
    title: "Regras de consumo",
    description: "Definem como os insumos entram no calculo padrao de cada servico.",
    helper: "As regras sao base padrao: o usuario ainda pode ajustar os insumos depois no orcamento.",
    icon: Calculator,
  },
  catalogo: {
    title: "Catalogo de servicos",
    description: "Conecta material, regra e servico para automatizar o orcamento.",
    helper: "Cada servico do catalogo direciona o motor, o material e a regra aplicada automaticamente.",
    icon: BookOpen,
  },
  politicas: {
    title: "Politicas comerciais",
    description: "Centralizam validade, garantia e textos operacionais usados no atendimento.",
    helper: "Esses textos aparecem em orcamentos e OS, entao vale manter um padrao claro e profissional.",
    icon: FileText,
  },
};

// ─── MinhaEmpresaForm ───
function MinhaEmpresaForm() {
  const { empresa: existing, isLoading, saveEmpresa } = useEmpresa();
  const [initialized, setInitialized] = useState(false);
  const [form, setForm] = useState<MinhaEmpresa>({
    logoUrl: "",
    nomeFantasia: "",
    razaoSocial: "",
    cnpjCpf: "",
    telefoneWhatsApp: "",
    emailContato: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    corPrimaria: "#0B1B32",
    corDestaque: "#F57C00",
    slogan: "",
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialized && !isLoading) {
      if (existing) setForm(existing);
      setInitialized(true);
    }
  }, [isLoading, existing, initialized]);

  const set = (k: keyof MinhaEmpresa, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 2MB.", { duration: 5000 });
      return;
    }
    setUploading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("empresa_id")
        .eq("id", user?.id)
        .maybeSingle<{ empresa_id: string | null }>();
      const empresaPrefix = profile?.empresa_id || "default";
      const ext = file.name.split(".").pop() || "png";
      const path = `${empresaPrefix}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
      set("logoUrl", urlData.publicUrl);
      toast.success("Logo enviada!", { duration: 2500 });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar logo.", { duration: 5000 });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveEmpresa.mutateAsync(form);
      toast.success("Dados da empresa salvos!", { duration: 2500 });
    } catch {
      toast.error("Erro ao salvar dados da empresa.", { duration: 5000 });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-foreground">
            Esses dados aparecem no sistema, nos orcamentos e nos PDFs.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ajuste logo, cores e dados institucionais aqui para manter a apresentacao da empresa consistente.
          </p>
        </CardContent>
      </Card>

      {/* Logo + Brand */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Identidade Visual</h3>
              <p className="text-[11px] text-muted-foreground">Logomarca e cores do sistema e PDF</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="Logo" className="h-16 w-16 rounded-lg object-contain border bg-background" />
            ) : (
              <div className="h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <Upload className="h-5 w-5 text-muted-foreground/40" />
              </div>
            )}
            <div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Upload className="mr-1 h-3 w-3" />}
                {uploading ? "Enviando..." : "Upload Logo"}
              </Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <p className="text-[10px] text-muted-foreground mt-1">PNG ou JPG, máx 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">🎨 Cor Primária</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.corPrimaria}
                  onChange={(e) => set("corPrimaria", e.target.value)}
                  className="h-9 w-12 rounded-md border cursor-pointer"
                />
                <Input
                  value={form.corPrimaria}
                  onChange={(e) => set("corPrimaria", e.target.value)}
                  placeholder="#0044CC"
                  className="h-9 font-mono text-xs flex-1"
                />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">✨ Cor Destaque</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.corDestaque}
                  onChange={(e) => set("corDestaque", e.target.value)}
                  className="h-9 w-12 rounded-md border cursor-pointer"
                />
                <Input
                  value={form.corDestaque}
                  onChange={(e) => set("corDestaque", e.target.value)}
                  placeholder="#16A34A"
                  className="h-9 font-mono text-xs flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Data */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Dados da Empresa</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] font-medium text-muted-foreground">Nome Fantasia</Label>
                <Input
                  value={form.nomeFantasia}
                  onChange={(e) => set("nomeFantasia", e.target.value)}
                  placeholder="Nome comercial"
                  className="h-9 mt-1"
                />
              </div>
              <div>
                <Label className="text-[11px] font-medium text-muted-foreground">Razão Social</Label>
                <Input
                  value={form.razaoSocial}
                  onChange={(e) => set("razaoSocial", e.target.value)}
                  placeholder="Razão social"
                  className="h-9 mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-[11px] font-medium text-muted-foreground">Slogan</Label>
              <Input
                value={form.slogan}
                onChange={(e) => set("slogan", e.target.value)}
                placeholder="Ex: A solução está no nome"
                className="h-9 mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] font-medium text-muted-foreground">CNPJ / CPF</Label>
                <Input
                  value={form.cnpjCpf}
                  onChange={(e) => set("cnpjCpf", e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="h-9 mt-1"
                />
              </div>
              <div>
                <Label className="text-[11px] font-medium text-muted-foreground">WhatsApp</Label>
                <Input
                  value={form.telefoneWhatsApp}
                  onChange={(e) => set("telefoneWhatsApp", e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="h-9 mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-[11px] font-medium text-muted-foreground">E-mail de Contato</Label>
              <Input
                type="email"
                value={form.emailContato}
                onChange={(e) => set("emailContato", e.target.value)}
                placeholder="contato@empresa.com"
                className="h-9 mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Endereço</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3">
                <Label className="text-[11px] font-medium text-muted-foreground">Endereço</Label>
                <Input
                  value={form.endereco}
                  onChange={(e) => set("endereco", e.target.value)}
                  placeholder="Rua / Av."
                  className="h-9 mt-1"
                />
              </div>
              <div>
                <Label className="text-[11px] font-medium text-muted-foreground">Número</Label>
                <Input
                  value={form.numero}
                  onChange={(e) => set("numero", e.target.value)}
                  placeholder="Nº"
                  className="h-9 mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] font-medium text-muted-foreground">Bairro</Label>
                <Input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[11px] font-medium text-muted-foreground">Cidade</Label>
                <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[11px] font-medium text-muted-foreground">Estado</Label>
                <Input
                  value={form.estado}
                  onChange={(e) => set("estado", e.target.value)}
                  placeholder="UF"
                  className="h-9 mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saveEmpresa.isPending} className="w-full h-10">
        {saveEmpresa.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Salvar Dados da Empresa
      </Button>
    </div>
  );
}

// ─── Accent-normalized search helper ───
function normalize(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// ─── Reusable sub-section ───
function SubSection({
  title,
  description,
  onAdd,
  isEmpty,
  emptyText,
  children,
  searchValue,
  onSearchChange,
  totalCount,
  filteredCount,
  searchPlaceholder,
  tag,
  addLabel,
}: {
  title: string;
  description: string;
  onAdd: () => void;
  isEmpty: boolean;
  emptyText: string;
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  totalCount?: number;
  filteredCount?: number;
  searchPlaceholder?: string;
  tag?: string;
  addLabel?: string;
}) {
  const showSearch = onSearchChange !== undefined;
  const showCount = totalCount !== undefined && totalCount > 0;
  const isFiltering = searchValue && searchValue.length > 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              {tag && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {tag}
                </Badge>
              )}
              {showCount && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {isFiltering ? `${filteredCount}/${totalCount}` : totalCount}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
          </div>
          <Button size="sm" onClick={onAdd} className="shrink-0 h-8">
            <Plus className="mr-1 h-3 w-3" /> {addLabel || "Novo"}
          </Button>
        </div>
        {showSearch && (totalCount ?? 0) > 0 && (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder || "Buscar..."}
              value={searchValue || ""}
              onChange={(e) => onSearchChange!(e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>
        )}
        {isEmpty ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/20 py-8 text-center">
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          </div>
        ) : (
          <div className="divide-y divide-border -mx-5">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Item row with contextual menu ───
function ItemRow({
  children,
  item,
  section,
  onEdit,
  onDelete,
  deletingId,
}: {
  children: React.ReactNode;
  item: ConfigEntity;
  section: EntitySection;
  onEdit: (item: ConfigEntity, section: EntitySection) => void;
  onDelete: (id: string, section: EntitySection) => void;
  deletingId: string | null;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
      <div className="min-w-0 flex-1">{children}</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ml-2 shrink-0">
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[120px]">
          <DropdownMenuItem onClick={() => onEdit(item, section)} className="text-xs gap-2">
            <Pencil className="h-3.5 w-3.5" /> Editar
          </DropdownMenuItem>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-xs gap-2 text-destructive focus:text-destructive"
              >
                {deletingId === item.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Excluir
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Deseja remover este item? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(item.id, section)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── Main Component ───
export function Configuracoes() {
  const [tab, setTab] = useState<ConfigTab>("empresa");
  const [activeSection, setActiveSection] = useState<EntitySection>("motor1");

  const { motor1, isLoading: loadingM1, addMotor1, updateMotor1, deleteMotor1 } = useMotor1();
  const { motor2, isLoading: loadingM2, addMotor2, updateMotor2, deleteMotor2 } = useMotor2();
  const { insumos, isLoading: loadingIns, addInsumo, updateInsumo, deleteInsumo } = useInsumos();
  const { regras, isLoading: loadingReg, addRegra, updateRegra, deleteRegra } = useRegras();
  const { servicos, isLoading: loadingSrv, addServico, updateServico, deleteServico } = useServicos();
  const { politicas, addPolitica, updatePolitica, deletePolitica } = usePoliticas();

  const isLoadingTech = loadingM1 || loadingM2 || loadingIns || loadingReg || loadingSrv;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ConfigEntity | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<Record<string, string>>({});
  const setField = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const [searchMotor1, setSearchMotor1] = useState("");
  const [searchMotor2, setSearchMotor2] = useState("");
  const [searchInsumos, setSearchInsumos] = useState("");
  const [searchRegras, setSearchRegras] = useState("");
  const [searchCatalogo, setSearchCatalogo] = useState("");
  const [searchPoliticas, setSearchPoliticas] = useState("");

  const [regraItens, setRegraItens] = useState<ItemRegra[]>([]);

  const openAdd = (section: EntitySection) => {
    setActiveSection(section);
    setEditItem(null);
    setForm({});
    setRegraItens([]);
    setDialogOpen(true);
  };

  const openEdit = (item: ConfigEntity, section: EntitySection) => {
    setActiveSection(section);
    setEditItem(item);
    const f: Record<string, string> = {};
    Object.entries(item).forEach(([k, v]) => {
      if (k !== "id" && k !== "itensRegra") f[k] = String(v);
    });
    setForm(f);
    if ('itensRegra' in item && (item as RegraCalculo).itensRegra) setRegraItens([...(item as RegraCalculo).itensRegra]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const id = editItem?.id || crypto.randomUUID();

    try {
      if (activeSection === "motor1") {
        const entry: Motor1Entry = {
          id,
          material: form.material || "",
          densidade: parseFloat(form.densidade) || 0,
          precoQuilo: parseFloat(form.precoQuilo) || 0,
        };
        if (editItem) await updateMotor1.mutateAsync(entry);
        else await addMotor1.mutateAsync(entry);
      } else if (activeSection === "motor2") {
        const entry: Motor2Entry = {
          id,
          material: form.material || "",
          espessura: parseFloat(form.espessura) || 0,
          corte: parseFloat(form.corte) || 0,
          precoMetroLinear: parseFloat(form.precoMetroLinear) || 0,
        };
        if (editItem) await updateMotor2.mutateAsync(entry);
        else await addMotor2.mutateAsync(entry);
      } else if (activeSection === "insumos") {
        const entry: InsumoEntry = {
          id,
          nomeEmbalagemCompra: form.nomeEmbalagemCompra || "",
          nomeUnidadeConsumo: form.nomeUnidadeConsumo || "",
          precoEmbalagem: parseFloat(form.precoEmbalagem) || 0,
          qtdEmbalagem: parseFloat(form.qtdEmbalagem) || 1,
        };
        if (editItem) await updateInsumo.mutateAsync(entry);
        else await addInsumo.mutateAsync(entry);
      } else if (activeSection === "regras") {
        const entry: RegraCalculo = { id, nomeRegra: form.nomeRegra || "", itensRegra: regraItens };
        if (editItem) await updateRegra.mutateAsync(entry);
        else await addRegra.mutateAsync(entry);
      } else if (activeSection === "catalogo") {
        const entry: ServicoTemplate = {
          id,
          nomeServico: form.nomeServico || "",
          regraId: form.regraId || "",
          motorType: (form.motorType as MotorType) || "motor1",
          materialPadrao: form.materialPadrao || "",
          espessuraPadrao: parseFloat(form.espessuraPadrao) || 0,
          cortePadrao: parseFloat(form.cortePadrao) || 0,
          dificuldadeFacil: parseFloat(form.dificuldadeFacil) || 2.6,
          dificuldadeMedia: parseFloat(form.dificuldadeMedia) || 3.5,
          dificuldadeDificil: parseFloat(form.dificuldadeDificil) || 4.6,
        };
        if (editItem) await updateServico.mutateAsync(entry);
        else await addServico.mutateAsync(entry);
      } else if (activeSection === "politicas") {
        const entry: PoliticaComercial = {
          id,
          nomePolitica: form.nomePolitica || "",
          validadeDias: parseInt(form.validadeDias) || 15,
          formasPagamento: form.formasPagamento || "",
          garantia: form.garantia || "",
          tempoGarantia: form.tempoGarantia || "1 ano",
          termoRecebimentoOs: form.termoRecebimentoOs || "",
        };
        if (editItem) await updatePolitica.mutateAsync(entry);
        else await addPolitica.mutateAsync(entry);
      }

      setDialogOpen(false);
      toast.success(editItem ? "Atualizado!" : "Adicionado!", { duration: 2500 });
    } catch {
      toast.error("Erro ao salvar.", { duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, section: EntitySection) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      if (section === "motor1") await deleteMotor1.mutateAsync(id);
      else if (section === "motor2") await deleteMotor2.mutateAsync(id);
      else if (section === "insumos") await deleteInsumo.mutateAsync(id);
      else if (section === "regras") await deleteRegra.mutateAsync(id);
      else if (section === "catalogo") await deleteServico.mutateAsync(id);
      else if (section === "politicas") await deletePolitica.mutateAsync(id);
      toast.success("Removido!", { duration: 2500 });
    } catch {
      toast.error("Erro ao remover.", { duration: 5000 });
    } finally {
      setDeletingId(null);
    }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const materiaisUnicos = [...new Set([...motor1.map((m) => m.material), ...motor2.map((m) => m.material)])];
  const regraName = (id: string) => regras.find((r) => r.id === id)?.nomeRegra || "—";

  const regraMap = useMemo(() => new Map(regras.map((r) => [r.id, r.nomeRegra])), [regras]);
  const currentTabMeta = tabMeta[tab];

  const addRegraItem = () => {
    setRegraItens((prev) => [...prev, { id: crypto.randomUUID(), insumoId: "", metodoCalculo: "dividir", fator: 1 }]);
  };

  const updateRegraItem = (idx: number, field: keyof ItemRegra, value: string | number) => {
    setRegraItens((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const removeRegraItem = (idx: number) => {
    setRegraItens((prev) => prev.filter((_, i) => i !== idx));
  };

  // ─── Form renderers ───
  const renderRegraForm = () => (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/20 p-3">
        <p className="text-xs font-medium text-foreground">
          Essa regra define o consumo padrao de insumos por servico.
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">
          Ela permanece ajustavel no orcamento. Aqui voce cadastra somente a base automatica usada pelo sistema.
        </p>
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground">Nome da Regra</Label>
        <Input value={form.nomeRegra || ""} onChange={(e) => setField("nomeRegra", e.target.value)} className="mt-1" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-[11px] font-semibold">Insumos da Regra</Label>
          <Button type="button" size="sm" variant="outline" onClick={addRegraItem} className="h-7 text-xs">
            <Plus className="mr-1 h-3 w-3" /> Adicionar
          </Button>
        </div>
        {regraItens.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum insumo adicionado.</p>
        )}
        <div className="space-y-2">
          {regraItens.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg border bg-muted/20 p-2">
              <Select value={item.insumoId} onValueChange={(v) => updateRegraItem(idx, "insumoId", v)}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Insumo" />
                </SelectTrigger>
                <SelectContent>
                  {insumos.map((ins) => (
                    <SelectItem key={ins.id} value={ins.id}>
                      {ins.nomeEmbalagemCompra}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={item.metodoCalculo}
                onValueChange={(v) => updateRegraItem(idx, "metodoCalculo", v as MetodoCalculo)}
              >
                <SelectTrigger className="h-8 text-xs w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiplicar">Por metro</SelectItem>
                  <SelectItem value="dividir">A cada X m</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                inputMode="decimal"
                className="h-8 w-16 text-xs text-center"
                value={item.fator}
                onChange={(e) => updateRegraItem(idx, "fator", parseFloat(e.target.value) || 0)}
              />
              <button
                onClick={() => removeRegraItem(idx)}
                className="p-1 text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCatalogoForm = () => (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/20 p-3">
        <p className="text-xs font-medium text-foreground">O catalogo conecta servico, material e regra.</p>
        <p className="text-[11px] text-muted-foreground mt-1">
          Ao usar esse servico no orcamento, o sistema vai buscar o material, aplicar a regra e calcular os insumos
          automaticamente.
        </p>
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground">Nome do Serviço</Label>
        <Input
          value={form.nomeServico || ""}
          onChange={(e) => setField("nomeServico", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground">Regra de Cálculo</Label>
        <Select value={form.regraId || ""} onValueChange={(v) => setField("regraId", v)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {regras.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.nomeRegra}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground">Motor</Label>
        <Select value={form.motorType || "motor1"} onValueChange={(v) => setField("motorType", v)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="motor1">Fabricar (Motor 1)</SelectItem>
            <SelectItem value="motor2">Comprar Dobrado (Motor 2)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground">Material Padrão</Label>
        <Select value={form.materialPadrao || ""} onValueChange={(v) => setField("materialPadrao", v)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {materiaisUnicos.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] font-medium text-muted-foreground">Espessura (mm)</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={form.espessuraPadrao || ""}
            onChange={(e) => setField("espessuraPadrao", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-[11px] font-medium text-muted-foreground">Corte (mm)</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={form.cortePadrao || ""}
            onChange={(e) => setField("cortePadrao", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-[11px] font-medium text-muted-foreground">Fator Fácil</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={form.dificuldadeFacil || ""}
            onChange={(e) => setField("dificuldadeFacil", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-[11px] font-medium text-muted-foreground">Fator Médio</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={form.dificuldadeMedia || ""}
            onChange={(e) => setField("dificuldadeMedia", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-[11px] font-medium text-muted-foreground">Fator Difícil</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={form.dificuldadeDificil || ""}
            onChange={(e) => setField("dificuldadeDificil", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const TEMPO_GARANTIA_OPTIONS = ["3 meses", "6 meses", "1 ano", "2 anos", "3 anos", "5 anos"];

  const renderPoliticaForm = () => (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/20 p-3">
        <p className="text-xs font-medium text-foreground">Esses textos padronizam o atendimento comercial.</p>
        <p className="text-[11px] text-muted-foreground mt-1">
          Use esta area para definir validade, garantia e condicoes que aparecem no orcamento e na OS.
        </p>
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground">Nome da Política</Label>
        <Input
          value={form.nomePolitica || ""}
          onChange={(e) => setField("nomePolitica", e.target.value)}
          placeholder="Ex: Padrão Residencial"
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground">Validade (dias)</Label>
        <Input
          type="number"
          inputMode="numeric"
          value={form.validadeDias || ""}
          onChange={(e) => setField("validadeDias", e.target.value)}
          placeholder="15"
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground">Tempo de Garantia</Label>
        <Select value={form.tempoGarantia || "1 ano"} onValueChange={(v) => setField("tempoGarantia", v)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecione..." />
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
        <Label className="text-[11px] font-medium text-muted-foreground">Formas de Pagamento</Label>
        <Textarea
          value={form.formasPagamento || ""}
          onChange={(e) => setField("formasPagamento", e.target.value)}
          placeholder="Condições de pagamento padrão..."
          rows={2}
          className="text-sm mt-1"
        />
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground">Termos de Garantia</Label>
        <Textarea
          value={form.garantia || ""}
          onChange={(e) => setField("garantia", e.target.value)}
          placeholder="Detalhes dos termos de garantia..."
          rows={2}
          className="text-sm mt-1"
        />
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground">Termo de Recebimento (OS)</Label>
        <Textarea
          value={form.termoRecebimentoOs || ""}
          onChange={(e) => setField("termoRecebimentoOs", e.target.value)}
          placeholder="Texto do canhoto de entrega da OS..."
          rows={3}
          className="text-sm mt-1"
        />
        <p className="text-[10px] text-muted-foreground mt-1">Exibido no canhoto de entrega da OS.</p>
      </div>
    </div>
  );

  const simpleFields: Record<string, { label: string; key: string; type?: string }[]> = {
    motor1: [
      { label: "Material", key: "material" },
      { label: "Densidade (g/cm³)", key: "densidade", type: "number" },
      { label: "Preço/Kg (R$)", key: "precoQuilo", type: "number" },
    ],
    motor2: [
      { label: "Material", key: "material" },
      { label: "Espessura (mm)", key: "espessura", type: "number" },
      { label: "Corte/Largura (mm)", key: "corte", type: "number" },
      { label: "Preço/Metro (R$)", key: "precoMetroLinear", type: "number" },
    ],
    insumos: [
      { label: "Nome da Embalagem", key: "nomeEmbalagemCompra" },
      { label: "Nome da Unidade de Consumo", key: "nomeUnidadeConsumo" },
      { label: "Preço da Embalagem (R$)", key: "precoEmbalagem", type: "number" },
      { label: "Qtd na Embalagem", key: "qtdEmbalagem", type: "number" },
    ],
  };

  const simpleSectionHelp: Partial<Record<EntitySection, { title: string; description: string }>> = {
    motor1: {
      title: "Material calculado por peso",
      description:
        "Use esta area para materiais do Motor 1. Ela continua disponivel, mas costuma ser menos usada no dia a dia.",
    },
    motor2: {
      title: "Base principal do calculo",
      description: "Cadastre material, espessura, corte e preco por metro. Essa e a combinacao principal do sistema.",
    },
    insumos: {
      title: "Custo unitario automatico",
      description:
        "O sistema usa preco da embalagem e quantidade para calcular automaticamente o custo unitario de cada insumo.",
    },
  };

  const renderFormContent = () => {
    if (activeSection === "catalogo") return renderCatalogoForm();
    if (activeSection === "regras") return renderRegraForm();
    if (activeSection === "politicas") return renderPoliticaForm();
    return (
      <div className="space-y-3">
        {simpleSectionHelp[activeSection] && (
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs font-medium text-foreground">{simpleSectionHelp[activeSection]?.title}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{simpleSectionHelp[activeSection]?.description}</p>
          </div>
        )}
        {simpleFields[activeSection]?.map((f) => (
          <div key={f.key}>
            <Label className="text-[11px] font-medium text-muted-foreground">{f.label}</Label>
            <Input
              type={f.type || "text"}
              inputMode={f.type === "number" ? "decimal" : "text"}
              value={form[f.key] || ""}
              onChange={(e) => setField(f.key, e.target.value)}
              className="mt-1"
            />
          </div>
        ))}
      </div>
    );
  };

  const sectionLabels: Record<EntitySection, string> = {
    motor1: "Motor 1",
    motor2: "Motor 2",
    insumos: "Insumo",
    regras: "Regra de Cálculo",
    catalogo: "Serviço",
    politicas: "Política Comercial",
  };

  const dialogTitle = `${editItem ? "Editar" : "Adicionar"} ${sectionLabels[activeSection]}`;

  // ─── Filtered lists ───
  const filteredMotor1 = useMemo(() => {
    if (!searchMotor1) return motor1;
    const q = normalize(searchMotor1);
    return motor1.filter((e) => normalize(e.material).includes(q) || String(e.densidade).includes(q));
  }, [motor1, searchMotor1]);

  const filteredMotor2 = useMemo(() => {
    if (!searchMotor2) return motor2;
    const q = normalize(searchMotor2);
    return motor2.filter(
      (e) => normalize(e.material).includes(q) || String(e.espessura).includes(q) || String(e.corte).includes(q),
    );
  }, [motor2, searchMotor2]);

  const filteredInsumos = useMemo(() => {
    if (!searchInsumos) return insumos;
    const q = normalize(searchInsumos);
    return insumos.filter(
      (e) => normalize(e.nomeUnidadeConsumo).includes(q) || normalize(e.nomeEmbalagemCompra).includes(q),
    );
  }, [insumos, searchInsumos]);

  const filteredRegras = useMemo(() => {
    if (!searchRegras) return regras;
    const q = normalize(searchRegras);
    return regras.filter((e) => normalize(e.nomeRegra).includes(q));
  }, [regras, searchRegras]);

  const filteredCatalogo = useMemo(() => {
    if (!searchCatalogo) return servicos;
    const q = normalize(searchCatalogo);
    return servicos.filter(
      (e) =>
        normalize(e.nomeServico).includes(q) ||
        normalize(e.materialPadrao).includes(q) ||
        normalize(regraMap.get(e.regraId) || "").includes(q),
    );
  }, [servicos, searchCatalogo, regraMap]);

  const filteredPoliticas = useMemo(() => {
    if (!searchPoliticas) return politicas;
    const q = normalize(searchPoliticas);
    return politicas.filter(
      (e) =>
        normalize(e.nomePolitica).includes(q) ||
        normalize(e.formasPagamento || "").includes(q) ||
        normalize(e.garantia || "").includes(q),
    );
  }, [politicas, searchPoliticas]);

  const renderMateriaisTab = () => (
    <div className="space-y-6 max-w-3xl">
      {/* Motor 1 */}
      <SubSection
        title="Motor 1 — Chapas e Bobinas"
        description="Materiais comprados em bobina/chapa, com cálculo por peso."
        onAdd={() => openAdd("motor1")}
        isEmpty={filteredMotor1.length === 0 && motor1.length === 0}
        emptyText="Nenhum material cadastrado no Motor 1."
        searchValue={searchMotor1}
        onSearchChange={setSearchMotor1}
        totalCount={motor1.length}
        filteredCount={filteredMotor1.length}
        searchPlaceholder="Buscar por material ou densidade..."
        addLabel="Novo material"
      >
        {filteredMotor1.length === 0 && motor1.length > 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 px-5">Nenhum resultado para "{searchMotor1}"</p>
        ) : (
          filteredMotor1.map((e) => (
            <ItemRow
              key={e.id}
              item={e}
              section="motor1"
              onEdit={openEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
            >
              <p className="text-sm font-medium">{e.material}</p>
              <p className="text-xs text-muted-foreground">
                {e.densidade} g/cm³ · {fmt(e.precoQuilo)}/kg
              </p>
            </ItemRow>
          ))
        )}
      </SubSection>

      {/* Motor 2 */}
      <SubSection
        title="Motor 2 — Material Dobrado"
        description="Materiais comprados já dobrados, com preço por metro linear."
        onAdd={() => openAdd("motor2")}
        isEmpty={filteredMotor2.length === 0 && motor2.length === 0}
        emptyText="Nenhum material cadastrado no Motor 2."
        searchValue={searchMotor2}
        onSearchChange={setSearchMotor2}
        totalCount={motor2.length}
        filteredCount={filteredMotor2.length}
        searchPlaceholder="Buscar por material, espessura..."
        tag="Principal"
        addLabel="Novo material"
      >
        {filteredMotor2.length === 0 && motor2.length > 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 px-5">Nenhum resultado para "{searchMotor2}"</p>
        ) : (
          filteredMotor2.map((e) => (
            <ItemRow
              key={e.id}
              item={e}
              section="motor2"
              onEdit={openEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
            >
              <p className="text-sm font-medium">{e.material}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {e.espessura}mm
                </Badge>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {e.corte}mm
                </Badge>
                <span className="text-[11px] font-semibold text-primary">{fmt(e.precoMetroLinear)}/m</span>
              </div>
            </ItemRow>
          ))
        )}
      </SubSection>

      {/* Insumos */}
      <SubSection
        title="Insumos"
        description="Materiais consumíveis usados nas regras de cálculo."
        onAdd={() => openAdd("insumos")}
        isEmpty={filteredInsumos.length === 0 && insumos.length === 0}
        emptyText="Nenhum insumo cadastrado."
        searchValue={searchInsumos}
        onSearchChange={setSearchInsumos}
        totalCount={insumos.length}
        filteredCount={filteredInsumos.length}
        searchPlaceholder="Buscar por nome do insumo..."
        addLabel="Novo insumo"
      >
        {filteredInsumos.length === 0 && insumos.length > 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 px-5">Nenhum resultado para "{searchInsumos}"</p>
        ) : (
          filteredInsumos.map((e) => (
            <ItemRow
              key={e.id}
              item={e}
              section="insumos"
              onEdit={openEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
            >
              <p className="text-sm font-medium">{e.nomeEmbalagemCompra}</p>
              <p className="text-xs text-muted-foreground">
                {e.nomeUnidadeConsumo} · {fmt(e.precoEmbalagem)} / {e.qtdEmbalagem} →{" "}
                <span className="font-semibold text-primary">{fmt(getCustoUnitario(e))}/un</span>
              </p>
            </ItemRow>
          ))
        )}
      </SubSection>
    </div>
  );

  const renderRegrasTab = () => (
    <div className="space-y-6 max-w-3xl">
      <SubSection
        title="Regras de Cálculo"
        description="Definem como os insumos entram no cálculo do orçamento."
        onAdd={() => openAdd("regras")}
        isEmpty={filteredRegras.length === 0 && regras.length === 0}
        emptyText="Nenhuma regra cadastrada."
        searchValue={searchRegras}
        onSearchChange={setSearchRegras}
        totalCount={regras.length}
        filteredCount={filteredRegras.length}
        searchPlaceholder="Buscar por nome da regra..."
        addLabel="Nova regra"
      >
        {filteredRegras.length === 0 && regras.length > 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 px-5">Nenhum resultado para "{searchRegras}"</p>
        ) : (
          filteredRegras.map((e) => {
            const insNames = e.itensRegra
              .map((ir) => insumos.find((ins) => ins.id === ir.insumoId)?.nomeEmbalagemCompra)
              .filter(Boolean);
            const displayNames =
              insNames.length <= 3 ? insNames.join(", ") : `${insNames.slice(0, 3).join(", ")} +${insNames.length - 3}`;
            return (
              <ItemRow
                key={e.id}
                item={e}
                section="regras"
                onEdit={openEdit}
                onDelete={handleDelete}
                deletingId={deletingId}
              >
                <p className="text-sm font-medium">{e.nomeRegra}</p>
                <p className="text-xs text-muted-foreground">
                  {insNames.length > 0 ? displayNames : "Nenhum insumo vinculado"}
                </p>
              </ItemRow>
            );
          })
        )}
      </SubSection>
    </div>
  );

  const renderCatalogoTab = () => (
    <div className="space-y-6 max-w-3xl">
      <SubSection
        title="Catálogo de Serviços"
        description="Serviços disponíveis para orçamento, com motor, material e fatores de dificuldade."
        onAdd={() => openAdd("catalogo")}
        isEmpty={filteredCatalogo.length === 0 && servicos.length === 0}
        emptyText="Nenhum serviço cadastrado."
        searchValue={searchCatalogo}
        onSearchChange={setSearchCatalogo}
        totalCount={servicos.length}
        filteredCount={filteredCatalogo.length}
        searchPlaceholder="Buscar por nome, material ou regra..."
        addLabel="Novo servico"
      >
        {filteredCatalogo.length === 0 && servicos.length > 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 px-5">
            Nenhum resultado para "{searchCatalogo}"
          </p>
        ) : (
          filteredCatalogo.map((e) => (
            <ItemRow
              key={e.id}
              item={e}
              section="catalogo"
              onEdit={openEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{e.nomeServico}</p>
                <Badge variant={e.motorType === "motor1" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                  {e.motorType === "motor1" ? "M1" : "M2"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {e.materialPadrao} · {e.espessuraPadrao}mm · {e.cortePadrao}mm
              </p>
              <p className="text-[11px] text-muted-foreground/70">Regra: {regraName(e.regraId)}</p>
            </ItemRow>
          ))
        )}
      </SubSection>
    </div>
  );

  const renderPoliticasTab = () => (
    <div className="space-y-6 max-w-3xl">
      <SubSection
        title="Políticas Comerciais"
        description="Condições comerciais usadas no orçamento e na Ordem de Serviço."
        onAdd={() => openAdd("politicas")}
        isEmpty={filteredPoliticas.length === 0 && politicas.length === 0}
        searchValue={searchPoliticas}
        onSearchChange={setSearchPoliticas}
        totalCount={politicas.length}
        filteredCount={filteredPoliticas.length}
        searchPlaceholder="Buscar por nome, pagamento ou garantia..."
        addLabel="Nova politica"
        emptyText="Nenhuma política cadastrada."
      >
        {filteredPoliticas.length === 0 && politicas.length > 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 px-5">
            Nenhum resultado para "{searchPoliticas}"
          </p>
        ) : (
          filteredPoliticas.map((e) => (
            <ItemRow
              key={e.id}
              item={e}
              section="politicas"
              onEdit={openEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
            >
              <p className="text-sm font-medium">{e.nomePolitica}</p>
              <p className="text-xs text-muted-foreground">
                {e.validadeDias} dias · Garantia: {e.tempoGarantia || "—"}
              </p>
              {e.formasPagamento && (
                <p className="text-[11px] text-muted-foreground/70 truncate max-w-[300px]">{e.formasPagamento}</p>
              )}
            </ItemRow>
          ))
        )}
      </SubSection>
    </div>
  );

  const dialogDescription: Record<EntitySection, string> = {
    motor1: "Cadastre materiais usados no calculo por peso. Essa area costuma ser menos frequente no uso diario.",
    motor2: "Cadastre a base principal de material por metro: material, espessura, corte e preco.",
    insumos: "Defina os itens de consumo. O custo unitario continua sendo calculado automaticamente pelo sistema.",
    regras: "Monte a regra padrao de consumo que sera aplicada automaticamente aos servicos do catalogo.",
    catalogo: "Conecte servico, material e regra sem alterar a estrutura do calculo existente.",
    politicas: "Edite os textos e condicoes comerciais usados no orcamento e na ordem de servico.",
  };

  const dialogWidthClass =
    activeSection === "catalogo" || activeSection === "politicas"
      ? "max-w-2xl"
      : activeSection === "regras"
        ? "max-w-xl"
        : "max-w-lg";

  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie os dados base do seu sistema</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-5 gap-1 mb-6 h-auto">
          <TabsTrigger value="empresa" className="text-[11px] px-2 py-2.5 gap-1 flex-col sm:flex-row">
            <Building2 className="h-4 w-4" />
            <span className="truncate">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="materiais" className="text-[11px] px-2 py-2.5 gap-1 flex-col sm:flex-row">
            <Layers className="h-4 w-4" />
            <span className="truncate">Materiais</span>
          </TabsTrigger>
          <TabsTrigger value="regras" className="text-[11px] px-2 py-2.5 gap-1 flex-col sm:flex-row">
            <Calculator className="h-4 w-4" />
            <span className="truncate">Regras</span>
          </TabsTrigger>
          <TabsTrigger value="catalogo" className="text-[11px] px-2 py-2.5 gap-1 flex-col sm:flex-row">
            <BookOpen className="h-4 w-4" />
            <span className="truncate">Catálogo</span>
          </TabsTrigger>
          <TabsTrigger value="politicas" className="text-[11px] px-2 py-2.5 gap-1 flex-col sm:flex-row">
            <FileText className="h-4 w-4" />
            <span className="truncate">Políticas</span>
          </TabsTrigger>
        </TabsList>

        <Card className="mb-6 border-dashed bg-muted/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <currentTabMeta.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{currentTabMeta.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{currentTabMeta.description}</p>
                <p className="text-[11px] text-muted-foreground mt-2">{currentTabMeta.helper}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {tab === "empresa" && <MinhaEmpresaForm />}

        {tab !== "empresa" && isLoadingTech ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {tab === "materiais" && renderMateriaisTab()}
            {tab === "regras" && renderRegrasTab()}
            {tab === "catalogo" && renderCatalogoTab()}
            {tab === "politicas" && renderPoliticasTab()}
          </>
        )}
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn(dialogWidthClass, "max-h-[85vh] overflow-y-auto")}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {dialogDescription[activeSection]}
            </DialogDescription>
          </DialogHeader>
          {renderFormContent()}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
