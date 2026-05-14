/**
 * propertyEngine — deterministic property cashflow + equity projection.
 *
 * Outputs are MODELLING ESTIMATES, not financial advice.
 */

import { computeGearing } from "./negativeGearing";
import type { GearingRule, TaxRuleset } from "./taxEngine";
import { computeTax } from "./taxEngine";

export interface PropertyEngineInput {
  purchasePrice: number;
  currentValue: number;
  loanBalance: number;
  interestRate: number;      // 0-1
  loanTermYears: number;
  rentalIncomePA: number;
  operatingExpensesPA: number; // rates, mgmt, insurance, repairs (excl. interest)
  growthRate: number;        // 0-1 capital growth pa
  rentGrowthRate: number;    // 0-1 rent growth pa
  acquiredAt: string;        // ISO date
  isInvestment: boolean;
  baseHouseholdIncome: number;
  ruleset?: TaxRuleset;
  gearingRule?: GearingRule;
}

export interface PropertyEngineYear {
  year: number;
  age: number;              // years since acquisition
  propertyValue: number;
  loanBalance: number;
  equity: number;
  rentalGross: number;
  operatingExpenses: number;
  interestPaid: number;
  principalPaid: number;
  rentalNet: number;        // gross - opex - interest
  taxRefund: number;        // from gearing, +ve = refund
  netCashflow: number;      // rentalNet + taxRefund - principal portion (cash-out perspective)
  carryForward: number;
}

export interface PropertyEngineProjection {
  rows: PropertyEngineYear[];
  totalEquityFinal: number;
  totalCfPositiveYears: number;
  totalCfNegativeYears: number;
  totalRefund: number;
  totalNetCash: number;
}

export function projectProperty(
  input: PropertyEngineInput,
  horizonYears = 30,
): PropertyEngineProjection {
  const rows: PropertyEngineYear[] = [];
  let value = input.currentValue;
  let loan = input.loanBalance;
  let rent = input.rentalIncomePA;
  let opex = input.operatingExpensesPA;
  let carry = 0;

  // Approximate amortising loan — equal monthly principal+interest.
  const r = input.interestRate / 12;
  const n = input.loanTermYears * 12;
  const monthlyPay = loan > 0 && r > 0
    ? (loan * r) / (1 - Math.pow(1 + r, -n))
    : loan / Math.max(1, n);

  let totalRefund = 0, totalNet = 0, posYears = 0, negYears = 0;

  for (let y = 1; y <= horizonYears; y++) {
    let interestThisYear = 0;
    let principalThisYear = 0;
    let bal = loan;
    for (let m = 0; m < 12 && bal > 0; m++) {
      const interest = bal * r;
      const principal = Math.max(0, Math.min(bal, monthlyPay - interest));
      interestThisYear += interest;
      principalThisYear += principal;
      bal = Math.max(0, bal - principal);
    }
    loan = bal;
    value = value * (1 + input.growthRate);

    const rentalNet = rent - opex - interestThisYear;
    let refund = 0;
    let nextCarry = 0;

    if (input.isInvestment) {
      const g = computeGearing({
        baseIncome: input.baseHouseholdIncome,
        rentalIncome: rent,
        rentalExpenses: opex + interestThisYear,
        carryForward: carry,
        ruleset: input.ruleset ?? "ato_current",
        gearingRule: input.gearingRule ?? "old_formula",
      });
      refund = g.taxRefundFromIp;
      nextCarry = g.nextYearCarryForward;
    }

    const netCf = rentalNet + refund;
    totalRefund += refund;
    totalNet += netCf;
    if (netCf >= 0) posYears += 1; else negYears += 1;

    rows.push({
      year: new Date().getFullYear() + y - 1,
      age: y,
      propertyValue: value,
      loanBalance: loan,
      equity: Math.max(0, value - loan),
      rentalGross: rent,
      operatingExpenses: opex,
      interestPaid: interestThisYear,
      principalPaid: principalThisYear,
      rentalNet,
      taxRefund: refund,
      netCashflow: netCf,
      carryForward: nextCarry,
    });

    rent *= 1 + input.rentGrowthRate;
    opex *= 1 + 0.025; // illustrative CPI on opex
    carry = nextCarry;
  }

  return {
    rows,
    totalEquityFinal: rows[rows.length - 1]?.equity ?? 0,
    totalCfPositiveYears: posYears,
    totalCfNegativeYears: negYears,
    totalRefund,
    totalNetCash: totalNet,
  };
}

/** Loan-to-value and usable-equity helpers. */
export function lvr(loanBalance: number, propertyValue: number): number {
  return propertyValue > 0 ? loanBalance / propertyValue : 0;
}
/** AU lender norm: 80% of value minus loan, floored at 0. */
export function usableEquity(propertyValue: number, loanBalance: number): number {
  return Math.max(0, propertyValue * 0.8 - loanBalance);
}

/** Simple capital gains estimate at point-in-time. */
export function unrealisedGain(input: PropertyEngineInput, year: number): number {
  const value = input.currentValue * Math.pow(1 + input.growthRate, year);
  const cost = input.purchasePrice;
  return value - cost;
}
