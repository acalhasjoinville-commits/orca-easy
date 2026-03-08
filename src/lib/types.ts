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
  motorPadrao: MotorType;
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
}

export type StatusOrcamento = 'pendente' | 'aprovado' | 'rejeitado' | 'executado';

export interface PoliticaComercial {
  id: string;
  nomePolitica: string;
  validadeDias: number;
  formasPagamento: string;
  garantia: string;
  tempoGarantia: string;
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
}

export interface Orcamento {
  id: string;
  numeroOrcamento: number;
  clienteId: string;
  nomeCliente: string;
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
}
