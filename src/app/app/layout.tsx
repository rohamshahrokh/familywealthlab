import * as React from "react";
import { AppProviders } from "./_components/Providers";
import { AppSidebar } from "./_components/AppSidebar";
import { AppTopBar } from "./_components/AppTopBar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Family Wealth Lab — App",
  description: "The migrated personal-app experience inside the commercial shell.",
};

/**
 * /app/* shell — sidebar + main column. Mirrors the personal app Layout.
 * Auth gating is intentionally deferred until commercial Supabase wiring lands —
 * for now, /app/* is unauthenticated demo mode (see queryClient.isDemoMode).
 *
 * APP_SHELL_UI_UX_FIX_PASS_01 — Issues 2 & 6: the main column is now wrapped
 * in an AppTopBar that exposes the period / show-hide / theme / profile
 * controls that the original personal app shipped with.
 */
export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <div className="min-h-screen bg-bg-base text-ink-primary flex flex-col lg:flex-row">
        <AppSidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <AppTopBar />
          <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AppProviders>
  );
}
