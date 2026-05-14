/**
 * GET /workspace/[h]/input/expenses/template.xlsx
 *
 * Returns a blank expense import template workbook with:
 * - Header row pre-filled
 * - Two example data rows so users understand the format
 */

import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  _ctx: { params: { h: string } },
) {
  await requireUser();

  const aoa = [
    [
      "date", "amount", "category", "subcategory", "source_code",
      "member", "payment_method", "label", "cadence", "notes",
    ],
    [
      "2026-05-01", "82.40", "food", "", "D",
      "Family", "Credit Card", "Coles weekly shop", "monthly", "",
    ],
    [
      "2026-05-05", "3400.00", "housing", "", "R",
      "Family", "Bank Transfer", "PPOR mortgage", "monthly", "Fixed rate",
    ],
    [
      "2026-05-10", "25.00", "refund", "", "RE",
      "Alex", "Credit Card", "Returned headphones", "one_off", "",
    ],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, "Expenses");
  const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const body = new Uint8Array(buf).buffer;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="expenses-template.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
