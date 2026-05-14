import "server-only";
import type { DashboardInputs } from "@fwl/engine";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Build the canonical `DashboardInputs` for a given household by reading from
 * `ledger.*` under RLS. This is the ONLY function in the app that materialises
 * DashboardInputs — every dashboard, decision surface, and engine call hits
 * this seam.
 *
 * RLS does the security work: if the caller is not a member of the household,
 * each query returns 0 rows and the function returns an empty-but-valid input
 * shape. We never throw on "no data" — the engine + selectors handle empties.
 */
export async function buildDashboardInputs(householdId: string): Promise<DashboardInputs> {
  const supabase = createSupabaseServerClient();

  const [snap, props, stocks, cryptos, income, expenses] = await Promise.all([
    supabase.schema("ledger").from("snapshot")
      .select("*").eq("household_id", householdId).maybeSingle(),
    supabase.schema("ledger").from("properties")
      .select("*").eq("household_id", householdId),
    supabase.schema("ledger").from("stocks")
      .select("*").eq("household_id", householdId),
    supabase.schema("ledger").from("crypto")
      .select("*").eq("household_id", householdId),
    supabase.schema("ledger").from("income_sources")
      .select("*").eq("household_id", householdId).order("recorded_on", { ascending: false }),
    supabase.schema("ledger").from("expenses")
      .select("*").eq("household_id", householdId).order("recorded_on", { ascending: false }),
  ]);

  // Adapt ledger.income_sources → DashboardInputs.incomeRecords shape (amount,
  // cadence, recorded_on). The engine averages monthly entries; convert
  // annual/one_off here so the engine sees monthly equivalents.
  const incomeRecords = (income.data ?? []).map(row => ({
    ...row,
    amount: cadenceToMonthly(row.amount, row.cadence),
  }));

  const expenseRecords = (expenses.data ?? []).map(row => ({
    ...row,
    amount: cadenceToMonthly(row.amount, row.cadence),
  }));

  return {
    snapshot: snap.data ?? null,
    properties: props.data ?? [],
    stocks: stocks.data ?? [],
    cryptos: cryptos.data ?? [],
    holdingsRaw: [], // Phase 2 — unified holdings feed
    incomeRecords,
    expenses: expenseRecords,
    todayIso: new Date().toISOString().slice(0, 10),
  };
}

function cadenceToMonthly(amount: number | string | null, cadence: string | null): number {
  const n = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (!Number.isFinite(n)) return 0;
  switch (cadence) {
    case "annual":  return n / 12;
    case "one_off": return 0; // engine handles via timeline_events, not steady state
    case "monthly":
    default:        return n;
  }
}
