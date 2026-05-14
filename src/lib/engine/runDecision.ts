import "server-only";
import {
  runScenarioV2,
  type ExtendedScenarioResult,
  type ScenarioDelta,
  type DashboardInputs,
} from "@fwl/engine";
import { buildDashboardInputs } from "@/lib/dashboard/buildDashboardInputs";

export type DecisionOptions = {
  /** Name shown in the result card. */
  name?: string;
  /** Engine deltas — empty array = "baseline / hold" candidate. */
  deltas?: ScenarioDelta[];
  /** Horizon months, default 120 (10y). */
  horizonMonths?: number;
  /** Monte Carlo runs. Default 200 in Phase 1 to keep first-paint fast. */
  simulationCount?: number;
  /** Pass-through tax context. */
  hasHelpDebt?: boolean;
  hasPrivateHospitalCover?: boolean;
};

/**
 * Phase 1 Decision Engine entry point. Builds DashboardInputs from the ledger,
 * runs `runScenarioV2` against a default ("hold") candidate, returns the full
 * ExtendedScenarioResult plus the inputs that produced it.
 *
 * Determinism: passing the same household_id + same deltas + same options must
 * yield the same ExtendedScenarioResult byte-for-byte (the engine uses seeded
 * RNGs internally; we never inject Date.now or Math.random here).
 *
 * Phase 2 will add:
 *   - Multi-candidate generation via `decisionEngine/candidateGenerator`
 *   - Result caching keyed on a stable hash of (inputs, deltas, options)
 *   - AI narrative polish (Pro tier)
 */
export async function runDecision(
  householdId: string,
  opts: DecisionOptions = {},
): Promise<{ inputs: DashboardInputs; result: ExtendedScenarioResult }> {
  const inputs = await buildDashboardInputs(householdId);
  const result = runScenarioV2({
    dashboardInputs: inputs,
    name: opts.name ?? "Baseline (Hold)",
    deltas: opts.deltas ?? [],
    horizonMonths: opts.horizonMonths ?? 120,
    simulationCount: opts.simulationCount ?? 200,
    seed: stableSeed(householdId),
    hasHelpDebt: opts.hasHelpDebt ?? false,
    hasPrivateHospitalCover: opts.hasPrivateHospitalCover ?? false,
  });
  return { inputs, result };
}

/** Deterministic per-household seed so retries are reproducible. */
function stableSeed(householdId: string): number {
  let h = 2166136261;
  for (let i = 0; i < householdId.length; i++) {
    h ^= householdId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
