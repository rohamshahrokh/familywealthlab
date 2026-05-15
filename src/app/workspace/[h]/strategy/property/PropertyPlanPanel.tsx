"use client";

import * as React from "react";
import { SurfaceCard } from "@/components/workspace/cards";
import { MetricCard } from "@/components/workspace/charts-interactive";
import { Field, inputCls } from "@/components/workspace/forms/Field";
import {
  projectProperty, lvr, usableEquity,
  type PropertyEngineInput, type PropertyEngineYear,
} from "@/lib/finance/propertyEngine";
import type { TaxRuleset, GearingRule, TaxMode } from "@/lib/finance/taxEngine";
import { fmtMoney, fmtMoneyCompact, fmtPercent } from "@/components/workspace/format";
import { Property30YChart } from "./Property30YChart";
import { PropertyCashflowBars } from "./PropertyCashflowBars";
import { PropertyForecastSection } from "@/components/finance/PropertyForecastSection";

interface Props {
  initial: PropertyEngineInput;
}

const TOGGLE_GROUP = "inline-flex rounded-xl border border-line bg-bg-inset p-1 text-caption mono uppercase tracking-wider";
const TOGGLE = (active: boolean) =>
  `px-3 h-8 inline-flex items-center rounded-lg transition-colors duration-tactile ${
    active ? "bg-ink-primary text-white" : "text-ink-tertiary hover:text-ink-primary hover:bg-bg-base/60"
  }`;

