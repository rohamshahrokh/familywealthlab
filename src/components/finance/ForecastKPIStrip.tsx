"use client";

/**
 * ForecastKPIStrip — premium, minimal KPI cards for the property forecast.
 * Surfaces the questions investors actually ask:
 *   - When does this break even?
 *   - What's the worst year I should plan for?
 *   - When is rent enough to cover interest?
 *   - When does this become self-sustaining?
 *   - How much tax shield total?
 *   - What's the projected equity at Y10 / Y20 / Y30?
 *   - Debt-free year.
 */

import * as React from "react";
import type { ForecastResult } from "@/lib/finance/propertyForecastEngine";
import { fmtMoneyCompact } from "@/components/workspace/format";

interface Props {
  result: ForecastResult;
}

interface KpiTile {
  label: string;
  value: string;
  hint: string;
  tone?: "positive" | "negative" | "neutral";
}

export function ForecastKPIStrip({ result }: Props) {
  const k = result.kpis;
  const tiles: KpiTile[] = [
    {
      label: "Break-even year",
      value: k.breakEvenYear != null ? String(k.breakEvenYear) : "—",
      hint: "First year net cashflow ≥ 0",
      tone: k.breakEvenYear != null ? "positive" : "neutral",
    },
    {
      label: "Worst cashflow year",
      value: k.worstYear ? `${k.worstYear.year}` : "—",
      hint: k.worstYear ? `${fmtMoneyCompact(k.worstYear.cashflow)} that year` : "—",
      tone: k.worstYear && k.worstYear.cashflow < 0 ? "negative" : "neutral",
    },
    {
      label: "Cumulative neg. cashflow",
      value: fmtMoneyCompact(k.cumulativeNegativeCf),
      hint: "Total cash you'd cover before break-even",
      tone: k.cumulativeNegativeCf < 0 ? "negative" : "neutral",
    },
    {
      label: "Total tax shield",
      value: fmtMoneyCompact(k.totalTaxShield),
      hint: "Cumulative refund across horizon",
      tone: k.totalTaxShield > 0 ? "positive" : "neutral",
    },
    {
      label: "Self-sustaining year",
      value: k.selfSustainingYear != null ? String(k.selfSustainingYear) : "—",
      hint: "Rent ≥ interest + opex",
      tone: k.selfSustainingYear != null ? "positive" : "neutral",
    },
    {
      label: "Rent covers interest",
      value: k.rentCoversInterestYear != null ? String(k.rentCoversInterestYear) : "—",
      hint: "Rent ≥ interest cost",
      tone: k.rentCoversInterestYear != null ? "positive" : "neutral",
    },
    {
      label: "Debt-free year",
      value: k.debtFreeYear != null ? String(k.debtFreeYear) : "—",
      hint: "Loan balance at zero",
      tone: k.debtFreeYear != null ? "positive" : "neutral",
    },
    {
      label: "Equity · Y10",
      value: fmtMoneyCompact(k.projectedEquityYear10),
      hint: "Projected at end of year 10",
      tone: "neutral",
    },
    {
      label: "Equity · Y20",
      value: fmtMoneyCompact(k.projectedEquityYear20),
      hint: "Projected at end of year 20",
      tone: "neutral",
    },
    {
      label: "Equity · Y30",
      value: fmtMoneyCompact(k.projectedEquityYear30),
      hint: "Projected at horizon end",
      tone: "neutral",
    },
    {
      label: "Passive income",
      value: fmtMoneyCompact(k.projectedPassiveIncome),
      hint: "Mean of last 3 yrs · rent − opex",
      tone: k.projectedPassiveIncome > 0 ? "positive" : "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {tiles.map((t, i) => (
        <KpiCard key={i} tile={t} index={i + 1} />
      ))}
    </div>
  );
}

function KpiCard({ tile, index }: { tile: KpiTile; index: number }) {
  const toneClass =
    tile.tone === "positive"
      ? "text-emerald-400"
      : tile.tone === "negative"
      ? "text-rose-400"
      : "text-ink-primary";
  return (
    <div className="rounded-xl border border-line bg-bg-inset/60 p-4 hover:bg-bg-inset transition-colors duration-tactile">
      <div className="flex items-center justify-between">
        <div className="text-caption mono uppercase tracking-wider text-ink-quaternary">
          {tile.label}
        </div>
        <div className="text-caption mono text-ink-quaternary">
          {String(index).padStart(2, "0")}
        </div>
      </div>
      <div className={`mt-2 text-xl font-semibold tabular-nums ${toneClass}`}>
        {tile.value}
      </div>
      <div className="mt-1 text-caption text-ink-tertiary leading-snug">{tile.hint}</div>
    </div>
  );
}
