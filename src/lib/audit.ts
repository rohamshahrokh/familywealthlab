import "server-only";
import { headers } from "next/headers";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type AuthEvent =
  | "signup"
  | "signup_started"
  | "signup_failed"
  | "login_success"
  | "login_failed"
  | "login_pending_mfa"
  | "logout"
  | "password_reset_requested"
  | "password_reset_completed"
  | "mfa_enrolled"
  | "mfa_unenrolled"
  | "mfa_challenge_success"
  | "mfa_challenge_failed"
  | "onboarding_completed"
  | "verification_email_resent";

interface LogArgs {
  userId?: string | null;
  email?: string | null;
  event: AuthEvent;
  metadata?: Record<string, unknown>;
}

/**
 * Append an auth-relevant event to `audit.auth_events`.
 * Best-effort: failures are swallowed so an audit problem never breaks the
 * user-facing flow (the action that triggered the log already succeeded).
 */
export async function logAuthEvent({ userId, email, event, metadata }: LogArgs) {
  try {
    const h = headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      null;
    const userAgent = h.get("user-agent") || null;

    const supabase = createSupabaseServiceClient();
    await supabase
      .schema("audit")
      .from("auth_events")
      .insert({
        user_id: userId ?? null,
        email: email ?? null,
        event,
        ip,
        user_agent: userAgent,
        metadata: metadata ?? {},
      });
  } catch (err) {
    // Audit must never block the auth flow.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[audit] failed to log", event, err);
    }
  }
}
