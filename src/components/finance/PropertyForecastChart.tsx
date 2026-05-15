"use client";

/**
 * PropertyForecastChart — enhanced cashflow chart for the Property Forecast
 * Intelligence Engine v1. Built ADDITIVELY alongside `PropertyCashflowBars`.
 *
 * - Preserves the red/green bar visual language users already know.
 * - Adds: hover tooltip, event markers on the timeline, optional MC p10–p90
 *   confidence band overlay, a subtle break-even line indicator.
 * - Scenario toggle is rendered by the parent (so the chart stays single-purpose).
 */

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  fmtCompact,
  niceTicks,
  EASE_OUT_EXPO,
} from "@/components/workspace/charts-interactive/chart-utils";
import type { ForecastResult, ForecastEvent } from "@/lib/finance/propertyForecastEngine";
import { eventLabel } from "@/lib/finance/propertyForecastEngine";

interface Props {
  result: ForecastResult;
  period: "monthly" | "annual";
  showBand?: boolean;
  showEvents?: boolean;
  height?: number;
}

const COLOURS = {
  positive: "#3FA88F",
  negative: "#C24A6B",
  refund: "#E0A040",
  band: "rgba(63,168,143,0.10)",
  bandStroke: "rgba(63,168,143,0.30)",
  grid: "rgba(255,255,255,0.05)",
  zero: "rgba(255,255,255,0.18)",
  breakEven: "rgba(63,168,143,0.55)",
  event: "rgba(255,255,255,0.55)",
};

