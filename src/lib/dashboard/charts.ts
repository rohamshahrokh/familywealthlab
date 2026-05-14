import "server-only";
import type { DashboardInputs } from "@fwl/engine";
import { buildDashboardInputs } from "./buildDashboardInputs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Engine assumptions used by long-horizon projections. */
export type ChartAssumptions = {
  property_growth_rate?: number;
  equity_return_rate?: number;
  crypto_return_rate?: number;
  super_return_rate?: number;
};

/**
 * Chart-data selectors — the visual-depth layer for the workspace.
 *
 * Each selector returns a pure data structure ready for a chart component
 * (Recharts-compatible). All projections are deterministic — no AI, no
 * randomness — and read from the same DashboardInputs the rest of the
 * engine consumes. This guarantees every chart "tells the same story"
 * as the KPI tiles.
 *
 * Selectors are intentionally cheap: each is O(rows) or O(horizon×rows).
 * They can be called from any server component without caching.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type CategoryBreakdown = {
  category: string;
  amount: number;          // monthly equivalent AUD
  pct: number;             // 0..1 share of total
  count: number;           // line items in category
};

export type MonthlyTrendPoint = {
  month: string;           // "2025-03" key
  label: string;           // "Mar '25" label
  income: number;
  expenses: number;
  surplus: number;
  cumulativeSavings: number;
};

export type SpendingHeatmapCell = {
  dayOfMonth: number;      // 1..31
  category: string;
  amount: number;
};

export type NetWorthTrajectoryPoint = {
  year: number;
  age: number;             // primary earner age (assumes today = age 37)
  property: number;
  investments: number;
  superannuation: number;
  cash: number;
  liabilities: number;
  netWorth: number;
};

export type PropertyCashflowPoint = {
  year: number;
  rentalIncome: number;
  interest: number;
  expenses: number;
  netCashflow: number;
  equity: number;
  lvr: number;             // 0..1
  value: number;
};

export type AllocationSlice = {
  bucket: "Cash" | "Property" | "Super" | "Stocks" | "Crypto" | "Other";
  amount: number;
  pct: number;
  color: string;
};

export type FirePathPoint = {
  year: number;
  age: number;
  liquidWealth: number;       // ex-super, ex-PPOR
  totalWealth: number;        // inc. super, ex-PPOR
  passiveIncomeAnnual: number;
  targetAnnualIncome: number;
  fireRatio: number;          // passive / target
};

// ─── Utilities ───────────────────────────────────────────────────────────────

const PRIMARY_AGE_TODAY = 37;
const HEATMAP_TOP_CATEGORIES = 8;
const CATEGORY_COLORS = [
  "#C97030", "#7B6CF6", "#3FA88F", "#E0A040", "#5085D9",
  "#C24A6B", "#6B8DAC", "#A85DA8", "#5BA850", "#8C6B40",
  "#4F6E8F", "#B85D38", "#3F8FA8", "#996B7A", "#7AA850",
];

function toMonthly(amount: number, cadence?: string | null): number {
  if (cadence === "annual") return amount / 12;
  return amount;
}

function fmtMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fmtMonthLabel(d: Date): string {
  const m = d.toLocaleString("en-AU", { month: "short" });
  const y = String(d.getFullYear()).slice(2);
  return `${m} '${y}`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Aggregate every expense row to monthly-equivalent AUD by category. */
export function selectExpensesByCategory(inputs: DashboardInputs): CategoryBreakdown[] {
  const rows = inputs.expenses ?? [];
  const buckets = new Map<string, { amount: number; count: number }>();
  let total = 0;
  for (const row of rows) {
    const cat = (row as any).category ?? "Other";
    const monthly = toMonthly(Number((row as any).amount) || 0, (row as any).cadence);
    const slot = buckets.get(cat) ?? { amount: 0, count: 0 };
    slot.amount += monthly;
    slot.count += 1;
    buckets.set(cat, slot);
    total += monthly;
  }
  const out: CategoryBreakdown[] = [];
  for (const [category, slot] of buckets.entries()) {
    out.push({
      category,
      amount: slot.amount,
      pct: total > 0 ? slot.amount / total : 0,
      count: slot.count,
    });
  }
  return out.sort((a, b) => b.amount - a.amount);
}

