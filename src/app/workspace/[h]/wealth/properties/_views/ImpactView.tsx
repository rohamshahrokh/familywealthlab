/**
 * ImpactView — server component.
 * "Add a hypothetical IP and see the portfolio impact."
 *
 * Inputs (URL params):
 *   hypo_price        Purchase price (default 750000)
 *   hypo_deposit      Deposit $ (default 150000)
 *   hypo_rate         Interest rate decimal (default 0.065)
 *   hypo_weekly_rent  Weekly rent (default 550)
 *   hypo_growth       Annual capital growth decimal (default 0.06)
 *   hypo_loan_type    PI | IO (default PI)
 *
 * Computes current portfolio metrics vs portfolio-with-hypo metrics.
 * Shows 4-up comparison tiles and 15-year dual-trajectory AreaLine.
 */

import * as React from "react";
import { SurfaceCard, KpiCard, MetricRow } from "@/components/workspace/cards";
import { fmtMoney, fmtMoneyCompact, fmtPercent } from "@/components/workspace/format";
import { deriveCalcs, projectCashflow } from "@/lib/finance/property";
import { AreaLine } from "@/components/workspace/charts";
import { inputCls } from "@/components/workspace/forms/Field";
import type { PropertyRow } from "../PropertyForm";

interface Props {
  basePath: string;
  properties: PropertyRow[];
  searchParams: Record<string, string>;
}

const safeN = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v as string) : (v as number);
  return Number.isFinite(n) ? n : fallback;
};

const YEARS = 15;

