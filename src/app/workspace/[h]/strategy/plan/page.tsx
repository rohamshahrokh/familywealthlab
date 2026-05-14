import { getSessionUser } from "@/lib/auth";
import { getSnapshot } from "@/lib/snapshot";
import { getEntitlements } from "@/lib/billing";
import {
  SurfaceCard, CardHeader, KpiCard, MetricRow, EmptyState,
} from "@/components/workspace/cards";
import { PageHeader } from "@/components/workspace/PageHeader";
import { FeatureGate } from "@/components/workspace/billing/FeatureGate";
import { fmtMoney, fmtPercent, fmtNumber } from "@/components/workspace/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Financial plan — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * Financial Plan — synthesis layer that reads Snapshot ONLY and reorganises
 * the deterministic ledger numbers into a personal-finance narrative:
 *
 *   • Net wealth + accessible / locked breakdown
 *   • Cashflow surplus + saving rate
 *   • Emergency buffer + FIRE trajectory
 *   • Highest-leverage area to act on (derived from blockers, not invented)
 *
 * No new financial logic. If a value is null in Snapshot, the tile shows an
 * empty state — never a placeholder zero.
 */
export default async function StrategyPlanPage({ params }: Props) {
  await getSessionUser();
  const ents = await getEntitlements(params.h);
  if (!ents.features.has("strategy.plan")) {
    return (
      <div className="space-y-8">
        <PageHeader
          index="[03·01]" eyebrow="Strategy" title="Financial plan"
          body="A single-page synthesis of where your household stands and the highest-leverage areas to act on next."
        />
        <FeatureGate
          feature="strategy.plan"
          currentTier={ents.tier}
          bullets={[
            "Wealth & cashflow summary derived from your ledger.",
            "Saving-rate + buffer health + FIRE trajectory in one glance.",
            "Highest-leverage next action ranked from your data.",
          ]}
        />
      </div>
    );
  }

  const snap = await getSnapshot(params.h);
  const { wealth, cashflow, fire, emergencyBuffer, engineReadiness } = snap;
  const savingsRate = cashflow.monthlyIncome > 0
    ? cashflow.monthlySurplus / cashflow.monthlyIncome
    : null;

  return (
    <div className="space-y-10">
      <PageHeader
        index="[03·01]" eyebrow="Strategy" title="Financial plan"
        body="A single-page synthesis of where your household stands and the highest-leverage areas to act on next. All numbers are deterministic — they come from your ledger, not an estimate."
      />

      {/* ── [A] Wealth ──────────────────────────────────────────── */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard index="·" label="NET WORTH" value={wealth.netWorth} format="moneyCompact" />
        <KpiCard index="·" label="ACCESSIBLE" value={wealth.accessibleWealth} format="moneyCompact"
          sub="Cash · investments · property equity" />
        <KpiCard index="·" label="LOCKED (SUPER)" value={wealth.lockedRetirementWealth} format="moneyCompact"
          sub="Preservation-restricted" />
        <KpiCard index="·" label="MONTHLY SURPLUS" value={cashflow.monthlySurplus} format="money"
          tone={cashflow.monthlySurplus > 0 ? "positive" : cashflow.monthlySurplus < 0 ? "negative" : "neutral"} />
      </section>

      {/* ── [B] Saving-rate + buffer ──────────────────────────── */}
      <section className="grid lg:grid-cols-2 gap-4">
        <SurfaceCard>
          <CardHeader index="[B·1]" eyebrow="Behavioural" title="Saving rate" />
          <p className="text-caption text-ink-tertiary -mt-2 mb-4">
            Surplus as a share of monthly income — the single best predictor of long-run wealth velocity.
          </p>
          {savingsRate == null ? (
            <EmptyState index="·" eyebrow="Awaiting input"
              title="Add income to compute saving rate"
              body="The saving rate is monthly surplus divided by monthly income. Once both are recorded, this tile activates."
              ctaLabel="Add income" ctaHref={`/workspace/${params.h}/input/income`} />
          ) : (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-display-sm text-ink-primary tabular">{fmtPercent(savingsRate)}</span>
                <SavingsBadge rate={savingsRate} />
              </div>
              <div className="mt-3 h-2 rounded-full bg-bg-inset overflow-hidden">
                <div className="h-full bg-ember-500"
                  style={{ width: `${Math.min(100, Math.max(0, Math.round(savingsRate * 100)))}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-4">
                <MetricRow label="Income (mo)" value={fmtMoney(cashflow.monthlyIncome)} />
                <MetricRow label="Expenses (mo)" value={fmtMoney(cashflow.monthlyExpenses)} />
                <MetricRow label="Debt service (mo)" value={fmtMoney(cashflow.monthlyDebtService)} />
                <MetricRow label="Surplus (mo)" value={fmtMoney(cashflow.monthlySurplus)} />
              </div>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <CardHeader index="[B·2]" eyebrow="Resilience" title="Emergency buffer" />
          <p className="text-caption text-ink-tertiary -mt-2 mb-4">
            Months of expenses your cash today covers. Target {emergencyBuffer.targetMonths} months from your assumptions.
          </p>
          {emergencyBuffer.monthsCovered == null ? (
            <EmptyState index="·" eyebrow="Awaiting input"
              title="Add expenses + cash to compute"
              body="Buffer needs both monthly expenses and a current cash balance."
              ctaLabel="Add cash" ctaHref={`/workspace/${params.h}/wealth/cash`} />
          ) : (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-display-sm text-ink-primary tabular">{fmtNumber(emergencyBuffer.monthsCovered, 1)}<span className="text-body text-ink-tertiary"> mo</span></span>
                <span className="text-caption text-ink-tertiary">target {emergencyBuffer.targetMonths} mo</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-bg-inset overflow-hidden">
                <div className={`h-full ${emergencyBuffer.state === "ok" ? "bg-emerald-500" : emergencyBuffer.state === "warning" ? "bg-ember-500" : "bg-rose-500"}`}
                  style={{ width: `${Math.min(100, Math.round((emergencyBuffer.monthsCovered / emergencyBuffer.targetMonths) * 100))}%` }} />
              </div>
            </div>
          )}
        </SurfaceCard>
      </section>

      {/* ── [C] FIRE trajectory + next action ─────────────────── */}
      <section className="grid lg:grid-cols-2 gap-4">
        <SurfaceCard>
          <CardHeader index="[C·1]" eyebrow="FIRE" title="Trajectory to financial independence" />
          {fire.targetAmount == null ? (
            <EmptyState index="·" eyebrow="Awaiting input"
              title="Set a FIRE target"
              body="Define a target amount and age in your assumptions to activate the trajectory."
              ctaLabel="Set assumptions" ctaHref={`/workspace/${params.h}/settings/assumptions`} />
          ) : (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-display-sm text-ink-primary tabular">{fmtPercent(fire.progressPct ?? 0)}</span>
                <span className="text-caption text-ink-tertiary">{fmtMoney(wealth.accessibleWealth)} / {fmtMoney(fire.targetAmount)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <MetricRow label="Gap" value={fire.gap != null ? fmtMoney(fire.gap) : "—"} />
                <MetricRow label="Est. years to FIRE" value={fire.estYearsToFire != null ? `${fmtNumber(fire.estYearsToFire, 1)} yrs` : "—"} />
                <MetricRow label="Target age" value={fire.targetAge != null ? `${fire.targetAge} yrs` : "—"} />
                <MetricRow label="Method" value="Linear · pre-MC" />
              </div>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <CardHeader index="[C·2]" eyebrow="Highest-leverage" title="What to focus on next" />
          <p className="text-caption text-ink-tertiary -mt-2 mb-4">
            Derived from your engine readiness blockers — no invented advice.
          </p>
          {engineReadiness.blockers.length === 0 ? (
            <EmptyState index="·" eyebrow="All clear" title="Engine fully unlocked"
              body="Every downstream engine has enough inputs to run. The Decision Engine surface ranks specific actions from there." />
          ) : (
            <ul className="space-y-2">
              {engineReadiness.blockers.map((b) => (
                <li key={b} className="flex items-start gap-2 text-body-sm text-ink-primary">
                  <span className="syslabel-bracket mt-0.5">·</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}

function SavingsBadge({ rate }: { rate: number }) {
  const m = rate >= 0.3
    ? { label: "Strong", cls: "bg-emerald-50 text-emerald-700" }
    : rate >= 0.15
      ? { label: "Healthy", cls: "bg-ember-50 text-ember-700" }
      : rate >= 0
        ? { label: "Building", cls: "bg-bg-inset text-ink-tertiary" }
        : { label: "Deficit", cls: "bg-rose-50 text-rose-700" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-caption font-medium ${m.cls}`}>{m.label}</span>;
}
