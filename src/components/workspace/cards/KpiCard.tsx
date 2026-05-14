import * as React from "react";
import { cn } from "@/lib/utils";
import { fmtMoney, fmtMoneyCompact, fmtPercent, fmtDelta } from "../format";

export type KpiTone = "neutral" | "positive" | "negative" | "warning";

export interface KpiCardProps {
  /** "[01]" style monospace index — optional. */
  index?: string;
  /** UPPERCASE label e.g. "NET WORTH". */
  label: string;
  /** Headline figure. Pass numbers — formatting is locked here. */
  value: number | null | undefined;
  format?: "money" | "moneyCompact" | "percent" | "raw";
  /** Sub-text under the value (e.g. "Settled IPs + DCA"). */
  sub?: React.ReactNode;
  /** Period delta numeric (renders as "+$2,340" with tone). */
  delta?: number | null;
  deltaSuffix?: string;        // e.g. " · 30d"
  tone?: KpiTone;
  className?: string;
  /** Optional href turns the whole tile into a workflow entry. */
  href?: string;
}

const TONE_COLOR: Record<KpiTone, string> = {
  neutral:  "text-ink-primary",
  positive: "text-emerald-700",
  negative: "text-rose-700",
  warning:  "text-ember-600",
};

function formatValue(v: number | null | undefined, fmt: KpiCardProps["format"]): string {
  if (v == null || !Number.isFinite(v)) return "—";
  switch (fmt) {
    case "moneyCompact": return fmtMoneyCompact(v);
    case "percent":      return fmtPercent(v);
    case "raw":          return String(v);
    case "money":
    default:             return fmtMoney(v);
  }
}

/**
 * KpiCard — the atomic dashboard tile. The same component renders on the
 * Overview command bar, inside scenario result cards, and on per-asset
 * surfaces. Numbers are always tabular and always formatted through the
 * locked formatters in `../format.ts`.
 */
export function KpiCard({
  index,
  label,
  value,
  format = "money",
  sub,
  delta,
  deltaSuffix,
  tone = "neutral",
  className,
  href,
}: KpiCardProps) {
  const Body = (
    <>
      <div className="syslabel mb-3">
        {index && <span className="syslabel-bracket">{index}</span>}
        <span>{label}</span>
      </div>
      <div className={cn("num text-h5 sm:text-h4 font-semibold tracking-tight leading-none", TONE_COLOR[tone])}>
        {formatValue(value, format)}
      </div>
      {(sub || delta != null) && (
        <div className="mt-3 flex items-baseline justify-between gap-3 text-caption text-ink-tertiary">
          <span className="truncate">{sub}</span>
          {delta != null && Number.isFinite(delta) && (
            <span
              className={cn(
                "num font-medium whitespace-nowrap",
                delta > 0 ? "text-emerald-700" : delta < 0 ? "text-rose-700" : "text-ink-quaternary"
              )}
            >
              {fmtDelta(delta)}
              {deltaSuffix && <span className="text-ink-quaternary">{deltaSuffix}</span>}
            </span>
          )}
        </div>
      )}
    </>
  );

  const shell = cn(
    "card-surface p-5 sm:p-6 flex flex-col",
    "transition-[box-shadow,transform] duration-200 ease-out",
    href && "hover:shadow-lg hover:-translate-y-[1px] focus-ring",
    className
  );

  if (href) {
    return (
      <a href={href} className={shell}>
        {Body}
      </a>
    );
  }
  return <div className={shell}>{Body}</div>;
}
