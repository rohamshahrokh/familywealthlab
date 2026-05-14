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

export const metadata = { title: "Debt strategy — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * Debt strategy — debt-to-income, debt-service ratio, property-vs-other
 * split. Pure read-model. The Decision Engine ranks specific payoff
 * sequences; this surface is the data layer behind that.
 */
export default async function StrategyDebtPage({ params }: Props) {
  await getSessionUser();
  const ents = await getEntitlements(params.h);
  if (!ents.features.has("strategy.debt")) {
    return (
      <div className="space-y-8">
        <PageHeader
          index="[03·03]" eyebrow="Strategy" title="Debt strategy"
          body="Debt-to-income, debt service ratio, and the property-vs-other split that drives every payoff decision."
        />
        <FeatureGate feature="strategy.debt" currentTier={ents.tier} />
      </div>
    );
  }

  const snap = await getSnapshot(params.h);
  const { wealth, cashflow } = snap;
  const totalDebt = wealth.debtBalance;
  const annualIncome = cashflow.monthlyIncome * 12;
  const dti = annualIncome > 0 ? totalDebt / annualIncome : null;
  const dsr = cashflow.monthlyIncome > 0
    ? cashflow.monthlyDebtService / cashflow.monthlyIncome
    : null;

  if (totalDebt === 0) {
    return (
      <div className="space-y-8">
        <PageHeader index="[03·03]" eyebrow="Strategy" title="Debt strategy"
          body="No liabilities recorded — your household is debt-free in the engine's view." />
        <EmptyState index="·" eyebrow="Debt-free"
          title="No debt on the ledger"
          body="If this matches reality, congratulations — leave it empty. Otherwise, add liabilities or property loans to activate this surface."
          ctaLabel="Add liabilities" ctaHref={`/workspace/${params.h}/wealth/liabilities`} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        index="[03·03]" eyebrow="Strategy" title="Debt strategy"
        body="Debt-to-income and debt-service ratios pulled straight from your ledger. The Decision Engine uses these to rank payoff vs invest decisions."
      />

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard index="·" label="TOTAL DEBT" value={totalDebt} format="moneyCompact"
          tone={totalDebt > 0 ? "warning" : "neutral"} />
        <KpiCard index="·" label="DEBT/INCOME (DTI)"
          value={dti ?? 0} format="raw"
          tone={dti == null ? "neutral" : dti > 6 ? "negative" : dti > 4 ? "warning" : "positive"}
          sub="Total debt ÷ annual income (×)" />
        <KpiCard index="·" label="DEBT SERVICE (DSR)"
          value={dsr ?? 0} format="percent"
          tone={dsr == null ? "neutral" : dsr > 0.4 ? "negative" : dsr > 0.3 ? "warning" : "positive"}
          sub="Monthly service ÷ monthly income" />
        <KpiCard index="·" label="MONTHLY SERVICE" value={cashflow.monthlyDebtService} format="money" />
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <SurfaceCard>
          <CardHeader index="[A]" eyebrow="Composition" title="Property vs other debt" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <MetricRow label="Property loans" value={fmtMoney(wealth.debtSplit.propertyLoans)} />
            <MetricRow label="Other liabilities" value={fmtMoney(wealth.debtSplit.otherLiabilities)} />
            <MetricRow label="% property"
              value={totalDebt > 0 ? fmtPercent(wealth.debtSplit.propertyLoans / totalDebt) : "—"} />
            <MetricRow label="% other"
              value={totalDebt > 0 ? fmtPercent(wealth.debtSplit.otherLiabilities / totalDebt) : "—"} />
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <CardHeader index="[B]" eyebrow="Capacity" title="Coverage ratios" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <MetricRow label="Monthly income" value={fmtMoney(cashflow.monthlyIncome)} />
            <MetricRow label="Monthly expenses" value={fmtMoney(cashflow.monthlyExpenses)} />
            <MetricRow label="Monthly service" value={fmtMoney(cashflow.monthlyDebtService)} />
            <MetricRow label="Monthly surplus" value={fmtMoney(cashflow.monthlySurplus)} />
          </div>
          <p className="mt-4 text-caption text-ink-tertiary">
            Healthy DTI is typically under 4×; healthy DSR is under 30%. These thresholds are advisory — your lender's policy is the binding number.
          </p>
        </SurfaceCard>
      </section>
    </div>
  );
}
