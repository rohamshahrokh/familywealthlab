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

// ─── Full property schema covering every depth column ─────────────────────────
const PropertySchema = z.object({
  household_id:        householdIdSchema,
  name:                requiredText("Property name", 1, 120),
  type:                z.enum(["ppor", "owner_occupied", "investment"], {
    errorMap: () => ({ message: "Type must be PPOR, owner-occupied, or investment" }),
  }),
  // Purchase
  purchase_price:      optionalNumber("Purchase price"),
  current_value:       optionalNumber("Current value"),
  deposit:             optionalNumber("Deposit"),
  stamp_duty:          optionalNumber("Stamp duty"),
  legal_fees:          optionalNumber("Legal fees"),
  building_inspection: optionalNumber("Building inspection"),
  loan_setup_fees:     optionalNumber("Loan setup fees"),
  purchase_date:       optionalDate,
  settlement_date:     optionalDate,
  // Loan
  loan_amount:         optionalNumber("Loan amount"),
  interest_rate:       optionalNumber("Interest rate", 1),
  loan_term_years:     optionalNumber("Loan term years", 60),
  loan_type:           z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.union([z.enum(["PI", "IO", "OFFSET", "LINE_OF_CREDIT"]), z.null()])
  ),
  io_period_start:     optionalDate,
  io_period_end:       optionalDate,
  offset_balance:      optionalNumber("Offset balance"),
  // Rental
  weekly_rent:         optionalNumber("Weekly rent"),
  rental_income:       optionalNumber("Annual rental income"),
  rental_growth:       optionalNumber("Rental growth", 1),
  vacancy_rate:        optionalNumber("Vacancy rate", 1),
  management_fee:      optionalNumber("Management fee", 1),
  rental_start_date:   optionalDate,
  // Operating expenses (annual)
  insurance:           optionalNumber("Insurance"),
  council_rates:       optionalNumber("Council rates"),
  water_rates:         optionalNumber("Water rates"),
  maintenance:         optionalNumber("Maintenance"),
  body_corporate:      optionalNumber("Body corporate"),
  land_tax:            optionalNumber("Land tax"),
  expenses:            optionalNumber("Other annual expenses"),
  // Projection
  capital_growth:      optionalNumber("Capital growth", 1),
  renovation_costs:    optionalNumber("Renovation costs"),
  planned_sale_date:   optionalDate,
  selling_costs:       optionalNumber("Selling costs", 1),
  projection_years:    optionalNumber("Projection years", 50),
  notes:               optionalText(2000),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function revalidateAll(householdId: string) {
  revalidatePath(`/workspace/${householdId}/wealth/properties`);
  revalidatePath(`/workspace/${householdId}/overview`);
  revalidatePath(`/workspace/${householdId}/decision`);
}

// ─── Create ───────────────────────────────────────────────────────────────────
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

  revalidateAll(input.household_id);
  return { ok: true };
}

// ─── Update ───────────────────────────────────────────────────────────────────
export async function updateProperty(_prev: unknown, formData: FormData) {
  let session;
  try {
    session = await requireUser();
  } catch (e) {
    console.error("[properties.updateProperty] auth failure", e);
    return { ok: false, error: "Not signed in" };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing property id" };

  const parsed = PropertySchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    console.error(
      "[properties.updateProperty] zod rejection",
      JSON.stringify(parsed.error.issues, null, 2),
    );
    return { ok: false, error: formatZodError(parsed.error) };
  }

  const input = parsed.data;
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .schema("ledger")
    .from("properties")
    .update(input)
    .eq("id", id)
    .eq("household_id", input.household_id);

  if (error) {
    console.error("[properties.updateProperty] supabase error", {
      code: (error as { code?: string }).code,
      message: error.message,
      household_id: input.household_id,
      id,
    });
    return { ok: false, error: friendlyDbError(error) };
  }

  await logLedgerChange(supabase, {
    household_id: input.household_id,
    user_id: session.user.id,
    table_name: "properties",
    row_id: id,
    action: "update",
    diff: input,
  });

  await refreshSnapshotCache(input.household_id).catch((err) => {
    console.error("[properties.updateProperty] cache refresh failed", err);
  });

  revalidateAll(input.household_id);
  return { ok: true };
}

// ─── Delete ───────────────────────────────────────────────────────────────────
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

  revalidateAll(householdId);
}
