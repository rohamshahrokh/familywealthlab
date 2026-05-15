/**
 * plans.ts — Commercial subscription plans (architecture only — no billing yet)
 * ─────────────────────────────────────────────────────────────────────────────
 * Defines the four-tier plan structure that gates Family Wealth Lab features.
 * Payment processing is deliberately NOT wired here — only the contract that
 * gating components, route guards, and pricing pages consume.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type PlanTier = "free" | "starter" | "pro" | "family_office";

/** Numeric limit type — either a hard cap or "unlimited". */
export type Limit = number | "unlimited";

export interface Plan {
  id: PlanTier;
  /** Human-readable display name. */
  name: string;
  /** Short tag-line shown on pricing cards. */
  tagline: string;
  /** Monthly price in AUD; 0 = free. */
  priceAUDMonthly: number;
  /** Annual price in AUD; 0 = free. */
  priceAUDAnnual: number;
  /** Sort order — lower is shown first. */
  order: number;
  /** Hard limits enforced by accessControl. */
  limits: {
    properties: Limit;
    scenarios: Limit;
    households: Limit;
    stockHoldings: Limit;
    cryptoHoldings: Limit;
    recurringBills: Limit;
  };
  /** Marketing bullets shown on pricing page. */
  highlights: string[];
}

export const PLANS: Record<PlanTier, Plan> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "See your wealth in one place.",
    priceAUDMonthly: 0,
    priceAUDAnnual: 0,
    order: 1,
    limits: {
      properties: 1,
      scenarios: 1,
      households: 1,
      stockHoldings: 5,
      cryptoHoldings: 3,
      recurringBills: 10,
    },
    highlights: [
      "Snapshot dashboard",
      "1 property + 5 stocks + 3 crypto",
      "Basic recurring bills",
      "Demo decision matrix",
    ],
  },

  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Run the numbers on your full picture.",
    priceAUDMonthly: 9,
    priceAUDAnnual: 90,
    order: 2,
    limits: {
      properties: 3,
      scenarios: 5,
      households: 1,
      stockHoldings: 25,
      cryptoHoldings: 15,
      recurringBills: 50,
    },
    highlights: [
      "Everything in Free",
      "Cashflow forecast engine",
      "Tax strategy basics",
      "Live market prices",
      "Up to 3 properties",
    ],
  },

  pro: {
    id: "pro",
    name: "Pro",
    tagline: "The full Family Wealth Lab toolkit.",
    priceAUDMonthly: 29,
    priceAUDAnnual: 290,
    order: 3,
    limits: {
      properties: 10,
      scenarios: 25,
      households: 1,
      stockHoldings: "unlimited",
      cryptoHoldings: "unlimited",
      recurringBills: "unlimited",
    },
    highlights: [
      "Everything in Starter",
      "Decision engine",
      "Monte Carlo forecasts",
      "CGT simulator",
      "Tax-alpha strategies",
      "AI insights",
      "Unlimited holdings",
    ],
  },

  family_office: {
    id: "family_office",
    name: "Family Office",
    tagline: "Multi-household, advisor-grade.",
    priceAUDMonthly: 89,
    priceAUDAnnual: 890,
    order: 4,
    limits: {
      properties: "unlimited",
      scenarios: "unlimited",
      households: 5,
      stockHoldings: "unlimited",
      cryptoHoldings: "unlimited",
      recurringBills: "unlimited",
    },
    highlights: [
      "Everything in Pro",
      "Up to 5 households",
      "Advisor handoff exports",
      "Priority support",
      "Custom reports",
      "API access (beta)",
    ],
  },
};

export const PLAN_LIST: Plan[] = Object.values(PLANS).sort((a, b) => a.order - b.order);

/** Compare two plan tiers — returns a number for ordering / gating logic. */
export function planRank(p: PlanTier): number {
  return PLANS[p].order;
}

/** True if `userPlan` includes (>=) `required`. */
export function meetsTier(userPlan: PlanTier, required: PlanTier): boolean {
  return planRank(userPlan) >= planRank(required);
}
