/**
 * investmentEngine — deterministic stock/crypto portfolio growth projections.
 *
 * Outputs are MODELLING ESTIMATES, not financial advice. No external prices.
 */

export type AssetClass = "stock" | "etf" | "crypto" | "cash";

export interface Holding {
  symbol: string;
  units: number;
  avgCost: number;            // per unit
  currentPrice: number;       // per unit
  storedPrice?: number;       // last-known stored price (for divergence pill)
  dailyChange?: number;       // pct, -1..1
  dcaMonthly?: number;        // optional dollar amount of recurring DCA
  expectedReturn?: number;    // pa override
}

export interface PortfolioInput {
  holdings: Holding[];
  /** Defaults applied when a holding doesn't carry an explicit expectedReturn. */
  defaultStockReturn?: number; // pa
  defaultCryptoReturn?: number; // pa
  inflation?: number;
}

export interface PortfolioSnapshot {
  totalValue: number;
  costBasis: number;
  unrealisedPnl: number;
  unrealisedPnlPct: number;
  totalDcaMonthly: number;
  byHolding: Array<{
    symbol: string;
    value: number;
    cost: number;
    pnl: number;
    pnlPct: number;
    allocation: number; // 0..1
    dcaMonthly: number;
  }>;
}

export function snapshotPortfolio(input: PortfolioInput): PortfolioSnapshot {
  const rows = input.holdings.map((h) => {
    const value = h.units * h.currentPrice;
    const cost = h.units * h.avgCost;
    return {
      symbol: h.symbol,
      value,
      cost,
      pnl: value - cost,
      pnlPct: cost > 0 ? (value - cost) / cost : 0,
      allocation: 0,
      dcaMonthly: h.dcaMonthly ?? 0,
    };
  });
  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  rows.forEach((r) => { r.allocation = totalValue > 0 ? r.value / totalValue : 0; });
  const costBasis = rows.reduce((s, r) => s + r.cost, 0);
  const totalDca = rows.reduce((s, r) => s + r.dcaMonthly, 0);
  return {
    totalValue,
    costBasis,
    unrealisedPnl: totalValue - costBasis,
    unrealisedPnlPct: costBasis > 0 ? (totalValue - costBasis) / costBasis : 0,
    totalDcaMonthly: totalDca,
    byHolding: rows,
  };
}

export interface GrowthPoint {
  year: number;
  total: number;
  bySymbol: Record<string, number>;
}

export function projectPortfolioGrowth(
  input: PortfolioInput,
  horizon = 10,
  assetClass: AssetClass = "stock",
): GrowthPoint[] {
  const defaultReturn = assetClass === "crypto"
    ? (input.defaultCryptoReturn ?? 0.18)
    : (input.defaultStockReturn ?? 0.08);
  const startYear = new Date().getFullYear();
  const points: GrowthPoint[] = [];
  // Per-holding running balance
  const balances: Record<string, number> = {};
  input.holdings.forEach((h) => { balances[h.symbol] = h.units * h.currentPrice; });

  for (let y = 0; y <= horizon; y++) {
    const bySymbol: Record<string, number> = {};
    let total = 0;
    input.holdings.forEach((h) => {
      const r = h.expectedReturn ?? defaultReturn;
      // Apply growth, then add 12 months of DCA
      let v = balances[h.symbol] ?? 0;
      v = v * (1 + r);
      if (y > 0 && h.dcaMonthly) v += h.dcaMonthly * 12;
      balances[h.symbol] = v;
      bySymbol[h.symbol] = v;
      total += v;
    });
    points.push({ year: startYear + y, total, bySymbol });
  }
  return points;
}

export interface AllocationSlice {
  label: string;
  value: number;
  pct: number;
}

export function allocationSlices(input: PortfolioInput): AllocationSlice[] {
  const snap = snapshotPortfolio(input);
  return snap.byHolding.map((r) => ({
    label: r.symbol,
    value: r.value,
    pct: r.allocation,
  }));
}
