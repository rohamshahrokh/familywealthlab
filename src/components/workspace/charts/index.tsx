/**
 * Chart primitives — pure SVG, server-renderable, zero client JS.
 *
 * The original Family Wealth Lab used Recharts (heavy, client-only). For
 * the commercial app we render charts on the server so dashboards stream
 * instantly and never flash empty.
 *
 * Each component is a thin, opinionated wrapper around plain SVG —
 * deliberately not a generic charting library. If you need behaviour
 * outside what's exposed here, build a sibling primitive rather than
 * generalising one of these.
 */

import * as React from "react";

const PALETTE = [
  "#C97030", "#7B6CF6", "#3FA88F", "#E0A040", "#5085D9",
  "#C24A6B", "#6B8DAC", "#A85DA8", "#5BA850", "#8C6B40",
  "#4F6E8F", "#B85D38", "#3F8FA8", "#996B7A", "#7AA850",
];
const fmtAud = (n: number, digits = 0) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency", currency: "AUD",
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(n);
const fmtCompact = (n: number): string => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${n < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
  if (abs >= 1_000)     return `${n < 0 ? "-" : ""}$${(abs / 1_000).toFixed(1)}k`;
  return fmtAud(n, 0);
};

// ─── Donut ──────────────────────────────────────────────────────────────────
export type DonutSlice = { label: string; value: number; color?: string };

