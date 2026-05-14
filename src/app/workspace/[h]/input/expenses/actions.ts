"use server";

/**
 * Expenses ledger server actions.
 *
 * Writes to `ledger.expenses` (provisioned by 20260601000000_ledger.sql).
 * The Snapshot's cashflow + buffer KPIs read this table.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import {
  optionalText, householdIdSchema,
  formToObject, formatZodError, friendlyDbError,
} from "@/lib/forms/zodHelpers";
import { refreshSnapshotCache } from "@/lib/snapshot";
import { logLedgerChange } from "@/lib/audit";

const ExpenseSchema = z.object({
  household_id: householdIdSchema,
  category: z.enum(
    ["housing","transport","food","utilities","health","childcare","leisure","insurance","other"],
    { errorMap: () => ({ message: "Invalid category" }) },
  ),
  label:           optionalText(120),
  amount:          z.coerce.number().nonnegative("Amount must be 0 or more"),
  cadence:         z.enum(["monthly","annual","one_off"]),
  is_debt_service: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()).optional(),
  notes:           optionalText(2000),
});

export async function createExpense(_prev: unknown, formData: FormData) {
  const session = await requireUser();
  const parsed = ExpenseSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    console.error("[expense.create] zod", JSON.stringify(parsed.error.issues, null, 2));
    return { ok: false, error: formatZodError(parsed.error) };
  }
  const input = { ...parsed.data, is_debt_service: parsed.data.is_debt_service ?? false };
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.schema("ledger").from("expenses")
    .insert(input).select("id").single();
  if (error) {
    console.error("[expense.create] supabase", { code: (error as any).code, message: error.message });
    return { ok: false, error: friendlyDbError(error) };
  }
  await logLedgerChange(supabase, {
    household_id: input.household_id, user_id: session.user.id,
    table_name: "expenses", row_id: data.id, action: "insert", diff: input,
  });
  await refreshSnapshotCache(input.household_id).catch(() => undefined);
  revalidatePath(`/workspace/${input.household_id}/input/expenses`);
  revalidatePath(`/workspace/${input.household_id}/overview`);
  return { ok: true };
}

export async function deleteExpense(formData: FormData): Promise<void> {
  const session = await requireUser();
  const householdId = String(formData.get("household_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!householdId || !id) return;
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.schema("ledger").from("expenses")
    .delete().eq("id", id).eq("household_id", householdId);
  if (error) {
    console.error("[expense.delete] supabase", error);
    return;
  }
  await logLedgerChange(supabase, {
    household_id: householdId, user_id: session.user.id,
    table_name: "expenses", row_id: id, action: "delete", diff: {},
  });
  await refreshSnapshotCache(householdId).catch(() => undefined);
  revalidatePath(`/workspace/${householdId}/input/expenses`);
  revalidatePath(`/workspace/${householdId}/overview`);
}
