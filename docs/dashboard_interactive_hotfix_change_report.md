# Hotfix — Dashboard runtime crash (Digest 894233798)

**Branch:** `fix/depth-ui-rsc-serialization`
**Base:** `main` @ `16c47d48` (PR #9 merged)
**Status:** READY FOR PR — DO NOT DEPLOY AUTOMATICALLY

## Symptom

After merging PR #9 (`feat(dashboard): interactive charts, matrices, KPI cards`),
production deploy-preview-9 (`<deploy-id>--family-wealth-lab.netlify.app`)
rendered the workspace dashboard then threw:

> Application error: a server-side exception has occurred (see the server logs
> for more information). Digest: 894233798

The Next.js build (`next build`) succeeded cleanly. The failure was at
**request-time render**, not compile-time. The production main branch deploy
itself was `state=error, skipped=true` (build queue) so live traffic kept
serving PR #8's bundle — only the PR #9 preview URL surfaced the crash.

## Root cause — RSC serialization boundary violation

Next.js 14 App Router server components cannot pass **functions** as props
into client components. When a server page hands a client component a function
prop, the runtime throws an unserializable-value error which surfaces in the
browser as a generic "server-side exception" with an opaque digest.

Two such violations slipped into PR #9:

### 1. `DecisionMatrix.format`

`DecisionMatrix.tsx` is `"use client"`. Its interface exposed:

```ts
export interface DecisionRiskMetric {
  …
  format?: (v: number) => string;   // ❌ function across RSC boundary
}
```

`decision/page.tsx` (server component) was passing five metrics each with
`format: (v) => fmtPercent(v)`. This triggered the crash on every render
of `/workspace/[h]/decision`.

### 2. `InteractiveBarRow.valueLabel`

`InteractiveBarRow.tsx` is `"use client"`. Its interface exposed:

```ts
interface Props {
  valueLabel?: (n: number) => string;   // ❌ function across RSC boundary
  …
}
```

`overview/page.tsx` (server component) was passing
`valueLabel={(n) => fmtMoneyCompact(n)}` on the top-categories bar block.
That broke `/workspace/[h]/overview` too.

## Fix

Replaced the function props with a **serializable formatter selector** plus
optional **pre-formatted display strings** so server pages can render
numbers themselves and ship plain strings across the boundary.

### `DecisionMatrix`

```ts
// before
format?: (v: number) => string;

// after
format?: "percent" | "money" | "moneyCompact" | "raw";  // selector
displayValues?: string[];                                // per-candidate strings
```

`formatValue(n, format)` is now defined inside the client component using
`Intl.NumberFormat`. `decision/page.tsx` now passes `format: "percent"` plus
`displayValues: [fmtPercent(...)]` per metric — both serializable.

### `InteractiveBarRow`

```ts
// before
valueLabel?: (n: number) => string;

// after
valueFormat?: "money" | "moneyCompact" | "raw";   // selector
// plus per-row optional `valueText: string` on each Row
```

`overview/page.tsx` now passes `valueFormat="moneyCompact"` and
`valueText: fmtMoneyCompact(c.amount)` on each row.

## Files changed

```
src/components/workspace/charts-interactive/DecisionMatrix.tsx
src/components/workspace/charts-interactive/InteractiveBarRow.tsx
src/app/workspace/[h]/decision/page.tsx
src/app/workspace/[h]/overview/page.tsx
docs/dashboard_interactive_hotfix_change_report.md (new)
```

## Verification

```
$ npx tsc --noEmit
(exit 0)

$ npm run build
✓ Compiled successfully
✓ Generating static pages (19/19)
(no warnings)
```

## Not changed

- Landing page — untouched as mandated.
- Supabase / backend — untouched as mandated.
- The other chart-interactive primitives (`FinancialAreaChart`,
  `FinancialLineChart`) also expose `yFormat?: (n: number) => string` but
  **no server page passes it** — only legacy `_views/*` files use `yFormat`,
  and those route through the **server-renderable** `AreaLine` from
  `@/components/workspace/charts`, not the new interactive variants. Left
  the interactive interface as-is so a future client-side caller can still
  use a custom formatter. If a server caller is added later, follow the same
  selector + display-string pattern.

## Deployment

This PR (#10) targets `main` from `rohamshahrokh:fix/depth-ui-rsc-serialization`.
After merge, Netlify will rebuild the production deploy — which will be the
**first** successful production deploy carrying the PR #9 dashboard rework.
