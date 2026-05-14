"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AssumptionsFormInput {
  householdId: string;
  fireTargetAmount: number | null;
  fireTargetAge: number | null;
  retirementAge: number | null;
  emergencyBufferMonths: number | null;
  returnAssumption: number | null;     // decimal, e.g. 0.07
  inflationAssumption: number | null;  // decimal, e.g. 0.025
}

export type AssumptionsActionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Upsert the household's assumptions row. RLS enforces household membership;
 * any tampering with `householdId` fails at the database level.
 */
export async function saveAssumptions(
  input: AssumptionsFormInput,
): Promise<AssumptionsActionResult> {
  await getSessionUser();
  const supabase = createSupabaseServerClient();

  const payload: Record<string, number | string | null> = {
    household_id: input.householdId,
    fire_target_amount: input.fireTargetAmount,
    fire_target_age: input.fireTargetAge,
    retirement_age: input.retirementAge,
    emergency_buffer_months: input.emergencyBufferMonths,
    return_assumption: input.returnAssumption,
    inflation_assumption: input.inflationAssumption,
  };

  const { error } = await supabase
    .schema("ledger")
    .from("assumptions")
    .upsert(payload, { onConflict: "household_id" });

  if (error) return { ok: false, error: error.message };

  // Snapshot reads from this table — bust the cached page so the next read
  // sees the new values immediately.
  revalidatePath(`/workspace/${input.householdId}`, "layout");
  return { ok: true };
}
