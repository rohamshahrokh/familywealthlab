import Link from "next/link";
import { ArrowUpRight, Sparkles, AlertTriangle, CheckCircle2, Hourglass, CalendarClock } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getSnapshot } from "@/lib/snapshot";
import {
  SurfaceCard, CardHeader, KpiCard, MetricRow, EmptyState,
} from "@/components/workspace/cards";
import { fmtMoney, fmtMoneyCompact, fmtPercent, fmtNumber } from "@/components/workspace/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Overview — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * Overview / Command Centre — reads ONLY from `getSnapshot`. No re-derivation,
 * no engine calls here. If the Snapshot doesn't have a value, the tile shows
 * an empty state with a CTA to the relevant input page. Nothing is invented.
 */
export default async function OverviewPage({ params }: Props) {
  const session = await getSessionUser();
  const snap = await getSnapshot(params.h);
  const first = session?.profile?.display_name?.split(" ")[0] ?? "there";

  const wealth = snap.wealth;
  const cf = snap.cashflow;
  const fire = snap.fire;
  const buffer = snap.emergencyBuffer;
  const hasAnyData = wealth.netWorth !== 0 || cf.monthlyIncome !== 0 ||
    cf.monthlyExpenses !== 0 || wealth.cashToday !== 0;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* ── [01] Welcome ─────────────────────────────────────────── */}
      <section className="card-cinematic p-7 sm:p-10 relative overflow-hidden">
        <div className="absolute inset-0 ember-glow pointer-events-none" aria-hidden />
        <div className="relative">
          <div className="syslabel mb-4">
            <span className="syslabel-bracket">[01]</span>
            <span>Command Centre</span>
            <span className="text-ink-quinary">·</span>
            <span className="inline-flex items-center gap-1.5 text-ink-tertiary">
              <span className="live-dot-ember" aria-hidden />
              {hasAnyData ? "Live" : "Awaiting data"}
            </span>
          </div>
          <h1 className="text-h2 text-ink-primary tracking-tight text-balance">
            Welcome back, {first}.
          </h1>
          <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
            {hasAnyData
              ? "Your ledger drives every figure below. The Decision Engine, Forecast Engine, and FIRE projections all read from the same Snapshot — no duplicate inputs, no drift."
              : "Your workspace is provisioned. Add a few ledger entries and every tile below populates from your own numbers — never demo data."}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={`/workspace/${params.h}/wealth/cash`}
              className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-5 h-10 text-body-sm font-medium hover:bg-graphite-800 transition-colors focus-ring">
              {hasAnyData ? "Edit ledger" : "Start the ledger"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={`/workspace/${params.h}/decision`}
              className="inline-flex items-center gap-2 rounded-full bg-ember-500 text-white px-5 h-10 text-body-sm font-medium hover:bg-ember-600 transition-colors focus-ring">
              <Sparkles className="h-4 w-4" />
              Open Decision Engine
            </Link>
          </div>
        </div>
      </section>

      {/* ── [02] Headline KPIs ───────────────────────────────────── */}
      <section>
        <div className="syslabel mb-4"><span className="syslabel-bracket">[02]</span><span>Headline</span></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard index="·" label="NET WORTH" value={wealth.netWorth} format="moneyCompact"
            sub="Assets − liabilities (ledger)" />
          <KpiCard index="·" label="ACCESSIBLE WEALTH" value={wealth.accessibleWealth} format="moneyCompact"
            sub="Liquid + property equity, excl. super" />
          <KpiCard index="·" label="LOCKED RETIREMENT" value={wealth.lockedRetirementWealth} format="moneyCompact"
            sub="Super, preservation-locked" />
          <KpiCard index="·" label="MONTHLY SURPLUS"
            value={cf.monthlySurplus} format="money"
            tone={cf.monthlySurplus > 0 ? "positive" : cf.monthlySurplus < 0 ? "negative" : "neutral"}
            sub={cf.monthlyIncome ? `${fmtMoney(cf.monthlyIncome)} in · ${fmtMoney(cf.monthlyExpenses)} out` : "No income/expense data"} />
        </div>
      </section>

      {/* ── [03] Wealth composition ──────────────────────────────── */}
      <section>
        <div className="syslabel mb-4"><span className="syslabel-bracket">[03]</span><span>Wealth composition</span></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard index="·" label="CASH TODAY" value={wealth.cashToday} format="moneyCompact"
            sub="From cash & offset ledgers"
            href={`/workspace/${params.h}/wealth/cash`} />
          <KpiCard index="·" label="PROPERTY EQUITY" value={wealth.propertyEquity} format="moneyCompact"
            sub="Market − loan balances"
            href={`/workspace/${params.h}/wealth/properties`} />
          <KpiCard index="·" label="INVESTMENTS" value={wealth.investments} format="moneyCompact"
            sub="Stocks + crypto" />
          <KpiCard index="·" label="DEBT BALANCE" value={wealth.debtBalance} format="moneyCompact"
            tone={wealth.debtBalance > 0 ? "warning" : "neutral"}
            sub={`Property loans ${fmtMoney(wealth.debtSplit.propertyLoans)} · Other ${fmtMoney(wealth.debtSplit.otherLiabilities)}`}
            href={`/workspace/${params.h}/wealth/liabilities`} />
        </div>
      </section>

      {/* ── [04] FIRE & emergency buffer ──────────────────────────── */}
      <section className="grid lg:grid-cols-2 gap-4">
        <SurfaceCard>
          <CardHeader index="[04·A]" eyebrow="FIRE" title="FIRE progress" />
          <p className="text-caption text-ink-tertiary -mt-2 mb-4">Liquid net-worth path to financial independence.</p>
          {fire.targetAmount == null ? (
            <EmptyState index="·" eyebrow="Awaiting input" title="FIRE target not set"
              body="Set a FIRE target in the Assumptions centre to enable progress tracking and projection."
              ctaLabel="Set target" ctaHref={`/workspace/${params.h}/settings/assumptions`} />
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-display-sm text-ink-primary tabular">{fmtPercent(fire.progressPct ?? 0)}</span>
                  <span className="text-caption text-ink-tertiary">{fmtMoney(wealth.accessibleWealth)} / {fmtMoney(fire.targetAmount)}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-bg-inset overflow-hidden">
                  <div className="h-full bg-ember-500" style={{ width: `${Math.round((fire.progressPct ?? 0) * 100)}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <MetricRow label="Gap to target" value={fire.gap != null ? fmtMoney(fire.gap) : "—"} />
                <MetricRow label="Est. years to FIRE"
                  value={fire.estYearsToFire != null ? `${fmtNumber(fire.estYearsToFire, 1)} yrs` : "—"} />
                <MetricRow label="Target age" value={fire.targetAge != null ? `${fire.targetAge} yrs` : "—"} />
                <MetricRow label="Method" value="Linear · pre-MC" />
              </div>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <CardHeader index="[04·B]" eyebrow="Buffer" title="Emergency buffer" />
          <p className="text-caption text-ink-tertiary -mt-2 mb-4">Months of expenses covered by cash today.</p>
          {buffer.monthsCovered == null ? (
            <EmptyState index="·" eyebrow="Awaiting input" title="Add expenses to calculate"
              body="The buffer needs monthly expenses and cash today to derive months covered."
              ctaLabel="Add cash" ctaHref={`/workspace/${params.h}/wealth/cash`} />
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-display-sm text-ink-primary tabular">{fmtNumber(buffer.monthsCovered, 1)}<span className="text-body text-ink-tertiary"> mo</span></span>
                  <BufferBadge state={buffer.state} />
                </div>
                <div className="mt-3 h-2 rounded-full bg-bg-inset overflow-hidden">
                  <div className={`h-full ${buffer.state === "ok" ? "bg-emerald-500" : buffer.state === "warning" ? "bg-ember-500" : "bg-rose-500"}`}
                    style={{ width: `${Math.min(100, Math.round((buffer.monthsCovered / buffer.targetMonths) * 100))}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <MetricRow label="Target" value={`${buffer.targetMonths} mo`} />
                <MetricRow label="Cash today" value={fmtMoney(wealth.cashToday)} />
                <MetricRow label="Monthly expenses" value={fmtMoney(cf.monthlyExpenses)} />
                <MetricRow label="Coverage" value={fmtPercent(buffer.monthsCovered / buffer.targetMonths)} />
              </div>
            </div>
          )}
        </SurfaceCard>
      </section>

      {/* ── [05] Passive income · next event · decision ─────────── */}
      <section className="grid lg:grid-cols-3 gap-4">
        <SurfaceCard>
          <CardHeader index="[05·A]" eyebrow="Cashflow" title="Passive income" />
          <p className="text-caption text-ink-tertiary -mt-2 mb-4">Annualised — rent + dividends.</p>
          <div className="text-display-sm text-ink-primary tabular">{fmtMoney(cf.annualPassiveIncome)}</div>
          <p className="text-caption text-ink-tertiary mt-2">
            {cf.annualPassiveIncome > 0
              ? `${fmtMoney(Math.round(cf.annualPassiveIncome / 12))} per month at current rates.`
              : "No rental or dividend income recorded yet."}
          </p>
        </SurfaceCard>

        <SurfaceCard>
          <CardHeader index="[05·B]" eyebrow="Timeline" title="Next major event" />
          <p className="text-caption text-ink-tertiary -mt-2 mb-4">From your timeline.</p>
          {snap.nextMajorEvent ? (
            <div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-ember-50 text-ember-700 inline-flex items-center justify-center"><CalendarClock className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <div className="text-body font-medium text-ink-primary truncate">{snap.nextMajorEvent.name}</div>
                  <div className="text-caption text-ink-tertiary">{snap.nextMajorEvent.dateIso}{snap.nextMajorEvent.category ? ` · ${snap.nextMajorEvent.category}` : ""}</div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState index="·" eyebrow="Empty" title="No upcoming events"
              body="Add timeline events to see them surfaced on the Command Centre." />
          )}
        </SurfaceCard>

        <SurfaceCard>
          <CardHeader index="[05·C]" eyebrow="Decision" title="Decision Engine" />
          <p className="text-caption text-ink-tertiary -mt-2 mb-4">Live recommendation summary.</p>
          <DecisionSummaryCard householdId={params.h} canRun={snap.engineReadiness.canRunBaseline} />
        </SurfaceCard>
      </section>

      {/* ── [06] Data health + engine readiness ──────────────────── */}
      <section className="grid lg:grid-cols-2 gap-4">
        <SurfaceCard>
          <CardHeader index="[06·A]" eyebrow="Health" title="Data health" />
          <p className="text-caption text-ink-tertiary -mt-2 mb-4">What the engine can read today.</p>
          <div className="space-y-2">
            {snap.dataHealth.map((row) => (
              <div key={row.section} className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-bg-inset transition-colors">
                <div className="flex items-center gap-2">
                  {row.hasData
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    : <Hourglass className="h-4 w-4 text-ink-quaternary" />}
                  <span className="text-body-sm text-ink-primary capitalize">{row.section}</span>
                </div>
                <span className="text-caption text-ink-quaternary mono">
                  {row.rows} {row.rows === 1 ? "row" : "rows"}
                </span>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <CardHeader index="[06·B]" eyebrow="Readiness" title="Engine readiness" />
          <p className="text-caption text-ink-tertiary -mt-2 mb-4">Which downstream engines are unlocked.</p>
          <div className="space-y-2">
            <ReadinessRow label="Baseline forecast"   ready={snap.engineReadiness.canRunBaseline} />
            <ReadinessRow label="FIRE projection"     ready={snap.engineReadiness.canRunFire} />
            <ReadinessRow label="Monte Carlo"         ready={snap.engineReadiness.canRunMonteCarlo} />
            <ReadinessRow label="Goal Solver"         ready={snap.engineReadiness.canRunGoalSolver} />
          </div>
          {snap.engineReadiness.blockers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-line">
              <div className="text-caption text-ink-tertiary mb-1.5">To unlock more:</div>
              <ul className="space-y-1">
                {snap.engineReadiness.blockers.map((b) => (
                  <li key={b} className="text-caption text-ink-tertiary flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-ember-500 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SurfaceCard>
      </section>

      <footer className="text-caption text-ink-quaternary text-center pt-4">
        Snapshot v{snap.schemaVersion} · computed {new Date(snap.computedAtIso).toLocaleString("en-AU")} · fingerprint {snap.inputsFingerprint}
      </footer>
    </div>
  );
}

// ── helpers ────────────────────────────────────────────────────────────────

function BufferBadge({ state }: { state: "ok" | "warning" | "critical" | "unknown" }) {
  const map = {
    ok:       { label: "Healthy",  cls: "bg-emerald-50 text-emerald-700" },
    warning:  { label: "Below target", cls: "bg-ember-50 text-ember-700" },
    critical: { label: "Critical", cls: "bg-rose-50 text-rose-700" },
    unknown:  { label: "Unknown",  cls: "bg-bg-inset text-ink-tertiary" },
  } as const;
  const m = map[state];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-caption font-medium ${m.cls}`}>{m.label}</span>;
}

function ReadinessRow({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body-sm text-ink-primary">{label}</span>
      {ready
        ? <span className="text-caption text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Ready</span>
        : <span className="text-caption text-ink-quaternary inline-flex items-center gap-1"><Hourglass className="h-3.5 w-3.5" />Not yet</span>}
    </div>
  );
}

function DecisionSummaryCard({ householdId, canRun }: { householdId: string; canRun: boolean }) {
  if (!canRun) {
    return (
      <EmptyState index="·" eyebrow="Awaiting input" title="Engine waiting for inputs"
        body="The Decision Engine activates once income, expenses, and at least one asset are recorded." />
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-body-sm text-ink-tertiary text-pretty">
        Open the Decision Engine to see next-best-actions ranked from your ledger.
      </p>
      <Link href={`/workspace/${householdId}/decision`}
        className="inline-flex items-center gap-1.5 text-body-sm font-medium text-ember-600 hover:text-ember-700">
        Open Decision Engine <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
