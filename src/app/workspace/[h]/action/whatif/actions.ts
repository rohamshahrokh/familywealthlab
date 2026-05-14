"use server";

import { getSessionUser } from "@/lib/auth";
import { runDecision } from "@/lib/engine/runDecision";
import type { ScenarioDelta } from "@fwl/engine";

export interface WhatIfInputs {
  householdId: string;
  /** Extra monthly mortgage repayment, AUD. 0 = no change. */
  extraMortgagePerMonth: number;
  /** One-time offset deposit, AUD. 0 = no change. */
  offsetDeposit: number;
  /** Annual salary change, AUD (can be negative). */
  salaryChange: number;
}

export interface WhatIfResult {
  ok: true;
  baseline: {
    survivalPct: number;
    medianTerminalNw: number;
    defaultProb: number;
    liquidityProb: number;
  };
  scenario: {
    survivalPct: number;
    medianTerminalNw: number;
    defaultProb: number;
    liquidityProb: number;
  };
  deltas: {
    survivalPctDelta: number;
    medianTerminalNwDelta: number;
    defaultProbDelta: number;
    liquidityProbDelta: number;
  };
}

export interface WhatIfError { ok: false; error: string }

/**
 * Server action — runs the engine twice (baseline + scenario with deltas)
 * and returns a comparison object. All deltas are deterministic. No ledger
 * writes; this is a pure compute path the user can iterate on freely.
 */
export async function runWhatIf(input: WhatIfInputs): Promise<WhatIfResult | WhatIfError> {
  await getSessionUser();
  try {
    const deltas: ScenarioDelta[] = buildDeltas(input);

    const [{ result: baseline }, { result: scenario }] = await Promise.all([
      runDecision(input.householdId, { simulationCount: 200 }),
      runDecision(input.householdId, { simulationCount: 200, deltas, name: "What-If" }),
    ]);

    const medianBase = pickMedian(baseline.terminalNwSorted);
    const medianScen = pickMedian(scenario.terminalNwSorted);
    const survBase = 1 - (baseline.defaultProbability ?? 0);
    const survScen = 1 - (scenario.defaultProbability ?? 0);

    return {
      ok: true,
      baseline: {
        survivalPct: survBase,
        medianTerminalNw: medianBase,
        defaultProb: baseline.defaultProbability ?? 0,
        liquidityProb: baseline.liquidityStressProbability ?? 0,
      },
      scenario: {
        survivalPct: survScen,
        medianTerminalNw: medianScen,
        defaultProb: scenario.defaultProbability ?? 0,
        liquidityProb: scenario.liquidityStressProbability ?? 0,
      },
      deltas: {
        survivalPctDelta: survScen - survBase,
        medianTerminalNwDelta: medianScen - medianBase,
        defaultProbDelta: (scenario.defaultProbability ?? 0) - (baseline.defaultProbability ?? 0),
        liquidityProbDelta: (scenario.liquidityStressProbability ?? 0) - (baseline.liquidityStressProbability ?? 0),
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Engine error" };
  }
}

function buildDeltas(input: WhatIfInputs): ScenarioDelta[] {
  const out: ScenarioDelta[] = [];
  const today = new Date();
  const startKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}` as `${number}-${string}`;
  let id = 0;
  if (input.extraMortgagePerMonth > 0) {
    out.push({
      id: `wi-${id++}`,
      scenarioId: "whatif",
      deltaType: "extra_mortgage_repayment",
      activationMonth: startKey,
      params: { amountPerMonth: input.extraMortgagePerMonth },
      priority: 500,
      idempotencyKey: `wi-em-${input.extraMortgagePerMonth}`,
    });
  }
  if (input.offsetDeposit > 0) {
    out.push({
      id: `wi-${id++}`,
      scenarioId: "whatif",
      deltaType: "offset_deposit",
      activationMonth: startKey,
      params: { amount: input.offsetDeposit },
      priority: 400,
      idempotencyKey: `wi-od-${input.offsetDeposit}`,
    });
  }
  if (input.salaryChange !== 0) {
    out.push({
      id: `wi-${id++}`,
      scenarioId: "whatif",
      deltaType: "salary_change",
      activationMonth: startKey,
      params: { annualAmount: input.salaryChange },
      priority: 200,
      idempotencyKey: `wi-sc-${input.salaryChange}`,
    });
  }
  return out;
}

function pickMedian(sorted: number[]): number {
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
