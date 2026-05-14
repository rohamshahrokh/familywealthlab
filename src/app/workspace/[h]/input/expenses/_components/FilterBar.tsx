/**
 * FilterBar — server-rendered GET form for expense filtering.
 * All state lives in URL search params.
 * The AdvancedFilters section is a client collapsible (checkbox interactions).
 */

import { EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORIES, SOURCE_CODES, SOURCE_CODE_LABELS, FAMILY_MEMBERS, PAYMENT_METHODS } from "../expense-constants";
import { AdvancedFilters } from "./AdvancedFilters";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = [
  { value: "0",  label: "January" },
  { value: "1",  label: "February" },
  { value: "2",  label: "March" },
  { value: "3",  label: "April" },
  { value: "4",  label: "May" },
  { value: "5",  label: "June" },
  { value: "6",  label: "July" },
  { value: "7",  label: "August" },
  { value: "8",  label: "September" },
  { value: "9",  label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];

const selectCls =
  "h-9 rounded-lg border border-line bg-bg-base px-2.5 text-body-sm text-ink-primary " +
  "focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 transition-colors";

const inputCls =
  "h-9 w-full rounded-lg border border-line bg-bg-base px-3 text-body-sm text-ink-primary " +
  "placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-ember-500/40 " +
  "focus:border-ember-500 transition-colors";

export function FilterBar({
  action,
  defaults,
  preserveParams,
}: {
  action: string;
  defaults: {
    search?: string;
    year?: string;
    month?: string;
    category?: string;
    code?: string;
    member?: string;
    payment?: string;
    dateFrom?: string;
    dateTo?: string;
    tab?: string;
    period?: string;
    sort?: string;
    dir?: string;
    page?: string;
  };
  preserveParams?: Record<string, string>;
}) {
  const hasActiveFilters = !!(
    defaults.search || defaults.year || defaults.month ||
    defaults.category || defaults.code || defaults.member ||
    defaults.payment || defaults.dateFrom || defaults.dateTo
  );

  return (
    <form method="get" action={action} className="space-y-3">
      {/* Preserve non-filter params */}
      {preserveParams &&
        Object.entries(preserveParams).map(([k, v]) =>
          v ? <input key={k} type="hidden" name={k} value={v} /> : null,
        )}

      {/* Main filter row */}
      <div className="flex flex-wrap gap-2 items-end">
        {/* Search */}
        <div className="flex-1 min-w-[180px]">
          <input
            name="search"
            defaultValue={defaults.search}
            className={inputCls}
            placeholder="Search label, category…"
            aria-label="Search expenses"
          />
        </div>

        {/* Year */}
        <select
          name="year"
          defaultValue={defaults.year ?? ""}
          className={selectCls}
          aria-label="Filter by year"
        >
          <option value="">All Years</option>
          {YEARS.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>

        {/* Month */}
        <select
          name="month"
          defaultValue={defaults.month ?? ""}
          className={selectCls}
          aria-label="Filter by month"
        >
          <option value="">All Months</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Category */}
        <select
          name="category"
          defaultValue={defaults.category ?? ""}
          className={selectCls}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {EXPENSE_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>

        {/* Submit */}
        <button
          type="submit"
          className="h-9 px-4 rounded-lg bg-ember-500 text-white text-body-sm font-medium hover:bg-ember-600 transition-colors"
          aria-label="Apply filters"
        >
          Filter
        </button>

        {hasActiveFilters && (
          <a
            href={action + (preserveParams?.tab ? `?tab=${preserveParams.tab}` : "")}
            className="h-9 px-3 inline-flex items-center text-body-sm text-ink-tertiary hover:text-ink-primary transition-colors"
            aria-label="Reset all filters"
          >
            Reset
          </a>
        )}
      </div>

      {/* Advanced filters collapsible */}
      <AdvancedFilters
        defaults={defaults}
        sourceCodes={[...SOURCE_CODES]}
        sourceCodeLabels={SOURCE_CODE_LABELS as Record<string, string>}
        familyMembers={[...FAMILY_MEMBERS]}
        paymentMethods={[...PAYMENT_METHODS]}
      />
    </form>
  );
}
