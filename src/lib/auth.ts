import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = {
  user: User;
  profile: {
    user_id: string;
    display_name: string | null;
    household_id: string | null;
    onboarded_at: string | null;
  } | null;
  aal: "aal1" | "aal2" | null;
};

/**
 * Resolve the current session user along with profile + AAL.
 * Returns null when unauthenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const aalResp = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const currentLevel = (aalResp.data?.currentLevel ?? null) as
    | "aal1"
    | "aal2"
    | null;

  const { data: profile } = await supabase
    .schema("app")
    .from("profiles")
    .select("user_id, display_name, household_id, onboarded_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, profile, aal: currentLevel };
}

/** Redirect to /login if not signed in. Returns the session otherwise. */
export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    const q = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login${q}`);
  }
  return session;
}

/**
 * Require an onboarded user. Redirects to /onboarding if profile is missing
 * or `onboarded_at` is null.
 */
export async function requireOnboarded(nextPath?: string): Promise<SessionUser> {
  const session = await requireUser(nextPath);
  if (!session.profile?.onboarded_at) {
    redirect("/onboarding");
  }
  return session;
}

/**
 * Step-up authentication. Redirects:
 *   - to /login/mfa  if user has a factor but hasn't challenged this session
 *   - to /settings/security?enroll=1  if they have no factor at all
 */
export async function requireMFA(nextPath?: string): Promise<SessionUser> {
  const session = await requireOnboarded(nextPath);
  if (session.aal === "aal2") return session;

  const supabase = createSupabaseServerClient();
  const aalResp = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const nextLevel = aalResp.data?.nextLevel ?? null;

  if (nextLevel === "aal2") {
    const q = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login/mfa${q}`);
  }
  redirect("/settings/security?enroll=1");
}

/** Convenience: load the primary household for the current user. */
export async function getPrimaryHousehold(userId: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .schema("app")
    .from("household_members")
    .select("household_id, role, households:households(id, name, country_code)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}
