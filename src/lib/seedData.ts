import { Motor1Entry, Motor2Entry, InsumoEntry, RegraCalculo, ServicoTemplate, PoliticaComercial } from './types';

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
  { id: '1', nomeEmbalagemCompra: 'Tubo PU 930g', nomeUnidadeConsumo: 'Tubo de PU', precoEmbalagem: 29.00, qtdEmbalagem: 1 },
  { id: '2', nomeEmbalagemCompra: 'Caixa Rebite 306 c/ 1000', nomeUnidadeConsumo: 'Rebite 306 un.', precoEmbalagem: 45.00, qtdEmbalagem: 1000 },
  { id: '3', nomeEmbalagemCompra: 'Suporte Normal un.', nomeUnidadeConsumo: 'Suporte Normal', precoEmbalagem: 4.50, qtdEmbalagem: 1 },
];

export const seedRegras: RegraCalculo[] = [
  {
    id: '1', nomeRegra: 'Beiral',
    itensRegra: [
      { id: 'r1i1', insumoId: '3', metodoCalculo: 'dividir', fator: 0.60 },
      { id: 'r1i2', insumoId: '1', metodoCalculo: 'dividir', fator: 30 },
      { id: 'r1i3', insumoId: '2', metodoCalculo: 'multiplicar', fator: 8 },
    ],
  },
  {
    id: '2', nomeRegra: 'Rufo Pingadeira',
    itensRegra: [
      { id: 'r2i1', insumoId: '1', metodoCalculo: 'dividir', fator: 30 },
      { id: 'r2i2', insumoId: '2', metodoCalculo: 'multiplicar', fator: 6 },
    ],
  },
  {
    id: '3', nomeRegra: 'Rufo Encosto',
    itensRegra: [
      { id: 'r3i1', insumoId: '1', metodoCalculo: 'dividir', fator: 25 },
      { id: 'r3i2', insumoId: '2', metodoCalculo: 'multiplicar', fator: 10 },
    ],
  },
  {
    id: '4', nomeRegra: 'Americana',
    itensRegra: [
      { id: 'r4i1', insumoId: '3', metodoCalculo: 'dividir', fator: 0.50 },
      { id: 'r4i2', insumoId: '1', metodoCalculo: 'dividir', fator: 25 },
      { id: 'r4i3', insumoId: '2', metodoCalculo: 'multiplicar', fator: 10 },
    ],
  },
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

export const seedPoliticas: PoliticaComercial[] = [
  {
    id: '1',
    nomePolitica: 'Padrão Residencial',
    validadeDias: 15,
    formasPagamento: '50% na aprovação + 50% na conclusão. PIX, transferência ou dinheiro.',
    garantia: '5 anos contra defeitos de fabricação e instalação, exceto mau uso.',
    tempoGarantia: '5 anos',
    termoRecebimentoOs: 'CONCLUÍDO: Declaro que, nesta data, os serviços acima descritos foram conferidos, executados e entregues em perfeitas condições.',
  },
  {
    id: '2',
    nomePolitica: 'Padrão Condomínio',
    validadeDias: 30,
    formasPagamento: '30% na aprovação + 40% no início da obra + 30% na conclusão. Boleto, PIX ou transferência.',
    garantia: '5 anos contra defeitos de fabricação e instalação. Manutenção preventiva semestral recomendada.',
    tempoGarantia: '5 anos',
  },
];
