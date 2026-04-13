import { Motor1Entry, Motor2Entry, InsumoEntry, RegraCalculo, ServicoTemplate, PoliticaComercial } from './types';

// ─── UUID constants for cross-references ───
const MOTOR1_IDS = {
  aluminio: '10000000-0000-0000-0000-000000000001',
  acoGalvanizado: '10000000-0000-0000-0000-000000000002',
  cobre: '10000000-0000-0000-0000-000000000003',
};

const MOTOR2_IDS = {
  alu05_300: '20000000-0000-0000-0000-000000000001',
  alu05_500: '20000000-0000-0000-0000-000000000002',
  alu07_300: '20000000-0000-0000-0000-000000000003',
  aco05_300: '20000000-0000-0000-0000-000000000004',
  aco05_500: '20000000-0000-0000-0000-000000000005',
};

const INSUMO_IDS = {
  tuboPU: '30000000-0000-0000-0000-000000000001',
  rebite306: '30000000-0000-0000-0000-000000000002',
  suporteNormal: '30000000-0000-0000-0000-000000000003',
};

const REGRA_IDS = {
  beiral: '40000000-0000-0000-0000-000000000001',
  rufoPingadeira: '40000000-0000-0000-0000-000000000002',
  rufoEncosto: '40000000-0000-0000-0000-000000000003',
  americana: '40000000-0000-0000-0000-000000000004',
};

const SERVICO_IDS = {
  calhaBeiral: '50000000-0000-0000-0000-000000000001',
  rufoPingadeira: '50000000-0000-0000-0000-000000000002',
  rufoEncosto: '50000000-0000-0000-0000-000000000003',
  calhaAmericana: '50000000-0000-0000-0000-000000000004',
};

const POLITICA_IDS = {
  residencial: '60000000-0000-0000-0000-000000000001',
  condominio: '60000000-0000-0000-0000-000000000002',
};

// ─── SEED DATA ───

export const seedMotor1: Motor1Entry[] = [
  { id: MOTOR1_IDS.aluminio, material: 'Alumínio', densidade: 2.7, precoQuilo: 37.50 },
  { id: MOTOR1_IDS.acoGalvanizado, material: 'Aço Galvanizado', densidade: 7.85, precoQuilo: 12.00 },
  { id: MOTOR1_IDS.cobre, material: 'Cobre', densidade: 8.96, precoQuilo: 85.00 },
];

export const seedMotor2: Motor2Entry[] = [
  { id: MOTOR2_IDS.alu05_300, material: 'Alumínio', espessura: 0.5, corte: 300, precoMetroLinear: 22.87 },
  { id: MOTOR2_IDS.alu05_500, material: 'Alumínio', espessura: 0.5, corte: 500, precoMetroLinear: 38.12 },
  { id: MOTOR2_IDS.alu07_300, material: 'Alumínio', espessura: 0.7, corte: 300, precoMetroLinear: 31.50 },
  { id: MOTOR2_IDS.aco05_300, material: 'Aço Galvanizado', espessura: 0.5, corte: 300, precoMetroLinear: 15.40 },
  { id: MOTOR2_IDS.aco05_500, material: 'Aço Galvanizado', espessura: 0.5, corte: 500, precoMetroLinear: 25.60 },
];

export const seedInsumos: InsumoEntry[] = [
  { id: INSUMO_IDS.tuboPU, nomeEmbalagemCompra: 'Tubo PU 930g', nomeUnidadeConsumo: 'Tubo de PU', precoEmbalagem: 29.00, qtdEmbalagem: 1 },
  { id: INSUMO_IDS.rebite306, nomeEmbalagemCompra: 'Caixa Rebite 306 c/ 1000', nomeUnidadeConsumo: 'Rebite 306 un.', precoEmbalagem: 45.00, qtdEmbalagem: 1000 },
  { id: INSUMO_IDS.suporteNormal, nomeEmbalagemCompra: 'Suporte Normal un.', nomeUnidadeConsumo: 'Suporte Normal', precoEmbalagem: 4.50, qtdEmbalagem: 1 },
];

