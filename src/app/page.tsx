import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * ROOT_UNIFICATION_PASS_01 — The root route used to render a separate
 * marketing shell (Nav + Hero + StatsBand + Chaos + CommandCenter + WhatIf +
 * AIInsights + MobileExperience + Trust + FinalCTA + Footer) under
 * SmoothScrollProvider. That created a split between the marketing site at /
 * and the commercial app shell at /app/*.
 *
 * Per the brief: "I want the root experience unified … same sidebar/topbar/
 * theme system as /app/snapshot … no split between old marketing shell and
 * new app shell … Remove old static mockup homepage architecture."
 *
 * The root now redirects into the canonical commercial app entry point.
 * The app shell (AppSidebar + AppTopBar + theme + privacy) at /app/* is the
 * single source of truth for the entire site.
 */
export default function RootPage() {
  redirect("/app/snapshot");
}
