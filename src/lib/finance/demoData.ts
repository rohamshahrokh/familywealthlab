/**
 * demoData — deterministic placeholder data for the product shell.
 *
 * This is the single source of truth for the in-app demo experience until
 * Supabase persistence is wired up. Pure data, no fetches.
 */

import type { Holding } from "./investmentEngine";
import type { CashflowInput } from "./cashflowEngine";
import type { PropertyEngineInput } from "./propertyEngine";

export interface DemoBill {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: "weekly" | "fortnightly" | "monthly" | "quarterly" | "annual";
  nextDue: string;          // ISO date
  startDate: string;        // ISO date
  remindBeforeDays: number;
  remindOnDue: boolean;
  remindOverdue: boolean;
  member: string;
  priority: "low" | "medium" | "high";
  essential: boolean;
  autoRenew: boolean;
  autoMatch: boolean;
  status: "current" | "due_soon" | "overdue" | "paid";
}

export const DEMO_STOCK_HOLDINGS: Holding[] = [
  { symbol: "NVDA",   units: 42,  avgCost: 380.12, currentPrice: 875.40, storedPrice: 868.10, dailyChange: 0.018, dcaMonthly: 500,  expectedReturn: 0.16 },
  { symbol: "GOOGL",  units: 80,  avgCost: 128.50, currentPrice: 174.20, storedPrice: 172.95, dailyChange: 0.006, dcaMonthly: 300,  expectedReturn: 0.11 },
  { symbol: "MSFT",   units: 35,  avgCost: 285.10, currentPrice: 430.65, storedPrice: 429.10, dailyChange: 0.004, dcaMonthly: 400,  expectedReturn: 0.10 },
  { symbol: "AVGO",   units: 18,  avgCost: 612.40, currentPrice: 1462.30, storedPrice: 1450.00, dailyChange: -0.011, expectedReturn: 0.13 },
  { symbol: "CEG",    units: 60,  avgCost: 109.25, currentPrice: 251.80, storedPrice: 248.00, dailyChange: 0.023, expectedReturn: 0.14 },
  { symbol: "OKLO",   units: 220, avgCost: 7.10,   currentPrice: 13.45, storedPrice: 12.95,  dailyChange: 0.041, expectedReturn: 0.20 },
  { symbol: "ANET",   units: 24,  avgCost: 178.30, currentPrice: 365.10, storedPrice: 360.00, dailyChange: 0.009, expectedReturn: 0.12 },
  { symbol: "STCK.TO", units: 1100, avgCost: 4.85, currentPrice: 6.20, storedPrice: 6.18, dailyChange: 0.002, dcaMonthly: 200, expectedReturn: 0.09 },
];

export const DEMO_CRYPTO_HOLDINGS: Holding[] = [
  { symbol: "BTC", units: 0.42,  avgCost: 31_400, currentPrice: 96_500, storedPrice: 95_900, dailyChange: 0.014, dcaMonthly: 250, expectedReturn: 0.18 },
  { symbol: "ETH", units: 6.8,   avgCost: 1_980,  currentPrice: 3_420,  storedPrice: 3_390,  dailyChange: 0.022, dcaMonthly: 150, expectedReturn: 0.20 },
];

export const DEMO_BILLS: DemoBill[] = [
  { id: "b1", name: "Mortgage — 14 Sunset Ave", category: "Housing", amount: 4_180, frequency: "monthly", nextDue: "2026-05-28", startDate: "2022-03-01", remindBeforeDays: 3, remindOnDue: true, remindOverdue: true, member: "Joint", priority: "high", essential: true, autoRenew: true, autoMatch: true, status: "due_soon" },
  { id: "b2", name: "Electricity — Origin", category: "Utilities", amount: 285, frequency: "monthly", nextDue: "2026-05-22", startDate: "2021-01-15", remindBeforeDays: 2, remindOnDue: true, remindOverdue: true, member: "Roham", priority: "high", essential: true, autoRenew: false, autoMatch: true, status: "due_soon" },
  { id: "b3", name: "Private health — Bupa", category: "Insurance", amount: 360, frequency: "monthly", nextDue: "2026-06-04", startDate: "2020-07-01", remindBeforeDays: 5, remindOnDue: true, remindOverdue: true, member: "Joint", priority: "medium", essential: true, autoRenew: true, autoMatch: true, status: "current" },
  { id: "b4", name: "Netflix", category: "Subscriptions", amount: 22.99, frequency: "monthly", nextDue: "2026-05-19", startDate: "2019-04-10", remindBeforeDays: 0, remindOnDue: false, remindOverdue: false, member: "Joint", priority: "low", essential: false, autoRenew: true, autoMatch: true, status: "current" },
  { id: "b5", name: "Mobile — Telstra", category: "Utilities", amount: 65, frequency: "monthly", nextDue: "2026-05-12", startDate: "2020-08-01", remindBeforeDays: 1, remindOnDue: true, remindOverdue: true, member: "Roham", priority: "medium", essential: true, autoRenew: true, autoMatch: true, status: "overdue" },
  { id: "b6", name: "Rates — Brisbane CC", category: "Housing", amount: 720, frequency: "quarterly", nextDue: "2026-07-15", startDate: "2022-04-01", remindBeforeDays: 7, remindOnDue: true, remindOverdue: true, member: "Joint", priority: "high", essential: true, autoRenew: false, autoMatch: true, status: "current" },
  { id: "b7", name: "Car rego", category: "Transport", amount: 920, frequency: "annual", nextDue: "2026-11-04", startDate: "2021-11-04", remindBeforeDays: 14, remindOnDue: true, remindOverdue: true, member: "Roham", priority: "medium", essential: true, autoRenew: false, autoMatch: false, status: "current" },
];

