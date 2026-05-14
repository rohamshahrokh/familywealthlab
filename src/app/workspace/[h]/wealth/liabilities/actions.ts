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

const LiabilitySchema = z.object({
  household_id:  householdIdSchema,
  name:          requiredText("Liability name", 1, 120),
  type:          z.enum(["credit_card","personal_loan","heloc","student_loan","other"], {
    errorMap: () => ({ message: "Type must be credit card, personal loan, HELOC, student loan, or other" }),
  }),
  balance:       optionalNumber("Balance"),
  interest_rate: optionalNumber("Interest rate", 1),
  min_payment:   optionalNumber("Minimum payment"),
  notes:         optionalText(2000),
});

export async function createLiability(_prev: unknown, formData: FormData) {
  const session = await requireUser();
  const parsed = LiabilitySchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    console.error("[liabilities.create] zod", JSON.stringify(parsed.error.issues, null, 2));
    return { ok: false, error: formatZodError(parsed.error) };
  }
  const input = { ...parsed.data, balance: parsed.data.balance ?? 0 };
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.schema("ledger").from("liabilities")
    .insert(input).select("id").single();
  if (error) {
    console.error("[liabilities.create] supabase", { code: (error as any).code, message: error.message });
    return { ok: false, error: friendlyDbError(error) };
  }
  await logLedgerChange(supabase, {
    household_id: input.household_id, user_id: session.user.id,
    table_name: "liabilities", row_id: data.id, action: "insert", diff: input,
  });
  await refreshSnapshotCache(input.household_id).catch(() => undefined);
  revalidatePath(`/workspace/${input.household_id}/wealth/liabilities`);
  revalidatePath(`/workspace/${input.household_id}/overview`);
  return { ok: true };
}

export async function deleteLiability(formData: FormData): Promise<void> {
  const session = await requireUser();
  const householdId = String(formData.get("household_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!householdId || !id) return;
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.schema("ledger").from("liabilities")
    .delete().eq("id", id).eq("household_id", householdId);
  if (error) { console.error("[liabilities.delete] supabase", error); return; }
  await logLedgerChange(supabase, {
    household_id: householdId, user_id: session.user.id,
    table_name: "liabilities", row_id: id, action: "delete", diff: {},
  });
  await refreshSnapshotCache(householdId).catch(() => undefined);
  revalidatePath(`/workspace/${householdId}/wealth/liabilities`);
  revalidatePath(`/workspace/${householdId}/overview`);
}
