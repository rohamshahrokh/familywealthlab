/**
 * cashflowEngine — household-level cashflow projection.
 *
 * Combines income, expenses, property net cashflow, and event-driven cash
 * impacts to produce a per-period series. Deterministic placeholder formulas.
 *
 * Period modes:
 *  - "monthly" (default): 12 buckets/year
 *  - "annual": 1 bucket/year
 *
 * Tax modes:
 *  - "lump_sum": tax refund modelled as a single positive event at EOFY
 *  - "payg":     tax paid in even slices, no refund event
 */

import { computeTax } from "./taxEngine";
import type { TaxMode, TaxRuleset } from "./taxEngine";

export type CashflowMode = "cash" | "events" | "wealth" | "risk";
export type Periodicity = "monthly" | "annual";
export type ViewMode = "cash" | "plus_equity" | "deposit_power";

export interface IncomeStream {
  label: string;
  annualGross: number;
  /** Optional irregular cadence; default "monthly". */
  cadence?: "monthly" | "fortnightly" | "annual";
  taxable?: boolean;
}

export interface ExpenseStream {
  label: string;
  monthly: number;
  category?: string;
}

export interface CashflowEvent {
  /** months from now (0 = current month) */
  monthOffset: number;
  amount: number;          // +ve = inflow, -ve = outflow
  label: string;
  kind: "tax_refund" | "property" | "stock" | "crypto" | "other";
}

export interface CashflowInput {
  startingCash: number;
  offsetBalance: number;
  income: IncomeStream[];
  expenses: ExpenseStream[];
  property?: { netMonthly: number; eventsPerYear?: CashflowEvent[] };
  events?: CashflowEvent[];
  taxMode?: TaxMode;
  ruleset?: TaxRuleset;
  horizonMonths?: number;
}

