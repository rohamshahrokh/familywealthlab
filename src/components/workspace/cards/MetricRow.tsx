import * as React from "react";
import { cn } from "@/lib/utils";

export interface MetricRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "neutral" | "positive" | "negative" | "warning";
  className?: string;
}

const TONE: Record<NonNullable<MetricRowProps["tone"]>, string> = {
  neutral:  "text-ink-primary",
  positive: "text-emerald-700",
  negative: "text-rose-700",
  warning:  "text-ember-600",
};

/**
 * MetricRow — a single label/value row inside a panel. Used to compose
 * detailed sections of the Command Centre and Decision result surfaces.
 */
export function MetricRow({ label, value, hint, tone = "neutral", className }: MetricRowProps) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-2.5", className)}>
      <div className="min-w-0">
        <div className="text-body-sm text-ink-secondary truncate">{label}</div>
        {hint && <div className="text-caption text-ink-quaternary truncate mt-0.5">{hint}</div>}
      </div>
      <div className={cn("num text-body-sm font-medium tabular-nums whitespace-nowrap", TONE[tone])}>
        {value}
      </div>
    </div>
  );
}
