import { getSessionUser } from "@/lib/auth";
import { getSnapshot } from "@/lib/snapshot";
import { PageHeader } from "@/components/workspace/PageHeader";
import { CgtSimulator } from "./CgtSimulator";

export const dynamic = "force-dynamic";

export const metadata = { title: "CGT simulator — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * CGT simulator — server-rendered shell that hosts the interactive
 * `CgtSimulator` client component. Pre-fills sale price + cost base from
 * the user's annual income so the calculation is realistic from the first
 * click. All math runs server-side via a server action so the engine is
 * the single source of truth.
 */
export default async function StrategyCgtPage({ params }: Props) {
  await getSessionUser();

  const snap = await getSnapshot(params.h);
  const defaultIncome = Math.round(snap.cashflow.monthlyIncome * 12) || 100_000;

  return (
    <div className="space-y-10">
      <PageHeader
        index="[03·05]" eyebrow="Strategy" title="CGT simulator"
        body="Tries any sale price + cost base against the AU CGT rules — 12-month discount, marginal rate from your wage income, sale year. The engine here is the same one used by the Decision Engine."
      />
      <CgtSimulator defaultAnnualIncome={defaultIncome} householdId={params.h} />
    </div>
  );
}
