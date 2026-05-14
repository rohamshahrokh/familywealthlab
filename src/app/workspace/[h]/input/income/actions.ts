"use server";

/**
 * Income ledger server actions.
 *
 * Founder/internal mode: writes go to `ledger.income_sources` (already
 * provisioned by migration 20260601000000_ledger.sql). The Snapshot's
 * cashflow KPIs read from this table, so adding/deleting an income source
 * refreshes the Snapshot cache and revalidates the relevant routes.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import {
  optionalText, requiredText, householdIdSchema,
  formToObject, formatZodError, friendlyDbError,
} from "@/lib/forms/zodHelpers";
import { refreshSnapshotCache } from "@/lib/snapshot";
import { logLedgerChange } from "@/lib/audit";

const IncomeSchema = z.object({
  household_id: householdIdSchema,
  source:  z.enum(["salary", "rental", "dividend", "business", "other"], {
    errorMap: () => ({ message: "Source must be salary, rental, dividend, business or other" }),
  }),
  label:   optionalText(120),
  amount:  z.coerce.number().nonnegative("Amount must be 0 or more"),
  cadence: z.enum(["monthly", "annual", "one_off"], {
    errorMap: () => ({ message: "Cadence must be monthly, annual or one_off" }),
  }),
  starts_on: optionalText(20),
  ends_on:   optionalText(20),
  notes:     optionalText(2000),
});

export async function createIncomeSource(_prev: unknown, formData: FormData) {
  const session = await requireUser();
  const parsed = IncomeSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    console.error("[income.create] zod", JSON.stringify(parsed.error.issues, null, 2));
    return { ok: false, error: formatZodError(parsed.error) };
  }
  const input = parsed.data;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.schema("ledger").from("income_sources")
    .insert(input).select("id").single();
  if (error) {
    console.error("[income.create] supabase", { code: (error as any).code, message: error.message });
    return { ok: false, error: friendlyDbError(error) };
  }
  await logLedgerChange(supabase, {
    household_id: input.household_id, user_id: session.user.id,
    table_name: "income_sources", row_id: data.id, action: "insert", diff: input,
  });
  await refreshSnapshotCache(input.household_id).catch(() => undefined);
  revalidatePath(`/workspace/${input.household_id}/input/income`);
  revalidatePath(`/workspace/${input.household_id}/overview`);
  return { ok: true };
}

export async function deleteIncomeSource(formData: FormData): Promise<void> {
  const session = await requireUser();
  const householdId = String(formData.get("household_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!householdId || !id) return;
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.schema("ledger").from("income_sources")
    .delete().eq("id", id).eq("household_id", householdId);
  if (error) {
    console.error("[income.delete] supabase", error);
    return;
  }
  await logLedgerChange(supabase, {
    household_id: householdId, user_id: session.user.id,
    table_name: "income_sources", row_id: id, action: "delete", diff: {},
  });
  await refreshSnapshotCache(householdId).catch(() => undefined);
  revalidatePath(`/workspace/${householdId}/input/income`);
  revalidatePath(`/workspace/${householdId}/overview`);
}
