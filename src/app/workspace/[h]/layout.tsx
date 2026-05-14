import { redirect, notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WorkspaceShell } from "./_components/WorkspaceShell";

export const dynamic = "force-dynamic";

interface Props {
  children: React.ReactNode;
  params: { h: string };
}

export default async function WorkspaceLayout({ children, params }: Props) {
  const session = await requireOnboarded(`/workspace/${params.h}/overview`);

  // Authoritative household resolution. Validates RLS membership at the same
  // time — if the user isn't a member, the row simply isn't returned and we
  // 404 instead of leaking existence.
  const supabase = createSupabaseServerClient();
  const { data: household } = await supabase
    .schema("app")
    .from("households")
    .select("id, name, country_code")
    .eq("id", params.h)
    .maybeSingle();

  if (!household) {
    // Fall back to the user's primary household if they hit a stale URL.
    if (session.profile?.household_id) {
      redirect(`/workspace/${session.profile.household_id}/overview`);
    }
    notFound();
  }

  return (
    <WorkspaceShell
      householdId={household.id}
      householdName={household.name ?? "Your household"}
      displayName={session.profile?.display_name ?? null}
      email={session.user.email ?? null}
    >
      {children}
    </WorkspaceShell>
  );
}
