import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { getSessionUser } from "@/lib/auth";
import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Welcome — Family Wealth Lab",
};

export default async function OnboardingPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?next=/onboarding");
  if (session.profile?.onboarded_at) redirect("/workspace");

  return (
    <AuthShell
      eyebrow="Welcome"
      title="Set up your workspace."
      subtitle="Two quick details. You can change these later in settings."
    >
      <OnboardingForm
        defaultDisplayName={session.profile?.display_name ?? ""}
        defaultHouseholdName=""
      />
    </AuthShell>
  );
}
