"use client";

import * as React from "react";

/**
 * FWL Hybrid V2 — Section
 * Vertical rhythm container for grouping related cards under a single
 * eyebrow + (optional) trailing meta. Use this to wrap, e.g., the
 * "FORECAST · 10Y BASE CASE" group on the snapshot.
 */
export interface V2SectionProps {
  eyebrow?: string;
  title?: React.ReactNode;
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function V2Section({
  eyebrow,
  title,
  meta,
  children,
  className,
}: V2SectionProps) {
  return (
    <section className={`flex flex-col gap-4 ${className ?? ""}`}>
      {eyebrow || title || meta ? (
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex flex-col gap-1">
            {eyebrow ? <div className="v2-eyebrow">{eyebrow}</div> : null}
            {title ? (
              <h2
                className="text-[17px] font-medium tracking-tight text-v2-text-strong"
                style={{ letterSpacing: "-0.012em" }}
              >
                {title}
              </h2>
            ) : null}
          </div>
          {meta ? (
            <div className="text-[11px] text-v2-text-muted tabular-nums">
              {meta}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
