# Depth Restoration — PR A (Data Layer)

**Branch**: `feat/depth-data-v1`
**Base**: `Family-Wealth-Lab/familywealthlab@main` (HEAD `5a3d4680`)
**Status**: Preview-only — DO NOT auto-merge. Manual DB application required.

---

## Why this PR exists

The current commercial app contains a small fraction of the original
Family Wealth Lab's depth. Dashboards, charts, and forecast surfaces render
empty in every fresh workspace because there is no seed data and no chart-data
plumbing.

This PR (the data layer) lands two things and nothing else:

1. **Demo seed migration** — every household is auto-populated with a complete,
   realistic Australian-family scenario (Alex & Sara Johnson, Brisbane QLD)
   on creation, so every chart, KPI, and forecast has something to render.
2. **Chart-data selectors** — pure, deterministic server selectors that turn
   `ledger.*` rows into Recharts-ready data structures. These are the seam the
   PR B UI will consume.

The companion **PR B (`feat/depth-ui-v1`)** restores the deep Expenses module
(2,525 → ? lines) and the Property module (1,638 → ? lines), wires the
restored UIs to these selectors, and ships the performance + desktop polish.

---

## What changed

### 1. `supabase/migrations/20260514120000_demo_seed.sql` (new, 181 lines)

A `ledger.seed_demo_household(uuid)` function that, given a household id,
inserts a complete demo snapshot mirroring the original `demoData.ts`:

| Bucket           | Demo values                                                                                                                                          |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| Family           | Alex Johnson (37, $150K gross tech) + Sara Johnson (part-time, $70K gross), 2 kids, Brisbane QLD                                                     |
| PPOR             | Brookfield Ave Kenmore — $1.2M current value, $850K mortgage @ 6.24% P&I                                                                             |
| Cash & offsets   | $20K cash, $95K offset                                                                                                                               |
| Super            | $160K combined (Alex $105K AustralianSuper Balanced Growth, Sara $55K Hostplus Balanced)                                                             |
| Stocks ($62K)    | VAS 40%, VGS 35%, QUAL 15%, NDQ 10% — $1,200/mo DCA                                                                                                  |
| Crypto ($18.5K)  | BTC 0.12 @ $95K, ETH 1.5 @ $3,200 — $300/mo DCA                                                                                                      |
| Income (net)     | Alex $12,500/mo, Sara $5,500/mo (= $18K/mo combined)                                                                                                 |
| Expenses         | $11,200/mo — mortgage $3,400, childcare $1,800, groceries $1,200, dining $800, etc.                                                                  |
| Planned IP1      | Everton Park, settling 2027 — $750K purchase, $600K IO loan, $650/wk rent                                                                            |
| FIRE target      | Alex age 55, $9K/mo passive income                                                                                                                   |

The function is `SECURITY DEFINER` and idempotent — it `ON CONFLICT DO
NOTHING` against existing rows so re-running on a populated household is a
no-op.

A trigger on `app.households` calls `seed_demo_household(NEW.id)` after every
insert, so every fresh workspace renders charts immediately. A one-shot
backfill loop seeds existing households that have no `ledger.snapshot` row
yet.

### 2. `src/lib/dashboard/charts.ts` (new, ~430 lines)

Seven pure selectors plus a top-level bundle:

| Selector                       | Returns                                              | Used by (PR B)                         |
|--------------------------------|------------------------------------------------------|----------------------------------------|
| `selectExpensesByCategory`     | category × monthly amount × pct × count              | Expenses page pie/bar                  |
| `selectMonthlyTrend`           | 12-month income vs expenses vs cumulative savings    | Dashboard trend chart                  |
| `selectSpendingHeatmap`        | day-of-month × category intensity                    | Expenses heatmap                       |
| `selectNetWorthTrajectory`     | 20-year property + investments + super + cash + debt | Dashboard net-worth line               |
| `selectPropertyCashflow`       | per-property 15-year cashflow + equity + LVR         | Property page projections              |
| `selectAllocation`             | portfolio pie slices                                 | Dashboard allocation                   |
| `selectFirePath`               | 25-year liquid + super + passive-income trajectory   | Forecast/FIRE page                     |
| `getChartBundle(householdId)`  | one-shot bundle of all of the above                  | Workspace dashboards                   |

All selectors are deterministic, server-only, and read from the same
`DashboardInputs` shape the rest of the engine consumes. Long-horizon
projections (`selectNetWorthTrajectory`, `selectPropertyCashflow`,
`selectFirePath`) accept a `ChartAssumptions` parameter, which
`getChartBundle` fetches once from `ledger.assumptions`.

### 3. `src/lib/dashboard/index.ts`

Re-exports the new selectors and types alongside the existing
`buildDashboardInputs` / `getCommandCentre` exports.

---

## What this PR explicitly does NOT do

- **Does not apply migrations.** Per session decision, the migration file
  ships in the PR but is not applied automatically. The user will apply it
  manually to the Supabase project they choose. The repo's existing
  `20260601000000_ledger.sql` must be applied first.
- **Does not touch UI pages.** Expenses page is still 115 lines, Property page
  still 143 lines. Both restored in PR B.
- **Does not wire dashboards to charts.** PR B does that.
- **Does not extend the `ledger.properties` schema** (no `loan_type`,
  `weekly_rent`, `rental_growth`, `vacancy_rate`, `capital_growth`,
  `stamp_duty` columns). PR B will add a schema-extension migration.
- **Does not touch the personal/internal app** or its Supabase project.

---

## Honesty principle — superseded

Earlier work in this repo enforced an "empty-by-default" honesty principle:
new households render zero KPIs until the user enters real data.

That principle is **superseded for the commercial product** by the user's
decision this session: "Populate every workspace with demo data until the
user enters their own." The seed migration implements that decision. Users
overwrite demo rows as they enter their own data; the seed never re-runs on
an already-populated household.

---

## Verification

```
$ npx tsc --noEmit
EXIT=0

$ npm run build
✓ Compiled successfully
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

37 routes built cleanly. No new TypeScript errors. No new bundle bloat
(charts module is server-only — does not ship to the client).

---

## How to land this

1. Review the diff on the preview PR.
2. Apply `supabase/migrations/20260514120000_demo_seed.sql` manually to the
   chosen Supabase project (after `20260601000000_ledger.sql`).
3. Verify the trigger by inserting a test household and confirming
   `ledger.snapshot`/`properties`/`stocks`/`crypto`/`expenses`/`income_sources`
   rows appear.
4. Merge into `main` **only after** PR B is also ready — landing this PR
   alone gives every workspace seed data but no UI to display it through.

---

## Roadmap (out of scope for PR A & PR B)

Defer to PR #9+ — list, do not fake-implement:

- CFO weekly engine
- AI insights surface
- Tax alpha module
- Risk radar
- Decision engine deep-dive
- Scenario compare v2
- Monte Carlo full UI
- FIRE-path interactive page
- Debt strategy interactive page
