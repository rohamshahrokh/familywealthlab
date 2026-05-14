"use client";

/**
 * AdvancedFilters — client collapsible for the "▿ Advanced" section.
 * Uses controlled state since the toggle needs JS interactivity.
 * Renders inside the FilterBar <form> so all values submit together.
 */

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const inputCls =
  "h-9 rounded-lg border border-line bg-bg-base px-2.5 text-body-sm text-ink-primary " +
  "focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 transition-colors";

export function AdvancedFilters({
  defaults,
  sourceCodes,
  sourceCodeLabels,
  familyMembers,
  paymentMethods,
}: {
  defaults: {
    code?: string;
    member?: string;
    payment?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  sourceCodes: string[];
  sourceCodeLabels: Record<string, string>;
  familyMembers: readonly string[];
  paymentMethods: readonly string[];
}) {
  const [open, setOpen] = React.useState(
    !!(defaults.code || defaults.member || defaults.payment || defaults.dateFrom || defaults.dateTo),
  );

  return (
    <div className="border-t border-line/50 pt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-body-sm text-ink-tertiary hover:text-ink-secondary transition-colors py-1"
        aria-expanded={open}
        aria-controls="advanced-filters-panel"
      >
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
        />
        Advanced filters
      </button>

      {open && (
        <div
          id="advanced-filters-panel"
          className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {/* Source Code */}
          <select
            name="code"
            defaultValue={defaults.code ?? ""}
            className={inputCls + " w-full"}
            aria-label="Filter by source code"
          >
            <option value="">All Codes</option>
            {sourceCodes.map((c) => (
              <option key={c} value={c}>
                {sourceCodeLabels[c] ?? c}
              </option>
            ))}
          </select>

          {/* Member */}
          <select
            name="member"
            defaultValue={defaults.member ?? ""}
            className={inputCls + " w-full"}
            aria-label="Filter by family member"
          >
            <option value="">All Members</option>
            {familyMembers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Payment */}
          <select
            name="payment"
            defaultValue={defaults.payment ?? ""}
            className={inputCls + " w-full"}
            aria-label="Filter by payment method"
          >
            <option value="">All Payment Methods</option>
            {paymentMethods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Date from */}
          <label className="flex flex-col gap-1">
            <span className="text-caption text-ink-quaternary">From</span>
            <input
              type="date"
              name="dateFrom"
              defaultValue={defaults.dateFrom ?? ""}
              className={inputCls + " w-full"}
              aria-label="Filter from date"
            />
          </label>

          {/* Date to */}
          <label className="flex flex-col gap-1">
            <span className="text-caption text-ink-quaternary">To</span>
            <input
              type="date"
              name="dateTo"
              defaultValue={defaults.dateTo ?? ""}
              className={inputCls + " w-full"}
              aria-label="Filter to date"
            />
          </label>
        </div>
      )}
    </div>
  );
}
