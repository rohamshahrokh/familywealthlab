"use client";

/**
 * CashflowComboChart — premium interactive combo chart:
 *
 *  • cash balance line (filled gradient under)
 *  • positive net-cashflow bars (above zero)
 *  • negative net-cashflow bars (below zero)
 *  • event markers (tax refund / property / stock / crypto)
 *  • crosshair + tooltip
 *  • animated draw-in via framer-motion
 *
 * Pure SVG. Server passes plain serializable props.
 */

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CHART_PALETTE, fmtCompact, niceTicks, EASE_OUT_EXPO } from "./chart-utils";

export interface ComboPoint {
  label: string;
  cashBalance: number;
  netCashflow: number;
  taxRefund?: number;
  propertyImpact?: number;
  stockImpact?: number;
  cryptoImpact?: number;
}

export type ComboChartType = "combo" | "line" | "bars";

interface Props {
  data: ComboPoint[];
  chartType?: ComboChartType;
  height?: number;
  showEvents?: boolean;
  formatValue?: "money" | "moneyCompact";
}

export function CashflowComboChart({
  data,
  chartType = "combo",
  height = 320,
  showEvents = true,
  formatValue = "moneyCompact",
}: Props) {
  const reduceMotion = useReducedMotion();
  const [hover, setHover] = React.useState<number | null>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(640);

  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) setW(Math.max(280, cr.width));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const fmt = (n: number) =>
    formatValue === "moneyCompact" ? fmtCompact(n) : new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);

  const margin = { top: 16, right: 16, bottom: 32, left: 56 };
  const innerW = Math.max(20, w - margin.left - margin.right);
  const innerH = height - margin.top - margin.bottom;

  // Y-axis combines cashBalance line + net bars
  const cashVals = data.map((d) => d.cashBalance);
  const netVals = data.map((d) => d.netCashflow);
  const allVals = [...cashVals, ...netVals, 0];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const { yMin, yMax, ticks } = niceTicks(min, max, 5);

  const xAt = (i: number) =>
    data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW;
  const yAt = (v: number) =>
    innerH - ((v - yMin) / Math.max(1e-9, yMax - yMin)) * innerH;
  const y0 = yAt(0);

  const barW = data.length <= 1 ? innerW * 0.6 : Math.max(2, (innerW / data.length) * 0.55);

  // Line path
  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(2)} ${yAt(d.cashBalance).toFixed(2)}`)
    .join(" ");
  const areaPath = linePath + ` L${xAt(data.length - 1).toFixed(2)} ${innerH} L${xAt(0).toFixed(2)} ${innerH} Z`;

  // Tick label x-step (skip when crowded)
  const tickStep = Math.max(1, Math.ceil(data.length / 8));

  const hoverPoint = hover != null ? data[hover] : null;

  return (
    <div ref={wrapRef} className="w-full" data-testid="cashflow-combo-chart">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        role="img"
        aria-label="Cashflow combo chart"
        onMouseLeave={() => setHover(null)}
        onTouchEnd={() => setHover(null)}
      >
        <defs>
          <linearGradient id="cf-area-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={CHART_PALETTE[0]} stopOpacity="0.22" />
            <stop offset="100%" stopColor={CHART_PALETTE[0]} stopOpacity="0" />
          </linearGradient>
        </defs>

        <g transform={`translate(${margin.left} ${margin.top})`}>
          {/* y-gridlines */}
          {ticks.map((t, i) => (
            <g key={`yt-${i}`}>
              <line x1={0} x2={innerW} y1={yAt(t)} y2={yAt(t)} stroke="rgba(255,255,255,0.05)" />
              <text
                x={-8}
                y={yAt(t)}
                dy="0.32em"
                textAnchor="end"
                fontSize={10}
                fill="rgba(255,255,255,0.45)"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {fmt(t)}
              </text>
            </g>
          ))}

          {/* zero baseline */}
          <line x1={0} x2={innerW} y1={y0} y2={y0} stroke="rgba(255,255,255,0.18)" strokeDasharray="3 3" />

          {/* bars */}
          {(chartType === "combo" || chartType === "bars") &&
            data.map((d, i) => {
              const x = xAt(i) - barW / 2;
              const yTop = yAt(Math.max(0, d.netCashflow));
              const yBot = yAt(Math.min(0, d.netCashflow));
              const h = Math.max(0.5, yBot - yTop);
              const positive = d.netCashflow >= 0;
              return (
                <motion.rect
                  key={`bar-${i}`}
                  x={x}
                  width={barW}
                  y={yTop}
                  height={h}
                  rx={Math.min(3, barW / 2)}
                  fill={positive ? "#3FA88F" : "#C24A6B"}
                  fillOpacity={hover === i ? 0.95 : 0.7}
                  initial={reduceMotion ? false : { scaleY: 0, originY: positive ? 1 : 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.012, ease: EASE_OUT_EXPO as unknown as number[] }}
                />
              );
            })}

          {/* line */}
          {(chartType === "combo" || chartType === "line") && (
            <>
              <path d={areaPath} fill="url(#cf-area-grad)" />
              <motion.path
                d={linePath}
                fill="none"
                stroke={CHART_PALETTE[0]}
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduceMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, ease: EASE_OUT_EXPO as unknown as number[] }}
              />
            </>
          )}

          {/* event markers */}
          {showEvents && data.map((d, i) => {
            const events: { color: string; key: string }[] = [];
            if (d.taxRefund && d.taxRefund > 0) events.push({ color: "#E0A040", key: "tax" });
            if (d.propertyImpact && d.propertyImpact !== 0) events.push({ color: "#7B6CF6", key: "prop" });
            if (d.stockImpact && d.stockImpact !== 0) events.push({ color: "#5085D9", key: "stock" });
            if (d.cryptoImpact && d.cryptoImpact !== 0) events.push({ color: "#A85DA8", key: "crypto" });
            return events.map((e, k) => (
              <circle
                key={`ev-${i}-${e.key}`}
                cx={xAt(i)}
                cy={3 + k * 8}
                r={3}
                fill={e.color}
                fillOpacity={0.95}
              />
            ));
          })}

          {/* hover capture */}
          {data.map((_, i) => (
            <rect
              key={`hc-${i}`}
              x={xAt(i) - innerW / data.length / 2}
              y={0}
              width={innerW / data.length}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onTouchStart={() => setHover(i)}
              style={{ cursor: "crosshair" }}
            />
          ))}

          {/* crosshair */}
          {hover != null && (
            <g pointerEvents="none">
              <line x1={xAt(hover)} x2={xAt(hover)} y1={0} y2={innerH} stroke="rgba(255,255,255,0.2)" />
              <circle cx={xAt(hover)} cy={yAt(data[hover].cashBalance)} r={4} fill={CHART_PALETTE[0]} />
            </g>
          )}

          {/* x-labels */}
          {data.map((d, i) => {
            if (i % tickStep !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={`xl-${i}`}
                x={xAt(i)}
                y={innerH + 16}
                textAnchor="middle"
                fontSize={10}
                fill="rgba(255,255,255,0.45)"
              >
                {d.label}
              </text>
            );
          })}
        </g>
      </svg>

      {/* tooltip */}
      {hoverPoint && (
        <div className="mt-2 rounded-xl border border-line bg-bg-inset px-3 py-2 text-caption text-ink-secondary inline-flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-ink-primary font-medium">{hoverPoint.label}</span>
          <span>Cash: <span className="text-ink-primary tabular-nums">{fmt(hoverPoint.cashBalance)}</span></span>
          <span>Net: <span className={hoverPoint.netCashflow >= 0 ? "text-emerald-400 tabular-nums" : "text-rose-400 tabular-nums"}>{fmt(hoverPoint.netCashflow)}</span></span>
          {hoverPoint.taxRefund ? <span>Tax refund: <span className="text-amber-300 tabular-nums">{fmt(hoverPoint.taxRefund)}</span></span> : null}
          {hoverPoint.propertyImpact ? <span>Property: <span className="text-violet-300 tabular-nums">{fmt(hoverPoint.propertyImpact)}</span></span> : null}
          {hoverPoint.stockImpact ? <span>Stock: <span className="text-sky-300 tabular-nums">{fmt(hoverPoint.stockImpact)}</span></span> : null}
          {hoverPoint.cryptoImpact ? <span>Crypto: <span className="text-fuchsia-300 tabular-nums">{fmt(hoverPoint.cryptoImpact)}</span></span> : null}
        </div>
      )}
    </div>
  );
}
