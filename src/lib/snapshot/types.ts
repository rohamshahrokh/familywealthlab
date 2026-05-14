/**
 * Snapshot — the central read-model of Family Wealth Lab.
 *
 * This struct is the canonical view of a household's financial state at
 * `computed_at`. Every downstream engine — Command Centre, Decision Engine,
 * Monte Carlo, Goal Solver, AI Insights, What-If, Scenario Comparison, FIRE
 * projection — reads from this struct instead of recomputing from raw
 * ledger rows. This keeps:
 *
 *   • One source of truth per KPI (no two surfaces can disagree).
 *   • Determinism (snapshot v1 of inputs ⇒ snapshot v1 of outputs, always).
 *   • Cheap reads (cache the struct, not the underlying rows).
 *   • Forward-compat (new fields are nullable; consumers tolerate absence).
 *
 * Conventions
 *   • All currency amounts are AUD numbers (rounded to nearest dollar).
 *   • All rates are decimal (0.0625 not 6.25).
 *   • All percentages on the UI side derive from {value, target} pairs here.
 *   • Anything the engine cannot derive deterministically is `null`, NEVER
 *     a placeholder value. Empty state is a real value.
 *   • This file has no runtime code — keep it free of imports so it can be
 *     consumed by both server and client without bundling concerns.
 */

export const SNAPSHOT_SCHEMA_VERSION = 1 as const;

/** A KPI with a domain-specific health classification. */
export type KpiState = "ok" | "warning" | "critical" | "unknown";

export type KpiNumber = {
  value: number | null;
  /** Optional target the UI uses to render progress / health colour. */
  target?: number | null;
  /** Percentage of `value / target` clamped 0..1, or null when unknown. */
  pct?: number | null;
  state?: KpiState;
};

/** Household-scoped wealth totals (deterministic, ledger-derived). */
export type WealthSection = {
  /** Total assets minus total liabilities. */
  netWorth: number;
  /** Cash + investments + property equity (excludes super). */
  accessibleWealth: number;
  /** Super balances (preserved until preservation age). */
  lockedRetirementWealth: number;
  cashToday: number;
  propertyEquity: number;
  /** Stocks + crypto. */
  investments: number;
  /** Property loans + non-property liabilities. */
  debtBalance: number;
  /** Optional split for the UI. */
  debtSplit: {
    propertyLoans: number;
    otherLiabilities: number;
  };
};

/** Cashflow section — monthly steady-state numbers from the ledger. */
export type CashflowSection = {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebtService: number;
  monthlySurplus: number;
  /** Annualised passive income (rent + dividends + other passive). */
  annualPassiveIncome: number;
};

/** FIRE projection — derived from wealth + assumptions only (no MC). */
export type FireSection = {
  /** User-defined FIRE target amount, or null if not set. */
  targetAmount: number | null;
  /** User-defined FIRE target age, or null if not set. */
  targetAge: number | null;
  /** `accessibleWealth / targetAmount` clamped 0..1, or null. */
  progressPct: number | null;
  /** Gap between current accessible wealth and target. */
  gap: number | null;
  /**
   * Linear projection of years-to-FIRE assuming current monthly surplus is
   * fully invested at the assumption return rate. `null` when not derivable
   * (surplus ≤ 0, no target, etc). The real Monte-Carlo answer comes from
   * Phase 2C engines, but this gives a starting indicator.
   */
  estYearsToFire: number | null;
};

export type EmergencyBufferSection = {
  /** Months of expenses currently held as cash. */
  monthsCovered: number | null;
  /** Target months from assumptions (default 6). */
  targetMonths: number;
  state: KpiState;
};

/** Major life / financial event from ledger.timeline_events. */
export type TimelineEvent = {
  id: string;
  name: string;
  dateIso: string;
  category: string | null;
};

/** Data-health row — one per ledger section. */
export type DataHealthRow = {
  section:
    | "cash"
    | "properties"
    | "investments"
    | "super"
    | "liabilities"
    | "income"
    | "expenses"
    | "assumptions";
  rows: number;
  hasData: boolean;
  lastUpdatedIso: string | null;
};

/** What-If readiness — what the engine can simulate today. */
export type EngineReadiness = {
  /** Can the forecast engine run a baseline? Needs income + expenses + at least one asset. */
  canRunBaseline: boolean;
  /** Can FIRE be projected? Needs target + surplus + assumptions. */
  canRunFire: boolean;
  /** Can Monte Carlo run? Needs baseline + return + inflation assumptions. */
  canRunMonteCarlo: boolean;
  /** Can the Goal Solver run? Needs target + at least one variable. */
  canRunGoalSolver: boolean;
  /** Human-readable list of what's still missing. */
  blockers: string[];
};

/** Decision-engine summary card payload — populated by adapter on demand. */
export type DecisionSummary = {
  /** Has the engine produced any recommendations this run? */
  hasRecommendations: boolean;
  topActionTitle: string | null;
  riskFlagCount: number;
  /** ISO timestamp of last decision-engine run, if any. */
  lastRunIso: string | null;
};

/**
 * Snapshot — central read-model. Every consumer (UI tiles, engines, AI,
 * What-If) reads from this single struct. Adding a field here is the ONLY
 * place new derived household facts should live.
 */
export interface Snapshot {
  schemaVersion: typeof SNAPSHOT_SCHEMA_VERSION;
  householdId: string;
  /** ISO timestamp the snapshot was materialised. */
  computedAtIso: string;
  /** Hash of the inputs that produced this snapshot — used for cache busts. */
  inputsFingerprint: string;

  wealth: WealthSection;
  cashflow: CashflowSection;
  fire: FireSection;
  emergencyBuffer: EmergencyBufferSection;

  nextMajorEvent: TimelineEvent | null;
  dataHealth: DataHealthRow[];
  engineReadiness: EngineReadiness;
  /** Optional — populated by the decision engine adapter when called. */
  decision: DecisionSummary | null;
}

/** Empty snapshot used when no ledger data exists yet. */
export function emptySnapshot(householdId: string): Snapshot {
  const nowIso = new Date().toISOString();
  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    householdId,
    computedAtIso: nowIso,
    inputsFingerprint: "empty",
    wealth: {
      netWorth: 0,
      accessibleWealth: 0,
      lockedRetirementWealth: 0,
      cashToday: 0,
      propertyEquity: 0,
      investments: 0,
      debtBalance: 0,
      debtSplit: { propertyLoans: 0, otherLiabilities: 0 },
    },
    cashflow: {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlyDebtService: 0,
      monthlySurplus: 0,
      annualPassiveIncome: 0,
    },
    fire: {
      targetAmount: null,
      targetAge: null,
      progressPct: null,
      gap: null,
      estYearsToFire: null,
    },
    emergencyBuffer: {
      monthsCovered: null,
      targetMonths: 6,
      state: "unknown",
    },
    nextMajorEvent: null,
    dataHealth: [],
    engineReadiness: {
      canRunBaseline: false,
      canRunFire: false,
      canRunMonteCarlo: false,
      canRunGoalSolver: false,
      blockers: ["No ledger data yet."],
    },
    decision: null,
  };
}
