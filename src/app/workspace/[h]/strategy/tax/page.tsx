import { getSessionUser } from "@/lib/auth";
import { getSnapshot } from "@/lib/snapshot";
import { computeWageTax } from "@fwl/engine";
import {
  SurfaceCard, CardHeader, KpiCard, MetricRow, EmptyState,
} from "@/components/workspace/cards";
import { PageHeader } from "@/components/workspace/PageHeader";
import { fmtMoney, fmtPercent } from "@/components/workspace/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tax strategy — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * Tax strategy — AU income tax slab, marginal rate, effective rate.
 * Uses the engine's `computeWageTax` so the numbers match every other
 * surface in the platform.
 */
export default async function StrategyTaxPage({ params }: Props) {
  await getSessionUser();

  const snap = await getSnapshot(params.h);
  const annualIncome = snap.cashflow.monthlyIncome * 12;
  if (annualIncome === 0) {
    return (
      <div className="space-y-8">
        <PageHeader index="[03·04]" eyebrow="Strategy" title="Tax strategy"
          body="Tax strategy needs an income figure in your ledger." />
        <EmptyState index="·" eyebrow="Empty"
          title="Add income to activate"
          body="The engine cannot compute marginal or effective tax without income data."
          ctaLabel="Add income" ctaHref={`/workspace/${params.h}/input/income`} />
      </div>
    );
  }

  const tax = computeWageTax({
    annualGross: annualIncome,
    rentalLoss: 0,
    rentalProfit: 0,
    hasHelpDebt: false,
    hasPrivateHospitalCover: false,
  });

  const marginal = tax.marginalRate;
  const effective = annualIncome > 0 ? tax.totalAnnualTax / annualIncome : 0;
  const net = annualIncome - tax.totalAnnualTax;

  return (
    <div className="space-y-10">
      <PageHeader
        index="[03·04]" eyebrow="Strategy" title="Tax strategy"
        body="AU income tax computed by the same engine used by the Decision Engine and Monte Carlo. Marginal + effective rates drive every tax-advantaged decision below."
      />

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard index="·" label="GROSS INCOME (YR)" value={annualIncome} format="moneyCompact" />
        <KpiCard index="·" label="INCOME TAX (YR)" value={tax.totalAnnualTax} format="moneyCompact"
          tone={effective > 0.4 ? "warning" : "neutral"} />
        <KpiCard index="·" label="NET TAKE-HOME (YR)" value={net} format="moneyCompact" tone="positive" />
        <KpiCard index="·" label="MARGINAL RATE"
          value={marginal} format="percent"
          tone={marginal >= 0.45 ? "negative" : marginal >= 0.37 ? "warning" : "neutral"} />
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <SurfaceCard>
          <CardHeader index="[A]" eyebrow="Bracket" title="Where you sit today" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <MetricRow label="Gross income" value={fmtMoney(annualIncome)} />
            <MetricRow label="Total tax" value={fmtMoney(tax.totalAnnualTax)} />
            <MetricRow label="Income tax (slab)" value={fmtMoney(tax.incomeTax)} />
            <MetricRow label="Marginal rate" value={fmtPercent(marginal)} />
            <MetricRow label="Effective rate" value={fmtPercent(effective)} />
            <MetricRow label="Medicare levy" value={fmtMoney(tax.medicareLevy)} />
            <MetricRow label="MLS" value={fmtMoney(tax.medicareLevySurcharge)} />
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <CardHeader index="[B]" eyebrow="Levers" title="Highest-impact tax tools (advisory)" />
          <ul className="space-y-3 text-body-sm text-ink-primary">
            <li className="flex items-start gap-2">
              <span className="syslabel-bracket mt-0.5">·</span>
              <span>
                <strong className="text-ink-primary">Concessional super top-up</strong> — claim against your marginal rate of <span className="tabular">{fmtPercent(marginal)}</span>, capped at $30,000/yr (FY26 figures).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="syslabel-bracket mt-0.5">·</span>
              <span>
                <strong className="text-ink-primary">Negative gearing</strong> — if you hold investment properties, deductible losses flow against this same rate.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="syslabel-bracket mt-0.5">·</span>
              <span>
                <strong className="text-ink-primary">CGT discount</strong> — assets held &gt; 12 months attract a 50% discount on capital gains.
              </span>
            </li>
          </ul>
          <p className="mt-4 text-caption text-ink-tertiary">
            Advisory copy. Specific actions are ranked by the Decision Engine using your full ledger.
          </p>
        </SurfaceCard>
      </section>
    </div>
  );
}
