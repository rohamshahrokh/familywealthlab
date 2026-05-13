# Multi-Factor Authentication (TOTP)

The commercial site implements TOTP-based MFA using Supabase's native MFA
APIs. Users enrol an authenticator app (1Password, Authy, Google
Authenticator, Bitwarden, etc.) and challenge with a 6-digit code.

## Enabling at the Supabase project level

1. Supabase → Authentication → Policies → Multi-Factor Authentication.
2. Enable **TOTP**.
3. (Recommended) Enable **AAL2 required for sensitive operations** — the
   `requireMFA()` helper in `src/lib/auth.ts` honours the AAL signal
   returned by Supabase.

## Enrolment flow

1. Authed user visits `/settings/security`.
2. Clicks **Set up two-factor**.
3. Server action `mfaEnrollStart()` calls
   `supabase.auth.mfa.enroll({ factorType: 'totp' })` and returns the QR
   code + secret.
4. User scans the QR with their authenticator and enters the 6-digit code.
5. Server action `mfaEnrollVerify(formData)` calls
   `supabase.auth.mfa.challenge` then `supabase.auth.mfa.verify`. On
   success, `audit.auth_events` records `mfa_enrolled`.

The user is now `aal2` for the remainder of their session.

## Challenge flow (step-up)

On every email/password sign-in, `signIn` action checks
`supabase.auth.mfa.getAuthenticatorAssuranceLevel()`:

- `currentLevel = aal1` and `nextLevel = aal2` → user has MFA → redirect to
  `/login/mfa?next=...`.
- Otherwise → continue to `/dashboard` (or `next`).

The MFA challenge form (`/login/mfa`) finds the user's verified TOTP factor
and posts the 6-digit code to `mfaChallengeVerify(formData)`. On success it
redirects to `next`. Audit events written: `mfa_challenge_success` or
`mfa_challenge_failed`.

## Removing MFA

`/settings/security` shows a **Remove two-factor** button when a verified
factor exists. This calls `mfaUnenroll(formData)` which invokes
`supabase.auth.mfa.unenroll`. Audit event: `mfa_unenrolled`.

## Programmatic gating

To require MFA on any server component or route handler:

```ts
import { requireMFA } from "@/lib/auth";

export default async function SensitivePage() {
  const session = await requireMFA();
  // user is guaranteed authenticated, onboarded, and AAL2
}
```

`requireMFA()` will redirect to `/login/mfa` (if the user has a factor) or
`/settings/security?enroll=1` (if they don't).

## Recovery / backup codes

Supabase does **not** issue TOTP backup codes natively. Two practical
options for production:

1. Have users register a second authenticator (e.g. their phone + a
   hardware token like a YubiKey). The enrolment UI currently supports one
   TOTP factor; extending to multiple is a small change.
2. Provide a "lost device" support flow that requires email verification +
   manual unenrolment by an admin using the service role key.

For the initial beta, option 2 is sufficient.

## Why `NEXT_PUBLIC_MFA_REQUIRED`?

It's a soft flag for callers to read in code that wants to enforce MFA
unconditionally. The default is `false` — users opt in via
`/settings/security`. Flip to `true` once you're ready to require MFA for
all account holders; then call `requireMFA()` (instead of
`requireOnboarded()`) inside `src/app/(app)/layout.tsx`.
