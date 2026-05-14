import { z } from "zod";

/**
 * Shared Zod preprocessors for ledger forms.
 *
 * These are the same helpers used by the properties form — extracted here so
 * every ledger surface (cash, liabilities, super, etc.) gets identical empty
 * / null / coerce / format handling. NEVER reimplement empty-field handling
 * per form.
 */

export const optionalNumber = (label: string, max?: number) =>
  z
    .preprocess((v) => {
      if (v === "" || v === null || v === undefined) return null;
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (trimmed === "") return null;
        const n = Number(trimmed);
        return Number.isFinite(n) ? n : v;
      }
      return v;
    }, z.union([z.number().nonnegative({ message: `${label} must be ≥ 0` }), z.null()]))
    .refine(
      (v) => v === null || max === undefined || v <= max,
      { message: `${label} must be ≤ ${max}` },
    );

export const requiredNumber = (label: string, min = 0, max?: number) =>
  z.preprocess((v) => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = Number(v.trim());
      return Number.isFinite(n) ? n : v;
    }
    return v;
  }, z.number({ invalid_type_error: `${label} must be a number` })
     .gte(min, { message: `${label} must be ≥ ${min}` })
     .refine((v) => max === undefined || v <= max, { message: `${label} must be ≤ ${max}` }));

export const optionalDate = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return null;
  if (typeof v !== "string") return v;
  const trimmed = v.trim();
  if (trimmed === "") return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return v;
  return d.toISOString().slice(0, 10);
}, z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date"), z.null()]));

export const optionalText = (max: number) =>
  z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return null;
    if (typeof v === "string") {
      const t = v.trim();
      return t === "" ? null : t;
    }
    return v;
  }, z.union([z.string().max(max), z.null()]));

export const requiredText = (label: string, min = 1, max = 120) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string()
      .min(min, { message: `${label} is required` })
      .max(max, { message: `${label} must be ≤ ${max} characters` }),
  );

export const householdIdSchema = z.string().uuid({ message: "Invalid household" });

/** Format a Zod error for the UI: first issue's field path + message. */
export function formatZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid input";
  const path = first.path.filter((p) => typeof p === "string").join(".");
  return path ? `${path}: ${first.message}` : first.message;
}

/** Convert FormData → plain object (preserving file/value distinction). */
export function formToObject(raw: FormData): Record<string, FormDataEntryValue | null> {
  const obj: Record<string, FormDataEntryValue | null> = {};
  for (const [k, v] of raw.entries()) obj[k] = v;
  return obj;
}

/** Friendly Supabase/Postgres error → user message (full error logged separately). */
export function friendlyDbError(error: { code?: string; message: string }): string {
  const code = (error as { code?: string }).code ?? "";
  if (code === "42501") return "You don't have access to this household.";
  if (code === "42P01" || /relation .* does not exist/i.test(error.message)) {
    return "Ledger schema isn't reachable. Please verify the Supabase migration is applied and `ledger` is exposed in the Data API.";
  }
  if (code === "23514") return "One of the fields has an invalid value.";
  if (code === "23503") return "Household not found. Please reload the page.";
  if (process.env.NODE_ENV !== "production") return `Database error: ${error.message}`;
  return "Could not save. Please try again.";
}
