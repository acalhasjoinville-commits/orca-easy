export type TipoPessoa = 'PF' | 'PJ';

export interface Cliente {
  id: string;
  tipo: TipoPessoa;
  nomeRazaoSocial: string;
  documento: string;
  whatsapp: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
}

export interface Motor1Entry {
  id: string;
  material: string;
  densidade: number;
  precoQuilo: number;
}

export interface Motor2Entry {
  id: string;
  material: string;
  espessura: number;
  corte: number;
  precoMetroLinear: number;
}

export interface InsumoEntry {
  id: string;
  nomeEmbalagemCompra: string;
  nomeUnidadeConsumo: string;
  precoEmbalagem: number;
  qtdEmbalagem: number;
}

// Computed getter
export function getCustoUnitario(insumo: InsumoEntry): number {
  return insumo.qtdEmbalagem > 0 ? insumo.precoEmbalagem / insumo.qtdEmbalagem : 0;
}

export type MetodoCalculo = 'multiplicar' | 'dividir';

export interface ItemRegra {
  id: string;
  insumoId: string;
  metodoCalculo: MetodoCalculo;
  fator: number;
}

export interface RegraCalculo {
  id: string;
  nomeRegra: string;
  itensRegra: ItemRegra[];
}

export interface ServicoTemplate {
  id: string;
  nomeServico: string;
  regraId: string;
  motorType: MotorType;
  materialPadrao: string;
  espessuraPadrao: number;
  cortePadrao: number;
  dificuldadeFacil: number;
  dificuldadeMedia: number;
  dificuldadeDificil: number;
}

export type MotorType = 'motor1' | 'motor2';
export type Dificuldade = 'facil' | 'medio' | 'dificil';

export interface InsumoCalculado {
  insumoId: string;
  nomeInsumo: string;
  quantidade: number;
  custoUnitario: number;
  custoTotal: number;
}

export interface ItemServico {
  id: string;
  servicoTemplateId: string;
  nomeServico: string;
  motorType: MotorType;
  materialId: string;
  espessura: number;
  corte: number;
  metragem: number;
  dificuldade: Dificuldade;
  fatorDificuldade: number;
  custoMetroLinear: number;
  custoTotalMaterial: number;
  insumosCalculados: InsumoCalculado[];
  custoTotalInsumos: number;
  custoTotalObra: number;
  valorVenda: number;
  /** Manual overrides: insumoId → quantidade. Only present when user explicitly changed a quantity. */
  insumosOverrides?: Record<string, number>;
}

export type StatusOrcamento = 'pendente' | 'aprovado' | 'rejeitado' | 'executado';

export interface PoliticaComercial {
  id: string;
  nomePolitica: string;
  validadeDias: number;
  formasPagamento: string;
  garantia: string;
  tempoGarantia: string;
  termoRecebimentoOs: string;
}

export interface MinhaEmpresa {
  logoUrl: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpjCpf: string;
  telefoneWhatsApp: string;
  emailContato: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  corPrimaria: string;
  corDestaque: string;
  slogan: string;
}

export interface Orcamento {
  id: string;
  numeroOrcamento: number;
  clienteId: string;
  nomeCliente: string;
  motorType?: MotorType;
  itensServico: ItemServico[];
  custoTotalObra: number;
  valorVenda: number;
  desconto: number;
  valorFinal: number;
  dataCriacao: string;
  status: StatusOrcamento;
  validade: string;
  descricaoGeral: string;
  formasPagamento: string;
  garantia: string;
  tempoGarantia: string;
  dataExecucao?: string | null;
  // Commercial snapshot fields — frozen at save time, never recalculated
  politicaComercialId?: string | null;
  politicaNomeSnapshot?: string | null;
  validadeSnapshot?: string | null;
  formasPagamentoSnapshot?: string | null;
  garantiaSnapshot?: string | null;
  tempoGarantiaSnapshot?: string | null;
  termoRecebimentoOsSnapshot?: string | null;
}

export type TipoLancamento = 'receita' | 'despesa';

export interface LancamentoFinanceiro {
  id: string;
  empresaId: string;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  observacao: string;
  origem: string;
}

export const CATEGORIAS_DESPESA = [
  'Material',
  'Combustível',
  'Folha / Salário',
  'Aluguel',
  'Ferramentas',
  'Impostos',
  'Serviços de Terceiros',
  'Administrativo',
  'Transporte',
  'Outros',
] as const;

export const CATEGORIAS_RECEITA = [
  'Receita Avulsa',
  'Entrada Manual',
  'Ajuste Positivo',
  'Outros',
] as const;
