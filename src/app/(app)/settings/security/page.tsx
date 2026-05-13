import { requireOnboarded } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { SecurityClient } from "./security-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Security — Family Wealth Lab",
};

interface Props {
  searchParams?: { enroll?: string };
}

export default async function SecurityPage({ searchParams }: Props) {
  const session = await requireOnboarded();
  const supabase = createSupabaseServerClient();

  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const totpFactors = factorsData?.totp ?? [];

  // Recent audit activity (via service role — RLS-bypassing read for one user).
  const service = createSupabaseServiceClient();
  const { data: events } = await service
    .schema("audit")
    .from("auth_events")
    .select("id, event, created_at, ip, user_agent")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <div className="mono text-eyebrow text-ember-500 mb-3">[02] Security</div>
        <h1 className="text-h2 text-ink-primary tracking-tight">Account security.</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl">
          Manage two-factor authentication and review recent sign-in activity for{" "}
          <span className="text-ink-primary">{session.user.email}</span>.
        </p>
      </header>

      <SecurityClient
        factors={totpFactors.map((f) => ({
          id: f.id,
          friendlyName: f.friendly_name ?? "Authenticator app",
          status: f.status,
          createdAt: f.created_at,
        }))}
        autoEnroll={searchParams?.enroll === "1" && totpFactors.length === 0}
        events={(events ?? []).map((e) => ({
          id: e.id,
          event: e.event,
          createdAt: e.created_at,
          ip: e.ip,
          userAgent: e.user_agent,
        }))}
      />
    </div>
  );
}