export function PropertyForecastChart({
  result,
  period,
  showBand = true,
  showEvents = true,
  height = 240,
}: Props) {
  const reduceMotion = useReducedMotion();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(640);
  const [hover, setHover] = React.useState<number | null>(null);
  const [hoverEvent, setHoverEvent] = React.useState<ForecastEvent | null>(null);

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

  const series = result.rows.map((r) => ({
    year: r.year,
    age: r.age,
    net: r.netCashflow * scale,
    refund: r.taxRefund * scale,
    p10: r.cfP10 * scale,
    p90: r.cfP90 * scale,
    rate: r.effectiveRate,
    vacancy: r.effectiveVacancy,
    events: r.events,
  }));

  const breakEvenYear = result.kpis.breakEvenYear;

  const margin = { top: 14, right: 16, bottom: 32, left: 56 };
  const innerW = Math.max(20, w - margin.left - margin.right);
  const innerH = height - margin.top - margin.bottom;

  const allVals = series.flatMap((s) => [
    s.net, s.refund, 0,
    ...(showBand ? [s.p10, s.p90] : []),
  ]);
  const { yMin, yMax, ticks } = niceTicks(Math.min(...allVals), Math.max(...allVals), 5);
  const xAt = (i: number) =>
    series.length <= 1 ? innerW / 2 : (i / (series.length - 1)) * innerW;
  const yAt = (v: number) =>
    innerH - ((v - yMin) / Math.max(1e-9, yMax - yMin)) * innerH;
  const y0 = yAt(0);
  const slot = innerW / series.length;
  const bw = Math.max(2, slot * 0.32);

  const hov = hover != null ? series[hover] : null;

  // Confidence band path (filled area between p10 and p90).
  const bandPath = React.useMemo(() => {
    if (!showBand || series.length === 0) return "";
    const top = series.map((s, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(s.p90)}`).join(" ");
    const bot = series
      .slice()
      .reverse()
      .map((s, j) => `L ${xAt(series.length - 1 - j)} ${yAt(s.p10)}`)
      .join(" ");
    return `${top} ${bot} Z`;
  }, [series, showBand, innerW, innerH]);

  // Event markers grouped by year-index.
  const eventMarkers = React.useMemo(() => {
    if (!showEvents) return [];
    const out: Array<{ idx: number; events: ForecastEvent[] }> = [];
    for (let i = 0; i < series.length; i++) {
      if (series[i].events.length > 0) out.push({ idx: i, events: series[i].events });
    }
    return out;
  }, [series, showEvents]);

  const breakEvenIdx = breakEvenYear != null
    ? series.findIndex((s) => s.year === breakEvenYear)
    : -1;

  return (
    <div ref={wrapRef} className="w-full">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        role="img"
        aria-label="Property forecast cashflow"
        onMouseLeave={() => { setHover(null); setHoverEvent(null); }}
        onTouchEnd={() => { setHover(null); setHoverEvent(null); }}
      >
        <g transform={`translate(${margin.left} ${margin.top})`}>
          {/* Y-axis grid + labels */}
          {ticks.map((t, i) => (
            <g key={`yt-${i}`}>
              <line x1={0} x2={innerW} y1={yAt(t)} y2={yAt(t)} stroke={COLOURS.grid} />
              <text
                x={-8}
                y={yAt(t)}
                dy="0.32em"
                textAnchor="end"
                fontSize={10}
                fill="rgba(255,255,255,0.45)"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {fmtCompact(t)}
              </text>
            </g>
          ))}

          {/* Confidence band (drawn behind bars) */}
          {showBand && bandPath && (
            <motion.path
              d={bandPath}
              fill={COLOURS.band}
              stroke={COLOURS.bandStroke}
              strokeWidth={0.75}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO as unknown as number[] }}
            />
          )}

          {/* Zero line */}
          <line
            x1={0} x2={innerW} y1={y0} y2={y0}
            stroke={COLOURS.zero}
            strokeDasharray="3 3"
          />

          {/* Break-even marker */}
          {breakEvenIdx >= 0 && (
            <g>
              <line
                x1={xAt(breakEvenIdx)} x2={xAt(breakEvenIdx)}
                y1={0} y2={innerH}
                stroke={COLOURS.breakEven}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={xAt(breakEvenIdx) + 4}
                y={10}
                fontSize={9}
                fill={COLOURS.breakEven}
                style={{ letterSpacing: "0.04em" }}
              >
                BREAK-EVEN · {breakEvenYear}
              </text>
            </g>
          )}

          {/* Bars: net + refund */}
          {series.map((s, i) => {
            const cx = xAt(i);
            const netTop = yAt(Math.max(0, s.net));
            const netBot = yAt(Math.min(0, s.net));
            const netH = Math.max(0.5, netBot - netTop);
            const positive = s.net >= 0;
            const refTop = yAt(Math.max(0, s.refund));
            const refBot = y0;
            const refH = Math.max(0.5, refBot - refTop);
            return (
              <g
                key={`bg-${i}`}
                onMouseEnter={() => setHover(i)}
                onTouchStart={() => setHover(i)}
                style={{ cursor: "crosshair" }}
              >
                <motion.rect
                  x={cx - bw - 1}
                  y={netTop}
                  width={bw}
                  height={netH}
                  rx={2}
                  fill={positive ? COLOURS.positive : COLOURS.negative}
                  fillOpacity={hover === i ? 0.95 : 0.7}
                  initial={reduceMotion ? false : { scaleY: 0, originY: positive ? 1 : 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.012, ease: EASE_OUT_EXPO as unknown as number[] }}
                />
                <motion.rect
                  x={cx + 1}
                  y={refTop}
                  width={bw}
                  height={refH}
                  rx={2}
                  fill={COLOURS.refund}
                  fillOpacity={hover === i ? 0.95 : 0.6}
                  initial={reduceMotion ? false : { scaleY: 0, originY: 1 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.012 + 0.04, ease: EASE_OUT_EXPO as unknown as number[] }}
                />
                {/* Invisible hover hit-area covering full slot */}
                <rect
                  x={cx - slot / 2}
                  y={0}
                  width={slot}
                  height={innerH}
                  fill="transparent"
                />
              </g>
            );
          })}

          {/* Event markers */}
          {eventMarkers.map(({ idx, events }) => {
            const cx = xAt(idx);
            return (
              <g key={`ev-${idx}`}>
                <line x1={cx} x2={cx} y1={0} y2={innerH} stroke={COLOURS.event} strokeOpacity={0.18} strokeDasharray="2 4" />
                <g
                  onMouseEnter={() => setHoverEvent(events[0])}
                  onMouseLeave={() => setHoverEvent(null)}
                  style={{ cursor: "help" }}
                >
                  <circle cx={cx} cy={-4} r={4.5} fill="#0a0a0a" stroke={COLOURS.event} strokeWidth={1} />
                  <text x={cx} y={-2} textAnchor="middle" fontSize={7} fill={COLOURS.event} style={{ pointerEvents: "none" }}>
                    {events.length}
                  </text>
                </g>
              </g>
            );
          })}

          {/* X-axis labels */}
          {series.map((s, i) => {
            if (i % Math.max(1, Math.ceil(series.length / 8)) !== 0 && i !== series.length - 1) return null;
            return (
              <text
                key={`xl-${i}`}
                x={xAt(i)}
                y={innerH + 16}
                textAnchor="middle"
                fontSize={10}
                fill="rgba(255,255,255,0.45)"
              >
                {s.year}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-ink-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full inline-block" style={{ background: COLOURS.positive }} />
          Positive net
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full inline-block" style={{ background: COLOURS.negative }} />
          Negative net
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full inline-block" style={{ background: COLOURS.refund }} />
          Tax refund
        </span>
        {showBand && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-3 rounded-sm inline-block border"
              style={{ background: COLOURS.band, borderColor: COLOURS.bandStroke }}
            />
            Confidence band (p10–p90)
          </span>
        )}
        {showEvents && eventMarkers.length > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block rounded-full border"
              style={{ width: 8, height: 8, borderColor: COLOURS.event, background: "#0a0a0a" }}
            />
            Events ({eventMarkers.length})
          </span>
        )}
      </div>

      {/* Hover tooltips */}
      {hov && !hoverEvent && (
        <div className="mt-2 rounded-xl border border-line bg-bg-inset px-3 py-2 text-caption text-ink-secondary inline-flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-ink-primary font-medium">{hov.year}</span>
          <span>
            Net:{" "}
            <span className={hov.net >= 0 ? "text-emerald-400 tabular-nums" : "text-rose-400 tabular-nums"}>
              {fmtCompact(hov.net)}
            </span>
          </span>
          <span>
            Refund:{" "}
            <span className="text-amber-300 tabular-nums">{fmtCompact(hov.refund)}</span>
          </span>
          {showBand && (
            <span className="text-ink-tertiary tabular-nums">
              Range: {fmtCompact(hov.p10)} – {fmtCompact(hov.p90)}
            </span>
          )}
          <span className="text-ink-tertiary tabular-nums">
            Rate {(hov.rate * 100).toFixed(2)}% · Vacancy {(hov.vacancy * 100).toFixed(1)}%
          </span>
          {hov.events.length > 0 && (
            <span className="text-ink-primary">
              {hov.events.map((e) => e.label ?? eventLabel(e.kind)).join(" · ")}
            </span>
          )}
        </div>
      )}
      {hoverEvent && (
        <div className="mt-2 rounded-xl border border-line bg-bg-inset px-3 py-2 text-caption text-ink-secondary inline-flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-ink-primary font-medium">
            {hoverEvent.label ?? eventLabel(hoverEvent.kind)}
          </span>
          <span className="text-ink-tertiary">Year {hoverEvent.year}</span>
          {hoverEvent.magnitude != null && (
            <span className="text-ink-tertiary tabular-nums">
              Magnitude:{" "}
              {Math.abs(hoverEvent.magnitude) < 1
                ? `${(hoverEvent.magnitude * 100).toFixed(1)}%`
                : fmtCompact(hoverEvent.magnitude)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