export function PropertyPlanPanel({ initial }: Props) {
  const [purchase, setPurchase] = React.useState(initial.purchasePrice);
  const [value, setValue] = React.useState(initial.currentValue);
  const [loan, setLoan] = React.useState(initial.loanBalance);
  const [rate, setRate] = React.useState(initial.interestRate);
  const [term, setTerm] = React.useState(initial.loanTermYears);
  const [rent, setRent] = React.useState(initial.rentalIncomePA);
  const [opex, setOpex] = React.useState(initial.operatingExpensesPA);
  const [growth, setGrowth] = React.useState(initial.growthRate);
  const [rentGrowth, setRentGrowth] = React.useState(initial.rentGrowthRate);
  const [isIp, setIsIp] = React.useState(initial.isInvestment);
  const [ruleset, setRuleset] = React.useState<TaxRuleset>(initial.ruleset ?? "ato_current");
  const [gearing, setGearing] = React.useState<GearingRule>(initial.gearingRule ?? "old_formula");
  const [taxMode, setTaxMode] = React.useState<TaxMode>("payg");
  const [periodic, setPeriodic] = React.useState<"monthly" | "annual">("annual");

  const projection = React.useMemo(() => projectProperty({
    purchasePrice: purchase,
    currentValue: value,
    loanBalance: loan,
    interestRate: rate,
    loanTermYears: term,
    rentalIncomePA: rent,
    operatingExpensesPA: opex,
    growthRate: growth,
    rentGrowthRate: rentGrowth,
    acquiredAt: initial.acquiredAt,
    isInvestment: isIp,
    baseHouseholdIncome: initial.baseHouseholdIncome,
    ruleset,
    gearingRule: gearing,
  }, 30), [purchase, value, loan, rate, term, rent, opex, growth, rentGrowth, isIp, ruleset, gearing, initial.acquiredAt, initial.baseHouseholdIncome]);

  const ppLvr = lvr(loan, value);
  const usable = usableEquity(value, loan);
  const year5 = projection.rows[4];
  const year10 = projection.rows[9];
  const year30 = projection.rows[29];

  return (
    <div className="space-y-6">
      {/* ── Inputs ─────────────────────────────────────────────── */}
      <SurfaceCard>
        <div className="syslabel mb-4"><span className="syslabel-bracket">[A]</span><span>Property & loan</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Purchase price">
            <input type="number" value={purchase} onChange={(e) => setPurchase(+e.target.value)} className={inputCls} />
          </Field>
          <Field label="Current value">
            <input type="number" value={value} onChange={(e) => setValue(+e.target.value)} className={inputCls} />
          </Field>
          <Field label="Loan balance">
            <input type="number" value={loan} onChange={(e) => setLoan(+e.target.value)} className={inputCls} />
          </Field>
          <Field label="Interest rate (%)">
            <input type="number" step="0.001" value={(rate * 100).toFixed(2)} onChange={(e) => setRate(+e.target.value / 100)} className={inputCls} />
          </Field>
          <Field label="Loan term (years)">
            <input type="number" value={term} onChange={(e) => setTerm(+e.target.value)} className={inputCls} />
          </Field>
          <Field label="Rental income / yr" hint="0 if PPOR">
            <input type="number" value={rent} onChange={(e) => setRent(+e.target.value)} className={inputCls} />
          </Field>
          <Field label="Operating expenses / yr">
            <input type="number" value={opex} onChange={(e) => setOpex(+e.target.value)} className={inputCls} />
          </Field>
          <Field label="Capital growth (%)">
            <input type="number" step="0.01" value={(growth * 100).toFixed(2)} onChange={(e) => setGrowth(+e.target.value / 100)} className={inputCls} />
          </Field>
          <Field label="Rent growth (%)">
            <input type="number" step="0.01" value={(rentGrowth * 100).toFixed(2)} onChange={(e) => setRentGrowth(+e.target.value / 100)} className={inputCls} />
          </Field>
          <Field label="Use case">
            <div className={TOGGLE_GROUP}>
              <button type="button" className={TOGGLE(!isIp)} onClick={() => setIsIp(false)}>PPOR</button>
              <button type="button" className={TOGGLE(isIp)} onClick={() => setIsIp(true)}>Investment</button>
            </div>
          </Field>
        </div>
      </SurfaceCard>

      {/* ── Tax & rule toggles ─────────────────────────────────── */}
      <SurfaceCard>
        <div className="syslabel mb-4"><span className="syslabel-bracket">[B]</span><span>Tax & rule set</span></div>
        <div className="flex flex-wrap gap-3">
          <ToggleGroup label="ATO rules" value={ruleset} onChange={setRuleset}
            options={[["ato_current","Current"],["ato_2027","2027 proposal"]]} />
          <ToggleGroup label="Gearing" value={gearing} onChange={setGearing}
            options={[["old_formula","Old formula"],["new_formula","New formula"]]} />
          <ToggleGroup label="Tax mode" value={taxMode} onChange={setTaxMode}
            options={[["lump_sum","Lump-sum"],["payg","PAYG"]]} />
          <ToggleGroup label="Period" value={periodic} onChange={setPeriodic}
            options={[["annual","Annual"],["monthly","Monthly"]]} />
        </div>
        <p className="mt-3 text-caption text-ink-tertiary">
          Modelling estimate. Switch rule sets to see how negative gearing reform would change net cashflow.
        </p>
      </SurfaceCard>

      {/* ── 30Y projection chart ───────────────────────────────── */}
      <SurfaceCard>
        <div className="syslabel mb-3"><span className="syslabel-bracket">[C]</span><span>30-year projection · value · loan · equity</span></div>
        <Property30YChart rows={projection.rows} />
      </SurfaceCard>

      {/* ── Cashflow bars (deterministic, preserved) ──────────── */}
      <SurfaceCard>
        <div className="syslabel mb-3"><span className="syslabel-bracket">[D]</span><span>Annual cashflow · gearing · refund</span></div>
        <PropertyCashflowBars rows={projection.rows} period={periodic} />
      </SurfaceCard>

      {/* ── Forecast Intelligence Engine v1 (additive) ─────────── */}
      <PropertyForecastSection
        input={{
          purchasePrice: purchase,
          currentValue: value,
          loanBalance: loan,
          interestRate: rate,
          loanTermYears: term,
          rentalIncomePA: rent,
          operatingExpensesPA: opex,
          growthRate: growth,
          rentGrowthRate: rentGrowth,
          acquiredAt: initial.acquiredAt,
          isInvestment: isIp,
          baseHouseholdIncome: initial.baseHouseholdIncome,
          ruleset,
          gearingRule: gearing,
        }}
        period={periodic}
      />

      {/* ── Key metrics ────────────────────────────────────────── */}
      <section>
        <div className="syslabel mb-3"><span className="syslabel-bracket">[E]</span><span>Headline projection</span></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard index="·" label="EQUITY · YEAR 5" value={year5?.equity ?? 0} format="moneyCompact" sub="At end of year 5" />
          <MetricCard index="·" label="EQUITY · YEAR 10" value={year10?.equity ?? 0} format="moneyCompact" sub="At end of year 10" />
          <MetricCard index="·" label="EQUITY · YEAR 30" value={year30?.equity ?? 0} format="moneyCompact" sub="At loan term end" />
          <MetricCard index="·" label="USABLE EQUITY" value={usable} format="moneyCompact" sub={`LVR ${fmtPercent(ppLvr)}`} />
          <MetricCard index="·" label="TOTAL REFUND · 30Y" value={projection.totalRefund} format="moneyCompact" sub="Cumulative gearing refund" />
          <MetricCard index="·" label="NET CF · 30Y" value={projection.totalNetCash} format="moneyCompact"
            tone={projection.totalNetCash >= 0 ? "positive" : "negative"} sub="Cumulative net cashflow" />
          <MetricCard index="·" label="POSITIVE CF YEARS" value={projection.totalCfPositiveYears} format="raw" sub="Years cashflow ≥ 0" />
          <MetricCard index="·" label="NEGATIVE CF YEARS" value={projection.totalCfNegativeYears} format="raw"
            tone={projection.totalCfNegativeYears > 5 ? "negative" : "neutral"} sub="Years cashflow < 0" />
        </div>
      </section>

      {/* ── Year-by-year table ────────────────────────────────── */}
      <SurfaceCard>
        <div className="syslabel mb-3"><span className="syslabel-bracket">[F]</span><span>Year-by-year</span></div>
        <YearTable rows={projection.rows} />
      </SurfaceCard>
    </div>
  );
}

