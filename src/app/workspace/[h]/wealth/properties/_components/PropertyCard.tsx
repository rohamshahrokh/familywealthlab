/**
 * PropertyCard — server-rendered per-property collapsible card.
 * Uses <details> for zero-JS collapse. Default open on Key Metrics.
 * For investment properties: shows rental + neg-gearing tax benefit.
 * For PPOR/owner-occupied: hides rental section.
 */

import * as React from "react";
import Link from "next/link";
import { Home, Building2 } from "lucide-react";
import { SurfaceCard } from "@/components/workspace/cards";
import { MetricRow, KpiCard } from "@/components/workspace/cards";
import { fmtMoney, fmtMoneyCompact, fmtPercent } from "@/components/workspace/format";
import { deriveCalcs } from "@/lib/finance/property";
import { DeletePropertyButton } from "../DeletePropertyButton";
import { ProjectionTable } from "./ProjectionTable";
import type { PropertyRow } from "../PropertyForm";

// ─── Tone helpers ─────────────────────────────────────────────────────────────
function lvrTone(lvr: number): "neutral" | "warning" | "negative" {
  if (lvr > 95) return "negative";
  if (lvr > 80) return "warning";
  return "neutral";
}

// ─── Type pill ────────────────────────────────────────────────────────────────
function TypePill({ type }: { type: string }) {
  const isPpor = type === "ppor" || type === "owner_occupied";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-caption font-medium ${
        isPpor
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-ember-50 text-ember-700 border border-ember-200"
      }`}
    >
      {isPpor ? <Home className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
      {isPpor ? "PPOR" : "Investment"}
    </span>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────
function Section({
  title,
  index,
  defaultOpen = false,
  children,
}: {
  title: string;
  index: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-t border-line/60 first:border-t-0">
      <summary className="flex items-center justify-between gap-3 py-3 px-1 cursor-pointer list-none select-none hover:bg-bg-inset/40 rounded-lg -mx-1 px-2 transition-colors">
        <div className="syslabel">
          <span className="syslabel-bracket text-ink-quaternary">{index}</span>
          <span className="text-ink-secondary">{title}</span>
        </div>
        <svg
          className="h-4 w-4 text-ink-quaternary transition-transform group-open:rotate-180"
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="pb-4 pt-1 px-1">{children}</div>
    </details>
  );
}

// ─── Loan type label ──────────────────────────────────────────────────────────
function LoanTypePill({ loanType }: { loanType: string | null }) {
  const labels: Record<string, string> = {
    PI: "P&I",
    IO: "Interest Only",
    OFFSET: "Offset",
    LINE_OF_CREDIT: "Line of Credit",
  };
  const label = loanType ? (labels[loanType] ?? loanType) : "—";
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-bg-inset text-caption font-medium text-ink-secondary">
      {label}
    </span>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────
export function PropertyCard({
  property,
  householdId,
  basePath,
}: {
  property: PropertyRow;
  householdId: string;
  basePath: string;
}) {
  const isInvestment = property.type === "investment";
  const calcs = deriveCalcs(property);
  const projYears = Math.min(Math.max(property.projection_years ?? 15, 1), 30);

  return (
    <SurfaceCard>
      {/* ── Card header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <TypePill type={property.type} />
            {property.settlement_date && (
              <span className="text-caption text-ink-quaternary">
                Settled {property.settlement_date}
              </span>
            )}
          </div>
          <h3 className="text-body-lg font-semibold text-ink-primary truncate">{property.name}</h3>
          <p className="text-h4 font-semibold text-ink-primary num mt-1">
            {fmtMoneyCompact(property.current_value)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`${basePath}?edit=${property.id}`}
            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl border border-line bg-bg-base text-body-sm text-ink-secondary hover:text-ink-primary hover:border-ember-400 transition-colors"
          >
            Edit
          </Link>
          <DeletePropertyButton householdId={householdId} propertyId={property.id} />
        </div>
      </div>

      {/* ── [01] Key Metrics — open by default ───────────────────────────── */}
      <Section title="Key Metrics" index="[01]" defaultOpen>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Current LVR"
            value={calcs.currentLVR / 100}
            format="percent"
            tone={lvrTone(calcs.currentLVR)}
            sub={calcs.currentLVR > 80 ? (calcs.currentLVR > 95 ? "High risk" : "Caution") : "Healthy"}
          />
          <KpiCard
            label="Equity"
            value={calcs.equity}
            format="moneyCompact"
            tone="positive"
            sub={`of ${fmtMoneyCompact(property.current_value)} value`}
          />
          <KpiCard
            label="Monthly Cashflow"
            value={calcs.monthlyCashFlow}
            format="money"
            tone={calcs.monthlyCashFlow >= 0 ? "positive" : "negative"}
            sub={calcs.monthlyCashFlow >= 0 ? "Positive" : "Negative"}
          />
          <KpiCard
            label="Loan Repayment"
            value={-calcs.monthly}
            format="money"
            tone="warning"
            sub="per month"
          />
          {isInvestment && (
            <>
              <KpiCard
                label="Gross Yield"
                value={calcs.grossYield / 100}
                format="percent"
                tone="neutral"
              />
              <KpiCard
                label="Net Yield"
                value={calcs.netYield / 100}
                format="percent"
                tone={calcs.netYield > 0 ? "positive" : "negative"}
              />
              <KpiCard
                label="Tax Benefit"
                value={calcs.ngAnalysis?.monthlyTaxBenefit ?? null}
                format="money"
                tone="positive"
                sub={calcs.ngAnalysis?.isNegativelyGeared ? "Neg. gearing" : "Pos. gearing"}
              />
              <KpiCard
                label="Net After-Tax CF"
                value={calcs.ngAnalysis
                  ? calcs.monthlyCashFlow + (calcs.ngAnalysis.monthlyTaxBenefit ?? 0)
                  : null}
                format="money"
                tone={(calcs.monthlyCashFlow + (calcs.ngAnalysis?.monthlyTaxBenefit ?? 0)) >= 0
                  ? "positive" : "negative"}
              />
            </>
          )}
        </div>

        <div className="mt-4 divide-y divide-line/60">
          <MetricRow label="Monthly interest"   value={fmtMoney(calcs.monthly - (calcs.monthly - (calcs.loanAmount * (property.interest_rate ?? 0)) / 12))} />
          <MetricRow label="Cash-on-cash return"
            value={calcs.totalAcquisitionCost > 0
              ? fmtPercent(calcs.annualCashFlow / calcs.totalAcquisitionCost)
              : "—"} />
        </div>
      </Section>

      {/* ── [02] Purchase Details ─────────────────────────────────────────── */}
      <Section title="Purchase Details" index="[02]">
        <div className="divide-y divide-line/60">
          <MetricRow label="Purchase price"      value={fmtMoney(property.purchase_price)} />
          <MetricRow label="Deposit"             value={fmtMoney(property.deposit)} />
          <MetricRow label="Stamp duty"          value={fmtMoney(property.stamp_duty ?? calcs.stampDuty)} />
          <MetricRow label="Legal fees"          value={fmtMoney(property.legal_fees)} />
          <MetricRow label="Building inspection" value={fmtMoney(property.building_inspection)} />
          <MetricRow label="Loan setup fees"     value={fmtMoney(property.loan_setup_fees)} />
          <MetricRow label="Total acquisition"   value={fmtMoney(calcs.totalAcquisitionCost)} />
          {property.purchase_date  && <MetricRow label="Purchase date"    value={property.purchase_date} />}
          {property.settlement_date && <MetricRow label="Settlement date" value={property.settlement_date} />}
        </div>
      </Section>

      {/* ── [03] Loan Details ─────────────────────────────────────────────── */}
      <Section title="Loan Details" index="[03]">
        <div className="divide-y divide-line/60">
          <MetricRow
            label="Loan type"
            value={<LoanTypePill loanType={property.loan_type} />}
          />
          <MetricRow label="Loan amount"   value={fmtMoney(property.loan_amount)} tone="warning" />
          <MetricRow label="Interest rate" value={property.interest_rate != null ? fmtPercent(property.interest_rate) : "—"} />
          <MetricRow label="Loan term"     value={property.loan_term_years ? `${property.loan_term_years} years` : "—"} />
          {property.io_period_start && <MetricRow label="IO period start" value={property.io_period_start} />}
          {property.io_period_end   && <MetricRow label="IO period end"   value={property.io_period_end} />}
          {property.offset_balance != null && property.offset_balance > 0 && (
            <MetricRow label="Offset balance" value={fmtMoney(property.offset_balance)} tone="positive" />
          )}
        </div>
      </Section>

      {/* ── [04] Rental (investment only) ────────────────────────────────── */}
      {isInvestment && (
        <Section title="Rental Income" index="[04]">
          <div className="divide-y divide-line/60">
            <MetricRow label="Weekly rent"        value={fmtMoney(property.weekly_rent)} tone="positive" />
            <MetricRow label="Annual rent (gross)" value={fmtMoney((property.weekly_rent ?? 0) * 52)} tone="positive" />
            <MetricRow label="Annual rent (net)"  value={fmtMoney(calcs.monthlyRent * 12)} tone="positive" />
            <MetricRow label="Rental growth"      value={property.rental_growth != null ? fmtPercent(property.rental_growth) : "—"} />
            <MetricRow label="Vacancy rate"       value={property.vacancy_rate != null ? fmtPercent(property.vacancy_rate) : "—"} />
            <MetricRow label="Management fee"     value={property.management_fee != null ? fmtPercent(property.management_fee) : "—"} />
            {property.rental_start_date && (
              <MetricRow label="Rental start" value={property.rental_start_date} />
            )}
          </div>
          {calcs.ngAnalysis && (
            <div className="mt-4 pt-3 border-t border-line/60">
              <div className="syslabel mb-3">
                <span className="syslabel-bracket">[NG]</span>
                <span>Negative Gearing Analysis</span>
              </div>
              <div className="divide-y divide-line/60">
                <MetricRow label="Annual rental income"      value={fmtMoney(calcs.ngAnalysis.annualRentalIncome)} tone="positive" />
                <MetricRow label="Annual interest"           value={fmtMoney(calcs.ngAnalysis.annualInterest)} tone="negative" />
                <MetricRow label="Deductible expenses"       value={fmtMoney(calcs.ngAnalysis.annualDeductibleExpenses)} tone="negative" />
                <MetricRow label="Depreciation (est.)"       value={fmtMoney(calcs.ngAnalysis.annualDepreciation)} tone="negative" />
                <MetricRow
                  label="Taxable rental result"
                  value={fmtMoney(calcs.ngAnalysis.taxableRentalResult)}
                  tone={calcs.ngAnalysis.isNegativelyGeared ? "negative" : "positive"}
                />
                <MetricRow
                  label={calcs.ngAnalysis.isNegativelyGeared ? "Annual tax benefit" : "Tax payable"}
                  value={fmtMoney(calcs.ngAnalysis.annualTaxBenefit)}
                  tone={calcs.ngAnalysis.isNegativelyGeared ? "positive" : "warning"}
                />
                <MetricRow label="Monthly tax benefit"       value={fmtMoney(calcs.ngAnalysis.monthlyTaxBenefit)} tone="positive" />
                <MetricRow label="Net after-tax monthly cost" value={fmtMoney(Math.abs(calcs.ngAnalysis.netAfterTaxMonthlyCost))} />
                <MetricRow label="Marginal rate used"        value={fmtPercent(calcs.ngAnalysis.marginalRate)} />
              </div>
            </div>
          )}
        </Section>
      )}

      {/* ── [05] Expenses ─────────────────────────────────────────────────── */}
      <Section title="Operating Expenses" index="[05]">
        <div className="divide-y divide-line/60">
          <MetricRow label="Insurance"      value={fmtMoney(property.insurance)} />
          <MetricRow label="Council rates"  value={fmtMoney(property.council_rates)} />
          <MetricRow label="Water rates"    value={fmtMoney(property.water_rates)} />
          <MetricRow label="Maintenance"    value={fmtMoney(property.maintenance)} />
          <MetricRow label="Body corporate" value={fmtMoney(property.body_corporate)} />
          <MetricRow label="Land tax"       value={fmtMoney(property.land_tax)} />
          <MetricRow
            label="Total annual expenses"
            value={fmtMoney(
              (property.insurance ?? 0) +
              (property.council_rates ?? 0) +
              (property.water_rates ?? 0) +
              (property.maintenance ?? 0) +
              (property.body_corporate ?? 0) +
              (property.land_tax ?? 0)
            )}
          />
        </div>
      </Section>

      {/* ── [06] 15-Year Projection ───────────────────────────────────────── */}
      <Section title={`${projYears}-Year Projection`} index="[06]">
        <ProjectionTable property={property} years={projYears} />
      </Section>

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      {property.notes && (
        <p className="mt-4 pt-4 border-t border-line/60 text-caption text-ink-quaternary border-l-2 border-l-line pl-3 italic">
          {property.notes}
        </p>
      )}
    </SurfaceCard>
  );
}
