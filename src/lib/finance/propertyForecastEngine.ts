/**
 * propertyForecastEngine — regime-aware, time-varying, MC-lite property forecast.
 *
 * Outputs are MODELLING ESTIMATES, not financial advice.
 *
 * Built additively on top of `propertyEngine.ts`. The deterministic engine
 * remains the source of truth for the existing 30Y chart and tables. This
 * engine layers:
 *   - Time-varying paths for rates, growth, rent, vacancy, maintenance.
 *   - A discrete event system (refinance, IO→P&I, rate spike, rent review,
 *     maintenance shock, renovation, Olympic boost, tax reform, recession).
 *   - Scenario presets (Base / Optimistic / Conservative / Stress).
 *   - MC-lite percentile band via deterministic seeded sampling around the
 *     scenario-shifted means. Cheap (≤256 paths) and stable on re-render.
 *   - Intelligent KPIs (break-even, worst year, self-sustaining year,
 *     debt-free year, total tax shield, projected equity, etc.).
 */

import { computeGearing } from "./negativeGearing";
import type { GearingRule, TaxRuleset } from "./taxEngine";
import type { PropertyEngineInput, PropertyEngineYear } from "./propertyEngine";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ForecastScenario = "base" | "optimistic" | "conservative" | "stress";

export type ForecastEventKind =
  | "refinance"
  | "io_to_pi"
  | "rate_spike"
  | "rate_cut"
  | "rent_review"
  | "maintenance_shock"
  | "renovation"
  | "olympic_boost"
  | "tax_reform"
  | "recession";

/** A point-in-time event applied at the start of `year` (1-indexed). */
export interface ForecastEvent {
  kind: ForecastEventKind;
  year: number;            // 1-indexed forecast year
  /** Optional magnitude, units depend on kind. */
  magnitude?: number;
  label?: string;
}

/**
 * Time-varying assumption paths. Each path is an array of length = horizon.
 * If absent, falls back to the constant value on `PropertyEngineInput`.
 */
export interface ForecastAssumptions {
  /** Annual interest rate path (decimal, e.g. 0.065). */
  ratePath?: number[];
  /** Annual capital growth path (decimal). */
  growthPath?: number[];
  /** Annual rent growth path (decimal). */
  rentGrowthPath?: number[];
  /** Annual vacancy path (decimal, 0-1). 0.04 = ~2 weeks/yr. */
  vacancyPath?: number[];
  /** Annual maintenance multiplier (1.0 = baseline opex inflation). */
  maintenancePath?: number[];
  /** Discrete events. */
  events?: ForecastEvent[];
  /** MC-lite: standard deviations applied around path means. */
  volatility?: {
    rate?: number;       // e.g. 0.0075 (75bps)
    growth?: number;     // e.g. 0.025
    rentGrowth?: number; // e.g. 0.015
    vacancy?: number;    // e.g. 0.015
  };
  /** Number of MC paths (deterministic, seeded). Default 0 (off). */
  mcPaths?: number;
  /** Random seed for MC. Default 1. */
  mcSeed?: number;
}

export interface ForecastInput extends PropertyEngineInput {
  horizonYears?: number;
  assumptions?: ForecastAssumptions;
}

export interface ForecastYear extends PropertyEngineYear {
  /** Effective rate applied this year. */
  effectiveRate: number;
  /** Effective vacancy applied this year. */
  effectiveVacancy: number;
  /** Lower & upper net cashflow band (MC p10–p90), 0 if MC off. */
  cfP10: number;
  cfP90: number;
  /** Lower & upper equity band, 0 if MC off. */
  eqP10: number;
  eqP90: number;
  /** Events that trigger at the start of this year. */
  events: ForecastEvent[];
}

export interface ForecastKpis {
  breakEvenYear: number | null;        // first year with netCashflow ≥ 0
  worstYear: { year: number; cashflow: number } | null;
  cumulativeNegativeCf: number;        // sum of negative netCashflow years (≤0)
  totalTaxShield: number;              // total refunds across horizon
  selfSustainingYear: number | null;   // rent ≥ interest + opex
  debtFreeYear: number | null;         // loanBalance ≤ 0
  rentCoversInterestYear: number | null;
  projectedEquityYear5: number;
  projectedEquityYear10: number;
  projectedEquityYear20: number;
  projectedEquityYear30: number;
  projectedPassiveIncome: number;      // mean rent in final 3 years - opex
}

