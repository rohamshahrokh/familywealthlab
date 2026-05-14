import "server-only";
import { createHash } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildDashboardInputs } from "@/lib/dashboard/buildDashboardInputs";
import {
  selectCanonicalNetWorth,
  selectTotalInvestments,
  selectPropertyEquity,
  selectMonthlyDebtService,
  selectMonthlyIncome,
  selectMonthlyExpensesLedger,
  selectMonthlySurplus,
  selectPassiveIncome,
} from "@fwl/engine";
import {
  emptySnapshot,
  SNAPSHOT_SCHEMA_VERSION,
  type Snapshot,
  type DataHealthRow,
  type EngineReadiness,
  type KpiState,
} from "./types";

/**
 * computeSnapshot — the ONLY place a Snapshot is materialised from the ledger.
 *
 * Deterministic, household-scoped, no AI, no simulation. Runs entirely on
 * RLS-filtered reads. If the caller cannot see the household, every read
 * returns 0 rows and we emit the `emptySnapshot()` for that household id.
 *
 * Cost: ~9 small SELECTs in parallel. Cheap enough to run on every page load,
 * but `refreshSnapshotCache` writes the result to ledger.snapshot_cache so
 * subsequent reads can serve from cache.
 */
export async function computeSnapshot(householdId: string): Promise<Snapshot> {
  const supabase = createSupabaseServerClient();

  const [
    inputs,
    cashRes,
    liabRes,
    superRes,
    assumpRes,
    eventsRes,
  ] = await Promise.all([
    buildDashboardInputs(householdId),
    supabase.schema("ledger").from("cash_accounts")
      .select("*").eq("household_id", householdId),
    supabase.schema("ledger").from("liabilities")
      .select("*").eq("household_id", householdId),
    supabase.schema("ledger").from("super_accounts")
      .select("*").eq("household_id", householdId),
    supabase.schema("ledger").from("assumptions")
      .select("*").eq("household_id", householdId).maybeSingle(),
    supabase.schema("ledger").from("timeline_events")
      .select("*").eq("household_id", householdId).order("event_date", { ascending: true }),
  ]);

  const cashRows = cashRes.data ?? [];
  const liabRows = liabRes.data ?? [];
  const superRows = superRes.data ?? [];
  const assumptions = assumpRes.data ?? null;
  const events = eventsRes.data ?? [];

  // ── Wealth ───────────────────────────────────────────────────────────────
  // Cash today: prefer ledger.cash_accounts when present, else fall back to
  // the engine's snapshot-JSON selector. Same pattern for super and debt.
  const cashFromLedger = sumBalances(cashRows);
  const cashToday = cashFromLedger > 0
    ? cashFromLedger
    : Math.max(0, num(inputs.snapshot?.cash) + num(inputs.snapshot?.savings_cash) +
                 num(inputs.snapshot?.emergency_cash) + num(inputs.snapshot?.offset_balance));

  const lockedSuper = sumBalances(superRows);

  const otherLiabilities = sumBalances(liabRows);
  const properties = inputs.properties ?? [];
  const propertyLoans = properties.reduce((sum: number, p) => sum + num(p.loan_amount), 0);

  const propertyEquity = selectPropertyEquity(inputs);
  const investments = selectTotalInvestments(inputs);
  const totalDebt = propertyLoans + otherLiabilities;

  // Net worth: prefer the engine's canonical formula (it factors stocks/crypto/
  // properties/super correctly), but add ledger.liabilities on top since that
  // table didn't exist in Phase 1.
  const engineNw = selectCanonicalNetWorth(inputs).netWorth;
  const netWorth = Math.round(engineNw - otherLiabilities);

  // Accessible wealth = liquid (cash + investments) + property equity. Excludes
  // super because it's preservation-locked.
  const accessibleWealth = Math.round(cashToday + investments + propertyEquity);

  // ── Cashflow ─────────────────────────────────────────────────────────────
  const monthlyIncome = selectMonthlyIncome(inputs);
  const monthlyExpenses = selectMonthlyExpensesLedger(inputs);
  const monthlyDebtService = selectMonthlyDebtService(inputs)
    + sumMinPayments(liabRows);
  const monthlySurplus = selectMonthlySurplus(inputs)
    - sumMinPayments(liabRows); // engine doesn't see ledger.liabilities yet
  const annualPassiveIncome = selectPassiveIncome(inputs);

  // ── FIRE ────────────────────────────────────────────────────────────────
  const fireTarget = numOrNull(assumptions?.fire_target_amount);
  const fireAge = numOrNull(assumptions?.fire_target_age);
  let fireProgressPct: number | null = null;
  let fireGap: number | null = null;
  let estYearsToFire: number | null = null;
  if (fireTarget && fireTarget > 0) {
    fireProgressPct = Math.min(1, Math.max(0, accessibleWealth / fireTarget));
    fireGap = Math.max(0, fireTarget - accessibleWealth);
    if (monthlySurplus > 0 && fireGap > 0) {
      const r = numOrNull(assumptions?.return_assumption) ?? 0.07;
      // Future-value-of-annuity reverse: n = ln(1 + r*FV/PMT) / ln(1+r)
      // Use annual figures.
      const annualSurplus = monthlySurplus * 12;
      const i = r / 1; // annual rate
      if (i > 0) {
        const ratio = 1 + (i * fireGap) / annualSurplus;
        if (ratio > 0) estYearsToFire = Math.log(ratio) / Math.log(1 + i);
      } else {
        estYearsToFire = fireGap / annualSurplus;
      }
      if (estYearsToFire !== null && (!Number.isFinite(estYearsToFire) || estYearsToFire < 0)) {
        estYearsToFire = null;
      } else if (estYearsToFire !== null) {
        estYearsToFire = Math.round(estYearsToFire * 10) / 10;
      }
    }
  }

  // ── Emergency buffer ────────────────────────────────────────────────────
  const targetMonths = numOrNull(assumptions?.emergency_buffer_months) ?? 6;
  let monthsCovered: number | null = null;
  let bufferState: KpiState = "unknown";
  if (monthlyExpenses > 0) {
    monthsCovered = Math.round((cashToday / monthlyExpenses) * 10) / 10;
    if (monthsCovered >= targetMonths) bufferState = "ok";
    else if (monthsCovered >= targetMonths / 2) bufferState = "warning";
    else bufferState = "critical";
  }

  // ── Next major event ────────────────────────────────────────────────────
  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => typeof e.event_date === "string" && e.event_date >= todayIso)
    .sort((a, b) => (a.event_date as string).localeCompare(b.event_date as string))[0];
  const nextMajorEvent = upcoming
    ? {
        id: upcoming.id,
        name: upcoming.name ?? "Untitled event",
        dateIso: upcoming.event_date,
        category: (upcoming.category as string | null) ?? null,
      }
    : null;

  // ── Data health ─────────────────────────────────────────────────────────
  const dataHealth: DataHealthRow[] = [
    healthRow("cash",         cashRows,                "updated_at"),
    healthRow("properties",   properties,              "updated_at"),
    healthRow("investments",  [...(inputs.stocks ?? []), ...(inputs.cryptos ?? [])], "updated_at"),
    healthRow("super",        superRows,               "updated_at"),
    healthRow("liabilities",  liabRows,                "updated_at"),
    healthRow("income",       inputs.incomeRecords ?? [], "recorded_on"),
    healthRow("expenses",     inputs.expenses ?? [],   "recorded_on"),
    healthRow("assumptions",  assumptions ? [assumptions] : [], "updated_at"),
  ];

  // ── Engine readiness ────────────────────────────────────────────────────
  const blockers: string[] = [];
  const hasIncome = monthlyIncome > 0;
  const hasExpenses = monthlyExpenses > 0;
  const hasAnyAsset = cashToday > 0 || investments > 0 || propertyEquity > 0 || lockedSuper > 0;
  if (!hasIncome) blockers.push("Add income sources");
  if (!hasExpenses) blockers.push("Add expenses");
  if (!hasAnyAsset) blockers.push("Add at least one asset (cash, property, investment, or super)");

  const canRunBaseline = hasIncome && hasExpenses && hasAnyAsset;
  const canRunFire = canRunBaseline && fireTarget !== null && monthlySurplus > 0;
  const canRunMonteCarlo = canRunBaseline &&
    numOrNull(assumptions?.return_assumption) !== null &&
    numOrNull(assumptions?.inflation_assumption) !== null;
  const canRunGoalSolver = canRunBaseline && (fireTarget !== null || fireAge !== null);

  const engineReadiness: EngineReadiness = {
    canRunBaseline,
    canRunFire,
    canRunMonteCarlo,
    canRunGoalSolver,
    blockers,
  };

  // ── Assemble ────────────────────────────────────────────────────────────
  const snapshot: Snapshot = {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    householdId,
    computedAtIso: new Date().toISOString(),
    inputsFingerprint: fingerprint({
      cashRows, liabRows, superRows, assumptions, properties,
      stocks: inputs.stocks, cryptos: inputs.cryptos,
      income: inputs.incomeRecords, expenses: inputs.expenses,
      events,
    }),
    wealth: {
      netWorth,
      accessibleWealth,
      lockedRetirementWealth: Math.round(lockedSuper),
      cashToday: Math.round(cashToday),
      propertyEquity: Math.round(propertyEquity),
      investments: Math.round(investments),
      debtBalance: Math.round(totalDebt),
      debtSplit: {
        propertyLoans: Math.round(propertyLoans),
        otherLiabilities: Math.round(otherLiabilities),
      },
    },
    cashflow: {
      monthlyIncome: Math.round(monthlyIncome),
      monthlyExpenses: Math.round(monthlyExpenses),
      monthlyDebtService: Math.round(monthlyDebtService),
      monthlySurplus: Math.round(monthlySurplus),
      annualPassiveIncome: Math.round(annualPassiveIncome),
    },
    fire: {
      targetAmount: fireTarget,
      targetAge: fireAge,
      progressPct: fireProgressPct,
      gap: fireGap,
      estYearsToFire,
    },
    emergencyBuffer: {
      monthsCovered,
      targetMonths,
      state: bufferState,
    },
    nextMajorEvent,
    dataHealth,
    engineReadiness,
    decision: null,
  };

  // If literally every section is empty, hand back the canonical empty form so
  // consumers can rely on a single empty-state shape.
  if (isCompletelyEmpty(snapshot)) {
    const empty = emptySnapshot(householdId);
    empty.computedAtIso = snapshot.computedAtIso;
    empty.dataHealth = dataHealth;
    empty.engineReadiness = engineReadiness;
    return empty;
  }

  return snapshot;
}

