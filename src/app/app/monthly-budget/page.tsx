"use client";

// Route: /app/monthly-budget
// Migrated from personal app: fwl-original/client/src/pages/budget.tsx
// See MIGRATION_ROUTE_MAP.md for the full route map.

import dynamic from "next/dynamic";

// Dynamic import (ssr:false) keeps Recharts/heavy client-only deps out of
// the SSR pass and the initial route chunk. Mirrors the pattern already
// used on /app/snapshot, /app/decision-engine, /app/forecast-engine.
const Page = dynamic(() => import("@/components/port/pages/budget"), {
  ssr: false,
});

export default function MonthlyBudgetRoute() {
  return <Page />;
}
