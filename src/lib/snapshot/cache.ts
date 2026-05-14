import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeSnapshot } from "./compute";
import { SNAPSHOT_SCHEMA_VERSION, type Snapshot } from "./types";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * getSnapshot — the single read endpoint for every consumer.
 *
 *   1. Try the cache row. If fresh AND schema matches, return it.
 *   2. Else recompute deterministically and refresh the cache.
 *
 * Callers should treat the returned Snapshot as immutable. The struct is the
 * sole source of truth — never recompute KPIs locally from raw ledger rows.
 */
export async function getSnapshot(householdId: string): Promise<Snapshot> {
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .schema("ledger")
    .from("snapshot_cache")
    .select("payload, schema_version, computed_at")
    .eq("household_id", householdId)
    .maybeSingle();

  if (data && data.schema_version === SNAPSHOT_SCHEMA_VERSION) {
    const ageMs = Date.now() - new Date(data.computed_at).getTime();
    if (ageMs < CACHE_TTL_MS) {
      return data.payload as Snapshot;
    }
  }

  const fresh = await computeSnapshot(householdId);
  // Fire-and-forget cache write — if RLS or schema-not-exposed blocks it, we
  // still return a fresh result. The next request re-tries.
  void writeCache(householdId, fresh).catch((err) => {
    console.error("[snapshot.cache] write failed", err);
  });
  return fresh;
}

/**
 * refreshSnapshotCache — call after every ledger write to invalidate the
 * stored snapshot. Returns the freshly computed snapshot so callers can
 * optimistically render it.
 */
export async function refreshSnapshotCache(householdId: string): Promise<Snapshot> {
  const fresh = await computeSnapshot(householdId);
  await writeCache(householdId, fresh);
  return fresh;
}

async function writeCache(householdId: string, snapshot: Snapshot): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .schema("ledger")
    .from("snapshot_cache")
    .upsert({
      household_id: householdId,
      payload: snapshot,
      schema_version: SNAPSHOT_SCHEMA_VERSION,
      computed_at: snapshot.computedAtIso,
    });
  if (error) {
    console.error("[snapshot.cache] upsert error", {
      code: (error as { code?: string }).code,
      message: error.message,
    });
  }
}
