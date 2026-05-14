"use server";

/**
 * Expenses ledger server actions — restored depth.
 *
 * Writes to `ledger.expenses` (provisioned by 20260601000000_ledger.sql,
 * extended by 20260514130000_depth_columns.sql for source_code / member /
 * payment_method / subcategory / is_refund / expense_date).
 *
 * The Snapshot's cashflow + buffer KPIs read this table.
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
  EXPENSE_CATEGORIES,
  SOURCE_CODES,
  SOURCE_CODE_TO_CATEGORY,
  SourceCode,
} from "./expense-constants";

// ─── Validation ─────────────────────────────────────────────────────────────
const ExpenseSchema = z.object({
  household_id: householdIdSchema,
  category: z.enum(EXPENSE_CATEGORIES, {
    errorMap: () => ({ message: "Invalid category" }),
  }),
  label:           optionalText(120),
  amount:          z.coerce.number().nonnegative("Amount must be 0 or more"),
  cadence:         z.enum(["monthly", "annual", "one_off"]),
  is_debt_service: z.preprocess(
    (v) => v === "on" || v === "true" || v === true,
    z.boolean(),
  ).optional(),
  is_refund: z.preprocess(
    (v) => v === "on" || v === "true" || v === true,
    z.boolean(),
  ).optional(),
  source_code:     optionalText(4),
  member:          optionalText(40),
  payment_method:  optionalText(40),
  subcategory:     optionalText(80),
  expense_date:    optionalDate,
  notes:           optionalText(2000),
});

export async function createExpense(_prev: unknown, formData: FormData) {
  const session = await requireUser();
  const parsed = ExpenseSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    console.error("[expense.create] zod", JSON.stringify(parsed.error.issues, null, 2));
    return { ok: false, error: formatZodError(parsed.error) };
  }
  const input = {
    ...parsed.data,
    is_debt_service: parsed.data.is_debt_service ?? false,
    is_refund: parsed.data.is_refund ?? parsed.data.category === "refund",
  };
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .schema("ledger")
    .from("expenses")
    .insert(input)
    .select("id")
    .single();
  if (error) {
    console.error("[expense.create] supabase", { code: (error as any).code, message: error.message });
    return { ok: false, error: friendlyDbError(error) };
  }
  await logLedgerChange(supabase, {
    household_id: input.household_id,
    user_id: session.user.id,
    table_name: "expenses",
    row_id: data.id,
    action: "insert",
    diff: input,
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
  const { error } = await supabase
    .schema("ledger")
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);
  if (error) {
    console.error("[expense.delete] supabase", error);
    return;
  }
  await logLedgerChange(supabase, {
    household_id: householdId,
    user_id: session.user.id,
    table_name: "expenses",
    row_id: id,
    action: "delete",
    diff: {},
  });
  await refreshSnapshotCache(householdId).catch(() => undefined);
  revalidatePath(`/workspace/${householdId}/input/expenses`);
  revalidatePath(`/workspace/${householdId}/overview`);
}

export async function bulkDeleteExpenses(formData: FormData): Promise<void> {
  const session = await requireUser();
  const householdId = String(formData.get("household_id") ?? "");
  const idsRaw = String(formData.get("ids") ?? "");
  const ids = idsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  if (!householdId || ids.length === 0) return;
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .schema("ledger")
    .from("expenses")
    .delete()
    .in("id", ids)
    .eq("household_id", householdId);
  if (error) {
    console.error("[expense.bulkDelete] supabase", error);
    return;
  }
  for (const id of ids) {
    await logLedgerChange(supabase, {
      household_id: householdId,
      user_id: session.user.id,
      table_name: "expenses",
      row_id: id,
      action: "delete",
      diff: { bulk: true },
    });
  }
  await refreshSnapshotCache(householdId).catch(() => undefined);
  revalidatePath(`/workspace/${householdId}/input/expenses`);
  revalidatePath(`/workspace/${householdId}/overview`);
}

/**
 * CSV import — accepts a textarea blob of CSV with header row.
 * Recognised columns (case-insensitive): date, amount, category, label,
 * notes, source_code, member, payment_method, cadence.
 *
 * XLSX is intentionally not supported in this PR; a CSV export from any
 * spreadsheet tool works identically and avoids a 200kB+ dependency.
 */
