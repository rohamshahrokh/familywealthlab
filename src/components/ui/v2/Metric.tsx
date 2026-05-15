"use client";

import * as React from "react";

/**
 * FWL Hybrid V2 — Metric
 * Hero number block. The default `size="display"` is the Source Serif 4
 * 38px number that hosts signature moment 3 (an optional 60×14 slate
 * sparkline placed inline to the right of the value).
 *
 * The `delta` slot accepts a pre-formatted delta string (e.g. "+$2.72M
 * (+58%)") and is rendered with the v2 semantic colour for pos/neg/neutral.
 *
 * Only one display metric per page; nested metrics should use size="md".
 */
export interface V2MetricProps {
  label?: string;
  value: React.ReactNode;
  delta?: React.ReactNode;
  deltaTone?: "pos" | "neg" | "neutral";
  sub?: React.ReactNode;
  /** Optional 60×14 sparkline rendered inline to the right of the value. */
  sparkline?: React.ReactNode;
  size?: "display" | "md" | "sm";
  className?: string;
}

const sizeClasses: Record<NonNullable<V2MetricProps["size"]>, string> = {
  display: "v2-num-display",
  md: "text-[22px] font-medium tabular-nums tracking-tight text-v2-text-strong",
  sm: "text-[17px] font-medium tabular-nums text-v2-text-strong",
};

const toneClasses: Record<NonNullable<V2MetricProps["deltaTone"]>, string> = {
  pos: "text-v2-pos",
  neg: "text-v2-neg",
  neutral: "text-v2-text-muted",
};

export function V2Metric({
  label,
  value,
  delta,
  deltaTone = "neutral",
  sub,
  sparkline,
  size = "display",
  className,
}: V2MetricProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      {label ? <div className="v2-eyebrow">{label}</div> : null}
      <div className="flex items-baseline gap-3 min-w-0">
        <span className={`${sizeClasses[size]} truncate`}>{value}</span>
        {sparkline ? (
          <span
            className="inline-flex items-center self-center shrink-0"
            aria-hidden
          >
            {sparkline}
          </span>
        ) : null}
      </div>
      {delta || sub ? (
        <div className="flex items-center gap-2 text-[12px]">
          {delta ? (
            <span className={`tabular-nums font-medium ${toneClasses[deltaTone]}`}>
              {delta}
            </span>
          ) : null}
          {sub ? <span className="text-v2-text-muted">{sub}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
