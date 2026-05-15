"use client";

// Route: /app/cgt-simulator
// Migrated from personal app: fwl-original/client/src/pages/cgt-simulator.tsx
// See MIGRATION_ROUTE_MAP.md for the full route map.

import dynamic from "next/dynamic";

// Dynamic import (ssr:false) keeps Recharts/heavy client-only deps out of
// the SSR pass and the initial route chunk. Mirrors the pattern already
// used on /app/snapshot, /app/decision-engine, /app/forecast-engine.
const Page = dynamic(() => import("@/components/port/pages/cgt-simulator"), {
  ssr: false,
});

export default function CgtSimulatorRoute() {
  return <Page />;
}
