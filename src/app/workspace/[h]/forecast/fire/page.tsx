import { getSessionUser } from "@/lib/auth";
import { getSnapshot } from "@/lib/snapshot";
import { runDecision } from "@/lib/engine/runDecision";
import {
  SurfaceCard, CardHeader, KpiCard, MetricRow, EmptyState,
} from "@/components/workspace/cards";
import { PageHeader } from "@/components/workspace/PageHeader";
import { fmtMoney, fmtMoneyCompact, fmtPercent, fmtNumber } from "@/components/workspace/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "FIRE projection — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * FIRE projection — combines the deterministic linear FIRE indicator from
 * Snapshot with the engine's median-path projection, so the user sees both
 * the simple version ("you're 23% of the way there") and the engine version
 * ("the median path crosses your target at year 14").
 */
export default async function FireForecastPage({ params }: Props) {
  await getSessionUser();

  const snap = await getSnapshot(params.h);
  const { fire, wealth } = snap;

  if (fire.targetAmount == null) {
    return (
      <div className="space-y-8">
        <PageHeader
          index="[04·02]" eyebrow="Forecast" title="FIRE projection"
          body="When does your engine-projected wealth cross your FIRE target?"
        />
        <EmptyState
          index="·" eyebrow="No FIRE target set"
          title="Define your FIRE target to activate this projection"
          body="The FIRE target amount and target age live in Assumptions. Once set, both the linear and engine-projected paths render here."
          ctaLabel="Set assumptions" ctaHref={`/workspace/${params.h}/settings/assumptions`}
        />
      </div>
    );
  }

  if (!snap.engineReadiness.canRunBaseline) {
    // Show linear-only FIRE while engine can't run yet — honesty principle.
    return (
      <div className="space-y-10">
        <PageHeader
          index="[04·02]" eyebrow="Forecast" title="FIRE projection"
          body="Linear projection from your current surplus and assumption return. The engine version activates once a baseline forecast is possible."
        />
        <LinearFireOnly snap={snap} householdId={params.h} />
      </div>
    );
  }

  const { result } = await runDecision(params.h);
  const target = fire.targetAmount;
  const crossoverMonth = result.medianNwPath.findIndex((nw) => nw >= target);
  const crossoverYears = crossoverMonth >= 0 ? crossoverMonth / 12 : null;
  const horizonYears = Math.round(result.horizonMonths / 12);

  return (
    <div className="space-y-10">
      <PageHeader
        index="[04·02]" eyebrow="Forecast" title="FIRE projection"
        body={`Both the deterministic linear projection and the engine's median-path projection toward your ${fmtMoneyCompact(target)} FIRE target.`}
      />

      {/* ── [A] Headline ──────────────────────────────────────── */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard index="·" label="PROGRESS" value={fire.progressPct ?? 0} format="percent"
          sub={`${fmtMoneyCompact(wealth.accessibleWealth)} / ${fmtMoneyCompact(target)}`} />
        <KpiCard index="·" label="GAP" value={fire.gap ?? 0} format="moneyCompact" />
        <KpiCard index="·" label="LINEAR ETA"
          value={fire.estYearsToFire ?? 0} format="raw"
          sub={fire.estYearsToFire != null ? `${fmtNumber(fire.estYearsToFire, 1)} yrs at today's surplus` : "—"} />
        <KpiCard index="·" label="ENGINE ETA"
          value={crossoverYears ?? 0} format="raw"
          sub={crossoverYears != null
            ? `${fmtNumber(crossoverYears, 1)} yrs · median path crosses target`
            : `Not within ${horizonYears}y horizon`}
          tone={crossoverYears == null ? "warning" : "positive"} />
      </section>

      {/* ── [B] Two-method comparison ─────────────────────────── */}
      <SurfaceCard>
        <CardHeader index="[B·1]" eyebrow="Two methods" title="Linear vs engine projection" />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          The linear path assumes today's surplus is invested at your assumption return rate, no volatility. The engine path is the median across {result.simulationCount.toLocaleString()} simulated futures with full tax, debt, and stochastic returns.
        </p>
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <div className="syslabel">
              <span className="syslabel-bracket">[B·1·a]</span>
              <span>Linear (deterministic)</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
              <MetricRow label="Method" value="Surplus × return assumption" />
              <MetricRow label="Years to FIRE" value={fire.estYearsToFire != null ? `${fmtNumber(fire.estYearsToFire, 1)} yrs` : "—"} />
              <MetricRow label="Volatility" value="None (point estimate)" />
              <MetricRow label="Use for" value="Quick sanity check" />
            </div>
          </div>
          <div>
            <div className="syslabel">
              <span className="syslabel-bracket">[B·1·b]</span>
              <span>Engine (Monte-Carlo median)</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
              <MetricRow label="Method" value={`${result.simulationCount.toLocaleString()}-sim median`} />
              <MetricRow label="Years to FIRE" value={crossoverYears != null ? `${fmtNumber(crossoverYears, 1)} yrs` : `Beyond ${horizonYears}y`} />
              <MetricRow label="Volatility" value="Stochastic returns + rates" />
              <MetricRow label="Use for" value="Decision-grade answer" />
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* ── [C] Trajectory bar ────────────────────────────────── */}
      <SurfaceCard>
        <CardHeader index="[B·2]" eyebrow="Visual" title="Progress to target" />
        <div className="mt-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-display-sm text-ink-primary tabular">{fmtPercent(fire.progressPct ?? 0)}</span>
            <span className="text-caption text-ink-tertiary">{fmtMoney(wealth.accessibleWealth)} of {fmtMoney(target)}</span>
          </div>
          <div className="h-3 rounded-full bg-bg-inset overflow-hidden">
            <div className="h-full bg-ember-500" style={{ width: `${Math.min(100, Math.round((fire.progressPct ?? 0) * 100))}%` }} />
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}

function LinearFireOnly({ snap, householdId }: { snap: Awaited<ReturnType<typeof getSnapshot>>; householdId: string }) {
  const { fire, wealth } = snap;
  return (
    <>
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard index="·" label="PROGRESS" value={fire.progressPct ?? 0} format="percent" />
        <KpiCard index="·" label="GAP" value={fire.gap ?? 0} format="moneyCompact" />
        <KpiCard index="·" label="LINEAR ETA" value={fire.estYearsToFire ?? 0} format="raw"
          sub={fire.estYearsToFire != null ? `${fmtNumber(fire.estYearsToFire, 1)} yrs at today's surplus` : "—"} />
        <KpiCard index="·" label="ACCESSIBLE WEALTH" value={wealth.accessibleWealth} format="moneyCompact" />
      </section>
      <EmptyState
        index="·" eyebrow="Engine projection unavailable"
        title="Add income + expenses + an asset to activate the engine projection"
        body={`Still missing: ${snap.engineReadiness.blockers.join(", ")}.`}
        ctaLabel="Open Snapshot" ctaHref={`/workspace/${householdId}/overview`}
      />
    </>
  );
}
