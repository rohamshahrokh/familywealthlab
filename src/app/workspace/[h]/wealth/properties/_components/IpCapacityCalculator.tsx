/**
 * IpCapacityCalculator — server component.
 * Reads snapshot data via buildDashboardInputs, runs the IP capacity formula
 * using URL params as inputs, and renders the results table + KPI tiles.
 *
 * The IpCapacityForm (client) updates URL params and this component
 * re-renders server-side — zero client-side state needed.
 */

import * as React from "react";
import { buildDashboardInputs } from "@/lib/dashboard/buildDashboardInputs";
import { estimateQldStampDuty } from "@/lib/finance/property";
import { KpiCard } from "@/components/workspace/cards";
import { MetricRow } from "@/components/workspace/cards";
import { fmtMoney, fmtPercent } from "@/components/workspace/format";
import { IpCapacityForm } from "./IpCapacityForm";

interface Props {
  householdId: string;
  basePath: string;
  searchParams: Record<string, string>;
}

const safeN = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v as string) : (v as number);
  return Number.isFinite(n) ? n : 0;
};

export async function IpCapacityCalculator({
  householdId,
  basePath,
  searchParams,
}: Props) {
  // ── Parse URL inputs ──────────────────────────────────────────────────────
  const targetPrice    = safeN(searchParams.ip_target_price ?? "750000");
  const months         = safeN(searchParams.ip_months ?? "12");
  const buffer         = safeN(searchParams.ip_buffer ?? "10000");
  const liqStocks      = searchParams.ip_liq_stocks === "1";
  const liqStocksPct   = safeN(searchParams.ip_liq_stocks_pct ?? "50") / 100;
  const liqCrypto      = searchParams.ip_liq_crypto === "1";
  const liqCryptoPct   = safeN(searchParams.ip_liq_crypto_pct ?? "50") / 100;

  // ── Pull snapshot data ────────────────────────────────────────────────────
  const inputs = await buildDashboardInputs(householdId);
  const snap   = inputs.snapshot ?? {};

  // Cash buckets from snapshot
  const cashOnHand  = safeN(snap.cash) + safeN(snap.savings_cash) + safeN(snap.emergency_cash) + safeN(snap.other_cash);
  const offsetBal   = safeN(snap.offset_balance);
  const availCash   = cashOnHand + offsetBal;

  // Monthly savings = income − expenses
  const monthlyIncome  = safeN(snap.monthly_income)
    || (inputs.incomeRecords ?? []).reduce((s: number, r: any) => s + safeN(r.amount), 0);
  const monthlyExpenses = safeN(snap.monthly_expenses)
    || (inputs.expenses ?? []).reduce((s: number, r: any) => s + safeN(r.amount), 0);
  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);

  // Stock + crypto liquidation
  const stockValue  = (inputs.stocks ?? []).reduce((s: number, r: any) => s + safeN(r.current_value ?? r.value), 0);
  const cryptoValue = (inputs.cryptos ?? []).reduce((s: number, r: any) => s + safeN(r.current_value ?? r.value), 0);
  const stockLiquid  = liqStocks  ? stockValue  * liqStocksPct  : 0;
  const cryptoLiquid = liqCrypto  ? cryptoValue * liqCryptoPct  : 0;

  // Stamp duty + acquisition costs estimate
  const stampDuty    = estimateQldStampDuty(targetPrice);
  const otherCosts   = 2000 + 800 + 1500; // legal + inspection + loan setup
  const totalCosts   = stampDuty + otherCosts;

  // ── Available funds formula ───────────────────────────────────────────────
  const savingsAccumulated = monthlySavings * months;
  const availableFunds =
    availCash
    + savingsAccumulated
    + stockLiquid
    + cryptoLiquid
    - buffer
    - totalCosts;

  // ── Derived results ───────────────────────────────────────────────────────
  const depositAmt    = Math.max(0, availableFunds);
  const depositPct    = targetPrice > 0 ? depositAmt / targetPrice : 0;
  const requiredLoan  = Math.max(0, targetPrice - depositAmt);
  const lvr           = targetPrice > 0 ? (requiredLoan / targetPrice) * 100 : 0;
  const min20pct      = targetPrice * 0.2;
  const isReady       = depositAmt >= min20pct;
  const shortfall     = Math.max(0, min20pct - depositAmt);
  const monthsToReady = monthlySavings > 0
    ? Math.ceil(shortfall / monthlySavings)
    : null;

  return (
    <details open={searchParams.ip_open === "1"} className="group">
      <summary className="cursor-pointer list-none select-none flex items-center justify-between gap-3 py-3">
        <div className="syslabel">
          <span className="syslabel-bracket">[IP·CAP]</span>
          <span>How much can you deploy? — IP Purchase Capacity</span>
        </div>
        <svg
          className="h-4 w-4 text-ink-quaternary transition-transform group-open:rotate-180 shrink-0"
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="pt-4 space-y-6">
        {/* ── Inputs form ──────────────────────────────────────────────── */}
        <IpCapacityForm basePath={basePath} />

        {/* ── Purchase Funds breakdown table ───────────────────────────── */}
        <div>
          <div className="syslabel mb-3">
            <span className="syslabel-bracket">[·]</span>
            <span>Purchase Funds Formula</span>
          </div>
          <div className="divide-y divide-line/60">
            <MetricRow label="Cash on hand"               value={fmtMoney(availCash)} tone="positive" />
            <MetricRow
              label={`Monthly savings × ${months} months`}
              value={fmtMoney(savingsAccumulated)}
              tone="positive"
              hint={`${fmtMoney(monthlySavings)}/mo × ${months} months`}
            />
            {liqStocks && (
              <MetricRow
                label={`Stock liquidation (${(liqStocksPct * 100).toFixed(0)}% of ${fmtMoney(stockValue)})`}
                value={fmtMoney(stockLiquid)}
                tone="positive"
              />
            )}
            {liqCrypto && (
              <MetricRow
                label={`Crypto liquidation (${(liqCryptoPct * 100).toFixed(0)}% of ${fmtMoney(cryptoValue)})`}
                value={fmtMoney(cryptoLiquid)}
                tone="positive"
              />
            )}
            <MetricRow label="− Safety buffer"            value={`−${fmtMoney(buffer)}`}    tone="warning" />
            <MetricRow label="− Stamp duty (QLD est.)"    value={`−${fmtMoney(stampDuty)}`} tone="warning" />
            <MetricRow label="− Other acquisition costs"  value={`−${fmtMoney(otherCosts)}`} tone="warning" />
            <MetricRow
              label="= Available purchase funds"
              value={fmtMoney(availableFunds)}
              tone={availableFunds >= 0 ? "positive" : "negative"}
              className="font-semibold border-t-2 border-line"
            />
          </div>
        </div>

        {/* ── Result KPIs ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard
            label="Available Funds"
            value={depositAmt}
            format="moneyCompact"
            tone={availableFunds >= 0 ? "positive" : "negative"}
          />
          <KpiCard
            label="Deposit %"
            value={depositPct}
            format="percent"
            tone={depositPct >= 0.2 ? "positive" : "warning"}
            sub={`20% min = ${fmtMoney(min20pct)}`}
          />
          <KpiCard
            label="Required Loan"
            value={requiredLoan}
            format="moneyCompact"
            tone="warning"
            sub={`LVR ${lvr.toFixed(1)}%`}
          />
          <KpiCard
            label="Readiness"
            value={null}
            format="raw"
            tone={isReady ? "positive" : "warning"}
            sub={
              isReady
                ? "✓ Ready to purchase"
                : monthsToReady != null
                  ? `Need ${fmtMoney(shortfall)} more · ${monthsToReady} months`
                  : `Shortfall ${fmtMoney(shortfall)}`
            }
          />
        </div>

        {availCash === 0 && stockValue === 0 && (
          <p className="text-caption text-ink-quaternary italic">
            Connect your cash &amp; investment accounts in Settings to auto-populate the snapshot data used here.
          </p>
        )}
      </div>
    </details>
  );
}
