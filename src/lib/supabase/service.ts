import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS — only safe on the server.
 * The `server-only` import above causes any accidental client-side import
 * to fail the build instead of silently leaking the service key.
 *
 * Use this exclusively for:
 *   - writing audit rows (audit.auth_events)
 *   - operator scripts / admin tooling
 *
 * Never use it in a request handler that an unauthenticated user can hit.
 */
export function createSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
