"use client";

// Route: /app/forecast-engine
// Migrated from personal app: fwl-original/client/src/pages/ai-forecast-engine.tsx
// Client-only render: the port page uses Recharts, ResizeObserver, and
// localStorage which trip Next.js SSR. Visual output is unchanged — just
// deferred until after hydration.

import dynamic from "next/dynamic";

const Page = dynamic(
  () => import("@/components/port/pages/ai-forecast-engine"),
  { ssr: false },
);

export default function ForecastEngineRoute() {
  return <Page />;
}