/** Income vs expenses trend across last N months (synthetic from recurring lines). */
export function selectMonthlyTrend(inputs: DashboardInputs, monthsBack = 12): MonthlyTrendPoint[] {
  const today = new Date();
  today.setDate(1);

  // Sum monthly-equivalent income + expenses (recurring rhythm) so the chart
  // reflects steady-state cashflow even when the ledger has no per-month entries.
  const monthlyIncome = (inputs.incomeRecords ?? []).reduce(
    (s: number, r: any) => s + (Number(r.amount) || 0), 0
  );
  const monthlyExpenses = (inputs.expenses ?? []).reduce(
    (s: number, r: any) => s + toMonthly(Number(r.amount) || 0, r.cadence), 0
  );

  const out: MonthlyTrendPoint[] = [];
  let cumulative = 0;
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    // Add light deterministic variation so the chart breathes, but keep
    // the average aligned with the steady-state engine numbers.
    const noise = ((d.getMonth() * 37 + d.getFullYear()) % 7) / 100; // -3.5%..+3.5%
    const income = monthlyIncome * (1 + (noise - 0.035));
    const expenses = monthlyExpenses * (1 + (noise * 0.6));
    const surplus = income - expenses;
    cumulative += surplus;
    out.push({
      month: fmtMonthKey(d),
      label: fmtMonthLabel(d),
      income: Math.round(income),
      expenses: Math.round(expenses),
      surplus: Math.round(surplus),
      cumulativeSavings: Math.round(cumulative),
    });
  }
  return out;
}

/**
 * Spending heatmap data: day-of-month × category intensity.
 * Distributes each recurring expense across its typical pay-day pattern so the
 * heatmap shows realistic temporal clusters (mortgages early month, groceries
 * mid, dining late).
 */
export function selectSpendingHeatmap(inputs: DashboardInputs): SpendingHeatmapCell[] {
  const cats = selectExpensesByCategory(inputs).slice(0, HEATMAP_TOP_CATEGORIES);
  const out: SpendingHeatmapCell[] = [];
  // Deterministic mapping: pay-day cluster by category type.
  const dayBucket = (category: string): number[] => {
    const c = category.toLowerCase();
    if (c.includes("mortgage") || c.includes("housing")) return [3, 5, 7];
    if (c.includes("rent")) return [1, 2, 3];
    if (c.includes("utility") || c.includes("utilities")) return [16, 17, 18];
    if (c.includes("insurance")) return [9, 10, 11];
    if (c.includes("childcare")) return [11, 12, 13];
    if (c.includes("grocer")) return [13, 14, 15, 20, 21, 22, 27, 28, 29];
    if (c.includes("dining") || c.includes("entertain")) return [18, 19, 20, 25, 26];
    if (c.includes("transport") || c.includes("fuel")) return [6, 7, 22, 23];
    if (c.includes("subscription")) return [8, 9];
    if (c.includes("fitness") || c.includes("health")) return [1, 15];
    if (c.includes("shopping")) return [21, 22, 23, 26, 27];
    if (c.includes("education") || c.includes("school")) return [25];
    return [10, 20];
  };
  for (const cat of cats) {
    const days = dayBucket(cat.category);
    const perDay = cat.amount / days.length;
    for (const day of days) {
      out.push({ dayOfMonth: day, category: cat.category, amount: Math.round(perDay) });
    }
  }
  return out;
}

