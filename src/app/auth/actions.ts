"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logAuthEvent } from "@/lib/audit";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Sign up (email + password)
// ---------------------------------------------------------------------------

const signUpSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export async function signUp(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback` },
  });

  await logAuthEvent({
    userId: data.user?.id,
    email: parsed.data.email,
    event: error ? "signup_failed" : "signup_started",
    metadata: { ok: !error },
  });

  if (error) return { ok: false, error: error.message };

  // Confirm-email flow: user must verify, no session yet.
  redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
}

// ---------------------------------------------------------------------------
// Sign in (email + password) — handles AAL step-up routing
// ---------------------------------------------------------------------------

const signInSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional().default("/workspace"),
});

export async function signIn(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    await logAuthEvent({
      email: parsed.data.email,
      event: "login_failed",
      metadata: { reason: error?.message },
    });
    return { ok: false, error: error?.message ?? "Sign in failed." };
  }

  // Check if a step-up MFA challenge is required.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const needsMfa = aal?.nextLevel === "aal2" && aal?.currentLevel !== "aal2";

  await logAuthEvent({
    userId: data.user.id,
    email: data.user.email,
    event: needsMfa ? "login_pending_mfa" : "login_success",
    metadata: { provider: "email" },
  });

  const next = parsed.data.next?.startsWith("/") ? parsed.data.next : "/workspace";

  if (needsMfa) {
    redirect(`/login/mfa?next=${encodeURIComponent(next)}`);
  }

  // Determine onboarding state.
  const { data: profile } = await supabase
    .schema("app")
    .from("profiles")
    .select("onboarded_at")
    .eq("user_id", data.user.id)
    .maybeSingle();

  redirect(profile?.onboarded_at ? next : "/onboarding");
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

const emailSchema = z.object({ email: z.string().email() });

export async function requestPasswordReset(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: "Enter a valid email." };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/reset-password/confirm`,
  });

  await logAuthEvent({
    email: parsed.data.email,
    event: "password_reset_requested",
    metadata: { ok: !error },
  });

  // Always show success to avoid disclosing which emails exist.
  return { ok: true, message: "If that email exists, a reset link is on its way." };
}

const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  });

export async function confirmPasswordReset(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: error.message };

  await logAuthEvent({
    userId: userData.user?.id,
    email: userData.user?.email,
    event: "password_reset_completed",
  });

  redirect("/login?reset=1");
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  await logAuthEvent({
    userId: userData.user?.id,
    email: userData.user?.email,
    event: "logout",
  });
  redirect("/");
}

// ---------------------------------------------------------------------------
// MFA
// ---------------------------------------------------------------------------

const enrollVerifySchema = z.object({
  factorId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export async function mfaEnrollStart(): Promise<
  | { ok: true; factorId: string; qrCode: string; secret: string }
  | { ok: false; error: string }
> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Authenticator app",
  });
  if (error || !data) return { ok: false, error: error?.message ?? "Could not start enrolment." };
  return {
    ok: true,
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

export async function mfaEnrollVerify(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = enrollVerifySchema.safeParse({
    factorId: formData.get("factorId"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const supabase = createSupabaseServerClient();
  const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({
    factorId: parsed.data.factorId,
  });
  if (chErr || !challenge) return { ok: false, error: chErr?.message ?? "Challenge failed." };

  const { error: vErr } = await supabase.auth.mfa.verify({
    factorId: parsed.data.factorId,
    challengeId: challenge.id,
    code: parsed.data.code,
  });
  if (vErr) return { ok: false, error: vErr.message };

  const { data: userData } = await supabase.auth.getUser();
  await logAuthEvent({
    userId: userData.user?.id,
    email: userData.user?.email,
    event: "mfa_enrolled",
  });
  return { ok: true, message: "Two-factor authentication is on." };
}

const challengeSchema = z.object({
  factorId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export async function mfaChallengeVerify(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = challengeSchema.safeParse({
    factorId: formData.get("factorId"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const supabase = createSupabaseServerClient();
  const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({
    factorId: parsed.data.factorId,
  });
  if (chErr || !challenge) return { ok: false, error: chErr?.message ?? "Challenge failed." };

  const { error } = await supabase.auth.mfa.verify({
    factorId: parsed.data.factorId,
    challengeId: challenge.id,
    code: parsed.data.code,
  });
  const { data: userData } = await supabase.auth.getUser();
  if (error) {
    await logAuthEvent({
      userId: userData.user?.id,
      email: userData.user?.email,
      event: "mfa_challenge_failed",
    });
    return { ok: false, error: error.message };
  }
  await logAuthEvent({
    userId: userData.user?.id,
    email: userData.user?.email,
    event: "mfa_challenge_success",
  });
  const next = (formData.get("next") as string | null) || "/workspace";
  redirect(next.startsWith("/") ? next : "/workspace");
}

export async function mfaUnenroll(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const factorId = z.string().uuid().safeParse(formData.get("factorId"));
  if (!factorId.success) return { ok: false, error: "Invalid factor." };
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId: factorId.data });
  if (error) return { ok: false, error: error.message };
  const { data: userData } = await supabase.auth.getUser();
  await logAuthEvent({
    userId: userData.user?.id,
    email: userData.user?.email,
    event: "mfa_unenrolled",
  });
  return { ok: true, message: "Two-factor authentication removed." };
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

const onboardingSchema = z.object({
  displayName: z.string().min(1, "Add your name.").max(80),
  householdName: z.string().min(1, "Add a household name.").max(80),
});

export async function completeOnboarding(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = onboardingSchema.safeParse({
    displayName: formData.get("displayName"),
    householdName: formData.get("householdName"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You're not signed in." };

  // Update profile
  const { error: pErr } = await supabase
    .schema("app")
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      onboarded_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  if (pErr) return { ok: false, error: pErr.message };

  // Rename household if profile has one
  const { data: profile } = await supabase
    .schema("app")
    .from("profiles")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.household_id) {
    await supabase
      .schema("app")
      .from("households")
      .update({ name: parsed.data.householdName })
      .eq("id", profile.household_id);
  }

  await logAuthEvent({
    userId: user.id,
    email: user.email,
    event: "onboarding_completed",
  });

  if (profile?.household_id) {
    redirect(`/workspace/${profile.household_id}/overview`);
  }
  redirect("/workspace");
}

// ---------------------------------------------------------------------------
// Resend verification email
// ---------------------------------------------------------------------------

export async function resendVerification(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: "Enter a valid email." };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback` },
  });

  await logAuthEvent({
    email: parsed.data.email,
    event: "verification_email_resent",
    metadata: { ok: !error },
  });

  return { ok: true, message: "Verification email sent — check your inbox." };
}
