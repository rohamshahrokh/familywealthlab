# Depth Restoration — PR B (UI Layer)

**Branch**: `feat/depth-ui-v1`
**Base**: `Family-Wealth-Lab/familywealthlab@main` (HEAD `d0980f88` — after PR #7 was merged)
**Companion**: PR A (`feat/depth-data-v1`, PR #7, merged) — provides seed + selectors.
**Status**: Preview-only — DO NOT auto-merge. Manual DB migration required.

---

## Why this PR exists

PR A landed the data layer: a demo seed migration and pure server selectors
that turn `ledger.*` rows into chart-ready data. **No UI consumed them.**

PR B is the UI layer — the half of the depth restoration that makes the
seeded data visible. It restores the two largest modules from the original
Family Wealth Lab repo to commercial-grade depth, wires the overview and
forecast pages to PR A's `getChartBundle`, and ships the schema migration
that the new Property module depends on.

PR A merged alone shows seeded rows but no UI. **PR B merged without PR A
shows the UI but with empty databases.** The two are designed to ship
together; both migrations (`20260514120000_demo_seed.sql` from PR A and
`20260514130000_depth_columns.sql` from this PR) must be applied manually,
in that order, before the workspace will render the new surfaces.

---

## What changed

### 1. `supabase/migrations/20260514130000_depth_columns.sql` (new, 253 lines)

Extends `ledger.properties` with the 34 depth columns the original
Family Wealth Lab tracked but the commercial schema had dropped:

| Group       | Columns                                                                                          |
|-------------|--------------------------------------------------------------------------------------------------|
| Loan        | `loan_type` (IO / P&I), `interest_only_years`, `loan_term_years`, `offset_balance`               |
| Yield       | `weekly_rent`, `rental_growth_pct`, `vacancy_rate_pct`, `gross_yield_pct`, `net_yield_pct`       |
| Growth      | `capital_growth_pct`, `purchase_date`, `purchase_price`                                          |
| Costs       | `stamp_duty`, `legal_fees`, `lvr_at_purchase`, `current_lvr_pct`, `annual_rates`, `annual_insurance` |
| Cashflow    | `weekly_pi_payment`, `weekly_io_payment`, `monthly_cashflow_after_costs`                         |
| Strategy    | `is_ppor`, `is_planned`, `target_settlement_date`, `notes`                                       |
| Audit       | `created_at`, `updated_at` (auto-trigger)                                                        |

Idempotent via `IF NOT EXISTS` — safe to re-run.

### 2. Property module — `src/app/workspace/[h]/wealth/properties/` (14 files, ~2,541 lines)

Restored to original Family Wealth Lab depth (was 143 lines in commercial,
1,638 in original). Three tabs driven by `?tab=…` URL state:

- **Portfolio** (`_views/PortfolioView.tsx`, 173 lines) — per-property card
  with 6 collapsible sections: Loan, Yield, Growth, Cashflow, Equity, Notes.
  Add via `<dialog>` modal (`AddPropertyModal.tsx`). Edit inline.
  30-year `ProjectionTable.tsx` per property.
- **Buy vs Wait** (`_views/BuyVsWaitView.tsx`, 251 lines) — IP capacity
  calculator (borrowing power × LVR scenarios) feeding into a buy-now vs
  wait-N-years equity comparison.
- **Impact** (`_views/ImpactView.tsx`, 353 lines) — what each planned IP
  does to total LVR, weekly cashflow, FIRE date, and surplus.

Engine functions in `src/lib/finance/property.ts` (346 lines):
`weeklyPI`, `weeklyIO`, `grossYield`, `netYield`, `lvr`, `equity`,
`stampDutyQLD`, `projectCashflow`, `projectEquity`, `compoundedValue`.

Server actions (`actions.ts`, 228 lines) honour all 34 depth columns and
include `addProperty`, `updateProperty`, `deleteProperty`.

### 3. Expenses module — `src/app/workspace/[h]/input/expenses/` (~40 files, ~1,500 lines)

Restored to original depth (was 115 lines, original 2,525). Three tabs
matching the IMG_6396–6399 reference screenshots:

- **Expenses** — Income & Expense Tracker header, KPI tiles (Total · This
  Month · Avg · Transactions), period toggle (M/Q/Y), donut by category,
  annual bar, avg-by-category bars, top growing, advanced filters,
  paginated table, bulk select, refunds rendered in green.
- **Income** — `INCOME_SOURCES` taxonomy (salary, business, rental,
  investment, government, other), add/edit form with frequency selector
  (weekly / fortnightly / monthly / quarterly / yearly), monthly chart.
- **Cash Flow** — yearly totals, monthly bars (income vs expenses),
  surplus area chart, savings rate KPI, daily drill-down when a month
  is selected.

Server actions split by concern:
- `actions.ts` (284 lines) — expense CRUD
- `income-actions.ts` (144 lines) — income CRUD
- `xlsx-actions.ts` — XLSX import (replaces CSV-only ImportPanel)
- `ai-insights-action.ts` — AI insights stub (real backend deferred to PR #9+)

Route handlers:
- `export/route.ts` — CSV export
- `export.xlsx/route.ts` — Excel export
- `template.xlsx/route.ts` — Excel template download

`AutoImportSettings.tsx` collapsible (placeholder UI for bank-feed
integration), `AiInsightsCard.tsx` (stub).

### 4. `src/components/workspace/charts/index.tsx` (new, 331 lines)

Pure-SVG chart primitives — `Donut`, `BarRow`, `AreaLine`, `Sparkline`,
plus helpers `sampleEvery`, `monthLabels`. No external chart library; the
goal is server-rendered, zero-runtime-cost visuals consistent with the
commercial theme tokens (ember / paper / ink-*).

### 5. Chart wiring — overview + forecast pages

- `overview/page.tsx` (409 lines) — fetches `getChartBundle` in parallel
  with session and snapshot. New sections:
  - [03·B] Allocation donut
  - [03·C] Net-worth trajectory area
  - [04·C] Cashflow trend area
  - [04·D] Top categories bar
  - [04·E] FIRE path area
- `forecast/baseline/page.tsx` (179 lines) — replaced inline sparkline
  with `AreaLine`; added [C·1] composition trajectory chart (property +
  investments + super + cash, stacked).
- `forecast/fire/page.tsx` (182 lines) — added [C·1] liquid wealth path
  with FIRE target line.

### 6. Expenses-module shared constants — split files

Next.js `"use server"` files can only export `async` functions. The
original implementations co-located constants with actions, which broke
the build. Two new non-`"use server"` files now hold the constants:

- `income-constants.ts` — `INCOME_SOURCES`, `INCOME_FREQUENCIES`,
  `FREQ_MULTIPLIER`, `toMonthlyEquiv`, `frequencyToCadence`, types
- `expense-constants.ts` — `EXPENSE_CATEGORIES`, `EXPENSE_CATEGORY_LABELS`,
  `SOURCE_CODES`, `SOURCE_CODE_TO_CATEGORY`, `SOURCE_CODE_LABELS`,
  `FAMILY_MEMBERS`, `PAYMENT_METHODS`, types

All five consumers (`ExpenseForm`, `_views/ExpensesView`, `FilterBar`,
`IncomeForm`, `xlsx-actions`) now import from the new files.

### 7. Dependencies

`xlsx@0.18.5` added to `package.json` (Excel import/export). No
`recharts`, `react-hook-form`, or `@tanstack/react-query` — charts use
pure SVG, forms use React 19 `useFormState`/`useFormStatus`, data
fetching is server-side.

---

## What this PR explicitly does NOT do

- **Does not apply migrations.** PR A's `20260514120000_demo_seed.sql`
  must be applied first, then this PR's `20260514130000_depth_columns.sql`.
- **Does not touch the personal/internal app.**
- **Does not auto-deploy.** Preview-only PR; the user reviews and merges.
- **Does not implement** CFO weekly engine, AI insights backend, tax alpha,
  risk radar, decision engine deep-dive, scenario compare v2, Monte Carlo
  enhancements, FIRE path interactive UI, or debt strategy UI. All deferred
  to PR #9+.

---

## Verification

```
$ npx tsc --noEmit
EXIT=0

$ npm run build
✓ Compiled successfully
40 routes built cleanly (was 37 in PR A — 3 new XLSX/CSV route handlers).
```

| Route                                          | Size    | First Load JS |
|------------------------------------------------|---------|---------------|
| `/workspace/[h]/input/expenses`                | 10.1 kB | 111 kB        |
| `/workspace/[h]/wealth/properties`             |  8.1 kB | 109 kB        |
| `/workspace/[h]/overview`                      |   214 B |  94.2 kB      |
| `/workspace/[h]/forecast/baseline`             |   214 B |  94.2 kB      |
| `/workspace/[h]/forecast/fire`                 |   214 B |  94.2 kB      |

Server-side rendered surfaces stay at 214 B page size because the chart
primitives, selectors, and engine functions run on the server.

---

## Original → Commercial mapping (Expenses + Property)

| Module    | Original line count | Commercial before | Commercial after PR B |
|-----------|---------------------|-------------------|-----------------------|
| Expenses  | 2,525               |   115             | ~1,500                |
| Property  | 1,638               |   143             | ~2,541                |

The Property module is *larger* than the original because the commercial
split is by concern (views / components / actions / engine) instead of the
original single-file layout. The Expenses module is smaller because XLSX
handling delegates to the `xlsx` package instead of hand-rolled parsers,
and AI insights / auto-import are stubs that will fill out in PR #9+.

---

## How to land this

1. Confirm PR #7 (PR A) is merged into upstream `main`.
2. Apply migrations in order against the chosen Supabase project:
   1. `supabase/migrations/20260514120000_demo_seed.sql` (PR A)
   2. `supabase/migrations/20260514130000_depth_columns.sql` (this PR)
3. Review the diff on this preview PR.
4. Merge into `main` once both migrations are applied and the preview
   renders correctly.

---

## Roadmap (out of scope — deferred to PR #9+)

- CFO weekly engine (real backend)
- AI insights surface (real backend)
- Tax alpha module
- Risk radar
- Decision engine deep-dive
- Scenario compare v2
- Monte Carlo full UI polish
- FIRE-path interactive page
- Debt strategy interactive page
- Real bank-feed integration (replace `AutoImportSettings` stub)
