/**
 * BuyVsWaitView — server component.
 * Scenario: "What if I buy now vs wait N months?"
 *
 * Inputs (URL params):
 *   bvw_price          Target price (default 750000)
 *   bvw_months         Wait period in months (default 12)
 *   bvw_growth         Annual capital growth % (default 5)
 *   bvw_opp_rate       Opportunity rate on idle deposit % (default 7)
 *   bvw_deposit_pct    Deposit % (default 20)
 *
 * All inputs submit via GET form so server re-renders with new values.
 */

import * as React from "react";
import { SurfaceCard, KpiCard, MetricRow } from "@/components/workspace/cards";
import { fmtMoney, fmtMoneyCompact, fmtPercent } from "@/components/workspace/format";
import { BarRow } from "@/components/workspace/charts";
import { inputCls } from "@/components/workspace/forms/Field";

interface Props {
  basePath: string;
  searchParams: Record<string, string>;
}

const safeN = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v as string) : (v as number);
  return Number.isFinite(n) ? n : fallback;
};

export function BuyVsWaitView({ basePath, searchParams }: Props) {
  // ── Parse inputs ──────────────────────────────────────────────────────────
  const price       = safeN(searchParams.bvw_price,      750_000);
  const months      = safeN(searchParams.bvw_months,     12);
  const growthPct   = safeN(searchParams.bvw_growth,     5);      // % p.a.
  const oppRatePct  = safeN(searchParams.bvw_opp_rate,   7);      // % p.a.
  const depositPct  = safeN(searchParams.bvw_deposit_pct, 20);    // %

  const depositFrac = depositPct / 100;
  const growthRate  = growthPct / 100;
  const oppRate     = oppRatePct / 100;
  const years       = months / 12;

  // ── BUY NOW scenario ──────────────────────────────────────────────────────
  const depositNow      = price * depositFrac;
  const loanNow         = price - depositNow;
  // Property value at end of wait period
  const valueBuyNow     = price * Math.pow(1 + growthRate, years);
  const equityBuyNow    = valueBuyNow - loanNow;
  // Growth captured
  const growthCaptured  = valueBuyNow - price;

  // ── WAIT N MONTHS scenario ────────────────────────────────────────────────
  // Property is more expensive by then
  const priceWait       = price * Math.pow(1 + growthRate, years);
  const depositWait     = priceWait * depositFrac;
  const loanWait        = priceWait - depositWait;
  // The deposit capital earns opportunity return while waiting
  const depositGrowth   = depositNow * (Math.pow(1 + oppRate, years) - 1);
  // But we need a larger deposit by then
  const extraDepositNeeded = depositWait - depositNow - depositGrowth;

  // Value and equity at same point in time (end of wait period — day 0 of ownership)
  const valueWait       = priceWait;
  const equityWait      = depositWait;

  // ── Delta ─────────────────────────────────────────────────────────────────
  // "Cost of waiting" in equity terms: what you'd have vs what you get
  const waitEquityDelta = equityBuyNow - equityWait;
  // Price delta
  const priceDelta      = priceWait - price;
  // Opportunity savings (deposit earned more while waiting)
  const oppSavings      = depositGrowth;

  const waitCostsMore   = priceDelta > oppSavings;

  return (
    <div className="space-y-8">
      {/* ── Inputs ────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[01]</span>
          <span>Scenario Inputs</span>
        </div>
        <SurfaceCard>
          <form method="GET" action={`${basePath}`} className="space-y-4">
            <input type="hidden" name="tab" value="buy-vs-wait" />
            <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <label className="block space-y-1.5">
                <span className="text-caption text-ink-secondary font-medium">Target price (AUD)</span>
                <input
                  type="number" name="bvw_price" min="0" step="1"
                  defaultValue={price}
                  className={inputCls}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-caption text-ink-secondary font-medium">Months to wait</span>
                <input
                  type="number" name="bvw_months" min="0" max="240" step="1"
                  defaultValue={months}
                  className={inputCls}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-caption text-ink-secondary font-medium">Capital growth (% p.a.)</span>
                <input
                  type="number" name="bvw_growth" min="0" max="30" step="0.5"
                  defaultValue={growthPct}
                  className={inputCls}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-caption text-ink-secondary font-medium">Opportunity rate (% p.a.)</span>
                <input
                  type="number" name="bvw_opp_rate" min="0" max="30" step="0.5"
                  defaultValue={oppRatePct}
                  className={inputCls}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-caption text-ink-secondary font-medium">Deposit (%)</span>
                <input
                  type="number" name="bvw_deposit_pct" min="5" max="100" step="5"
                  defaultValue={depositPct}
                  className={inputCls}
                />
              </label>
            </div>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-ember-500 text-white text-body-sm font-medium hover:bg-ember-600 transition-colors"
            >
              Compare
            </button>
          </form>
        </SurfaceCard>
      </section>

      {/* ── Side-by-side scenario cards ───────────────────────────────────── */}
      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[02]</span>
          <span>Scenario Comparison</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* BUY NOW */}
          <SurfaceCard>
            <div className="syslabel mb-4">
              <span className="syslabel-bracket text-emerald-600">[BUY NOW]</span>
              <span className="text-emerald-700 font-medium">Purchase immediately</span>
            </div>
            <div className="divide-y divide-line/60">
              <MetricRow label="Purchase price"         value={fmtMoney(price)} />
              <MetricRow label="Deposit required"       value={fmtMoney(depositNow)} />
              <MetricRow label="Loan amount"            value={fmtMoney(loanNow)} tone="warning" />
              <MetricRow
                label={`Property value in ${months} months`}
                value={fmtMoney(valueBuyNow)}
                tone="positive"
              />
              <MetricRow
                label={`Equity in ${months} months`}
                value={fmtMoney(equityBuyNow)}
                tone="positive"
              />
              <MetricRow label="Growth captured"        value={fmtMoney(growthCaptured)} tone="positive" />
            </div>
          </SurfaceCard>

          {/* WAIT N MONTHS */}
          <SurfaceCard>
            <div className="syslabel mb-4">
              <span className="syslabel-bracket text-ember-600">[WAIT {months}mo]</span>
              <span className="text-ember-700 font-medium">Wait {months} months</span>
            </div>
            <div className="divide-y divide-line/60">
              <MetricRow label="Purchase price then"    value={fmtMoney(priceWait)} />
              <MetricRow label="Deposit required then"  value={fmtMoney(depositWait)} />
              <MetricRow label="Loan amount then"       value={fmtMoney(loanWait)} tone="warning" />
              <MetricRow label="Price increase"         value={fmtMoney(priceDelta)} tone="negative" />
              <MetricRow
                label={`Deposit earnings (${oppRatePct}% opp. rate)`}
                value={fmtMoney(oppSavings)}
                tone="positive"
              />
              <MetricRow
                label="Extra deposit needed"
                value={fmtMoney(Math.max(0, extraDepositNeeded))}
                tone={extraDepositNeeded > 0 ? "negative" : "positive"}
              />
            </div>
          </SurfaceCard>
        </div>
      </section>

      {/* ── Delta tile ────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[03]</span>
          <span>Net Impact of Waiting</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiCard
            label="Price delta"
            value={priceDelta}
            format="moneyCompact"
            tone="negative"
            sub={`+${fmtPercent(growthRate * years)} over ${months} months`}
          />
          <KpiCard
            label="Opportunity gain"
            value={oppSavings}
            format="moneyCompact"
            tone="positive"
            sub={`Deposit at ${oppRatePct}% for ${months} months`}
          />
          <KpiCard
            label={waitCostsMore ? "Waiting costs you" : "Waiting saves you"}
            value={Math.abs(waitEquityDelta)}
            format="moneyCompact"
            tone={waitCostsMore ? "negative" : "positive"}
            sub={waitCostsMore
              ? "Buy now to capture that equity"
              : "Waiting builds a larger deposit"}
          />
        </div>

        {/* BarRow comparison */}
        <SurfaceCard>
          <p className="text-caption text-ink-quaternary mb-4">Equity position comparison at end of {months} months</p>
          <BarRow
            rows={[
              { label: "Equity if buy now",  value: equityBuyNow,  color: "#3FA88F" },
              { label: "Equity if wait",     value: equityWait,    color: "#E0A040" },
              { label: "Opportunity gain",   value: oppSavings,    color: "#5085D9" },
              { label: "Price increase",     value: priceDelta,    color: "#C24A6B" },
            ]}
          />
        </SurfaceCard>
      </section>

      <p className="text-caption text-ink-quaternary italic">
        Assumptions: {growthPct}% p.a. capital growth, {oppRatePct}% opportunity rate on idle deposit, {depositPct}% deposit.
        This is illustrative only — consult a financial adviser before making property decisions.
      </p>
    </div>
  );
}