export function Donut({
  slices, size = 220, thickness = 28, centerLabel, centerSub,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0);
  if (total <= 0) {
    return (
      <div className="flex items-center justify-center text-caption text-ink-quaternary" style={{ height: size }}>
        No data yet
      </div>
    );
  }
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={thickness} />
        {slices.map((s, i) => {
          if (s.value <= 0) return null;
          const len = (s.value / total) * circ;
          const offset = -acc;
          acc += len;
          return (
            <circle
              key={s.label + i}
              cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color ?? PALETTE[i % PALETTE.length]}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
        })}
        {centerLabel && (
          <>
            <text x={cx} y={cy - 2} textAnchor="middle" className="fill-ink-primary"
              style={{ fontSize: 18, fontWeight: 600 }}>{centerLabel}</text>
            {centerSub && (
              <text x={cx} y={cy + 16} textAnchor="middle" className="fill-ink-tertiary"
                style={{ fontSize: 11 }}>{centerSub}</text>
            )}
          </>
        )}
      </svg>
      <ul className="space-y-1.5 min-w-[10rem]">
        {slices.map((s, i) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
          return (
            <li key={s.label + i} className="flex items-center gap-2 text-body-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.color ?? PALETTE[i % PALETTE.length] }} aria-hidden />
              <span className="text-ink-secondary flex-1 truncate">{s.label}</span>
              <span className="text-ink-primary font-medium tabular-nums">{pct.toFixed(1)}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── BarRow (horizontal bars) ───────────────────────────────────────────────
export function BarRow({
  rows, valueLabel, max,
}: {
  rows: { label: string; value: number; color?: string; meta?: string }[];
  valueLabel?: (n: number) => string;
  max?: number;
}) {
  const ceiling = max ?? Math.max(...rows.map(r => r.value), 1);
  const fmt = valueLabel ?? ((n) => fmtAud(n));
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => {
        const pct = ceiling > 0 ? Math.max(0, Math.min(100, (r.value / ceiling) * 100)) : 0;
        return (
          <div key={r.label + i} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-caption">
              <span className="text-ink-secondary truncate">{r.label}</span>
              <span className="text-ink-primary tabular-nums font-medium">
                {fmt(r.value)}
                {r.meta && <span className="text-ink-quaternary ml-1.5">{r.meta}</span>}
              </span>
            </div>
            <div className="h-2 rounded-full bg-bg-inset overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: r.color ?? PALETTE[i % PALETTE.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AreaLine — multi-series area/line chart ────────────────────────────────
export type Series = { label: string; values: number[]; color?: string; fill?: boolean };

export function AreaLine({
  xLabels, series, height = 220, yFormat = fmtCompact, padding = { top: 16, right: 8, bottom: 28, left: 56 },
}: {
  xLabels: string[];
  series: Series[];
  height?: number;
  yFormat?: (n: number) => string;
  padding?: { top: number; right: number; bottom: number; left: number };
}) {
  const all = series.flatMap(s => s.values);
  if (all.length === 0) {
    return <div className="text-caption text-ink-quaternary py-12 text-center">No data yet</div>;
  }
  const minY = Math.min(0, ...all);
  const maxY = Math.max(...all, 1);
  // Compute "nice" y-axis ticks
  const range = maxY - minY;
  const step = niceStep(range / 4);
  const yMin = Math.floor(minY / step) * step;
  const yMax = Math.ceil(maxY / step) * step;
  const ticks: number[] = [];
  for (let y = yMin; y <= yMax + 0.5; y += step) ticks.push(y);

  const width = 800; // viewBox; SVG scales responsively
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const xStep = xLabels.length > 1 ? innerW / (xLabels.length - 1) : 0;
  const yScale = (v: number) => padding.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
  const xScale = (i: number) => padding.left + i * xStep;

  const labelStride = Math.max(1, Math.floor(xLabels.length / 8));

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Time-series chart">
        {/* gridlines */}
        {ticks.map((t, i) => (
          <g key={"y" + i}>
            <line x1={padding.left} x2={width - padding.right} y1={yScale(t)} y2={yScale(t)}
              stroke="rgba(0,0,0,0.05)" strokeWidth={1} />
            <text x={padding.left - 6} y={yScale(t) + 4} textAnchor="end" className="fill-ink-quaternary"
              style={{ fontSize: 10 }}>{yFormat(t)}</text>
          </g>
        ))}
        {/* zero line */}
        {yMin < 0 && yMax > 0 && (
          <line x1={padding.left} x2={width - padding.right} y1={yScale(0)} y2={yScale(0)}
            stroke="rgba(0,0,0,0.16)" strokeWidth={1} strokeDasharray="2 3" />
        )}
        {/* series */}
        {series.map((s, si) => {
          const color = s.color ?? PALETTE[si % PALETTE.length];
          const pts = s.values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
          const fillPath =
            s.fill !== false &&
            s.values.length > 1 &&
            `M ${xScale(0)},${yScale(0)} L ${pts.split(" ").join(" L ")} L ${xScale(s.values.length - 1)},${yScale(0)} Z`;
          return (
            <g key={s.label + si}>
              {fillPath && (
                <path d={fillPath as string} fill={color} fillOpacity={0.12} />
              )}
              <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          );
        })}
        {/* x-axis labels */}
        {xLabels.map((l, i) =>
          i % labelStride === 0 ? (
            <text key={"x" + i} x={xScale(i)} y={height - 8} textAnchor="middle"
              className="fill-ink-quaternary" style={{ fontSize: 10 }}>
              {l}
            </text>
          ) : null,
        )}
      </svg>
      {/* legend */}
      {series.length > 1 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {series.map((s, i) => (
            <li key={s.label + i} className="flex items-center gap-1.5 text-caption">
              <span className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: s.color ?? PALETTE[i % PALETTE.length] }} aria-hidden />
              <span className="text-ink-secondary">{s.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const exp = Math.floor(Math.log10(raw));
  const base = raw / Math.pow(10, exp);
  let nice = 1;
  if (base <= 1) nice = 1;
  else if (base <= 2) nice = 2;
  else if (base <= 5) nice = 5;
  else nice = 10;
  return nice * Math.pow(10, exp);
}

// ─── Heatmap (day-of-month × category intensity) ────────────────────────────
export function SpendingHeatmap({
  cells, columns = 31,
}: {
  cells: { dayOfMonth: number; category: string; amount: number }[];
  columns?: number;
}) {
  if (cells.length === 0) return <div className="text-caption text-ink-quaternary">No data yet</div>;
  const cats = Array.from(new Set(cells.map(c => c.category)));
  const grid: Record<string, Record<number, number>> = {};
  let maxAmt = 0;
  for (const c of cells) {
    grid[c.category] ??= {};
    grid[c.category][c.dayOfMonth] = (grid[c.category][c.dayOfMonth] ?? 0) + c.amount;
    maxAmt = Math.max(maxAmt, grid[c.category][c.dayOfMonth]);
  }
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="text-caption border-separate" style={{ borderSpacing: 2 }}>
        <thead>
          <tr>
            <th className="text-left pr-3 text-ink-quaternary font-normal sticky left-0 bg-bg-base"></th>
            {Array.from({ length: columns }, (_, i) => i + 1).map(d => (
              <th key={d} className="text-ink-quaternary font-normal" style={{ width: 18, minWidth: 18 }}>
                {d % 5 === 0 || d === 1 ? d : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cats.map((cat) => (
            <tr key={cat}>
              <td className="pr-3 text-ink-secondary whitespace-nowrap sticky left-0 bg-bg-base">{cat}</td>
              {Array.from({ length: columns }, (_, i) => i + 1).map(d => {
                const v = grid[cat]?.[d] ?? 0;
                const intensity = maxAmt > 0 ? Math.min(1, v / maxAmt) : 0;
                const bg = v > 0
                  ? `rgba(201, 112, 48, ${0.12 + intensity * 0.78})`
                  : "rgba(0,0,0,0.03)";
                return (
                  <td key={d}
                    title={v > 0 ? `${cat} · day ${d} · ${fmtAud(v)}` : ""}
                    style={{ width: 18, height: 18, minWidth: 18, background: bg, borderRadius: 3 }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Sparkline ──────────────────────────────────────────────────────────────
export function Sparkline({
  values, width = 80, height = 24, color = "#C97030",
}: { values: number[]; width?: number; height?: number; color?: string }) {
  if (values.length < 2) return <div className="h-6 w-20" aria-hidden />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values
    .map((v, i) => `${(i * step).toFixed(2)},${(height - ((v - min) / range) * height).toFixed(2)}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
