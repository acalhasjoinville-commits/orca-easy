import { Motor1Entry, Motor2Entry, InsumoEntry, RegraCalculo, ServicoTemplate, Dificuldade } from './types';

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

export function calcInsumos(metragem: number, regra: RegraCalculo, insumos: InsumoEntry[]) {
  const suporteInsumo = insumos.find(i => i.nome.toLowerCase().includes('suporte'));
  const puInsumo = insumos.find(i => i.nome.toLowerCase().includes('pu'));
  const rebiteInsumo = insumos.find(i => i.nome.toLowerCase().includes('rebite'));

  const qtdSuportes = regra.divisorSuporte > 0 ? Math.ceil(metragem / regra.divisorSuporte) : 0;
  const qtdPU = regra.divisorPU > 0 ? Math.ceil(metragem / regra.divisorPU) : 0;
  const qtdRebites = Math.ceil(metragem * regra.multiplicadorRebite);

  const custoSuportes = qtdSuportes * (suporteInsumo?.custoUnitario ?? 0);
  const custoPU = qtdPU * (puInsumo?.custoUnitario ?? 0);
  const custoRebites = qtdRebites * (rebiteInsumo?.custoUnitario ?? 0);

  return { qtdSuportes, qtdPU, qtdRebites, custoSuportes, custoPU, custoRebites, custoTotalInsumos: custoSuportes + custoPU + custoRebites };
}

export function getFatorDificuldade(servico: ServicoTemplate, dificuldade: Dificuldade): number {
  if (dificuldade === 'facil') return servico.dificuldadeFacil;
  if (dificuldade === 'medio') return servico.dificuldadeMedia;
  return servico.dificuldadeDificil;
}
