import { getSessionUser } from "@/lib/auth";
import { getSnapshot } from "@/lib/snapshot";
import { getEntitlements } from "@/lib/billing";
import { EmptyState } from "@/components/workspace/cards";
import { PageHeader } from "@/components/workspace/PageHeader";
import { FeatureGate } from "@/components/workspace/billing/FeatureGate";
import { WhatIfPanel } from "./WhatIfPanel";

export const dynamic = "force-dynamic";

export const metadata = { title: "What-If — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * What-If — interactive scenario sandbox. The user enters a small number of
 * deltas (extra mortgage repayment, offset deposit, salary change), the
 * engine runs your real ledger twice (baseline + scenario), and the panel
 * shows the delta on survival, terminal NW, and stress probabilities.
 *
 * Every number is real engine output — no fabricated numbers.
 */
export default async function WhatIfPage({ params }: Props) {
  await getSessionUser();
  const ents = await getEntitlements(params.h);
  if (!ents.features.has("decision.whatIf")) {
    return (
      <div className="space-y-8">
        <PageHeader
          index="[05·02]" eyebrow="Action" title="What-If"
          body="Try changes against your real ledger and see the engine's answer instantly."
        />
        <FeatureGate
          feature="decision.whatIf"
          currentTier={ents.tier}
          bullets={[
            "Interactive sandbox over the same engine as Decision.",
            "Side-by-side baseline vs scenario for survival, NW, stress.",
            "Reproducible: same inputs → same answer.",
          ]}
        />
      </div>
    );
  }

  const snap = await getSnapshot(params.h);
  if (!snap.engineReadiness.canRunBaseline) {
    return (
      <div className="space-y-8">
        <PageHeader
          index="[05·02]" eyebrow="Action" title="What-If"
          body="Engine sandbox over your ledger."
        />
        <EmptyState
          index="·" eyebrow="Engine not ready"
          title="What-If needs a baseline-capable ledger"
          body={`Still missing: ${snap.engineReadiness.blockers.join(", ")}.`}
          ctaLabel="Open Snapshot" ctaHref={`/workspace/${params.h}/overview`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        index="[05·02]" eyebrow="Action" title="What-If"
        body="Try a delta against your real ledger. The engine runs your ledger twice — once unchanged, once with your delta — and shows the difference on every risk metric."
      />
      <WhatIfPanel householdId={params.h} />
    </div>
  );
}
