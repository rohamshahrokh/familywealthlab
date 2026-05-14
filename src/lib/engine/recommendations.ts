import type { ExtendedScenarioResult } from "@fwl/engine";
import type { RecommendationSeverity } from "@/components/workspace/decision";

export interface DecisionRecommendation {
  id: string;
  severity: RecommendationSeverity;
  title: string;
  body: string;
  reason?: string;
  tags?: string[];
}

/**
 * Deterministically generate 3–5 recommendations from an ExtendedScenarioResult.
 *
 * Every line is derived from real engine output — no fabricated numbers, no
 * Math.random, no calls home. Same input → same output, byte-for-byte.
 *
 * Phase 2 will expand this to:
 *   - Read from `decisionEngine/candidateGenerator` once vendored
 *   - Score alternative deltas (offset bump, rate-lock, sell-IP)
 *   - Pass through `polishNarrativeWithAi` on Pro tier
 */
export function deriveRecommendations(
  result: ExtendedScenarioResult,
): DecisionRecommendation[] {
  const recs: DecisionRecommendation[] = [];
  const serv = result.serviceability;
  const risk = result.riskMetrics;

  // ── R1 — Default probability ──────────────────────────────────────
  const defaultPct = result.defaultProbability;
  if (defaultPct >= 0.05) {
    recs.push({
      id: "default-risk",
      severity: defaultPct >= 0.20 ? "critical" : "act",
      title: "Default probability is above an acceptable threshold",
      body:
        `Across ${result.simulationCount.toLocaleString()} simulations, ` +
        `${(defaultPct * 100).toFixed(1)}% of paths reach insolvency within ` +
        `${Math.round(result.horizonMonths / 12)} years. Reducing leverage, ` +
        `building a 6-month liquidity buffer, or refinancing to a lower ` +
        `effective rate are the highest-leverage levers.`,
      reason:
        result.medianDefaultMonth != null
          ? `Median default fires at month ${result.medianDefaultMonth + 1}.`
          : undefined,
      tags: ["Leverage", "Liquidity"],
    });
  }

  // ── R2 — Liquidity stress ─────────────────────────────────────────
  const liquidityStress = result.liquidityStressProbability;
  if (liquidityStress >= 0.10) {
    recs.push({
      id: "liquidity-buffer",
      severity:
        liquidityStress >= 0.30
          ? "critical"
          : liquidityStress >= 0.20
            ? "act"
            : "watch",
      title: "Liquidity buffer is thin against the planning horizon",
      body:
        `${(liquidityStress * 100).toFixed(1)}% of simulated paths hit a ` +
        `liquidity stress event before terminal horizon. Holding 3–6 months ` +
        `of essential outflows in offset or HISA reduces this materially ` +
        `without touching investment exposure.`,
      reason:
        result.medianLiquidityFirstMonth != null
          ? `First stress event appears around month ${result.medianLiquidityFirstMonth + 1} in the median bad path.`
          : undefined,
      tags: ["Liquidity"],
    });
  }

  // ── R3 — Negative equity ──────────────────────────────────────────
  const negEquity = result.negativeEquityProbability;
  if (negEquity >= 0.05) {
    recs.push({
      id: "negative-equity",
      severity: negEquity >= 0.20 ? "act" : "watch",
      title: "Negative-equity risk in stress scenarios",
      body:
        `In ${(negEquity * 100).toFixed(1)}% of simulations, total property ` +
        `value falls below outstanding loan balance at some point. This is a ` +
        `pricing-shock risk rather than a cash-flow one — typically resolved ` +
        `by longer hold periods or by paying down higher-LVR loans first.`,
      reason:
        result.medianNegEquityFirstMonth != null
          ? `Median first-hit month: ${result.medianNegEquityFirstMonth + 1}.`
          : undefined,
      tags: ["Property", "Leverage"],
    });
  }

  // ── R4 — Refinance pressure ───────────────────────────────────────
  const refi = result.refinancePressureProbability;
  if (refi >= 0.10) {
    recs.push({
      id: "refinance-pressure",
      severity: refi >= 0.30 ? "act" : "watch",
      title: "Refinance pressure builds in mid-horizon paths",
      body:
        `${(refi * 100).toFixed(1)}% of paths produce conditions where ` +
        `refinancing becomes difficult — typically LVR drift past 80% or DSR ` +
        `bands moving from stretched to stressed. Fix-rate windows or ` +
        `offset top-ups before this hits are the cleanest hedges.`,
      tags: ["Property", "Rates"],
    });
  }

  // ── R5 — Serviceability band ──────────────────────────────────────
  if (serv?.band === "stressed") {
    recs.push({
      id: "serviceability-stressed",
      severity: "act",
      title: "Buffered serviceability is in the stressed band",
      body:
        `At an APRA-style buffered rate of ${(serv.bufferedRate * 100).toFixed(2)}%, ` +
        `your debt-service ratio is ${(serv.dsr * 100).toFixed(1)}% and ` +
        `LVR is ${(serv.lvr * 100).toFixed(1)}%. Lenders typically classify ` +
        `this as a non-extendable position — meaning new borrowing is ` +
        `unlikely without first reducing existing exposure.`,
      reason: serv.rationale?.[0],
      tags: ["Lending"],
    });
  } else if (serv?.band === "stretched") {
    recs.push({
      id: "serviceability-stretched",
      severity: "watch",
      title: "Serviceability has limited headroom for new borrowing",
      body:
        `DSR is ${(serv.dsr * 100).toFixed(1)}% at a buffered rate of ` +
        `${(serv.bufferedRate * 100).toFixed(2)}%. Healthy ` +
        `expansion would require either income growth, principal paydown, or ` +
        `a longer-term refinance to free DSR headroom.`,
      tags: ["Lending"],
    });
  }

  // ── R6 — Concentration ────────────────────────────────────────────
  if (risk?.concentrationRisk >= 0.80) {
    recs.push({
      id: "concentration",
      severity: "watch",
      title: "Net worth is concentrated in a single asset class",
      body:
        `${(risk.concentrationRisk * 100).toFixed(0)}% of net worth sits in ` +
        `one asset class. Diversifying gradually — without forced ` +
        `disposals — reduces tail risk on the horizon.`,
      tags: ["Diversification"],
    });
  }

  // ── R7 — CVaR / left-tail ─────────────────────────────────────────
  if (risk?.cvarDollars95 > 0 && result.initialNetWorth > 0) {
    const cvarRatio = risk.cvarDollars95 / result.initialNetWorth;
    if (cvarRatio >= 0.30) {
      recs.push({
        id: "left-tail",
        severity: "watch",
        title: "Tail-risk losses are material relative to today's net worth",
        body:
          `Conditional VaR at 5% indicates an average ` +
          `$${Math.round(risk.cvarDollars95).toLocaleString("en-AU")} loss ` +
          `versus today's position in the worst 5% of paths — about ` +
          `${(cvarRatio * 100).toFixed(0)}% of current net worth.`,
        tags: ["Tail risk"],
      });
    }
  }

  // ── Always include a baseline if nothing surfaced ─────────────────
  if (recs.length === 0) {
    recs.push({
      id: "all-clear",
      severity: "advisory",
      title: "No high-priority risks detected on the current ledger",
      body:
        `Across ${result.simulationCount.toLocaleString()} simulated paths over ` +
        `${Math.round(result.horizonMonths / 12)} years, the engine did not ` +
        `surface a stress signal above its action threshold. As ledger data ` +
        `gets richer, the engine will surface higher-resolution recommendations.`,
      tags: ["Baseline"],
    });
  }

  // ── Engine warnings get appended verbatim (lower priority) ────────
  for (const w of result.warnings ?? []) {
    recs.push({
      id: `warn-${recs.length}`,
      severity: "advisory",
      title: "Engine warning",
      body: w,
      tags: ["Diagnostic"],
    });
  }

  return recs.slice(0, 5);
}

/**
 * Survival probability = 1 − default probability. We expose this directly
 * because the UI label is "Survival %" not "Default %".
 */
export function survivalFromResult(result: ExtendedScenarioResult): number {
  return Math.max(0, Math.min(1, 1 - (result.defaultProbability ?? 0)));
}

/** Median terminal NW from samples — engine pre-sorts, but be defensive. */
export function medianTerminalNw(result: ExtendedScenarioResult): number | null {
  const samples = result.terminalNwSorted?.length
    ? result.terminalNwSorted
    : [...(result.terminalNwSamples ?? [])].sort((a, b) => a - b);
  if (!samples.length) return null;
  const mid = Math.floor(samples.length / 2);
  return samples.length % 2 === 0
    ? (samples[mid - 1] + samples[mid]) / 2
    : samples[mid];
}
