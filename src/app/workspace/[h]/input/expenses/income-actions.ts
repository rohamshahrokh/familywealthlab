"use server";

/**
 * Income ledger server actions.
 *
 * Writes to `ledger.income_sources` table.
 * Columns: id, household_id, source, label, amount, cadence,
 *          frequency, member, recorded_on, notes.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import {
  optionalText,
  optionalDate,
  householdIdSchema,
  formToObject,
  formatZodError,
  friendlyDbError,
} from "@/lib/forms/zodHelpers";
import { refreshSnapshotCache } from "@/lib/snapshot";
import { logLedgerChange } from "@/lib/audit";

import {
  INCOME_SOURCES,
  INCOME_FREQUENCIES,
  frequencyToCadence,
  toMonthlyEquiv,
} from "./income-constants";

// ─── Validation ─────────────────────────────────────────────────────────────
const IncomeSchema = z.object({
  household_id: householdIdSchema,
  source:       z.enum(INCOME_SOURCES, { errorMap: () => ({ message: "Invalid source" }) }),
  label:        optionalText(120),
  amount:       z.coerce.number().positive("Amount must be > 0"),
  frequency:    z.enum(INCOME_FREQUENCIES, { errorMap: () => ({ message: "Invalid frequency" }) }),
  member:       optionalText(40),
  recorded_on:  optionalDate,
  notes:        optionalText(2000),
});

type IncomeState = { ok: boolean; error?: string } | null;

export async function createIncome(_prev: unknown, formData: FormData): Promise<IncomeState> {
  const session = await requireUser();
  const parsed = IncomeSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  const { amount, frequency, ...rest } = parsed.data;
  const monthlyAmount = toMonthlyEquiv(amount, frequency);
  const cadence = frequencyToCadence(frequency);

  const input = {
    ...rest,
    amount: monthlyAmount, // store as monthly equiv for engine
    cadence,
    frequency, // store UI label
  };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .schema("ledger")
    .from("income_sources")
    .insert(input)
    .select("id")
    .single();

  if (error) {
    console.error("[income.create] supabase", error);
    return { ok: false, error: friendlyDbError(error) };
  }

  await logLedgerChange(supabase, {
    household_id: input.household_id,
    user_id: session.user.id,
    table_name: "income_sources",
    row_id: data.id,
    action: "insert",
    diff: input,
  });
  await refreshSnapshotCache(input.household_id).catch(() => undefined);
  revalidatePath(`/workspace/${input.household_id}/input/expenses`);
  revalidatePath(`/workspace/${input.household_id}/overview`);
  return { ok: true };
}

export async function deleteIncome(formData: FormData): Promise<void> {
  const session = await requireUser();
  const householdId = String(formData.get("household_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!householdId || !id) return;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .schema("ledger")
    .from("income_sources")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);

  if (error) {
    console.error("[income.delete] supabase", error);
    return;
  }
  await logLedgerChange(supabase, {
    household_id: householdId,
    user_id: session.user.id,
    table_name: "income_sources",
    row_id: id,
    action: "delete",
    diff: {},
  });
  await refreshSnapshotCache(householdId).catch(() => undefined);
  revalidatePath(`/workspace/${householdId}/input/expenses`);
  revalidatePath(`/workspace/${householdId}/overview`);
}

export async function bulkDeleteIncome(formData: FormData): Promise<void> {
  const session = await requireUser();
  const householdId = String(formData.get("household_id") ?? "");
  const idsRaw = String(formData.get("ids") ?? "");
  const ids = idsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  if (!householdId || ids.length === 0) return;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .schema("ledger")
    .from("income_sources")
    .delete()
    .in("id", ids)
    .eq("household_id", householdId);

  if (error) {
    console.error("[income.bulkDelete] supabase", error);
    return;
  }
  await refreshSnapshotCache(householdId).catch(() => undefined);
  revalidatePath(`/workspace/${householdId}/input/expenses`);
  revalidatePath(`/workspace/${householdId}/overview`);
}