export const DEMO_PROPERTY: PropertyEngineInput = {
  purchasePrice: 720_000,
  currentValue: 940_000,
  loanBalance: 560_000,
  interestRate: 0.062,
  loanTermYears: 30,
  rentalIncomePA: 0, // PPOR
  operatingExpensesPA: 8_500,
  growthRate: 0.045,
  rentGrowthRate: 0.03,
  acquiredAt: "2022-03-01",
  isInvestment: false,
  baseHouseholdIncome: 235_000,
  ruleset: "ato_current",
  gearingRule: "old_formula",
};

export const DEMO_IP: PropertyEngineInput = {
  purchasePrice: 510_000,
  currentValue: 615_000,
  loanBalance: 408_000,
  interestRate: 0.066,
  loanTermYears: 30,
  rentalIncomePA: 31_200,    // $600/wk
  operatingExpensesPA: 7_400,
  growthRate: 0.04,
  rentGrowthRate: 0.028,
  acquiredAt: "2023-08-12",
  isInvestment: true,
  baseHouseholdIncome: 235_000,
  ruleset: "ato_current",
  gearingRule: "old_formula",
};

export const DEMO_CASHFLOW: CashflowInput = {
  startingCash: 78_000,
  offsetBalance: 32_000,
  income: [
    { label: "Roham — salary", annualGross: 165_000, cadence: "monthly", taxable: true },
    { label: "Partner — salary", annualGross: 70_000, cadence: "monthly", taxable: true },
  ],
  expenses: [
    { label: "Mortgage (PPOR)", monthly: 4_180, category: "Housing" },
    { label: "Living costs",    monthly: 3_900, category: "Living" },
    { label: "Childcare",       monthly: 1_650, category: "Family" },
    { label: "Utilities",       monthly: 620,   category: "Utilities" },
    { label: "Transport",       monthly: 540,   category: "Transport" },
    { label: "Insurance",       monthly: 360,   category: "Insurance" },
  ],
  property: {
    netMonthly: -480, // IP holding cost net of rent
    eventsPerYear: [
      { monthOffset: 4,  amount: -1_800, label: "IP — repairs", kind: "property" },
      { monthOffset: 18, amount: 7_500,  label: "IP — rent review", kind: "property" },
    ],
  },
  events: [
    { monthOffset: 3,  amount:  4_200, label: "Bonus", kind: "other" },
    { monthOffset: 9,  amount: -2_800, label: "Holiday", kind: "other" },
    { monthOffset: 12, amount:  3_500, label: "Stock dividend", kind: "stock" },
    { monthOffset: 24, amount:  8_900, label: "ETH partial sale", kind: "crypto" },
  ],
  taxMode: "lump_sum",
  ruleset: "ato_current",
  horizonMonths: 12 * 10,
};

export const DEMO_COMMAND_KPIS = {
  monthlySurplus: 2_340,
  totalInvestments: 412_500,
  propertyEquity: 587_000,
  debtBalance: 968_000,
  passiveIncome: 41_200,
  superCombined: 168_400,
  accessibleWealth: 510_000,
  lockedRetirementWealth: 168_400,
  totalNetWorth: 1_178_000,
  cashToday: 78_000 + 32_000,
  nextMajorEvent: { label: "IP — rent review", inMonths: 18 },
  forecastLabel: "Baseline · 2026–35",
  incomeStatus: "verified" as const,
};
