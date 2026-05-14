/**
 * Properties page — server component orchestrator.
 *
 * Three tabs (URL-driven via ?tab=):
 *   portfolio   (default) — KPIs + IP Capacity Calculator + per-property cards
 *   buy-vs-wait           — buy now vs wait N months scenario
 *   impact                — hypothetical IP portfolio impact
 *
 * Add/edit driven by ?add=1 / ?edit=<id>.
 * All state lives in URL — no client-side hydration required.
 */

import * as React from "react";
import Link from "next/link";
import { requireOnboarded } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TabBar } from "./_components/TabBar";
import { PortfolioView } from "./_views/PortfolioView";
import { BuyVsWaitView } from "./_views/BuyVsWaitView";
import { ImpactView } from "./_views/ImpactView";
import { Button } from "@/components/ui/Button";
import type { PropertyRow } from "./PropertyForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Property Portfolio — Family Wealth Lab",
};

// ─── Full DB row shape (post depth migration) ─────────────────────────────────
type DbPropertyRow = PropertyRow & {
  household_id: string;
  created_at?: string;
};

interface PageProps {
  params: { h: string };
  searchParams: Record<string, string | string[]>;
}

export default async function PropertiesPage({ params, searchParams: rawSp }: PageProps) {
  await requireOnboarded(`/workspace/${params.h}/wealth/properties`);

  const householdId = params.h;

  // Flatten searchParams (Next.js may give string | string[])
  const sp: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawSp)) {
    sp[k] = Array.isArray(v) ? v[0] : v;
  }

  const tab      = sp.tab ?? "portfolio";
  const basePath = `/workspace/${householdId}/wealth/properties`;

  // ── Fetch all properties for the household ──────────────────────────────
  const supabase = createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .schema("ledger")
    .from("properties")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[PropertiesPage] fetch error", error);
  }

  const properties = (rows ?? []) as DbPropertyRow[];

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h5 sm:text-h4 font-semibold text-ink-primary tracking-tight">
              Property Portfolio
            </h1>
            <p className="mt-1 text-body-sm text-ink-tertiary">
              Track properties, model purchase capacity, project equity &amp; cashflow
            </p>
          </div>
          <Link href={`${basePath}?add=1`}>
            <Button variant="primary" size="sm">+ Add Property</Button>
          </Link>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <TabBar activeTab={tab} basePath={basePath} />

      {/* ── Active tab view ──────────────────────────────────────────────── */}
      {tab === "buy-vs-wait" ? (
        <BuyVsWaitView
          basePath={basePath}
          searchParams={sp}
        />
      ) : tab === "impact" ? (
        <ImpactView
          basePath={basePath}
          properties={properties}
          searchParams={sp}
        />
      ) : (
        /* Default: portfolio */
        <PortfolioView
          householdId={householdId}
          basePath={basePath}
          properties={properties}
          searchParams={sp}
        />
      )}
    </div>
  );
}
