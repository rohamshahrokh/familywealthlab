"use client";

import { useState, useTransition } from "react";
import {
  SurfaceCard, CardHeader, MetricRow,
} from "@/components/workspace/cards";
import { Field, inputCls } from "@/components/workspace/forms/Field";
import { fmtMoney, fmtPercent } from "@/components/workspace/format";
import { simulateCgt, type CgtSimulationResult } from "./actions";

interface Props {
  householdId: string;
  defaultAnnualIncome: number;
}

/**
 * Interactive CGT simulator. All math runs server-side via the
 * `simulateCgt` action — this client component owns input state and
 * renders the result. Default inputs are realistic (income from the
 * household snapshot) so the first click is meaningful.
 */
export function CgtSimulator({ householdId, defaultAnnualIncome }: Props) {
  const [salePrice, setSalePrice] = useState("750000");
  const [costBase, setCostBase] = useState("500000");
  const [held, setHeld] = useState(true);
  const [income, setIncome] = useState(String(defaultAnnualIncome));
  const [result, setResult] = useState<CgtSimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const sp = Number(salePrice);
    const cb = Number(costBase);
    const ai = Number(income);
    if (!Number.isFinite(sp) || !Number.isFinite(cb) || !Number.isFinite(ai)) {
      setError("Enter numeric sale price, cost base, and annual income.");
      return;
    }
    start(async () => {
      const r = await simulateCgt({
        householdId, salePrice: sp, costBase: cb,
        heldMoreThan12Months: held, annualWageIncome: ai,
      });
      setResult(r);
      if (!r.ok) setError(r.error);
    });
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <SurfaceCard className="lg:col-span-2">
        <CardHeader index="[A]" eyebrow="Inputs" title="Sale parameters" />
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Sale price (AUD)">
            <input className={inputCls} value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)} inputMode="decimal" />
          </Field>
          <Field label="Cost base (AUD)"
            hint="Purchase price + stamp duty + legals + acquisition costs.">
            <input className={inputCls} value={costBase}
              onChange={(e) => setCostBase(e.target.value)} inputMode="decimal" />
          </Field>
          <Field label="Annual wage income in year of sale">
            <input className={inputCls} value={income}
              onChange={(e) => setIncome(e.target.value)} inputMode="decimal" />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={held}
              onChange={(e) => setHeld(e.target.checked)}
              className="h-4 w-4 rounded border-line text-ember-600 focus:ring-ember-500" />
            <span className="text-body-sm text-ink-primary">Held more than 12 months (50% discount applies)</span>
          </label>
          {error && <p className="text-body-sm text-rose-600">{error}</p>}
          <button type="submit" disabled={pending}
            className="inline-flex items-center justify-center rounded-full bg-ink-primary text-white px-5 h-10 text-body-sm font-medium hover:bg-graphite-800 transition-colors focus-ring disabled:opacity-50">
            {pending ? "Calculating…" : "Run simulation"}
          </button>
        </form>
      </SurfaceCard>

      <SurfaceCard className="lg:col-span-3">
        <CardHeader index="[B]" eyebrow="Result" title="CGT outcome" />
        {!result || !result.ok ? (
          <p className="text-body-sm text-ink-tertiary">
            Run the simulation to see the discounted gain, CGT payable, and net proceeds. All math is performed by the engine — these numbers are the same as the Decision Engine would use.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <ResultTile label="Raw gain" value={fmtMoney(result.rawGain)} />
              <ResultTile label="Discounted gain" value={fmtMoney(result.discountedGain)}
                tone={result.discountedGain < result.rawGain ? "ok" : "neutral"} />
              <ResultTile label="CGT payable" value={fmtMoney(result.cgtPayable)}
                tone={result.cgtPayable > 0 ? "warning" : "ok"} />
              <ResultTile label="Net proceeds" value={fmtMoney(result.netProceeds)} tone="ok" />
            </div>
            <div className="border-t border-line pt-4">
              <MetricRow label="Effective CGT rate"
                value={result.rawGain > 0 ? fmtPercent(result.cgtPayable / result.rawGain) : "—"} />
              <MetricRow label="Discount applied"
                value={held ? "50% (held > 12 months)" : "0% (held < 12 months)"} />
            </div>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

function ResultTile({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warning" | "neutral" }) {
  const toneCls = tone === "ok" ? "text-emerald-700"
    : tone === "warning" ? "text-ember-700"
      : "text-ink-primary";
  return (
    <div className="card-inset p-4">
      <div className="syslabel mb-1.5"><span className="syslabel-bracket">·</span><span>{label}</span></div>
      <div className={`text-h6 font-semibold tabular ${toneCls}`}>{value}</div>
    </div>
  );
}
