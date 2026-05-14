/**
 * CashflowView — server component for the Cash Flow tab.
 *
 * Layout:
 *   1. Year dropdown filter (top-right)
 *   2. KPI strip: Total Income, Total Expenses, Net Cash Flow, Savings Rate
 *   3. Monthly Income vs Expenses — grouped BarRow / AreaLine
 *   4. Cumulative Surplus — area chart of running savings
 *   5. Daily drill-down — only shown when a month is selected
 *   6. Monthly breakdown table
 */

import * as React from "react";
import Link from "next/link";
import { SurfaceCard, CardHeader, KpiCard } from "@/components/workspace/cards";
import { AreaLine, BarRow } from "@/components/workspace/charts";
import {
  fmtMoney,
  fmtMoneyCompact,
  fmtPercent,
  fmtNumber,
} from "@/components/workspace/format";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type ExpenseRow = {
  id: string;
  amount: number;
  is_refund: boolean | null;
  category: string;
  expense_date: string | null;
  created_at: string;
};

type IncomeRow = {
  id: string;
  amount: number;
  recorded_on: string | null;
  created_at: string;
};

// ─── Cash flow computation ────────────────────────────────────────────────────
function computeCashFlow(
  expenses: ExpenseRow[],
  incomeRecords: IncomeRow[],
  yearNum: number,
  monthFilter: string,
) {
  const monthly: {
    month: string;
    monthIdx: number;
    income: number;
    expenses: number;
    netCF: number;
  }[] = [];

  for (let m = 0; m < 12; m++) {
    const monthIncome = incomeRecords
      .filter((r) => {
        const d = new Date(r.recorded_on ?? r.created_at);
        return d.getFullYear() === yearNum && d.getMonth() === m;
      })
      .reduce((s, r) => s + r.amount, 0);

    const monthExpenses = expenses
      .filter((e) => {
        const d = new Date(e.expense_date ?? e.created_at);
        return d.getFullYear() === yearNum && d.getMonth() === m;
      })
      .reduce((s, e) => {
        return e.is_refund || e.category === "refund"
          ? s - e.amount
          : s + e.amount;
      }, 0);

    monthly.push({
      month: MONTH_LABELS[m],
      monthIdx: m,
      income: monthIncome,
      expenses: monthExpenses,
      netCF: monthIncome - monthExpenses,
    });
  }

  // KPI totals — only from the visible months
  const visibleMonths =
    monthFilter !== "" && !isNaN(Number(monthFilter))
      ? monthly.filter((r) => r.monthIdx === Number(monthFilter))
      : monthly;

  const totalIncome = visibleMonths.reduce((s, m) => s + m.income, 0);
  const totalExpenses = visibleMonths.reduce((s, m) => s + m.expenses, 0);
  const netCF = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? netCF / totalIncome : 0;

  // Cumulative surplus (running sum)
  let running = 0;
  const cumulative = monthly.map((m) => {
    running += m.netCF;
    return running;
  });

  // Daily drill-down (only when month is selected)
  let dailyData: { day: string; income: number; expenses: number }[] = [];
  if (monthFilter !== "" && !isNaN(Number(monthFilter))) {
    const mIdx = Number(monthFilter);
    const daysInMonth = new Date(yearNum, mIdx + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${yearNum}-${String(mIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayExpenses = expenses
        .filter((e) => (e.expense_date ?? e.created_at.slice(0, 10)) === dateStr)
        .reduce((s, e) => (e.is_refund || e.category === "refund" ? s - e.amount : s + e.amount), 0);
      const dayIncome = incomeRecords
        .filter((r) => (r.recorded_on ?? r.created_at.slice(0, 10)) === dateStr)
        .reduce((s, r) => s + r.amount, 0);
      if (dayExpenses > 0 || dayIncome > 0) {
        dailyData.push({ day: String(d), income: dayIncome, expenses: dayExpenses });
      }
    }
  }

  return { monthly, visibleMonths, totalIncome, totalExpenses, netCF, savingsRate, cumulative, dailyData };
}

// ─── Main component ────────────────────────────────────────────────────────────

export function CashflowView({
  basePath,
  expenses,
  incomeRecords,
  searchParams,
}: {
  basePath: string;
  expenses: ExpenseRow[];
  incomeRecords: IncomeRow[];
  searchParams: Record<string, string>;
}) {
  const yearParam = searchParams.cfYear ?? String(CURRENT_YEAR);
  const monthFilter = searchParams.cfMonth ?? "";
  const yearNum = Number(yearParam);
  const validYear = isNaN(yearNum) ? CURRENT_YEAR : yearNum;

  const cf = computeCashFlow(expenses, incomeRecords, validYear, monthFilter);

  // Chart data
  const xLabels = cf.monthly.map((m) => m.month);

  const cfLink = (params: Record<string, string>) => {
    const p = new URLSearchParams({ ...searchParams, ...params });
    return `${basePath}?${p.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* ── Year filter ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div />
        <div className="flex items-center gap-3">
          <label className="text-body-sm text-ink-tertiary" htmlFor="cf-year">Year</label>
          <select
            id="cf-year"
            aria-label="Cash flow year"
            defaultValue={yearParam}
            onChange={(e) => {
              // This won't work server-side; handled via link below
            }}
            className="h-9 rounded-lg border border-line bg-bg-base px-2.5 text-body-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500"
          >
            {YEARS.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
          {/* Year links (server-driven) */}
          <div className="flex items-center gap-1 flex-wrap">
            {YEARS.slice(0, 5).map((y) => (
              <Link
                key={y}
                href={cfLink({ cfYear: String(y), tab: "cashflow" })}
                className={`px-2.5 py-1 rounded-lg text-caption font-medium transition-colors ${
                  String(y) === yearParam
                    ? "bg-ember-500 text-white"
                    : "text-ink-tertiary hover:bg-bg-inset hover:text-ink-primary"
                }`}
                aria-label={`View cash flow for ${y}`}
              >
                {y}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          index="01"
          label="TOTAL INCOME"
          value={cf.totalIncome}
          format="moneyCompact"
          tone="positive"
          sub={`${validYear}`}
        />
        <KpiCard
          index="02"
          label="TOTAL EXPENSES"
          value={cf.totalExpenses}
          format="moneyCompact"
          tone="warning"
          sub={`${validYear}`}
        />
        <KpiCard
          index="03"
          label="NET CASH FLOW"
          value={cf.netCF}
          format="moneyCompact"
          tone={cf.netCF >= 0 ? "positive" : "negative"}
        />
        <KpiCard
          index="04"
          label="SAVINGS RATE"
          value={cf.savingsRate}
          format="percent"
          tone={cf.savingsRate >= 0.2 ? "positive" : cf.savingsRate >= 0 ? "neutral" : "negative"}
        />
      </div>

      {/* ── Monthly Income vs Expenses ──────────────────────────────────── */}
      <SurfaceCard tone="paper" padding="md">
        <CardHeader
          eyebrow="MONTHLY"
          title={`Income vs Expenses — ${validYear}`}
          trailing={
            <div className="flex items-center gap-3 text-caption">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" aria-hidden />
                <span className="text-ink-secondary">Income</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-400 inline-block" aria-hidden />
                <span className="text-ink-secondary">Expenses</span>
              </span>
            </div>
          }
        />
        {cf.monthly.some((m) => m.income > 0 || m.expenses > 0) ? (
          <AreaLine
            xLabels={xLabels}
            series={[
              {
                label: "Income",
                values: cf.monthly.map((m) => m.income),
                color: "#3FA88F",
                fill: true,
              },
              {
                label: "Expenses",
                values: cf.monthly.map((m) => m.expenses),
                color: "#E05A5A",
                fill: false,
              },
            ]}
            height={220}
            yFormat={fmtMoneyCompact}
          />
        ) : (
          <div className="py-8 text-center text-caption text-ink-quaternary">No data for {validYear}</div>
        )}
      </SurfaceCard>

      {/* ── Cumulative Surplus ──────────────────────────────────────────── */}
      <SurfaceCard tone="paper" padding="md">
        <CardHeader eyebrow="ACCUMULATED" title="Cumulative Surplus" />
        {cf.cumulative.some((v) => v !== 0) ? (
          <AreaLine
            xLabels={xLabels}
            series={[
              {
                label: "Cumulative surplus",
                values: cf.cumulative,
                color: cf.cumulative[cf.cumulative.length - 1] >= 0 ? "#3FA88F" : "#E05A5A",
                fill: true,
              },
            ]}
            height={180}
            yFormat={fmtMoneyCompact}
          />
        ) : (
          <div className="py-8 text-center text-caption text-ink-quaternary">No data yet</div>
        )}
      </SurfaceCard>

      {/* ── Daily drill-down (only when month selected) ─────────────────── */}
      {cf.dailyData.length > 0 && (
        <SurfaceCard tone="paper" padding="md">
          <CardHeader
            eyebrow="DAILY"
            title={`Daily Breakdown — ${MONTH_LABELS[Number(monthFilter)]} ${validYear}`}
          />
          <BarRow
            rows={cf.dailyData.map((d) => ({
              label: `Day ${d.day}`,
              value: d.expenses - d.income,
              meta: d.income > 0 ? `+${fmtMoneyCompact(d.income)} income` : undefined,
            }))}
            valueLabel={(n) => (n >= 0 ? fmtMoneyCompact(n) : `+${fmtMoneyCompact(-n)}`)}
          />
        </SurfaceCard>
      )}

      {/* ── Monthly breakdown table ─────────────────────────────────────── */}
      <SurfaceCard tone="paper" padding="sm">
        <CardHeader eyebrow="TABLE" title={`Monthly Breakdown — ${validYear}`} />
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm" aria-label="Monthly cash flow breakdown">
            <thead>
              <tr className="border-b border-line bg-bg-inset">
                <th className="py-2.5 px-4 text-left font-medium text-ink-tertiary">Month</th>
                <th className="py-2.5 px-3 text-right font-medium text-ink-tertiary">Income</th>
                <th className="py-2.5 px-3 text-right font-medium text-ink-tertiary">Expenses</th>
                <th className="py-2.5 px-3 text-right font-medium text-ink-tertiary">Net</th>
                <th className="py-2.5 px-4 text-right font-medium text-ink-tertiary">Savings %</th>
              </tr>
            </thead>
            <tbody>
              {cf.monthly.map((m) => {
                const rate = m.income > 0 ? m.netCF / m.income : 0;
                const hasData = m.income > 0 || m.expenses > 0;
                return (
                  <tr
                    key={m.month}
                    className="border-b border-line/40 hover:bg-bg-inset/40 transition-colors"
                  >
                    <td className="py-2 px-4 text-ink-secondary font-medium">
                      <Link
                        href={cfLink({
                          cfYear: yearParam,
                          cfMonth: String(m.monthIdx) === monthFilter ? "" : String(m.monthIdx),
                          tab: "cashflow",
                        })}
                        className={`hover:text-ember-500 transition-colors ${
                          String(m.monthIdx) === monthFilter ? "text-ember-600 font-semibold" : ""
                        }`}
                        aria-label={`Drill into ${m.month} ${validYear}`}
                      >
                        {m.month}
                      </Link>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-emerald-700">
                      {hasData ? fmtMoney(m.income) : "—"}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-ember-600">
                      {hasData ? fmtMoney(m.expenses) : "—"}
                    </td>
                    <td className={`py-2 px-3 text-right tabular-nums font-medium ${
                      m.netCF > 0 ? "text-emerald-700" : m.netCF < 0 ? "text-rose-700" : "text-ink-quaternary"
                    }`}>
                      {hasData ? fmtMoney(m.netCF) : "—"}
                    </td>
                    <td className="py-2 px-4 text-right tabular-nums text-ink-secondary">
                      {hasData && m.income > 0 ? fmtPercent(rate) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-line bg-bg-inset font-semibold">
                <td className="py-2.5 px-4 text-ink-primary">Total</td>
                <td className="py-2.5 px-3 text-right tabular-nums text-emerald-700">
                  {fmtMoney(cf.totalIncome)}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums text-ember-600">
                  {fmtMoney(cf.totalExpenses)}
                </td>
                <td className={`py-2.5 px-3 text-right tabular-nums ${
                  cf.netCF >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}>
                  {fmtMoney(cf.netCF)}
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums text-ink-secondary">
                  {fmtPercent(cf.savingsRate)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
