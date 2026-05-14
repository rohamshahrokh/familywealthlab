import { redirect } from "next/navigation";

/**
 * Phase 1: the canonical authenticated landing is `/workspace`, which resolves
 * to `/workspace/[householdId]/overview`. The old `/dashboard` route is kept
 * as a passive redirect so existing links and bookmarks don't 404.
 */
export default function DashboardPage() {
  redirect("/workspace");
}