export function ImpactView({ basePath, properties, searchParams }: Props) {
  // ── Parse hypothetical IP inputs ──────────────────────────────────────────
  const hypoPrice      = safeN(searchParams.hypo_price,       750_000);
  const hypoDeposit    = safeN(searchParams.hypo_deposit,     150_000);
  const hypoRate       = safeN(searchParams.hypo_rate,        0.065);
  const hypoWeeklyRent = safeN(searchParams.hypo_weekly_rent, 550);
  const hypoGrowth     = safeN(searchParams.hypo_growth,      0.06);
  const hypoLoanType   = (searchParams.hypo_loan_type ?? "PI") as "PI" | "IO";

  // Build hypothetical property object
  const hypo: Partial<PropertyRow> = {
    id: "hypo",
    name: "Hypothetical IP",
    type: "investment",
    purchase_price:  hypoPrice,
    current_value:   hypoPrice,
    deposit:         hypoDeposit,
    loan_amount:     Math.max(0, hypoPrice - hypoDeposit),
    interest_rate:   hypoRate,
    loan_term_years: 30,
    loan_type:       hypoLoanType,
    weekly_rent:     hypoWeeklyRent,
    rental_growth:   0.03,
    vacancy_rate:    0.02,
    management_fee:  0.08,
    capital_growth:  hypoGrowth,
    insurance:       1800,
    council_rates:   2200,
    water_rates:     900,
    maintenance:     2000,
    body_corporate:  0,
    land_tax:        0,
    projection_years: YEARS,
    // required fields with defaults
    stamp_duty: null, legal_fees: null, building_inspection: null,
    loan_setup_fees: null, purchase_date: null, settlement_date: null,
    io_period_start: null, io_period_end: null, offset_balance: null,
    rental_income: null, rental_start_date: null, expenses: null,
    renovation_costs: null, planned_sale_date: null, selling_costs: null,
    notes: null,
  };

  // ── Current portfolio aggregations ────────────────────────────────────────
  const curValue     = properties.reduce((s, p) => s + (p.current_value ?? 0), 0);
  const curLoans     = properties.reduce((s, p) => s + (p.loan_amount  ?? 0), 0);
  const curEquity    = curValue - curLoans;
  const curLvr       = curValue > 0 ? curLoans / curValue : 0;
  const curMonthlyCF = properties
    .filter((p) => p.type === "investment")
    .reduce((s, p) => s + deriveCalcs(p).monthlyCashFlow, 0);

  // ── Portfolio-with-hypo aggregations ─────────────────────────────────────
  const hypoCalcs    = deriveCalcs(hypo as Parameters<typeof deriveCalcs>[0]);
  const newValue     = curValue  + (hypo.current_value ?? 0);
  const newLoans     = curLoans  + hypoCalcs.loanAmount;
  const newEquity    = newValue  - newLoans;
  const newLvr       = newValue  > 0 ? newLoans / newValue : 0;
  const newMonthlyCF = curMonthlyCF + hypoCalcs.monthlyCashFlow;

  // 10-year net worth delta (equity at year 10 comparison)
  const hypoProj     = projectCashflow(hypo as Parameters<typeof projectCashflow>[0], YEARS);
  const hypoY10      = hypoProj[10] ?? hypoProj[hypoProj.length - 1];
  const netWorthDelta = hypoY10 ? hypoY10.equity : 0;

  // ── 15-year trajectories ──────────────────────────────────────────────────
  // Aggregate current portfolio equity per year
  const portfolioProjs = properties.map((p) =>
    projectCashflow(p, YEARS)
  );

  const currentEquityByYear: number[] = Array.from({ length: YEARS + 1 }, (_, i) =>
    portfolioProjs.reduce((s, proj) => s + (proj[i]?.equity ?? 0), 0)
  );

  const withHypoEquityByYear: number[] = Array.from({ length: YEARS + 1 }, (_, i) =>
    currentEquityByYear[i] + (hypoProj[i]?.equity ?? 0)
  );

  const xLabels = Array.from({ length: YEARS + 1 }, (_, i) =>
    String(new Date().getFullYear() + i)
  );

  return (
    <div className="space-y-8">
      {/* ── Hypothetical IP inputs ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[01]</span>
          <span>Hypothetical IP Parameters</span>
        </div>
        <SurfaceCard>
          <form method="GET" action={`${basePath}`} className="space-y-4">
            <input type="hidden" name="tab" value="impact" />
            <div className="grid sm:grid-cols-3 gap-4">
              <label className="block space-y-1.5">
                <span className="text-caption text-ink-secondary font-medium">Purchase price (AUD)</span>
                <input
                  type="number" name="hypo_price" min="0" step="1"
                  defaultValue={hypoPrice}
                  className={inputCls}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-caption text-ink-secondary font-medium">Deposit (AUD)</span>
                <input
                  type="number" name="hypo_deposit" min="0" step="1"
                  defaultValue={hypoDeposit}
                  className={inputCls}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-caption text-ink-secondary font-medium">Interest rate (decimal)</span>
                <input
                  type="number" name="hypo_rate" min="0" max="1" step="0.001"
                  defaultValue={hypoRate}
                  className={inputCls}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-caption text-ink-secondary font-medium">Weekly rent (AUD)</span>
                <input
                  type="number" name="hypo_weekly_rent" min="0" step="1"
                  defaultValue={hypoWeeklyRent}
                  className={inputCls}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-caption text-ink-secondary font-medium">Capital growth (decimal)</span>
                <input
                  type="number" name="hypo_growth" min="0" max="1" step="0.005"
                  defaultValue={hypoGrowth}
                  className={inputCls}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-caption text-ink-secondary font-medium">Loan type</span>
                <select
                  name="hypo_loan_type"
                  defaultValue={hypoLoanType}
                  className={inputCls}
                >
                  <option value="PI">Principal &amp; Interest</option>
                  <option value="IO">Interest Only</option>
                </select>
              </label>
            </div>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-ember-500 text-white text-body-sm font-medium hover:bg-ember-600 transition-colors"
            >
              Recalculate
            </button>
          </form>
        </SurfaceCard>
      </section>

      {/* ── 4-up comparison KPIs ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[02]</span>
          <span>Portfolio Impact — Current vs With Hypothetical IP</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* LVR */}
          <div className="space-y-2">
            <KpiCard
              label="LVR — Current"
              value={curLvr}
              format="percent"
              tone={curLvr * 100 > 95 ? "negative" : curLvr * 100 > 80 ? "warning" : "neutral"}
              sub="current portfolio"
            />
            <KpiCard
              label="LVR — With IP"
              value={newLvr}
              format="percent"
              tone={newLvr * 100 > 95 ? "negative" : newLvr * 100 > 80 ? "warning" : "neutral"}
              sub="after adding hypo IP"
              delta={(newLvr - curLvr) * 100}
              deltaSuffix="%"
            />
          </div>

          {/* Equity */}
          <div className="space-y-2">
            <KpiCard
              label="Equity — Current"
              value={curEquity}
              format="moneyCompact"
              tone="positive"
              sub="today"
            />
            <KpiCard
              label="Equity — With IP"
              value={newEquity}
              format="moneyCompact"
              tone="positive"
              sub="after adding hypo IP"
              delta={newEquity - curEquity}
            />
          </div>

          {/* Monthly CF */}
          <div className="space-y-2">
            <KpiCard
              label="Monthly CF — Current"
              value={curMonthlyCF}
              format="money"
              tone={curMonthlyCF >= 0 ? "positive" : "negative"}
              sub="IP portfolio"
            />
            <KpiCard
              label="Monthly CF — With IP"
              value={newMonthlyCF}
              format="money"
              tone={newMonthlyCF >= 0 ? "positive" : "negative"}
              sub="after adding hypo IP"
              delta={newMonthlyCF - curMonthlyCF}
            />
          </div>

          {/* 10-Year Net Worth Delta */}
          <div className="space-y-2">
            <KpiCard
              label="Hypo IP Equity @ 10yr"
              value={netWorthDelta}
              format="moneyCompact"
              tone="positive"
              sub="hypothetical IP alone"
            />
            <KpiCard
              label="10-Year Net Worth Δ"
              value={netWorthDelta}
              format="moneyCompact"
              tone={netWorthDelta >= 0 ? "positive" : "negative"}
              sub="added to portfolio"
              delta={netWorthDelta}
            />
          </div>
        </div>
      </section>

      {/* ── Hypothetical IP key metrics ───────────────────────────────────── */}
      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[03]</span>
          <span>Hypothetical IP — Key Metrics</span>
        </div>
        <SurfaceCard>
          <div className="grid sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0 sm:divide-x divide-line/60">
            <div className="pb-4 sm:pb-0 sm:pr-8 divide-y divide-line/60">
              <MetricRow label="Purchase price"   value={fmtMoney(hypoPrice)} />
              <MetricRow label="Deposit"          value={fmtMoney(hypoDeposit)} />
              <MetricRow label="Loan amount"      value={fmtMoney(hypoCalcs.loanAmount)} tone="warning" />
              <MetricRow label="LVR at purchase"  value={fmtPercent(hypoCalcs.lvr / 100)} tone={hypoCalcs.lvr > 80 ? "warning" : "neutral"} />
              <MetricRow label="Equity"           value={fmtMoney(hypoCalcs.equity)} tone="positive" />
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-8 divide-y divide-line/60">
              <MetricRow label="Gross yield"          value={fmtPercent(hypoCalcs.grossYield / 100)} />
              <MetricRow label="Net yield"            value={fmtPercent(hypoCalcs.netYield / 100)} tone={hypoCalcs.netYield > 0 ? "positive" : "negative"} />
              <MetricRow label="Monthly cashflow"     value={fmtMoney(hypoCalcs.monthlyCashFlow)} tone={hypoCalcs.monthlyCashFlow >= 0 ? "positive" : "negative"} />
              <MetricRow label="Monthly repayment"    value={fmtMoney(hypoCalcs.monthly)} />
              {hypoCalcs.ngAnalysis && (
                <MetricRow
                  label="Monthly tax benefit"
                  value={fmtMoney(hypoCalcs.ngAnalysis.monthlyTaxBenefit)}
                  tone="positive"
                  hint={hypoCalcs.ngAnalysis.isNegativelyGeared ? "Negatively geared" : "Positively geared"}
                />
              )}
            </div>
          </div>
        </SurfaceCard>
      </section>

      {/* ── 15-Year dual trajectory AreaLine ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[04]</span>
          <span>{YEARS}-Year Portfolio Equity Trajectory</span>
        </div>
        <SurfaceCard>
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <AreaLine
                xLabels={xLabels}
                series={[
                  { label: "Without hypo IP",   values: currentEquityByYear,  color: "#7B6CF6" },
                  { label: "With hypo IP",       values: withHypoEquityByYear, color: "#3FA88F" },
                ]}
                height={240}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6 text-caption text-ink-tertiary">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#7B6CF6" }} />
              Without hypo IP
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#3FA88F" }} />
              With hypo IP
            </span>
          </div>
        </SurfaceCard>
      </section>

      <p className="text-caption text-ink-quaternary italic">
        Illustrative only. Assumes {(hypoGrowth * 100).toFixed(1)}% p.a. growth, {(hypoRate * 100).toFixed(2)}% interest rate,
        weekly rent of {fmtMoney(hypoWeeklyRent)}, {hypoLoanType} loan.
        Consult a financial adviser before making investment decisions.
      </p>
    </div>
  );
}
