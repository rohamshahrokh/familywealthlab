"use client";

import * as React from "react";
import { SurfaceCard, CardHeader } from "@/components/workspace/cards";
import { MetricCard } from "@/components/workspace/charts-interactive";
import {
  FinancialLineChart,
  AllocationDonutChart,
} from "@/components/workspace/charts-interactive";
import {
  snapshotPortfolio,
  projectPortfolioGrowth,
  allocationSlices,
  type Holding,
  type AssetClass,
} from "@/lib/finance/investmentEngine";
import { fmtMoney, fmtMoneyCompact, fmtPercent } from "@/components/workspace/format";

interface Props {
  assetClass: AssetClass;
  holdings: Holding[];
  title: string;
}

type TabKey = "portfolio" | "transactions" | "dca" | "planned" | "cashflow";

const TABS: { key: TabKey; label: string }[] = [
  { key: "portfolio",    label: "Portfolio" },
  { key: "transactions", label: "Transactions" },
  { key: "dca",          label: "DCA Schedules" },
  { key: "planned",      label: "Planned Orders" },
  { key: "cashflow",     label: "Cash Flow" },
];

const TOGGLE_GROUP =
  "inline-flex flex-wrap rounded-xl border border-line bg-bg-inset p-1 text-caption mono uppercase tracking-wider";
const TOGGLE = (active: boolean) =>
  `px-3 h-8 inline-flex items-center rounded-lg transition-colors duration-tactile ${
    active ? "bg-ink-primary text-white" : "text-ink-tertiary hover:text-ink-primary hover:bg-bg-base/60"
  }`;

