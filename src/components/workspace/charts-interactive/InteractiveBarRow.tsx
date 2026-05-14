"use client";
/**
 * InteractiveBarRow — drop-in replacement for the legacy `BarRow`. Adds
 * hover-to-emphasise + tooltip-on-hover. Bars animate in on mount.
 */

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CHART_PALETTE, fmtAud, fmtCompact, EASE_OUT_EXPO } from "./chart-utils";

interface Row {
  label: string;
  value: number;
  color?: string;
  meta?: string;
  /** Optional pre-formatted value string. Use this instead of `valueFormat`
   *  when callers want full control (e.g. server pages, which can't pass
   *  a function prop into this client component). */
  valueText?: string;
}

export type BarValueFormat = "money" | "moneyCompact" | "raw";

interface Props {
  rows: Row[];
  /** Built-in formatter selector — serializable across the RSC boundary. */
  valueFormat?: BarValueFormat;
  max?: number;
}

function defaultFmt(format: BarValueFormat | undefined, n: number) {
  switch (format) {
    case "moneyCompact": return fmtCompact(n);
    case "raw":          return String(n);
    case "money":
    default:             return fmtAud(n);
  }
}

export function InteractiveBarRow({ rows, valueFormat, max }: Props) {
  const reduceMotion = useReducedMotion();
  const [hover, setHover] = React.useState<number | null>(null);
  const ceiling = max ?? Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => {
        const pct = ceiling > 0 ? Math.max(0, Math.min(100, (r.value / ceiling) * 100)) : 0;
        const color = r.color ?? CHART_PALETTE[i % CHART_PALETTE.length];
        const isHover = hover === i;
        return (
          <div
            key={r.label + i}
            className={`space-y-1 rounded-md px-2 -mx-2 py-1 transition-colors ${
              isHover ? "bg-bg-inset/60" : ""
            }`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
          >
            <div className="flex items-baseline justify-between gap-3 text-caption">
              <span className={`truncate ${isHover ? "text-ink-primary" : "text-ink-secondary"}`}>
                {r.label}
              </span>
              <span className="text-ink-primary tabular-nums font-medium">
                {r.valueText ?? defaultFmt(valueFormat, r.value)}
                {r.meta && (
                  <span className="text-ink-quaternary ml-1.5">{r.meta}</span>
                )}
              </span>
            </div>
            <div className="h-2 rounded-full bg-bg-inset overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                initial={reduceMotion ? false : { width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.9, delay: i * 0.05, ease: EASE_OUT_EXPO }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
