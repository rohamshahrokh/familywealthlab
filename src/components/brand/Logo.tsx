import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  withWordmark?: boolean;
  size?: number;
}

/**
 * Family Wealth Lab mark — refined for a light, premium OS aesthetic.
 * Stacked horizontal lines (an open ledger). Top line is the accent steel-blue.
 * Mark is monochromatic ink on light; reads at 16px.
 */
export function Logo({ className, withWordmark = false, size = 22 }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Family Wealth Lab"
        className="shrink-0"
      >
        <rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#FFFFFF" stroke="rgba(60,60,67,0.18)" />
        <rect x="6" y="6" width="12" height="1.5" rx="0.75" fill="#3E6A95" />
        <rect x="6" y="10" width="12" height="1.5" rx="0.75" fill="#111111" opacity="0.78" />
        <rect x="6" y="14" width="9" height="1.5" rx="0.75" fill="#111111" opacity="0.55" />
        <rect x="6" y="18" width="6" height="1.5" rx="0.75" fill="#111111" opacity="0.32" />
      </svg>
      {withWordmark && (
        <span className="text-body-sm font-medium tracking-tight text-ink-primary">
          Family Wealth Lab
        </span>
      )}
    </span>
  );
}