export const seedRegras: RegraCalculo[] = [
  {
    id: REGRA_IDS.beiral, nomeRegra: 'Beiral',
    itensRegra: [
      { id: 'r1i1', insumoId: INSUMO_IDS.suporteNormal, metodoCalculo: 'dividir', fator: 0.60 },
      { id: 'r1i2', insumoId: INSUMO_IDS.tuboPU, metodoCalculo: 'dividir', fator: 30 },
      { id: 'r1i3', insumoId: INSUMO_IDS.rebite306, metodoCalculo: 'multiplicar', fator: 8 },
    ],
  },
  {
    id: REGRA_IDS.rufoPingadeira, nomeRegra: 'Rufo Pingadeira',
    itensRegra: [
      { id: 'r2i1', insumoId: INSUMO_IDS.tuboPU, metodoCalculo: 'dividir', fator: 30 },
      { id: 'r2i2', insumoId: INSUMO_IDS.rebite306, metodoCalculo: 'multiplicar', fator: 6 },
    ],
  },
  {
    id: REGRA_IDS.rufoEncosto, nomeRegra: 'Rufo Encosto',
    itensRegra: [
      { id: 'r3i1', insumoId: INSUMO_IDS.tuboPU, metodoCalculo: 'dividir', fator: 25 },
      { id: 'r3i2', insumoId: INSUMO_IDS.rebite306, metodoCalculo: 'multiplicar', fator: 10 },
    ],
  },
  {
    id: REGRA_IDS.americana, nomeRegra: 'Americana',
    itensRegra: [
      { id: 'r4i1', insumoId: INSUMO_IDS.suporteNormal, metodoCalculo: 'dividir', fator: 0.50 },
      { id: 'r4i2', insumoId: INSUMO_IDS.tuboPU, metodoCalculo: 'dividir', fator: 25 },
      { id: 'r4i3', insumoId: INSUMO_IDS.rebite306, metodoCalculo: 'multiplicar', fator: 10 },
    ],
  },
];

export const seedServicos: ServicoTemplate[] = [
  {
    id: SERVICO_IDS.calhaBeiral, nomeServico: 'Calha Beiral Alumínio 0.5mm',
    regraId: REGRA_IDS.beiral, motorType: 'motor1',
    materialPadrao: 'Alumínio', espessuraPadrao: 0.5, cortePadrao: 300,
    dificuldadeFacil: 2.6, dificuldadeMedia: 3.5, dificuldadeDificil: 4.6,
    tipoServico: 'motor', modoCobranca: 'motor', valorBase: 0, unidadeCobranca: '', custoBaseInterno: null,
  },
  {
    id: SERVICO_IDS.rufoPingadeira, nomeServico: 'Rufo Pingadeira Alumínio 0.5mm',
    regraId: REGRA_IDS.rufoPingadeira, motorType: 'motor1',
    materialPadrao: 'Alumínio', espessuraPadrao: 0.5, cortePadrao: 200,
    dificuldadeFacil: 2.4, dificuldadeMedia: 3.2, dificuldadeDificil: 4.2,
    tipoServico: 'motor', modoCobranca: 'motor', valorBase: 0, unidadeCobranca: '', custoBaseInterno: null,
  },
  {
    id: SERVICO_IDS.rufoEncosto, nomeServico: 'Rufo Encosto Galvanizado 0.5mm',
    regraId: REGRA_IDS.rufoEncosto, motorType: 'motor2',
    materialPadrao: 'Aço Galvanizado', espessuraPadrao: 0.5, cortePadrao: 300,
    dificuldadeFacil: 2.8, dificuldadeMedia: 3.6, dificuldadeDificil: 4.8,
    tipoServico: 'motor', modoCobranca: 'motor', valorBase: 0, unidadeCobranca: '', custoBaseInterno: null,
  },
  {
    id: SERVICO_IDS.calhaAmericana, nomeServico: 'Calha Americana Alumínio 0.7mm',
    regraId: REGRA_IDS.americana, motorType: 'motor1',
    materialPadrao: 'Alumínio', espessuraPadrao: 0.7, cortePadrao: 500,
    dificuldadeFacil: 2.8, dificuldadeMedia: 3.8, dificuldadeDificil: 5.0,
    tipoServico: 'motor', modoCobranca: 'motor', valorBase: 0, unidadeCobranca: '', custoBaseInterno: null,
  },
];

export const seedPoliticas: PoliticaComercial[] = [
  {
    id: POLITICA_IDS.residencial,
    nomePolitica: 'Padrão Residencial',
    validadeDias: 15,
    formasPagamento: '50% na aprovação + 50% na conclusão. PIX, transferência ou dinheiro.',
    garantia: '5 anos contra defeitos de fabricação e instalação, exceto mau uso.',
    tempoGarantia: '5 anos',
    termoRecebimentoOs: 'CONCLUÍDO: Declaro que, nesta data, os serviços acima descritos foram conferidos, executados e entregues em perfeitas condições.',
  },
  {
    id: POLITICA_IDS.condominio,
    nomePolitica: 'Padrão Condomínio',
    validadeDias: 30,
    formasPagamento: '30% na aprovação + 40% no início da obra + 30% na conclusão. Boleto, PIX ou transferência.',
    garantia: '5 anos contra defeitos de fabricação e instalação. Manutenção preventiva semestral recomendada.',
    tempoGarantia: '5 anos',
    termoRecebimentoOs: 'CONCLUÍDO: Declaro que, nesta data, os serviços acima descritos foram conferidos, executados e entregues em perfeitas condições.',
  },
];