function YearTable({ rows }: { rows: PropertyEngineYear[] }) {
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-caption text-ink-secondary min-w-[640px]">
        <thead className="text-ink-quaternary uppercase tracking-wider">
          <tr className="border-b border-line">
            <th className="text-left px-2 py-2">Year</th>
            <th className="text-right px-2 py-2">Value</th>
            <th className="text-right px-2 py-2">Loan</th>
            <th className="text-right px-2 py-2">Equity</th>
            <th className="text-right px-2 py-2">Rent</th>
            <th className="text-right px-2 py-2">Interest</th>
            <th className="text-right px-2 py-2">Refund</th>
            <th className="text-right px-2 py-2">Net CF</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((r) => (
            <tr key={r.age} className="border-b border-line/50 hover:bg-bg-inset/40">
              <td className="px-2 py-2 text-ink-primary">{r.year}</td>
              <td className="px-2 py-2 text-right">{fmtMoneyCompact(r.propertyValue)}</td>
              <td className="px-2 py-2 text-right">{fmtMoneyCompact(r.loanBalance)}</td>
              <td className="px-2 py-2 text-right text-emerald-400">{fmtMoneyCompact(r.equity)}</td>
              <td className="px-2 py-2 text-right">{fmtMoneyCompact(r.rentalGross)}</td>
              <td className="px-2 py-2 text-right">{fmtMoneyCompact(r.interestPaid)}</td>
              <td className="px-2 py-2 text-right text-amber-300">{fmtMoneyCompact(r.taxRefund)}</td>
              <td className={`px-2 py-2 text-right ${r.netCashflow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {fmtMoneyCompact(r.netCashflow)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ToggleGroup<T extends string>({
  label, value, onChange, options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<[T, string]>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.625rem] mono uppercase tracking-wider text-ink-quaternary">{label}</span>
      <div className={TOGGLE_GROUP}>
        {options.map(([v, lab]) => (
          <button
            key={v} type="button" onClick={() => onChange(v)}
            className={TOGGLE(value === v)} aria-pressed={value === v}
          >
            {lab}
          </button>
        ))}
      </div>
    </div>
  );
}
