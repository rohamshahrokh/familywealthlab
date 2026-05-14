/**
 * ProjectionTable — 15-year property projection table + AreaLine chart.
 * Pure server component. Uses projectCashflow from finance/property.ts.
 */

import * as React from "react";
import { projectCashflow, type CashflowYear } from "@/lib/finance/property";
import { AreaLine } from "@/components/workspace/charts";
import { fmtMoney, fmtPercent } from "@/components/workspace/format";

// AreaLine PALETTE indices: 0=#C97030(ember), 1=#7B6CF6(violet), 2=#3FA88F(teal)
const SERIES_COLORS = ["#C97030", "#7B6CF6", "#3FA88F"];
const CF_COLOR = "#5085D9";

interface ProjectionTableProps {
  property: Parameters<typeof projectCashflow>[0];
  years?: number;
}

export function ProjectionTable({ property, years = 15 }: ProjectionTableProps) {
  const rows = projectCashflow(property, years);

  // Build AreaLine series
  const xLabels = rows.map((r) => String(r.year));
  const series = [
    { label: "Value",  values: rows.map((r) => r.value),  color: SERIES_COLORS[0] },
    { label: "Loan",   values: rows.map((r) => r.loan),   color: SERIES_COLORS[1] },
    { label: "Equity", values: rows.map((r) => r.equity), color: SERIES_COLORS[2] },
  ];
  const cfRows = rows.map((r) => ({
    label: String(r.year),
    value: r.netCashflow,
    color: r.netCashflow >= 0 ? "#3FA88F" : "#C24A6B",
  }));

  return (
    <div className="space-y-6">
      {/* Value · Loan · Equity area chart */}
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          <AreaLine xLabels={xLabels} series={series} height={220} />
        </div>
      </div>

      {/* Net cashflow bar row */}
      <div>
        <p className="text-caption text-ink-quaternary mb-2">Net cashflow / year</p>
        <div className="space-y-1">
          {cfRows.map((r) => {
            const absMax = Math.max(...cfRows.map((x) => Math.abs(x.value)), 1);
            const pct = Math.min(100, (Math.abs(r.value) / absMax) * 100);
            return (
              <div key={r.label} className="flex items-center gap-2 text-caption">
                <span className="w-10 text-right text-ink-quaternary tabular-nums">{r.label}</span>
                <div className="flex-1 relative h-4 rounded overflow-hidden bg-bg-inset">
                  <div
                    className="absolute top-0 h-full rounded transition-all"
                    style={{ width: `${pct}%`, background: r.color }}
                  />
                </div>
                <span
                  className="w-20 text-right tabular-nums font-medium"
                  style={{ color: r.color }}
                >
                  {fmtMoney(r.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data table */}
      <div className="overflow-x-auto">
        <table className="w-full text-caption tabular-nums">
          <thead>
            <tr className="border-b border-line text-ink-quaternary">
              <th className="text-left py-2 pr-3 font-medium">Year</th>
              <th className="text-right py-2 px-2 font-medium">Value</th>
              <th className="text-right py-2 px-2 font-medium">Loan</th>
              <th className="text-right py-2 px-2 font-medium">Equity</th>
              <th className="text-right py-2 px-2 font-medium">LVR</th>
              <th className="text-right py-2 pl-2 font-medium">Net CF</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: CashflowYear, i: number) => (
              <tr
                key={r.year}
                className={`border-b border-line/50 ${i % 2 === 0 ? "" : "bg-bg-inset/30"}`}
              >
                <td className="py-1.5 pr-3 text-ink-secondary">{r.year}</td>
                <td className="py-1.5 px-2 text-right text-ink-primary">{fmtMoney(r.value)}</td>
                <td className="py-1.5 px-2 text-right text-ember-600">{fmtMoney(r.loan)}</td>
                <td className="py-1.5 px-2 text-right text-emerald-700">{fmtMoney(r.equity)}</td>
                <td className="py-1.5 px-2 text-right text-ink-tertiary">{fmtPercent(r.lvr / 100)}</td>
                <td
                  className="py-1.5 pl-2 text-right font-medium"
                  style={{ color: r.netCashflow >= 0 ? "#3FA88F" : "#C24A6B" }}
                >
                  {fmtMoney(r.netCashflow)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
