"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

const PropertySchema = z.object({
  household_id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(120),
  type: z.enum(["ppor", "owner_occupied", "investment"]),
  purchase_price: z.coerce.number().nonnegative().nullable().optional(),
  current_value:  z.coerce.number().nonnegative().nullable().optional(),
  loan_amount:    z.coerce.number().nonnegative().nullable().optional(),
  interest_rate:  z.coerce.number().min(0).max(1).nullable().optional(),
  loan_term_years: z.coerce.number().min(0).max(60).nullable().optional(),
  settlement_date: z.string().optional().or(z.literal("")),
  rental_income:  z.coerce.number().nonnegative().nullable().optional(),
  expenses:       z.coerce.number().nonnegative().nullable().optional(),
  notes:          z.string().max(2000).optional().or(z.literal("")),
});

type PropertyInput = z.infer<typeof PropertySchema>;

function toRow(raw: FormData): Record<string, FormDataEntryValue | null> {
  const obj: Record<string, FormDataEntryValue | null> = {};
  for (const [k, v] of raw.entries()) obj[k] = v === "" ? null : v;
  return obj;
}

export async function createProperty(_prev: unknown, formData: FormData) {
  const session = await requireUser();
  const parsed = PropertySchema.safeParse(toRow(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = createSupabaseServerClient();
  const input = normalizeInput(parsed.data);

  const { data, error } = await supabase
    .schema("ledger")
    .from("properties")
    .insert(input)
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
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
    // Surface via revalidate; UI shows fresh row state. Phase 2 will add toast.
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
    purchase_price: p.purchase_price ?? null,
    current_value: p.current_value ?? null,
    loan_amount: p.loan_amount ?? null,
    interest_rate: p.interest_rate ?? null,
    loan_term_years: p.loan_term_years ?? null,
    settlement_date: p.settlement_date && p.settlement_date !== "" ? p.settlement_date : null,
    rental_income: p.rental_income ?? null,
    expenses: p.expenses ?? null,
    notes: p.notes && p.notes !== "" ? p.notes : null,
  };
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
