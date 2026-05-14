import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logAuthEvent } from "@/lib/audit";

/**
 * OAuth + email-confirmation callback.
 * Exchanges the `code` for a session, audits the login, then redirects to
 * either the requested `next` path or the dashboard / onboarding.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/workspace";

  if (code) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Determine whether the user has completed onboarding.
      const { data: profile } = await supabase
        .schema("app")
        .from("profiles")
        .select("onboarded_at")
        .eq("user_id", data.user.id)
        .maybeSingle();

      await logAuthEvent({
        userId: data.user.id,
        email: data.user.email,
        event: "login_success",
        metadata: { provider: data.user.app_metadata?.provider ?? "email" },
      });

      const dest = profile?.onboarded_at
        ? next.startsWith("/") ? next : "/workspace"
        : "/onboarding";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
}
