/**
 * Income constants — moved out of `income-actions.ts` because Next.js
 * server-action files may only export async functions. These pure values
 * are shared between the client form and the server action.
 */

export const INCOME_SOURCES = [
  "Salary",
  "Bonus",
  "Rental Income",
  "Dividends",
  "Interest",
  "Tax Refund",
  "Side Income",
  "Other",
] as const;
export type IncomeSource = typeof INCOME_SOURCES[number];

export const INCOME_FREQUENCIES = [
  "Weekly",
  "Fortnightly",
  "Monthly",
  "Quarterly",
  "Annual",
  "One-off",
] as const;
export type IncomeFrequency = typeof INCOME_FREQUENCIES[number];

/** Monthly-equivalent multipliers for each UI frequency. */
export const FREQ_MULTIPLIER: Record<IncomeFrequency, number> = {
  Weekly:      52 / 12,
  Fortnightly: 26 / 12,
  Monthly:     1,
  Quarterly:   4 / 12,
  Annual:      1 / 12,
  "One-off":   0, // excluded from recurring projection
};

export function toMonthlyEquiv(amount: number, frequency: string): number {
  return amount * (FREQ_MULTIPLIER[frequency as IncomeFrequency] ?? 1);
}

/** Map UI frequency → ledger cadence enum. */
export function frequencyToCadence(freq: string): "monthly" | "annual" | "one_off" {
  if (freq === "Annual") return "annual";
  if (freq === "One-off") return "one_off";
  return "monthly";
}
