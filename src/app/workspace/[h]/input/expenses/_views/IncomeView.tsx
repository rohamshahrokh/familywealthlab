/**
 * IncomeView — server component for the Income tab.
 *
 * Layout:
 *   1. KPI strip (4 tiles)
 *   2. Income by Source (donut)
 *   3. Monthly Income trend (area line)
 *   4. Filter card
 *   5. Add Income button / modal
 *   6. Income table (paginated)
 *   7. Footer + pagination
 */

import * as React from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { SurfaceCard, CardHeader, KpiCard } from "@/components/workspace/cards";
import { Donut, AreaLine } from "@/components/workspace/charts";
import {
  fmtMoney,
  fmtMoneyCompact,
  fmtNumber,
} from "@/components/workspace/format";
import { FilterBar } from "../_components/FilterBar";
import { IncomeAddButton } from "../_components/IncomeAddButton";
import { deleteIncome } from "../income-actions";

// ─── Source colour palette ───────────────────────────────────────────────────
const SOURCE_COLORS: Record<string, string> = {
  "Salary":        "#3FA88F",
  "Bonus":         "#C97030",
  "Rental Income": "#5085D9",
  "Dividends":     "#E0A040",
  "Interest":      "#7B6CF6",
  "Tax Refund":    "#5BA850",
  "Side Income":   "#C24A6B",
  "Other":         "#8C8C8C",
};

function srcColor(src: string): string {
  return SOURCE_COLORS[src] ?? "#8C8C8C";
}

// ─── Monthly multipliers ─────────────────────────────────────────────────────
const FREQ_MULT: Record<string, number> = {
  Weekly:      52 / 12,
  Fortnightly: 26 / 12,
  Monthly:     1,
  Quarterly:   4 / 12,
  Annual:      1 / 12,
  "One-off":   0,
};

function toMonthly(amount: number, freq: string): number {
  return amount * (FREQ_MULT[freq] ?? 1);
}

// ─── Types ───────────────────────────────────────────────────────────────────
type IncomeRow = {
  id: string;
  source: string;
  label: string | null;
  amount: number;
  cadence: string;
  frequency: string | null;
  member: string | null;
  recorded_on: string | null;
  created_at: string;
  notes: string | null;
};

const PAGE_SIZE = 20;

