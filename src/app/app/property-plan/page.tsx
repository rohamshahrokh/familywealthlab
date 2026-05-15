"use client";

// Route: /app/property-plan
// Migrated from personal app: fwl-original/client/src/pages/property.tsx
// Client-only render: the port page uses recharts + localStorage which trip
// Next.js SSR. Visual output is unchanged; just deferred until after hydration.

import dynamic from "next/dynamic";

const Page = dynamic(() => import("@/components/port/pages/property"), {
  ssr: false,
});

export default function PropertyPlanRoute() {
  return <Page />;
}
