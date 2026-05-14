/**
 * Income & Expense Tracker — main page (server component).
 *
 * Three tabs: Expenses · Income · Cash Flow.
 * Active tab is driven by ?tab= URL param (default: expenses).
 *
 * Data is fetched once here and passed to the active view.
 * Raw amounts are used (not monthly-normalised) so analytics can show
 * actual transaction values.
 */

import * as React from "react";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TabBar } from "./_components/TabBar";
import { HeaderActions } from "./_components/HeaderActions";
import { ExpensesView } from "./_views/ExpensesView";
import { IncomeView } from "./_views/IncomeView";
import { CashflowView } from "./_views/CashflowView";

export const dynamic = "force-dynamic";

// ─── Raw DB row types ─────────────────────────────────────────────────────────
type DbExpense = {
  id: string;
  household_id: string;
  category: string;
  label: string | null;
  amount: number;
  cadence: string;
  is_debt_service: boolean | null;
  is_refund: boolean | null;
  source_code: string | null;
  member: string | null;
  payment_method: string | null;
  subcategory: string | null;
  expense_date: string | null;
  notes: string | null;
  created_at: string;
};

type DbIncome = {
  id: string;
  household_id: string;
  source: string;
  label: string | null;
  amount: number;
  cadence: string;
  frequency: string | null;
  member: string | null;
  recorded_on: string | null;
  notes: string | null;
  created_at: string;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ExpensesPage({
  params,
  searchParams,
}: {
  params: { h: string };
  searchParams: Record<string, string | string[]>;
}) {
  await requireUser();

  const householdId = params.h;
  // Flatten searchParams (Next.js can give string | string[])
  const sp: Record<string, string> = {};
  for (const [k, v] of Object.entries(searchParams)) {
    sp[k] = Array.isArray(v) ? v[0] : v;
  }

  const tab = sp.tab ?? "expenses";
  const basePath = `/workspace/${householdId}/input/expenses`;

  // ── Fetch raw data ────────────────────────────────────────────────────────
  const supabase = createSupabaseServerClient();

  const [expResult, incResult] = await Promise.all([
    supabase
      .schema("ledger")
      .from("expenses")
      .select("*")
      .eq("household_id", householdId)
      .order("expense_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .schema("ledger")
      .from("income_sources")
      .select("*")
      .eq("household_id", householdId)
      .order("recorded_on", { ascending: false, nullsFirst: false }),
  ]);

  const allExpenses = (expResult.data ?? []) as DbExpense[];
  const allIncomeRecords = (incResult.data ?? []) as DbIncome[];

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h1 className="text-h5 sm:text-h4 font-semibold text-ink-primary tracking-tight">
            Income &amp; Expense Tracker
          </h1>
          <p className="mt-1 text-body-sm text-ink-tertiary">
            Track all family spending, income &amp; cash flow
          </p>
        </div>

        {/* Action buttons row */}
        <HeaderActions householdId={householdId} tab={tab} />
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <TabBar activeTab={tab} basePath={basePath} />

      {/* ── Active tab view ───────────────────────────────────────────────── */}
      {tab === "income" ? (
        <IncomeView
          householdId={householdId}
          basePath={basePath}
          allRecords={allIncomeRecords}
          searchParams={sp}
        />
      ) : tab === "cashflow" ? (
        <CashflowView
          basePath={basePath}
          expenses={allExpenses}
          incomeRecords={allIncomeRecords}
          searchParams={sp}
        />
      ) : (
        <ExpensesView
          householdId={householdId}
          basePath={basePath}
          allExpenses={allExpenses}
          searchParams={sp}
        />
      )}
    </div>
  );
}
