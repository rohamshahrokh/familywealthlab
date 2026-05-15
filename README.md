# Family Wealth Lab — Commercial Landing Page

> Isolated rebuild. **Not connected** to the existing personal/live FWL repository,
> Supabase, Vercel, or Netlify. This is a brand-new, standalone Next.js project
> you control end-to-end.

A cinematic, premium landing page for Family Wealth Lab — the AI-powered
family financial operating system. Built with the same craft bar as Apple,
Linear, Arc, and Stripe.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a custom token system (`#070B14` / `#0F1728` /
  `#172033` surfaces, `#FF6B00` / `#FFC857` accents)
- **Framer Motion** for entrance + scroll-driven motion
- **Lenis** for cinematic smooth scroll (respects `prefers-reduced-motion`)
- **GSAP** is included as a dependency for future scroll-trigger work
- **Lucide** icon set
- Custom SVG dashboard mockups — no stock screenshots

---

## Local development

### Prerequisites

- Node.js 18.18 or later
- npm 9+ (pnpm/yarn also work)

### Run it

```bash
cd fwl-commercial
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server hot-reloads
on every save.

### Other scripts

```bash
npm run build       # Production build
npm run start       # Run the production build
npm run lint        # Next/ESLint
npm run typecheck   # tsc --noEmit
```

---

## Project structure

```
fwl-commercial/
├── src/
│   ├── app/
│   │   ├── globals.css          # Tailwind layer + global tokens
│   │   ├── layout.tsx           # Root layout + Inter font + Lenis provider
│   │   ├── page.tsx             # Composed landing page
│   │   └── icon.svg             # Favicon
│   ├── components/
│   │   ├── brand/Logo.tsx       # SVG aperture mark
│   │   ├── layout/
│   │   │   ├── Nav.tsx          # Sticky glass nav + mobile sheet
│   │   │   └── Footer.tsx
│   │   ├── providers/
│   │   │   └── SmoothScrollProvider.tsx  # Lenis bootstrap
│   │   ├── sections/
│   │   │   ├── Hero.tsx                  # Section 1
│   │   │   ├── HeroDashboard.tsx         # Floating dashboard mockup
│   │   │   ├── Chaos.tsx                 # Section 2 — convergence
│   │   │   ├── CommandCenter.tsx         # Section 3 — sticky-scroll modules
│   │   │   ├── WhatIf.tsx                # Section 4 — expandable cards
│   │   │   ├── AIInsights.tsx            # Section 5 — insight grid
│   │   │   ├── MobileExperience.tsx      # Section 6 — phone cluster
│   │   │   ├── Trust.tsx                 # Section 7 — privacy pillars
│   │   │   └── FinalCTA.tsx              # Section 8 — close
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Reveal.tsx                # FadeUp / Stagger primitives
│   │       └── Section.tsx               # Section wrapper + Eyebrow
│   └── lib/
│       ├── motion.ts                     # Easing + variants
│       └── utils.ts                      # cn() + AUD formatters
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.mjs
├── tsconfig.json
├── package.json
└── README.md
```

---

## Design system

### Surfaces

| Token             | Value     | Use                               |
| ----------------- | --------- | --------------------------------- |
| `bg-base`         | `#070B14` | Page background                   |
| `bg-surface`      | `#0F1728` | Cards, panels                     |
| `bg-elevated`     | `#172033` | Hover state, raised panels        |

### Accents

| Token             | Value     | Use                               |
| ----------------- | --------- | --------------------------------- |
| `accent` (500)    | `#FF6B00` | Primary CTA, brand                |
| `gold` (400)      | `#FFC857` | Highlight, AI accent              |

### Typography

- **Inter** loaded via `next/font/google` (subset latin, swap)
- Display sizes are clamp-based for fluid scaling:
  `display-xl` (3rem → 6rem), `display-lg` (2.5rem → 4.5rem),
  `display-md` (2rem → 3.25rem)

### Motion

Shared easing curves in `src/lib/motion.ts`:

- `easeCinematic` `[0.22, 1, 0.36, 1]` — entrances, reveals
- `easeDecisive` `[0.4, 0, 0.2, 1]` — micro-interactions
- `easeSpring` `[0.34, 1.3, 0.64, 1]` — playful bounce (used sparingly)

All motion **respects `prefers-reduced-motion`** — Lenis is bypassed entirely
and Framer Motion animations collapse to instant transitions via the global
CSS rule in `globals.css`.

---

## When you're ready to deploy

This project is **fully isolated** from the existing FWL infrastructure.
You'll set up the commercial environment yourself, on your own schedule:

1. **GitHub** — create a new repository (e.g. `fwl-commercial`), push this
   folder as the first commit.
2. **Netlify or Vercel** — connect the new repository as a brand-new
   project. Build command `npm run build`, output `.next` (or use the
   Vercel preset).
3. **Supabase** — only when you need a database. Create a new project; do
   not point at the existing `uoraduyyxhtzixcsaidg` project.
4. **Environment variables** — none required to render the landing page.
   When you add auth/data later, prefix client-side vars with `NEXT_PUBLIC_`.

> No GitHub branches, no Vercel/Netlify projects, and no Supabase databases
> were created or modified to produce this code. Every infrastructure step
> is yours to make.

---

## Environment variables

The app reads its Supabase configuration (and a few other runtime knobs)
from environment variables. Locally, copy `.env.example` to `.env.local`
and fill in the values. In Netlify, set them under **Site settings →
Environment variables** — they are deliberately **not** committed to
`netlify.toml` so secrets stay out of source control.

| Variable                        | Required | Notes                                       |
| ------------------------------- | -------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Live Supabase project URL                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anon / publishable key             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server   | Service-role key for server-only operations |
| `NEXT_PUBLIC_SITE_URL`          | Yes      | Public site URL (OAuth + email redirects)   |
| `NEXT_PUBLIC_MFA_REQUIRED`      | No       | `"true"` to enforce step-up auth            |

> If `NEXT_PUBLIC_SUPABASE_URL` points at a dead / wrong project, the
> Supabase JS client logs ~13 × 404 per page load and cascades into
> React error-state re-renders — verify the dashboard value matches an
> `ACTIVE_HEALTHY` project before measuring performance.

---

## Accessibility & performance

- All animation paths respect `prefers-reduced-motion`.
- Semantic HTML throughout (`<section>`, `<header>`, `<footer>`, `<nav>`,
  `<main>`, `aria-label`, `aria-expanded`).
- Focus rings on every interactive element.
- Inter is loaded with `display: swap` to avoid FOIT.
- All animations are GPU-friendly (transform/opacity only); no layout
  thrash, no large video assets.
- The hero dashboard, phone mockups, and forecast charts are inline SVG —
  zero network requests.

---

## License

Internal. © Family Wealth Lab.
