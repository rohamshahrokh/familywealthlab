"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import {
  optionalNumber,
  optionalDate,
  optionalText,
  requiredText,
  householdIdSchema,
  formToObject,
  formatZodError,
  friendlyDbError,
} from "@/lib/forms/zodHelpers";
import { refreshSnapshotCache } from "@/lib/snapshot";
import { logLedgerChange } from "@/lib/audit";

const PropertySchema = z.object({
  household_id:    householdIdSchema,
  name:            requiredText("Property name", 1, 120),
  type:            z.enum(["ppor", "owner_occupied", "investment"], {
    errorMap: () => ({ message: "Type must be PPOR, owner-occupied, or investment" }),
  }),
  purchase_price:  optionalNumber("Purchase price"),
  current_value:   optionalNumber("Current value"),
  loan_amount:     optionalNumber("Loan balance"),
  interest_rate:   optionalNumber("Interest rate", 1),
  loan_term_years: optionalNumber("Loan term", 60),
  settlement_date: optionalDate,
  rental_income:   optionalNumber("Rental income"),
  expenses:        optionalNumber("Property expenses"),
  notes:           optionalText(2000),
});

export async function createProperty(_prev: unknown, formData: FormData) {
  let session;
  try {
    session = await requireUser();
  } catch (e) {
    console.error("[properties.createProperty] auth failure", e);
    return { ok: false, error: "Not signed in" };
  }

  const parsed = PropertySchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    console.error(
      "[properties.createProperty] zod rejection",
      JSON.stringify(parsed.error.issues, null, 2),
    );
    return { ok: false, error: formatZodError(parsed.error) };
  }

  const input = parsed.data;
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .schema("ledger")
    .from("properties")
    .insert(input)
    .select("id")
    .single();

  if (error) {
    console.error("[properties.createProperty] supabase error", {
      code: (error as { code?: string }).code,
      message: error.message,
      details: (error as { details?: string }).details,
      hint: (error as { hint?: string }).hint,
      household_id: input.household_id,
    });
    return { ok: false, error: friendlyDbError(error) };
  }

  await logLedgerChange(supabase, {
    household_id: input.household_id,
    user_id: session.user.id,
    table_name: "properties",
    row_id: data.id,
    action: "insert",
    diff: input,
  });

  await refreshSnapshotCache(input.household_id).catch((err) => {
    console.error("[properties.createProperty] cache refresh failed", err);
  });

  revalidatePath(`/workspace/${input.household_id}/wealth/properties`);
  revalidatePath(`/workspace/${input.household_id}/overview`);
  revalidatePath(`/workspace/${input.household_id}/decision`);
  return { ok: true };
}

export async function deleteProperty(formData: FormData): Promise<void> {
  const session = await requireUser();
  const householdId = String(formData.get("household_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!householdId || !id) return;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .schema("ledger")
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);

  if (error) {
    console.error("[properties.deleteProperty] supabase error", error);
    revalidatePath(`/workspace/${householdId}/wealth/properties`);
    return;
  }

  await logLedgerChange(supabase, {
    household_id: householdId,
    user_id: session.user.id,
    table_name: "properties",
    row_id: id,
    action: "delete",
    diff: {},
  });

  await refreshSnapshotCache(householdId).catch(() => undefined);

  revalidatePath(`/workspace/${householdId}/wealth/properties`);
  revalidatePath(`/workspace/${householdId}/overview`);
  revalidatePath(`/workspace/${householdId}/decision`);
}
