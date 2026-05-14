"use client";

import { useState, useTransition } from "react";
import {
  SurfaceCard, CardHeader, MetricRow, KpiCard,
} from "@/components/workspace/cards";
import { Field, inputCls } from "@/components/workspace/forms/Field";
import { fmtMoney, fmtMoneyCompact, fmtPercent } from "@/components/workspace/format";
import { runWhatIf, type WhatIfResult } from "./actions";

interface Props { householdId: string }

export function WhatIfPanel({ householdId }: Props) {
  const [extraMortgage, setExtraMortgage] = useState("500");
  const [offsetDeposit, setOffsetDeposit] = useState("0");
  const [salaryChange, setSalaryChange] = useState("0");
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const em = Number(extraMortgage);
    const od = Number(offsetDeposit);
    const sc = Number(salaryChange);
    if (![em, od, sc].every(Number.isFinite)) {
      setError("All inputs must be numeric.");
      return;
    }
    start(async () => {
      const r = await runWhatIf({
        householdId,
        extraMortgagePerMonth: Math.max(0, em),
        offsetDeposit: Math.max(0, od),
        salaryChange: sc,
      });
      if (r.ok) {
        setResult(r);
      } else {
        setError(r.error);
        setResult(null);
      }
    });
  };

  const reset = () => {
    setExtraMortgage("0");
    setOffsetDeposit("0");
    setSalaryChange("0");
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      <SurfaceCard>
        <CardHeader index="[A·1]" eyebrow="Scenario inputs" title="Define your what-if" />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          Enter changes you're considering. The engine runs your real ledger twice — once unchanged, once with these deltas applied — and shows the difference.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Extra mortgage repayment" hint="Per month, AUD">
              <input
                type="number" inputMode="decimal" className={inputCls}
                value={extraMortgage} onChange={(e) => setExtraMortgage(e.target.value)}
                min={0} step={100}
              />
            </Field>
            <Field label="Offset deposit" hint="One-time, AUD">
              <input
                type="number" inputMode="decimal" className={inputCls}
                value={offsetDeposit} onChange={(e) => setOffsetDeposit(e.target.value)}
                min={0} step={1000}
              />
            </Field>
            <Field label="Salary change" hint="Annual, AUD (can be negative)">
              <input
                type="number" inputMode="decimal" className={inputCls}
                value={salaryChange} onChange={(e) => setSalaryChange(e.target.value)}
                step={1000}
              />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit" disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-5 h-10 text-body-sm font-medium hover:bg-graphite-800 transition-colors focus-ring disabled:opacity-50"
            >
              {pending ? "Simulating…" : "Run what-if"}
            </button>
            <button
              type="button" onClick={reset}
              className="text-body-sm text-ink-tertiary hover:text-ink-primary focus-ring rounded-full px-3 h-10"
            >
              Reset
            </button>
            {error && <span className="text-body-sm text-rose-600">{error}</span>}
          </div>
        </form>
      </SurfaceCard>

      {result && (
        <>
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              index="·" label="SURVIVAL" value={result.scenario.survivalPct} format="percent"
              sub={signedPct(result.deltas.survivalPctDelta)}
              tone={result.deltas.survivalPctDelta > 0.005 ? "positive" : result.deltas.survivalPctDelta < -0.005 ? "negative" : "neutral"}
            />
            <KpiCard
              index="·" label="MEDIAN TERMINAL NW" value={result.scenario.medianTerminalNw} format="moneyCompact"
              sub={signedMoney(result.deltas.medianTerminalNwDelta)}
              tone={result.deltas.medianTerminalNwDelta > 0 ? "positive" : result.deltas.medianTerminalNwDelta < 0 ? "negative" : "neutral"}
            />
            <KpiCard
              index="·" label="DEFAULT PROB" value={result.scenario.defaultProb} format="percent"
              sub={signedPct(result.deltas.defaultProbDelta, true)}
              tone={result.deltas.defaultProbDelta < -0.005 ? "positive" : result.deltas.defaultProbDelta > 0.005 ? "negative" : "neutral"}
            />
            <KpiCard
              index="·" label="LIQUIDITY STRESS" value={result.scenario.liquidityProb} format="percent"
              sub={signedPct(result.deltas.liquidityProbDelta, true)}
              tone={result.deltas.liquidityProbDelta < -0.005 ? "positive" : result.deltas.liquidityProbDelta > 0.005 ? "negative" : "neutral"}
            />
          </section>

          <SurfaceCard>
            <CardHeader index="[B·1]" eyebrow="Comparison" title="Baseline vs scenario" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1 mt-2">
              <div className="syslabel"><span className="syslabel-bracket">·</span><span>Metric</span></div>
              <div className="syslabel"><span className="syslabel-bracket">·</span><span>Baseline</span></div>
              <div className="syslabel"><span className="syslabel-bracket">·</span><span>Scenario</span></div>
              <MetricRow label="Survival" value={fmtPercent(result.baseline.survivalPct)} />
              <MetricRow label="" value={fmtPercent(result.scenario.survivalPct)} />
              <MetricRow label="Median NW" value={fmtMoney(result.baseline.medianTerminalNw)} />
              <MetricRow label="" value={fmtMoney(result.scenario.medianTerminalNw)} />
              <MetricRow label="Default prob" value={fmtPercent(result.baseline.defaultProb)} />
              <MetricRow label="" value={fmtPercent(result.scenario.defaultProb)} />
              <MetricRow label="Liquidity prob" value={fmtPercent(result.baseline.liquidityProb)} />
              <MetricRow label="" value={fmtPercent(result.scenario.liquidityProb)} />
            </div>
          </SurfaceCard>
        </>
      )}
    </div>
  );
}

function signedMoney(n: number): string {
  if (n === 0) return "no change";
  return `${n > 0 ? "+" : ""}${fmtMoneyCompact(n)} vs baseline`;
}
function signedPct(n: number, lowerIsBetter = false): string {
  if (Math.abs(n) < 0.0001) return "no change";
  const sign = n > 0 ? "+" : "";
  const tag = lowerIsBetter ? (n < 0 ? "better" : "worse") : (n > 0 ? "better" : "worse");
  return `${sign}${fmtPercent(n)} (${tag})`;
}
