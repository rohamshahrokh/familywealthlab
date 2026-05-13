"use client";
import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="relative pt-28 pb-36 sm:pt-36 sm:pb-44 overflow-hidden">
      <div className="absolute inset-0 spotlight pointer-events-none" aria-hidden />
      <div className="absolute inset-0 grid-faint mask-fade-y opacity-50 pointer-events-none" aria-hidden />

      <div className="container mx-auto relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="chip text-ink-tertiary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            Private preview · invite-only
          </span>

          <h2 className="mt-7 text-display-lg text-ink-primary text-balance">
            Decide with confidence.
          </h2>
          <p className="mt-6 text-lead text-ink-tertiary max-w-2xl mx-auto text-pretty">
            Join the families building the next decade of their financial life on
            the wealth operating system designed for clarity, decisions, and
            long-term compounding.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button size="xl" variant="primary">
              Request access
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="xl" variant="secondary">
              See the platform
            </Button>
          </div>

          <p className="mt-10 text-caption text-ink-quaternary">
            Brisbane, Australia · Modelling only — not personal financial advice.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
