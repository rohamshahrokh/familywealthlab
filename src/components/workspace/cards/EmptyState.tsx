import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  index?: string;
  eyebrow: string;
  title: string;
  body: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

/**
 * EmptyState — calm, on-brand placeholder shown when a household has no rows
 * for a given ledger surface. Always offers a workflow next step.
 */
export function EmptyState({ index, eyebrow, title, body, ctaLabel, ctaHref, className }: EmptyStateProps) {
  return (
    <div className={cn("card-surface p-8 sm:p-10 text-center", className)}>
      <div className="syslabel mb-3 justify-center">
        {index && <span className="syslabel-bracket">{index}</span>}
        <span>{eyebrow}</span>
      </div>
      <h3 className="text-h6 font-semibold text-ink-primary tracking-tight mb-2">{title}</h3>
      <p className="text-body-sm text-ink-tertiary max-w-prose mx-auto">{body}</p>
      {ctaLabel && ctaHref && (
        <div className="mt-6">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-5 h-10 text-body-sm font-medium hover:bg-graphite-800 transition-colors focus-ring"
          >
            {ctaLabel}
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
