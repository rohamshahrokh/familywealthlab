# Auth Foundation → Commercial Site Merge Plan

This documents the surgical merge of the Auth Foundation into the existing
`fwl-commercial` Netlify project. **The approved landing page is untouched.**

## Scope guarantees

- The current homepage at `/` is **byte-identical** to before. The only change
  to existing code is `src/components/layout/Nav.tsx`, where the existing
  `<Button>Sign in</Button>` and `<Button>Request access</Button>` were
  wrapped with `<Link href="/login">` and `<Link href="/signup">` via
  `asChild`. The buttons render the same DOM.
- No Vercel files. No new repo. No second Next app.
- All design tokens (paper bg, ink primary, ember accent, JetBrains Mono
  markers, pill buttons, hairline rings, ember focus rings) are reused from
  the existing `tailwind.config.ts` and `globals.css`.

## What was added

### Routes (App Router)

| Route                       | Type          | Purpose                                                   |
| --------------------------- | ------------- | --------------------------------------------------------- |
| `/signup`                   | Public        | Email/password + Google. Routes to `/verify-email`        |
| `/login`                    | Public        | Email/password + Google. Step-up to `/login/mfa` if AAL2  |
| `/login/mfa`                | Public        | TOTP challenge. Honours `?next=` param                    |
| `/verify-email`             | Public        | Inbox-pending screen with resend                          |
| `/reset-password`           | Public        | Request reset link                                        |
| `/reset-password/confirm`   | Public        | Set new password after clicking email link                |
| `/onboarding`               | Authed        | Set display name + household name                         |
| `/dashboard`                | Authed (app)  | Empty workspace shell                                     |
| `/settings/security`        | Authed (app)  | MFA enrol/unenrol + 10 recent audit events                |
| `/auth/callback`            | Route handler | OAuth + email confirmation exchange                       |
| `/auth/signout`             | Route handler | Audited sign-out                                          |

The `/dashboard` and `/settings/security` routes live under a route group
`/(app)/` whose layout calls `requireOnboarded()`.

### Library code

```
src/
├── middleware.ts                       # cookie refresh + route protection
├── lib/
│   ├── supabase/
│   │   ├── browser.ts                  # createSupabaseBrowserClient()
│   │   ├── server.ts                   # createSupabaseServerClient()  (SSR cookies)
│   │   └── service.ts                  # createSupabaseServiceClient() (service role)
│   ├── auth.ts                         # getSessionUser, requireUser, requireOnboarded, requireMFA
│   └── audit.ts                        # logAuthEvent(...)
└── app/
    └── auth/
        ├── actions.ts                  # all server actions (Zod-validated)
        ├── callback/route.ts           # OAuth code exchange
        └── signout/route.ts            # POST sign-out wrapper
```

### Auth UI primitives (paper-aesthetic, match landing)

```
src/components/auth/
├── AuthShell.tsx       # logo bar + paper bg + ember [01] marker + hairline card
├── Field.tsx           # Field, Label, Input, FormError, FormSuccess, Helper, FieldError
├── GoogleButton.tsx    # uses existing <Button variant="secondary">
└── Divider.tsx         # mono "or" divider
```

All form buttons use the existing `<Button variant="primary">` (ink CTA),
matching the landing's "Request access" button.

### Database

`supabase/migrations/20260514000000_auth_foundation.sql` creates two schemas:

- `app` — `households`, `profiles`, `household_members` with RLS + auto-create
  trigger on `auth.users` insert.
- `audit` — `auth_events` append-only log (service-role write only).

The `app` schema is intentionally narrower than the v2 monorepo's
multi-schema design — the commercial site only needs identity and household
membership.

### Configuration

- `.env.example` documents all required env vars.
- `netlify.toml` is **unchanged** — the existing `@netlify/plugin-nextjs` v5
  config already supports App Router middleware, server actions, and
  dynamic route handlers.
- `package.json` got four runtime deps: `@supabase/ssr`, `@supabase/supabase-js`,
  `server-only`, `zod`. No dev deps were touched.

## What was NOT changed

- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/sections/*` (all landing sections)
- `src/components/layout/Footer.tsx`
- `src/components/ui/*` (Button, Section, Reveal, …)
- `src/components/brand/Logo.tsx`
- `tailwind.config.ts`, `postcss.config.mjs`, `next.config.mjs`, `netlify.toml`

The only modified existing file is `src/components/layout/Nav.tsx` — the
visual output is identical.

## Verification

```bash
npm run typecheck   # passes — zero errors
npm run build       # passes — 16 routes, middleware 81 kB
```

The build collects all 16 routes (landing + 8 auth pages + 2 app pages +
4 route handlers + icon/not-found), confirming the auth tree is wired
without breaking the existing site.

## Manual setup (deploy checklist)

See `OAUTH_GOOGLE.md`, `MFA.md`, `TESTING.md`, and `SECURITY.md` for the
detailed steps. Quick summary:

1. Create a **new** Supabase project (`fwl-commercial-prod`). Do not reuse
   the live or v2 project.
2. Apply `supabase/migrations/20260514000000_auth_foundation.sql` via the
   Supabase SQL editor.
3. Supabase → API Settings → Exposed schemas: add `app` and `audit`.
4. Supabase → Auth → Providers → Google: paste the OAuth client ID + secret
   from Google Cloud Console.
5. Netlify → Site settings → Environment variables: add the five env vars
   from `.env.example`.
6. Trigger a redeploy.
