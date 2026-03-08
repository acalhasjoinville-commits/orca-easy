import { Motor1Entry, Motor2Entry, InsumoEntry, RegraCalculo, ServicoTemplate } from './types';

export const seedMotor1: Motor1Entry[] = [
  { id: '1', material: 'Alumínio', densidade: 2.7, precoQuilo: 37.50 },
  { id: '2', material: 'Aço Galvanizado', densidade: 7.85, precoQuilo: 12.00 },
  { id: '3', material: 'Cobre', densidade: 8.96, precoQuilo: 85.00 },
];

export const seedMotor2: Motor2Entry[] = [
  { id: '1', material: 'Alumínio', espessura: 0.5, corte: 300, precoMetroLinear: 22.87 },
  { id: '2', material: 'Alumínio', espessura: 0.5, corte: 500, precoMetroLinear: 38.12 },
  { id: '3', material: 'Alumínio', espessura: 0.7, corte: 300, precoMetroLinear: 31.50 },
  { id: '4', material: 'Aço Galvanizado', espessura: 0.5, corte: 300, precoMetroLinear: 15.40 },
  { id: '5', material: 'Aço Galvanizado', espessura: 0.5, corte: 500, precoMetroLinear: 25.60 },
];

export const seedInsumos: InsumoEntry[] = [
  { id: '1', nome: 'PU Sachê 930g', custoUnitario: 29.00 },
  { id: '2', nome: 'Rebite 306', custoUnitario: 0.045 },
  { id: '3', nome: 'Suporte Normal', custoUnitario: 4.50 },
];

export const seedRegras: RegraCalculo[] = [
  { id: '1', nomeRegra: 'Beiral', divisorSuporte: 0.60, divisorPU: 30, multiplicadorRebite: 8 },
  { id: '2', nomeRegra: 'Rufo Pingadeira', divisorSuporte: 0, divisorPU: 30, multiplicadorRebite: 6 },
  { id: '3', nomeRegra: 'Rufo Encosto', divisorSuporte: 0, divisorPU: 25, multiplicadorRebite: 10 },
  { id: '4', nomeRegra: 'Americana', divisorSuporte: 0.50, divisorPU: 25, multiplicadorRebite: 10 },
];

export const seedServicos: ServicoTemplate[] = [
  {
    id: '1', nomeServico: 'Calha Beiral Alumínio 0.5mm',
    regraId: '1', motorPadrao: 'motor1', materialPadrao: 'Alumínio',
    espessuraPadrao: 0.5, cortePadrao: 300,
    dificuldadeFacil: 2.6, dificuldadeMedia: 3.5, dificuldadeDificil: 4.6,
  },
  {
    id: '2', nomeServico: 'Rufo Pingadeira Alumínio 0.5mm',
    regraId: '2', motorPadrao: 'motor1', materialPadrao: 'Alumínio',
    espessuraPadrao: 0.5, cortePadrao: 200,
    dificuldadeFacil: 2.4, dificuldadeMedia: 3.2, dificuldadeDificil: 4.2,
  },
  {
    id: '3', nomeServico: 'Rufo Encosto Galvanizado 0.5mm',
    regraId: '3', motorPadrao: 'motor2', materialPadrao: 'Aço Galvanizado',
    espessuraPadrao: 0.5, cortePadrao: 300,
    dificuldadeFacil: 2.8, dificuldadeMedia: 3.6, dificuldadeDificil: 4.8,
  },
  {
    id: '4', nomeServico: 'Calha Americana Alumínio 0.7mm',
    regraId: '4', motorPadrao: 'motor1', materialPadrao: 'Alumínio',
    espessuraPadrao: 0.7, cortePadrao: 500,
    dificuldadeFacil: 2.8, dificuldadeMedia: 3.8, dificuldadeDificil: 5.0,
  },
];
