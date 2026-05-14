/**
 * Expense constants — moved out of `actions.ts` because Next.js
 * server-action files (with `"use server"`) may only export async
 * functions. These pure values are shared between client forms and the
 * server action.
 */

export const EXPENSE_CATEGORIES = [
  "housing", "utilities", "food", "transport", "childcare",
  "kids", "health", "insurance", "leisure", "subscriptions",
  "fitness", "shopping", "education", "travel", "gifts",
  "home_maintenance", "investment_costs", "debt_service",
  "refund", "other",
] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing:          "Housing / Mortgage",
  utilities:        "Utilities",
  food:             "Groceries",
  transport:        "Transport / Fuel",
  childcare:        "Childcare",
  kids:             "Kids Expenses",
  health:           "Health / Medical",
  insurance:        "Insurance",
  leisure:          "Dining / Entertainment",
  subscriptions:    "Subscriptions",
  fitness:          "Fitness",
  shopping:         "Shopping",
  education:        "Education",
  travel:           "Travel",
  gifts:            "Gifts",
  home_maintenance: "Home Maintenance",
  investment_costs: "Investment Costs",
  debt_service:     "Debt Repayment",
  refund:           "Refund",
  other:            "Other",
};

export const SOURCE_CODES = [
  "D","M","T","E","C","B","R","G","S","L","PI","I","U","BB","CC","TR","RE",
] as const;
export type SourceCode = typeof SOURCE_CODES[number];

export const SOURCE_CODE_TO_CATEGORY: Record<SourceCode, ExpenseCategory> = {
  D:  "food",          M:  "health",          T:  "transport",
  E:  "leisure",       C:  "transport",       B:  "shopping",
  R:  "housing",       G:  "gifts",           S:  "fitness",
  L:  "debt_service",  PI: "insurance",       I:  "investment_costs",
  U:  "utilities",     BB: "kids",            CC: "childcare",
  TR: "travel",        RE: "refund",
};

export const SOURCE_CODE_LABELS: Record<SourceCode, string> = {
  D:  "D · Groceries",     M:  "M · Medical",      T:  "T · Transport",
  E:  "E · Entertainment", C:  "C · Car",          B:  "B · Shopping",
  R:  "R · Rent/Mortgage", G:  "G · Gifts",        S:  "S · Fitness",
  L:  "L · Loan",          PI: "PI · Insurance",   I:  "I · Investment",
  U:  "U · Utilities",     BB: "BB · Kids",        CC: "CC · Childcare",
  TR: "TR · Travel",       RE: "RE · Refund",
};

export const FAMILY_MEMBERS = ["Alex", "Sara", "Kids", "Family"] as const;
export const PAYMENT_METHODS = [
  "Bank Transfer", "Credit Card", "Debit Card", "Cash", "Offset Account", "BPAY",
] as const;
