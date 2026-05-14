# Design Polish v1 — Change Report

**Branch:** `feat/design-polish-v1`
**Base:** perf rescue commit `2d743df` on `feat/phase-2a-snapshot`
**Scope:** Visual + interaction polish only. **No** architecture, calculation, forecasting, database, module, feature, routing, or engine changes.
**Target feel:** Apple-grade Family Office Operating System — calm, premium, intelligent, trustworthy.
**Hard rule honoured:** No automatic deploy, no main push. Preview PR only.

---

## TL;DR — five reasons it now feels calmer

1. **The 4-layer cinematic shadow is gone.** `card-cinematic` was carrying a 64px + 120px halo on every welcome / hero card. That single token was the strongest "crypto dashboard" signal in the app. It is now a 2-layer 1px + 32px shadow — visible, but composed, not theatrical.
2. **The ember-glow overlay on the Overview welcome banner is removed.** A full-bleed radial decorative glow on a banking surface was the single most off-brand element. Deleted.
3. **`[01·02]` brackets are no longer ember.** The `.syslabel-bracket` rule was emitting orange on every page header, every section index, every breadcrumb. Switched to graphite-400. The app instantly reads as one system instead of "system with orange noise".
4. **Live-dot halos removed.** `.live-dot` and `.live-dot-ember` no longer carry a `box-shadow: 0 0 0 3px ...` ring. They are dots, not radar pings.
5. **Sidebar is lighter.** Smaller icons (3.5 not 4), shorter rows (h-10 not h-11), graphite leaf indices instead of ember, calmer FWL wordmark.

---

## File-by-file diff with rationale

### 1) `tailwind.config.ts`

| Token | Before | After | Why |
|---|---|---|---|
| `bg.base` | `#F4F5F7` | `#F5F6F8` | Slightly warmer paper. The old value was cold-clinical; this nudges toward the "soft dark blue" / premium-paper feel without becoming yellow. |
| `bg.inset` | `#EDEEF1` | `#EFF0F3` | Closer to base. The old contrast made every inset card read as a stripe; now they sit on the page. |
| `line.DEFAULT` | `rgba(20,28,46,0.10)` | `rgba(20,28,46,0.08)` | Softer hairlines. Apple/Linear use ~6–8% alpha; 10% on a slightly-blue base was reading as ruled paper. |
| `line.strong` | `rgba(20,28,46,0.18)` | `rgba(20,28,46,0.14)` | Same logic. Strong lines still readable, less harsh. |
| `ember.500` | `#E26F2D` | `#C97030` | Desaturated. Old value was crypto-orange. New value is autumn-bronze — still warm, still an accent, but it sits next to graphite/navy without screaming. |
| `ember.600` | `#C95B1F` | `#B65E25` | Matching shift. |
| `ember.700` | `#A24A19` | `#964C1E` | Matching shift. |
| `fontSize.eyebrow` letterSpacing | `0.18em` | `0.14em` | `0.18em` on `0.6875rem` text was unreadable on mobile. Still feels system-label, no longer feels NASA-decal. |
| `fontSize.caption` lineHeight | `1.4` | `1.45` | Helps small descriptors breathe. |
| `fontSize.body` lineHeight | `1.6` | `1.62` | Marginal — but on long descriptive paragraphs it stops feeling cramped. |
| `fontSize.h3` | `1.625rem` | `1.5625rem` | Page subsection headings were dominating cards. Subtle. |
| `fontSize.h2` | `clamp(1.875rem, 2.6vw, 2.75rem)` | `clamp(1.75rem, 2.2vw, 2.375rem)` | Welcome hero was too big at desktop. New scale tops out at 2.375rem — still hero-sized, no longer marketing-landing-sized. |
| `borderRadius.sm` | `8px` | `10px` | Coherent radius family. |
| `borderRadius.md` | `12px` | `14px` | Touch targets/inputs feel slightly more tactile. |
| `borderRadius.lg` | `16px` | `18px` | Same. |
| `borderRadius.2xl` | `24px` | `22px` | Was the source of slightly-too-round card corners. |
| `borderRadius.3xl` | `32px` | `28px` | Same. |
| `boxShadow.cinematic` | 4-layer (16+32+64+120px halo) | 2-layer (1+12+32px) | **THE single biggest calm win.** The 64+120px halos were the entire "crypto dashboard hovering off the page" vibe. Now cards are present but grounded. |
| `boxShadow.card` | 3-layer | 2-layer | Same logic, smaller scale. |
| `boxShadow.ember-glow` | `~0.45 alpha` | `~0.14 alpha` | Reduced ~70% per the brief. Still legible as accent, no longer used as decoration. |
| `transitionDuration` new tokens | — | `snap: 120ms`, `tactile: 180ms`, `calm: 260ms`, `cinematic: 480ms` | Standardised motion vocabulary. Sidebar / hover / state transitions now consistently use `tactile (180ms)`. |

### 2) `src/app/globals.css`

