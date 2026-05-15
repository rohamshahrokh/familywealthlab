"use client";

import * as React from "react";

/**
 * FWL Hybrid V2 — Sparkline (signature moment 3)
 *
 * 60×14px slate path drawn as a single SVG <polyline>. No axes, no grid,
 * no tooltip — just the silhouette of the series, hugging the right edge
 * of the hero metric. Implemented in raw SVG to avoid pulling Recharts into
 * the snapshot route just for one decorative line.
 *
 * Usage:
 *   <V2Sparkline data={netWorthSeries} />
 */
export interface V2SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  className?: string;
  /** Optional area fill (slate at ~10% alpha) under the line. */
  filled?: boolean;
  /** Render a small accent dot at the end of the series. */
  endDot?: boolean;
}

export function V2Sparkline({
  data,
  width = 60,
  height = 14,
  stroke = "hsl(var(--v2-accent))",
  className,
  filled = false,
  endDot = true,
}: V2SparklineProps) {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden className={className} />
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((value, i) => {
    const x = i * stepX;
    // Inset by 1.5px top/bottom so a 1.5px stroke isn't clipped
    const y = height - 1.5 - ((value - min) / range) * (height - 3);
    return [x, y] as const;
  });

  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  const areaPath = filled
    ? `${path} L${width.toFixed(2)},${height} L0,${height} Z`
    : null;

  const last = points[points.length - 1]!;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className={className}
      style={{ overflow: "visible" }}
    >
      {areaPath ? (
        <path d={areaPath} fill={stroke} opacity={0.1} />
      ) : null}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {endDot ? (
        <circle
          cx={last[0]}
          cy={last[1]}
          r={1.75}
          fill={stroke}
        />
      ) : null}
    </svg>
  );
}
