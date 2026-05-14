import { redirect } from "next/navigation";
import { requireOnboarded } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * /workspace — convenience redirect to the user's primary household overview.
 * The deep link is always /workspace/[householdId]/overview so URLs are
 * sharable across multi-household members.
 */
export default async function WorkspaceRoot() {
  const session = await requireOnboarded("/workspace");
  if (session.profile?.household_id) {
    redirect(`/workspace/${session.profile.household_id}/overview`);
  }
  redirect("/onboarding");
}