export function PortfolioPanel({ assetClass, holdings, title }: Props) {
  const [tab, setTab] = React.useState<TabKey>("portfolio");
  const [horizon, setHorizon] = React.useState<5 | 10 | 20>(10);

  const snap = React.useMemo(
    () => snapshotPortfolio({ holdings }),
    [holdings],
  );

  const growth = React.useMemo(
    () => projectPortfolioGrowth({ holdings }, horizon, assetClass),
    [holdings, horizon, assetClass],
  );

  const slices = React.useMemo(
    () => allocationSlices({ holdings }).map((s) => ({ label: s.label, value: s.value })),
    [holdings],
  );

  // Planned-order summary: derive from DCA monthly × 12 as a placeholder
  const plannedBuysAnnual = snap.totalDcaMonthly * 12;
  const plannedSellsAnnual = 0;
  const netCashImpact = plannedSellsAnnual - plannedBuysAnnual;

  // Build top 3 series for FinancialLineChart from growth
  const topSymbols = snap.byHolding
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((r) => r.symbol);
  const xLabels = growth.map((p) => String(p.year));
  const totalSeries = {
    label: "Total",
    values: growth.map((p) => p.total),
    fill: true,
  };
  const compareSeries = topSymbols.map((sym) => ({
    label: sym,
    values: growth.map((p) => p.bySymbol[sym] ?? 0),
  }));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className={TOGGLE_GROUP}>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={TOGGLE(tab === t.key)}
              aria-pressed={tab === t.key}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "portfolio" && (
        <>
          {/* KPI grid */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard index="01" label="Portfolio Value" value={snap.totalValue} format="moneyCompact" />
            <MetricCard index="02" label="Cost Basis"      value={snap.costBasis}  format="moneyCompact" />
            <MetricCard
              index="03"
              label="Unrealised G/L"
              value={snap.unrealisedPnl}
              format="moneyCompact"
              tone={snap.unrealisedPnl >= 0 ? "positive" : "negative"}
            />
            <MetricCard
              index="04"
              label="G/L %"
              value={snap.unrealisedPnlPct}
              format="percent"
              tone={snap.unrealisedPnlPct >= 0 ? "positive" : "negative"}
            />
            <MetricCard
              index="05"
              label="Planned Buys (yr)"
              value={plannedBuysAnnual}
              format="moneyCompact"
              tone="neutral"
            />
            <MetricCard
              index="06"
              label="Planned Sells (yr)"
              value={plannedSellsAnnual}
              format="moneyCompact"
              tone="neutral"
            />
            <MetricCard
              index="07"
              label="Net Cash Impact"
              value={netCashImpact}
              format="moneyCompact"
              tone={netCashImpact >= 0 ? "positive" : "negative"}
            />
            <MetricCard
              index="08"
              label="DCA / mo"
              value={snap.totalDcaMonthly}
              format="moneyCompact"
              tone="neutral"
            />
          </section>

          {/* Holdings table */}
          <SurfaceCard>
            <CardHeader index="[A]" eyebrow="Holdings" title={`${title} positions`} />
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="text-caption mono uppercase tracking-wider text-ink-quaternary">
                    <th className="text-left py-2 pr-3 font-medium">Symbol</th>
                    <th className="text-right py-2 px-3 font-medium">Units</th>
                    <th className="text-right py-2 px-3 font-medium">Avg cost</th>
                    <th className="text-right py-2 px-3 font-medium">Price</th>
                    <th className="text-right py-2 px-3 font-medium">Value</th>
                    <th className="text-right py-2 px-3 font-medium">Cost</th>
                    <th className="text-right py-2 px-3 font-medium">G/L</th>
                    <th className="text-right py-2 px-3 font-medium">G/L %</th>
                    <th className="text-right py-2 pl-3 font-medium">Alloc.</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.byHolding.map((r, i) => {
                    const h = holdings[i];
                    return (
                      <tr key={r.symbol} className="border-t border-line">
                        <td className="py-2.5 pr-3 font-medium text-ink-primary">{r.symbol}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-ink-secondary">{h.units}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-ink-secondary">{fmtMoney(h.avgCost, 2)}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-ink-secondary">{fmtMoney(h.currentPrice, 2)}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-ink-primary">{fmtMoney(r.value)}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-ink-tertiary">{fmtMoney(r.cost)}</td>
                        <td
                          className={`py-2.5 px-3 text-right tabular-nums font-medium ${
                            r.pnl >= 0 ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {fmtMoney(r.pnl)}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right tabular-nums ${
                            r.pnlPct >= 0 ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {fmtPercent(r.pnlPct)}
                        </td>
                        <td className="py-2.5 pl-3 text-right tabular-nums text-ink-tertiary">{fmtPercent(r.allocation)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SurfaceCard>

          {/* Charts: Growth + Allocation */}
          <section className="grid lg:grid-cols-3 gap-4">
            <SurfaceCard className="lg:col-span-2">
              <div className="flex items-start justify-between gap-3 mb-4">
                <CardHeader index="[B]" eyebrow="Growth" title={`${title} value · ${horizon}Y projection`} />
                <div className={TOGGLE_GROUP}>
                  {[5, 10, 20].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHorizon(h as 5 | 10 | 20)}
                      className={TOGGLE(horizon === h)}
                    >
                      {h}Y
                    </button>
                  ))}
                </div>
              </div>
              <FinancialLineChart
                xLabels={xLabels}
                series={[totalSeries]}
                height={260}
                yFormat={fmtMoneyCompact}
              />
              <p className="mt-3 text-caption text-ink-quaternary">
                Modelling estimate · compounds expected return + DCA contributions annually.
              </p>
            </SurfaceCard>

            <SurfaceCard>
              <CardHeader index="[C]" eyebrow="Allocation" title="Current allocation" />
              <AllocationDonutChart
                slices={slices}
                centerLabel={fmtMoneyCompact(snap.totalValue)}
                centerSub="Total value"
              />
            </SurfaceCard>
          </section>

          {/* Comparison chart */}
          {compareSeries.length > 0 && (
            <SurfaceCard>
              <CardHeader index="[D]" eyebrow="Comparison" title={`Top ${compareSeries.length} positions · ${horizon}Y projection`} />
              <FinancialLineChart
                xLabels={xLabels}
                series={compareSeries}
                height={280}
                yFormat={fmtMoneyCompact}
              />
            </SurfaceCard>
          )}
        </>
      )}

      {tab === "transactions" && (
        <SurfaceCard>
          <CardHeader index="[T]" eyebrow="Transactions" title="Buy & sell history" />
          <p className="text-body text-ink-tertiary">
            Transaction sync activates once a brokerage connection is configured. Until then,
            you can import a CSV from your provider.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-bg-inset px-4 h-9 text-body-sm text-ink-secondary hover:text-ink-primary hover:bg-bg-base focus-ring"
          >
            Import CSV
          </button>
        </SurfaceCard>
      )}

      {tab === "dca" && (
        <SurfaceCard>
          <CardHeader index="[D]" eyebrow="DCA" title="Dollar-cost averaging schedules" />
          <ul className="space-y-2 text-body-sm">
            {snap.byHolding
              .filter((r) => r.dcaMonthly > 0)
              .map((r) => (
                <li
                  key={r.symbol}
                  className="flex items-center justify-between border-b border-line py-2.5"
                >
                  <span className="font-medium text-ink-primary">{r.symbol}</span>
                  <span className="text-ink-secondary">Monthly</span>
                  <span className="tabular-nums text-ink-primary">{fmtMoney(r.dcaMonthly)}</span>
                </li>
              ))}
            {snap.byHolding.filter((r) => r.dcaMonthly > 0).length === 0 && (
              <li className="text-ink-tertiary py-4">No active DCA schedules.</li>
            )}
          </ul>
          <div className="mt-4 text-caption text-ink-quaternary">
            Total: {fmtMoney(snap.totalDcaMonthly)} / month · {fmtMoney(snap.totalDcaMonthly * 12)} / year.
          </div>
        </SurfaceCard>
      )}

      {tab === "planned" && (
        <SurfaceCard>
          <CardHeader index="[P]" eyebrow="Planned" title="Planned orders" />
          <p className="text-body text-ink-tertiary">
            No planned orders yet. Add a planned buy or sell to model upcoming
            transactions in your cashflow forecast.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-4 h-9 text-body-sm font-medium hover:bg-graphite-800 focus-ring"
          >
            + Plan an order
          </button>
        </SurfaceCard>
      )}

      {tab === "cashflow" && (
        <SurfaceCard>
          <CardHeader index="[$]" eyebrow="Cash flow" title="DCA + planned orders impact" />
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="card-inset rounded-xl p-4">
              <div className="syslabel">Outflow / yr</div>
              <div className="num text-h5 text-rose-700 mt-2">
                {fmtMoney(plannedBuysAnnual)}
              </div>
              <p className="text-caption text-ink-tertiary mt-1">DCA contributions</p>
            </div>
            <div className="card-inset rounded-xl p-4">
              <div className="syslabel">Inflow / yr</div>
              <div className="num text-h5 text-emerald-700 mt-2">
                {fmtMoney(plannedSellsAnnual)}
              </div>
              <p className="text-caption text-ink-tertiary mt-1">Planned sells</p>
            </div>
            <div className="card-inset rounded-xl p-4">
              <div className="syslabel">Net / yr</div>
              <div
                className={`num text-h5 mt-2 ${
                  netCashImpact >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {fmtMoney(netCashImpact)}
              </div>
              <p className="text-caption text-ink-tertiary mt-1">Net cash impact</p>
            </div>
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
