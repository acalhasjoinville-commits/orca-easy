import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Motor1Entry, Motor2Entry, InsumoEntry, RegraCalculo, ServicoTemplate, ItemRegra, MotorType } from '@/lib/types';
import { seedMotor1, seedMotor2, seedInsumos, seedRegras, seedServicos } from '@/lib/seedData';
import { Json } from '@/integrations/supabase/types';

// Cast to any to allow new tables not yet in generated types
const db = supabase as any;

// ─── MAPPERS ───

function dbToMotor1(row: any): Motor1Entry {
  return { id: row.id, material: row.material, densidade: Number(row.densidade), precoQuilo: Number(row.preco_quilo) };
}
function motor1ToDb(e: Motor1Entry) {
  return { id: e.id, material: e.material, densidade: e.densidade, preco_quilo: e.precoQuilo };
}

function dbToMotor2(row: any): Motor2Entry {
  return { id: row.id, material: row.material, espessura: Number(row.espessura), corte: Number(row.corte), precoMetroLinear: Number(row.preco_metro_linear) };
}
function motor2ToDb(e: Motor2Entry) {
  return { id: e.id, material: e.material, espessura: e.espessura, corte: e.corte, preco_metro_linear: e.precoMetroLinear };
}

function dbToInsumo(row: any): InsumoEntry {
  return { id: row.id, nomeEmbalagemCompra: row.nome_embalagem_compra, nomeUnidadeConsumo: row.nome_unidade_consumo, precoEmbalagem: Number(row.preco_embalagem), qtdEmbalagem: Number(row.qtd_embalagem) };
}
function insumoToDb(e: InsumoEntry) {
  return { id: e.id, nome_embalagem_compra: e.nomeEmbalagemCompra, nome_unidade_consumo: e.nomeUnidadeConsumo, preco_embalagem: e.precoEmbalagem, qtd_embalagem: e.qtdEmbalagem };
}

function dbToRegra(row: any): RegraCalculo {
  return { id: row.id, nomeRegra: row.nome_regra, itensRegra: (row.itens_regra || []) as ItemRegra[] };
}
function regraToDb(e: RegraCalculo) {
  return { id: e.id, nome_regra: e.nomeRegra, itens_regra: e.itensRegra as unknown as Json };
}

function dbToServico(row: any): ServicoTemplate {
  return {
    id: row.id, nomeServico: row.nome_servico, regraId: row.regra_id,
    motorPadrao: row.motor_padrao as MotorType, materialPadrao: row.material_padrao,
    espessuraPadrao: Number(row.espessura_padrao), cortePadrao: Number(row.corte_padrao),
    dificuldadeFacil: Number(row.dificuldade_facil), dificuldadeMedia: Number(row.dificuldade_media),
    dificuldadeDificil: Number(row.dificuldade_dificil),
  };
}
function servicoToDb(e: ServicoTemplate) {
  return {
    id: e.id, nome_servico: e.nomeServico, regra_id: e.regraId,
    motor_padrao: e.motorPadrao, material_padrao: e.materialPadrao,
    espessura_padrao: e.espessuraPadrao, corte_padrao: e.cortePadrao,
    dificuldade_facil: e.dificuldadeFacil, dificuldade_media: e.dificuldadeMedia,
    dificuldade_dificil: e.dificuldadeDificil,
  };
}

// ─── SEED HELPER ───

async function seedIfEmpty(table: string, seedData: any[], mapper: (row: any) => any) {
  const { count } = await (supabase as any).from(table).select('id', { count: 'exact', head: true });
  if ((count ?? 0) === 0 && seedData.length > 0) {
    const rows = seedData.map(mapper);
    await (supabase as any).from(table).insert(rows);
  }
}

// ─── HOOKS ───

