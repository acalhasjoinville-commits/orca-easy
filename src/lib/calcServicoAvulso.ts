import { ServicoTemplate, ItemServico, InsumoCalculado, InsumoEntry, RegraCalculo, Dificuldade, ModoCobranca } from './types';
import { calcInsumosDinamicos, getFatorDificuldade } from './calcEngine';

export interface CalcAvulsoResult {
  custoTotalMaterial: number;
  custoMetroLinear: number;
  insumosCalc: InsumoCalculado[];
  custoTotalInsumos: number;
  custoTotalObra: number;
  valorVenda: number;
  fatorDificuldade: number;
  custoIncompleto: boolean;
}

/**
 * Calculate a standalone (avulso) service.
 * - valor_fechado: fixed price, no rule, no difficulty
 * - por_unidade: qty × unit price, no rule, no difficulty
 * - por_metro: metragem × price/m + rule-based consumables × difficulty
 */
export function calcServicoAvulso(
  servico: ServicoTemplate,
  opts: {
    modo: ModoCobranca;
    valorInformado: number;         // for valor_fechado: total price; for por_unidade: unit price; for por_metro: price/m
    quantidade: number;             // for por_unidade: quantity; for por_metro: metragem
    custoInternoInformado?: number | null;
    dificuldade?: Dificuldade;
    regra?: RegraCalculo | null;
    insumosList?: InsumoEntry[];
  },
): CalcAvulsoResult {
  const { modo, valorInformado, quantidade, custoInternoInformado, dificuldade, regra, insumosList } = opts;

  if (modo === 'valor_fechado') {
    const custoIncompleto = custoInternoInformado == null;
    const custoReal = custoInternoInformado ?? 0;
    return {
      custoTotalMaterial: 0,
      custoMetroLinear: 0,
      insumosCalc: [],
      custoTotalInsumos: 0,
      custoTotalObra: custoReal,
      valorVenda: valorInformado,
      fatorDificuldade: 1,
      custoIncompleto,
    };
  }

  if (modo === 'por_unidade') {
    const custoIncompleto = custoInternoInformado == null;
    const custoReal = custoInternoInformado != null ? custoInternoInformado * quantidade : 0;
    return {
      custoTotalMaterial: 0,
      custoMetroLinear: 0,
      insumosCalc: [],
      custoTotalInsumos: 0,
      custoTotalObra: custoReal,
      valorVenda: quantidade * valorInformado,
      fatorDificuldade: 1,
      custoIncompleto,
    };
  }

  // por_metro
  const metragem = quantidade;
  const custoMetroLinear = valorInformado;
  const custoTotalMaterial = metragem * custoMetroLinear;

  let insumosCalc: InsumoCalculado[] = [];
  if (regra && insumosList) {
    insumosCalc = calcInsumosDinamicos(metragem, regra, insumosList);
  }

  const custoTotalInsumos = insumosCalc.reduce((s, i) => s + i.custoTotal, 0);
  const fator = dificuldade ? getFatorDificuldade(servico, dificuldade) : 1;
  const custoTotalObra = custoTotalMaterial + custoTotalInsumos;
  const valorVenda = custoTotalObra * fator;

  return {
    custoTotalMaterial,
    custoMetroLinear,
    insumosCalc,
    custoTotalInsumos,
    custoTotalObra,
    valorVenda,
    fatorDificuldade: fator,
    custoIncompleto: false,
  };
}

/** Build an ItemServico from an avulso calculation result */
export function buildItemServicoAvulso(
  servico: ServicoTemplate,
  result: CalcAvulsoResult,
  opts: {
    id?: string;
    motorType: string;
    dificuldade: Dificuldade;
    metragem: number;
    quantidade: number;
    valorUnitario: number;
    custoInternoAplicado?: number | null;
    insumosOverrides?: Record<string, number>;
  },
): ItemServico {
  return {
    id: opts.id ?? crypto.randomUUID(),
    servicoTemplateId: servico.id,
    nomeServico: servico.nomeServico,
    motorType: opts.motorType as any,
    materialId: '',
    espessura: 0,
    corte: 0,
    metragem: opts.metragem,
    dificuldade: opts.dificuldade,
    fatorDificuldade: result.fatorDificuldade,
    custoMetroLinear: result.custoMetroLinear,
    custoTotalMaterial: result.custoTotalMaterial,
    insumosCalculados: result.insumosCalc,
    custoTotalInsumos: result.custoTotalInsumos,
    custoTotalObra: result.custoTotalObra,
    valorVenda: result.valorVenda,
    insumosOverrides: opts.insumosOverrides && Object.keys(opts.insumosOverrides).length > 0 ? opts.insumosOverrides : undefined,
    tipoServico: servico.tipoServico,
    modoCobranca: servico.modoCobranca,
    quantidade: opts.quantidade,
    valorUnitario: opts.valorUnitario,
    unidadeCobranca: servico.unidadeCobranca,
    custoIncompleto: result.custoIncompleto,
    custoInternoAplicado: opts.custoInternoAplicado ?? null,
  };
}

/** Check if an ItemServico has incomplete cost (for financial warnings) */
export function hasIncompleteCosting(items: ItemServico[]): boolean {
  return items.some(i => i.custoIncompleto === true);
}
