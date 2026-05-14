/**
 * Scenario Engine V2 — Feature Flag (commercial build).
 *
 * In the vendored commercial app, V2 is ALWAYS on — the entire app exists to
 * commercialize V2. We keep the export shape so the rest of the engine code
 * stays byte-identical with the source, but the flag is hard-true and the
 * dev-warn helper is a no-op.
 */

export const SCENARIO_ENGINE_V2: boolean = true;

export function assertV2Enabled(_context: string): boolean {
  return true;
}
