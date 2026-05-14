import Link from "next/link";
import { ArrowUpRight, Sparkles, Activity } from "lucide-react";

import { PageHeader } from "@/components/workspace/PageHeader";
import { runDecision } from "@/lib/engine/runDecision";
import {
  deriveRecommendations,
  survivalFromResult,
  medianTerminalNw,
} from "@/lib/engine";
import { getCommandCentre } from "@/lib/dashboard";

import { SurfaceCard, CardHeader, EmptyState } from "@/components/workspace/cards";
import {
  DecisionHeader,
  RiskStrip,
  RecommendationCard,
  type RiskMetric,
} from "@/components/workspace/decision";
import { fmtMoney, fmtPercent } from "@/components/workspace/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Decision Engine — Family Wealth Lab",
};

interface Props {
  params: { h: string };
}

export default async function DecisionPage({ params }: Props) {

  const command = await getCommandCentre(params.h);
  const { availability } = command;

  // Empty-ledger short-circuit. Engine can technically run on zeros but the
  // output is meaningless — the UX honesty rule says we surface that here.
  if (availability.allEmpty) {
    return (
      <div className="space-y-8">
        <DecisionPageHeader />
        <EmptyState
          index="·"
          eyebrow="No ledger entries yet"
          title="The Decision Engine activates as soon as one ledger entry exists."
          body="Add a property, income source, or expense and re-open this page. The engine reads from your ledger directly — no duplicate inputs, no drift."
          ctaLabel="Add your first property"
          ctaHref={`/workspace/${params.h}/wealth/properties`}
        />
      </div>
    );
  }

  const { result } = await runDecision(params.h);

  const survivalPct = survivalFromResult(result);
  const terminalMedian = medianTerminalNw(result);
  const recommendations = deriveRecommendations(result);

  const riskMetrics: RiskMetric[] = [
    {
      label: "Default",
      value: result.defaultProbability ?? 0,
      warnAt: 0.05,
      dangerAt: 0.2,
      hint: "Probability of insolvency within horizon",
    },
    {
      label: "Liquidity stress",
      value: result.liquidityStressProbability ?? 0,
      warnAt: 0.1,
      dangerAt: 0.3,
      hint: "Paths that breach buffer floor",
    },
    {
      label: "Negative equity",
      value: result.negativeEquityProbability ?? 0,
      warnAt: 0.05,
      dangerAt: 0.2,
      hint: "Property < outstanding debt",
    },
    {
      label: "Refi pressure",
      value: result.refinancePressureProbability ?? 0,
      warnAt: 0.1,
      dangerAt: 0.3,
      hint: "LVR/DSR bands degrading",
    },
  ];

  const serv = result.serviceability;

  return (
    <div className="space-y-8 sm:space-y-10">
      <DecisionPageHeader />

      {/* ── [D01] Decision candidate ─────────────────────────────── */}
      <SurfaceCard className="p-7 sm:p-10">
        <DecisionHeader
          name="Baseline (Hold)"
          index="[D01]"
          survivalProbability={survivalPct}
          initialNetWorth={result.initialNetWorth}
          terminalNetWorthMedian={terminalMedian}
          horizonMonths={result.horizonMonths}
        />
      </SurfaceCard>

      {/* ── [D02] Risk strip ─────────────────────────────────────── */}
      <section>
        <div className="syslabel mb-4">
          <span className="syslabel-bracket">[D02]</span>
          <span>Stress probabilities</span>
          <span className="text-ink-quinary">·</span>
          <span className="inline-flex items-center gap-1.5 text-ink-tertiary">
            <Activity className="h-3 w-3" />
            {result.simulationCount.toLocaleString()} sims
          </span>
        </div>
        <RiskStrip metrics={riskMetrics} />
      </section>

      {/* ── [D03] Serviceability snapshot ────────────────────────── */}
      {serv && (
        <section>
          <div className="syslabel mb-4">
            <span className="syslabel-bracket">[D03]</span>
            <span>Serviceability</span>
          </div>
          <SurfaceCard className="p-5 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <ServiceTile label="Band" value={bandLabel(serv.band)} tone={bandTone(serv.band)} />
              <ServiceTile label="DSR" value={fmtPercent(serv.dsr)} />
              <ServiceTile label="LVR" value={fmtPercent(serv.lvr)} />
              <ServiceTile
                label="Max borrow"
                value={fmtMoney(serv.maxBorrowCapacity)}
                hint={`@ ${(serv.bufferedRate * 100).toFixed(2)}% buffered`}
              />
            </div>
            {serv.rationale?.length > 0 && (
              <ul className="mt-5 space-y-1.5 border-t border-line/60 pt-4">
                {serv.rationale.slice(0, 3).map((r, i) => (
                  <li key={i} className="text-caption text-ink-tertiary flex gap-2">
                    <span className="text-ink-quinary mt-0.5">·</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </SurfaceCard>
        </section>
      )}

      {/* ── [D04] Recommendations ────────────────────────────────── */}
      <section>
        <div className="syslabel mb-4">
          <span className="syslabel-bracket">[D04]</span>
          <span>Recommendations</span>
          <span className="text-ink-quinary">·</span>
          <span className="inline-flex items-center gap-1.5 text-ember-600">
            <Sparkles className="h-3 w-3" />
            Deterministic
          </span>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {recommendations.map((r, i) => (
            <RecommendationCard
              key={r.id}
              index={`[R${String(i + 1).padStart(2, "0")}]`}
              severity={r.severity}
              title={r.title}
              body={r.body}
              reason={r.reason}
              tags={r.tags}
            />
          ))}
        </div>
        <p className="mt-5 text-caption text-ink-quaternary max-w-3xl">
          Every line above is derived directly from engine output on your
          ledger — no Math.random, no calls home, no fabricated numbers. The
          same inputs always produce the same recommendations.
        </p>
      </section>

      {/* ── [D05] Footer rail ────────────────────────────────────── */}
      <section className="border-t border-line/60 pt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-caption text-ink-quaternary">
          Horizon · {Math.round(result.horizonMonths / 12)}y &nbsp;|&nbsp;
          Sims · {result.simulationCount.toLocaleString()} &nbsp;|&nbsp;
          Runtime · {result.runtimeMs}ms
        </p>
        <Link
          href={`/workspace/${params.h}/overview`}
          className="inline-flex items-center gap-2 text-body-sm font-medium text-ink-secondary hover:text-ink-primary focus-ring rounded-md"
        >
          Back to Command Centre
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    </div>
  );
}

function DecisionPageHeader() {
  return (
    <header>
      <div className="syslabel mb-3">
        <span className="syslabel-bracket">[D00]</span>
        <span>Decision Engine</span>
        <span className="text-ink-quinary">·</span>
        <span className="inline-flex items-center gap-1.5 text-ember-600">
          <span className="live-dot-ember" aria-hidden />
          Central intelligence
        </span>
      </div>
      <h1 className="text-h2 text-ink-primary tracking-tight text-balance">
        A deterministic projection on your current position.
      </h1>
      <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
        The engine reads from your ledger, runs a seeded Monte Carlo, and
        surfaces the recommendations it can defend with numbers. No drift, no
        hidden assumptions, no duplicate inputs.
      </p>
    </header>
  );
}

function ServiceTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "calm" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-rose-700"
      : tone === "warning"
        ? "text-ember-700"
        : "text-ink-primary";
  return (
    <div>
      <div className="text-caption text-ink-quaternary uppercase tracking-wider mb-1.5">
        {label}
      </div>
      <div className={`num text-h6 font-semibold ${toneClass}`}>{value}</div>
      {hint && <div className="text-caption text-ink-quaternary mt-1">{hint}</div>}
    </div>
  );
}

function bandLabel(b: "healthy" | "stretched" | "stressed") {
  switch (b) {
    case "healthy":
      return "Healthy";
    case "stretched":
      return "Stretched";
    case "stressed":
      return "Stressed";
  }
}

function bandTone(b: "healthy" | "stretched" | "stressed"): "calm" | "warning" | "danger" {
  switch (b) {
    case "healthy":
      return "calm";
    case "stretched":
      return "warning";
    case "stressed":
      return "danger";
  }
}
