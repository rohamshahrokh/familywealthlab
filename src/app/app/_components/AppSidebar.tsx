"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  Target,
  TrendingUp,
  HeartPulse,
  Database,
  ClipboardList,
  Home,
  BarChart2,
  Bitcoin,
  CreditCard,
  Calculator,
  Briefcase,
  Sigma,
  Sparkles,
  Newspaper,
  FileText,
  HelpCircle,
  Settings,
  type LucideIcon,
  Menu,
  X,
} from "lucide-react";
import { PlanBadge } from "@/components/commercial/PlanBadge";
import { DEFAULT_DEMO_CONTEXT } from "@/lib/commercial/accessControl";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}
interface NavGroup {
  label: string;
  sublabel: string;
  items: NavItem[];
}

/**
 * NAV groups — Hybrid V2 rhythm.
 * Five sections (SNAPSHOT / PLAN / FORECAST / DECISIONS / SYSTEM) per the
 * approved V2 spec. Every route from the previous structure is preserved;
 * Decision Engine moves out of Forecast into its own DECISIONS group to
 * highlight it as the action surface, and SYSTEM holds Help + Settings
 * inside the same scroll context as the rest of the nav.
 */
const NAV: NavGroup[] = [
  {
    label: "Snapshot",
    sublabel: "Input Today",
    items: [
      { href: "/app/snapshot",            label: "Overview",            icon: LayoutDashboard },
      { href: "/app/income-expenses",     label: "Income & Expenses",   icon: DollarSign },
      { href: "/app/recurring-bills",     label: "Recurring Bills",     icon: Receipt },
      { href: "/app/monthly-budget",      label: "Monthly Budget",      icon: Target },
      { href: "/app/net-worth-timeline",  label: "Net Worth Timeline",  icon: TrendingUp },
      { href: "/app/data-health",         label: "Data Health",         icon: HeartPulse },
      { href: "/app/ledger-audit",        label: "Ledger Audit",        icon: Database },
    ],
  },
  {
    label: "Plan",
    sublabel: "Strategy by Asset",
    items: [
      { href: "/app/my-financial-plan",   label: "My Financial Plan",   icon: ClipboardList },
      { href: "/app/property-plan",       label: "Property Plan",       icon: Home },
      { href: "/app/stocks-plan",         label: "Stocks Plan",         icon: BarChart2 },
      { href: "/app/crypto-plan",         label: "Crypto Plan",         icon: Bitcoin },
      { href: "/app/debt-strategy",       label: "Debt Strategy",       icon: CreditCard },
      { href: "/app/tax-strategy",        label: "Tax Strategy",        icon: Calculator },
      { href: "/app/cgt-simulator",       label: "CGT Simulator",       icon: BarChart2 },
      { href: "/app/wealth-strategy",     label: "Wealth Strategy",     icon: Briefcase },
    ],
  },
  {
    label: "Forecast",
    sublabel: "Model & Project",
    items: [
      { href: "/app/forecast-engine",     label: "Forecast Engine",     icon: Sigma },
      { href: "/app/market-news",         label: "Market News",         icon: Newspaper },
      { href: "/app/reports",             label: "Reports",             icon: FileText },
    ],
  },
  {
    label: "Decisions",
    sublabel: "Act on Signals",
    items: [
      { href: "/app/decision-engine",     label: "Decision Engine",     icon: Sparkles },
    ],
  },
];

const SUPPORT: NavItem[] = [
  { href: "/app/help",     label: "Help",     icon: HelpCircle },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/app/snapshot") return pathname === "/app/snapshot" || pathname === "/app";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // V2 row classes — active = subtle slate wash + sage left rail + strong text.
  // Inactive = muted secondary text on hover-only surface. 120ms precise curve.
  const rowBase =
    "relative flex items-center gap-2.5 rounded-v2-2 pl-3 pr-2.5 h-8 text-[13px] transition-colors duration-v2 ease-v2 focus-ring";
  const rowActive =
    "bg-v2-accent/8 text-v2-text-strong dark:text-v2-text-strong v2-nav-active-rail";
  const rowIdle =
    "text-v2-text-muted hover:text-v2-text-strong hover:bg-v2-surface-2";

  const sidebarBody = (
    <nav className="flex h-full flex-col gap-1 px-3.5 pt-5 pb-4 lg:pt-[22px]">
      <div>
        <Link
          href="/app/snapshot"
          className="flex items-center gap-2.5 px-2.5 pb-[26px] text-[17px] font-medium tracking-tight text-v2-text-strong font-serif"
          style={{ letterSpacing: "-0.012em" }}
        >
          <span
            className="inline-block h-2 w-2 rounded-[2px] bg-v2-warmth"
            style={{ boxShadow: "0 0 0 3px hsl(var(--v2-warmth) / 0.10)" }}
          />
          Family Wealth Lab
        </Link>
        <div className="flex items-center gap-2 px-2.5 pb-1">
          <PlanBadge plan={DEFAULT_DEMO_CONTEXT.plan} size="sm" />
          <span className="text-[10px] uppercase tracking-[0.11em] text-v2-text-faint font-medium">
            Demo mode
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-1">
        {NAV.map((group, idx) => (
          <div key={group.label}>
            <div
              className={`px-2.5 ${idx === 0 ? "pt-1" : "pt-[18px]"} pb-1.5`}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.11em] text-v2-text-faint">
                {group.label}
              </div>
              <div className="text-[10px] text-v2-text-faint/70 mt-0.5">{group.sublabel}</div>
            </div>
            <ul className="flex flex-col gap-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`${rowBase} ${active ? rowActive : rowIdle}`}
                    >
                      <Icon className="h-[15px] w-[15px] shrink-0 opacity-90" strokeWidth={1.75} />
                      <span className="truncate">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-border">
        <div className="px-2.5 pb-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.11em] text-v2-text-faint">
            System
          </div>
        </div>
        <ul className="flex flex-col gap-0.5">
          {SUPPORT.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`${rowBase} ${active ? rowActive : rowIdle}`}
                >
                  <Icon className="h-[15px] w-[15px] shrink-0 opacity-90" strokeWidth={1.75} />
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar — 248px V2 chrome on surface-0 */}
      <aside className="hidden lg:flex flex-col w-[248px] shrink-0 border-r border-border bg-v2-surface-0 sticky top-0 h-screen overflow-y-auto">
        {sidebarBody}
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border bg-v2-surface-0/95 backdrop-blur px-4 h-14">
        <Link
          href="/app/snapshot"
          className="flex items-center gap-2 text-v2-text-strong font-medium text-[15px] font-serif"
          style={{ letterSpacing: "-0.012em" }}
        >
          <span
            className="inline-block h-2 w-2 rounded-[2px] bg-v2-warmth"
            style={{ boxShadow: "0 0 0 3px hsl(var(--v2-warmth) / 0.10)" }}
          />
          Family Wealth Lab
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="inline-flex items-center justify-center h-9 w-9 rounded-v2-2 border border-border bg-v2-surface-1 text-v2-text-muted hover:text-v2-text-strong focus-ring transition-colors duration-v2"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="relative w-[288px] max-w-[80vw] bg-v2-surface-0 border-r border-border h-full overflow-y-auto">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex items-center justify-center h-9 w-9 rounded-v2-2 hover:bg-v2-surface-2 text-v2-text-muted hover:text-v2-text-strong focus-ring transition-colors duration-v2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
}