export interface ForecastResult {
  rows: ForecastYear[];
  kpis: ForecastKpis;
  scenario: ForecastScenario;
  events: ForecastEvent[];
  assumptionsUsed: ForecastAssumptions;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scenario presets — modulate the four headline paths.
// ─────────────────────────────────────────────────────────────────────────────

interface ScenarioModulator {
  rateAdj: number;        // additive shift on base rate
  growthAdj: number;      // additive shift on growth
  rentGrowthAdj: number;  // additive shift on rent growth
  vacancyAdj: number;     // additive shift on vacancy
  maintenanceMul: number; // multiplier on opex inflation
  /** Optional injected events on top of user events. */
  injectEvents?: (horizon: number) => ForecastEvent[];
}

export const SCENARIO_PRESETS: Record<ForecastScenario, ScenarioModulator> = {
  base: {
    rateAdj: 0, growthAdj: 0, rentGrowthAdj: 0, vacancyAdj: 0.02, maintenanceMul: 1,
  },
  optimistic: {
    rateAdj: -0.005, growthAdj: 0.015, rentGrowthAdj: 0.01, vacancyAdj: 0.015, maintenanceMul: 0.95,
    injectEvents: (h) => h >= 6 ? [{ kind: "olympic_boost", year: 6, magnitude: 0.04, label: "Olympic boost" }] : [],
  },
  conservative: {
    rateAdj: 0.005, growthAdj: -0.01, rentGrowthAdj: -0.005, vacancyAdj: 0.04, maintenanceMul: 1.1,
  },
  stress: {
    rateAdj: 0.025, growthAdj: -0.025, rentGrowthAdj: -0.015, vacancyAdj: 0.06, maintenanceMul: 1.25,
    injectEvents: (h) => {
      const events: ForecastEvent[] = [];
      if (h >= 2) events.push({ kind: "rate_spike", year: 2, magnitude: 0.025, label: "Rate spike" });
      if (h >= 4) events.push({ kind: "recession", year: 4, magnitude: 0.05, label: "Recession" });
      if (h >= 8) events.push({ kind: "maintenance_shock", year: 8, magnitude: 8000, label: "Capex shock" });
      return events;
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Deterministic seeded RNG (mulberry32). */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller normal sample. */
function normal(rng: () => number, mean: number, sd: number): number {
  const u1 = Math.max(1e-9, rng());
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + sd * z;
}

/** Pull a value from a path or fall back to the constant. */
function pathAt(path: number[] | undefined, year: number, fallback: number): number {
  if (!path || path.length === 0) return fallback;
  const idx = Math.min(year - 1, path.length - 1);
  return path[idx];
}

/** Apply event side-effects to a per-year state mutator. */
interface YearState {
  rate: number;
  loanBalance: number;
  loanTermLeft: number;
  monthlyPay: number;
  isInterestOnly: boolean;
  growth: number;
  rentGrowth: number;
  rent: number;
  opex: number;
  vacancy: number;
  ruleset: TaxRuleset;
  gearingRule: GearingRule;
}

function applyEvent(state: YearState, ev: ForecastEvent) {
  switch (ev.kind) {
    case "refinance":
      // magnitude = new rate (decimal). Reset amortisation to remaining term.
      if (ev.magnitude != null) state.rate = ev.magnitude;
      state.isInterestOnly = false;
      break;
    case "io_to_pi":
      state.isInterestOnly = false;
      break;
    case "rate_spike":
      state.rate += ev.magnitude ?? 0.02;
      break;
    case "rate_cut":
      state.rate = Math.max(0.01, state.rate - (ev.magnitude ?? 0.005));
      break;
    case "rent_review":
      // magnitude = step uplift on rent (e.g. 0.06 = +6% one-off).
      state.rent *= 1 + (ev.magnitude ?? 0.05);
      break;
    case "maintenance_shock":
      // magnitude = AUD added to opex this year only (handled by caller).
      break;
    case "renovation":
      // magnitude = AUD spent (handled by caller); also boosts rent next year.
      state.rent *= 1 + (ev.magnitude != null ? Math.min(0.15, ev.magnitude / 100000 * 0.05) : 0.05);
      break;
    case "olympic_boost":
      state.growth += ev.magnitude ?? 0.04;
      state.rentGrowth += (ev.magnitude ?? 0.04) * 0.5;
      break;
    case "recession":
      state.growth -= ev.magnitude ?? 0.05;
      state.rentGrowth -= (ev.magnitude ?? 0.05) * 0.4;
      state.vacancy += 0.03;
      break;
    case "tax_reform":
      // magnitude flag: 1 → switch to ato_2027 / new_formula.
      if ((ev.magnitude ?? 1) >= 1) {
        state.ruleset = "ato_2027";
        state.gearingRule = "new_formula";
      }
      break;
  }
}

/** Recompute monthly payment from current loan balance, rate, and remaining term. */
function recomputeMonthlyPay(loan: number, ratePA: number, termLeftYears: number): number {
  if (loan <= 0) return 0;
  const r = ratePA / 12;
  const n = Math.max(1, termLeftYears * 12);
  if (r <= 0) return loan / n;
  return (loan * r) / (1 - Math.pow(1 + r, -n));
}

// ─────────────────────────────────────────────────────────────────────────────
// Core deterministic projection (single path)
// ─────────────────────────────────────────────────────────────────────────────

interface PathOptions {
  noise?: { rate: number; growth: number; rentGrowth: number; vacancy: number };
  rng?: () => number;
}

function projectPath(input: ForecastInput, scenario: ScenarioModulator, opts: PathOptions = {}): ForecastYear[] {
  const horizon = input.horizonYears ?? 30;
  const a = input.assumptions ?? {};
  const events = [
    ...(a.events ?? []),
    ...(scenario.injectEvents?.(horizon) ?? []),
  ];

  const eventsByYear = new Map<number, ForecastEvent[]>();
  for (const ev of events) {
    const list = eventsByYear.get(ev.year) ?? [];
    list.push(ev);
    eventsByYear.set(ev.year, list);
  }

  const state: YearState = {
    rate: input.interestRate,
    loanBalance: input.loanBalance,
    loanTermLeft: input.loanTermYears,
    monthlyPay: recomputeMonthlyPay(input.loanBalance, input.interestRate, input.loanTermYears),
    isInterestOnly: false,
    growth: input.growthRate,
    rentGrowth: input.rentGrowthRate,
    rent: input.rentalIncomePA,
    opex: input.operatingExpensesPA,
    vacancy: scenario.vacancyAdj,
    ruleset: input.ruleset ?? "ato_current",
    gearingRule: input.gearingRule ?? "old_formula",
  };

  let value = input.currentValue;
  let carry = 0;
  const rows: ForecastYear[] = [];
  const noise = opts.noise;
  const rng = opts.rng;

  for (let y = 1; y <= horizon; y++) {
    const yearEvents = eventsByYear.get(y) ?? [];
    let oneOffOpexAdd = 0;

    // Apply events at start of year.
    for (const ev of yearEvents) {
      applyEvent(state, ev);
      if (ev.kind === "maintenance_shock") oneOffOpexAdd += ev.magnitude ?? 5000;
      if (ev.kind === "renovation") oneOffOpexAdd += ev.magnitude ?? 25000;
      if (ev.kind === "refinance" || ev.kind === "io_to_pi") {
        state.monthlyPay = recomputeMonthlyPay(state.loanBalance, state.rate, state.loanTermLeft);
      }
    }

    // Path-based assumptions for this year (with scenario adjustments).
    const ratePath = pathAt(a.ratePath, y, state.rate) + scenario.rateAdj;
    const growthPath = pathAt(a.growthPath, y, state.growth) + scenario.growthAdj;
    const rentGrowthPath = pathAt(a.rentGrowthPath, y, state.rentGrowth) + scenario.rentGrowthAdj;
    const vacancyPath = pathAt(a.vacancyPath, y, state.vacancy);
    const maintMul = pathAt(a.maintenancePath, y, 1) * scenario.maintenanceMul;

    // Add noise (MC-lite).
    const effRate = noise && rng
      ? Math.max(0.01, normal(rng, ratePath, noise.rate))
      : ratePath;
    const effGrowth = noise && rng ? normal(rng, growthPath, noise.growth) : growthPath;
    const effRentGrowth = noise && rng ? normal(rng, rentGrowthPath, noise.rentGrowth) : rentGrowthPath;
    const effVacancy = noise && rng
      ? Math.max(0, Math.min(0.5, normal(rng, vacancyPath, noise.vacancy)))
      : Math.max(0, Math.min(0.5, vacancyPath));

    // Update monthly pay if rate path differs from state.rate (track change).
    if (Math.abs(effRate - state.rate) > 1e-6) {
      state.rate = effRate;
      state.monthlyPay = recomputeMonthlyPay(state.loanBalance, state.rate, state.loanTermLeft);
    }

    // Amortise this year.
    let interestThisYear = 0;
    let principalThisYear = 0;
    let bal = state.loanBalance;
    const r = state.rate / 12;
    if (state.isInterestOnly) {
      interestThisYear = bal * state.rate;
      principalThisYear = 0;
    } else {
      for (let m = 0; m < 12 && bal > 0; m++) {
        const interest = bal * r;
        const principal = Math.max(0, Math.min(bal, state.monthlyPay - interest));
        interestThisYear += interest;
        principalThisYear += principal;
        bal = Math.max(0, bal - principal);
      }
    }
    state.loanBalance = bal;
    state.loanTermLeft = Math.max(0, state.loanTermLeft - 1);

    // Property value update.
    value = value * (1 + effGrowth);

    // Effective rent net of vacancy + maintenance shock add.
    const rentNetVac = state.rent * (1 - effVacancy);
    const opexThisYear = state.opex * maintMul + oneOffOpexAdd;
    const rentalNet = rentNetVac - opexThisYear - interestThisYear;

    let refund = 0;
    let nextCarry = 0;
    if (input.isInvestment) {
      const g = computeGearing({
        baseIncome: input.baseHouseholdIncome,
        rentalIncome: rentNetVac,
        rentalExpenses: opexThisYear + interestThisYear,
        carryForward: carry,
        ruleset: state.ruleset,
        gearingRule: state.gearingRule,
      });
      refund = g.taxRefundFromIp;
      nextCarry = g.nextYearCarryForward;
    }

    const netCf = rentalNet + refund;

    rows.push({
      year: new Date().getFullYear() + y - 1,
      age: y,
      propertyValue: value,
      loanBalance: state.loanBalance,
      equity: Math.max(0, value - state.loanBalance),
      rentalGross: rentNetVac,
      operatingExpenses: opexThisYear,
      interestPaid: interestThisYear,
      principalPaid: principalThisYear,
      rentalNet,
      taxRefund: refund,
      netCashflow: netCf,
      carryForward: nextCarry,
      effectiveRate: state.rate,
      effectiveVacancy: effVacancy,
      cfP10: 0, cfP90: 0, eqP10: 0, eqP90: 0,
      events: yearEvents,
    });

    // Roll forward growth / rent / opex.
    state.rent *= 1 + effRentGrowth;
    state.opex *= 1 + 0.025; // illustrative CPI on opex (in addition to maintMul this year)
    carry = nextCarry;
  }

  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// MC-lite — overlay percentile bands on the deterministic path.
// ─────────────────────────────────────────────────────────────────────────────

function attachMcBands(deterministic: ForecastYear[], input: ForecastInput, scenario: ScenarioModulator): void {
  const a = input.assumptions ?? {};
  const paths = a.mcPaths ?? 0;
  if (paths <= 0 || !a.volatility) return;
  const rng = mulberry32(a.mcSeed ?? 1);
  const noise = {
    rate: a.volatility.rate ?? 0.0075,
    growth: a.volatility.growth ?? 0.02,
    rentGrowth: a.volatility.rentGrowth ?? 0.012,
    vacancy: a.volatility.vacancy ?? 0.015,
  };

  // Run N paths, store cf and equity per year.
  const cfMatrix: number[][] = Array(deterministic.length).fill(null).map(() => []);
  const eqMatrix: number[][] = Array(deterministic.length).fill(null).map(() => []);

  for (let p = 0; p < paths; p++) {
    const path = projectPath(input, scenario, { noise, rng });
    for (let y = 0; y < path.length; y++) {
      cfMatrix[y].push(path[y].netCashflow);
      eqMatrix[y].push(path[y].equity);
    }
  }

  for (let y = 0; y < deterministic.length; y++) {
    const cfs = cfMatrix[y].slice().sort((a, b) => a - b);
    const eqs = eqMatrix[y].slice().sort((a, b) => a - b);
    const i10 = Math.floor(cfs.length * 0.1);
    const i90 = Math.floor(cfs.length * 0.9);
    deterministic[y].cfP10 = cfs[i10] ?? 0;
    deterministic[y].cfP90 = cfs[i90] ?? 0;
    deterministic[y].eqP10 = eqs[i10] ?? 0;
    deterministic[y].eqP90 = eqs[i90] ?? 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// KPIs
// ─────────────────────────────────────────────────────────────────────────────

function computeKpis(rows: ForecastYear[]): ForecastKpis {
  let breakEven: number | null = null;
  let worst: { year: number; cashflow: number } | null = null;
  let cumNeg = 0;
  let totalRefund = 0;
  let selfSus: number | null = null;
  let debtFree: number | null = null;
  let rentCovers: number | null = null;

  for (const r of rows) {
    if (breakEven == null && r.netCashflow >= 0) breakEven = r.year;
    if (worst == null || r.netCashflow < worst.cashflow) {
      worst = { year: r.year, cashflow: r.netCashflow };
    }
    if (r.netCashflow < 0) cumNeg += r.netCashflow;
    totalRefund += r.taxRefund;
    if (selfSus == null && r.rentalGross >= r.interestPaid + r.operatingExpenses) {
      selfSus = r.year;
    }
    if (debtFree == null && r.loanBalance <= 1) debtFree = r.year;
    if (rentCovers == null && r.rentalGross >= r.interestPaid) rentCovers = r.year;
  }

  const eq5 = rows[4]?.equity ?? rows[rows.length - 1]?.equity ?? 0;
  const eq10 = rows[9]?.equity ?? rows[rows.length - 1]?.equity ?? 0;
  const eq20 = rows[19]?.equity ?? rows[rows.length - 1]?.equity ?? 0;
  const eq30 = rows[29]?.equity ?? rows[rows.length - 1]?.equity ?? 0;

  const tail = rows.slice(-3);
  const meanRent = tail.reduce((s, r) => s + r.rentalGross, 0) / Math.max(1, tail.length);
  const meanOpex = tail.reduce((s, r) => s + r.operatingExpenses, 0) / Math.max(1, tail.length);
  const passive = Math.max(0, meanRent - meanOpex);

  return {
    breakEvenYear: breakEven,
    worstYear: worst,
    cumulativeNegativeCf: cumNeg,
    totalTaxShield: totalRefund,
    selfSustainingYear: selfSus,
    debtFreeYear: debtFree,
    rentCoversInterestYear: rentCovers,
    projectedEquityYear5: eq5,
    projectedEquityYear10: eq10,
    projectedEquityYear20: eq20,
    projectedEquityYear30: eq30,
    projectedPassiveIncome: passive,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run a single scenario forecast. If `mcPaths > 0` and `volatility` is set,
 * percentile bands are attached.
 */
export function projectPropertyForecast(
  input: ForecastInput,
  scenario: ForecastScenario = "base",
): ForecastResult {
  const modulator = SCENARIO_PRESETS[scenario];
  const rows = projectPath(input, modulator);
  attachMcBands(rows, input, modulator);
  const kpis = computeKpis(rows);
  const events = [
    ...(input.assumptions?.events ?? []),
    ...(modulator.injectEvents?.(input.horizonYears ?? 30) ?? []),
  ].sort((a, b) => a.year - b.year);
  return {
    rows,
    kpis,
    scenario,
    events,
    assumptionsUsed: input.assumptions ?? {},
  };
}

/**
 * Run all four scenarios at once. Useful for the chart's scenario toggle.
 */
export function projectAllScenarios(input: ForecastInput): Record<ForecastScenario, ForecastResult> {
  return {
    base: projectPropertyForecast(input, "base"),
    optimistic: projectPropertyForecast(input, "optimistic"),
    conservative: projectPropertyForecast(input, "conservative"),
    stress: projectPropertyForecast(input, "stress"),
  };
}

/**
 * Lightweight default volatility for MC-lite.
 */
export const DEFAULT_VOLATILITY = {
  rate: 0.0075,
  growth: 0.02,
  rentGrowth: 0.012,
  vacancy: 0.015,
} as const;

/**
 * Default forecast assumptions for a fresh property — turns MC on with sane defaults.
 */
export function defaultAssumptions(horizon = 30): ForecastAssumptions {
  return {
    events: [],
    volatility: { ...DEFAULT_VOLATILITY },
    mcPaths: 64,
    mcSeed: 7,
  };
}

/** Localised label for an event kind. */
export function eventLabel(kind: ForecastEventKind): string {
  switch (kind) {
    case "refinance": return "Refinance";
    case "io_to_pi": return "IO → P&I";
    case "rate_spike": return "Rate spike";
    case "rate_cut": return "Rate cut";
    case "rent_review": return "Rent review";
    case "maintenance_shock": return "Capex shock";
    case "renovation": return "Renovation";
    case "olympic_boost": return "Olympic boost";
    case "tax_reform": return "Tax reform";
    case "recession": return "Recession";
  }
}