| Rule | Before | After | Why |
|---|---|---|---|
| `html` background | `#F4F5F7`, no font-feature | `#F5F6F8`, `font-feature-settings: "ss03"` | Matches token; ss03 enables the more refined Inter alternate glyphs. |
| `::selection` colour | old ember alpha | new ember alpha | Token follow-through. |
| Scrollbar | 10px, hard alphas | 8px, softer alphas | Calmer rail. |
| `h1-h6` | no wrap rule | `text-wrap: balance` | Headings no longer break into widow lines. |
| `p` | no wrap rule | `text-wrap: pretty` | Body copy lays out more evenly. |
| `.card-surface` | white→white-95 gradient, `rounded-2xl`, 3-layer shadow with inset gloss | solid white, `rounded-xl`, 2-layer shadow, no inset gloss | Flatter, more breathable, no fake "glass" reflection. |
| `.card-cinematic` | white→white-92 gradient + 4-layer shadow with 64+120px halos | solid white + 2-layer 1+12+32 shadow | **The single biggest visual reset.** Hero cards no longer levitate. |
| `.card-inset` | `#EDEEF1` | `#EFF0F3` | Token follow-through. |
| `.card-dark` | layered glow | simplified | Used in dark mode strips; no longer competes. |
| `.hairline` | `0.08` | `0.06` | Cleaner separators. |
| `.hairline-strong` | `0.14` | `0.12` | Same. |
| `.eyebrow` / `.syslabel` letter-spacing | `0.16em` | `0.12em` | Same readability fix as the token. |
| `.syslabel-bracket` colour | `ember.500` | `graphite.400` | **THE second biggest visual reset.** Every `[01]`, `[02]`, `[01·02]` bracket across every page is now graphite. The app reads as one system instead of orange-confetti. |
| `.live-dot` / `.live-dot-ember` | dot + 3px box-shadow halo | just the dot | Banking products don't pulse. |
| `.bg-silver` | cool blue gradient | warmer gradient | Matches the new paper colour. |

### 3) `src/app/workspace/[h]/overview/page.tsx`

| Change | Before | After | Why |
|---|---|---|---|
| Welcome hero overlay | `<div className="absolute inset-0 ember-glow pointer-events-none" aria-hidden />` | removed | A full-bleed decorative orange radial glow on the Net Worth surface was the most obviously off-brand element. |
| Welcome hero padding | `p-7 sm:p-10` | `p-6 sm:p-8` | Tighter without feeling cramped. The hero is supposed to set tone, not eat the viewport. |

The "Open Decision Engine" CTA in `bg-ember-500` is intentionally retained — it is the **one** ember accent on the page (the actual "warm gold accent" the brief calls for). Everything else around it has been calmed, so the CTA now reads as restrained rather than as one orange element among many.

### 4) `src/app/workspace/[h]/_components/WorkspaceShell.tsx`

| Change | Before | After | Why |
|---|---|---|---|
| Sidebar group label height | `h-11` | `h-10` | Calmer vertical rhythm. |
| Sidebar group label radius | `rounded-2xl` | `rounded-xl` | Matches the new radius family. |
| Sidebar group label transition | none specified | `transition-colors duration-tactile` | Standardised 180ms. |
| Sidebar group icon size | `h-4 w-4` | `h-3.5 w-3.5` | Lighter visual weight; eyes find the label, not the icon. |
| Chevron size | `h-4 w-4` | `h-3.5 w-3.5` | Matching. |
| Chevron transition | `transition-transform` | `transition-transform duration-tactile` | Standardised. |
| Leaf-index colour (inactive) | `text-ember-500` | `text-ink-quaternary` | Removes the orange `01·02` index strip running down the sidebar. |
| `[FWL]` brand mark | `text-ember-500` | `text-ink-quaternary` | Same logic. The wordmark is "Family Wealth Lab" — the `[FWL]` is a system marker, not an accent. |
| Mobile sign-out button | `rounded-2xl h-11`, icon `h-4 w-4` | `rounded-xl h-10`, icon `h-3.5 w-3.5` | Matches the new sidebar nav rhythm. |

---

## Cross-cutting effects (no per-file edits needed)

These pages all use `card-cinematic` / `card-surface` / `syslabel-bracket` / `live-dot` and therefore inherit the calm automatically — no per-page changes needed:

- All `/workspace/[h]/wealth/*` ledger pages
- All `/workspace/[h]/input/*` data-entry pages
- All `/workspace/[h]/strategy/*` strategy pages
- All `/workspace/[h]/forecast/*` forecasts
- All `/workspace/[h]/action/*` decision flows
- `/workspace/[h]/decision`
- `/workspace/[h]/overview` (also has the surgical overlay removal)

This is intentional: the brief asked for a **design language reset**, not page-by-page redecoration. Most of the apparent change comes from token + global-CSS edits propagating.

---

## Things that were deliberately NOT changed

- The Decision Engine "Open" CTA on Overview keeps `bg-ember-500`. The brief asks for "one restrained warm accent." This is that one accent.
- KPI value sizing (`text-h5 sm:text-h4`) is unchanged — the values still need to be the page's loudest element.
- Number font (`num` class), monospace stack, font-feature-settings — all untouched.
- Architecture, routing, data layer, forecasting, calculations — untouched per the brief.

---

## Honesty principle

No fake demo values were added. The Overview still renders honest empty states when the ledger is empty (`"Your workspace is provisioned. Add a few ledger entries…"`).

---

## How to preview

1. Open the preview PR (see PR link in chat).
2. Wait for the Netlify deploy preview to finish.
3. Compare side-by-side with the current main deploy.
4. **Do not merge until you've reviewed the deploy preview.**

---

## Suggested next pass (v2 — not in scope of this PR)

If you want to keep going after v1 ships:

- Sweep `text-ember-*` usages in semantic-incorrect spots (e.g. "live" indicators on data-loading pages that aren't actually live).
- Tighten KPI card padding to match the new card-surface rhythm.
- Replace remaining `rounded-2xl` cards with `rounded-xl` in non-hero contexts.
- Audit modal/sheet shadow tokens (currently inherit `card-cinematic` — should probably step down one level).
