import { Motor1Entry, Motor2Entry, InsumoEntry, ReceitaServico, MotorType, Dificuldade } from './types';

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

export function calcInsumos(metragem: number, receita: ReceitaServico, insumos: InsumoEntry[]) {
  const suporteInsumo = insumos.find(i => i.nome.toLowerCase().includes('suporte'));
  const puInsumo = insumos.find(i => i.nome.toLowerCase().includes('pu'));
  const rebiteInsumo = insumos.find(i => i.nome.toLowerCase().includes('rebite'));

  const qtdSuportes = receita.divisorSuporte > 0 ? Math.ceil(metragem / receita.divisorSuporte) : 0;
  const qtdPU = receita.divisorPU > 0 ? Math.ceil(metragem / receita.divisorPU) : 0;
  const qtdRebites = Math.ceil(metragem * receita.multiplicadorRebite);

  const custoSuportes = qtdSuportes * (suporteInsumo?.custoUnitario ?? 0);
  const custoPU = qtdPU * (puInsumo?.custoUnitario ?? 0);
  const custoRebites = qtdRebites * (rebiteInsumo?.custoUnitario ?? 0);

  return { qtdSuportes, qtdPU, qtdRebites, custoSuportes, custoPU, custoRebites, custoTotalInsumos: custoSuportes + custoPU + custoRebites };
}

export function getFatorDificuldade(receita: ReceitaServico, dificuldade: Dificuldade): number {
  if (dificuldade === 'facil') return receita.dificuldadeFacil;
  if (dificuldade === 'medio') return receita.dificuldadeMedia;
  return receita.dificuldadeDificil;
}
