import { describe, it, expect } from "vitest";

import {
  calcularDesenvolvimento,
  calcularNumeroDobras,
  calcularArea,
  calcularSnapshot,
  normalizarAngulo,
  construirDesenho,
} from "@/lib/rufolab/geometry";
import type { Segmento } from "@/lib/rufolab/types";

const seg = (medida: number, anguloDeg = 0, tipo: Segmento["tipo"] = "reto"): Segmento => ({
  id: crypto.randomUUID(),
  tipo,
  medida,
  anguloDeg,
});

describe("rufolab/geometry — normalizarAngulo", () => {
  it("retorna 0 para entradas inválidas", () => {
    expect(normalizarAngulo(NaN)).toBe(0);
    expect(normalizarAngulo(Infinity)).toBe(0);
  });

  it("normaliza para (-180, 180]", () => {
    expect(normalizarAngulo(0)).toBe(0);
    expect(normalizarAngulo(90)).toBe(90);
    expect(normalizarAngulo(180)).toBe(180);
    expect(normalizarAngulo(370)).toBe(10);
    expect(normalizarAngulo(-190)).toBe(170);
  });
});

describe("rufolab/geometry — calcularDesenvolvimento", () => {
  it("soma comprimentos válidos e ignora não-finitos/zerados", () => {
    expect(calcularDesenvolvimento([])).toBe(0);
    expect(calcularDesenvolvimento([seg(100), seg(200), seg(50)])).toBe(350);
    expect(calcularDesenvolvimento([seg(100), seg(0), seg(50)])).toBe(150);
  });
});

describe("rufolab/geometry — calcularNumeroDobras", () => {
  it("retorna 0 com 0 ou 1 segmento", () => {
    expect(calcularNumeroDobras([])).toBe(0);
    expect(calcularNumeroDobras([seg(100, 90)])).toBe(0);
  });

  it("conta apenas junções com ângulo significativo (excluindo o último segmento)", () => {
    // 3 segmentos -> 2 junções possíveis. Última junção não conta.
    const segs = [seg(100, 90), seg(100, 0), seg(100, 0)];
    expect(calcularNumeroDobras(segs)).toBe(1);

    const segs2 = [seg(100, 90), seg(100, 90), seg(100, 0)];
    expect(calcularNumeroDobras(segs2)).toBe(2);
  });

  it("trata ângulos minúsculos como sem dobra", () => {
    expect(calcularNumeroDobras([seg(100, 0.1), seg(100, 0)])).toBe(0);
  });
});

describe("rufolab/geometry — calcularArea", () => {
  it("reta: desenvolvimento(mm) × comprimento(m) / 1000 × quantidade", () => {
    // 200mm × 1m × 1un = 0.2 m²
    expect(
      calcularArea({
        tipoPeca: "reta",
        desenvolvimentoInicialMm: 200,
        comprimentoM: 1,
        quantidade: 1,
      }),
    ).toBeCloseTo(0.2, 6);

    // multiplicação por quantidade
    expect(
      calcularArea({
        tipoPeca: "reta",
        desenvolvimentoInicialMm: 500,
        comprimentoM: 2,
        quantidade: 3,
      }),
    ).toBeCloseTo(3, 6); // 500 × 2 × 3 / 1000 = 3
  });

  it("cônica: usa média entre inicial e final", () => {
    // (300 + 500)/2 × 2m × 1un / 1000 = 0.8
    expect(
      calcularArea({
        tipoPeca: "conica",
        desenvolvimentoInicialMm: 300,
        desenvolvimentoFinalMm: 500,
        comprimentoM: 2,
        quantidade: 1,
      }),
    ).toBeCloseTo(0.8, 6);
  });

  it("retorna 0 para parâmetros inválidos", () => {
    expect(
      calcularArea({ tipoPeca: "reta", desenvolvimentoInicialMm: 200, comprimentoM: 0, quantidade: 1 }),
    ).toBe(0);
    expect(
      calcularArea({ tipoPeca: "reta", desenvolvimentoInicialMm: 200, comprimentoM: 1, quantidade: 0 }),
    ).toBe(0);
  });
});

describe("rufolab/geometry — calcularSnapshot", () => {
  it("monta snapshot consistente para peça reta", () => {
    const segmentos = [seg(100, 90), seg(100, 90), seg(100, 0)];
    const snap = calcularSnapshot({
      tipoPeca: "reta",
      segmentos,
      comprimentoM: 3,
      quantidade: 2,
      agoraIso: "2026-01-01T00:00:00.000Z",
    });
    expect(snap.desenvolvimentoInicial).toBe(300);
    expect(snap.desenvolvimentoFinal).toBeUndefined();
    expect(snap.numeroDobras).toBe(2);
    expect(snap.numeroSegmentos).toBe(3);
    expect(snap.comprimento).toBe(3);
    expect(snap.quantidade).toBe(2);
    expect(snap.area).toBeCloseTo((300 * 3 * 2) / 1000, 6);
    expect(snap.calculadoEm).toBe("2026-01-01T00:00:00.000Z");
  });

  it("usa segmentosFinal só quando peça é cônica", () => {
    const segmentos = [seg(100, 90), seg(100, 0)];
    const segmentosFinal = [seg(150, 90), seg(150, 0)];
    const snap = calcularSnapshot({
      tipoPeca: "conica",
      segmentos,
      segmentosFinal,
      comprimentoM: 1,
      quantidade: 1,
    });
    expect(snap.desenvolvimentoInicial).toBe(200);
    expect(snap.desenvolvimentoFinal).toBe(300);
    // área média: ((200+300)/2) × 1 × 1 / 1000 = 0.25
    expect(snap.area).toBeCloseTo(0.25, 6);
  });
});

describe("rufolab/geometry — construirDesenho", () => {
  it("polyline em L: 100mm direita, dobra 90°, 100mm para cima", () => {
    const segs = [seg(100, 90), seg(100, 0)];
    const { pontos, bbox } = construirDesenho(segs);
    expect(pontos).toHaveLength(3);
    expect(pontos[0]).toEqual({ x: 0, y: 0 });
    expect(pontos[1].x).toBeCloseTo(100, 6);
    expect(pontos[1].y).toBeCloseTo(0, 6);
    // após girar 90°, próximo segmento vai em +Y
    expect(pontos[2].x).toBeCloseTo(100, 6);
    expect(pontos[2].y).toBeCloseTo(100, 6);
    expect(bbox.minX).toBeCloseTo(0, 6);
    expect(bbox.maxX).toBeCloseTo(100, 6);
    expect(bbox.minY).toBeCloseTo(0, 6);
    expect(bbox.maxY).toBeCloseTo(100, 6);
  });

  it("retorna bbox zero para lista vazia", () => {
    const { pontos, bbox } = construirDesenho([]);
    expect(pontos).toEqual([{ x: 0, y: 0 }]);
    expect(bbox).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
  });
});
