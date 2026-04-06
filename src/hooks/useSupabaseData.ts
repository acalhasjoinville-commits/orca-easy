import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Cliente,
  MinhaEmpresa,
  Orcamento,
  PoliticaComercial,
  ItemServico,
  MotorType,
  StatusOrcamento,
  TipoPessoa,
} from "@/lib/types";
import { Json, Tables, TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

type ClienteRow = Tables<"clientes">;
type ClienteInsert = TablesInsert<"clientes">;
type EmpresaRow = Tables<"empresa">;
type EmpresaInsert = TablesInsert<"empresa">;
type OrcamentoRow = Tables<"orcamentos">;
type OrcamentoInsert = TablesInsert<"orcamentos">;
type PoliticaRow = Tables<"politicas_comerciais">;
type PoliticaInsert = TablesInsert<"politicas_comerciais">;

function toTipoPessoa(value: string): TipoPessoa {
  return value === "PJ" ? "PJ" : "PF";
}

function toMotorType(value: string | null): MotorType | undefined {
  return value === "motor1" || value === "motor2" ? value : undefined;
}

function toStatusOrcamento(value: string): StatusOrcamento {
  if (value === "aprovado" || value === "rejeitado" || value === "executado" || value === "cancelado") {
    return value;
  }

  return "pendente";
}

function toItensServico(value: Json): ItemServico[] {
  return Array.isArray(value) ? (value as unknown as ItemServico[]) : [];
}

// ─── MAPPERS ───

function dbToCliente(row: ClienteRow): Cliente {
  return {
    id: row.id,
    tipo: toTipoPessoa(row.tipo),
    nomeRazaoSocial: row.nome_razao_social,
    documento: row.documento || "",
    whatsapp: row.whatsapp || "",
    cep: row.cep || "",
    endereco: row.endereco || "",
    numero: row.numero || "",
    bairro: row.bairro || "",
    cidade: row.cidade || "",
  };
}

function clienteToDb(c: Cliente, empresaId: string): ClienteInsert {
  return {
    id: c.id,
    tipo: c.tipo,
    nome_razao_social: c.nomeRazaoSocial,
    documento: c.documento,
    whatsapp: c.whatsapp,
    cep: c.cep,
    endereco: c.endereco,
    numero: c.numero,
    bairro: c.bairro,
    cidade: c.cidade,
    empresa_id: empresaId,
  };
}

function dbToEmpresa(row: EmpresaRow): MinhaEmpresa {
  return {
    logoUrl: row.logo_url || "",
    nomeFantasia: row.nome_fantasia,
    razaoSocial: row.razao_social || "",
    cnpjCpf: row.cnpj_cpf || "",
    telefoneWhatsApp: row.telefone_whatsapp || "",
    emailContato: row.email_contato || "",
    endereco: row.endereco || "",
    numero: row.numero || "",
    bairro: row.bairro || "",
    cidade: row.cidade || "",
    estado: row.estado || "",
    corPrimaria: row.cor_primaria || "#0B1B32",
    corDestaque: row.cor_destaque || "#5866D6",
    slogan: row.slogan || "",
  };
}

function empresaToDb(e: MinhaEmpresa): EmpresaInsert {
  return {
    nome_fantasia: e.nomeFantasia,
    razao_social: e.razaoSocial,
    cnpj_cpf: e.cnpjCpf,
    telefone_whatsapp: e.telefoneWhatsApp,
    email_contato: e.emailContato,
    endereco: e.endereco,
    numero: e.numero,
    bairro: e.bairro,
    cidade: e.cidade,
    estado: e.estado,
    cor_primaria: e.corPrimaria || "#0B1B32",
    cor_destaque: e.corDestaque,
    logo_url: e.logoUrl,
    slogan: e.slogan,
  };
}

function dbToOrcamento(row: OrcamentoRow): Orcamento {
  return {
    id: row.id,
    numeroOrcamento: row.numero_orcamento,
    clienteId: row.cliente_id || "",
    nomeCliente: row.nome_cliente,
    motorType: toMotorType(row.motor_type),
    itensServico: toItensServico(row.itens_servico),
    custoTotalObra: Number(row.custo_total_obra),
    valorVenda: Number(row.valor_venda),
    desconto: Number(row.desconto),
    valorFinal: Number(row.valor_final),
    dataCriacao: row.data_criacao || row.created_at,
    status: toStatusOrcamento(row.status),
    validade: row.validade || "",
    descricaoGeral: row.descricao_geral || "",
    formasPagamento: row.formas_pagamento || "",
    garantia: row.garantia || "",
    tempoGarantia: row.tempo_garantia || "",
    dataExecucao: row.data_execucao ?? null,
    dataPrevista: row.data_prevista ?? null,
    dataFaturamento: row.data_faturamento ?? null,
    dataPagamento: row.data_pagamento ?? null,
    dataCancelamento: row.data_cancelamento ?? null,
    // Snapshot fields — read as-is (null means legacy record)
    politicaComercialId: row.politica_comercial_id ?? null,
    politicaNomeSnapshot: row.politica_nome_snapshot ?? null,
    validadeSnapshot: row.validade_snapshot ?? null,
    formasPagamentoSnapshot: row.formas_pagamento_snapshot ?? null,
    garantiaSnapshot: row.garantia_snapshot ?? null,
    tempoGarantiaSnapshot: row.tempo_garantia_snapshot ?? null,
    termoRecebimentoOsSnapshot: row.termo_recebimento_os_snapshot ?? null,
  };
}

function orcamentoToDb(o: Orcamento, empresaId: string): OrcamentoInsert {
  return {
    id: o.id,
    numero_orcamento: o.numeroOrcamento,
    cliente_id: o.clienteId || null,
    nome_cliente: o.nomeCliente,
    motor_type: o.motorType || null,
    itens_servico: o.itensServico as unknown as Json,
    custo_total_obra: o.custoTotalObra,
    valor_venda: o.valorVenda,
    desconto: o.desconto,
    valor_final: o.valorFinal,
    data_criacao: o.dataCriacao,
    status: o.status,
    validade: o.validade,
    descricao_geral: o.descricaoGeral,
    formas_pagamento: o.formasPagamento,
    garantia: o.garantia,
    tempo_garantia: o.tempoGarantia,
    data_execucao: o.dataExecucao ?? null,
    data_prevista: o.dataPrevista ?? null,
    data_faturamento: o.dataFaturamento ?? null,
    data_pagamento: o.dataPagamento ?? null,
    data_cancelamento: o.dataCancelamento ?? null,
    empresa_id: empresaId,
    // Snapshot fields — persist final form state at save time
    politica_comercial_id: o.politicaComercialId ?? null,
    politica_nome_snapshot: o.politicaNomeSnapshot ?? null,
    validade_snapshot: o.validadeSnapshot ?? null,
    formas_pagamento_snapshot: o.formasPagamentoSnapshot ?? null,
    garantia_snapshot: o.garantiaSnapshot ?? null,
    tempo_garantia_snapshot: o.tempoGarantiaSnapshot ?? null,
    termo_recebimento_os_snapshot: o.termoRecebimentoOsSnapshot ?? null,
  };
}

function dbToPolitica(row: PoliticaRow): PoliticaComercial {
  return {
    id: row.id,
    nomePolitica: row.nome_politica,
    validadeDias: row.validade_dias,
    formasPagamento: row.formas_pagamento || "",
    garantia: row.garantia || "",
    tempoGarantia: row.tempo_garantia || "",
    termoRecebimentoOs: row.termo_recebimento_os || "",
  };
}

function politicaToDb(p: PoliticaComercial, empresaId: string): PoliticaInsert {
  return {
    id: p.id,
    nome_politica: p.nomePolitica,
    validade_dias: p.validadeDias,
    formas_pagamento: p.formasPagamento,
    garantia: p.garantia,
    tempo_garantia: p.tempoGarantia,
    termo_recebimento_os: p.termoRecebimentoOs,
    empresa_id: empresaId,
  };
}

// ─── HOOKS ───

export function useClientes() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const query = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToCliente);
    },
  });

  const addCliente = useMutation({
    mutationFn: async (c: Cliente) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { data, error } = await supabase.from("clientes").insert(clienteToDb(c, empresaId)).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });

  const updateCliente = useMutation({
    mutationFn: async (c: Cliente) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await supabase.from("clientes").update(clienteToDb(c, empresaId)).eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });

  const deleteCliente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });

  return { clientes: query.data || [], isLoading: query.isLoading, addCliente, updateCliente, deleteCliente };
}

