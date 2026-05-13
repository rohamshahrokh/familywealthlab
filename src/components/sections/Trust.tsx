"use client";

import { Lock, Shield, MapPin, EyeOff, ServerOff, KeyRound } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const PILLARS = [
  {
    icon: Lock,
    title: "End-to-end encrypted",
    body: "AES-256 at rest, TLS 1.3 in transit. Your numbers stay your numbers.",
  },
  {
    icon: KeyRound,
    title: "User-owned data",
    body: "Export everything at any time. Delete everything at any time. No lock-in.",
  },
  {
    icon: MapPin,
    title: "Australian-focused",
    body: "Built around AU tax rules, super, APRA buffers, and AUD-first reporting.",
  },
  {
    icon: EyeOff,
    title: "No ads, ever",
    body: "We don't sell, share, or monetise your financial data. You pay us. That's it.",
  },
  {
    icon: ServerOff,
    title: "On-device intelligence",
    body: "Most AI inference runs locally. Nothing leaves your device unless you ask.",
  },
  {
    icon: Shield,
    title: "Audited methodology",
    body: "Open methodology document. Monte Carlo seeds reproducible. Math verifiable.",
  },
];

export function Trust() {
  return (
    <Section id="trust" className="relative">
      <div className="container-narrow">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Trust by design</Eyebrow>
          <Reveal preset="fadeUpSlow">
            <h2 className="mt-4 text-balance font-display text-display-md text-ink-50">
              Engineered with your{" "}
              <span className="gradient-text-accent">privacy at the core.</span>
            </h2>
          </Reveal>
          <Reveal preset="fadeUp" delay={0.1}>
            <p className="mt-5 text-balance text-[16px] leading-relaxed text-ink-300 sm:text-[17px]">
              The most personal numbers in your life deserve the most uncompromising
              infrastructure.
            </p>
          </Reveal>
        </div>

        <Reveal preset="fadeUp" delay={0.15}>
          <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-2xl bg-bg-surface/50 p-6 ring-1 ring-inset ring-white/[0.06] transition-all duration-500 hover:bg-bg-elevated/70 hover:ring-white/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-ink-100 ring-hairline transition-colors group-hover:bg-accent/15 group-hover:text-accent">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-5 font-display text-[16px] font-semibold tracking-tight text-ink-50">
                  {title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-300">{body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
