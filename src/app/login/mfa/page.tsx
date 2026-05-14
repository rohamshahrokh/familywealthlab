import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MfaChallengeForm } from "./mfa-challenge-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Two-factor authentication — Family Wealth Lab",
};

interface Props {
  searchParams?: { next?: string };
}

export default async function MfaPage({ searchParams }: Props) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const totp = factorsData?.totp?.find((f) => f.status === "verified");
  if (!totp) {
    // No verified factor — send them to enroll one.
    redirect("/settings/security?enroll=1");
  }

  return (
    <AuthShell
      eyebrow="Two-factor"
      title="Verify it's you."
      subtitle="Enter the 6-digit code from your authenticator app to continue."
    >
      <MfaChallengeForm factorId={totp.id} next={searchParams?.next ?? "/workspace"} />
    </AuthShell>
  );
}
