// RufoLab — Canvas SVG da peça.
// Renderiza polyline da peça com cotas (medidas) e ângulos.
// Função pura de visualização; cálculos vêm de src/lib/rufolab/geometry.ts.
import { useMemo } from "react";

import type { Segmento } from "@/lib/rufolab/types";
import { construirDesenho, normalizarAngulo } from "@/lib/rufolab/geometry";

interface PecaCanvasProps {
  segmentos: Segmento[];
  height?: number;
  showCotas?: boolean;
  showAngulos?: boolean;
}

const PADDING = 40;

export function PecaCanvas({
  segmentos,
  height = 280,
  showCotas = true,
  showAngulos = true,
}: PecaCanvasProps) {
  const desenho = useMemo(() => construirDesenho(segmentos), [segmentos]);

  const { pontos, bbox } = desenho;
  const widthMm = Math.max(1, bbox.maxX - bbox.minX);
  const heightMm = Math.max(1, bbox.maxY - bbox.minY);

  // Mantém aspect ratio: dimensiona para caber em "height" CSS pixels mantendo proporção.
  // O ratio entre largura/altura segue do bbox real.
  const aspect = widthMm / heightMm;
  const cssWidth = Math.min(900, Math.max(240, height * aspect));

  const viewMinX = bbox.minX - PADDING;
  const viewMinY = bbox.minY - PADDING;
  const viewWidth = widthMm + PADDING * 2;
  const viewHeight = heightMm + PADDING * 2;

  const polylinePoints = pontos.map((p) => `${p.x},${p.y}`).join(" ");

  if (segmentos.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground"
        style={{ height }}
      >
        Adicione segmentos para visualizar a peça.
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-border bg-card p-3 shadow-sm"
      style={{ height: height + 24 }}
    >
      <svg
        viewBox={`${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}`}
        width="100%"
        height={height}
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: cssWidth, display: "block", margin: "0 auto" }}
      >
        {/* Polyline principal */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={Math.max(1.5, Math.min(viewWidth, viewHeight) / 200)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Vértices */}
        {pontos.map((p, idx) => (
          <circle
            key={`pt-${idx}`}
            cx={p.x}
            cy={p.y}
            r={Math.max(2, Math.min(viewWidth, viewHeight) / 180)}
            fill="hsl(var(--primary))"
          />
        ))}

        {/* Cotas (medidas) no centro de cada segmento */}
        {showCotas &&
          segmentos.map((s, i) => {
            const a = pontos[i];
            const b = pontos[i + 1];
            if (!a || !b) return null;
            const cx = (a.x + b.x) / 2;
            const cy = (a.y + b.y) / 2;
            const fontSize = Math.max(10, Math.min(viewWidth, viewHeight) / 28);
            return (
              <g key={`cota-${s.id}`}>
                <rect
                  x={cx - fontSize * 1.6}
                  y={cy - fontSize * 0.75}
                  width={fontSize * 3.2}
                  height={fontSize * 1.4}
                  rx={fontSize * 0.4}
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                />
                <text
                  x={cx}
                  y={cy + fontSize * 0.35}
                  textAnchor="middle"
                  fontSize={fontSize}
                  fill="hsl(var(--foreground))"
                  fontWeight={600}
                >
                  {Math.round(s.medida)} mm
                </text>
              </g>
            );
          })}

        {/* Ângulos nas junções */}
        {showAngulos &&
          segmentos.slice(0, -1).map((s, i) => {
            const ang = normalizarAngulo(s.anguloDeg ?? 0);
            if (Math.abs(ang) < 0.5) return null;
            const p = pontos[i + 1];
            if (!p) return null;
            const fontSize = Math.max(9, Math.min(viewWidth, viewHeight) / 32);
            return (
              <g key={`ang-${s.id}`}>
                <circle
                  cx={p.x}
                  cy={p.y - fontSize * 1.4}
                  r={fontSize * 1.1}
                  fill="hsl(var(--accent))"
                  opacity={0.95}
                />
                <text
                  x={p.x}
                  y={p.y - fontSize * 1.05}
                  textAnchor="middle"
                  fontSize={fontSize}
                  fill="hsl(var(--accent-foreground))"
                  fontWeight={700}
                >
                  {Math.round(ang)}°
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
}
