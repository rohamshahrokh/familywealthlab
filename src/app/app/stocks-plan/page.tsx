"use client";

// Route: /app/stocks-plan
// Migrated from personal app: fwl-original/client/src/pages/stocks.tsx
// Client-only render: the port page uses recharts + localStorage which trip
// Next.js SSR. Visual output is unchanged; just deferred until after hydration.

import dynamic from "next/dynamic";

const Page = dynamic(() => import("@/components/port/pages/stocks"), {
  ssr: false,
});

export default function StocksPlanRoute() {
  return <Page />;
}
