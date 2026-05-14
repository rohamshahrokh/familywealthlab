import * as React from "react";
import { cn } from "@/lib/utils";

export interface RiskMetric {
  label: string;
  /** 0..1 probability or 0..1 ratio. */
  value: number;
  /** Threshold above which we tint warning. */
  warnAt: number;
  /** Threshold above which we tint danger. */
  dangerAt: number;
  hint?: string;
}

/**
 * RiskStrip — compact horizontal strip showing key probabilities from the
 * engine (negative equity, liquidity stress, refi pressure, default).
 * Mobile-first: wraps to 2 columns under 640px.
 */
export function RiskStrip({
  metrics,
  className,
}: {
  metrics: RiskMetric[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      {metrics.map((m) => {
        const pct = Math.max(0, Math.min(1, m.value));
        const tone =
          pct >= m.dangerAt ? "danger" : pct >= m.warnAt ? "warning" : "calm";
        return (
          <div key={m.label} className="card-inset p-3.5">
            <div className="text-caption text-ink-quaternary uppercase tracking-wider mb-1.5 truncate">
              {m.label}
            </div>
            <div
              className={cn(
                "num text-h6 font-semibold leading-none",
                tone === "danger" && "text-rose-700",
                tone === "warning" && "text-ember-600",
                tone === "calm" && "text-ink-primary"
              )}
            >
              {(pct * 100).toFixed(pct < 0.01 ? 2 : 1)}%
            </div>
            {m.hint && <div className="text-caption text-ink-quaternary mt-1.5">{m.hint}</div>}
          </div>
        );
      })}
    </div>
  );
}
