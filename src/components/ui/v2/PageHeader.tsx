"use client";

import * as React from "react";

/**
 * FWL Hybrid V2 — PageHeader
 * The opening voice of every screen: an optional eyebrow, a serif h1, and
 * a single calm sub-line. Right slot for filter chips / period selector.
 */
export interface V2PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function V2PageHeader({
  eyebrow,
  title,
  sub,
  right,
  className,
}: V2PageHeaderProps) {
  return (
    <header
      className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-5 mb-6 ${className ?? ""}`}
    >
      <div className="min-w-0 flex flex-col gap-1.5">
        {eyebrow ? <div className="v2-eyebrow">{eyebrow}</div> : null}
        <h1
          className="text-[22px] sm:text-[28px] font-medium tracking-tight text-v2-text-strong font-serif"
          style={{ letterSpacing: "-0.014em", lineHeight: 1.15 }}
        >
          {title}
        </h1>
        {sub ? (
          <p className="text-[13px] text-v2-text-muted leading-relaxed max-w-[60ch]">
            {sub}
          </p>
        ) : null}
      </div>
      {right ? (
        <div className="flex items-center gap-2 shrink-0">{right}</div>
      ) : null}
    </header>
  );
}
