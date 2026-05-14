/**
 * Property finance helpers — ported from the original Family Wealth Lab
 * (client/src/lib/finance.ts + australianTax.ts).
 *
 * Pure functions only. No I/O, no React. Every calculation is deterministic
 * and unit-test-friendly. The commercial Property module renders directly
 * from `deriveCalcs(row)`.
 */

export type LoanType = "PI" | "IO" | "OFFSET" | "LINE_OF_CREDIT";

export type PropertyInput = {
  type: "ppor" | "owner_occupied" | "investment";
  purchase_price: number | null;
  current_value: number | null;
  loan_amount: number | null;
  deposit: number | null;
  stamp_duty: number | null;
  legal_fees: number | null;
  building_inspection: number | null;
  loan_setup_fees: number | null;
  interest_rate: number | null;          // decimal (e.g. 0.0624)
  loan_term_years: number | null;
  loan_type: LoanType | string | null;
  io_period_start?: string | null;
  io_period_end?: string | null;
  offset_balance?: number | null;
  weekly_rent: number | null;
  rental_growth: number | null;          // decimal
  vacancy_rate: number | null;           // decimal (e.g. 0.02)
  management_fee: number | null;         // decimal (e.g. 0.08)
  capital_growth: number | null;         // decimal
  insurance: number | null;              // annual
  council_rates: number | null;          // annual
  water_rates: number | null;            // annual
  maintenance: number | null;            // annual
  body_corporate: number | null;         // annual
  land_tax: number | null;               // annual
  renovation_costs: number | null;
  planned_sale_date: string | null;
  selling_costs: number | null;          // decimal % of sale price
  projection_years: number | null;
  purchase_date: string | null;
  rental_income: number | null;          // monthly (legacy column from initial schema)
  expenses: number | null;               // monthly (legacy column)
};

export const safeNum = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : 0;
};

