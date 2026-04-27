// RufoLab — tipos puros (sem dependência de React/DOM).
// Espelham as colunas das tabelas rufolab_projects / rufolab_pieces / rufolab_templates.

export type TipoPeca = "reta" | "conica";
export type TipoSegmento = "reto" | "diagonal";

/**
 * Unidade de medida usada em todos os comprimentos de segmento.
 * Convencionado em MILÍMETROS (mm) para combinar com a prática de chapa.
 * O comprimento da peça (campo `comprimento` em metros) é tratado em METROS.
 */
export const UNIDADE_SEGMENTO = "mm" as const;
export const UNIDADE_COMPRIMENTO = "m" as const;

export interface Segmento {
  /** id local estável (uuid v4) */
  id: string;
  tipo: TipoSegmento;
  /** comprimento do segmento em milímetros */
  medida: number;
  /**
   * Ângulo da dobra para o PRÓXIMO segmento, em graus.
   * Convencionado: ângulo entre o segmento atual e o próximo.
   * Ignorado no último segmento.
   * Para segmentos diagonais, representa também a inclinação aplicada.
   */
  anguloDeg?: number;
}

export interface CalcSnapshot {
  /** soma dos comprimentos dos segmentos (mm) — usado para peça reta */
  desenvolvimentoInicial: number;
  /** apenas para peças cônicas: desenvolvimento na extremidade final (mm) */
  desenvolvimentoFinal?: number;
  /**
   * Área total da peça em metros quadrados (m²).
   * Reta: desenvolvimentoInicial × comprimento × quantidade.
   * Cônica: ((inicial + final) / 2) × comprimento × quantidade.
   */
  area: number;
  /** número de dobras = junções entre segmentos consecutivos com ângulo != 0 */
  numeroDobras: number;
  /** número total de segmentos */
  numeroSegmentos: number;
  /** comprimento da peça em metros (espelha o campo da peça) */
  comprimento: number;
  /** quantidade de peças (espelha o campo da peça) */
  quantidade: number;
  /** ISO 8601 — momento em que o snapshot foi calculado */
  calculadoEm: string;
}

export interface RufoLabProject {
  id: string;
  empresaId: string;
  nome: string;
  observacoes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RufoLabPiece {
  id: string;
  empresaId: string;
  projectId: string;
  nome: string;
  tipoPeca: TipoPeca;
  /** comprimento da peça em metros */
  comprimento: number;
  quantidade: number;
  observacoes: string;
  segmentos: Segmento[];
  /**
   * Para peças cônicas, segmentos da extremidade final.
   * Armazenado dentro de `segmentos` na primeira fase? Não — para manter o JSONB
   * simples, este campo opcional vive no calc_snapshot/edit state.
   * Mantido aqui só como hint para a UI de edição cônica futura.
   */
  segmentosFinal?: Segmento[];
  calcSnapshot: CalcSnapshot;
  createdAt: string;
  updatedAt: string;
}

export interface RufoLabTemplate {
  id: string;
  empresaId: string;
  nome: string;
  tipoPeca: TipoPeca;
  segmentos: Segmento[];
  observacoes: string;
  createdAt: string;
  updatedAt: string;
}

// ----- Inputs de criação/atualização (UI → hooks) -----

export interface RufoLabProjectInput {
  nome: string;
  observacoes?: string;
}

export interface RufoLabPieceInput {
  projectId: string;
  nome: string;
  tipoPeca: TipoPeca;
  comprimento: number;
  quantidade: number;
  observacoes?: string;
  segmentos: Segmento[];
  calcSnapshot: CalcSnapshot;
}

export interface RufoLabTemplateInput {
  nome: string;
  tipoPeca: TipoPeca;
  segmentos: Segmento[];
  observacoes?: string;
}
