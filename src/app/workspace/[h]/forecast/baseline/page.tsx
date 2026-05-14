import { getSessionUser } from "@/lib/auth";
import { getSnapshot } from "@/lib/snapshot";
import { getEntitlements } from "@/lib/billing";
import { runDecision } from "@/lib/engine/runDecision";
import {
  SurfaceCard, CardHeader, KpiCard, MetricRow, EmptyState,
} from "@/components/workspace/cards";
import { PageHeader } from "@/components/workspace/PageHeader";
import { FeatureGate } from "@/components/workspace/billing/FeatureGate";
import { fmtMoney, fmtMoneyCompact, fmtNumber } from "@/components/workspace/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Baseline forecast — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * Baseline forecast — reads the engine's median deterministic-baseline path
 * (no deltas applied). Surfaces the median net-worth and median cash paths
 * across the planning horizon. No fabricated numbers — every value comes
 * from a `runScenarioV2` call against the ledger.
 */
export default async function BaselineForecastPage({ params }: Props) {
  await getSessionUser();
  const ents = await getEntitlements(params.h);
  if (!ents.features.has("forecast.baseline")) {
    return (
      <div className="space-y-8">
        <PageHeader
          index="[04·01]" eyebrow="Forecast" title="Baseline forecast"
          body="The engine's median 10-year projection from your ledger — net worth and cash, no extra inputs needed."
        />
        <FeatureGate
          feature="forecast.baseline"
          currentTier={ents.tier}
          bullets={[
            "Median net-worth path across 200 simulated futures.",
            "Median cash path — see when liquidity peaks and dips.",
            "Deterministic seed per household — reproducible every time.",
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
          index="[04·01]" eyebrow="Forecast" title="Baseline forecast"
          body="The engine needs a minimum ledger before it can run a baseline."
        />
        <EmptyState
          index="·" eyebrow="Engine not ready"
          title="The baseline forecast can't run yet"
          body={`Still missing: ${snap.engineReadiness.blockers.join(", ")}. Add the remaining inputs and the engine activates automatically.`}
          ctaLabel="Open Snapshot" ctaHref={`/workspace/${params.h}/overview`}
        />
      </div>
    );
  }

  const { result } = await runDecision(params.h);
  const horizonYears = Math.round(result.horizonMonths / 12);
  const finalNwIdx = result.medianNwPath.length - 1;
  const finalCashIdx = result.medianCashPath.length - 1;
  const finalNw = finalNwIdx >= 0 ? result.medianNwPath[finalNwIdx] : null;
  const finalCash = finalCashIdx >= 0 ? result.medianCashPath[finalCashIdx] : null;
  const cagr = finalNw != null && result.initialNetWorth > 0
    ? Math.pow(finalNw / result.initialNetWorth, 1 / horizonYears) - 1
    : null;
  const nwDelta = finalNw != null ? finalNw - result.initialNetWorth : null;

  return (
    <div className="space-y-10">
      <PageHeader
        index="[04·01]" eyebrow="Forecast" title="Baseline forecast"
        body={`Median ${horizonYears}-year projection from ${result.simulationCount.toLocaleString()} simulated futures. No deltas applied — this is your trajectory if nothing changes.`}
      />

      {/* ── [A] Headline KPIs ─────────────────────────────────── */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard index="·" label="NET WORTH TODAY" value={result.initialNetWorth} format="moneyCompact" />
        <KpiCard index="·" label={`MEDIAN NW · ${horizonYears}y`} value={finalNw ?? 0} format="moneyCompact"
          sub={nwDelta != null ? `${nwDelta >= 0 ? "+" : ""}${fmtMoney(nwDelta)} vs today` : undefined}
          tone={nwDelta == null ? "neutral" : nwDelta >= 0 ? "positive" : "negative"} />
        <KpiCard index="·" label="MEDIAN CAGR" value={cagr ?? 0} format="percent"
          tone={cagr == null ? "neutral" : cagr >= 0 ? "positive" : "negative"} />
        <KpiCard index="·" label={`MEDIAN CASH · ${horizonYears}y`} value={finalCash ?? 0} format="moneyCompact" />
      </section>

      {/* ── [B] Net worth trajectory ──────────────────────────── */}
      <SurfaceCard>
        <CardHeader index="[B·1]" eyebrow="Trajectory" title="Median net-worth path" />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          Across {result.simulationCount.toLocaleString()} simulated paths, the median net worth at each month. No fan band here — see Monte Carlo for the dispersion.
        </p>
        <Sparkline points={result.medianNwPath} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-6">
          <MetricRow label="Today" value={fmtMoney(result.initialNetWorth)} />
          <MetricRow label={`Year ${Math.min(5, horizonYears)}`} value={fmtMoney(pathAt(result.medianNwPath, Math.min(60, result.medianNwPath.length - 1)))} />
          <MetricRow label={`Year ${horizonYears}`} value={finalNw != null ? fmtMoney(finalNw) : "—"} />
          <MetricRow label="CAGR" value={cagr != null ? `${fmtNumber(cagr * 100, 2)}%` : "—"} />
        </div>
      </SurfaceCard>

      {/* ── [C] Cash trajectory ────────────────────────────────── */}
      <SurfaceCard>
        <CardHeader index="[B·2]" eyebrow="Liquidity" title="Median cash path" />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          Cash on hand at each month in the median path. A flat or rising curve means your surplus is funding both investment and buffer; a falling curve means cash is being drawn down.
        </p>
        <Sparkline points={result.medianCashPath} tone="cash" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-6">
          <MetricRow label="Today" value={fmtMoneyCompact(snap.wealth.cashToday)} />
          <MetricRow label={`Year ${Math.min(5, horizonYears)}`} value={fmtMoneyCompact(pathAt(result.medianCashPath, Math.min(60, result.medianCashPath.length - 1)))} />
          <MetricRow label={`Year ${horizonYears}`} value={finalCash != null ? fmtMoneyCompact(finalCash) : "—"} />
          <MetricRow label="Surplus (mo)" value={fmtMoney(snap.cashflow.monthlySurplus)} />
        </div>
      </SurfaceCard>

      {/* ── [D] Engine notes ──────────────────────────────────── */}
      {result.warnings.length > 0 && (
        <SurfaceCard tone="inset">
          <CardHeader index="[D·1]" eyebrow="Diagnostic" title="Engine notes" />
          <ul className="mt-2 space-y-1 text-body-sm text-ink-secondary list-disc list-inside">
            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </SurfaceCard>
      )}
    </div>
  );
}

function pathAt(arr: number[], idx: number): number {
  if (!arr.length) return 0;
  const safe = Math.min(Math.max(0, idx), arr.length - 1);
  return arr[safe];
}

interface SparklineProps { points: number[]; tone?: "nw" | "cash" }
function Sparkline({ points, tone = "nw" }: SparklineProps) {
  if (points.length < 2) {
    return (
      <div className="h-32 rounded-lg bg-bg-inset flex items-center justify-center">
        <span className="text-caption text-ink-tertiary">Not enough data points</span>
      </div>
    );
  }
  const w = 800, h = 160, pad = 8;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const xStep = (w - pad * 2) / (points.length - 1);
  const path = points
    .map((y, i) => {
      const px = pad + i * xStep;
      const py = pad + (h - pad * 2) * (1 - (y - min) / range);
      return `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(" ");
  const areaPath = `${path} L${pad + (points.length - 1) * xStep},${h - pad} L${pad},${h - pad} Z`;
  const stroke = tone === "cash" ? "#0ea5b7" : "#d97706";
  const fill = tone === "cash" ? "#0ea5b7" : "#d97706";
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-32 rounded-lg bg-bg-inset">
        <path d={areaPath} fill={fill} opacity={0.08} />
        <path d={path} fill="none" stroke={stroke} strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
