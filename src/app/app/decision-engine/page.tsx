"use client";

// Route: /app/decision-engine
// Migrated from personal app: fwl-original/client/src/pages/decision.tsx
// Client-only render: the port page uses recharts + localStorage which trip
// Next.js SSR. Visual output is unchanged; just deferred until after hydration.

import dynamic from "next/dynamic";

const Page = dynamic(() => import("@/components/port/pages/decision"), {
  ssr: false,
});

export default function DecisionEngineRoute() {
  return <Page />;
}
