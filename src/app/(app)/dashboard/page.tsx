import { requireOnboarded } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — Family Wealth Lab",
};

export default async function DashboardPage() {
  const session = await requireOnboarded();
  const first = session.profile?.display_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <header className="rounded-3xl bg-white shadow-card ring-1 ring-line p-7 sm:p-9">
        <div className="mono text-eyebrow text-ember-500 mb-3">[01] Welcome</div>
        <h1 className="text-h2 text-ink-primary tracking-tight">
          Welcome back, {first}.
        </h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl">
          Your household workspace is ready. We&rsquo;ll surface scenarios,
          decisions, and tax-aware nudges here as you connect data sources.
        </p>
      </header>

      {/* Empty-state shell */}
      <section className="grid sm:grid-cols-2 gap-5">
        <Card
          index="[02]"
          title="Connect your data"
          body="Link accounts, super funds, and properties to start modelling scenarios."
        />
        <Card
          index="[03]"
          title="Run your first scenario"
          body="Compare a what-if across tax, super, debt, and timing in one chart."
        />
        <Card
          index="[04]"
          title="Invite your household"
          body="Bring your partner or advisor into the workspace with role-based access."
        />
        <Card
          index="[05]"
          title="Tighten security"
          body="Enable two-factor authentication on your account."
          href="/settings/security"
        />
      </section>
    </div>
  );
}

function Card({
  index,
  title,
  body,
  href,
}: {
  index: string;
  title: string;
  body: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className="mono text-eyebrow text-ember-500 mb-3">{index}</div>
      <div className="text-body-sm font-semibold text-ink-primary tracking-tight">{title}</div>
      <p className="mt-2 text-body-sm text-ink-tertiary leading-relaxed">{body}</p>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-2xl bg-white shadow-card ring-1 ring-line p-6 hover:ring-line-strong transition-shadow focus-ring"
      >
        {inner}
      </a>
    );
  }
  return (
    <div className="rounded-2xl bg-white shadow-card ring-1 ring-line p-6">{inner}</div>
  );
}
