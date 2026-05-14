/* eslint-disable no-console */
/**
 * engine-sync.ts — Controlled snapshot sync from live-app → packages/engine.
 *
 * Usage:
 *   LIVE_APP_PATH=/abs/path/to/live-app  npx tsx scripts/engine-sync.ts
 *
 * Rules:
 *  1. Never writes back to live-app.
 *  2. Excludes browser-only / Supabase-bound files (see EXCLUDE).
 *  3. Always bumps `packages/engine/VERSION` with the new sync date.
 *  4. Prints a diff summary; the operator commits manually after review.
 *
 * Phase 2 will add golden-fixture parity checks here (run scenarioV2 against
 * a frozen DashboardInputs fixture and assert byte-identical output).
 */

import { readdirSync, statSync, mkdirSync, copyFileSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const SRC_ROOT = process.env.LIVE_APP_PATH ?? "/home/user/workspace/live-app";
const DEST_ROOT = join(process.cwd(), "packages/engine/src");

const INCLUDE_FILES = [
  "client/src/lib/dashboardDataContract.ts",
  "client/src/lib/australianTax.ts",
];

const INCLUDE_DIRS = [
  "client/src/lib/taxPolicyEngine",
  "client/src/lib/scenarioV2",
];

const EXCLUDE = new Set<string>([
  "client/src/lib/scenarioV2/persistence.ts",
  "client/src/lib/scenarioV2/pdfReport.ts",
  "client/src/lib/scenarioV2/quickDecisionPdf.ts",
  "client/src/lib/scenarioV2/decisionEngine/polishNarrativeWithAi.ts",
]);

function rewriteDest(srcRel: string): string {
  // client/src/lib/<rest>  →  <rest>
  return srcRel.replace(/^client\/src\/lib\//, "");
}

function walk(absDir: string, baseRel: string, out: string[]): void {
  for (const entry of readdirSync(absDir)) {
    const abs = join(absDir, entry);
    const rel = baseRel ? `${baseRel}/${entry}` : entry;
    const s = statSync(abs);
    if (s.isDirectory()) walk(abs, rel, out);
    else if (entry.endsWith(".ts")) out.push(rel);
  }
}

function copyOne(srcRel: string) {
  if (EXCLUDE.has(srcRel)) return;
  const src = join(SRC_ROOT, srcRel);
  const dest = join(DEST_ROOT, rewriteDest(srcRel));
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  return relative(process.cwd(), dest);
}

const copied: string[] = [];

for (const f of INCLUDE_FILES) {
  const d = copyOne(f);
  if (d) copied.push(d);
}

for (const d of INCLUDE_DIRS) {
  const absDir = join(SRC_ROOT, d);
  if (!existsSync(absDir)) continue;
  const files: string[] = [];
  walk(absDir, d, files);
  for (const f of files) {
    const out = copyOne(f);
    if (out) copied.push(out);
  }
}

const today = new Date().toISOString().slice(0, 10);
const versionPath = join(process.cwd(), "packages/engine/VERSION");
const prev = existsSync(versionPath) ? readFileSync(versionPath, "utf8") : "";
const next = prev.replace(/sync_date:.*/, `sync_date: ${today}`);
writeFileSync(versionPath, next);

console.log(`engine-sync: copied ${copied.length} files. Review with \`git diff packages/engine\` before committing.`);
