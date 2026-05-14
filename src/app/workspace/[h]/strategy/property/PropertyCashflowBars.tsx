"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { PropertyEngineYear } from "@/lib/finance/propertyEngine";
import { fmtCompact, niceTicks, EASE_OUT_EXPO } from "@/components/workspace/charts-interactive/chart-utils";

interface Props {
  rows: PropertyEngineYear[];
  period: "monthly" | "annual";
  height?: number;
}

export function PropertyCashflowBars({ rows, period, height = 220 }: Props) {
  const reduceMotion = useReducedMotion();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(640);
  const [hover, setHover] = React.useState<number | null>(null);
  const scale = period === "monthly" ? 1 / 12 : 1;

  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) setW(Math.max(280, cr.width));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const margin = { top: 12, right: 16, bottom: 28, left: 56 };
  const innerW = Math.max(20, w - margin.left - margin.right);
  const innerH = height - margin.top - margin.bottom;
  const series = rows.map((r) => ({
    year: r.year,
    net: r.netCashflow * scale,
    refund: r.taxRefund * scale,
  }));
  const allVals = series.flatMap((s) => [s.net, s.refund, 0]);
  const { yMin, yMax, ticks } = niceTicks(Math.min(...allVals), Math.max(...allVals), 5);
  const xAt = (i: number) => series.length <= 1 ? innerW / 2 : (i / (series.length - 1)) * innerW;
  const yAt = (v: number) => innerH - ((v - yMin) / Math.max(1e-9, yMax - yMin)) * innerH;
  const y0 = yAt(0);
  const slot = innerW / series.length;
  const bw = Math.max(2, slot * 0.32);
  const hov = hover != null ? series[hover] : null;

  return (
    <div ref={wrapRef} className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-label="Property cashflow bars"
        onMouseLeave={() => setHover(null)} onTouchEnd={() => setHover(null)}>
        <g transform={`translate(${margin.left} ${margin.top})`}>
          {ticks.map((t, i) => (
            <g key={`yt-${i}`}>
              <line x1={0} x2={innerW} y1={yAt(t)} y2={yAt(t)} stroke="rgba(255,255,255,0.05)" />
              <text x={-8} y={yAt(t)} dy="0.32em" textAnchor="end" fontSize={10} fill="rgba(255,255,255,0.45)"
                style={{ fontVariantNumeric: "tabular-nums" }}>{fmtCompact(t)}</text>
            </g>
          ))}
          <line x1={0} x2={innerW} y1={y0} y2={y0} stroke="rgba(255,255,255,0.18)" strokeDasharray="3 3" />
          {series.map((s, i) => {
            const cx = xAt(i);
            // Net bar
            const netTop = yAt(Math.max(0, s.net));
            const netBot = yAt(Math.min(0, s.net));
            const netH = Math.max(0.5, netBot - netTop);
            const positive = s.net >= 0;
            // Refund bar (always +ve), drawn next to net
            const refTop = yAt(Math.max(0, s.refund));
            const refBot = y0;
            const refH = Math.max(0.5, refBot - refTop);
            return (
              <g key={`bg-${i}`} onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} style={{ cursor: "crosshair" }}>
                <motion.rect x={cx - bw - 1} y={netTop} width={bw} height={netH} rx={2}
                  fill={positive ? "#3FA88F" : "#C24A6B"} fillOpacity={hover === i ? 0.95 : 0.7}
                  initial={reduceMotion ? false : { scaleY: 0, originY: positive ? 1 : 0 }} animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.015, ease: EASE_OUT_EXPO as unknown as number[] }} />
                <motion.rect x={cx + 1} y={refTop} width={bw} height={refH} rx={2}
                  fill="#E0A040" fillOpacity={hover === i ? 0.95 : 0.65}
                  initial={reduceMotion ? false : { scaleY: 0, originY: 1 }} animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.015 + 0.05, ease: EASE_OUT_EXPO as unknown as number[] }} />
              </g>
            );
          })}
          {series.map((s, i) => {
            if (i % Math.max(1, Math.ceil(series.length / 8)) !== 0 && i !== series.length - 1) return null;
            return (
              <text key={`xl-${i}`} x={xAt(i)} y={innerH + 16} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.45)">
                {s.year}
              </text>
            );
          })}
        </g>
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-ink-tertiary">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full inline-block" style={{ background: "#3FA88F" }} />Positive net</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full inline-block" style={{ background: "#C24A6B" }} />Negative net</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full inline-block" style={{ background: "#E0A040" }} />Tax refund</span>
      </div>
      {hov && (
        <div className="mt-2 rounded-xl border border-line bg-bg-inset px-3 py-2 text-caption text-ink-secondary inline-flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-ink-primary font-medium">{hov.year}</span>
          <span>Net: <span className={hov.net >= 0 ? "text-emerald-400 tabular-nums" : "text-rose-400 tabular-nums"}>{fmtCompact(hov.net)}</span></span>
          <span>Refund: <span className="text-amber-300 tabular-nums">{fmtCompact(hov.refund)}</span></span>
        </div>
      )}
    </div>
  );
}