// ─── Analytics ───────────────────────────────────────────────────────────────
function computeIncomeAnalytics(allRecords: IncomeRow[], filtered: IncomeRow[]) {
  const now = new Date();

  // Total filtered
  const totalFiltered = filtered.reduce((s, r) => s + r.amount, 0);

  // This month
  const thisMonth = allRecords
    .filter((r) => {
      const d = new Date(r.recorded_on ?? r.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, r) => s + r.amount, 0);

  // Recurring monthly total (deduplicated by member+source+label)
  const streamMap = new Map<string, IncomeRow>();
  const byDateDesc = [...allRecords]
    .filter((r) => r.frequency !== "One-off")
    .sort((a, b) => (b.recorded_on ?? b.created_at).localeCompare(a.recorded_on ?? a.created_at));
  for (const r of byDateDesc) {
    const key = [
      (r.member ?? "").toLowerCase(),
      (r.source ?? "").toLowerCase(),
      (r.label ?? "").toLowerCase(),
    ].join("|");
    if (!streamMap.has(key)) streamMap.set(key, r);
  }
  const recurringMonthly = Array.from(streamMap.values()).reduce(
    (s, r) => s + toMonthly(r.amount, r.frequency ?? "Monthly"),
    0,
  );

  // By source (donut)
  const bySource: Record<string, number> = {};
  filtered.forEach((r) => {
    bySource[r.source] = (bySource[r.source] ?? 0) + r.amount;
  });
  const sourceSlices = Object.entries(bySource)
    .sort((a, b) => b[1] - a[1])
    .map(([src, value]) => ({ label: src, value, color: srcColor(src) }));

  // Monthly trend (area line)
  const trendMap: Record<string, { label: string; amount: number }> = {};
  filtered.forEach((r) => {
    const d = new Date(r.recorded_on ?? r.created_at);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-AU", { month: "short", year: "numeric" });
    if (!trendMap[key]) trendMap[key] = { label, amount: 0 };
    trendMap[key].amount += r.amount;
  });
  const trendEntries = Object.entries(trendMap).sort(([a], [b]) => a.localeCompare(b));
  const xLabels = trendEntries.map(([, v]) => v.label);
  const trendValues = trendEntries.map(([, v]) => v.amount);

  return { totalFiltered, thisMonth, recurringMonthly, sourceSlices, xLabels, trendValues };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function IncomeView({
  householdId,
  basePath,
  allRecords,
  searchParams,
}: {
  householdId: string;
  basePath: string;
  allRecords: IncomeRow[];
  searchParams: Record<string, string>;
}) {
  const search = searchParams.search ?? "";
  const year   = searchParams.year   ?? "";
  const month  = searchParams.month  ?? "";
  const source = searchParams.source ?? "";
  const member = searchParams.member ?? "";
  const sort   = searchParams.sort   ?? "date";
  const dir    = searchParams.dir    ?? "desc";
  const pageNum = Math.max(1, Number(searchParams.page ?? "1"));

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = allRecords.filter((r) => {
    const dateStr = r.recorded_on ?? r.created_at.slice(0, 10);
    const d = new Date(dateStr);
    if (year && d.getFullYear() !== Number(year)) return false;
    if (month !== "" && !isNaN(Number(month)) && d.getMonth() !== Number(month)) return false;
    if (source && r.source !== source) return false;
    if (member && r.member !== member) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !(r.label ?? "").toLowerCase().includes(q) &&
        !(r.source ?? "").toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sorted = [...filtered].sort((a, b) => {
    let av: string | number = "";
    let bv: string | number = "";
    if (sort === "amount") { av = a.amount; bv = b.amount; }
    else if (sort === "source") { av = a.source; bv = b.source; }
    else {
      av = a.recorded_on ?? a.created_at;
      bv = b.recorded_on ?? b.created_at;
    }
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE);

  const a = computeIncomeAnalytics(allRecords, filtered);

  const sortLink = (field: string) => {
    const newDir = sort === field && dir === "desc" ? "asc" : "desc";
    const params = new URLSearchParams({ ...searchParams, sort: field, dir: newDir, page: "1" });
    return `${basePath}?${params.toString()}`;
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sort !== field) return <span className="text-ink-quaternary ml-1">↕</span>;
    return dir === "asc" ? (
      <ChevronUp className="inline h-3.5 w-3.5 ml-1 text-emerald-600" />
    ) : (
      <ChevronDown className="inline h-3.5 w-3.5 ml-1 text-emerald-600" />
    );
  };

  const pageLink = (p: number) => {
    const params = new URLSearchParams({ ...searchParams, page: String(p) });
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* ── KPI strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          index="01"
          label="TOTAL INCOME"
          value={a.totalFiltered}
          format="moneyCompact"
          tone="positive"
          sub="Filtered period"
        />
        <KpiCard
          index="02"
          label="THIS MONTH"
          value={a.thisMonth}
          format="moneyCompact"
          tone="positive"
        />
        <KpiCard
          index="03"
          label="RECURRING MONTHLY"
          value={a.recurringMonthly}
          format="moneyCompact"
          tone="neutral"
          sub="Active streams"
        />
        <KpiCard
          index="04"
          label="RECORDS"
          value={filtered.length}
          format="raw"
          tone="neutral"
        />
      </div>

      {/* ── Charts row ────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Income by Source */}
        <SurfaceCard tone="paper" padding="md">
          <CardHeader eyebrow="BREAKDOWN" title="Income by Source" />
          {a.sourceSlices.length > 0 ? (
            <Donut
              slices={a.sourceSlices}
              size={200}
              thickness={28}
              centerLabel={fmtMoneyCompact(a.totalFiltered)}
              centerSub="total"
            />
          ) : (
            <div className="py-8 text-center text-caption text-ink-quaternary">No income records yet</div>
          )}
        </SurfaceCard>

        {/* Monthly trend */}
        <SurfaceCard tone="paper" padding="md">
          <CardHeader eyebrow="TREND" title="Monthly Income" />
          {a.xLabels.length > 1 ? (
            <AreaLine
              xLabels={a.xLabels}
              series={[
                {
                  label: "Income",
                  values: a.trendValues,
                  color: "#3FA88F",
                  fill: true,
                },
              ]}
              height={200}
            />
          ) : (
            <div className="py-8 text-center text-caption text-ink-quaternary">Need 2+ months of data</div>
          )}
        </SurfaceCard>
      </div>

      {/* ── Filter card ────────────────────────────────────────────────────── */}
      <SurfaceCard tone="inset" padding="md">
        <CardHeader
          eyebrow="FILTERS"
          title="Filter Income"
          trailing={
            <IncomeAddButton householdId={householdId} />
          }
        />
        <FilterBar
          action={basePath}
          defaults={{ search, year, month, sort, dir }}
          preserveParams={{ tab: "income" }}
        />
      </SurfaceCard>

      {/* ── Income table ──────────────────────────────────────────────────── */}
      <SurfaceCard tone="paper" padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm" aria-label="Income records">
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
                <th className="py-2.5 px-3 text-left font-medium text-ink-tertiary">
                  <Link href={sortLink("source")} className="hover:text-ink-primary inline-flex items-center">
                    Source <SortIcon field="source" />
                  </Link>
                </th>
                <th className="py-2.5 px-3 text-left font-medium text-ink-tertiary">Label</th>
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
                    No income records match the current filters.
                  </td>
                </tr>
              ) : (
                paginated.map((r) => {
                  const dateStr = r.recorded_on ?? r.created_at.slice(0, 10);
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-line/40 hover:bg-bg-inset/40 transition-colors"
                    >
                      <td className="py-2 pl-4 pr-2" />
                      <td className="py-2 px-3 text-ink-secondary tabular-nums whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums font-medium text-emerald-700 whitespace-nowrap">
                        {fmtMoney(r.amount)}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-caption font-medium"
                          style={{
                            background: srcColor(r.source) + "20",
                            color: srcColor(r.source),
                          }}
                        >
                          {r.source}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-ink-primary truncate max-w-[180px]">
                        {r.label ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-ink-tertiary text-caption">
                        {r.member ?? "—"}
                      </td>
                      <td className="py-2 pl-3 pr-2 text-right">
                        <form action={deleteIncome}>
                          <input type="hidden" name="household_id" value={householdId} />
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            type="submit"
                            aria-label={`Delete income record ${r.label ?? r.source}`}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-full text-ink-quaternary hover:text-rose-700 hover:bg-rose-50 focus-ring"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-line bg-bg-inset">
                <td colSpan={7} className="py-2.5 px-4 text-caption text-ink-tertiary">
                  <span className="tabular-nums font-medium text-ink-secondary">
                    {fmtNumber(filtered.length)} records
                  </span>
                  &nbsp;&nbsp;
                  <span className="tabular-nums text-emerald-700 font-medium">
                    {fmtMoneyCompact(a.totalFiltered)}
                  </span>
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
    </div>
  );
}
