# FWL Landing — Live Product Preview Fix

**Branch:** `feat/depth-ui-v1` · **PR:** [#8](https://github.com/Family-Wealth-Lab/familywealthlab/pull/8) (follow-up commit) · **Date:** 2026-05-14

## Goal

> "The landing page should feel like users are seeing a real working financial engine, not a flat brochure."

Every dashboard, curve, and matrix on the commercial landing was already component-driven (no `<img>` mockups), but several blocks still rendered as static SVG paths or fixed numerals. This pass replaces those static surfaces with live, animated primitives that draw, count, and quietly drift — so the page feels like it's running, not screenshotted.

No backend logic was added. No Supabase. No auto-deploy. The old/personal app was not touched.

---

## New UI Primitives

All three live under `src/components/ui/` and are zero-dependency (use only `framer-motion`, which the project already had).

| File | Purpose |
|------|---------|
| `Sparkline.tsx` | Animated single-line SVG curve. `pathLength` draw-on-scroll, optional soft fill + end dot. Fluid width via `preserveAspectRatio="none"`. View-once via `useInView` (amount: 0.4). Respects `useReducedMotion`. |
| `LiveValue.tsx` | Counter that springs from 0 → target on view, then drifts within `±jitter` every `tickMs` to feel live. Ember pulse on each drift. Static when reduced-motion. |
| `MatrixGrid.tsx` | Responsive 2D scoring matrix. Desktop: CSS grid `minmax(120px, 1.4fr) repeat(N, minmax(0,1fr))`. Mobile (`md:hidden`): stacks one card per column with row label/value pairs. Hover lift on columns. `recommended` column gets ember rail + SCENARIO chip + tinted bg. Cells support `tone: positive \| negative \| warning \| neutral`. |

---

## Sections Upgraded

### 1. `CommandCenter.tsx`
- **`VisualNetWorth` (Net Worth tab):** $2.41M → `<LiveValue>` (jitter 0.004, tick 3600ms). +$184K YoY → `<Counter>`. Added **12-month trailing net-worth `<Sparkline>`** (ink stroke, soft fill, end dot) above the composition bar. Composition bar segments now animate width 0→% with `motion.div`. Composition grid responsive `grid-cols-2 sm:grid-cols-4`.
- **`VisualForecast` (Forecast tab):** $4.82M → `<LiveValue>` (jitter 0.008, tick 4200ms). Added **FIRE Timeline `<Sparkline>`** (ember stroke, percent-to-FIRE 12→100, climbing to 2039).
- **`VisualDecision` (Decisions tab):** Static 2-card "compare" replaced with a full **`<MatrixGrid>`** — 4 paths (Baseline / Refi·IO [recommended] / +IP $980K / Defer 12mo) × 6 KPIs (Net worth, FIRE year, Cashflow, Liquidity P10, Survival %, Max DD).
- **`VisualAI` (Intelligence tab):** Each insight now has `status: NEW \| WATCH \| READY` plus a `spark[]` array. NEW status pulses the rail. Each card gets an 80×20 ember mini-sparkline next to its metric value. "3 SURFACED" counter.

### 2. `AIInsights.tsx`
- Added a 2×2 **mini-stat tile** in the left column (SURFACED 4 / DOLLARS $8.4K / FIRE −4Y / RISK 2 HIGH) — all four use `<Counter>`.
- Each insight card now shows a status badge chip (NEW / WATCH / READY) next to its `[AI.0X]` tag, with `animate-pulse-soft` on the rail if NEW.
- Each card gained a 120×22 ember `<Sparkline>` next to its metric delta, giving every insight its own visual signal.

### 3. `MobileExperience.tsx`
- `ScreenDashboard`: $2.41M → `<LiveValue>`. +$184K → `<Counter>`. Static `<path d="M0,40 C40,32 …">` net-worth curve replaced with `<Sparkline data={NW_TRAIL} stroke="#0B0F1A" fill="rgba(11,15,26,0.06)" endDot />` using a real 12-point trailing series.
- `ScreenAI`: Static cashflow `<path>` replaced with `<Sparkline data={CASHFLOW_PATH} stroke="#C97030" fill="rgba(201,112,48,0.08)" endDot />` over 24 points. Added a `+$4.2K/mo` counter chip in the header.

### 4. `Chaos.tsx`
- Central "Unified Household" card: $2.41M → `<LiveValue>`; +$184K YoY → `<Counter>`. The converged card now visibly *runs* as the user reaches it.

### Already animated, left alone
- `StatsBand.tsx` — already uses `<Counter>` for all four stats.
- `Ticker.tsx` (top markets strip) — already a CSS-keyframe horizontal scroll.
- `Hero.tsx`, `WhatIf.tsx` (expandable cards), `FinalCTA.tsx` — already richly motioned.

---

## Files Changed

| File | Status |
|------|--------|
| `src/components/ui/Sparkline.tsx` | **new** |
| `src/components/ui/LiveValue.tsx` | **new** |
| `src/components/ui/MatrixGrid.tsx` | **new** |
| `src/components/sections/CommandCenter.tsx` | modified |
| `src/components/sections/AIInsights.tsx` | modified |
| `src/components/sections/MobileExperience.tsx` | modified |
| `src/components/sections/Chaos.tsx` | modified |
| `docs/landing_live_preview_change_report.md` | **new** (this file) |

---

## Static Mockups Replaced

| Before (static) | After (live) |
|----------------|--------------|
| Fixed numeral `$2.41M` (CommandCenter / Chaos / MobileExperience) | `<LiveValue>` — counts up on view, then drifts ±$4K every 3.6–4.2s |
| Fixed numeral `$4.82M` (Forecast P50) | `<LiveValue>` — counts up, drifts ±$8K every 4.2s |
| Hard-coded `+$184K YoY` deltas | `<Counter>` — animated count-up |
| `<path d="M0,40 C40,32 …">` net-worth curve (mobile dashboard) | Real 12-point `<Sparkline>` with animated draw + fill + end dot |
| `<path d="M0,30 L40,28 …">` cashflow path (mobile AI) | Real 24-point ember `<Sparkline>` with animated draw + fill |
| Static 2-card "Baseline vs Refi" compare block | Full `<MatrixGrid>` — 4 paths × 6 KPIs, recommended column highlighted, mobile stacks cleanly |
| No FIRE timeline curve | Ember `<Sparkline>` climbing 12→100% to 2039 in the Forecast tab |
| AI insights with no signal | Each card has status badge (NEW/WATCH/READY), pulsing rail on NEW, and its own ember mini-sparkline |

---

## Responsive Verification

Captured via Playwright on the dev build (`localhost:3001`):

### Desktop (1440×900)
| Section | Screenshot |
|---------|-----------|
| Hero + ticker | `qa_d_01_top.png` |
| StatsBand | `qa_d_02_stats.png` |
| Chaos / Unified card | `qa_d_03_chaos.png` |
| CommandCenter — Net Worth tab | `qa_d_04_command.png` |
| WhatIf | `qa_d_05_whatif.png` |
| AIInsights (with status badges + sparklines) | `qa_d_06_ai.png` |
| MobileExperience phones | `qa_d_07_mobile.png` |
| CommandCenter — Decisions tab (new matrix) | `qa_d_08_command_matrix.png` |

### Mobile (390×844, iPhone-class)
| Section | Screenshot |
|---------|-----------|
| Hero | `qa_m_01_hero.png` |
| CommandCenter top | `qa_m_02_command_top.png` |
| Decision Matrix — stacked cards | `qa_m_03_decision_matrix.png` / `qa_m_03b_decision_matrix.png` |
| AI Insights — stacked cards with sparklines + badges | `qa_m_04_ai.png` |
| MobileExperience phone mockup | `qa_m_07_phones_mid.png` |

**Mobile checks passed:**
- ✅ Matrix stacks one card per column, no horizontal overflow
- ✅ Recommended column gets full-width ember tint + SCENARIO chip
- ✅ Sparklines resize fluidly (preserveAspectRatio="none")
- ✅ All counters render at correct size, no overflow
- ✅ Phone mockup curve renders as real sparkline at small size

---

## Performance Notes

- **No new dependencies.** All three primitives use `framer-motion` (already in `package.json`). No Recharts, no D3, no Three.js.
- **Bundle delta:** primitives are ~9 KB combined (uncompressed source). Inline SVG is significantly lighter than a charting library.
- **Animations are view-gated.** `useInView({ once: true, amount: 0.3-0.4 })` means nothing animates until scrolled into view, and never re-runs.
- **Reduced motion respected.** `useReducedMotion` from framer-motion short-circuits `LiveValue` drift and `Sparkline` draw to static rendering.

## Build

- `npx tsc --noEmit` → clean
- `npm run build` → success, no warnings
