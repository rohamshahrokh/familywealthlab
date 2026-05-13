"use client";
import * as React from "react";
import { Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import {
  Lock,
  ShieldCheck,
  MapPin,
  EyeOff,
  Cpu,
  FileCheck2,
} from "lucide-react";

const PILLARS = [
  {
    icon: Lock,
    title: "End-to-end encrypted",
    body: "Your household data is encrypted in transit and at rest. We never have access to your raw figures.",
  },
  {
    icon: ShieldCheck,
    title: "You own your data",
    body: "Exportable, portable, and deletable on demand. No retention, no resale, no third-party telemetry.",
  },
  {
    icon: MapPin,
    title: "Built for Australia",
    body: "Negative gearing, Div 293, APRA buffer, super preservation — modelled with FY26 rules from day one.",
  },
  {
    icon: EyeOff,
    title: "No ads, no upsells",
    body: "A subscription product. No data brokering, no affiliate placements, no incentive misalignment.",
  },
  {
    icon: Cpu,
    title: "On-device intelligence",
    body: "AI runs locally where possible. Your numbers never leave the perimeter to train someone else's model.",
  },
  {
    icon: FileCheck2,
    title: "Audited methodology",
    body: "Every forecast, every scenario, every assumption is documented and reproducible. No black boxes.",
  },
];

export function Trust() {
  return (
    <Section spacing="xl" id="trust">
      <Reveal className="max-w-2xl">
        <Eyebrow>Trust by design</Eyebrow>
        <h2 className="mt-5 text-display text-ink-primary text-balance">
          Built with the seriousness your wealth deserves.
        </h2>
        <p className="mt-5 text-lead text-ink-tertiary text-pretty max-w-xl">
          A platform that handles the most personal numbers in your life should
          be held to a higher standard. Six commitments we make on day one.
        </p>
      </Reveal>

      <Stagger className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4" delay={0.04}>
        {PILLARS.map((p) => (
          <StaggerItem key={p.title}>
            <article className="card-surface p-6 h-full hover:border-line-strong transition-colors duration-300">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-bg-inset text-accent-500">
                <p.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-5 text-h4 text-ink-primary">{p.title}</h3>
              <p className="mt-2.5 text-body-sm text-ink-tertiary">{p.body}</p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
