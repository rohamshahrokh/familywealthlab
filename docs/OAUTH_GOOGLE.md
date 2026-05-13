# Google OAuth Setup

This guide configures "Continue with Google" for the commercial site. Allow
about 10 minutes. You'll work in three places: Google Cloud Console,
Supabase, and Netlify.

## 1. Google Cloud Console — create OAuth client

1. Go to <https://console.cloud.google.com/apis/credentials>.
2. Create or select a project (e.g. `fwl-commercial`).
3. Configure the **OAuth consent screen** (External, app name "Family
   Wealth Lab", support email = yours, developer email = yours). Add scopes
   `openid`, `email`, `profile`. Add yourself as a test user while in
   `Testing` mode.
4. **Create credentials → OAuth client ID** → type **Web application**.
5. Authorized JavaScript origins:
   - `https://family-wealth-lab.netlify.app`
   - `http://localhost:3000` (for local dev)
6. **Authorized redirect URIs** — this must be your Supabase callback URL:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

   Replace `YOUR_PROJECT_REF` with the new commercial Supabase project
   reference (Supabase Dashboard → Project Settings → General → Reference ID).
7. Save the **Client ID** and **Client Secret**.

## 2. Supabase — enable Google

1. Open the **fwl-commercial-prod** project in Supabase.
2. Authentication → Providers → Google → **Enabled**.
3. Paste the Client ID + Client Secret from step 1.
4. Save.

The Supabase callback URL shown here must match what you registered in
Google Cloud Console.

## 3. Netlify env vars

Site settings → Environment variables (production + deploy previews):

| Key                              | Value                                                                  |
| -------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | `https://YOUR_PROJECT_REF.supabase.co`                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | The `anon` key from Supabase → API Settings                            |
| `SUPABASE_SERVICE_ROLE_KEY`      | The `service_role` key — server-only, never expose to the client       |
| `NEXT_PUBLIC_SITE_URL`           | `https://family-wealth-lab.netlify.app` (or your custom production URL)|
| `NEXT_PUBLIC_MFA_REQUIRED`       | `false` (set `true` later to enforce MFA on sensitive routes)          |

Trigger a redeploy after changing env vars.

## 4. How the flow works

1. User clicks **Continue with Google** on `/login` or `/signup`.
2. The browser is redirected to Google with `redirect_to` =
   `https://family-wealth-lab.netlify.app/auth/callback?next=…`.
3. Google returns to Supabase's `/auth/v1/callback` with an OAuth code.
4. Supabase issues a temporary session and redirects back to our
   `/auth/callback` route handler with `?code=...`.
5. The route handler calls `supabase.auth.exchangeCodeForSession(code)`,
   logs a `login_success` audit event, and redirects to either `next` (if
   onboarded) or `/onboarding`.

## 5. Common issues

- **`redirect_uri_mismatch`** in Google: the redirect URI in Google Cloud
  must match `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
  exactly, including the scheme and trailing path.
- **Stuck on `/login?error=oauth_failed`**: usually a session cookie
  problem. Check that `NEXT_PUBLIC_SITE_URL` matches the deployed origin
  and the Site URL inside Supabase → Authentication → URL Configuration is
  set to the same origin.
- **Test users only see "App not verified"**: stay in `Testing` mode and
  add the user as a test user, or submit the OAuth consent screen for
  verification.

## 6. Going to production

Before going public:

- Switch the Google OAuth consent screen to **In production**.
- Add the canonical custom domain to **Authorized JavaScript origins**.
- Update `NEXT_PUBLIC_SITE_URL` in Netlify to the canonical domain.
- Update Supabase → Authentication → URL Configuration → Site URL to the
  canonical domain.
