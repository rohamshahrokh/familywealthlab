"use client";

// Route: /app/help
// Migrated from personal app: fwl-original/client/src/pages/help.tsx
// Client-only render: the port page uses recharts + localStorage which trip
// Next.js SSR. Visual output is unchanged; just deferred until after hydration.

import dynamic from "next/dynamic";

const Page = dynamic(() => import("@/components/port/pages/help"), {
  ssr: false,
});

export default function HelpRoute() {
  return <Page />;
}
