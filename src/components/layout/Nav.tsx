"use client";
import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X, Command } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Ticker, type TickerItem } from "@/components/ui/Ticker";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Platform", href: "#command" },
  { label: "Scenarios", href: "#whatif" },
  { label: "Intelligence", href: "#ai" },
  { label: "Mobile", href: "#mobile" },
  { label: "Security", href: "#trust" },
];

const TICKER_ITEMS: TickerItem[] = [
  { code: "ASX200", value: "8,142.55", delta: "+0.42%", positive: true },
  { code: "AUD/USD", value: "0.6648", delta: "−0.18%", positive: false },
  { code: "RBA CASH", value: "4.10%", delta: "HOLD", positive: true },
  { code: "10Y AGB",  value: "4.21%", delta: "+2bp",  positive: false },
  { code: "VAS",     value: "$104.62", delta: "+0.31%", positive: true },
  { code: "VGS",     value: "$129.40", delta: "+0.58%", positive: true },
  { code: "BTC",     value: "$98,420", delta: "+1.84%", positive: true },
  { code: "GOLD",    value: "$2,664",  delta: "−0.22%", positive: false },
  { code: "CPI YoY", value: "3.0%",    delta: "−0.1pp", positive: true },
  { code: "BRIS HPI", value: "925K",   delta: "+1.2%",  positive: true },
];

export function Nav() {
  const [open, setOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const bgAlpha = useTransform(scrollY, [0, 80], [0.55, 0.86]);
  const borderAlpha = useTransform(scrollY, [0, 80], [0.04, 0.12]);
  const blurPx = useTransform(scrollY, [0, 80], [16, 28]);
  const tickerOpacity = useTransform(scrollY, [0, 80], [1, 0.78]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: useTransform(bgAlpha, (a) => `rgba(244, 245, 247, ${a})`),
        backdropFilter: useTransform(blurPx, (b) => `saturate(180%) blur(${b}px)`),
        WebkitBackdropFilter: useTransform(blurPx, (b) => `saturate(180%) blur(${b}px)`),
        borderBottom: "1px solid",
        borderColor: useTransform(borderAlpha, (a) => `rgba(20, 28, 46, ${a})`),
      }}
    >
      {/* Top row — wordmark + nav + CTAs */}
      <div className="container mx-auto flex h-14 items-center justify-between">
        <a href="#top" className="focus-ring rounded-md inline-flex items-center" aria-label="Family Wealth Lab home">
          {/* On mobile we show the mark only; from sm: up we show the full lockup. */}
          <span className="sm:hidden"><Logo size={22} /></span>
          <span className="hidden sm:inline-flex"><Logo withWordmark size={22} /></span>
        </a>

        <nav className="hidden md:flex items-center">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative px-3 py-2 text-[0.8125rem] text-ink-tertiary hover:text-ink-primary transition-colors duration-200 focus-ring rounded-md"
            >
              <span className="mono text-ember-500/70 mr-1.5 text-[0.65rem]">[{String(i + 1).padStart(2, "0")}]</span>
              {l.label}
              <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-ember-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-calm" />
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-2.5 h-8 rounded-full border border-line text-[0.75rem] text-ink-quaternary hover:text-ink-secondary hover:border-line-strong transition-colors focus-ring"
            aria-label="Open command palette"
          >
            <Command className="h-3 w-3" />
            <span className="mono">⌘K</span>
          </button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/signup">Request access</Link>
          </Button>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-secondary hover:text-ink-primary hover:bg-bg-inset focus-ring"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Ticker row — Bloomberg DNA */}
      <motion.div
        style={{ opacity: tickerOpacity }}
        className="hidden sm:block border-t border-line/60"
      >
        <Ticker items={TICKER_ITEMS} />
      </motion.div>

      {/* Mobile sheet */}
      <motion.div
        initial={false}
        animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "md:hidden overflow-hidden border-t border-line",
          "bg-[rgba(244,245,247,0.94)] backdrop-blur-2xl"
        )}
      >
        <div className="container mx-auto py-5 flex flex-col gap-1">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-body text-ink-secondary hover:text-ink-primary"
            >
              <span className="mono text-ember-500/70 mr-2 text-[0.7rem]">[{String(i + 1).padStart(2, "0")}]</span>
              {l.label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            <Button asChild variant="secondary" size="md">
              <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
            </Button>
            <Button asChild variant="primary" size="md">
              <Link href="/signup" onClick={() => setOpen(false)}>Request access</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}
