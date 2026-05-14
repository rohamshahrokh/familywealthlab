"use server";

import { z } from "zod";
import { computeCgt } from "@fwl/engine";
import { getSessionUser } from "@/lib/auth";

const cgtSchema = z.object({
  householdId: z.string().uuid(),
  salePrice: z.number().min(0).max(1e9),
  costBase: z.number().min(0).max(1e9),
  heldMoreThan12Months: z.boolean(),
  annualWageIncome: z.number().min(0).max(1e9),
});

export type CgtSimulationInput = z.infer<typeof cgtSchema>;

export type CgtSimulationResult =
  | { ok: true; rawGain: number; discountedGain: number; cgtPayable: number; netProceeds: number }
  | { ok: false; error: string };

/**
 * Server action — runs `computeCgt` on the engine and returns the result.
 * Auth-gated by `getSessionUser()`; household ownership is enforced by RLS
 * at the data layer (this action does not read any rows, but stays scoped
 * to the active user for audit consistency).
 */
export async function simulateCgt(raw: CgtSimulationInput): Promise<CgtSimulationResult> {
  await getSessionUser();
  const parsed = cgtSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input." };
  }
  const out = computeCgt({
    salePrice: parsed.data.salePrice,
    costBase: parsed.data.costBase,
    heldMoreThan12Months: parsed.data.heldMoreThan12Months,
    annualWageIncome: parsed.data.annualWageIncome,
  });
  return {
    ok: true,
    rawGain: out.rawGain,
    discountedGain: out.discountedGain,
    cgtPayable: out.cgtPayable,
    netProceeds: out.netProceeds,
  };
}