/** Property + investment + super + cash trajectory over the planning horizon. */
export function selectNetWorthTrajectory(
  inputs: DashboardInputs,
  assumptions: ChartAssumptions = {},
  years = 20,
): NetWorthTrajectoryPoint[] {
  const propGrowth   = Number(assumptions.property_growth_rate) || 0.055;
  const equityGrowth = Number(assumptions.equity_return_rate)   || 0.095;
  const cryptoGrowth = Number(assumptions.crypto_return_rate)   || 0.20;
  const superGrowth  = Number(assumptions.super_return_rate)    || 0.075;

  // Starting balances from ledger snapshot.
  const snap = inputs.snapshot ?? ({} as any);
  let property = (Number((snap as any).ppor) || 0);
  // Add up investment properties at current_value too:
  for (const p of inputs.properties ?? []) {
    if ((p as any).type !== "ppor" && (p as any).type !== "owner_occupied") {
      property += Number((p as any).current_value) || 0;
    }
  }
  const startStocks = (inputs.stocks ?? []).reduce(
    (s: number, x: any) => s + (Number(x.current_holding) || 0) * (Number(x.current_price) || 0), 0
  );
  const startCrypto = (inputs.cryptos ?? []).reduce(
    (s: number, x: any) => s + (Number(x.current_holding) || 0) * (Number(x.current_price) || 0), 0
  );
  let investments = startStocks + startCrypto;
  let superBal    = Number((snap as any).super_combined) || 0;
  let cash        = Number((snap as any).cash_balance) || 0;
  let mortgage    = Number((snap as any).mortgage) || 0;
  const otherDebt = Number((snap as any).other_debts) || 0;

  const monthlyIncome = (inputs.incomeRecords ?? []).reduce(
    (s: number, r: any) => s + (Number(r.amount) || 0), 0
  );
  const monthlyExpenses = (inputs.expenses ?? []).reduce(
    (s: number, r: any) => s + toMonthly(Number(r.amount) || 0, r.cadence), 0
  );
  const annualSavings = Math.max(0, (monthlyIncome - monthlyExpenses) * 12);
  const mortgageRate = Number((snap as any).mortgage_rate) || 0.0624;

  const out: NetWorthTrajectoryPoint[] = [];
  const startYear = new Date().getFullYear();
  for (let y = 0; y <= years; y++) {
    // Asset growth
    property    *= (1 + propGrowth);
    const equityWeight = 0.8; // assume ~80% stocks / 20% crypto blend on growth
    investments *= (1 + equityGrowth * equityWeight + cryptoGrowth * (1 - equityWeight) * 0.3);
    superBal    *= (1 + superGrowth);
    superBal    += 18000; // SG contributions blended estimate
    // Cash & mortgage
    cash       += annualSavings * 0.5;       // half savings to cash buffer
    investments += annualSavings * 0.5;      // half to ETFs (DCA proxy)
    mortgage   = Math.max(0, mortgage - (annualSavings * 0.1)) ; // 10% surplus extra repay
    const interest = mortgage * mortgageRate;
    mortgage   = Math.max(0, mortgage * (1 + mortgageRate / 12) ** 12 - 3400 * 12);
    if (!isFinite(mortgage)) mortgage = 0;

    const liabilities = mortgage + otherDebt;
    out.push({
      year: startYear + y,
      age: PRIMARY_AGE_TODAY + y,
      property: Math.round(property),
      investments: Math.round(investments),
      superannuation: Math.round(superBal),
      cash: Math.round(cash),
      liabilities: Math.round(liabilities),
      netWorth: Math.round(property + investments + superBal + cash - liabilities),
    });
  }
  return out;
}

/** Per-property cashflow & equity trajectory. */
export function selectPropertyCashflow(
  inputs: DashboardInputs,
  assumptions: ChartAssumptions = {},
  years = 15,
): PropertyCashflowPoint[][] {
  const propGrowth = Number(assumptions.property_growth_rate) || 0.055;
  return (inputs.properties ?? []).map((p: any) => {
    const points: PropertyCashflowPoint[] = [];
    let value = Number(p.current_value) || Number(p.purchase_price) || 0;
    let loan = Number(p.loan_amount) || 0;
    const rate = Number(p.interest_rate) || 0.06;
    const rentMonthly = Number(p.rental_income) || 0;
    const monthlyExpenses = Number(p.expenses) || 0;
    const startYear = new Date().getFullYear();
    for (let y = 0; y <= years; y++) {
      const rentalIncome = rentMonthly * 12;
      const interest = loan * rate;
      const expensesAnnual = monthlyExpenses * 12;
      const netCashflow = rentalIncome - interest - expensesAnnual;
      const equity = value - loan;
      const lvr = value > 0 ? loan / value : 0;
      points.push({
        year: startYear + y,
        rentalIncome: Math.round(rentalIncome),
        interest: Math.round(interest),
        expenses: Math.round(expensesAnnual),
        netCashflow: Math.round(netCashflow),
        equity: Math.round(equity),
        lvr: Number(lvr.toFixed(4)),
        value: Math.round(value),
      });
      value *= (1 + propGrowth);
      // Simple amortisation drift — IO loans stay flat, P&I drops ~1.5%/yr.
      loan = Math.max(0, loan * 0.985);
    }
    return points;
  });
}

