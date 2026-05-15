/**
 * negativeGearing — investment-property loss treatment.
 *
 * "old_formula" — loss offsets all assessable income (current AU treatment).
 * "new_formula" — loss quarantined to investment income only; carry-forward
 *                  applied next year. Illustrative reform placeholder.
 */

import type { GearingRule, TaxRuleset } from "./taxEngine";
import { computeTax } from "./taxEngine";

export interface GearingInput {
  /** All salary + non-investment income, pre-tax. */
  baseIncome: number;
  /** Gross rental income for the year. */
  rentalIncome: number;
  /** Total deductible expenses (interest, depreciation, rates, repairs, mgmt). */
  rentalExpenses: number;
  /** Carried forward loss from previous years (only used by new_formula). */
  carryForward?: number;
  /** Tax ruleset for the marginal calc. */
  ruleset?: TaxRuleset;
  /** Gearing rule set. */
  gearingRule?: GearingRule;
}

export interface GearingResult {
  rentalNet: number;          // rental income - rental expenses
  taxableBefore: number;      // taxable income without IP impact
  taxableAfter: number;       // taxable income with IP impact applied
  taxRefundFromIp: number;    // positive = refund, 0 if loss quarantined
  nextYearCarryForward: number; // residual loss carried forward
  effectiveCashflow: number;  // rental net + tax refund
}

export function computeGearing(input: GearingInput): GearingResult {
  const ruleset = input.ruleset ?? "ato_current";
  const rule = input.gearingRule ?? "old_formula";
  const carryIn = input.carryForward ?? 0;
  const rentalNet = input.rentalIncome - input.rentalExpenses;
  const isLoss = rentalNet < 0;

  const taxableBefore = input.baseIncome;

  if (!isLoss) {
    // Profitable rental — taxed as ordinary income; carryforward can absorb it.
    const offset = Math.min(rentalNet, Math.max(0, carryIn));
    const taxableAfter = taxableBefore + (rentalNet - offset);
    const taxBefore = computeTax(taxableBefore, ruleset).totalTax;
    const taxAfter  = computeTax(taxableAfter, ruleset).totalTax;
    const refund = taxBefore - taxAfter; // negative => extra tax owed
    return {
      rentalNet,
      taxableBefore,
      taxableAfter,
      taxRefundFromIp: -Math.max(0, -refund), // we treat as cashflow delta
      nextYearCarryForward: Math.max(0, carryIn - offset),
      effectiveCashflow: rentalNet + refund,
    };
  }

  // LOSS branch
  if (rule === "old_formula") {
    const taxableAfter = Math.max(0, taxableBefore + rentalNet); // rentalNet < 0
    const taxBefore = computeTax(taxableBefore, ruleset).totalTax;
    const taxAfter  = computeTax(taxableAfter, ruleset).totalTax;
    const refund = taxBefore - taxAfter;
    return {
      rentalNet,
      taxableBefore,
      taxableAfter,
      taxRefundFromIp: refund,
      nextYearCarryForward: 0,
      effectiveCashflow: rentalNet + refund,
    };
  }

  // new_formula — loss quarantined; carry forward
  return {
    rentalNet,
    taxableBefore,
    taxableAfter: taxableBefore,
    taxRefundFromIp: 0,
    nextYearCarryForward: carryIn + Math.abs(rentalNet),
    effectiveCashflow: rentalNet, // no tax shield this year
  };
}
