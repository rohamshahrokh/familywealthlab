"use client";
import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Platform", href: "#command" },
  { label: "Scenarios", href: "#whatif" },
  { label: "Intelligence", href: "#ai" },
  { label: "Mobile", href: "#mobile" },
  { label: "Security", href: "#trust" },
];

export function Nav() {
  const [open, setOpen] = React.useState(false);
  const { scrollY } = useScroll();
  // Frosted glass that intensifies as user scrolls — macOS Big Sur feel.
  const bgAlpha = useTransform(scrollY, [0, 80], [0.4, 0.82]);
  const borderAlpha = useTransform(scrollY, [0, 80], [0, 0.10]);
  const blurPx = useTransform(scrollY, [0, 80], [12, 24]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: useTransform(bgAlpha, (a) => `rgba(245, 245, 247, ${a})`),
        backdropFilter: useTransform(blurPx, (b) => `saturate(180%) blur(${b}px)`),
        WebkitBackdropFilter: useTransform(blurPx, (b) => `saturate(180%) blur(${b}px)`),
        borderBottom: "1px solid",
        borderColor: useTransform(borderAlpha, (a) => `rgba(60, 60, 67, ${a})`),
      }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between">
        <a href="#top" className="focus-ring rounded-md" aria-label="Family Wealth Lab home">
          <Logo withWordmark />
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-body-sm text-ink-tertiary hover:text-ink-primary transition-colors duration-200 focus-ring rounded-md"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm">Sign in</Button>
          <Button variant="primary" size="sm">Request access</Button>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-secondary hover:text-ink-primary hover:bg-bg-inset focus-ring"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sheet */}
      <motion.div
        initial={false}
        animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "md:hidden overflow-hidden border-t border-line",
          "bg-[rgba(245,245,247,0.92)] backdrop-blur-2xl"
        )}
      >
        <div className="container mx-auto py-5 flex flex-col gap-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-body text-ink-secondary hover:text-ink-primary"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="secondary" size="md">Sign in</Button>
            <Button variant="primary" size="md">Request access</Button>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}