export interface CashflowPoint {
  month: number;            // 0-based month index from start
  year: number;
  label: string;            // "Jan 26", or "2025" in annual mode
  netCashflow: number;      // for that period
  cashBalance: number;      // cumulative
  taxRefund: number;
  propertyImpact: number;
  stockImpact: number;
  cryptoImpact: number;
  eventTotal: number;
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function annualisedIncome(s: IncomeStream): number {
  // For now, we just use annualGross regardless of cadence.
  return s.annualGross;
}

export function projectCashflow(input: CashflowInput): CashflowPoint[] {
  const horizon = input.horizonMonths ?? 12 * 10;
  const ruleset = input.ruleset ?? "ato_current";
  const taxMode = input.taxMode ?? "payg";

  const annualIncome = input.income.reduce((s, it) => s + annualisedIncome(it), 0);
  const taxableIncome = input.income.filter(i => i.taxable !== false).reduce((s, it) => s + annualisedIncome(it), 0);
  const annualTax = computeTax(taxableIncome, ruleset).totalTax;
  const monthlyTax = taxMode === "payg" ? annualTax / 12 : 0;

  const monthlyIncomePost = (annualIncome - (taxMode === "payg" ? annualTax : 0)) / 12;
  const monthlyExpense = input.expenses.reduce((s, e) => s + e.monthly, 0);
  const propertyMonthly = input.property?.netMonthly ?? 0;

  // Build event index by month
  const allEvents: CashflowEvent[] = [
    ...(input.events ?? []),
    ...(input.property?.eventsPerYear ?? []),
  ];
  // Lump-sum refund event at EOFY (Jul) — illustrative for AU FY
  if (taxMode === "lump_sum") {
    for (let y = 0; y < Math.ceil(horizon / 12); y++) {
      allEvents.push({
        monthOffset: y * 12 + 6, // 6 months in -> approximate July
        amount: annualTax * 0.15, // illustrative ~15% refund of total tax paid
        label: `Tax refund ${new Date().getFullYear() + y}`,
        kind: "tax_refund",
      });
    }
  }

  const now = new Date();
  let cash = input.startingCash + input.offsetBalance;
  const points: CashflowPoint[] = [];

  for (let m = 0; m < horizon; m++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const monthEvents = allEvents.filter(e => e.monthOffset === m);
    const eventTotal = monthEvents.reduce((s, e) => s + e.amount, 0);
    const taxRefund = monthEvents.filter(e => e.kind === "tax_refund").reduce((s, e) => s + e.amount, 0);
    const propEvents = monthEvents.filter(e => e.kind === "property").reduce((s, e) => s + e.amount, 0);
    const stockEvents = monthEvents.filter(e => e.kind === "stock").reduce((s, e) => s + e.amount, 0);
    const cryptoEvents = monthEvents.filter(e => e.kind === "crypto").reduce((s, e) => s + e.amount, 0);

    const net = monthlyIncomePost - monthlyExpense + propertyMonthly + eventTotal
              - (taxMode === "payg" ? 0 : monthlyTax /* zero in lump sum */);
    cash += net;
    points.push({
      month: m,
      year: monthDate.getFullYear(),
      label: `${MONTH_NAMES[monthDate.getMonth()]} ${String(monthDate.getFullYear()).slice(-2)}`,
      netCashflow: net,
      cashBalance: cash,
      taxRefund,
      propertyImpact: propertyMonthly + propEvents,
      stockImpact: stockEvents,
      cryptoImpact: cryptoEvents,
      eventTotal,
    });
  }

  return points;
}

/** Aggregate monthly series into annual series (for "annual" toggle). */
export function toAnnual(points: CashflowPoint[]): CashflowPoint[] {
  const byYear = new Map<number, CashflowPoint>();
  for (const p of points) {
    const cur = byYear.get(p.year);
    if (!cur) {
      byYear.set(p.year, {
        ...p,
        label: String(p.year),
        netCashflow: p.netCashflow,
        propertyImpact: p.propertyImpact,
        stockImpact: p.stockImpact,
        cryptoImpact: p.cryptoImpact,
        eventTotal: p.eventTotal,
        taxRefund: p.taxRefund,
        cashBalance: p.cashBalance,
      });
    } else {
      cur.netCashflow += p.netCashflow;
      cur.propertyImpact += p.propertyImpact;
      cur.stockImpact += p.stockImpact;
      cur.cryptoImpact += p.cryptoImpact;
      cur.eventTotal += p.eventTotal;
      cur.taxRefund += p.taxRefund;
      // cashBalance = last bucket of the year
      cur.cashBalance = p.cashBalance;
    }
  }
  return Array.from(byYear.values()).sort((a, b) => a.year - b.year);
}

/** Summary KPIs derived from a projection. */
export interface CashflowKpis {
  cashToday: number;
  cashYear: { label: string; value: number };
  annualNetCf: number;
  taxRefundPerYear: number;
  totalDepositPower: number;
  ppLvr: number;
  ipReadiness: "ready" | "soon" | "not_yet";
  estimatedReadyDate: string;
}

export function computeCashflowKpis(
  points: CashflowPoint[],
  context: {
    ppValue: number; ppLoan: number;
    ipValue: number; ipLoan: number;
    emergencyBufferMonths: number;
    monthlyExpense: number;
  },
): CashflowKpis {
  const cashToday = points[0]?.cashBalance ?? 0;
  const tenYears = Math.min(points.length - 1, 119);
  const cashYear = points[tenYears] ?? points[points.length - 1];
  const firstYearNet = points.slice(0, 12).reduce((s, p) => s + p.netCashflow, 0);
  const refundPerYear = points.slice(0, 12).reduce((s, p) => s + p.taxRefund, 0);
  const ppUsable = Math.max(0, context.ppValue * 0.8 - context.ppLoan);
  const ipUsable = Math.max(0, context.ipValue * 0.8 - context.ipLoan);
  const buffer = context.monthlyExpense * context.emergencyBufferMonths;
  const totalDeposit = cashToday + ppUsable + ipUsable - buffer;
  const ppLvr = context.ppValue > 0 ? context.ppLoan / context.ppValue : 0;

  let readiness: "ready" | "soon" | "not_yet" = "not_yet";
  let readyMonth = -1;
  for (let i = 0; i < points.length; i++) {
    if (points[i].cashBalance >= 100_000) { readyMonth = i; break; }
  }
  if (readyMonth >= 0 && readyMonth < 12) readiness = "ready";
  else if (readyMonth >= 0 && readyMonth < 36) readiness = "soon";
  const readyDate = readyMonth >= 0
    ? `${points[readyMonth].label}`
    : "Beyond horizon";

  return {
    cashToday,
    cashYear: { label: cashYear?.label ?? "—", value: cashYear?.cashBalance ?? 0 },
    annualNetCf: firstYearNet,
    taxRefundPerYear: refundPerYear,
    totalDepositPower: Math.max(0, totalDeposit),
    ppLvr,
    ipReadiness: readiness,
    estimatedReadyDate: readyDate,
  };
}
