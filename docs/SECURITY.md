# Security Notes

How the Auth Foundation is designed to be safe by default.

## Authentication

- **Supabase Auth** is the identity provider. We rely on its production
  token rotation, refresh handling, and rate limiting.
- **PKCE for OAuth** — the `@supabase/ssr` server client uses PKCE for
  Google OAuth code exchange.
- **HTTP-only cookies** carry session tokens. JavaScript on the page can
  never read them. Cookies are set with `Secure` in production and
  refreshed by the middleware on every request.
- **Email confirmation is mandatory.** `signUp` redirects to
  `/verify-email`; the user only gets a session after clicking the link
  and the `/auth/callback` route handler exchanges the code.

## Authorization

- All app data tables live under the `app` schema with **RLS enabled** and
  policies that scope reads/writes to either the user themselves (profiles)
  or members of the household (households, household_members).
- A `SECURITY DEFINER` helper, `app.is_household_member(uuid, uuid)`,
  centralises the membership check used by policies.
- The **service role** key is server-only and is used in exactly two
  places: `src/lib/audit.ts` (write-only append to `audit.auth_events`)
  and `src/app/(app)/settings/security/page.tsx` (one-user read of their
  own audit history). It is never exposed to the browser.

## MFA

- TOTP via Supabase. See `MFA.md`.
- `signIn` checks the AAL gap (`currentLevel != nextLevel`) and redirects
  to `/login/mfa` before granting access.
- `requireMFA()` enforces AAL2 on protected server components.

## Auditing

- The `audit.auth_events` table is append-only:
  - RLS denies all SELECT/INSERT to the `authenticated` role.
  - Only the service role can insert (and read for the user's own page).
- Every server action that mutates auth state logs an event with
  `user_id`, `email`, `event` (typed union), `ip`, `user_agent`,
  `metadata`. Failures inside `logAuthEvent` are swallowed so an audit
  outage cannot break sign-in.

## Input validation

- All server actions parse `formData` through **Zod** schemas. Invalid
  input returns `{ ok: false, error: '...' }` and never reaches Supabase.
- Email enumeration is prevented on `requestPasswordReset` — the action
  always returns the same success message whether or not the email
  exists.

## Headers

The existing `netlify.toml` sets the same hardening headers used by the
landing page:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `Permissions-Policy: ...`

No changes needed.

## Secrets handling

- `.env.local` is git-ignored.
- `.env.example` documents the shape but contains no secrets.
- Service role key is referenced only in files that `import "server-only"`
  to make accidental client bundling impossible.

## Threat model — quick summary

| Risk                                    | Mitigation                                                          |
| --------------------------------------- | ------------------------------------------------------------------- |
| Stolen session cookie                   | HTTP-only + Secure; short refresh window; sign-out clears tokens    |
| Credential stuffing                     | Supabase rate limits; MFA strongly recommended via settings        |
| Email enumeration on reset              | Constant-message response                                           |
| CSRF on sign-out                        | Form POST + cookie-bound action; SameSite=Lax cookies               |
| Privileged data leak via client bundle  | `import "server-only"` on service-role modules                      |
| Auth state desync between SSR + client  | Middleware refreshes cookies on every request                       |
| Audit-trail tampering                   | RLS denies UPDATE/DELETE; only service role inserts                 |
