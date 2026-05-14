/**
 * cgtEngine — capital gains tax helpers (AU illustrative).
 *
 * Implements the standard AU 50% discount for assets held >= 12 months.
 * Replace with parcel-level FIFO/LIFO/min-tax algorithms before production.
 */

import { capitalGainsTax } from "./taxEngine";
import type { TaxRuleset } from "./taxEngine";

export interface CgtLot {
  units: number;
  avgCost: number;
  acquiredAt: string; // ISO date
}

export interface CgtSaleInput {
  lots: CgtLot[];
  unitsSold: number;
  salePrice: number;        // per unit
  saleDate: string;         // ISO
  marginalRate: number;     // 0-1
  ruleset?: TaxRuleset;
  /** "fifo" matches oldest first; "min_tax" prefers >12mo lots first. */
  strategy?: "fifo" | "min_tax";
}

export interface CgtSaleResult {
  proceeds: number;
  costBasis: number;
  gain: number;
  taxableGain: number;
  estimatedTax: number;
  discountApplied: number;
  matchedLots: { units: number; avgCost: number; heldMonths: number }[];
}

function monthsBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO);
  const b = new Date(bISO);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

export function computeCgtSale(input: CgtSaleInput): CgtSaleResult {
  const strategy = input.strategy ?? "fifo";
  const remaining = [...input.lots]
    .map((l) => ({ ...l }))
    .filter((l) => l.units > 0);

  // Strategy ordering
  if (strategy === "min_tax") {
    remaining.sort((a, b) => {
      const am = monthsBetween(a.acquiredAt, input.saleDate);
      const bm = monthsBetween(b.acquiredAt, input.saleDate);
      // prefer >=12 months held lots first; then highest avg cost (lowest gain)
      if ((am >= 12) !== (bm >= 12)) return (am >= 12) ? -1 : 1;
      return b.avgCost - a.avgCost;
    });
  } else {
    remaining.sort((a, b) => a.acquiredAt.localeCompare(b.acquiredAt));
  }

  let unitsLeft = input.unitsSold;
  let proceeds = 0;
  let basis = 0;
  let totalGain = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  const matched: { units: number; avgCost: number; heldMonths: number }[] = [];

  for (const lot of remaining) {
    if (unitsLeft <= 0) break;
    const take = Math.min(unitsLeft, lot.units);
    if (take <= 0) continue;
    const heldMonths = monthsBetween(lot.acquiredAt, input.saleDate);
    const slabProceeds = take * input.salePrice;
    const slabBasis = take * lot.avgCost;
    const slabGain = slabProceeds - slabBasis;
    const tax = capitalGainsTax(Math.max(0, slabGain), input.marginalRate, heldMonths);
    const discount = slabGain > 0 && heldMonths >= 12 ? slabGain * 0.5 : 0;

    proceeds += slabProceeds;
    basis += slabBasis;
    totalGain += slabGain;
    totalTax += tax;
    totalDiscount += discount;
    matched.push({ units: take, avgCost: lot.avgCost, heldMonths });
    unitsLeft -= take;
  }

  return {
    proceeds,
    costBasis: basis,
    gain: totalGain,
    taxableGain: Math.max(0, totalGain) - totalDiscount,
    estimatedTax: totalTax,
    discountApplied: totalDiscount,
    matchedLots: matched,
  };
}
