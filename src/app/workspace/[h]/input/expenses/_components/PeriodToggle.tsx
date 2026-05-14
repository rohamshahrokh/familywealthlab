/**
 * PeriodToggle — link pills: Monthly / Annual / Daily.
 * State is URL-driven via `?period=` so it's zero-JS and server-rendered.
 */

import Link from "next/link";
import { cn } from "@/lib/utils";

const PERIODS = [
  { id: "monthly", label: "Monthly" },
  { id: "annual",  label: "Annual" },
  { id: "daily",   label: "Daily" },
] as const;

export type Period = typeof PERIODS[number]["id"];

export function PeriodToggle({
  activePeriod,
  searchParams,
  basePath,
}: {
  activePeriod: Period;
  searchParams: Record<string, string>;
  basePath: string;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Time period selector">
      {PERIODS.map(({ id, label }) => {
        const params = new URLSearchParams({
          ...searchParams,
          period: id,
        });
        const isActive = activePeriod === id;
        return (
          <Link
            key={id}
            href={`${basePath}?${params.toString()}`}
            aria-pressed={isActive}
            className={cn(
              "px-3.5 py-1.5 text-body-sm font-medium rounded-full transition-colors duration-150",
              isActive
                ? "bg-ember-500 text-white shadow-sm"
                : "bg-bg-inset text-ink-secondary hover:text-ink-primary hover:bg-bg-inset/80",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
