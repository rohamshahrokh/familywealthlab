/**
 * PortfolioView — server component.
 * Renders: Portfolio KPI tiles → IP Capacity Calculator → per-property cards.
 * When ?add=1 is present, AddPropertyModal renders over the top.
 * When ?edit=<id> is present, EditPropertyForm replaces the card list.
 */

import * as React from "react";
import Link from "next/link";
import { SurfaceCard, KpiCard, EmptyState } from "@/components/workspace/cards";
import { fmtMoney, fmtPercent, fmtMoneyCompact } from "@/components/workspace/format";
import { deriveCalcs } from "@/lib/finance/property";
import { Button } from "@/components/ui/cta-button";
import { PropertyCard } from "../_components/PropertyCard";
import { IpCapacityCalculator } from "../_components/IpCapacityCalculator";
import { AddPropertyModal } from "../_components/AddPropertyModal";
import { EditPropertyForm } from "../_components/EditPropertyForm";
import type { PropertyRow } from "../PropertyForm";

interface Props {
  householdId: string;
  basePath: string;
  properties: PropertyRow[];
  searchParams: Record<string, string>;
}

export async function PortfolioView({
  householdId,
  basePath,
  properties,
  searchParams,
}: Props) {
  const addMode  = searchParams.add === "1";
  const editId   = searchParams.edit ?? null;
  const editProp = editId ? properties.find((p) => p.id === editId) ?? null : null;

  // ── Portfolio KPI aggregations ────────────────────────────────────────────
  const totalValue   = properties.reduce((s, p) => s + (p.current_value ?? 0), 0);
  const totalLoans   = properties.reduce((s, p) => s + (p.loan_amount ?? 0), 0);
  const totalEquity  = totalValue - totalLoans;
  const portfolioLvr = totalValue > 0 ? totalLoans / totalValue : 0;

  // Monthly cashflow: investment properties only
  const ipCashflow = properties
    .filter((p) => p.type === "investment")
    .reduce((s, p) => {
      const calcs = deriveCalcs(p);
      return s + calcs.monthlyCashFlow;
    }, 0);

  // Tone logic
  const lvrPct        = portfolioLvr * 100;
  const lvrTone       = lvrPct > 95 ? "negative" : lvrPct > 80 ? "warning" : "neutral";
  const cfTone        = ipCashflow >= 0 ? "positive" : "negative";

  return (
    <div className="space-y-8">
      {/* ── Section 1: Portfolio KPI summary ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[01]</span>
          <span>Portfolio Summary · {properties.length} {properties.length === 1 ? "property" : "properties"}</span>
        </div>

        {properties.length === 0 ? (
          <EmptyState
            index="·"
            eyebrow="No properties yet"
            title="Add your home or first investment property"
            body="Start with your PPOR. Add investment properties and planned purchases — the engine reads this ledger for equity, serviceability, and rental income."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <KpiCard
              index="[01]"
              label="Portfolio Value"
              value={totalValue}
              format="moneyCompact"
              tone="neutral"
              sub={`${properties.length} properties`}
            />
            <KpiCard
              index="[02]"
              label="Total Loans"
              value={totalLoans}
              format="moneyCompact"
              tone="warning"
            />
            <KpiCard
              index="[03]"
              label="Total Equity"
              value={totalEquity}
              format="moneyCompact"
              tone="positive"
              sub={totalValue > 0 ? `${fmtPercent(totalEquity / totalValue)} of portfolio` : undefined}
            />
            <KpiCard
              index="[04]"
              label="Portfolio LVR"
              value={portfolioLvr}
              format="percent"
              tone={lvrTone}
              sub={lvrPct > 80 ? (lvrPct > 95 ? "High risk" : "Caution") : "Healthy"}
            />
            <KpiCard
              index="[05]"
              label="Monthly CF · IPs"
              value={ipCashflow}
              format="money"
              tone={cfTone}
              sub={ipCashflow >= 0 ? "Positive" : "Negative"}
            />
          </div>
        )}
      </section>

      {/* ── Section 2: IP Capacity Calculator ────────────────────────────── */}
      <section className="space-y-4">
        <SurfaceCard>
          <IpCapacityCalculator
            householdId={householdId}
            basePath={basePath}
            searchParams={searchParams}
          />
        </SurfaceCard>
      </section>

      {/* ── Section 3: Per-property cards or edit form ────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="syslabel">
            <span className="syslabel-bracket">[02]</span>
            <span>Property Ledger</span>
          </div>
          <Link href={`${basePath}?add=1`}>
            <Button variant="primary" size="sm">+ Add Property</Button>
          </Link>
        </div>

        {editProp ? (
          <EditPropertyForm
            householdId={householdId}
            basePath={basePath}
            property={editProp}
          />
        ) : properties.length === 0 ? (
          <EmptyState
            index="·"
            eyebrow="No properties"
            title="Your portfolio is empty"
            body="Click + Add Property above to start tracking your PPOR or investment properties."
          />
        ) : (
          <div className="grid gap-4">
            {properties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                householdId={householdId}
                basePath={basePath}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Add Property modal (zero-JS dialog) ──────────────────────────── */}
      {addMode && (
        <AddPropertyModal householdId={householdId} basePath={basePath} />
      )}
    </div>
  );
}
