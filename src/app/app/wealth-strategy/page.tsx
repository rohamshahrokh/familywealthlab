"use client";

// Route: /app/wealth-strategy
// Migrated from personal app: fwl-original/client/src/pages/wealth-strategy.tsx
// Client-only render: the port page uses recharts + localStorage which trip
// Next.js SSR. Visual output is unchanged; just deferred until after hydration.

import dynamic from "next/dynamic";

const Page = dynamic(() => import("@/components/port/pages/wealth-strategy"), {
  ssr: false,
});

export default function WealthStrategyRoute() {
  return <Page />;
}
