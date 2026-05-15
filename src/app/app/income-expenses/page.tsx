"use client";

// Route: /app/income-expenses
// Migrated from personal app: fwl-original/client/src/pages/expenses.tsx
// Client-only render: the port page uses recharts + localStorage which trip
// Next.js SSR. Visual output is unchanged; just deferred until after hydration.

import dynamic from "next/dynamic";

const Page = dynamic(() => import("@/components/port/pages/expenses"), {
  ssr: false,
});

export default function IncomeExpensesRoute() {
  return <Page />;
}
