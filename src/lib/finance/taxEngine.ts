/**
 * taxEngine — modular tax modelling helpers.
 *
 * All numbers are MODELLING ESTIMATES. Not financial advice. Formulas are
 * deterministic placeholders; replace with verified ATO/legislative logic
 * before any user-facing dollar promise.
 *
 * Switchable rule sets:
 *   - ato_current (2024–25 personal income tax)
 *   - ato_2027    (proposed reform placeholder — illustrative bands only)
 *
 * Negative gearing toggle:
 *   - old_formula (loss offsets all income, no quarantining)
 *   - new_formula (loss quarantined to investment income only — illustrative)
 */

export type TaxRuleset = "ato_current" | "ato_2027";
export type GearingRule = "old_formula" | "new_formula";
export type TaxMode = "lump_sum" | "payg";

export interface TaxBand {
  /** Inclusive lower bound of taxable income for this band. */
  from: number;
  /** Marginal rate (0–1) applied to income above `from`. */
  rate: number;
}

/** ATO 2024-25 resident schedule — illustrative, not authoritative. */
export const ATO_CURRENT_BANDS: TaxBand[] = [
  { from: 0,       rate: 0.00 },
  { from: 18_201,  rate: 0.16 },
  { from: 45_001,  rate: 0.30 },
  { from: 135_001, rate: 0.37 },
  { from: 190_001, rate: 0.45 },
];

/** Illustrative 2027 "reform" placeholder — flatter middle, same top. */
export const ATO_2027_BANDS: TaxBand[] = [
  { from: 0,       rate: 0.00 },
  { from: 22_000,  rate: 0.15 },
  { from: 60_000,  rate: 0.28 },
  { from: 150_000, rate: 0.36 },
  { from: 200_000, rate: 0.45 },
];

/** Medicare levy (illustrative — flat 2% above threshold). */
const MEDICARE_THRESHOLD = 27_222;
const MEDICARE_RATE = 0.02;

export function bandsFor(ruleset: TaxRuleset): TaxBand[] {
  return ruleset === "ato_2027" ? ATO_2027_BANDS : ATO_CURRENT_BANDS;
}

/** Income tax for a given taxable income, excluding Medicare. */
export function incomeTax(taxable: number, ruleset: TaxRuleset = "ato_current"): number {
  if (!Number.isFinite(taxable) || taxable <= 0) return 0;
  const bands = bandsFor(ruleset);
  let owed = 0;
  for (let i = 0; i < bands.length; i++) {
    const lo = bands[i].from;
    const hi = i < bands.length - 1 ? bands[i + 1].from - 1 : Number.POSITIVE_INFINITY;
    if (taxable <= lo) break;
    const slice = Math.min(taxable, hi) - lo;
    if (slice > 0) owed += slice * bands[i].rate;
  }
  return Math.max(0, owed);
}

/** Medicare levy (illustrative — no surcharge / no LITO). */
export function medicare(taxable: number): number {
  if (taxable <= MEDICARE_THRESHOLD) return 0;
  return taxable * MEDICARE_RATE;
}

export interface TaxResult {
  taxableIncome: number;
  incomeTax: number;
  medicare: number;
  totalTax: number;
  averageRate: number;   // effective rate on taxable
  marginalRate: number;  // rate of the topmost slice
}

export function computeTax(
  taxable: number,
  ruleset: TaxRuleset = "ato_current",
): TaxResult {
  const it = incomeTax(taxable, ruleset);
  const mc = medicare(taxable);
  const bands = bandsFor(ruleset);
  // Find marginal band
  let marginal = 0;
  for (const b of bands) {
    if (taxable >= b.from) marginal = b.rate;
  }
  const total = it + mc;
  return {
    taxableIncome: taxable,
    incomeTax: it,
    medicare: mc,
    totalTax: total,
    averageRate: taxable > 0 ? total / taxable : 0,
    marginalRate: marginal,
  };
}

/** Refund delta when adding/removing a deductible amount (negative gearing). */
export function refundOnDeduction(
  baseTaxable: number,
  deduction: number,
  ruleset: TaxRuleset = "ato_current",
): number {
  if (deduction <= 0) return 0;
  const before = computeTax(baseTaxable, ruleset).totalTax;
  const after  = computeTax(Math.max(0, baseTaxable - deduction), ruleset).totalTax;
  return Math.max(0, before - after);
}

/** PAYG annualisation helper — divides annual liability across cycles. */
export function paygPerCycle(annualTax: number, mode: TaxMode, cyclesPerYear = 26): number {
  if (mode !== "payg") return 0;
  return annualTax / cyclesPerYear;
}

/** Capital gains tax — illustrative AU 50% discount when held >= 12mo. */
export function capitalGainsTax(
  gain: number,
  marginalRate: number,
  heldMonths: number,
): number {
  if (gain <= 0) return 0;
  const taxable = heldMonths >= 12 ? gain * 0.5 : gain;
  return taxable * marginalRate;
}
