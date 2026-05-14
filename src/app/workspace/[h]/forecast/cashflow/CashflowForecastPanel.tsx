"use client";

import * as React from "react";
import { SurfaceCard } from "@/components/workspace/cards";
import { MetricCard, CashflowComboChart } from "@/components/workspace/charts-interactive";
import type { ComboPoint, ComboChartType } from "@/components/workspace/charts-interactive";
import {
  projectCashflow, toAnnual, computeCashflowKpis,
  type CashflowInput, type CashflowMode, type Periodicity, type ViewMode,
} from "@/lib/finance/cashflowEngine";
import type { TaxMode } from "@/lib/finance/taxEngine";
import { fmtMoney, fmtMoneyCompact, fmtPercent } from "@/components/workspace/format";

interface Props {
  initialInput: CashflowInput;
  propertyContext: {
    ppValue: number; ppLoan: number;
    ipValue: number; ipLoan: number;
    emergencyBufferMonths: number;
    monthlyExpense: number;
  };
  accessibleWealth: number;
}

const TOGGLE_GROUP = "inline-flex rounded-xl border border-line bg-bg-inset p-1 text-caption mono uppercase tracking-wider";
const TOGGLE = (active: boolean) =>
  `px-3 h-8 inline-flex items-center rounded-lg transition-colors duration-tactile ${
    active
      ? "bg-ink-primary text-white"
      : "text-ink-tertiary hover:text-ink-primary hover:bg-bg-base/60"
  }`;

