"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Engine", href: "#command-center" },
  { label: "What-If", href: "#what-if" },
  { label: "AI Insights", href: "#ai-insights" },
  { label: "Mobile", href: "#mobile" },
  { label: "Trust", href: "#trust" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.85]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-cinematic",
          scrolled ? "border-b border-white/[0.06]" : ""
        )}
        style={{
          backgroundColor: scrolled
            ? `rgba(7, 11, 20, ${bgOpacity.get()})`
            : "transparent",
          backdropFilter: scrolled ? "blur(16px) saturate(140%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px) saturate(140%)" : "none",
        }}
      >
        <div className="container-narrow flex h-16 items-center justify-between sm:h-[72px]">
          <a href="#top" className="z-50 -ml-1 rounded-md px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
            <Logo />
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-[13px] font-medium text-ink-300 transition-colors duration-300 hover:text-ink-50"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <a href="#cta">Sign in</a>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <a href="#cta">Start free</a>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="z-50 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-100 ring-1 ring-inset ring-white/10 hover:bg-white/[0.05] md:hidden"
          >
            {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile sheet */}
      <motion.div
        initial={false}
        animate={open ? "open" : "closed"}
        variants={{
          open: { opacity: 1, pointerEvents: "auto" },
          closed: { opacity: 0, pointerEvents: "none" },
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-40 md:hidden"
      >
        <div className="absolute inset-0 bg-bg-base/95 backdrop-blur-xl" />
        <nav className="relative flex h-full flex-col items-start justify-center gap-2 px-8" aria-label="Mobile">
          {NAV_LINKS.map((l, i) => (
            <motion.a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.05 * i + 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="py-2 font-display text-3xl font-semibold tracking-tight text-ink-50"
            >
              {l.label}
            </motion.a>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-6 flex w-full flex-col gap-3"
          >
            <Button variant="primary" size="lg" asChild>
              <a href="#cta" onClick={() => setOpen(false)}>Start free</a>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <a href="#cta" onClick={() => setOpen(false)}>Watch demo</a>
            </Button>
          </motion.div>
        </nav>
      </motion.div>
    </>
  );
}
