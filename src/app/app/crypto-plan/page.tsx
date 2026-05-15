"use client";

// Route: /app/crypto-plan
// Migrated from personal app: fwl-original/client/src/pages/crypto.tsx
// Client-only render: the port page uses recharts + localStorage which trip
// Next.js SSR. Visual output is unchanged; just deferred until after hydration.

import dynamic from "next/dynamic";

const Page = dynamic(() => import("@/components/port/pages/crypto"), {
  ssr: false,
});

export default function CryptoPlanRoute() {
  return <Page />;
}
