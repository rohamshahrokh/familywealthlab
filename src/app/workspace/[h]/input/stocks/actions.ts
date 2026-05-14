"use server";

/**
 * Stocks ledger server actions.
 * Writes to `ledger.stocks`. Snapshot pulls market-value into accessible wealth.
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

const StockSchema = z.object({
  household_id:    householdIdSchema,
  ticker:          requiredText("Ticker", 1, 20),
  exchange:        optionalText(20),
  current_holding: z.coerce.number().nonnegative("Holding must be 0 or more"),
  current_price:   z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().nonnegative()).optional(),
  average_cost:    z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().nonnegative()).optional(),
  currency:        z.preprocess(
                     (v) => (typeof v === "string" && v.trim() ? v.trim().toUpperCase() : "AUD"),
                     z.string().length(3),
                   ),
  notes:           optionalText(2000),
});

export async function createStock(_prev: unknown, formData: FormData) {
  const session = await requireUser();
  const parsed = StockSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    console.error("[stock.create] zod", JSON.stringify(parsed.error.issues, null, 2));
    return { ok: false, error: formatZodError(parsed.error) };
  }
  const input = { ...parsed.data, ticker: parsed.data.ticker.toUpperCase() };
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.schema("ledger").from("stocks")
    .insert(input).select("id").single();
  if (error) {
    console.error("[stock.create] supabase", { code: (error as any).code, message: error.message });
    return { ok: false, error: friendlyDbError(error) };
  }
  await logLedgerChange(supabase, {
    household_id: input.household_id, user_id: session.user.id,
    table_name: "stocks", row_id: data.id, action: "insert", diff: input,
  });
  await refreshSnapshotCache(input.household_id).catch(() => undefined);
  revalidatePath(`/workspace/${input.household_id}/input/stocks`);
  revalidatePath(`/workspace/${input.household_id}/overview`);
  return { ok: true };
}

export async function deleteStock(formData: FormData): Promise<void> {
  const session = await requireUser();
  const householdId = String(formData.get("household_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!householdId || !id) return;
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.schema("ledger").from("stocks")
    .delete().eq("id", id).eq("household_id", householdId);
  if (error) {
    console.error("[stock.delete] supabase", error);
    return;
  }
  await logLedgerChange(supabase, {
    household_id: householdId, user_id: session.user.id,
    table_name: "stocks", row_id: id, action: "delete", diff: {},
  });
  await refreshSnapshotCache(householdId).catch(() => undefined);
  revalidatePath(`/workspace/${householdId}/input/stocks`);
  revalidatePath(`/workspace/${householdId}/overview`);
}
