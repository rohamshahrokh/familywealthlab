// Defensive runtime helpers shared by every migrated route.
// Goal: never crash on undefined / null / non-array / NaN values.

export const isBrowser = (): boolean => typeof window !== "undefined";

/** Returns the input if it's an array, otherwise an empty array. */
export function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/** Returns a finite number or the provided fallback (default 0). */
export function safeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Returns the value if non-empty string, otherwise fallback. */
export function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

/** Returns the object if non-null, otherwise empty record. */
export function safeObject<T extends Record<string, unknown>>(
  value: T | null | undefined,
): Partial<T> {
  return value && typeof value === "object" ? value : ({} as Partial<T>);
}

/** Safe localStorage getter — never throws on SSR or private mode. */
export function safeLocalGet(key: string): string | null {
  try {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Safe localStorage setter — silently no-ops on SSR/quota errors. */
export function safeLocalSet(key: string, value: string): void {
  try {
    if (!isBrowser()) return;
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore quota / private-mode errors */
  }
}

/** Safe sessionStorage getter. */
export function safeSessionGet(key: string): string | null {
  try {
    if (!isBrowser()) return null;
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Safe sessionStorage setter. */
export function safeSessionSet(key: string, value: string): void {
  try {
    if (!isBrowser()) return;
    window.sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/** Safe JSON.parse — returns fallback on any failure. */
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

/** Safe currency formatter — never throws on NaN. */
export function safeCurrency(value: unknown, currency = "AUD"): string {
  const n = safeNumber(value, 0);
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n.toFixed(0)}`;
  }
}

/** Safe percent formatter. */
export function safePercent(value: unknown, fractionDigits = 1): string {
  const n = safeNumber(value, 0);
  return `${n.toFixed(fractionDigits)}%`;
}
