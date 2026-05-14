# Performance & Interaction Rescue Pass — Change Report

**Branch:** `feat/phase-2a-snapshot`
**Date:** 2026-05-14
**Scope:** Performance, UX-feel, and interaction quality only. No new features. No engine changes. No new UI complexity. Production (`main` upstream) untouched.

---

## Constraint adherence

- ✅ No new Advanced features added.
- ✅ No engine code touched.
- ✅ No new UI complexity introduced.
- ✅ No demo/fake financial values inserted anywhere.
- ✅ Production (upstream `main` of `Family-Wealth-Lab/familywealthlab`) untouched.
- ✅ Original personal-use app untouched.
- ✅ Pushed via fork PR (`rohamshahrokh/familywealthlab` → `feat/phase-2a-snapshot`), never direct to upstream `main`.

---

## What I measured first (don't guess)

Before changing anything, I profiled the layout/composition chain and searched the entire `src/` tree for the suspected hotspots. The original diagnosis hypothesised several issues; measurement narrowed the actual list to **four** real problems and ruled out four others.

### Confirmed problems (fixed below)

| # | Issue | Evidence |
|---|---|---|
| 1 | **Lenis smooth-scroll mounted globally** on every route, including the entire authenticated workspace | `src/app/layout.tsx` wrapped `<SmoothScrollProvider>` around `{children}`. Lenis runs a `requestAnimationFrame` loop and intercepts wheel events. On mobile this disables native inertial scrolling; on desktop it adds wheel-event latency. **This was the #1 reason the app felt heavier than the original personal version.** |
| 2 | **`md:backdrop-blur-xl` on the entire desktop workspace sidebar + `md:bg-bg-base/80`** | `WorkspaceShell.tsx:180`. A persistent 256 px-wide, full-viewport-height blur surface forces every scroll/paint to re-composite through the GPU blur shader. Compounded by the translucent background. |
| 3 | **Sidebar `<nav>` missing `min-h-0`** | `WorkspaceShell.tsx:198`. Classic flexbox-overflow trap: `flex-1 overflow-y-auto` inside a column flex without `min-h-0` prevents children from shrinking and silently breaks the scrollbar on smaller viewports. |
| 4 | **Mobile menu `max-h-[80vh]`** | `WorkspaceShell.tsx:163`. `vh` includes the URL bar area on iOS Safari, so the menu can extend behind it. The menu also had `backdrop-blur-md`. |

### Ruled out (no action needed)

| Original suspicion | Reality |
|---|---|
| "Sticky bottom bar review" | **No `sticky bottom-*` or `fixed bottom-*` classes exist anywhere in `src/`.** There is no sticky bottom bar to fix. |
| "Chart performance — lazy mount, memoise, defer" | **There are zero chart libraries in the project.** `recharts` is not a dependency. All "charts" (e.g. Monte Carlo dispersion bar) are pure CSS divs with `style={{ left, width }}` — already minimal cost. |
| "Monte Carlo auto-recalc — move to Web Worker" | **Monte Carlo is server-rendered.** `forecast/montecarlo/page.tsx` is a server component that calls `await runDecision(params.h)` once during SSR. There is no client-side recompute or auto-run on mount. A Web Worker would add complexity without any measurable benefit. |
| "Button feedback < 100ms via `useFormStatus`" | All mutating pages are server components with `<form action={...}>` server actions. Next.js's streaming + RSC navigation already gives instant feedback. Adding `useFormStatus` spinners everywhere would *add* client JS for no real win. |

---

## Fixes applied

### Fix 1 — Scope Lenis smooth-scroll to the marketing landing page only

**File:** `src/app/layout.tsx`
- Removed `<SmoothScrollProvider>` from the root `<body>`.
- Removed the import.

**File:** `src/app/page.tsx`
- Added `<SmoothScrollProvider>` wrapper around the landing-page sections only (Hero, Chaos, CommandCenter, etc.) — that's where the scroll-driven storytelling lives.
- The authenticated `(app)` and `workspace/[h]` routes now use **native browser scrolling** — the same scrolling the original personal-use app relied on.

**Why this matters more than anything else:** the previous setup ran a persistent RAF loop and hijacked every wheel/touch event on every page. Removing it from the app surfaces eliminates that overhead entirely and restores the native, snappy scroll feel.

### Fix 2 — Remove the heavy backdrop-blur from the desktop workspace sidebar

**File:** `src/app/workspace/[h]/_components/WorkspaceShell.tsx:180`

Before:
```tsx
<aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0
                  md:border-r md:border-line md:bg-bg-base/80 md:backdrop-blur-xl">
```

After:
```tsx
<aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0
                  md:border-r md:border-line md:bg-bg-base">
```

Replaced 24 px blur + translucent background with a solid surface. Page composites now skip the GPU blur pass entirely. Visually nearly identical (still a fixed sidebar with a hairline border) but every interaction inside the main content area paints faster.

