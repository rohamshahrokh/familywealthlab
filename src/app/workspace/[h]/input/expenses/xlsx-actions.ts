"use server";

/**
 * XLSX import server action for expenses.
 *
 * Receives a FormData with a `file` blob (application/vnd.openxmlformats…).
 * Parses it server-side with the `xlsx` package, maps rows to expense records,
 * and bulk-inserts into `ledger.expenses`.
 */

import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import {
  householdIdSchema,
  friendlyDbError,
} from "@/lib/forms/zodHelpers";
import { refreshSnapshotCache } from "@/lib/snapshot";
import { logLedgerChange } from "@/lib/audit";
import {
  EXPENSE_CATEGORIES,
  SOURCE_CODES,
  SOURCE_CODE_TO_CATEGORY,
  type ExpenseCategory,
  type SourceCode,
} from "./expense-constants";

type ImportResult = {
  ok: boolean;
  error?: string;
  created?: number;
  skipped?: number;
};

/** Excel date serial → YYYY-MM-DD. */
function excelSerialToIso(serial: number): string {
  const d = new Date((serial - 25569) * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

function parseDate(raw: unknown): string | null {
  if (raw == null) return null;
  if (raw instanceof Date) return raw.toISOString().slice(0, 10);
  const s = String(raw).trim();
  const num = Number(s);
  if (!isNaN(num) && num > 40000 && num < 70000) return excelSerialToIso(num);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const dmatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmatch) {
    const [, d, m, y] = dmatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

function resolveCategory(catRaw: string, codeRaw: string): ExpenseCategory {
  const catLower = catRaw.trim().toLowerCase();
  if ((EXPENSE_CATEGORIES as readonly string[]).includes(catLower)) {
    return catLower as ExpenseCategory;
  }
  const code = codeRaw.trim().toUpperCase() as SourceCode;
  if ((SOURCE_CODES as readonly string[]).includes(code)) {
    return SOURCE_CODE_TO_CATEGORY[code];
  }
  return "other";
}

export async function importExpensesXlsx(
  _prev: unknown,
  formData: FormData,
): Promise<ImportResult> {
  const session = await requireUser();
  const householdId = String(formData.get("household_id") ?? "");
  const parsed = householdIdSchema.safeParse(householdId);
  if (!parsed.success) return { ok: false, error: "Invalid household." };

  const file = formData.get("file") as Blob | null;
  if (!file || typeof file === "string") {
    return { ok: false, error: "No file received." };
  }

  let wb: XLSX.WorkBook;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    wb = XLSX.read(buf, { type: "buffer", cellDates: true });
  } catch {
    return { ok: false, error: "Failed to parse Excel file." };
  }

  const sheetName = wb.SheetNames[0];
  if (!sheetName) return { ok: false, error: "Workbook has no sheets." };

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    wb.Sheets[sheetName],
    { defval: "" },
  );

  if (rows.length === 0) {
    return { ok: false, error: "Sheet has no data rows." };
  }

  // Normalise column names (case-insensitive, underscore/space tolerant)
  const col = (row: Record<string, unknown>, ...names: string[]): string => {
    for (const key of Object.keys(row)) {
      const k = key.toLowerCase().replace(/[ _-]/g, "");
      for (const name of names) {
        if (k === name.toLowerCase().replace(/[ _-]/g, "")) {
          return String(row[key] ?? "").trim();
        }
      }
    }
    return "";
  };

  const records: unknown[] = [];
  let skipped = 0;

  for (const row of rows) {
    const amountRaw = col(row, "amount");
    const amount = Math.abs(parseFloat(amountRaw.replace(/[^0-9.-]/g, "")));
    if (!Number.isFinite(amount) || amount <= 0) { skipped++; continue; }

    const dateRaw = col(row, "date");
    const dateIso = parseDate(dateRaw);

    const codeRaw = col(row, "source_code", "code", "sourcecode");
    const catRaw = col(row, "category");
    const category = resolveCategory(catRaw, codeRaw);
    const isRefundAmt = parseFloat(amountRaw.replace(/[^0-9.-]/g, "")) < 0;
    const isRefund = category === "refund" || isRefundAmt;

    records.push({
      household_id: householdId,
      category,
      label: col(row, "label", "description", "desc").slice(0, 120) || null,
      amount,
      cadence: (["monthly", "annual", "one_off"].includes(
        col(row, "cadence").toLowerCase(),
      )
        ? col(row, "cadence").toLowerCase()
        : "monthly") as "monthly" | "annual" | "one_off",
      is_debt_service: category === "debt_service",
      is_refund: isRefund,
      source_code:
        (SOURCE_CODES as readonly string[]).includes(
          codeRaw.toUpperCase(),
        )
          ? codeRaw.toUpperCase()
          : null,
      member: col(row, "member").slice(0, 40) || null,
      payment_method: col(row, "payment_method", "paymentmethod").slice(0, 40) || null,
      subcategory: col(row, "subcategory").slice(0, 80) || null,
      expense_date: dateIso,
      notes: col(row, "notes").slice(0, 2000) || null,
    });
  }

  if (records.length === 0) {
    return { ok: false, error: `No valid rows (${skipped} skipped).` };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .schema("ledger")
    .from("expenses")
    .insert(records);

  if (error) {
    console.error("[expense.importXlsx] supabase", error);
    return { ok: false, error: friendlyDbError(error) };
  }

  await logLedgerChange(supabase, {
    household_id: householdId,
    user_id: session.user.id,
    table_name: "expenses",
    row_id: "",
    action: "insert",
    diff: { xlsx_import: true, rows: records.length },
  });
  await refreshSnapshotCache(householdId).catch(() => undefined);
  revalidatePath(`/workspace/${householdId}/input/expenses`);
  revalidatePath(`/workspace/${householdId}/overview`);
  return { ok: true, created: records.length, skipped };
}
