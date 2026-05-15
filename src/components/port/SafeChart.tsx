"use client";

import * as React from "react";

/**
 * SafeChart — defensive wrapper for Recharts containers.
 *
 * Problems it solves:
 *   1. Recharts ResponsiveContainer collapses to 0×0 when parent has no
 *      explicit height, causing charts to render as a 1-px sliver.
 *   2. SSR / pre-hydration the container has no width and ResizeObserver
 *      is missing — wrapping content in a hydration guard prevents
 *      "ResizeObserver is not defined" runtime errors.
 *   3. Empty / null data should show a graceful empty state instead of
 *      tripping inside Recharts.
 */
export type SafeChartProps = {
  /** Minimum height in px so the chart always has space to render. */
  minHeight?: number;
  /** Whether there is data to render. When false an empty state is shown. */
  hasData?: boolean;
  /** Optional message displayed when hasData is false. */
  emptyLabel?: string;
  /** Optional extra className. */
  className?: string;
  children: React.ReactNode;
};

export default function SafeChart({
  minHeight = 220,
  hasData = true,
  emptyLabel = "No data yet",
  className,
  children,
}: SafeChartProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={className}
        style={{ minHeight, width: "100%" }}
        aria-busy="true"
      />
    );
  }

  if (!hasData) {
    return (
      <div
        className={
          "flex items-center justify-center text-xs text-muted-foreground " +
          (className ?? "")
        }
        style={{ minHeight, width: "100%" }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className={className} style={{ minHeight, width: "100%" }}>
      {children}
    </div>
  );
}

export { SafeChart };
