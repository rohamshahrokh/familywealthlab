import { requireOnboarded } from "@/lib/auth";
import { AppShell } from "./_components/AppShell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireOnboarded();
  return (
    <AppShell
      displayName={session.profile?.display_name ?? null}
      email={session.user.email ?? null}
    >
      {children}
    </AppShell>
  );
}
