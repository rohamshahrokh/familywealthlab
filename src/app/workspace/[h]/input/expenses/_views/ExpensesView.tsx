/**
 * ExpensesView — server component for the Expenses tab.
 *
 * Layout:
 *   1. KPI strip (4 tiles)
 *   2. Period toggle
 *   3. Spending by Category (donut)
 *   4. Annual Spend by Year (bar chart)
 *   5. Avg Monthly by Category (horizontal bars, top 8)
 *   6. Top Growing Categories (last 3mo vs prior 3mo)
 *   7. Filter card
 *   8. Expense table (paginated, sortable)
 *   9. Footer summary
 *   10. Pagination
 *   11. Auto Import Settings
 *   12. AI Insights card
 */

import * as React from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SurfaceCard, CardHeader, KpiCard } from "@/components/workspace/cards";
import { Donut, BarRow } from "@/components/workspace/charts";
import {
  fmtMoney,
  fmtMoneyCompact,
  fmtNumber,
} from "@/components/workspace/format";
import { FilterBar } from "../_components/FilterBar";
import { PeriodToggle, type Period } from "../_components/PeriodToggle";
import { AutoImportSettings } from "../_components/AutoImportSettings";
import { AiInsightsCard } from "../_components/AiInsightsCard";
import { DeleteExpenseButton } from "../DeleteExpenseButton";
import {
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "../expense-constants";

// ─── Category colour palette ─────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  housing:          "#C97030",
  food:             "#3FA88F",
  transport:        "#5085D9",
  leisure:          "#E0A040",
  health:           "#C24A6B",
  insurance:        "#6B8DAC",
  shopping:         "#A85DA8",
  childcare:        "#5BA850",
  kids:             "#8C6B40",
  utilities:        "#4F6E8F",
  subscriptions:    "#B85D38",
  fitness:          "#3F8FA8",
  education:        "#996B7A",
  travel:           "#7AA850",
  gifts:            "#7B6CF6",
  home_maintenance: "#A87B50",
  investment_costs: "#5085D9",
  debt_service:     "#C24A6B",
  refund:           "#3FA88F",
  other:            "#8C8C8C",
};

function catColor(cat: string): string {
  return CAT_COLORS[cat] ?? "#8C8C8C";
}

function catLabel(cat: string): string {
  return EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] ?? cat;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isRefund(e: ExpenseRow): boolean {
  return e.is_refund === true || e.category === "refund";
}

type ExpenseRow = {
  id: string;
  category: string;
  label: string | null;
  amount: number;
  cadence: string;
  is_refund: boolean | null;
  source_code: string | null;
  member: string | null;
  payment_method: string | null;
  expense_date: string | null;
  created_at: string;
};

// ─── Analytics (pure) ────────────────────────────────────────────────────────

function computeAnalytics(
  allExpenses: ExpenseRow[],
  filtered: ExpenseRow[],
  period: Period,
) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // KPI: total (net of refunds)
  const totalFiltered = filtered.reduce(
    (s, e) => isRefund(e) ? s - e.amount : s + e.amount, 0
  );

  // KPI: this month
  const thisMonthSpend = allExpenses
    .filter((e) => {
      const d = new Date(e.expense_date ?? e.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((s, e) => isRefund(e) ? s - e.amount : s + e.amount, 0);

  // KPI: avg monthly
  const monthKeys = new Set(
    filtered.map((e) => {
      const d = new Date(e.expense_date ?? e.created_at);
      return `${d.getFullYear()}-${d.getMonth()}`;
    })
  );
  const monthCount = Math.max(monthKeys.size, 1);
  const avgMonthly = totalFiltered / monthCount;

  // Spending by category (donut)
  const byCat: Record<string, number> = {};
  filtered.forEach((e) => {
    if (!isRefund(e)) byCat[e.category] = (byCat[e.category] ?? 0) + e.amount;
  });
  const categorySlices = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([cat, value]) => ({
      label: catLabel(cat),
      value,
      color: catColor(cat),
    }));

  // Annual spend by year (bar rows or area chart depending on period)
  const byYear: Record<string, number> = {};
  filtered.forEach((e) => {
    const yr = String(new Date(e.expense_date ?? e.created_at).getFullYear());
    byYear[yr] = (byYear[yr] ?? 0) + e.amount;
  });
  const yearlyRows = Object.entries(byYear)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, amount]) => ({ label: year, value: amount as number }));

  // Avg monthly by category (top 8)
  const avgMonthlyByCat = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([cat, total]) => ({
      label: catLabel(cat),
      value: (total as number) / monthCount,
      color: catColor(cat),
    }));

  // Growing categories (last 3mo vs prior 3mo)
  const ms3mo = 3 * 30 * 24 * 60 * 60 * 1000;
  const last3Start = new Date(now.getTime() - ms3mo);
  const prior3Start = new Date(now.getTime() - 2 * ms3mo);
  const last3: Record<string, number> = {};
  const prior3: Record<string, number> = {};
  allExpenses.forEach((e) => {
    const d = new Date(e.expense_date ?? e.created_at);
    if (isRefund(e)) return;
    if (d >= last3Start) last3[e.category] = (last3[e.category] ?? 0) + e.amount;
    else if (d >= prior3Start && d < last3Start)
      prior3[e.category] = (prior3[e.category] ?? 0) + e.amount;
  });
  const growing = Object.keys({ ...last3, ...prior3 })
    .map((cat) => {
      const lastAvg = (last3[cat] ?? 0) / 3;
      const priorAvg = (prior3[cat] ?? 0) / 3;
      const pct = priorAvg > 0 ? ((lastAvg - priorAvg) / priorAvg) * 100 : lastAvg > 0 ? 100 : 0;
      return { cat, lastAvg, pct };
    })
    .filter((c) => c.lastAvg > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  return {
    totalFiltered,
    thisMonthSpend,
    avgMonthly,
    monthCount,
    categorySlices,
    yearlyRows,
    avgMonthlyByCat,
    growing,
  };
}

