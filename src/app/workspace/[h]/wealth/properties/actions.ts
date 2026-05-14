"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Zod schema — drives validation BEFORE the Supabase insert.
//
// Notes on field handling (do not simplify — each preprocess fixes a class of
// bug that previously surfaced as a generic "Invalid input" toast):
//
//  • Numeric fields use `optionalNumber` which:
//      - treats "" / null / undefined as `null`
//      - rejects non-numeric strings explicitly (so we surface the bad field)
//      - never coerces null → 0 (which `z.coerce.number()` does by default)
//  • settlement_date uses `optionalDate` which accepts "" / null / undefined
//    and normalises any valid YYYY-MM-DD to ISO date (YYYY-MM-DD). Anything
//    else is rejected with a clear message.
//  • `type` is a hard enum that matches the DB CHECK constraint exactly.
//  • `household_id` is validated as a UUID before we hit RLS.
// ---------------------------------------------------------------------------

const optionalNumber = (label: string, max?: number) =>
  z
    .preprocess((v) => {
      if (v === "" || v === null || v === undefined) return null;
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (trimmed === "") return null;
        const n = Number(trimmed);
        return Number.isFinite(n) ? n : v; // keep raw value so Zod can complain
      }
      return v;
    }, z.union([z.number().nonnegative({ message: `${label} must be ≥ 0` }), z.null()]))
    .refine(
      (v) => v === null || max === undefined || v <= max,
      { message: `${label} must be ≤ ${max}` },
    );

const optionalDate = z
  .preprocess((v) => {
    if (v === "" || v === null || v === undefined) return null;
    if (typeof v !== "string") return v;
    const trimmed = v.trim();
    if (trimmed === "") return null;
    // Accept YYYY-MM-DD or any parseable date — normalise to YYYY-MM-DD.
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) return v; // let Zod reject below
    return d.toISOString().slice(0, 10);
  }, z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Settlement date must be a valid date"), z.null()]));

const optionalText = (max: number) =>
  z
    .preprocess((v) => {
      if (v === "" || v === null || v === undefined) return null;
      if (typeof v === "string") {
        const trimmed = v.trim();
        return trimmed === "" ? null : trimmed;
      }
      return v;
    }, z.union([z.string().max(max), z.null()]));

const PropertySchema = z.object({
  household_id: z.string().uuid({ message: "Invalid household" }),
  name: z
    .preprocess(
      (v) => (typeof v === "string" ? v.trim() : v),
      z.string().min(1, "Property name is required").max(120),
    ),
  type: z.enum(["ppor", "owner_occupied", "investment"], {
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

type PropertyInput = z.infer<typeof PropertySchema>;

function formToObject(raw: FormData): Record<string, FormDataEntryValue | null> {
  const obj: Record<string, FormDataEntryValue | null> = {};
  for (const [k, v] of raw.entries()) obj[k] = v;
  return obj;
}

/**
 * Format a Zod error for the UI: first issue's field + message.
 * Keeps the client-facing string short and actionable.
 */
function formatZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid input";
  const path = first.path.filter((p) => typeof p === "string").join(".");
  return path ? `${path}: ${first.message}` : first.message;
}

export async function createProperty(_prev: unknown, formData: FormData) {
  let session;
  try {
    session = await requireUser();
  } catch (e) {
    // requireUser() will redirect on unauthenticated; this catch only fires
    // for unexpected errors. Surface them rather than swallowing.
    console.error("[properties.createProperty] auth failure", e);
    return { ok: false, error: "Not signed in" };
  }

  const parsed = PropertySchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    // Detailed server-side log so we can pin down field-level rejections in
    // production via Netlify function logs.
    console.error(
      "[properties.createProperty] zod rejection",
      JSON.stringify(parsed.error.issues, null, 2),
    );
    return { ok: false, error: formatZodError(parsed.error) };
  }

  const input = normalizeInput(parsed.data);
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
    return {
      ok: false,
      error: friendlyDbError(error),
    };
  }

  await logChange(supabase, {
    household_id: input.household_id,
    user_id: session.user.id,
    table_name: "properties",
    row_id: data.id,
    action: "insert",
    diff: input,
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

  await logChange(supabase, {
    household_id: householdId,
    user_id: session.user.id,
    table_name: "properties",
    row_id: id,
    action: "delete",
    diff: {},
  });

  revalidatePath(`/workspace/${householdId}/wealth/properties`);
  revalidatePath(`/workspace/${householdId}/overview`);
  revalidatePath(`/workspace/${householdId}/decision`);
}

function normalizeInput(p: PropertyInput) {
  return {
    household_id: p.household_id,
    name: p.name,
    type: p.type,
    purchase_price: p.purchase_price,
    current_value: p.current_value,
    loan_amount: p.loan_amount,
    interest_rate: p.interest_rate,
    loan_term_years: p.loan_term_years,
    settlement_date: p.settlement_date,
    rental_income: p.rental_income,
    expenses: p.expenses,
    notes: p.notes,
  };
}

/**
 * Map common PostgREST/Postgres errors to a short, user-friendly message.
 * The full error is logged server-side; this is only what the user sees.
 */
function friendlyDbError(error: { code?: string; message: string }): string {
  const code = (error as { code?: string }).code ?? "";
  // RLS denial
  if (code === "42501") {
    return "You don't have access to this household.";
  }
  // Schema / table not exposed
  if (code === "42P01" || /relation .* does not exist/i.test(error.message)) {
    return "Ledger schema isn't reachable. Please verify the Supabase migration is applied and `ledger` is exposed in the Data API.";
  }
  // CHECK constraint (e.g. invalid type value)
  if (code === "23514") {
    return "One of the fields has an invalid value (check property type).";
  }
  // Foreign key (household_id missing)
  if (code === "23503") {
    return "Household not found. Please reload the page.";
  }
  // Generic fallback — only show the raw message in development.
  if (process.env.NODE_ENV !== "production") {
    return `Database error: ${error.message}`;
  }
  return "Could not save property. Please try again.";
}

async function logChange(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  row: {
    household_id: string;
    user_id: string;
    table_name: string;
    row_id: string;
    action: "insert" | "update" | "delete";
    diff: Record<string, unknown>;
  },
) {
  // RLS lets authenticated users SELECT but not INSERT into audit.data_change_log
  // by design — service-role-only writes. For Phase 1 we attempt the write and
  // silently no-op on permission denied so the user action still completes.
  // Phase 2 will route this through a Postgres trigger that runs as the table
  // owner.
  await supabase.schema("audit").from("data_change_log").insert({
    household_id: row.household_id,
    user_id: row.user_id,
    schema_name: "ledger",
    table_name: row.table_name,
    row_id: row.row_id,
    action: row.action,
    diff: row.diff,
  }).then(() => undefined, () => undefined);
}