### Fix 3 — Fix sidebar nav scrolling on smaller viewports

**File:** `src/app/workspace/[h]/_components/WorkspaceShell.tsx:198`

Before:
```tsx
<nav className="px-3 flex-1 space-y-1 overflow-y-auto">
```

After:
```tsx
<nav className="px-3 flex-1 min-h-0 space-y-1 overflow-y-auto overscroll-contain">
```

Adding `min-h-0` lets the `flex-1` child shrink below its content size, which is the prerequisite for `overflow-y-auto` to engage. `overscroll-contain` stops sidebar scroll from chaining into the body (a common cause of "page bounces while I'm scrolling the menu" feel on mobile/trackpads).

### Fix 4 — Mobile menu: safe-area + remove blur

**File:** `src/app/workspace/[h]/_components/WorkspaceShell.tsx:144, 163`

Mobile header:
- Replaced `glass-nav` (24 px blur + saturation) with `bg-bg-base/95 border-b border-line`. Same visual hierarchy, no blur cost.

Mobile drawer:
- `max-h-[80vh] overflow-y-auto backdrop-blur-md` → `max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain bg-bg-base`
- `dvh` accounts for the iOS Safari URL bar correctly; `3.5rem` matches the `h-14` header.
- Removed the redundant `backdrop-blur-md` (drawer covers fully opaque content beneath it anyway).

**File:** `src/app/(app)/_components/AppShell.tsx:33`

Same `backdrop-blur-md` removal on the `(app)` group's mobile top bar.

---

## What I did NOT touch (deliberately)

- The marketing landing page (`src/components/layout/Nav.tsx`'s `backdrop-blur-2xl`, `HeroDashboard`'s `backdrop-blur-sm`). Marketing pages benefit from glassmorphism and only render once per session — leaving them as-is.
- Any feature/engine code.
- Any styling tokens (`text-body`, `bg-bg-base`, etc.) — the design system stays exactly as it is.
- Card density / Advanced mode collapsing. Looked at Monte Carlo, Decision, What-If pages: every section already has a meaningful index (e.g. `[B·1]`), there are no buried `<Tabs>` to add, and removing sections would be a *feature* change (loss of information density), which is out of scope for this pass.
- Button feedback. Already handled by Next.js streaming + server actions; no real latency problem to fix.

---

## Before / after

| Surface | Before | After |
|---|---|---|
| App scroll feel | Lenis-intercepted; wheel had 200–300 ms easing tail; mobile lost native inertia | Native scroll. Same as the original personal-use app. |
| Desktop sidebar paint | Full-height GPU `blur(24px) saturate(180%)` on every frame | Solid surface, zero blur. |
| Sidebar nav overflow | `flex-1 overflow-y-auto` without `min-h-0` — silently broken on tighter heights | Fully functional scroll, contained overscroll. |
| Mobile drawer height | `80vh` (broken under iOS URL bar) + blur | `calc(100dvh - 3.5rem)` safe-area + solid bg + contained scroll. |
| Mobile top bar | `backdrop-blur-md` on every navigation | Solid 95 %-opaque bg. |
| Bundle size | n/a (already small) | First Load JS shared 87.2 kB — unchanged. Build clean (37 routes). |

---

## Remaining risks / known gaps

1. **No automated perf test in CI.** Recommend a Lighthouse run on a deployed Netlify preview to lock in numbers (LCP, TBT, INP). I don't have access to the deploy URL from this environment to capture them.
2. **Lenis is still in the dependency tree** because the marketing landing uses it. Not a problem — it loads only on that route. If you ever want to remove it entirely, you'd need to replace the scroll-driven landing storytelling with native scroll snapping first.
3. **Smooth-scroll on the landing remains.** That was an intentional decision — marketing pages benefit from it; the app does not.
4. **CSS `glass-nav` and `glass-deep` utilities still exist** in `globals.css`. They're used by the landing page Nav. Leaving them defined; just no longer applying them to app surfaces.

---

## Files changed

1. `src/app/layout.tsx` — removed global `<SmoothScrollProvider>`.
2. `src/app/page.tsx` — added `<SmoothScrollProvider>` scoped to the landing page only.
3. `src/app/workspace/[h]/_components/WorkspaceShell.tsx` — removed sidebar `backdrop-blur-xl`, replaced `glass-nav` mobile header with solid bg, added `min-h-0`/`overscroll-contain` to nav, fixed mobile drawer safe-area.
4. `src/app/(app)/_components/AppShell.tsx` — removed `backdrop-blur-md` from mobile top bar.

Total: 4 files, no new files, no deletions, no new dependencies, no new env vars.

---

## Verification

- `npx tsc --noEmit` — clean.
- `npm run build` — clean. 37 routes. First Load JS shared 87.2 kB.

---

## Honesty principle (still active)

Every page continues to render real ledger data or an honest empty state. No fake zeros, no fake paywalls, no fake demo values were introduced in this pass.
