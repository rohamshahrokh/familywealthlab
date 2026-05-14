import Link from "next/link";
import { requireOnboarded } from "@/lib/auth";
import { SurfaceCard, CardHeader } from "@/components/workspace/cards";

export const dynamic = "force-dynamic";
export const metadata = { title: "Help — Family Wealth Lab" };

const TOPICS = [
  {
    code: "01",
    title: "Getting started",
    body: "Connect accounts, import openings, and run your first projection.",
    link: "#getting-started",
  },
  {
    code: "02",
    title: "How the modelling engine works",
    body: "Where the numbers come from: tax rules, gearing, CGT and property assumptions.",
    link: "#engine",
  },
  {
    code: "03",
    title: "Privacy & data",
    body: "What we store, what we don't, and how to delete everything.",
    link: "#privacy",
  },
  {
    code: "04",
    title: "Bank, broker & wallet connections",
    body: "Supported providers, refresh cadence, and how to fix a stuck connection.",
    link: "#connections",
  },
  {
    code: "05",
    title: "Reports & exports",
    body: "Generate, schedule and share. CSV and PDF formats.",
    link: "#reports",
  },
  {
    code: "06",
    title: "Pricing & plans",
    body: "Free, Pro and Family — what you get on each.",
    link: "#pricing",
  },
];

export default async function HelpPage({ params }: { params: { h: string } }) {
  await requireOnboarded(`/workspace/${params.h}/action/help`);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[05·06]</span>
          <span>Action · Help</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Help & support</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Documentation, frequently asked questions and direct support — same answers
          your accountant or planner would give you, written plainly.
        </p>
      </header>

      <SurfaceCard className="bg-gradient-to-br from-bg-inset to-bg-base">
        <CardHeader index="[?]" eyebrow="Talk to a human" title="Need a hand?" />
        <p className="text-body text-ink-tertiary mt-1 max-w-xl">
          Average reply time under 4 hours during Brisbane business hours. We do not
          provide personal financial advice — we explain how the product works and
          help you interpret the numbers.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="mailto:support@familywealthlab.com"
            className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-5 h-10 text-body-sm font-medium hover:bg-graphite-800 focus-ring"
          >
            Email support
          </a>
          <Link
            href={`/workspace/${params.h}/settings`}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-inset px-5 h-10 text-body-sm text-ink-secondary hover:text-ink-primary hover:bg-bg-base focus-ring"
          >
            Account settings
          </Link>
        </div>
      </SurfaceCard>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOPICS.map((t) => (
          <SurfaceCard key={t.code}>
            <CardHeader index={`[${t.code}]`} eyebrow="Topic" title={t.title} />
            <p className="text-body-sm text-ink-tertiary mt-1">{t.body}</p>
            <a
              href={t.link}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-bg-inset px-4 h-9 text-body-sm text-ink-secondary hover:text-ink-primary hover:bg-bg-base focus-ring w-fit"
            >
              Read more →
            </a>
          </SurfaceCard>
        ))}
      </section>
    </div>
  );
}