const ImportSchema = z.object({
  household_id: householdIdSchema,
  csv: z.string().min(1, "CSV is empty"),
});

type ImportResult = { ok: boolean; error?: string; created?: number; skipped?: number };

export async function importExpensesCsv(_prev: unknown, formData: FormData): Promise<ImportResult> {
  const session = await requireUser();
  const parsed = ImportSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) };

  const lines = parsed.data.csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { ok: false, error: "Need at least a header row and one data row." };

  const header = parseCsvRow(lines[0]).map((h) => h.toLowerCase().trim());
  const idx = (key: string) => header.indexOf(key);
  const iDate = idx("date");
  const iAmount = idx("amount");
  const iCategory = idx("category");
  const iLabel = idx("label");
  const iNotes = idx("notes");
  const iCode = idx("source_code");
  const iMember = idx("member");
  const iPayment = idx("payment_method");
  const iCadence = idx("cadence");

  if (iAmount < 0) return { ok: false, error: "CSV must include an 'amount' column." };

  const rows: any[] = [];
  let skipped = 0;
  for (let li = 1; li < lines.length; li++) {
    const cells = parseCsvRow(lines[li]);
    const amountNum = Number(cells[iAmount]);
    if (!Number.isFinite(amountNum)) { skipped++; continue; }
    const codeRaw = iCode >= 0 ? cells[iCode]?.trim().toUpperCase() : "";
    const code = codeRaw && (SOURCE_CODES as readonly string[]).includes(codeRaw) ? codeRaw : null;
    const fallbackCat = code ? SOURCE_CODE_TO_CATEGORY[code as SourceCode] : "other";
    const catRaw = iCategory >= 0 ? cells[iCategory]?.trim().toLowerCase() : "";
    const category =
      catRaw && (EXPENSE_CATEGORIES as readonly string[]).includes(catRaw)
        ? catRaw
        : fallbackCat;
    rows.push({
      household_id: parsed.data.household_id,
      category,
      label:          iLabel >= 0 ? cells[iLabel]?.slice(0, 120) || null : null,
      amount:         Math.abs(amountNum),
      cadence:        (iCadence >= 0 && cells[iCadence] && ["monthly","annual","one_off"].includes(cells[iCadence].toLowerCase()))
                        ? cells[iCadence].toLowerCase() : "monthly",
      is_debt_service: category === "debt_service",
      is_refund:       category === "refund" || amountNum < 0,
      source_code:    code,
      member:         iMember >= 0 ? (cells[iMember] || null) : null,
      payment_method: iPayment >= 0 ? (cells[iPayment] || null) : null,
      notes:          iNotes >= 0 ? (cells[iNotes] || null) : null,
      expense_date:   iDate >= 0 ? normaliseDate(cells[iDate]) : null,
    });
  }

  if (rows.length === 0) return { ok: false, error: `No valid rows (${skipped} skipped).` };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.schema("ledger").from("expenses").insert(rows);
  if (error) {
    console.error("[expense.import] supabase", error);
    return { ok: false, error: friendlyDbError(error) };
  }
  await logLedgerChange(supabase, {
    household_id: parsed.data.household_id,
    user_id: session.user.id,
    table_name: "expenses",
    row_id: "",
    action: "insert",
    diff: { bulk_import: true, rows: rows.length },
  });
  await refreshSnapshotCache(parsed.data.household_id).catch(() => undefined);
  revalidatePath(`/workspace/${parsed.data.household_id}/input/expenses`);
  revalidatePath(`/workspace/${parsed.data.household_id}/overview`);
  return { ok: true, created: rows.length, skipped };
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function parseCsvRow(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQ = false; }
      else { cur += c; }
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

function normaliseDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t) return null;
  // dd/mm/yyyy → yyyy-mm-dd
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // already ISO?
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}
