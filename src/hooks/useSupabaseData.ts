import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cliente, MinhaEmpresa, Orcamento, PoliticaComercial, ItemServico } from '@/lib/types';
import { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

// ─── MAPPERS ───

function dbToCliente(row: any): Cliente {
  return {
    id: row.id,
    tipo: row.tipo,
    nomeRazaoSocial: row.nome_razao_social,
    documento: row.documento || '',
    whatsapp: row.whatsapp || '',
    cep: row.cep || '',
    endereco: row.endereco || '',
    numero: row.numero || '',
    bairro: row.bairro || '',
    cidade: row.cidade || '',
  };
}

function clienteToDb(c: Cliente, empresaId: string) {
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

function dbToEmpresa(row: any): MinhaEmpresa {
  return {
    logoUrl: row.logo_url || '',
    nomeFantasia: row.nome_fantasia,
    razaoSocial: row.razao_social || '',
    cnpjCpf: row.cnpj_cpf || '',
    telefoneWhatsApp: row.telefone_whatsapp || '',
    emailContato: row.email_contato || '',
    endereco: row.endereco || '',
    numero: row.numero || '',
    bairro: row.bairro || '',
    cidade: row.cidade || '',
    estado: row.estado || '',
    corPrimaria: row.cor_primaria || '#0B1B32',
    corDestaque: row.cor_destaque || '#F57C00',
    slogan: row.slogan || '',
  };
}

function empresaToDb(e: MinhaEmpresa) {
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
    cor_primaria: e.corPrimaria,
    cor_destaque: e.corDestaque,
    logo_url: e.logoUrl,
    slogan: e.slogan,
  };
}

function dbToOrcamento(row: any): Orcamento {
  return {
    id: row.id,
    numeroOrcamento: row.numero_orcamento,
    clienteId: row.cliente_id || '',
    nomeCliente: row.nome_cliente,
    motorType: row.motor_type || undefined,
    itensServico: (row.itens_servico || []) as ItemServico[],
    custoTotalObra: Number(row.custo_total_obra),
    valorVenda: Number(row.valor_venda),
    desconto: Number(row.desconto),
    valorFinal: Number(row.valor_final),
    dataCriacao: row.data_criacao || row.created_at,
    status: row.status,
    validade: row.validade || '',
    descricaoGeral: row.descricao_geral || '',
    formasPagamento: row.formas_pagamento || '',
    garantia: row.garantia || '',
    tempoGarantia: row.tempo_garantia || '',
    // Snapshot fields — read as-is (null means legacy record)
    politicaComercialId: row.politica_comercial_id ?? null,
    validadeSnapshot: row.validade_snapshot ?? null,
    formasPagamentoSnapshot: row.formas_pagamento_snapshot ?? null,
    garantiaSnapshot: row.garantia_snapshot ?? null,
    tempoGarantiaSnapshot: row.tempo_garantia_snapshot ?? null,
    termoRecebimentoOsSnapshot: row.termo_recebimento_os_snapshot ?? null,
  };
}

function orcamentoToDb(o: Orcamento, empresaId: string) {
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
    empresa_id: empresaId,
    // Snapshot fields — persist final form state at save time
    politica_comercial_id: o.politicaComercialId ?? null,
    validade_snapshot: o.validadeSnapshot ?? null,
    formas_pagamento_snapshot: o.formasPagamentoSnapshot ?? null,
    garantia_snapshot: o.garantiaSnapshot ?? null,
    tempo_garantia_snapshot: o.tempoGarantiaSnapshot ?? null,
    termo_recebimento_os_snapshot: o.termoRecebimentoOsSnapshot ?? null,
  };
}

function dbToPolitica(row: any): PoliticaComercial {
  return {
    id: row.id,
    nomePolitica: row.nome_politica,
    validadeDias: row.validade_dias,
    formasPagamento: row.formas_pagamento || '',
    garantia: row.garantia || '',
    tempoGarantia: row.tempo_garantia || '',
    termoRecebimentoOs: row.termo_recebimento_os || '',
  };
}

function politicaToDb(p: PoliticaComercial, empresaId: string) {
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
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToCliente);
    },
  });

  const addCliente = useMutation({
    mutationFn: async (c: Cliente) => {
      if (!empresaId) throw new Error('Empresa não vinculada');
      const { error } = await supabase.from('clientes').insert(clienteToDb(c, empresaId));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });

  const updateCliente = useMutation({
    mutationFn: async (c: Cliente) => {
      if (!empresaId) throw new Error('Empresa não vinculada');
      const { error } = await supabase.from('clientes').update(clienteToDb(c, empresaId)).eq('id', c.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });

  const deleteCliente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });

  return { clientes: query.data || [], isLoading: query.isLoading, addCliente, updateCliente, deleteCliente };
}

export function useEmpresa() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['empresa'],
    queryFn: async () => {
      const { data, error } = await supabase.from('empresa').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data ? dbToEmpresa(data) : null;
    },
  });

  const saveEmpresa = useMutation({
    mutationFn: async (e: MinhaEmpresa) => {
      const { data: rows } = await supabase.from('empresa').select('id').limit(1);
      const existingId = rows && rows.length > 0 ? rows[0].id : null;
      if (existingId) {
        const { error } = await supabase.from('empresa').update(empresaToDb(e)).eq('id', existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('empresa').insert(empresaToDb(e));
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['empresa'] }),
  });

  return { empresa: query.data || null, isLoading: query.isLoading, saveEmpresa };
}

export function useOrcamentos() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const query = useQuery({
    queryKey: ['orcamentos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orcamentos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToOrcamento);
    },
  });

  const getNextNumero = async (): Promise<number> => {
    const { data } = await supabase.from('orcamentos').select('numero_orcamento').order('numero_orcamento', { ascending: false }).limit(1);
    if (data && data.length > 0) return Math.max(data[0].numero_orcamento + 1, 1001);
    return 1001;
  };

  const addOrcamento = useMutation({
    mutationFn: async (o: Orcamento) => {
      if (!empresaId) throw new Error('Empresa não vinculada');
      const { error } = await supabase.from('orcamentos').insert(orcamentoToDb(o, empresaId));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orcamentos'] }),
  });

  const updateOrcamento = useMutation({
    mutationFn: async (o: Orcamento) => {
      if (!empresaId) throw new Error('Empresa não vinculada');
      const { error } = await supabase.from('orcamentos').update(orcamentoToDb(o, empresaId)).eq('id', o.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orcamentos'] }),
  });

  const deleteOrcamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('orcamentos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orcamentos'] }),
  });

  return {
    orcamentos: query.data || [],
    isLoading: query.isLoading,
    getNextNumero,
    addOrcamento,
    updateOrcamento,
    deleteOrcamento,
  };
}

export function usePoliticas() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const query = useQuery({
    queryKey: ['politicas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('politicas_comerciais').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToPolitica);
    },
  });

  const addPolitica = useMutation({
    mutationFn: async (p: PoliticaComercial) => {
      if (!empresaId) throw new Error('Empresa não vinculada');
      const { error } = await supabase.from('politicas_comerciais').insert(politicaToDb(p, empresaId));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['politicas'] }),
  });

  const updatePolitica = useMutation({
    mutationFn: async (p: PoliticaComercial) => {
      if (!empresaId) throw new Error('Empresa não vinculada');
      const { error } = await supabase.from('politicas_comerciais').update(politicaToDb(p, empresaId)).eq('id', p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['politicas'] }),
  });

  const deletePolitica = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('politicas_comerciais').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['politicas'] }),
  });

  return { politicas: query.data || [], isLoading: query.isLoading, addPolitica, updatePolitica, deletePolitica };
}
