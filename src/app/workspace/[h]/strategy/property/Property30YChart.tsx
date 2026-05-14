"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { PropertyEngineYear } from "@/lib/finance/propertyEngine";
import { CHART_PALETTE, fmtCompact, niceTicks, EASE_OUT_EXPO } from "@/components/workspace/charts-interactive/chart-utils";

interface Props { rows: PropertyEngineYear[]; height?: number; }

export function Property30YChart({ rows, height = 320 }: Props) {
  const reduceMotion = useReducedMotion();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(640);
  const [hover, setHover] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) setW(Math.max(280, cr.width));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const margin = { top: 16, right: 16, bottom: 28, left: 56 };
  const innerW = Math.max(20, w - margin.left - margin.right);
  const innerH = height - margin.top - margin.bottom;

  const series = [
    { label: "Value",  key: "propertyValue" as const, color: CHART_PALETTE[0] },
    { label: "Loan",   key: "loanBalance"   as const, color: CHART_PALETTE[5] },
    { label: "Equity", key: "equity"        as const, color: CHART_PALETTE[2] },
  ];

  const vals = rows.flatMap((r) => series.map((s) => r[s.key]));
  const min = Math.min(0, ...vals);
  const max = Math.max(...vals);
  const { yMin, yMax, ticks } = niceTicks(min, max, 5);

  const xAt = (i: number) => rows.length <= 1 ? innerW / 2 : (i / (rows.length - 1)) * innerW;
  const yAt = (v: number) => innerH - ((v - yMin) / Math.max(1e-9, yMax - yMin)) * innerH;

  const tickStep = Math.max(1, Math.ceil(rows.length / 8));
  const hoverRow = hover != null ? rows[hover] : null;

  return (
    <div ref={wrapRef} className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-label="30-year property projection"
        onMouseLeave={() => setHover(null)} onTouchEnd={() => setHover(null)}>
        <g transform={`translate(${margin.left} ${margin.top})`}>
          {ticks.map((t, i) => (
            <g key={`yt-${i}`}>
              <line x1={0} x2={innerW} y1={yAt(t)} y2={yAt(t)} stroke="rgba(255,255,255,0.05)" />
              <text x={-8} y={yAt(t)} dy="0.32em" textAnchor="end" fontSize={10} fill="rgba(255,255,255,0.45)"
                style={{ fontVariantNumeric: "tabular-nums" }}>{fmtCompact(t)}</text>
            </g>
          ))}
          {/* lines */}
          {series.map((s) => {
            const path = rows.map((r, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(2)} ${yAt(r[s.key]).toFixed(2)}`).join(" ");
            return (
              <motion.path key={s.key} d={path} fill="none" stroke={s.color} strokeWidth={1.75}
                strokeLinecap="round" strokeLinejoin="round"
                initial={reduceMotion ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, ease: EASE_OUT_EXPO as unknown as number[] }} />
            );
          })}
          {/* hover capture */}
          {rows.map((_, i) => (
            <rect key={`hc-${i}`} x={xAt(i) - innerW / rows.length / 2} y={0}
              width={innerW / rows.length} height={innerH} fill="transparent"
              onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)}
              style={{ cursor: "crosshair" }} />
          ))}
          {hover != null && (
            <g pointerEvents="none">
              <line x1={xAt(hover)} x2={xAt(hover)} y1={0} y2={innerH} stroke="rgba(255,255,255,0.2)" />
              {series.map((s) => (
                <circle key={`hd-${s.key}`} cx={xAt(hover)} cy={yAt(rows[hover][s.key])} r={4} fill={s.color} />
              ))}
            </g>
          )}
          {rows.map((r, i) => {
            if (i % tickStep !== 0 && i !== rows.length - 1) return null;
            return (
              <text key={`xl-${i}`} x={xAt(i)} y={innerH + 16} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.45)">
                {r.year}
              </text>
            );
          })}
        </g>
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption text-ink-tertiary">
        {series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full inline-block" style={{ background: s.color }} />{s.label}
          </span>
        ))}
      </div>
      {hoverRow && (
        <div className="mt-2 rounded-xl border border-line bg-bg-inset px-3 py-2 text-caption text-ink-secondary inline-flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-ink-primary font-medium">{hoverRow.year}</span>
          {series.map((s) => (
            <span key={s.key}>{s.label}: <span className="text-ink-primary tabular-nums">{fmtCompact(hoverRow[s.key])}</span></span>
          ))}
        </div>
      )}
    </div>
  );
}