// ─── Page size ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

// ─── Main component ───────────────────────────────────────────────────────────

export function ExpensesView({
  householdId,
  basePath,
  allExpenses,
  searchParams,
}: {
  householdId: string;
  basePath: string;
  allExpenses: ExpenseRow[];
  searchParams: Record<string, string>;
}) {
  // ── Parse filter params ───────────────────────────────────────────────────
  const search   = searchParams.search   ?? "";
  const year     = searchParams.year     ?? "";
  const month    = searchParams.month    ?? "";
  const category = searchParams.category ?? "";
  const code     = searchParams.code     ?? "";
  const member   = searchParams.member   ?? "";
  const payment  = searchParams.payment  ?? "";
  const dateFrom = searchParams.dateFrom ?? "";
  const dateTo   = searchParams.dateTo   ?? "";
  const sort     = searchParams.sort     ?? "date";
  const dir      = searchParams.dir      ?? "desc";
  const pageNum  = Math.max(1, Number(searchParams.page ?? "1"));
  const period   = (searchParams.period ?? "annual") as Period;

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = allExpenses.filter((e) => {
    const dateStr = e.expense_date ?? e.created_at.slice(0, 10);
    const d = new Date(dateStr);
    if (year && d.getFullYear() !== Number(year)) return false;
    if (month !== "" && !isNaN(Number(month)) && d.getMonth() !== Number(month)) return false;
    if (category && e.category !== category) return false;
    if (code && (e.source_code ?? "").toUpperCase() !== code.toUpperCase()) return false;
    if (member && e.member !== member) return false;
    if (payment && e.payment_method !== payment) return false;
    if (dateFrom && dateStr < dateFrom) return false;
    if (dateTo && dateStr > dateTo) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !(e.label ?? "").toLowerCase().includes(q) &&
        !(e.category ?? "").toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sorted = [...filtered].sort((a, b) => {
    let av: string | number = "";
    let bv: string | number = "";
    if (sort === "amount") { av = a.amount; bv = b.amount; }
    else if (sort === "category") { av = a.category; bv = b.category; }
    else {
      av = a.expense_date ?? a.created_at;
      bv = b.expense_date ?? b.created_at;
    }
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });

  // ── Paginate ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE);

  // ── Analytics ─────────────────────────────────────────────────────────────
  const a = computeAnalytics(allExpenses, filtered, period);

  // ── Footer totals ─────────────────────────────────────────────────────────
  const refundTotal = filtered.filter(isRefund).reduce((s, e) => s + e.amount, 0);

  // ── Sort link helper ──────────────────────────────────────────────────────
  const sortLink = (field: string) => {
    const newDir = sort === field && dir === "desc" ? "asc" : "desc";
    const params = new URLSearchParams({ ...searchParams, sort: field, dir: newDir, page: "1" });
    return `${basePath}?${params.toString()}`;
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sort !== field) return <span className="text-ink-quaternary ml-1">↕</span>;
    return dir === "asc" ? (
      <ChevronUp className="inline h-3.5 w-3.5 ml-1 text-ember-500" />
    ) : (
      <ChevronDown className="inline h-3.5 w-3.5 ml-1 text-ember-500" />
    );
  };

  const pageLink = (p: number) => {
    const params = new URLSearchParams({ ...searchParams, page: String(p) });
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* ── KPI strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          index="01"
          label="TOTAL (FILTERED)"
          value={a.totalFiltered}
          format="moneyCompact"
          tone="warning"
          sub="Net of refunds"
        />
        <KpiCard
          index="02"
          label="THIS MONTH"
          value={a.thisMonthSpend}
          format="moneyCompact"
          tone="neutral"
        />
        <KpiCard
          index="03"
          label="AVG MONTHLY"
          value={a.avgMonthly}
          format="moneyCompact"
          tone="neutral"
          sub={`Over ${a.monthCount} month${a.monthCount !== 1 ? "s" : ""}`}
        />
        <KpiCard
          index="04"
          label="TRANSACTIONS"
          value={filtered.length}
          format="raw"
          tone="neutral"
          sub={`${sorted.length} filtered`}
        />
      </div>

      {/* ── Period toggle ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-body-sm font-semibold text-ink-secondary">View period</h3>
        <PeriodToggle
          activePeriod={period}
          searchParams={searchParams}
          basePath={basePath}
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <SurfaceCard tone="paper" padding="md">
          <CardHeader eyebrow="BREAKDOWN" title="Spending by Category" />
          {a.categorySlices.length > 0 ? (
            <Donut
              slices={a.categorySlices}
              size={200}
              thickness={28}
              centerLabel={fmtMoneyCompact(a.totalFiltered)}
              centerSub="filtered"
            />
          ) : (
            <div className="py-8 text-center text-caption text-ink-quaternary">No data for current filter</div>
          )}
        </SurfaceCard>

        {/* Annual Spend by Year */}
        <SurfaceCard tone="paper" padding="md">
          <CardHeader eyebrow="HISTORY" title="Annual Spend by Year" />
          {a.yearlyRows.length > 0 ? (
            <>
              <BarRow
                rows={a.yearlyRows.map((r) => ({
                  label: r.label,
                  value: r.value,
                  color: "#C97030",
                }))}
                valueLabel={fmtMoneyCompact}
              />
              {a.yearlyRows.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-caption text-ink-tertiary">
                  {a.yearlyRows.map((r) => (
                    <span key={r.label} className="tabular-nums">
                      {r.label} &nbsp;
                      <span className="text-ink-primary font-medium">{fmtMoneyCompact(r.value)}</span>
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-caption text-ink-quaternary">No data yet</div>
          )}
        </SurfaceCard>
      </div>

      {/* ── Second charts row ───────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Avg Monthly by Category */}
        <SurfaceCard tone="paper" padding="md">
          <CardHeader eyebrow="AVERAGES" title="Avg Monthly by Category" />
          {a.avgMonthlyByCat.length > 0 ? (
            <BarRow rows={a.avgMonthlyByCat} valueLabel={fmtMoneyCompact} />
          ) : (
            <div className="py-8 text-center text-caption text-ink-quaternary">No data yet</div>
          )}
        </SurfaceCard>

        {/* Top Growing Categories */}
        <SurfaceCard tone="paper" padding="md">
          <CardHeader eyebrow="TRENDS" title="Top Growing Categories" trailing={
            <span className="text-caption text-ink-quaternary">Last 3mo vs prior 3mo</span>
          } />
          {a.growing.length > 0 ? (
            <ul className="space-y-3">
              {a.growing.map((g) => (
                <li key={g.cat} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                      style={{ background: catColor(g.cat) }}
                      aria-hidden
                    />
                    <span className="text-body-sm text-ink-secondary truncate">{catLabel(g.cat)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-body-sm text-ink-primary tabular-nums font-medium">
                      {fmtMoneyCompact(g.lastAvg)}/mo
                    </span>
                    {g.pct !== 0 && (
                      <span
                        className={`text-caption font-medium px-1.5 py-0.5 rounded-full ${
                          g.pct > 0
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {g.pct > 0 ? "+" : ""}{g.pct.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-caption text-ink-quaternary">Not enough history yet</div>
          )}
        </SurfaceCard>
      </div>

      {/* ── Filter card ─────────────────────────────────────────────────────── */}
      <SurfaceCard tone="inset" padding="md">
        <CardHeader eyebrow="FILTERS" title="Filter Expenses" />
        <FilterBar
          action={basePath}
          defaults={{ search, year, month, category, code, member, payment, dateFrom, dateTo }}
          preserveParams={{ tab: "expenses", period, sort, dir }}
        />
      </SurfaceCard>

      {/* ── Expense table ───────────────────────────────────────────────────── */}
      <SurfaceCard tone="paper" padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm" aria-label="Expense records">
            <thead>
              <tr className="border-b border-line bg-bg-inset">
                <th className="w-10 py-2.5 pl-4 pr-2 text-left">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-2.5 px-3 text-left font-medium text-ink-tertiary">
                  <Link href={sortLink("date")} className="hover:text-ink-primary inline-flex items-center">
                    Date <SortIcon field="date" />
                  </Link>
                </th>
                <th className="py-2.5 px-3 text-right font-medium text-ink-tertiary">
                  <Link href={sortLink("amount")} className="hover:text-ink-primary inline-flex items-center justify-end">
                    Amount <SortIcon field="amount" />
                  </Link>
                </th>
                <th className="py-2.5 px-3 text-left font-medium text-ink-tertiary">Label</th>
                <th className="py-2.5 px-3 text-right font-medium text-ink-tertiary">
                  <Link href={sortLink("category")} className="hover:text-ink-primary inline-flex items-center justify-end">
                    Category <SortIcon field="category" />
                  </Link>
                </th>
                <th className="py-2.5 px-3 text-left font-medium text-ink-tertiary">Member</th>
                <th className="py-2.5 pl-3 pr-4 text-right font-medium text-ink-tertiary">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-caption text-ink-quaternary">
                    No expenses match the current filters.
                  </td>
                </tr>
              ) : (
                paginated.map((e) => {
                  const ref = isRefund(e);
                  const dateStr = e.expense_date ?? e.created_at.slice(0, 10);
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-line/40 hover:bg-bg-inset/40 transition-colors"
                    >
                      <td className="py-2 pl-4 pr-2">
                        {/* bulk select placeholder */}
                      </td>
                      <td className="py-2 px-3 text-ink-secondary tabular-nums whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className={`py-2 px-3 text-right tabular-nums font-medium whitespace-nowrap ${
                        ref ? "text-emerald-700" : "text-ember-600"
                      }`}>
                        {ref ? `+${fmtMoney(e.amount)}` : fmtMoney(e.amount)}
                      </td>
                      <td className="py-2 px-3 text-ink-primary truncate max-w-[200px]">
                        {e.label ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-caption font-medium"
                          style={{
                            background: catColor(e.category) + "20",
                            color: catColor(e.category),
                          }}
                        >
                          {catLabel(e.category)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-ink-tertiary text-caption">
                        {e.member ?? "—"}
                      </td>
                      <td className="py-2 pl-3 pr-2 text-right">
                        <DeleteExpenseButton householdId={householdId} id={e.id} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Footer summary row */}
            <tfoot>
              <tr className="border-t border-line bg-bg-inset">
                <td colSpan={7} className="py-2.5 px-4 text-caption text-ink-tertiary">
                  <span className="tabular-nums font-medium text-ink-secondary">
                    {fmtNumber(filtered.length)} records
                  </span>
                  &nbsp;&nbsp;
                  <span className="tabular-nums">
                    {fmtMoneyCompact(a.totalFiltered)}
                  </span>
                  {refundTotal > 0 && (
                    <span className="text-emerald-700 ml-1">
                      (incl. +{fmtMoneyCompact(refundTotal)} refunds)
                    </span>
                  )}
                  &nbsp;&nbsp;
                  <span className="text-ink-quaternary">Filtered total</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-4 px-4 pt-4 pb-2 border-t border-line/50">
          <span className="text-caption text-ink-tertiary tabular-nums">
            {fmtNumber(filtered.length)} results · Page {pageNum} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            {pageNum > 1 && (
              <Link
                href={pageLink(pageNum - 1)}
                className="h-8 px-3 inline-flex items-center text-body-sm text-ink-secondary hover:text-ink-primary hover:bg-bg-inset rounded-lg transition-colors"
                aria-label="Previous page"
              >
                Prev
              </Link>
            )}
            {pageNum < totalPages && (
              <Link
                href={pageLink(pageNum + 1)}
                className="h-8 px-3 inline-flex items-center text-body-sm text-ink-secondary hover:text-ink-primary hover:bg-bg-inset rounded-lg transition-colors"
                aria-label="Next page"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </SurfaceCard>

      {/* ── Auto Import Settings ────────────────────────────────────────────── */}
      <AutoImportSettings />

      {/* ── AI Insights card ────────────────────────────────────────────────── */}
      <AiInsightsCard householdId={householdId} />
    </div>
  );
}


