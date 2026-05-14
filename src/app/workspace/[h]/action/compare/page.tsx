import { getSessionUser } from "@/lib/auth";
import { getSnapshot } from "@/lib/snapshot";
import { getEntitlements } from "@/lib/billing";
import { runDecision } from "@/lib/engine/runDecision";
import type { ScenarioDelta } from "@fwl/engine";
import {
  SurfaceCard, CardHeader, MetricRow, EmptyState, KpiCard,
} from "@/components/workspace/cards";
import { PageHeader } from "@/components/workspace/PageHeader";
import { FeatureGate } from "@/components/workspace/billing/FeatureGate";
import { fmtMoney, fmtMoneyCompact, fmtPercent } from "@/components/workspace/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Scenario compare — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * Scenario Compare — runs the engine against 3 canonical candidates and
 * presents them side-by-side ranked by survival × terminal NW.
 *
 * Candidates (Phase 2D, deterministic):
 *   1. Hold (no deltas) — the baseline
 *   2. Aggressive paydown — $1,000/month extra mortgage
 *   3. Liquidity-first — $20k offset deposit + $300/month extra mortgage
 *
 * Phase 3 will let users author custom candidate sets and save them.
 */
export default async function CompareScenarioPage({ params }: Props) {
  await getSessionUser();
  const ents = await getEntitlements(params.h);
  if (!ents.features.has("decision.compare")) {
    return (
      <div className="space-y-8">
        <PageHeader
          index="[05·03]" eyebrow="Action" title="Scenario compare"
          body="Rank multiple candidate plans against the same ledger."
        />
        <FeatureGate
          feature="decision.compare"
          currentTier={ents.tier}
          bullets={[
            "Engine runs every candidate against your real ledger.",
            "Ranked by survival × terminal NW, lowest stress first.",
            "Three preset candidates today, custom sets coming.",
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
          index="[05·03]" eyebrow="Action" title="Scenario compare"
          body="Engine sandbox over your ledger."
        />
        <EmptyState
          index="·" eyebrow="Engine not ready"
          title="Compare needs a baseline-capable ledger"
          body={`Still missing: ${snap.engineReadiness.blockers.join(", ")}.`}
          ctaLabel="Open Snapshot" ctaHref={`/workspace/${params.h}/overview`}
        />
      </div>
    );
  }

  const today = new Date();
  const startKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const aggressivePaydown: ScenarioDelta[] = [{
    id: "cmp-agg-1", scenarioId: "compare-aggressive",
    deltaType: "extra_mortgage_repayment",
    activationMonth: startKey as `${number}-${string}`,
    params: { amountPerMonth: 1000 },
    priority: 500, idempotencyKey: "cmp-agg-extra-1000",
  }];

  const liquidityFirst: ScenarioDelta[] = [
    {
      id: "cmp-liq-1", scenarioId: "compare-liquidity",
      deltaType: "offset_deposit",
      activationMonth: startKey as `${number}-${string}`,
      params: { amount: 20000 },
      priority: 400, idempotencyKey: "cmp-liq-offset-20000",
    },
    {
      id: "cmp-liq-2", scenarioId: "compare-liquidity",
      deltaType: "extra_mortgage_repayment",
      activationMonth: startKey as `${number}-${string}`,
      params: { amountPerMonth: 300 },
      priority: 500, idempotencyKey: "cmp-liq-extra-300",
    },
  ];

  const [holdRes, aggRes, liqRes] = await Promise.all([
    runDecision(params.h, { simulationCount: 200, name: "Hold" }),
    runDecision(params.h, { simulationCount: 200, name: "Aggressive paydown", deltas: aggressivePaydown }),
    runDecision(params.h, { simulationCount: 200, name: "Liquidity-first", deltas: liquidityFirst }),
  ]);

  const candidates: CandidateSummary[] = [
    summarise("Hold", "No changes from the current plan.", holdRes.result),
    summarise("Aggressive paydown", "Extra $1,000/month against the highest-rate loan.", aggRes.result),
    summarise("Liquidity-first", "$20,000 offset deposit + $300/month extra repayment.", liqRes.result),
  ];

  // Rank: highest survival, then highest median terminal NW, then lowest liquidity stress.
  candidates.sort((a, b) => {
    if (Math.abs(a.survivalPct - b.survivalPct) > 0.005) return b.survivalPct - a.survivalPct;
    if (Math.abs(a.medianTerminalNw - b.medianTerminalNw) > 1000) return b.medianTerminalNw - a.medianTerminalNw;
    return a.liquidityProb - b.liquidityProb;
  });

  return (
    <div className="space-y-10">
      <PageHeader
        index="[05·03]" eyebrow="Action" title="Scenario compare"
        body="Three canonical candidates evaluated against your real ledger. Ranked by survival, then median terminal NW, then liquidity stress."
      />

      {/* Headline winner */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard index="·" label="WINNER" value={0} format="raw" sub={candidates[0]?.name ?? "—"} />
        <KpiCard index="·" label="WINNER SURVIVAL" value={candidates[0]?.survivalPct ?? 0} format="percent" tone="positive" />
        <KpiCard index="·" label="WINNER MEDIAN NW" value={candidates[0]?.medianTerminalNw ?? 0} format="moneyCompact" />
        <KpiCard index="·" label="VS HOLD"
          value={(candidates[0]?.medianTerminalNw ?? 0) - (candidates.find(c => c.name === "Hold")?.medianTerminalNw ?? 0)}
          format="moneyCompact" />
      </section>

      {/* Detailed table */}
      <SurfaceCard>
        <CardHeader index="[B·1]" eyebrow="Detail" title="Side-by-side" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-body-sm">
            <thead>
              <tr className="text-left text-caption text-ink-tertiary">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Candidate</th>
                <th className="py-2 pr-4 text-right">Survival</th>
                <th className="py-2 pr-4 text-right">Median NW</th>
                <th className="py-2 pr-4 text-right">Default</th>
                <th className="py-2 pr-4 text-right">Liquidity stress</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <tr key={c.name} className="border-t border-line-subtle">
                  <td className="py-3 pr-4 text-ink-tertiary tabular">{i + 1}</td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-ink-primary">{c.name}</div>
                    <div className="text-caption text-ink-tertiary">{c.description}</div>
                  </td>
                  <td className="py-3 pr-4 text-right tabular">{fmtPercent(c.survivalPct)}</td>
                  <td className="py-3 pr-4 text-right tabular">{fmtMoney(c.medianTerminalNw)}</td>
                  <td className="py-3 pr-4 text-right tabular">{fmtPercent(c.defaultProb)}</td>
                  <td className="py-3 pr-4 text-right tabular">{fmtPercent(c.liquidityProb)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-caption text-ink-quaternary">
          All three candidates use the same {holdRes.result.simulationCount}-sim seed and the same horizon. Differences are entirely down to the deltas applied.
        </p>
      </SurfaceCard>
    </div>
  );
}

interface CandidateSummary {
  name: string;
  description: string;
  survivalPct: number;
  medianTerminalNw: number;
  defaultProb: number;
  liquidityProb: number;
}

function summarise(name: string, description: string, r: import("@fwl/engine").ExtendedScenarioResult): CandidateSummary {
  const sorted = r.terminalNwSorted;
  const median = sorted.length
    ? sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
    : 0;
  return {
    name,
    description,
    survivalPct: 1 - (r.defaultProbability ?? 0),
    medianTerminalNw: median,
    defaultProb: r.defaultProbability ?? 0,
    liquidityProb: r.liquidityStressProbability ?? 0,
  };
}
