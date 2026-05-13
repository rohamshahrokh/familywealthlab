# Testing the Auth Foundation

A manual QA checklist for the merged auth flows. Run through this once
locally with a fresh Supabase project, then once on the deployed Netlify
preview.

## Pre-flight

- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
      `SUPABASE_SERVICE_ROLE_KEY` are set (locally in `.env.local`, in
      Netlify env vars for the deploy).
- [ ] `supabase/migrations/20260514000000_auth_foundation.sql` has been
      applied. `app` and `audit` schemas are exposed in Supabase API
      Settings.
- [ ] Google OAuth is configured (see `OAUTH_GOOGLE.md`).

## Landing page (regression)

- [ ] Visit `/`. The page renders identically to
      <https://family-wealth-lab.netlify.app/>:
  - Hero headline: "The wealth operating system for serious households."
  - Top bar shows wordmark + ticker; "Sign in" (ghost) + "Request access"
    (primary) buttons in the top-right.
  - Mobile menu also shows both buttons.
- [ ] Click **Sign in** → navigates to `/login` (no full reload visible).
- [ ] Click **Request access** → navigates to `/signup`.
- [ ] All section anchors (`#command`, `#whatif`, …) still work.

## Sign up → verify → onboarding → dashboard

- [ ] Visit `/signup`. Page uses paper bg, eyebrow `[01] Request access`,
      title "Create your workspace."
- [ ] Submit email + password (≥ 8 chars). You're redirected to
      `/verify-email?email=...`.
- [ ] Check inbox for the Supabase confirmation email.
- [ ] Click the link. Browser lands on `/auth/callback`, which exchanges
      the code and redirects to `/onboarding` (because `onboarded_at` is
      null).
- [ ] Enter display name + household name. Submit → `/dashboard`.
- [ ] Dashboard shows "Welcome back, {first name}." and 4 starter cards.

## Sign in (email/password)

- [ ] Open `/login` while signed out. Form is paper-bg, paginated `[02]`.
- [ ] Submit correct credentials → `/dashboard`.
- [ ] Submit wrong password → inline `FormError` with the Supabase reason.
- [ ] Click **Forgot?** → `/reset-password`.

## Password reset

- [ ] `/reset-password`: enter your email → success flash regardless of
      whether the email exists (no enumeration).
- [ ] Click the reset link in the email. Lands on `/reset-password/confirm`.
- [ ] Enter mismatched passwords → "Passwords don't match." error.
- [ ] Enter matching passwords ≥ 8 chars → redirect to `/login?reset=1`
      with a success flash.
- [ ] Sign in with the new password.

## Google OAuth

- [ ] `/login` → **Continue with Google** → Google chooser → consent.
- [ ] You return to `/auth/callback?code=...&next=/dashboard`.
- [ ] If first time: `/onboarding`. If returning: `/dashboard`.

## MFA

- [ ] Signed in, visit `/settings/security`. The Two-factor panel says
      "Not enabled".
- [ ] Click **Set up two-factor**. QR code + secret appear.
- [ ] Scan with an authenticator app (Authy / 1Password / Google
      Authenticator).
- [ ] Enter the 6-digit code → success message and the panel switches to
      "Enabled".
- [ ] Sign out (sidebar **Sign out** button posts to `/auth/signout`).
- [ ] Sign back in with email/password. After password, you should be
      redirected to `/login/mfa?next=/dashboard`.
- [ ] Enter the current 6-digit code → `/dashboard`.

## Recent activity

- [ ] `/settings/security` shows up to 10 recent events. After running
      through this checklist you should see entries like
      `Mfa Challenge Success`, `Login Success`, `Onboarding Completed`,
      `Mfa Enrolled`, `Signup Started`.

## Route protection (middleware)

- [ ] Sign out. Visit `/dashboard` → redirect to
      `/login?next=%2Fdashboard`.
- [ ] Sign in → bounced back to `/dashboard`.
- [ ] While signed in, visit `/login` → redirected to `/dashboard`.
- [ ] While signed in, visit `/signup` → redirected to `/dashboard`.

## Sign out

- [ ] Click **Sign out** in the sidebar. You land on `/`. Cookies are
      cleared. `/dashboard` now requires re-authentication.

## Audit log (server-side check)

In the Supabase SQL editor:

```sql
select created_at, event, email, ip
from audit.auth_events
order by created_at desc
limit 20;
```

You should see at least: `signup_started`, `login_success`,
`onboarding_completed`, `mfa_enrolled`, `mfa_challenge_success`, `logout`.

## Build verification

```bash
cd /home/user/workspace/fwl-commercial
npm run typecheck
npm run build
```

Both must exit 0. The build output should list 16 routes including the
auth tree.
