import { getCommandCentre } from "@/lib/dashboard";
import { getSessionUser } from "@/lib/auth";
import { SurfaceCard, CardHeader, KpiCard, MetricRow, EmptyState } from "@/components/workspace/cards";
import { fmtMoney, fmtMoneyCompact, fmtPercent } from "@/components/workspace/format";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Overview — Family Wealth Lab",
};

interface Props {
  params: { h: string };
}

export default async function OverviewPage({ params }: Props) {
  const session = await getSessionUser();
  const command = await getCommandCentre(params.h);
  const first = session?.profile?.display_name?.split(" ")[0] ?? "there";

  const { availability } = command;
  const hasAnyData = !availability.allEmpty;

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
              Live
            </span>
          </div>
          <h1 className="text-h2 text-ink-primary tracking-tight text-balance">
            Welcome back, {first}.
          </h1>
          <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
            {hasAnyData
              ? "Your ledger drives every figure below. The Decision Engine reads from the same numbers — no duplicate inputs, no drift."
              : "Your workspace is provisioned and ready. Add a few ledger entries and the Decision Engine starts working on your behalf."}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/workspace/${params.h}/wealth/properties`}
              className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-5 h-10 text-body-sm font-medium hover:bg-graphite-800 transition-colors focus-ring"
            >
              {hasAnyData ? "Edit ledger" : "Start the ledger"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/workspace/${params.h}/decision`}
              className="inline-flex items-center gap-2 rounded-full bg-ember-500 text-white px-5 h-10 text-body-sm font-medium hover:bg-ember-600 transition-colors focus-ring"
            >
              <Sparkles className="h-4 w-4" />
              Open Decision Engine
            </Link>
          </div>
        </div>
      </section>

      {/* ── [02] KPI row ─────────────────────────────────────────── */}
      <section>
        <div className="syslabel mb-4">
          <span className="syslabel-bracket">[02]</span>
          <span>Today</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard
            index="·"
            label="NET WORTH"
            value={command.netWorth.netWorth}
            format="moneyCompact"
            sub="Property + investments + cash − debt"
          />
          <KpiCard
            index="·"
            label="MONTHLY SURPLUS"
            value={command.monthlySurplus}
            format="money"
            sub={`Income ${fmtMoneyCompact(command.monthlyIncome)} · Out ${fmtMoneyCompact(command.monthlyExpenses + command.monthlyDebtService)}`}
            tone={command.monthlySurplus >= 0 ? "positive" : "negative"}
          />
          <KpiCard
            index="·"
            label="INVESTMENTS"
            value={command.totalInvestments}
            format="moneyCompact"
            sub="Stocks + crypto + settled IPs"
          />
          <KpiCard
            index="·"
            label="PROPERTY EQUITY"
            value={command.propertyEquity}
            format="moneyCompact"
            sub={`Debt ${fmtMoneyCompact(command.debtBalance)}`}
          />
        </div>
      </section>

      {/* ── [03] Decision tease ──────────────────────────────────── */}
      <section>
        <div className="syslabel mb-4">
          <span className="syslabel-bracket">[03]</span>
          <span>Decision Engine</span>
        </div>
        <Link
          href={`/workspace/${params.h}/decision`}
          className="block card-surface p-6 sm:p-8 hover:shadow-lg transition-shadow focus-ring"
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 mb-3 text-caption text-ember-600 font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                CENTRAL INTELLIGENCE LAYER
              </div>
              <h3 className="text-h5 sm:text-h4 font-semibold text-ink-primary tracking-tight">
                Run a baseline projection on your current position.
              </h3>
              <p className="mt-2 text-body-sm text-ink-tertiary max-w-2xl text-pretty">
                A deterministic Monte Carlo over your ledger — projected net
                worth, survival probability, and the first set of
                recommendations the engine surfaces.
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <div className="syslabel mb-1.5 justify-end">
                <span className="syslabel-bracket">→</span>
                <span>Open</span>
              </div>
              <div className="num text-h4 font-semibold text-ink-primary">10y</div>
              <div className="text-caption text-ink-quaternary">deterministic horizon</div>
            </div>
          </div>
        </Link>
      </section>

      {/* ── [04] Position detail (replaces forecast sparkline; render-safe with zero data) ── */}
      <section className="grid lg:grid-cols-2 gap-5">
        <SurfaceCard>
          <CardHeader index="[04A]" eyebrow="Position" title="Net worth breakdown" />
          <div className="-mx-1">
            <MetricRow label="Property equity" value={fmtMoney(command.propertyEquity)} />
            <div className="hairline mx-1" />
            <MetricRow label="Investments" value={fmtMoney(command.totalInvestments)} />
            <div className="hairline mx-1" />
            <MetricRow label="Cash" value={fmtMoney(command.cashToday)} />
            <div className="hairline mx-1" />
            <MetricRow label="Super" value={fmtMoney(command.superCombined)} />
            <div className="hairline mx-1" />
            <MetricRow
              label="Less: total debt"
              value={fmtMoney(-1 * command.netWorth.totalLiabilities)}
              tone="negative"
              hint="PPOR + IP loans + other debts"
            />
            <div className="hairline-strong mx-1 my-1" />
            <MetricRow
              label={<span className="font-semibold text-ink-primary">Net worth</span>}
              value={<span className="font-semibold text-ink-primary">{fmtMoney(command.netWorth.netWorth)}</span>}
            />
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <CardHeader index="[04B]" eyebrow="Cashflow" title="Monthly position" />
          <div className="-mx-1">
            <MetricRow label="Income (avg)" value={fmtMoney(command.monthlyIncome)} tone="positive" />
            <div className="hairline mx-1" />
            <MetricRow label="Living expenses" value={fmtMoney(-1 * command.monthlyExpenses)} />
            <div className="hairline mx-1" />
            <MetricRow
              label="Debt service"
              value={fmtMoney(-1 * command.monthlyDebtService)}
              hint="PPOR + IP loans + non-property"
            />
            <div className="hairline-strong mx-1 my-1" />
            <MetricRow
              label={<span className="font-semibold text-ink-primary">Surplus</span>}
              value={
                <span
                  className={
                    command.monthlySurplus >= 0
                      ? "font-semibold text-emerald-700"
                      : "font-semibold text-rose-700"
                  }
                >
                  {fmtMoney(command.monthlySurplus)}
                </span>
              }
            />
            {command.monthlyIncome > 0 && (
              <div className="mt-3 px-1">
                <div className="text-caption text-ink-quaternary mb-1">
                  Savings rate · {fmtPercent(command.monthlySurplus / command.monthlyIncome)}
                </div>
                <div className="h-1.5 w-full bg-bg-inset rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ember-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, (command.monthlySurplus / command.monthlyIncome) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </SurfaceCard>
      </section>

      {/* ── [05] Data health ─────────────────────────────────────── */}
      <section>
        <div className="syslabel mb-4">
          <span className="syslabel-bracket">[05]</span>
          <span>Data health</span>
        </div>
        {!hasAnyData ? (
          <EmptyState
            index="·"
            eyebrow="No ledger entries yet"
            title="Your engine needs at least one ledger entry to run."
            body="Start by adding a property, income source, or your monthly expenses. The Decision Engine activates as soon as one signal exists."
            ctaLabel="Add your first property"
            ctaHref={`/workspace/${params.h}/wealth/properties`}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <DataChip label="Income" present={availability.hasIncome} />
            <DataChip label="Expenses" present={availability.hasExpenses} />
            <DataChip label="Properties" present={availability.hasProperties} />
            <DataChip label="Investments" present={availability.hasInvestments} />
          </div>
        )}
      </section>
    </div>
  );
}

function DataChip({ label, present }: { label: string; present: boolean }) {
  return (
    <div
      className={`card-surface px-4 py-3 flex items-center justify-between border ${
        present ? "border-emerald-200" : "border-line"
      }`}
    >
      <span className="text-body-sm text-ink-secondary">{label}</span>
      <span
        className={`text-caption font-medium ${
          present ? "text-emerald-700" : "text-ink-quaternary"
        }`}
      >
        {present ? "● Connected" : "○ Empty"}
      </span>
    </div>
  );
}
