"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import {
  optionalNumber, optionalText, requiredText, householdIdSchema,
  formToObject, formatZodError, friendlyDbError,
} from "@/lib/forms/zodHelpers";
import { refreshSnapshotCache } from "@/lib/snapshot";
import { logLedgerChange } from "@/lib/audit";

const CashSchema = z.object({
  household_id: householdIdSchema,
  name:         requiredText("Account name", 1, 120),
  type:         z.enum(["checking","savings","offset","emergency","other"], {
    errorMap: () => ({ message: "Type must be checking, savings, offset, emergency or other" }),
  }),
  institution:  optionalText(120),
  balance:      optionalNumber("Balance"),
  currency:     z.preprocess(
                   (v) => (typeof v === "string" && v.trim() ? v.trim().toUpperCase() : "AUD"),
                   z.string().length(3),
                 ),
  notes:        optionalText(2000),
});

export async function createCashAccount(_prev: unknown, formData: FormData) {
  const session = await requireUser();
  const parsed = CashSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    console.error("[cash.create] zod", JSON.stringify(parsed.error.issues, null, 2));
    return { ok: false, error: formatZodError(parsed.error) };
  }
  const input = { ...parsed.data, balance: parsed.data.balance ?? 0 };
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.schema("ledger").from("cash_accounts")
    .insert(input).select("id").single();
  if (error) {
    console.error("[cash.create] supabase", { code: (error as any).code, message: error.message });
    return { ok: false, error: friendlyDbError(error) };
  }
  await logLedgerChange(supabase, {
    household_id: input.household_id, user_id: session.user.id,
    table_name: "cash_accounts", row_id: data.id, action: "insert", diff: input,
  });
  await refreshSnapshotCache(input.household_id).catch(() => undefined);
  revalidatePath(`/workspace/${input.household_id}/wealth/cash`);
  revalidatePath(`/workspace/${input.household_id}/overview`);
  return { ok: true };
}

export async function deleteCashAccount(formData: FormData): Promise<void> {
  const session = await requireUser();
  const householdId = String(formData.get("household_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!householdId || !id) return;
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.schema("ledger").from("cash_accounts")
    .delete().eq("id", id).eq("household_id", householdId);
  if (error) {
    console.error("[cash.delete] supabase", error);
    return;
  }
  await logLedgerChange(supabase, {
    household_id: householdId, user_id: session.user.id,
    table_name: "cash_accounts", row_id: id, action: "delete", diff: {},
  });
  await refreshSnapshotCache(householdId).catch(() => undefined);
  revalidatePath(`/workspace/${householdId}/wealth/cash`);
  revalidatePath(`/workspace/${householdId}/overview`);
}