export function useEmpresa() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();

  const query = useQuery({
    queryKey: ["empresa", empresaId],
    queryFn: async () => {
      if (!empresaId) return null;
      const { data, error } = await supabase
        .from("empresa")
        .select("*")
        .eq("id", empresaId)
        .maybeSingle();
      if (error) throw error;
      return data ? dbToEmpresa(data) : null;
    },
    enabled: !!empresaId,
  });

  const saveEmpresa = useMutation({
    mutationFn: async (e: MinhaEmpresa) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { data: existing } = await supabase
        .from("empresa")
        .select("id")
        .eq("id", empresaId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase.from("empresa").update(empresaToDb(e)).eq("id", empresaId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("empresa").insert({ ...empresaToDb(e), id: empresaId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empresa", empresaId] }),
  });

  return { empresa: query.data || null, isLoading: query.isLoading, saveEmpresa };
}

export function useOrcamentos() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const query = useQuery({
    queryKey: ["orcamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orcamentos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToOrcamento);
    },
  });

  const getNextNumero = async (): Promise<number> => {
    // Number is generated atomically by the database, not the frontend.
    // The RPC derives empresa_id from auth.uid() — no frontend parameter needed.
    const { data, error } = await supabase.rpc("next_orcamento_number");
    if (error) throw new Error("Falha ao gerar número do orçamento: " + error.message);
    return data as number;
  };

  const addOrcamento = useMutation({
    mutationFn: async (o: Orcamento) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await supabase.from("orcamentos").insert(orcamentoToDb(o, empresaId));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orcamentos"] }),
  });

  const updateOrcamento = useMutation({
    mutationFn: async (o: Orcamento) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await supabase.from("orcamentos").update(orcamentoToDb(o, empresaId)).eq("id", o.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orcamentos"] }),
  });

  return {
    orcamentos: query.data || [],
    isLoading: query.isLoading,
    getNextNumero,
    addOrcamento,
    updateOrcamento,
  };
}

export function usePoliticas() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const query = useQuery({
    queryKey: ["politicas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("politicas_comerciais")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToPolitica);
    },
  });

  const addPolitica = useMutation({
    mutationFn: async (p: PoliticaComercial) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await supabase.from("politicas_comerciais").insert(politicaToDb(p, empresaId));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["politicas"] }),
  });

  const updatePolitica = useMutation({
    mutationFn: async (p: PoliticaComercial) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await supabase.from("politicas_comerciais").update(politicaToDb(p, empresaId)).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["politicas"] }),
  });

  const deletePolitica = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("politicas_comerciais").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["politicas"] }),
  });

  return { politicas: query.data || [], isLoading: query.isLoading, addPolitica, updatePolitica, deletePolitica };
}