// ── helpers ────────────────────────────────────────────────────────────────

function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function sumBalances(rows: Array<{ balance?: unknown }>): number {
  return rows.reduce((sum, r) => sum + num(r.balance), 0);
}

function sumMinPayments(rows: Array<{ min_payment?: unknown }>): number {
  return rows.reduce((sum, r) => sum + num(r.min_payment), 0);
}

function healthRow(
  section: DataHealthRow["section"],
  rows: Array<Record<string, unknown>>,
  dateKey: string,
): DataHealthRow {
  const last = rows
    .map((r) => r[dateKey])
    .filter((d): d is string => typeof d === "string")
    .sort()
    .pop() ?? null;
  return {
    section,
    rows: rows.length,
    hasData: rows.length > 0,
    lastUpdatedIso: last,
  };
}

function isCompletelyEmpty(s: Snapshot): boolean {
  return (
    s.wealth.netWorth === 0 &&
    s.wealth.cashToday === 0 &&
    s.wealth.investments === 0 &&
    s.wealth.propertyEquity === 0 &&
    s.wealth.lockedRetirementWealth === 0 &&
    s.cashflow.monthlyIncome === 0 &&
    s.cashflow.monthlyExpenses === 0 &&
    !s.nextMajorEvent
  );
}

function fingerprint(obj: unknown): string {
  const json = JSON.stringify(obj, Object.keys(obj ?? {}).sort());
  return createHash("sha256").update(json).digest("hex").slice(0, 16);
}