export function CashflowForecastPanel({
  initialInput, propertyContext, accessibleWealth,
}: Props) {
  const [mode, setMode]           = React.useState<CashflowMode>("cash");
  const [period, setPeriod]       = React.useState<Periodicity>("monthly");
  const [taxMode, setTaxMode]     = React.useState<TaxMode>(initialInput.taxMode ?? "lump_sum");
  const [view, setView]           = React.useState<ViewMode>("cash");
  const [chartType, setChartType] = React.useState<ComboChartType>("combo");

  const input = React.useMemo<CashflowInput>(() => ({
    ...initialInput, taxMode,
  }), [initialInput, taxMode]);

  const monthlyPoints = React.useMemo(() => projectCashflow(input), [input]);
  const series = period === "annual" ? toAnnual(monthlyPoints) : monthlyPoints;

  // Adjust series based on view mode
  const adjustedSeries: ComboPoint[] = React.useMemo(() => {
    return series.map((p) => {
      let cashBalance = p.cashBalance;
      if (view === "plus_equity") cashBalance += accessibleWealth;
      if (view === "deposit_power") cashBalance = Math.max(0, p.cashBalance + accessibleWealth * 0.8);
      // mode filters which event impacts to highlight
      const showEvents = mode === "events";
      return {
        label: p.label,
        cashBalance,
        netCashflow: p.netCashflow,
        taxRefund: showEvents || mode === "cash" ? p.taxRefund : undefined,
        propertyImpact: showEvents ? p.propertyImpact : undefined,
        stockImpact: showEvents ? p.stockImpact : undefined,
        cryptoImpact: showEvents ? p.cryptoImpact : undefined,
      };
    });
  }, [series, view, mode, accessibleWealth]);

  const kpis = React.useMemo(
    () => computeCashflowKpis(monthlyPoints, propertyContext),
    [monthlyPoints, propertyContext],
  );
  const ppUsable = Math.max(0, propertyContext.ppValue * 0.8 - propertyContext.ppLoan);
  const ipUsable = Math.max(0, propertyContext.ipValue * 0.8 - propertyContext.ipLoan);

  const modeCaption = {
    cash:   "Cash balance over time. Income, expenses, and tax flow into the line.",
    events: "Every major cash event tagged on the timeline: tax refunds, property, stock, crypto.",
    wealth: "Cash + property equity overlay. Switches the line to total deployable wealth.",
    risk:   "Highlights months where cash dips below the emergency buffer floor.",
  }[mode];

  return (
    <div className="space-y-6">
      {/* ── Toggles row ────────────────────────────────────────────── */}
      <SurfaceCard>
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <ToggleGroup label="Mode" value={mode} onChange={setMode}
              options={[["cash","Cash"],["events","Events"],["wealth","Wealth"],["risk","Risk"]]} />
            <ToggleGroup label="Period" value={period} onChange={setPeriod}
              options={[["monthly","Monthly"],["annual","Annual"]]} />
            <ToggleGroup label="Tax" value={taxMode} onChange={setTaxMode}
              options={[["lump_sum","Lump-sum"],["payg","PAYG"]]} />
            <ToggleGroup label="View" value={view} onChange={setView}
              options={[["cash","Cash"],["plus_equity","+ Equity"],["deposit_power","Deposit power"]]} />
            <ToggleGroup label="Chart" value={chartType} onChange={setChartType}
              options={[["combo","Combo"],["line","Line"],["bars","Bars"]]} />
          </div>
        </div>
        <p className="mt-4 text-caption text-ink-tertiary">{modeCaption}</p>
      </SurfaceCard>

      {/* ── Chart ──────────────────────────────────────────────────── */}
      <SurfaceCard>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[A]</span>
          <span>Projection · {period === "annual" ? "annual" : "monthly"} · {chartType}</span>
        </div>
        <CashflowComboChart
          data={adjustedSeries}
          chartType={chartType}
          height={360}
          showEvents={mode === "events"}
          formatValue="moneyCompact"
        />
        <Legend />
      </SurfaceCard>

      {/* ── KPI rail ──────────────────────────────────────────────── */}
      <section>
        <div className="syslabel mb-3"><span className="syslabel-bracket">[B]</span><span>Cash + capacity</span></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard index="·" label="CASH TODAY" value={kpis.cashToday} format="moneyCompact"
            sub="Cash + offset" />
          <MetricCard index="·" label={`CASH ${kpis.cashYear.label}`} value={kpis.cashYear.value} format="moneyCompact"
            sub="Projected horizon balance" />
          <MetricCard index="·" label="ANNUAL NET CF" value={kpis.annualNetCf} format="money"
            tone={kpis.annualNetCf >= 0 ? "positive" : "negative"}
            sub="Year-1 net cashflow" />
          <MetricCard index="·" label="TAX REFUND / YEAR" value={kpis.taxRefundPerYear} format="moneyCompact"
            sub={taxMode === "lump_sum" ? "Lump-sum EOFY" : "PAYG smoothed"} />
          <MetricCard index="·" label="CASH + OFFSET" value={kpis.cashToday} format="moneyCompact"
            sub="Same as cash today (illustrative)" />
          <MetricCard index="·" label="PPOR USABLE EQUITY" value={ppUsable} format="moneyCompact"
            sub={`80% LVR − loan · ${fmtPercent(propertyContext.ppLoan / Math.max(1, propertyContext.ppValue))} LVR`} />
          <MetricCard index="·" label="IP USABLE EQUITY" value={ipUsable} format="moneyCompact"
            sub="Investment property releasable" />
          <MetricCard index="·" label="TOTAL DEPOSIT POWER" value={kpis.totalDepositPower} format="moneyCompact"
            sub="Cash + usable equity − buffer" />
          <MetricCard index="·" label="EMERGENCY BUFFER"
            value={propertyContext.monthlyExpense * propertyContext.emergencyBufferMonths}
            format="moneyCompact"
            sub={`${propertyContext.emergencyBufferMonths} months · ${fmtMoney(propertyContext.monthlyExpense)} /mo`} />
          <MetricCard index="·" label="PPOR LVR" value={kpis.ppLvr * 100} format="raw"
            sub="Loan-to-value ratio" />
          <MetricCard index="·" label="IP READINESS"
            value={kpis.ipReadiness === "ready" ? "Ready" : kpis.ipReadiness === "soon" ? "Soon" : "Not yet"}
            format="raw"
            tone={kpis.ipReadiness === "ready" ? "positive" : kpis.ipReadiness === "soon" ? "neutral" : "negative"}
            sub="Capacity for next IP" />
          <MetricCard index="·" label="EST. READY DATE" value={kpis.estimatedReadyDate} format="raw"
            sub="When deposit floor is hit" />
        </div>
      </section>
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
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={TOGGLE(value === v)}
            aria-pressed={value === v}
          >
            {lab}
          </button>
        ))}
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { color: "#C97030", label: "Cash balance" },
    { color: "#3FA88F", label: "Positive net" },
    { color: "#C24A6B", label: "Negative net" },
    { color: "#E0A040", label: "Tax refund" },
    { color: "#7B6CF6", label: "Property" },
    { color: "#5085D9", label: "Stock" },
    { color: "#A85DA8", label: "Crypto" },
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption text-ink-tertiary">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full inline-block" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