export function useMotor1() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['motor1'],
    queryFn: async () => {
      await seedIfEmpty('motor1', seedMotor1, motor1ToDb);
      const { data, error } = await supabase.from('motor1').select('*').order('created_at');
      if (error) throw error;
      return (data || []).map(dbToMotor1);
    },
  });

  const addMotor1 = useMutation({
    mutationFn: async (e: Motor1Entry) => {
      const { error } = await supabase.from('motor1').insert(motor1ToDb(e));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['motor1'] }),
  });

  const updateMotor1 = useMutation({
    mutationFn: async (e: Motor1Entry) => {
      const { error } = await supabase.from('motor1').update(motor1ToDb(e)).eq('id', e.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['motor1'] }),
  });

  const deleteMotor1 = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('motor1').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['motor1'] }),
  });

  return { motor1: query.data || [], isLoading: query.isLoading, addMotor1, updateMotor1, deleteMotor1 };
}

export function useMotor2() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['motor2'],
    queryFn: async () => {
      await seedIfEmpty('motor2', seedMotor2, motor2ToDb);
      const { data, error } = await supabase.from('motor2').select('*').order('created_at');
      if (error) throw error;
      return (data || []).map(dbToMotor2);
    },
  });

  const addMotor2 = useMutation({
    mutationFn: async (e: Motor2Entry) => {
      const { error } = await supabase.from('motor2').insert(motor2ToDb(e));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['motor2'] }),
  });

  const updateMotor2 = useMutation({
    mutationFn: async (e: Motor2Entry) => {
      const { error } = await supabase.from('motor2').update(motor2ToDb(e)).eq('id', e.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['motor2'] }),
  });

  const deleteMotor2 = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('motor2').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['motor2'] }),
  });

  return { motor2: query.data || [], isLoading: query.isLoading, addMotor2, updateMotor2, deleteMotor2 };
}

export function useInsumos() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['insumos'],
    queryFn: async () => {
      await seedIfEmpty('insumos', seedInsumos, insumoToDb);
      const { data, error } = await supabase.from('insumos').select('*').order('created_at');
      if (error) throw error;
      return (data || []).map(dbToInsumo);
    },
  });

  const addInsumo = useMutation({
    mutationFn: async (e: InsumoEntry) => {
      const { error } = await supabase.from('insumos').insert(insumoToDb(e));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insumos'] }),
  });

  const updateInsumo = useMutation({
    mutationFn: async (e: InsumoEntry) => {
      const { error } = await supabase.from('insumos').update(insumoToDb(e)).eq('id', e.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insumos'] }),
  });

  const deleteInsumo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('insumos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insumos'] }),
  });

  return { insumos: query.data || [], isLoading: query.isLoading, addInsumo, updateInsumo, deleteInsumo };
}

export function useRegras() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['regras'],
    queryFn: async () => {
      await seedIfEmpty('regras_calculo', seedRegras, regraToDb);
      const { data, error } = await supabase.from('regras_calculo').select('*').order('created_at');
      if (error) throw error;
      return (data || []).map(dbToRegra);
    },
  });

  const addRegra = useMutation({
    mutationFn: async (e: RegraCalculo) => {
      const { error } = await supabase.from('regras_calculo').insert(regraToDb(e));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['regras'] }),
  });

  const updateRegra = useMutation({
    mutationFn: async (e: RegraCalculo) => {
      const { error } = await supabase.from('regras_calculo').update(regraToDb(e)).eq('id', e.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['regras'] }),
  });

  const deleteRegra = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('regras_calculo').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['regras'] }),
  });

  return { regras: query.data || [], isLoading: query.isLoading, addRegra, updateRegra, deleteRegra };
}

export function useServicos() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['servicos'],
    queryFn: async () => {
      await seedIfEmpty('servicos_catalogo', seedServicos, servicoToDb);
      const { data, error } = await supabase.from('servicos_catalogo').select('*').order('created_at');
      if (error) throw error;
      return (data || []).map(dbToServico);
    },
  });

  const addServico = useMutation({
    mutationFn: async (e: ServicoTemplate) => {
      const { error } = await supabase.from('servicos_catalogo').insert(servicoToDb(e));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicos'] }),
  });

  const updateServico = useMutation({
    mutationFn: async (e: ServicoTemplate) => {
      const { error } = await supabase.from('servicos_catalogo').update(servicoToDb(e)).eq('id', e.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicos'] }),
  });

  const deleteServico = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('servicos_catalogo').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicos'] }),
  });

  return { servicos: query.data || [], isLoading: query.isLoading, addServico, updateServico, deleteServico };
}
