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
 * NAV groups — mirrors the personal app's Layout.tsx structure, with paths
 * remapped to the commercial `/app/*` route tree.
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
    label: "Strategy",
    sublabel: "Plan the Future",
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
      { href: "/app/decision-engine",     label: "Decision Engine",     icon: Sparkles },
      { href: "/app/market-news",         label: "Market News",         icon: Newspaper },
      { href: "/app/reports",             label: "Reports",             icon: FileText },
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

  const sidebarBody = (
    <nav className="flex flex-col gap-6 px-4 py-6">
      <div>
        <Link
          href="/app/snapshot"
          className="flex items-center gap-2 text-ink-primary font-semibold text-body"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-ember-500" />
          Family Wealth Lab
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <PlanBadge plan={DEFAULT_DEMO_CONTEXT.plan} size="sm" />
          <span className="text-caption text-ink-quaternary mono uppercase tracking-wider">
            Demo mode
          </span>
        </div>
      </div>

      {NAV.map((group) => (
        <div key={group.label}>
          <div className="px-2 mb-2">
            <div className="text-caption mono uppercase tracking-wider text-ink-quaternary">
              {group.label}
            </div>
            <div className="text-[10px] text-ink-quinary">{group.sublabel}</div>
          </div>
          <ul className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 h-9 text-body-sm transition-colors duration-tactile focus-ring ${
                      active
                        ? "bg-ink-primary text-white"
                        : "text-ink-secondary hover:text-ink-primary hover:bg-bg-inset"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="mt-auto pt-4 border-t border-line">
        <ul className="space-y-0.5">
          {SUPPORT.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 h-9 text-body-sm transition-colors duration-tactile focus-ring ${
                    active
                      ? "bg-ink-primary text-white"
                      : "text-ink-secondary hover:text-ink-primary hover:bg-bg-inset"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
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
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-line bg-bg-base sticky top-0 h-screen overflow-y-auto">
        {sidebarBody}
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg-base/95 backdrop-blur px-4 h-14">
        <Link href="/app/snapshot" className="flex items-center gap-2 text-ink-primary font-semibold">
          <span className="inline-block w-2 h-2 rounded-full bg-ember-500" />
          Family Wealth Lab
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-line bg-bg-inset focus-ring"
        >
          <Menu className="h-5 w-5 text-ink-secondary" />
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
          <div className="relative w-72 max-w-[80vw] bg-bg-base border-r border-line h-full overflow-y-auto">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-bg-inset focus-ring"
              >
                <X className="h-5 w-5 text-ink-secondary" />
              </button>
            </div>
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
}
