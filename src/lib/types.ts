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
  nome: string;
  custoUnitario: number;
}

export interface ReceitaServico {
  id: string;
  nomeServico: string;
  divisorSuporte: number;
  divisorPU: number;
  multiplicadorRebite: number;
  dificuldadeFacil: number;
  dificuldadeMedia: number;
  dificuldadeDificil: number;
}

export type MotorType = 'motor1' | 'motor2';
export type Dificuldade = 'facil' | 'medio' | 'dificil';

export interface ItemServico {
  id: string;
  receitaId: string;
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
  qtdSuportes: number;
  qtdPU: number;
  qtdRebites: number;
  custoSuportes: number;
  custoPU: number;
  custoRebites: number;
  custoTotalInsumos: number;
  custoTotalObra: number;
  valorVenda: number;
}

export interface Orcamento {
  id: string;
  nomeCliente: string;
  itensServico: ItemServico[];
  custoTotalObra: number;
  valorVenda: number;
  dataCriacao: string;
}
