import * as React from "react";
import { cn } from "@/lib/utils";

export type RecommendationSeverity = "advisory" | "watch" | "act" | "critical";

export interface RecommendationCardProps {
  index?: string;
  title: string;
  body: React.ReactNode;
  severity?: RecommendationSeverity;
  /** Short factual reason — e.g. "Liquidity floor breached in month 14". */
  reason?: string;
  /** Optional small chip tags shown right of the title. */
  tags?: string[];
  /** Optional action button. */
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

const SEVERITY: Record<RecommendationSeverity, { ring: string; chip: string; dot: string }> = {
  advisory: {
    ring: "border-line",
    chip: "bg-bg-inset text-ink-tertiary border-line",
    dot:  "bg-ink-quinary",
  },
  watch: {
    ring: "border-ember-200",
    chip: "bg-ember-50/60 text-ember-700 border-ember-200",
    dot:  "bg-ember-500",
  },
  act: {
    ring: "border-accent-300",
    chip: "bg-accent-50 text-accent-700 border-accent-200",
    dot:  "bg-accent-500",
  },
  critical: {
    ring: "border-rose-300",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
    dot:  "bg-rose-600",
  },
};

const SEVERITY_LABEL: Record<RecommendationSeverity, string> = {
  advisory: "ADVISORY",
  watch:    "WATCH",
  act:      "ACTION",
  critical: "CRITICAL",
};

/**
 * RecommendationCard — single deterministic recommendation surfaced by the
 * Decision Engine. ONE component renders every recommendation across the
 * platform, with severity gating colour. Never displays a number that doesn't
 * trace back through the engine.
 */
export function RecommendationCard({
  index,
  title,
  body,
  severity = "advisory",
  reason,
  tags,
  actionLabel,
  actionHref,
  className,
}: RecommendationCardProps) {
  const s = SEVERITY[severity];
  return (
    <article className={cn("card-surface p-5 sm:p-6 border", s.ring, className)}>
      <header className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="syslabel mb-1.5">
            {index && <span className="syslabel-bracket">{index}</span>}
            <span className="inline-flex items-center gap-1.5">
              <span className={cn("inline-block h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
              {SEVERITY_LABEL[severity]}
            </span>
          </div>
          <h4 className="text-body-lg sm:text-h6 font-semibold text-ink-primary tracking-tight">
            {title}
          </h4>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-end max-w-[40%]">
            {tags.map((t) => (
              <span
                key={t}
                className={cn("inline-flex items-center rounded-full px-2.5 h-6 text-caption border", s.chip)}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="text-body-sm text-ink-tertiary leading-relaxed text-pretty">{body}</div>

      {reason && (
        <p className="mt-3 text-caption text-ink-quaternary border-l-2 border-line pl-3 italic">
          {reason}
        </p>
      )}

      {actionLabel && actionHref && (
        <div className="mt-4">
          <a
            href={actionHref}
            className="inline-flex items-center gap-2 text-body-sm font-medium text-ink-primary hover:text-ember-600 focus-ring rounded-md"
          >
            {actionLabel}
            <span aria-hidden>→</span>
          </a>
        </div>
      )}
    </article>
  );
}
