// RufoLab — Geometria pura.
// Funções determinísticas, sem React/DOM/IO. Cobertas por testes unitários.
// Convenção de unidades:
//   - segmentos: milímetros (mm)
//   - comprimento da peça: metros (m)
//   - área: metros quadrados (m²)
//   - ângulos: graus (deg) na API pública, radianos só internamente

import type { Segmento, CalcSnapshot, TipoPeca } from "./types";

const MM_PER_M = 1000;
/** Tolerância angular para considerar uma junção como "dobra real" */
const ANGULO_DOBRA_MIN_DEG = 0.5;

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Normaliza ângulo para o intervalo (-180, 180].
 * Útil para calcular dobras consistentes mesmo com entradas tipo 370°.
 */
export function normalizarAngulo(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a <= -180) a += 360;
  return a;
}

/**
 * Soma o comprimento bruto dos segmentos (mm).
 * Para diagonais, usa-se o próprio `medida` (já é o comprimento do segmento).
 */
export function calcularDesenvolvimento(segmentos: Segmento[]): number {
  let total = 0;
  for (const s of segmentos) {
    if (Number.isFinite(s.medida) && s.medida > 0) {
      total += s.medida;
    }
  }
  return total;
}

/**
 * Conta o número de dobras reais (junções com ângulo significativo
 * entre segmentos consecutivos). Ignora a última junção (não há próximo).
 */
export function calcularNumeroDobras(segmentos: Segmento[]): number {
  if (segmentos.length < 2) return 0;
  let dobras = 0;
  // junções: índice 0..n-2 (entre s[i] e s[i+1])
  for (let i = 0; i < segmentos.length - 1; i++) {
    const angulo = Math.abs(normalizarAngulo(segmentos[i].anguloDeg ?? 0));
    if (angulo >= ANGULO_DOBRA_MIN_DEG) {
      dobras++;
    }
  }
  return dobras;
}

/**
 * Calcula a área total da peça em m².
 * Reta:    desenvolvimento_mm × comprimento_m / 1000 × quantidade
 * Cônica:  ((inicial_mm + final_mm) / 2) × comprimento_m / 1000 × quantidade
 */
export function calcularArea(params: {
  tipoPeca: TipoPeca;
  desenvolvimentoInicialMm: number;
  desenvolvimentoFinalMm?: number;
  comprimentoM: number;
  quantidade: number;
}): number {
  const { tipoPeca, desenvolvimentoInicialMm, desenvolvimentoFinalMm, comprimentoM, quantidade } = params;
  if (!(comprimentoM > 0) || !(quantidade > 0)) return 0;

  let desenvolvimentoMedioMm = desenvolvimentoInicialMm;
  if (tipoPeca === "conica" && Number.isFinite(desenvolvimentoFinalMm) && (desenvolvimentoFinalMm ?? 0) > 0) {
    desenvolvimentoMedioMm = (desenvolvimentoInicialMm + (desenvolvimentoFinalMm as number)) / 2;
  }

  // mm × m → mm·m; dividir por 1000 para chegar em m²
  return (desenvolvimentoMedioMm * comprimentoM * quantidade) / MM_PER_M;
}

/**
 * Snapshot completo dos cálculos técnicos da peça.
 * Função pura — recebe os parâmetros, devolve o objeto pronto pra persistir em JSONB.
 */
export function calcularSnapshot(params: {
  tipoPeca: TipoPeca;
  segmentos: Segmento[];
  segmentosFinal?: Segmento[]; // só cônica
  comprimentoM: number;
  quantidade: number;
  agoraIso?: string; // injetável para testes determinísticos
}): CalcSnapshot {
  const { tipoPeca, segmentos, segmentosFinal, comprimentoM, quantidade, agoraIso } = params;

  const desenvolvimentoInicial = calcularDesenvolvimento(segmentos);
  const desenvolvimentoFinal =
    tipoPeca === "conica" && segmentosFinal && segmentosFinal.length > 0
      ? calcularDesenvolvimento(segmentosFinal)
      : undefined;

  const numeroDobras =
    tipoPeca === "conica" && segmentosFinal && segmentosFinal.length > 0
      ? Math.max(calcularNumeroDobras(segmentos), calcularNumeroDobras(segmentosFinal))
      : calcularNumeroDobras(segmentos);

  const area = calcularArea({
    tipoPeca,
    desenvolvimentoInicialMm: desenvolvimentoInicial,
    desenvolvimentoFinalMm: desenvolvimentoFinal,
    comprimentoM,
    quantidade,
  });

  return {
    desenvolvimentoInicial,
    desenvolvimentoFinal,
    area,
    numeroDobras,
    numeroSegmentos: segmentos.length,
    comprimento: comprimentoM,
    quantidade,
    calculadoEm: agoraIso ?? new Date().toISOString(),
  };
}

// ----------------------------------------------------------------------------
// Render geométrico do desenho (path SVG) — função pura, sem JSX.
// O canvas/UI consome este resultado e desenha.
// ----------------------------------------------------------------------------

export interface PontoXY {
  x: number;
  y: number;
}

export interface DesenhoPeca {
  /** pontos consecutivos do polyline (em mm) */
  pontos: PontoXY[];
  /** bounding box em mm */
  bbox: { minX: number; minY: number; maxX: number; maxY: number };
}

/**
 * Constrói o polyline 2D acumulando segmentos.
 * Convenção:
 *  - Começa em (0, 0).
 *  - Direção inicial: eixo X positivo (direita).
 *  - Após cada segmento, rotaciona pelo `anguloDeg` (no sentido anti-horário).
 *  - Diagonais usam o próprio comprimento `medida`; o ângulo é a inclinação relativa.
 */
export function construirDesenho(segmentos: Segmento[]): DesenhoPeca {
  const pontos: PontoXY[] = [{ x: 0, y: 0 }];
  let direcaoRad = 0;
  let x = 0;
  let y = 0;

  for (let i = 0; i < segmentos.length; i++) {
    const s = segmentos[i];
    const medida = Number.isFinite(s.medida) && s.medida > 0 ? s.medida : 0;
    x += Math.cos(direcaoRad) * medida;
    y += Math.sin(direcaoRad) * medida;
    pontos.push({ x, y });
    const ang = normalizarAngulo(s.anguloDeg ?? 0);
    direcaoRad += degToRad(ang);
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pontos) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  if (!Number.isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 0;
    maxY = 0;
  }

  return { pontos, bbox: { minX, minY, maxX, maxY } };
}
