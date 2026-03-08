import { Motor1Entry, Motor2Entry, InsumoEntry, RegraCalculo, ServicoTemplate, Dificuldade, InsumoCalculado, getCustoUnitario } from './types';

export function calcCustoMetroMotor1(espessura: number, corte: number, motor1: Motor1Entry): number {
  const pesoMetro = (espessura * corte * 100 * motor1.densidade) / 100000;
  return pesoMetro * motor1.precoQuilo;
}

export function calcCustoMetroMotor2(
  material: string, espessura: number, corte: number, motor2List: Motor2Entry[]
): number | null {
  const entry = motor2List.find(
    e => e.material === material && e.espessura === espessura && e.corte === corte
  );
  return entry ? entry.precoMetroLinear : null;
}

export function calcInsumosDinamicos(
  metragem: number, regra: RegraCalculo, insumosList: InsumoEntry[]
): InsumoCalculado[] {
  return regra.itensRegra.map(itemRegra => {
    const insumo = insumosList.find(i => i.id === itemRegra.insumoId);
    if (!insumo) return { insumoId: itemRegra.insumoId, nomeInsumo: '?', quantidade: 0, custoUnitario: 0, custoTotal: 0 };

    const quantidade = itemRegra.metodoCalculo === 'multiplicar'
      ? Math.ceil(metragem * itemRegra.fator)
      : Math.ceil(metragem / itemRegra.fator);

    const custoUnitario = getCustoUnitario(insumo);
    return {
      insumoId: insumo.id,
      nomeInsumo: insumo.nome,
      quantidade,
      custoUnitario,
      custoTotal: quantidade * custoUnitario,
    };
  });
}

export function getFatorDificuldade(servico: ServicoTemplate, dificuldade: Dificuldade): number {
  if (dificuldade === 'facil') return servico.dificuldadeFacil;
  if (dificuldade === 'medio') return servico.dificuldadeMedia;
  return servico.dificuldadeDificil;
}
