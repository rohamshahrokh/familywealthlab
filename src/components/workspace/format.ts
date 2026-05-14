/**
 * Workspace-wide number formatters. ALL ledger numbers route through here so
 * the same value never renders two ways across the app.
 */

const aud = (digits = 0) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export function fmtMoney(n: number | null | undefined, digits = 0): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return aud(digits).format(n);
}

/** Compact: $1.2M / $34.5k — for KPI tiles. */
export function fmtMoneyCompact(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${n < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
  if (abs >= 1_000)     return `${n < 0 ? "-" : ""}$${(abs / 1_000).toFixed(abs >= 10_000 ? 1 : 1)}k`;
  return aud(0).format(n);
}

export function fmtPercent(n: number | null | undefined, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

export function fmtNumber(n: number | null | undefined, digits = 0): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-AU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

/** Signed delta: "+$2,340" / "−$1,120". */
export function fmtDelta(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${aud(0).format(Math.abs(n))}`;
}
