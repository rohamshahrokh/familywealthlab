import * as React from "react";
import { cn } from "@/lib/utils";
import { fmtMoney } from "../format";

export interface DecisionHeaderProps {
  /** Candidate / scenario label e.g. "Baseline (Hold)". */
  name: string;
  /** "[D01]" style accent. */
  index?: string;
  /** Survival probability 0..1 — when not provided we hide the badge. */
  survivalProbability?: number | null;
  /** Engine initial net worth — anchors the headline. */
  initialNetWorth: number;
  /** Engine terminal NW median — what the candidate projects to. */
  terminalNetWorthMedian?: number | null;
  /** Horizon in months. */
  horizonMonths: number;
  className?: string;
}

/**
 * DecisionHeader — the "name plate" sitting at the top of any scenario /
 * decision result card. Owns the survival badge, NW arc, and horizon caption.
 */
export function DecisionHeader({
  name,
  index = "[D01]",
  survivalProbability,
  initialNetWorth,
  terminalNetWorthMedian,
  horizonMonths,
  className,
}: DecisionHeaderProps) {
  const years = Math.round(horizonMonths / 12);
  const survivalPct =
    survivalProbability != null && Number.isFinite(survivalProbability)
      ? Math.round(survivalProbability * 100)
      : null;
  const survivalTone =
    survivalPct == null
      ? "neutral"
      : survivalPct >= 80
        ? "positive"
        : survivalPct >= 60
          ? "warning"
          : "negative";

  return (
    <div className={cn("flex items-start justify-between gap-6 flex-wrap", className)}>
      <div className="min-w-0">
        <div className="syslabel mb-2">
          <span className="syslabel-bracket">{index}</span>
          <span>Decision Candidate</span>
        </div>
        <h2 className="text-h4 sm:text-h3 font-semibold text-ink-primary tracking-tight">{name}</h2>
        <p className="text-body-sm text-ink-tertiary mt-1">
          Projected {years}-year outcome from your current ledger position.
        </p>
      </div>

      {survivalPct != null && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-full px-4 h-9 border text-body-sm font-medium",
            survivalTone === "positive" && "border-emerald-200 bg-emerald-50/60 text-emerald-700",
            survivalTone === "warning"  && "border-ember-200 bg-ember-50/60 text-ember-700",
            survivalTone === "negative" && "border-rose-200 bg-rose-50/60 text-rose-700",
            survivalTone === "neutral"  && "border-line bg-white text-ink-secondary",
          )}
        >
          <span className="live-dot-ember" aria-hidden />
          <span className="num">Survival {survivalPct}%</span>
        </div>
      )}

      <div className="basis-full grid grid-cols-2 gap-4 sm:gap-6">
        <div>
          <div className="syslabel mb-1.5">
            <span className="syslabel-bracket">→</span>
            <span>Today</span>
          </div>
          <div className="num text-h5 sm:text-h4 font-semibold text-ink-primary">
            {fmtMoney(initialNetWorth)}
          </div>
        </div>
        <div>
          <div className="syslabel mb-1.5">
            <span className="syslabel-bracket">→</span>
            <span>Median {years}y NW</span>
          </div>
          <div className="num text-h5 sm:text-h4 font-semibold text-ink-primary">
            {terminalNetWorthMedian != null ? fmtMoney(terminalNetWorthMedian) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
