"use client";

// Route: /app/snapshot
// Migrated from personal app: fwl-original/client/src/pages/dashboard.tsx
// The port page reads localStorage/window during render, so we render it
// only on the client to avoid Next.js SSR runtime errors. The visual output
// is unchanged — just deferred until after hydration.

import dynamic from "next/dynamic";

const Page = dynamic(() => import("@/components/port/pages/dashboard"), {
  ssr: false,
});

export default function SnapshotRoute() {
  return <Page />;
}
