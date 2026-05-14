import * as React from "react";
import { cn } from "@/lib/utils";

interface Props {
  index: string;
  eyebrow: string;
  title: string;
  body?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}

/**
 * Standard page header for every workspace surface. Renders the [NN·NN]
 * system label, page title, descriptive body, and an optional trailing slot
 * for badges / CTAs. Use this on every new Phase 2 page so the navigation
 * hierarchy stays legible.
 */
export function PageHeader({
  index,
  eyebrow,
  title,
  body,
  trailing,
  className,
}: Props) {
  return (
    <header className={cn("flex items-start justify-between gap-6 flex-wrap", className)}>
      <div className="min-w-0">
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">{index}</span>
          <span>{eyebrow}</span>
        </div>
        <h1 className="text-h3 sm:text-h2 font-semibold text-ink-primary tracking-tight">
          {title}
        </h1>
        {body && (
          <p className="mt-3 text-body text-ink-tertiary max-w-prose text-pretty">
            {body}
          </p>
        )}
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </header>
  );
}
