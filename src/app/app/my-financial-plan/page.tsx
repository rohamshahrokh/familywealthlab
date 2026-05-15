"use client";

// Route: /app/my-financial-plan
// Migrated from personal app: fwl-original/client/src/pages/financial-plan.tsx
// Client-only render: the port page uses recharts + localStorage which trip
// Next.js SSR. Visual output is unchanged; just deferred until after hydration.

import dynamic from "next/dynamic";

const Page = dynamic(() => import("@/components/port/pages/financial-plan"), {
  ssr: false,
});

export default function MyFinancialPlanRoute() {
  return <Page />;
}
