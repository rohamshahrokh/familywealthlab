/**
 * FWL_ENV_VAR_WIRING_PASS_01
 *
 * Single source of truth for Supabase URL + anon key used by the ported
 * finance-port modules (bestMoveEngine, whatIfEngine, cfoEngine,
 * forecastStore, queryClient, notifications) and port pages that call
 * Supabase REST directly via fetch().
 *
 * The personal app originally hardcoded the old project URL + anon key
 * inline. That was the only thing tying fwl-commercial to the personal
 * Supabase project. By centralising here and reading from env vars, the
 * commercial build is fully decoupled from the personal database.
 *
 * Behaviour:
 *   - Returns the env-var values when both are set.
 *   - When unset or set to the placeholder/stub values, returns null so
 *     callers can safely short-circuit network calls instead of hitting
 *     the wrong project. The personal-app values can never be reached
 *     because there are no longer any hardcoded fallbacks.
 *
 * Server-side and client-side: NEXT_PUBLIC_* vars are inlined at build
 * time by Next, so this works in both contexts.
 */

export type SbConfig = {
  url: string;
  anonKey: string;
};

const STUB_HOSTS = new Set<string>(["", "stub.supabase.co", "your_project.supabase.co"]);
const STUB_KEYS = new Set<string>(["", "stub-anon-key", "your_anon_key"]);

function normalize(value: string | undefined): string {
  if (!value) return "";
  return value.trim().toLowerCase();
}

export function getSupabaseConfig(): SbConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url || !anonKey) return null;

  // Strip protocol + path for host comparison.
  let host = "";
  try {
    host = new URL(url).host.toLowerCase();
  } catch {
    return null;
  }

  if (STUB_HOSTS.has(normalize(host))) return null;
  if (STUB_KEYS.has(normalize(anonKey))) return null;

  return { url: url.replace(/\/$/, ""), anonKey };
}

/**
 * Convenience getter that returns just the REST headers required by every
 * direct fetch() call. Returns null when no real Supabase project is
 * configured.
 */
export function getSupabaseRestHeaders(): {
  apikey: string;
  Authorization: string;
  "Content-Type": string;
  Prefer: string;
} | null {
  const cfg = getSupabaseConfig();
  if (!cfg) return null;
  return {
    apikey: cfg.anonKey,
    Authorization: `Bearer ${cfg.anonKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

/**
 * True when the running build is wired to a real Supabase project (not
 * stubs and not empty). Use this to gate "save to cloud" features so they
 * silently no-op until a real commercial project URL is provided.
 */
export function hasRealSupabase(): boolean {
  return getSupabaseConfig() !== null;
}
