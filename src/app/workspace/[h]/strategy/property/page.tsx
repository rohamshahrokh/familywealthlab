import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getSnapshot } from "@/lib/snapshot";
import { getEntitlements } from "@/lib/billing";
import {
  SurfaceCard, CardHeader, KpiCard, MetricRow, EmptyState,
} from "@/components/workspace/cards";
import { PageHeader } from "@/components/workspace/PageHeader";
import { FeatureGate } from "@/components/workspace/billing/FeatureGate";
import { fmtMoney, fmtPercent } from "@/components/workspace/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Property strategy — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * Property strategy — read-model surface for LVR, equity, yield, and the
 * settled-vs-planned split. Every number is derived from Snapshot or the
 * existing engine selectors. No new financial logic.
 */
export default async function StrategyPropertyPage({ params }: Props) {
  await getSessionUser();
  const ents = await getEntitlements(params.h);
  if (!ents.features.has("strategy.property")) {
    return (
      <div className="space-y-8">
        <PageHeader
          index="[03·02]" eyebrow="Strategy" title="Property strategy"
          body="Lender-grade LVR, equity, yield, and settled-vs-planned analysis."
        />
        <FeatureGate
          feature="strategy.property"
          currentTier={ents.tier}
          bullets={[
            "Aggregate LVR + per-property breakdown.",
            "Equity available for re-borrow (lender-conservative).",
            "Rental yield (gross + net) per property.",
          ]}
        />
      </div>
    );
  }

  const snap = await getSnapshot(params.h);
  const { wealth, cashflow } = snap;
  const propertyEquity = wealth.propertyEquity;
  const propertyDebt = wealth.debtSplit.propertyLoans;
  const propertyValue = propertyEquity + propertyDebt;
  const aggregateLvr = propertyValue > 0 ? propertyDebt / propertyValue : null;
  const grossYield = propertyValue > 0
    ? cashflow.annualPassiveIncome / propertyValue
    : null;

  return (
    <div className="space-y-10">
      <PageHeader
        index="[03·02]" eyebrow="Strategy" title="Property strategy"
        body="LVR, equity, and yield computed from your ledger. The Decision Engine uses these same numbers — there is no second source of truth."
        trailing={
          <Link href={`/workspace/${params.h}/wealth/properties`}
            className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-4 h-9 text-body-sm font-medium hover:bg-graphite-800 focus-ring">
            Manage properties <span aria-hidden>→</span>
          </Link>
        }
      />

      {propertyValue === 0 ? (
        <EmptyState index="·" eyebrow="Empty ledger" title="No property recorded"
          body="Add at least one settled or planned property to activate the strategy surface."
          ctaLabel="Add property" ctaHref={`/workspace/${params.h}/wealth/properties`} />
      ) : (
        <>
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard index="·" label="PORTFOLIO VALUE" value={propertyValue} format="moneyCompact" />
            <KpiCard index="·" label="EQUITY" value={propertyEquity} format="moneyCompact"
              tone={propertyEquity > 0 ? "positive" : "neutral"}
              sub="After current loans" />
            <KpiCard index="·" label="DEBT" value={propertyDebt} format="moneyCompact"
              tone={propertyDebt > 0 ? "warning" : "neutral"} />
            <KpiCard index="·" label="AGGREGATE LVR"
              value={aggregateLvr ?? 0}
              format="percent"
              tone={aggregateLvr == null ? "neutral" : aggregateLvr > 0.8 ? "negative" : aggregateLvr > 0.65 ? "warning" : "positive"} />
          </section>

          <section className="grid lg:grid-cols-2 gap-4">
            <SurfaceCard>
              <CardHeader index="[A]" eyebrow="Yield" title="Rental income vs portfolio value" />
              <p className="text-caption text-ink-tertiary -mt-2 mb-4">
                Annualised passive income divided by total property value. Conservative — uses gross figures.
              </p>
              {grossYield == null ? (
                <EmptyState index="·" eyebrow="No yield"
                  title="Add rental income"
                  body="Yield activates once one or more income rows are recorded."
                  ctaLabel="Add income" ctaHref={`/workspace/${params.h}/input/income`} />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-display-sm text-ink-primary tabular">{fmtPercent(grossYield)}</span>
                    <span className="text-caption text-ink-tertiary">{fmtMoney(cashflow.annualPassiveIncome)} / yr</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <MetricRow label="Passive income (yr)" value={fmtMoney(cashflow.annualPassiveIncome)} />
                    <MetricRow label="Portfolio value" value={fmtMoney(propertyValue)} />
                  </div>
                </div>
              )}
            </SurfaceCard>

            <SurfaceCard>
              <CardHeader index="[B]" eyebrow="Headroom" title="Borrowing headroom (signal)" />
              <p className="text-caption text-ink-tertiary -mt-2 mb-4">
                A rough indicator only — true serviceability lives in the Decision Engine. This is just &le; 80% LVR equity unlock.
              </p>
              {aggregateLvr == null ? (
                <EmptyState index="·" eyebrow="No LVR" title="No portfolio recorded"
                  body="LVR requires at least one property with a value > 0." />
              ) : (
                <div className="space-y-3">
                  <MetricRow label="Equity at 80% LVR cap"
                    value={fmtMoney(Math.max(0, propertyValue * 0.8 - propertyDebt))} />
                  <MetricRow label="Equity at 70% LVR cap"
                    value={fmtMoney(Math.max(0, propertyValue * 0.7 - propertyDebt))} />
                  <MetricRow label="Current LVR" value={fmtPercent(aggregateLvr)} />
                </div>
              )}
            </SurfaceCard>
          </section>
        </>
      )}
    </div>
  );
}
