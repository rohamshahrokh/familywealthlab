"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import {
  optionalNumber, optionalText, householdIdSchema,
  formToObject, formatZodError, friendlyDbError,
} from "@/lib/forms/zodHelpers";
import { refreshSnapshotCache } from "@/lib/snapshot";
import { logLedgerChange } from "@/lib/audit";

const SuperSchema = z.object({
  household_id:      householdIdSchema,
  owner_label:       optionalText(120),
  provider:          optionalText(120),
  balance:           optionalNumber("Balance"),
  contribution_rate: optionalNumber("Contribution rate", 1),
  preservation_age:  optionalNumber("Preservation age", 100),
  notes:             optionalText(2000),
});

export async function createSuperAccount(_prev: unknown, formData: FormData) {
  const session = await requireUser();
  const parsed = SuperSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    console.error("[super.create] zod", JSON.stringify(parsed.error.issues, null, 2));
    return { ok: false, error: formatZodError(parsed.error) };
  }
  const input = { ...parsed.data, balance: parsed.data.balance ?? 0 };
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.schema("ledger").from("super_accounts")
    .insert(input).select("id").single();
  if (error) {
    console.error("[super.create] supabase", { code: (error as any).code, message: error.message });
    return { ok: false, error: friendlyDbError(error) };
  }
  await logLedgerChange(supabase, {
    household_id: input.household_id, user_id: session.user.id,
    table_name: "super_accounts", row_id: data.id, action: "insert", diff: input,
  });
  await refreshSnapshotCache(input.household_id).catch(() => undefined);
  revalidatePath(`/workspace/${input.household_id}/wealth/super`);
  revalidatePath(`/workspace/${input.household_id}/overview`);
  return { ok: true };
}

export async function deleteSuperAccount(formData: FormData): Promise<void> {
  const session = await requireUser();
  const householdId = String(formData.get("household_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!householdId || !id) return;
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.schema("ledger").from("super_accounts")
    .delete().eq("id", id).eq("household_id", householdId);
  if (error) { console.error("[super.delete] supabase", error); return; }
  await logLedgerChange(supabase, {
    household_id: householdId, user_id: session.user.id,
    table_name: "super_accounts", row_id: id, action: "delete", diff: {},
  });
  await refreshSnapshotCache(householdId).catch(() => undefined);
  revalidatePath(`/workspace/${householdId}/wealth/super`);
  revalidatePath(`/workspace/${householdId}/overview`);
}
