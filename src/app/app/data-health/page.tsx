"use client";

// Route: /app/data-health
// Migrated from personal app: fwl-original/client/src/pages/data-health.tsx
// Client-only render: the port page uses recharts + localStorage which trip
// Next.js SSR. Visual output is unchanged; just deferred until after hydration.

import dynamic from "next/dynamic";

const Page = dynamic(() => import("@/components/port/pages/data-health"), {
  ssr: false,
});

export default function DataHealthRoute() {
  return <Page />;
}