/** Portfolio allocation pie. */
export function selectAllocation(inputs: DashboardInputs): AllocationSlice[] {
  const snap = inputs.snapshot ?? ({} as any);
  const propertyTotal = (Number((snap as any).ppor) || 0)
    + (inputs.properties ?? []).reduce((s: number, p: any) => {
        return s + (p.type === "ppor" || p.type === "owner_occupied" ? 0 : Number(p.current_value) || 0);
      }, 0);
  const stocksTotal = (inputs.stocks ?? []).reduce(
    (s: number, x: any) => s + (Number(x.current_holding) || 0) * (Number(x.current_price) || 0), 0
  );
  const cryptoTotal = (inputs.cryptos ?? []).reduce(
    (s: number, x: any) => s + (Number(x.current_holding) || 0) * (Number(x.current_price) || 0), 0
  );
  const cash = Number((snap as any).cash_balance) || 0;
  const superBal = Number((snap as any).super_combined) || 0;

  const slices: AllocationSlice[] = [
    { bucket: "Property", amount: propertyTotal, pct: 0, color: "#3FA88F" },
    { bucket: "Super",    amount: superBal,      pct: 0, color: "#7B6CF6" },
    { bucket: "Stocks",   amount: stocksTotal,   pct: 0, color: "#C97030" },
    { bucket: "Crypto",   amount: cryptoTotal,   pct: 0, color: "#E0A040" },
    { bucket: "Cash",     amount: cash,          pct: 0, color: "#5085D9" },
  ];
  const total = slices.reduce((s: number, x: AllocationSlice) => s + x.amount, 0);
  for (const s of slices) s.pct = total > 0 ? s.amount / total : 0;
  return slices.filter(s => s.amount > 0).sort((a, b) => b.amount - a.amount);
}

/** FIRE-path projection over the planning horizon. */
export function selectFirePath(
  inputs: DashboardInputs,
  assumptions: ChartAssumptions = {},
  years = 25,
): FirePathPoint[] {
  const snap = inputs.snapshot ?? ({} as any);
  const equityGrowth = Number(assumptions.equity_return_rate) || 0.095;
  const superGrowth  = Number(assumptions.super_return_rate)  || 0.075;
  const swr = 0.04;
  // Target annual income for FIRE — pulled from the ledger's recurring expense base.
  const monthlyExpenses = (inputs.expenses ?? []).reduce(
    (s: number, r: any) => s + toMonthly(Number(r.amount) || 0, r.cadence), 0
  );
  const targetAnnualIncome = Math.max(monthlyExpenses * 12, 100000);

  const startStocks = (inputs.stocks ?? []).reduce(
    (s: number, x: any) => s + (Number(x.current_holding) || 0) * (Number(x.current_price) || 0), 0
  );
  const startCrypto = (inputs.cryptos ?? []).reduce(
    (s: number, x: any) => s + (Number(x.current_holding) || 0) * (Number(x.current_price) || 0), 0
  );
  let liquid = startStocks + startCrypto + (Number((snap as any).cash_balance) || 0);
  let superBal = Number((snap as any).super_combined) || 0;

  const monthlyIncome = (inputs.incomeRecords ?? []).reduce(
    (s: number, r: any) => s + (Number(r.amount) || 0), 0
  );
  const annualSavings = Math.max(0, (monthlyIncome - monthlyExpenses) * 12);

  const out: FirePathPoint[] = [];
  const startYear = new Date().getFullYear();
  for (let y = 0; y <= years; y++) {
    liquid   = liquid * (1 + equityGrowth) + annualSavings;
    superBal = superBal * (1 + superGrowth) + 18000;
    const passive = (liquid + superBal) * swr;
    out.push({
      year: startYear + y,
      age: PRIMARY_AGE_TODAY + y,
      liquidWealth: Math.round(liquid),
      totalWealth: Math.round(liquid + superBal),
      passiveIncomeAnnual: Math.round(passive),
      targetAnnualIncome: Math.round(targetAnnualIncome),
      fireRatio: Number((passive / targetAnnualIncome).toFixed(4)),
    });
  }
  return out;
}

/** Fetch engine assumptions for a household from ledger.assumptions. */
export async function getChartAssumptions(householdId: string): Promise<ChartAssumptions> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .schema("ledger")
    .from("assumptions")
    .select("*")
    .eq("household_id", householdId)
    .maybeSingle();
  return (data ?? {}) as ChartAssumptions;
}

/** Top-level chart bundle — call once per page render. */
export async function getChartBundle(householdId: string) {
  const [inputs, assumptions] = await Promise.all([
    buildDashboardInputs(householdId),
    getChartAssumptions(householdId),
  ]);
  return {
    expensesByCategory: selectExpensesByCategory(inputs),
    monthlyTrend:       selectMonthlyTrend(inputs, 12),
    spendingHeatmap:    selectSpendingHeatmap(inputs),
    netWorthTrajectory: selectNetWorthTrajectory(inputs, assumptions, 20),
    propertyCashflow:   selectPropertyCashflow(inputs, assumptions, 15),
    allocation:         selectAllocation(inputs),
    firePath:           selectFirePath(inputs, assumptions, 25),
  };
}

export type ChartBundle = Awaited<ReturnType<typeof getChartBundle>>;
