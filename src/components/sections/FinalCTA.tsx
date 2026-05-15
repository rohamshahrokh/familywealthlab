"use client";
import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/cta-button";
import { Magnetic } from "@/components/ui/MagneticButton";
import { AmbientMesh, Spotlight, EmberGlow } from "@/components/ui/AmbientMesh";
import { SystemLabel } from "@/components/ui/Section";

export function FinalCTA() {
  return (
    <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-40 overflow-hidden isolate">
      <AmbientMesh />
      <Spotlight />
      <EmberGlow />
      <div className="absolute inset-0 grid-fine mask-fade-y opacity-[0.3] pointer-events-none -z-10" aria-hidden />

      <div className="container mx-auto relative">
        <Reveal className="mx-auto max-w-3xl text-center" mode="blurUp">
          <div className="inline-flex items-center justify-center">
            <SystemLabel index="11" label="ACCESS · PRIVATE PREVIEW" />
          </div>

          <h2 className="mt-6 text-display-lg text-ink-primary text-balance tracking-tightest">
            Decide with <span className="text-ember-500 relative inline-block">
              confidence
              <span aria-hidden className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-ember-500/0 via-ember-500 to-ember-500/0" />
            </span>.
          </h2>
          <p className="mt-6 text-lead text-ink-tertiary max-w-2xl mx-auto text-pretty">
            Join the families building the next decade of their financial life on
            the wealth operating system designed for clarity, decisions, and
            long-term compounding.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Magnetic strength={0.32}>
              <Button size="xl" variant="ember">
                Request access
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Magnetic>
            <Button size="xl" variant="secondary">
              See the platform
            </Button>
          </div>

          <p className="mt-10 text-caption text-ink-quaternary mono uppercase tracking-wider">
            Brisbane · AU · Modelling only — not personal financial advice.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
