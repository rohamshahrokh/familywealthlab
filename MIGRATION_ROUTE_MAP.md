# Personal App → Commercial App route mapping

Source: `fwl-original/client/src/pages/*.tsx` (Vite + wouter SPA)
Target: `fwl-commercial/src/app/app/*` (Next.js App Router, route group `(app)`)

## Public routes (commercial-only)
| Commercial path | Source | Notes |
|---|---|---|
| `/` | Commercial landing (Apple-style) | Kept as-is |
| `/pricing` | New | Plan tiers + UpgradeGate |
| `/demo` | New | Read-only mock of `/app/snapshot` |
| `/login` | personal `/login` | Adapted to commercial supabase auth |
| `/signup` | New | Commercial sign-up flow |

## Authenticated app routes
| Commercial path | Personal source | Status |
|---|---|---|
| `/app/snapshot` | `pages/dashboard.tsx` | Ported — KPIs, charts, decision summary |
| `/app/income-expenses` | `pages/expenses.tsx` | Ported — tabs, table, categories |
| `/app/recurring-bills` | `pages/recurring-bills.tsx` | Ported — KPIs, 4 tabs, add bill form |
| `/app/monthly-budget` | `pages/budget.tsx` | Ported — category bars |
| `/app/net-worth-timeline` | `pages/timeline.tsx` | Ported — line chart with events |
| `/app/data-health` | `pages/data-health.tsx` | Ported — coverage matrix |
| `/app/ledger-audit` | `pages/ledger-audit.tsx` | Ported — drift table |
| `/app/my-financial-plan` | `pages/financial-plan.tsx` | Ported — milestones |
| `/app/property-plan` | `pages/property.tsx` + `property-buy-analysis.tsx` | Ported — 30y projection |
| `/app/stocks-plan` | `pages/stocks.tsx` | Ported — holdings, charts |
| `/app/crypto-plan` | `pages/crypto.tsx` | Ported — holdings, charts |
| `/app/debt-strategy` | `pages/debt-strategy.tsx` | Ported — pay-down ladder |
| `/app/tax-strategy` | `pages/tax.tsx` + `tax-alpha.tsx` | Ported — strategies + KPIs |
| `/app/cgt-simulator` | `pages/cgt-simulator.tsx` | Ported — lot picker + tax estimate |
| `/app/wealth-strategy` | `pages/wealth-strategy.tsx` | Ported — wealth ladder |
| `/app/forecast-engine` | `pages/ai-forecast-engine.tsx` + `fire-path.tsx` | Ported — combined forecast |
| `/app/decision-engine` | `pages/decision.tsx` | Ported — decision matrix |
| `/app/market-news` | `pages/market-news.tsx` | Ported — news cards |
| `/app/reports` | `pages/reports.tsx` | Ported — report catalogue |
| `/app/help` | `pages/help.tsx` + `pages/help/*` | Ported — topics + FAQ |
| `/app/settings` | `pages/settings.tsx` | Ported — account + plan |

## Engines/libs ported (personal `src/lib/` → commercial `src/lib/finance-port/`)
- `australianTax.ts`
- `finance.ts`
- `cashEngine.ts`
- `equityEngine.ts`
- `depositPower.ts`
- `eventProcessor.ts`
- `forecastEngine.ts`
- `propertyBuyEngine.ts`
- `taxAlphaEngine.ts`
- `bestMoveEngine.ts`
- `mathUtils.ts`
- `glossary.ts`
- `demoData.ts` (renamed `demoDataPersonal.ts`, personal values removed)

## Commercial gating layer (new — required)
- `src/lib/commercial/plans.ts`
- `src/lib/commercial/featureFlags.ts`
- `src/lib/commercial/accessControl.ts`
- `src/components/commercial/UpgradeGate.tsx`
- `src/components/commercial/PlanBadge.tsx`
