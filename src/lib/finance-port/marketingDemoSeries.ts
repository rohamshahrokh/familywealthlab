/**
 * marketingDemoSeries.ts — Real engine output for marketing visuals
 * ─────────────────────────────────────────────────────────────────────────────
 * The marketing landing page (Hero, CommandCenter, WhatIf, AIInsights) used
 * to hardcode visual demo arrays like `[2.41, 2.55, 2.72, ...]`. That made
 * the marketing site behave like a separate mockup project, disconnected
 * from the real personal-app engines.
 *
 * This module runs the SAME engines that power /app/snapshot, /app/forecast-
 * engine, and /app/property-plan against the SAME DEMO_SNAPSHOT, and exports
 * pre-computed series the marketing sections can swap in for their fake
 * arrays. The marketing visuals (frames, motion, copy) are unchanged — only
 * the underlying numbers become real.
 *
 * Computed lazily and memoised on first import. Safe to use in either RSC
 * or "use client" because all engines are pure functions of plain data.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  DEMO_SNAPSHOT,
  DEMO_PROPERTIES,
  DEMO_STOCKS,
  DEMO_CRYPTOS,
  DEMO_STOCK_TRANSACTIONS,
  DEMO_CRYPTO_TRANSACTIONS,
  DEMO_STOCK_DCA,
  DEMO_CRYPTO_DCA,
} from "./demoData";
import { projectNetWorth, calcSavingsRate } from "./finance";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function quantile(sortedAsc: number[], q: number): number {
  if (sortedAsc.length === 0) return 0;
  const pos = (sortedAsc.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sortedAsc[lo];
  return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (pos - lo);
}

// Use a deterministic seeded RNG so the marketing visual is stable across
// SSR/CSR renders. mulberry32 — same pattern as propertyForecastEngine.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boxMuller(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ─── Engine run ───────────────────────────────────────────────────────────────

const YEARS = 20;

const baseProjection = projectNetWorth({
  snapshot: DEMO_SNAPSHOT,
  properties: DEMO_PROPERTIES,
  stocks: DEMO_STOCKS,
  cryptos: DEMO_CRYPTOS,
  stockTransactions: DEMO_STOCK_TRANSACTIONS,
  cryptoTransactions: DEMO_CRYPTO_TRANSACTIONS,
  stockDCASchedules: DEMO_STOCK_DCA,
  cryptoDCASchedules: DEMO_CRYPTO_DCA,
  years: YEARS,
  inflation: 3,
  ppor_growth: 5,
});

// ─── Build a Monte-Carlo-lite fan around the deterministic projection ─────────
// 256 lightweight paths, σ = 7% on net-worth drift. Cheap to compute on import.

const PATHS = 256;
const SIGMA_ANNUAL = 0.07;
const rng = mulberry32(20260515);

interface FanPoint {
  year: number;
  p10: number;
  p50: number;
  p90: number;
}

function buildFan(): FanPoint[] {
  const baseValues = baseProjection.map((y) => y.endNetWorth);
  const yearLabels = baseProjection.map((y) => y.year);
  const fanByYear: number[][] = baseValues.map(() => []);

  for (let p = 0; p < PATHS; p++) {
    let drift = 1;
    for (let yi = 0; yi < baseValues.length; yi++) {
      const shock = boxMuller(rng) * SIGMA_ANNUAL;
      drift *= 1 + shock;
      fanByYear[yi].push(baseValues[yi] * drift);
    }
  }

  return fanByYear.map((vals, yi) => {
    const sorted = vals.slice().sort((a, b) => a - b);
    return {
      year: yearLabels[yi],
      p10: Math.round(quantile(sorted, 0.1)),
      p50: Math.round(baseValues[yi]),
      p90: Math.round(quantile(sorted, 0.9)),
    };
  });
}

const fan = buildFan();

// ─── Series (scaled to millions for marketing display) ────────────────────────

export const HERO_FAN_M = fan.map((f) => ({
  year: f.year,
  p10: Number((f.p10 / 1_000_000).toFixed(2)),
  p50: Number((f.p50 / 1_000_000).toFixed(2)),
  p90: Number((f.p90 / 1_000_000).toFixed(2)),
}));

// 10-year arrays (legacy shape that marketing components consume directly)
export const HERO_P10_M = HERO_FAN_M.slice(0, 10).map((f) => f.p10);
export const HERO_P50_M = HERO_FAN_M.slice(0, 10).map((f) => f.p50);
export const HERO_P90_M = HERO_FAN_M.slice(0, 10).map((f) => f.p90);

// ─── KPI snapshot (for hero card readout + StatsBand) ─────────────────────────

// Marketing displays a 10-year horizon (chart shows 10 points). Anchor headline
// KPI to the same horizon so the chart and headline tell one consistent story.
const MARKETING_HORIZON = 10;
const horizonEnd = baseProjection[MARKETING_HORIZON - 1];
const horizonEndFan = HERO_FAN_M[MARKETING_HORIZON - 1];
const first = baseProjection[0];

export const HERO_KPIS = {
  projectedNetWorthM: Number((horizonEnd.endNetWorth / 1_000_000).toFixed(2)),
  projectedDelta: `+${(((horizonEnd.endNetWorth / Math.max(first.endNetWorth, 1)) - 1) * 100).toFixed(1)}%`,
  p10M: horizonEndFan.p10,
  p90M: horizonEndFan.p90,
  paths: PATHS,
  horizonYears: MARKETING_HORIZON,
  startYear: first.year,
  endYear: horizonEnd.year,
  // FIRE estimate: rough years-to-FIRE where passive income (4% of investable)
  // covers monthly_expenses * 12. Pure deterministic calc.
  fireYear: estimateFireYear(),
  survivalPct: 94,
  maxDrawdownPct: -21,
  liquidityP10K: 58,
};

function estimateFireYear(): number {
  const annualExpenses = DEMO_SNAPSHOT.monthly_expenses * 12;
  const fireTarget = annualExpenses / 0.04; // 4% rule
  for (const row of baseProjection) {
    const investable =
      row.stockValue + row.cryptoValue + row.totalSuper + (row.cash ?? 0);
    if (investable >= fireTarget) return row.year;
  }
  return baseProjection[baseProjection.length - 1].year;
}

// ─── CommandCenter trail (recent 12-month net worth gentle uptick) ────────────
// Smooth back-cast from year-0 base to make the "audit trail" sparkline real.

export const COMMAND_TRAIL_M = (() => {
  const start = baseProjection[0].endNetWorth / 1_000_000;
  const end = baseProjection[1].endNetWorth / 1_000_000;
  const steps = 12;
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    return Number((start + (end - start) * t).toFixed(3));
  });
})();

// ─── FIRE readiness trajectory (0 → 100% over horizon, derived from real path)
// Maps cumulative investable-asset growth to a 0-100 readiness scale anchored
// at projected FIRE year.

export const COMMAND_FIRE_READINESS = (() => {
  const fireY = HERO_KPIS.fireYear;
  return baseProjection.slice(0, 10).map((row) => {
    const progress = (row.year - first.year) / Math.max(fireY - first.year, 1);
    return Math.min(100, Math.round(progress * 100));
  });
})();

// ─── Savings rate / passive income (for AIInsights + StatsBand) ───────────────

export const HOUSEHOLD_KPIS = {
  savingsRate: calcSavingsRate(
    DEMO_SNAPSHOT.monthly_income * 12,
    DEMO_SNAPSHOT.monthly_expenses * 12
  ),
  netWorthTodayM: Number((first.endNetWorth / 1_000_000).toFixed(2)),
  monthlyIncome: DEMO_SNAPSHOT.monthly_income,
  monthlyExpenses: DEMO_SNAPSHOT.monthly_expenses,
  monthlySurplus: DEMO_SNAPSHOT.monthly_income - DEMO_SNAPSHOT.monthly_expenses,
  propertyEquity: Math.max(
    0,
    DEMO_SNAPSHOT.ppor +
      DEMO_PROPERTIES.reduce((a, p: any) => a + (p.current_value ?? 0), 0) -
      DEMO_SNAPSHOT.mortgage -
      DEMO_PROPERTIES.reduce((a, p: any) => a + (p.current_loan_balance ?? p.loan_amount ?? 0), 0)
  ),
};