/** Monthly P&I repayment using standard amortisation. */
export function calcMonthlyRepayment(
  principal: number,
  annualRate: number,
  termYears: number,
): number {
  if (principal <= 0 || termYears <= 0) return 0;
  const r = annualRate / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/**
 * QLD stamp duty for 2025-26 (mirrors `estimateQldStampDuty` in the original).
 * Concessional rate for owner-occupier purchases isn't applied — this is the
 * standard transfer-duty schedule.
 */
export function estimateQldStampDuty(price: number): number {
  if (price <= 5000) return 0;
  if (price <= 75000)    return 0 + (price - 5000) * 0.015;
  if (price <= 540000)   return 1050 + (price - 75000) * 0.035;
  if (price <= 1000000)  return 17325 + (price - 540000) * 0.045;
  return 38025 + (price - 1000000) * 0.0575;
}

/** AU marginal tax rate for 2025-26 — used for negative gearing estimates. */
export function auMarginalRate(annualIncome: number): number {
  if (annualIncome <= 18200) return 0;
  if (annualIncome <= 45000) return 0.16;
  if (annualIncome <= 135000) return 0.30;
  if (annualIncome <= 190000) return 0.37;
  return 0.45;
}

export type DerivedCalcs = {
  loanAmount: number;
  stampDuty: number;
  totalAcquisitionCost: number;
  lvr: number;                 // %  (loan / purchase price)
  currentLVR: number;          // %  (loan / current value)
  equity: number;
  monthly: number;             // monthly repayment
  monthlyRent: number;         // net monthly rent (after vacancy + mgmt)
  monthlyCashFlow: number;
  annualCashFlow: number;
  grossYield: number;          // %
  netYield: number;            // %
  saleProceeds: number;
  capitalGain: number;
  taxableGain: number;
  cgtEstimate: number;
  heldOver12Months: boolean;
  ngAnalysis: null | {
    annualRentalIncome: number;
    annualInterest: number;
    annualDeductibleExpenses: number;
    annualDepreciation: number;
    taxableRentalResult: number;
    isNegativelyGeared: boolean;
    annualTaxBenefit: number;
    monthlyTaxBenefit: number;
    monthlyCashLoss: number;
    netAfterTaxMonthlyCost: number;
    marginalRate: number;
  };
};

/**
 * Full property derivation. Mirrors `deriveCalcs` in
 * `client/src/pages/property.tsx` of the original codebase.
 */
export function deriveCalcs(p: Partial<PropertyInput>): DerivedCalcs {
  const price = safeNum(p.purchase_price);
  const deposit = safeNum(p.deposit);
  const loanAmount = safeNum(p.loan_amount) || Math.max(0, price - deposit);
  const stampDuty = safeNum(p.stamp_duty) || estimateQldStampDuty(price);
  const legalFees = safeNum(p.legal_fees);
  const buildingInspection = safeNum(p.building_inspection);
  const loanSetupFees = safeNum(p.loan_setup_fees);
  const totalAcquisitionCost =
    price + stampDuty + legalFees + buildingInspection + loanSetupFees;

  const currentValue = safeNum(p.current_value) || price;
  const lvr = price > 0 ? (loanAmount / price) * 100 : 0;
  const currentLVR = currentValue > 0 ? (loanAmount / currentValue) * 100 : 0;
  const equity = currentValue - loanAmount;

  const isIO = p.loan_type === "IO";
  const annualRate = safeNum(p.interest_rate);
  const termYears = safeNum(p.loan_term_years) || 30;
  const monthly = isIO
    ? (loanAmount * annualRate) / 12
    : calcMonthlyRepayment(loanAmount, annualRate, termYears);

  // Vacancy + management share are stored as decimals (0.02 = 2%).
  const weeklyRent = safeNum(p.weekly_rent);
  const annualRent = weeklyRent * 52;
  const vacancyShare = safeNum(p.vacancy_rate);
  const mgmtShare = safeNum(p.management_fee);
  const grossAnnualRent = annualRent * (1 - vacancyShare);
  const netAnnualRent = grossAnnualRent * (1 - mgmtShare);
  const monthlyRent = netAnnualRent / 12;

  const annualRunningCosts =
    safeNum(p.insurance) +
    safeNum(p.council_rates) +
    safeNum(p.water_rates) +
    safeNum(p.maintenance) +
    safeNum(p.body_corporate) +
    safeNum(p.land_tax) +
    safeNum(p.renovation_costs);

  const monthlyCashFlow = monthlyRent - monthly - annualRunningCosts / 12;
  const annualCashFlow = monthlyCashFlow * 12;

  const grossYield = currentValue > 0 ? (annualRent / currentValue) * 100 : 0;
  const netYield =
    currentValue > 0
      ? ((netAnnualRent - annualRunningCosts) / currentValue) * 100
      : 0;

  // CGT estimate (informational)
  const saleDate = p.planned_sale_date ? new Date(p.planned_sale_date) : null;
  const purchaseDate = p.purchase_date ? new Date(p.purchase_date) : null;
  const sellingCostsPct = safeNum(p.selling_costs);
  const capitalGrowth = safeNum(p.capital_growth);
  const yearsToSale = saleDate
    ? Math.max(0, (saleDate.getTime() - Date.now()) / (365.25 * 24 * 3600 * 1000))
    : 0;
  const saleProceeds = saleDate
    ? currentValue * Math.pow(1 + capitalGrowth, yearsToSale)
    : currentValue;
  const sellingCostsAmount = saleProceeds * sellingCostsPct;
  const capitalGain =
    saleProceeds - price - totalAcquisitionCost - sellingCostsAmount;
  const heldOver12Months =
    purchaseDate && saleDate
      ? saleDate.getTime() - purchaseDate.getTime() > 365 * 24 * 3600 * 1000
      : true;
  const taxableGain = heldOver12Months ? capitalGain * 0.5 : capitalGain;
  const cgtEstimate = Math.max(0, taxableGain * 0.39);

  // Negative gearing (investment properties only)
  let ngAnalysis: DerivedCalcs["ngAnalysis"] = null;
  const isInvestment = p.type !== "ppor" && p.type !== "owner_occupied";
  if (isInvestment) {
    const annualRentalIncome = grossAnnualRent * (1 - mgmtShare);
    const annualInterest = loanAmount * annualRate;
    const annualDeductibleExpenses =
      safeNum(p.council_rates) +
      safeNum(p.insurance) +
      safeNum(p.maintenance) +
      safeNum(p.water_rates) +
      safeNum(p.body_corporate) +
      safeNum(p.land_tax);
    const annualDepreciation = (price || currentValue) * 0.025;
    const taxableRentalResult =
      annualRentalIncome -
      annualInterest -
      annualDeductibleExpenses -
      annualDepreciation;
    const isNeg = taxableRentalResult < 0;
    const marginalRate = auMarginalRate(200_000);
    const annualTaxBenefit = isNeg
      ? Math.abs(taxableRentalResult) * marginalRate
      : 0;
    const fullMonthlyLoan = isIO
      ? (loanAmount * annualRate) / 12
      : monthly;
    const monthlyCashLoss =
      annualRentalIncome / 12 -
      fullMonthlyLoan -
      annualDeductibleExpenses / 12;
    ngAnalysis = {
      annualRentalIncome: Math.round(annualRentalIncome),
      annualInterest: Math.round(annualInterest),
      annualDeductibleExpenses: Math.round(annualDeductibleExpenses),
      annualDepreciation: Math.round(annualDepreciation),
      taxableRentalResult: Math.round(taxableRentalResult),
      isNegativelyGeared: isNeg,
      annualTaxBenefit: Math.round(annualTaxBenefit),
      monthlyTaxBenefit: Math.round(annualTaxBenefit / 12),
      monthlyCashLoss: Math.round(monthlyCashLoss),
      netAfterTaxMonthlyCost: Math.round(
        monthlyCashLoss + annualTaxBenefit / 12,
      ),
      marginalRate,
    };
  }

  return {
    loanAmount,
    stampDuty,
    totalAcquisitionCost,
    lvr,
    currentLVR,
    equity,
    monthly,
    monthlyRent,
    monthlyCashFlow,
    annualCashFlow,
    grossYield,
    netYield,
    saleProceeds,
    capitalGain,
    taxableGain,
    cgtEstimate,
    heldOver12Months,
    ngAnalysis,
  };
}

/**
 * Per-year cashflow & equity projection. Mirrors `projectProperty` in the
 * original codebase but with explicit IO ↔ P&I transition handling.
 */
export type CashflowYear = {
  year: number;
  value: number;
  loan: number;
  equity: number;
  lvr: number;
  rentalIncome: number;
  interest: number;
  expenses: number;
  netCashflow: number;
};

export function projectCashflow(
  p: Partial<PropertyInput>,
  years: number,
): CashflowYear[] {
  const out: CashflowYear[] = [];
  let value = safeNum(p.current_value) || safeNum(p.purchase_price);
  let loan = safeNum(p.loan_amount);
  const rate = safeNum(p.interest_rate);
  const term = safeNum(p.loan_term_years) || 30;
  const growth = safeNum(p.capital_growth);
  const rentalGrowth = safeNum(p.rental_growth);
  const startYear = new Date().getFullYear();
  let weeklyRent = safeNum(p.weekly_rent);
  const vacancy = safeNum(p.vacancy_rate);
  const mgmt = safeNum(p.management_fee);
  const annualExpenses =
    safeNum(p.insurance) +
    safeNum(p.council_rates) +
    safeNum(p.water_rates) +
    safeNum(p.maintenance) +
    safeNum(p.body_corporate) +
    safeNum(p.land_tax);
  const isIO = p.loan_type === "IO";
  const ioEnd = p.io_period_end ? new Date(p.io_period_end) : null;

  for (let y = 0; y <= years; y++) {
    const annualRent = weeklyRent * 52 * (1 - vacancy) * (1 - mgmt);
    const interest = loan * rate;

    // Loan amortisation
    const yearDate = new Date(startYear + y, 0, 1);
    const stillIO = isIO && (!ioEnd || yearDate < ioEnd);
    if (!stillIO && loan > 0) {
      // Amortise one year — 12 months at the standard P&I payment
      const monthly = calcMonthlyRepayment(loan, rate, term);
      let bal = loan;
      for (let m = 0; m < 12; m++) {
        const i = (bal * rate) / 12;
        const principal = Math.max(0, monthly - i);
        bal = Math.max(0, bal - principal);
      }
      loan = bal;
    }

    const netCashflow = annualRent - interest - annualExpenses;

    out.push({
      year: startYear + y,
      value: Math.round(value),
      loan: Math.round(loan),
      equity: Math.round(value - loan),
      lvr: value > 0 ? Number(((loan / value) * 100).toFixed(2)) : 0,
      rentalIncome: Math.round(annualRent),
      interest: Math.round(interest),
      expenses: Math.round(annualExpenses),
      netCashflow: Math.round(netCashflow),
    });

    value *= 1 + growth;
    weeklyRent *= 1 + rentalGrowth;
  }
  return out;
}
