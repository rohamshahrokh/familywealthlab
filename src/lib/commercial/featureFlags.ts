/**
 * featureFlags.ts — Commercial feature gating
 * ─────────────────────────────────────────────────────────────────────────────
 * Maps every commercial feature to the minimum plan required to use it.
 * Components consume this map via `accessControl.canUse(...)` so we have a
 * single source of truth across pricing pages, sidebar disabling, and inline
 * upgrade gates.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { PlanTier } from "./plans";

export type Feature =
  | "snapshot"
  | "income_expenses"
  | "recurring_bills_basic"
  | "recurring_bills_advanced"
  | "monthly_budget"
  | "net_worth_timeline"
  | "data_health"
  | "ledger_audit"
  | "financial_plan"
  | "property_plan_basic"
  | "property_plan_advanced"
  | "stocks_plan"
  | "crypto_plan"
  | "live_market_prices"
  | "debt_strategy"
  | "tax_strategy"
  | "cgt_simulator"
  | "wealth_strategy"
  | "forecast_engine"
  | "monte_carlo"
  | "decision_engine_basic"
  | "decision_engine_advanced"
  | "market_news"
  | "reports_basic"
  | "reports_advanced"
  | "exports_csv"
  | "exports_pdf"
  | "imports"
  | "ai_insights"
  | "multi_household"
  | "help_center"
  | "settings";

/**
 * Minimum plan required to use each feature.
 * Keeping this object const-typed gives every consumer auto-complete on Feature names.
 */
export const FEATURE_MINIMUM: Record<Feature, PlanTier> = {
  // ── Free
  snapshot:                  "free",
  income_expenses:           "free",
  recurring_bills_basic:     "free",
  monthly_budget:            "free",
  net_worth_timeline:        "free",
  data_health:               "free",
  property_plan_basic:       "free",
  stocks_plan:               "free",
  crypto_plan:               "free",
  help_center:               "free",
  settings:                  "free",
  market_news:               "free",

  // ── Starter
  financial_plan:            "starter",
  ledger_audit:              "starter",
  recurring_bills_advanced:  "starter",
  property_plan_advanced:    "starter",
  debt_strategy:             "starter",
  live_market_prices:        "starter",
  exports_csv:               "starter",
  imports:                   "starter",
  decision_engine_basic:     "starter",
  reports_basic:             "starter",

  // ── Pro
  tax_strategy:              "pro",
  cgt_simulator:             "pro",
  wealth_strategy:           "pro",
  forecast_engine:           "pro",
  monte_carlo:               "pro",
  decision_engine_advanced:  "pro",
  exports_pdf:               "pro",
  ai_insights:               "pro",

  // ── Family Office
  reports_advanced:          "family_office",
  multi_household:           "family_office",
};

/** Human-readable label for upgrade copy. */
export const FEATURE_LABEL: Record<Feature, string> = {
  snapshot:                  "Snapshot dashboard",
  income_expenses:           "Income & expenses",
  recurring_bills_basic:     "Recurring bills",
  recurring_bills_advanced:  "Advanced recurring bills",
  monthly_budget:            "Monthly budget",
  net_worth_timeline:        "Net-worth timeline",
  data_health:               "Data health",
  ledger_audit:              "Ledger audit",
  financial_plan:            "Financial plan",
  property_plan_basic:       "Property plan",
  property_plan_advanced:    "Advanced property plan",
  stocks_plan:               "Stocks plan",
  crypto_plan:               "Crypto plan",
  live_market_prices:        "Live market prices",
  debt_strategy:             "Debt strategy",
  tax_strategy:              "Tax strategy",
  cgt_simulator:             "CGT simulator",
  wealth_strategy:           "Wealth strategy",
  forecast_engine:           "Forecast engine",
  monte_carlo:               "Monte Carlo",
  decision_engine_basic:     "Decision engine",
  decision_engine_advanced:  "Advanced decision engine",
  market_news:               "Market news",
  reports_basic:              "Reports",
  reports_advanced:           "Advanced reports",
  exports_csv:                "CSV export",
  exports_pdf:                "PDF export",
  imports:                    "Imports",
  ai_insights:                "AI insights",
  multi_household:            "Multi-household",
  help_center:                "Help centre",
  settings:                   "Settings",
};
