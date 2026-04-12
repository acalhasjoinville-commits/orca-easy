export type TipoPessoa = "PF" | "PJ";

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

export type MetodoCalculo = "multiplicar" | "dividir";

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

export type MotorType = "motor1" | "motor2";
export type Dificuldade = "facil" | "medio" | "dificil";

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

export type StatusOrcamento = "pendente" | "aprovado" | "rejeitado" | "executado" | "cancelado";

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
  corPrimaria: string | null;
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
  dataPrevista?: string | null;
  dataFaturamento?: string | null;
  dataPagamento?: string | null;
  dataCancelamento?: string | null;
  // Commercial snapshot fields — frozen at save time, never recalculated
  politicaComercialId?: string | null;
  politicaNomeSnapshot?: string | null;
  validadeSnapshot?: string | null;
  formasPagamentoSnapshot?: string | null;
  garantiaSnapshot?: string | null;
  tempoGarantiaSnapshot?: string | null;
  termoRecebimentoOsSnapshot?: string | null;
}

export type TipoLancamento = "receita" | "despesa";

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
  "Material",
  "Combustível",
  "Folha / Salário",
  "Aluguel",
  "Ferramentas",
  "Impostos",
  "Serviços de Terceiros",
  "Administrativo",
  "Transporte",
  "Outros",
] as const;

export const CATEGORIAS_RECEITA = ["Receita Avulsa", "Entrada Manual", "Ajuste Positivo", "Outros"] as const;

// ─── FOLLOW-UP COMERCIAL ───

export type StatusFollowUp = "sem_retorno" | "agendado" | "em_negociacao" | "aguardando_cliente" | "concluido";
export type TipoInteracao =
  | "contato"
  | "retorno_agendado"
  | "negociacao"
  | "cliente_sem_resposta"
  | "aprovado"
  | "encerrado"
  | "observacao";

export interface OrcamentoFollowUp {
  id: string;
  orcamentoId: string;
  empresaId: string;
  statusFollowUp: StatusFollowUp;
  proximaAcao: string;
  dataRetorno: string | null;
  responsavelId: string | null;
  responsavelNome: string;
  ultimaInteracaoEm: string | null;
  observacoes: string;
}

export interface FollowUpLog {
  id: string;
  orcamentoId: string;
  empresaId: string;
  userId: string;
  userName: string;
  tipo: TipoInteracao;
  descricao: string;
  createdAt: string;
}

export const STATUS_FOLLOWUP_CONFIG: Record<StatusFollowUp, { label: string; color: string }> = {
  sem_retorno: { label: "Sem retorno", color: "bg-gray-500/15 text-gray-600 border-gray-500/30" },
  agendado: { label: "Agendado", color: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  em_negociacao: { label: "Em negociação", color: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  aguardando_cliente: { label: "Aguardando cliente", color: "bg-purple-500/15 text-purple-700 border-purple-500/30" },
  concluido: { label: "Concluído", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
};

export const TIPO_INTERACAO_CONFIG: Record<TipoInteracao, { label: string }> = {
  contato: { label: "Contato realizado" },
  retorno_agendado: { label: "Retorno agendado" },
  negociacao: { label: "Negociação" },
  cliente_sem_resposta: { label: "Cliente sem resposta" },
  aprovado: { label: "Aprovado" },
  encerrado: { label: "Encerrado" },
  observacao: { label: "Observação" },
};

// VISITAS (pré-orçamento)

export type StatusVisita = "agendada" | "realizada" | "cancelada" | "reagendada";

export interface Visita {
  id: string;
  empresaId: string;
  nomeCliente: string;
  telefone: string;
  enderecoCompleto: string;
  bairro: string;
  cidade: string;
  complemento: string;
  pontoReferencia: string;
  tipoServico: string;
  observacoes: string;
  responsavelId: string | null;
  responsavelNome: string;
  origemContato: string;
  dataVisita: string;
  horaVisita: string;
  status: StatusVisita;
  clienteId: string | null;
  orcamentoId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_VISITA_CONFIG: Record<StatusVisita, { label: string; color: string }> = {
  agendada: { label: "Agendada", color: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  realizada: { label: "Realizada", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  cancelada: { label: "Cancelada", color: "bg-red-500/15 text-red-600 border-red-500/30" },
  reagendada: { label: "Reagendada", color: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
};

// RETORNOS DO SERVIÇO (pós-execução)

export type StatusRetorno = "aberto" | "agendado" | "em_atendimento" | "resolvido" | "encerrado" | "cancelado";
export type TipoRetorno = "garantia" | "ajuste" | "reclamacao" | "vistoria" | "manutencao" | "outro";

export interface RetornoServico {
  id: string;
  empresaId: string;
  orcamentoId: string;
  tipo: TipoRetorno;
  status: StatusRetorno;
  descricao: string;
  dataRetorno: string | null;
  horaRetorno: string | null;
  responsavelId: string | null;
  responsavelNome: string;
  observacoes: string;
  resolucao: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_RETORNO_CONFIG: Record<StatusRetorno, { label: string; color: string }> = {
  aberto: { label: "Aberto", color: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  agendado: { label: "Agendado", color: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  em_atendimento: { label: "Em atendimento", color: "bg-purple-500/15 text-purple-700 border-purple-500/30" },
  resolvido: { label: "Resolvido", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  encerrado: { label: "Encerrado", color: "bg-gray-500/15 text-gray-600 border-gray-500/30" },
  cancelado: { label: "Cancelado", color: "bg-red-500/15 text-red-600 border-red-500/30" },
};

export const TIPO_RETORNO_CONFIG: Record<TipoRetorno, { label: string }> = {
  garantia: { label: "Garantia" },
  ajuste: { label: "Ajuste" },
  reclamacao: { label: "Reclamação" },
  vistoria: { label: "Vistoria" },
  manutencao: { label: "Manutenção" },
  outro: { label: "Outro" },
};
