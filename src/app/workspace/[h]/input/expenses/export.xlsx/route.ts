/**
 * GET /workspace/[h]/input/expenses/export.xlsx
 *
 * Streams the household's expense ledger as an XLSX download.
 * Accepts the same URL search params as the CSV export route.
 */

import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  household_id: string;
  category: string;
  label: string | null;
  amount: number;
  cadence: string;
  is_debt_service: boolean | null;
  is_refund: boolean | null;
  source_code: string | null;
  member: string | null;
  payment_method: string | null;
  subcategory: string | null;
  expense_date: string | null;
  notes: string | null;
  created_at: string;
};

export async function GET(
  req: NextRequest,
  ctx: { params: { h: string } },
) {
  await requireUser();
  const householdId = ctx.params.h;
  const url = new URL(req.url);
  const supabase = createSupabaseServerClient();

  let q = supabase
    .schema("ledger")
    .from("expenses")
    .select("*")
    .eq("household_id", householdId)
    .order("expense_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const category = url.searchParams.get("category");
  const code = url.searchParams.get("code");
  const member = url.searchParams.get("member");
  const payment = url.searchParams.get("payment");
  const search = url.searchParams.get("search");
  const year = url.searchParams.get("year");
  const month = url.searchParams.get("month");

  if (category) q = q.eq("category", category);
  if (code) q = q.eq("source_code", code);
  if (member) q = q.eq("member", member);
  if (payment) q = q.eq("payment_method", payment);
  if (search) q = q.ilike("label", `%${search}%`);
  if (year) {
    const start = `${year}-01-01`;
    const end = `${Number(year) + 1}-01-01`;
    q = q.gte("expense_date", start).lt("expense_date", end);
  }
  if (year && month) {
    const m = String(month).padStart(2, "0");
    const start = `${year}-${m}-01`;
    const nextMonth = Number(month) === 12 ? 1 : Number(month) + 1;
    const nextYear = Number(month) === 12 ? Number(year) + 1 : Number(year);
    const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
    q = q.gte("expense_date", start).lt("expense_date", end);
  }

  const { data, error } = await q;
  if (error) {
    return new NextResponse(`Export failed: ${error.message}`, { status: 500 });
  }
  const rows = (data ?? []) as Row[];

  const aoa: unknown[][] = [
    [
      "Date", "Amount", "Category", "Subcategory", "Source Code",
      "Member", "Payment Method", "Label", "Cadence",
      "Debt Service", "Refund", "Notes",
    ],
    ...rows.map((r) => [
      r.expense_date ?? r.created_at.slice(0, 10),
      r.amount,
      r.category,
      r.subcategory ?? "",
      r.source_code ?? "",
      r.member ?? "",
      r.payment_method ?? "",
      r.label ?? "",
      r.cadence,
      r.is_debt_service ? "Yes" : "No",
      r.is_refund ? "Yes" : "No",
      r.notes ?? "",
    ]),
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, "Expenses");
  const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const body = new Uint8Array(buf).buffer;

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="expenses-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
