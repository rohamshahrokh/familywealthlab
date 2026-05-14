import { getSessionUser } from "@/lib/auth";
import { getSnapshot } from "@/lib/snapshot";
import { runDecision } from "@/lib/engine/runDecision";
import {
  SurfaceCard, CardHeader, KpiCard, MetricRow, EmptyState,
} from "@/components/workspace/cards";
import { PageHeader } from "@/components/workspace/PageHeader";
import { fmtMoney, fmtMoneyCompact, fmtPercent } from "@/components/workspace/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Monte Carlo — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * Monte Carlo dispersion — surfaces the full risk distribution: terminal NW
 * percentiles, stress probabilities, CVaR, max drawdown. Pro-tier gated
 * because this is where the engine's deepest output lives.
 */
export default async function MonteCarloPage({ params }: Props) {
  await getSessionUser();

  const snap = await getSnapshot(params.h);
  if (!snap.engineReadiness.canRunMonteCarlo) {
    return (
      <div className="space-y-8">
        <PageHeader
          index="[04·03]" eyebrow="Forecast" title="Monte Carlo"
          body="Stochastic dispersion of every future path your engine simulates."
        />
        <EmptyState
          index="·" eyebrow="Engine not ready"
          title="Monte Carlo needs richer assumptions"
          body={`Still missing: ${snap.engineReadiness.blockers.join(", ")}. Add return + inflation assumptions and at least one productive asset.`}
          ctaLabel="Set assumptions" ctaHref={`/workspace/${params.h}/settings/assumptions`}
        />
      </div>
    );
  }

  const { result } = await runDecision(params.h);
  const horizonYears = Math.round(result.horizonMonths / 12);

  const sorted = result.terminalNwSorted;
  const pct = (p: number) => sorted.length ? sorted[Math.floor(Math.max(0, Math.min(1, p)) * (sorted.length - 1))] : 0;
  const p10 = pct(0.10);
  const p50 = pct(0.50);
  const p90 = pct(0.90);

  const risk = result.riskMetrics;
  const cvarRatio = result.initialNetWorth > 0 ? risk.cvarDollars95 / result.initialNetWorth : 0;
  const maxDdMedian = result.maxDrawdownSamples.length
    ? [...result.maxDrawdownSamples].sort((a, b) => a - b)[Math.floor(result.maxDrawdownSamples.length / 2)]
    : 0;

  return (
    <div className="space-y-10">
      <PageHeader
        index="[04·03]" eyebrow="Forecast" title="Monte Carlo"
        body={`Dispersion across ${result.simulationCount.toLocaleString()} simulated futures over ${horizonYears} years. Every probability and percentile is engine output — nothing rounded or fabricated.`}
      />

      {/* ── [A] Stress probabilities ──────────────────────────── */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard index="·" label="DEFAULT" value={result.defaultProbability} format="percent"
          tone={result.defaultProbability >= 0.20 ? "negative" : result.defaultProbability >= 0.05 ? "warning" : "positive"} />
        <KpiCard index="·" label="LIQUIDITY STRESS" value={result.liquidityStressProbability} format="percent"
          tone={result.liquidityStressProbability >= 0.30 ? "negative" : result.liquidityStressProbability >= 0.10 ? "warning" : "positive"} />
        <KpiCard index="·" label="NEGATIVE EQUITY" value={result.negativeEquityProbability} format="percent"
          tone={result.negativeEquityProbability >= 0.20 ? "negative" : result.negativeEquityProbability >= 0.05 ? "warning" : "positive"} />
        <KpiCard index="·" label="REFINANCE PRESSURE" value={result.refinancePressureProbability} format="percent"
          tone={result.refinancePressureProbability >= 0.30 ? "negative" : result.refinancePressureProbability >= 0.10 ? "warning" : "positive"} />
      </section>

      {/* ── [B] Terminal NW dispersion ────────────────────────── */}
      <SurfaceCard>
        <CardHeader index="[B·1]" eyebrow="Dispersion" title={`Terminal net worth · year ${horizonYears}`} />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          The 10th, 50th, and 90th percentiles of terminal net worth. P10 is the bad-luck-but-not-catastrophic outcome; P90 is the lucky tailwind path.
        </p>
        <PercentileBar p10={p10} p50={p50} p90={p90} initial={result.initialNetWorth} />
        <div className="grid grid-cols-3 gap-x-6 gap-y-1 mt-6">
          <MetricRow label="P10 (bad path)" value={fmtMoney(p10)} />
          <MetricRow label="P50 (median)" value={fmtMoney(p50)} />
          <MetricRow label="P90 (good path)" value={fmtMoney(p90)} />
        </div>
      </SurfaceCard>

      {/* ── [C] Tail-risk metrics ─────────────────────────────── */}
      <SurfaceCard>
        <CardHeader index="[B·2]" eyebrow="Tail risk" title="What does the worst-case look like" />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          Conditional VaR (CVaR) is the average loss in the worst 5% of paths — a tighter measure than VaR because it captures how bad the bad case actually gets.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1">
          <MetricRow label="CVaR (5%)" value={fmtMoney(risk.cvarDollars95)} />
          <MetricRow label="CVaR / Today's NW" value={fmtPercent(cvarRatio)} />
          <MetricRow label="Median max drawdown" value={fmtPercent(maxDdMedian)} />
          <MetricRow label="Concentration risk" value={fmtPercent(risk.concentrationRisk)} />
        </div>
      </SurfaceCard>

      {/* ── [D] Sequence-of-returns ───────────────────────────── */}
      <SurfaceCard>
        <CardHeader index="[B·3]" eyebrow="Sequence risk" title="Order of returns matters" />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          Two portfolios with the same average return can end up very differently if one suffers losses early in retirement. This dispersion metric quantifies that risk.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1">
          <MetricRow label="P10 terminal" value={fmtMoneyCompact(result.sequenceDispersion.p10)} />
          <MetricRow label="P50 terminal" value={fmtMoneyCompact(result.sequenceDispersion.p50)} />
          <MetricRow label="P90 terminal" value={fmtMoneyCompact(result.sequenceDispersion.p90)} />
          <MetricRow label="Coeff. of variation" value={fmtPercent(result.sequenceDispersion.cv)} />
        </div>
      </SurfaceCard>

      {/* ── [E] Engine warnings ───────────────────────────────── */}
      {result.warnings.length > 0 && (
        <SurfaceCard tone="inset">
          <CardHeader index="[E·1]" eyebrow="Diagnostic" title="Engine notes" />
          <ul className="mt-2 space-y-1 text-body-sm text-ink-secondary list-disc list-inside">
            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </SurfaceCard>
      )}
    </div>
  );
}

function PercentileBar({ p10, p50, p90, initial }: { p10: number; p50: number; p90: number; initial: number }) {
  const min = Math.min(p10, initial, 0);
  const max = Math.max(p90, initial);
  const range = max - min || 1;
  const pct = (n: number) => `${Math.max(0, Math.min(100, ((n - min) / range) * 100)).toFixed(1)}%`;
  return (
    <div className="w-full mt-2">
      <div className="relative h-10 rounded-lg bg-bg-inset overflow-visible">
        <div
          className="absolute top-2 bottom-2 rounded-md bg-ember-500/30 border border-ember-500/60"
          style={{ left: pct(p10), width: `calc(${pct(p90)} - ${pct(p10)})` }}
        />
        <div className="absolute top-1 bottom-1 w-0.5 bg-ember-700" style={{ left: pct(p50) }} aria-label="P50 marker" />
        <div className="absolute top-1 bottom-1 w-0.5 bg-ink-tertiary" style={{ left: pct(initial) }} aria-label="Today marker" />
      </div>
      <div className="flex justify-between text-caption text-ink-tertiary mt-1">
        <span>{fmtMoneyCompact(min)}</span>
        <span>Today: {fmtMoneyCompact(initial)}</span>
        <span>{fmtMoneyCompact(max)}</span>
      </div>
    </div>
  );
}
