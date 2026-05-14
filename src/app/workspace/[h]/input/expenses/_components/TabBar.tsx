/**
 * TabBar — server-rendered link tabs for the Income & Expense Tracker.
 * Active tab determined from URL `?tab=` param.
 */

import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = { id: string; label: string };

const TABS: Tab[] = [
  { id: "expenses", label: "Expenses" },
  { id: "income",   label: "Income" },
  { id: "cashflow", label: "Cash Flow" },
];

export function TabBar({
  activeTab,
  basePath,
}: {
  activeTab: string;
  basePath: string;
}) {
  return (
    <div
      className="flex items-center gap-1 border-b border-line"
      role="tablist"
      aria-label="Income & Expense Tracker tabs"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={`${basePath}?tab=${tab.id}`}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "px-4 py-2.5 text-body-sm font-medium transition-colors duration-150 whitespace-nowrap",
              isActive
                ? "border-b-2 border-ember-500 text-ink-primary -mb-px"
                : "text-ink-tertiary hover:text-ink-secondary",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
