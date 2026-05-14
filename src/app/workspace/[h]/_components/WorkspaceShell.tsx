"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Compass,
  Building2,
  Brain,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  householdId: string;
  householdName: string;
  displayName: string | null;
  email: string | null;
}

const NAV_FACTORY = (h: string) => [
  { href: `/workspace/${h}/overview`,          label: "Overview",   icon: Compass,    index: "[01]" },
  { href: `/workspace/${h}/wealth/properties`, label: "Properties", icon: Building2,  index: "[02]" },
  { href: `/workspace/${h}/decision`,          label: "Decision",   icon: Brain,      index: "[03]", accent: true },
];

/**
 * WorkspaceShell — household-scoped authenticated chrome.
 * Mobile-first: sticky topbar + drawer < md; persistent rail >= md.
 * Visual identity matches the landing + auth pages (paper + ember).
 */
export function WorkspaceShell({
  children,
  householdId,
  householdName,
  displayName,
  email,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const NAV = React.useMemo(() => NAV_FACTORY(householdId), [householdId]);
  const initial = (displayName || email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-bg-base flex flex-col md:flex-row">
      {/* ── Mobile topbar ─────────────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 glass-nav">
        <div className="container mx-auto h-14 flex items-center justify-between">
          <Link
            href={`/workspace/${householdId}/overview`}
            className="flex items-center gap-2.5 focus-ring rounded-md"
          >
            <Logo />
            <span className="inline-flex items-baseline gap-1.5">
              <span className="text-body-sm font-semibold tracking-tight text-ink-primary">
                Family Wealth Lab
              </span>
              <span className="mono text-[0.625rem] text-ember-500 tracking-wider">[FWL]</span>
            </span>
          </Link>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-full text-ink-secondary hover:text-ink-primary hover:bg-bg-inset focus-ring"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-line bg-bg-base/95 backdrop-blur-md">
            <div className="container mx-auto py-4 flex flex-col gap-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group inline-flex items-center gap-3 rounded-2xl px-3.5 h-12 text-body-sm focus-ring transition-colors",
                      active
                        ? "bg-ink-primary text-white"
                        : "text-ink-secondary hover:bg-bg-inset hover:text-ink-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 font-medium">{item.label}</span>
                    <span
                      className={cn(
                        "mono text-[0.625rem] tracking-wider",
                        active ? "text-white/70" : "text-ember-500"
                      )}
                    >
                      {item.index}
                    </span>
                  </Link>
                );
              })}
              <div className="hairline my-3" />
              <Link
                href="/settings/security"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-3 rounded-2xl px-3.5 h-11 text-body-sm text-ink-secondary hover:bg-bg-inset hover:text-ink-primary focus-ring"
              >
                <Settings className="h-4 w-4" />
                <span>Security</span>
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="w-full inline-flex items-center gap-3 rounded-2xl px-3.5 h-11 text-body-sm text-ink-secondary hover:bg-bg-inset hover:text-ink-primary focus-ring"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* ── Desktop rail ─────────────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:border-line md:bg-bg-base/80 md:backdrop-blur-xl">
        <div className="px-6 pt-7 pb-5">
          <Link href={`/workspace/${householdId}/overview`} className="flex items-center gap-2.5 focus-ring rounded-md">
            <Logo />
            <span className="inline-flex items-baseline gap-1.5">
              <span className="text-body-sm font-semibold tracking-tight text-ink-primary">
                Family Wealth Lab
              </span>
              <span className="mono text-[0.625rem] text-ember-500 tracking-wider">[FWL]</span>
            </span>
          </Link>
        </div>

        <div className="px-3 pb-4">
          <div className="card-inset px-3.5 py-3 mx-2">
            <div className="syslabel mb-1">
              <span className="syslabel-bracket">→</span>
              <span>Household</span>
            </div>
            <div className="text-body-sm font-medium text-ink-primary truncate">{householdName}</div>
          </div>
        </div>

        <nav className="px-3 flex-1 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3.5 h-11 text-body-sm focus-ring transition-colors",
                  active
                    ? "bg-ink-primary text-white shadow-sm"
                    : "text-ink-secondary hover:bg-bg-inset hover:text-ink-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 font-medium">{item.label}</span>
                <span
                  className={cn(
                    "mono text-[0.625rem] tracking-wider",
                    active ? "text-white/70" : "text-ember-500"
                  )}
                >
                  {item.index}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-5 mt-auto">
          <Link
            href="/settings/security"
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3.5 h-11 text-body-sm focus-ring text-ink-secondary hover:bg-bg-inset hover:text-ink-primary",
              pathname?.startsWith("/settings") && "bg-bg-inset text-ink-primary"
            )}
          >
            <Settings className="h-4 w-4" />
            <span className="flex-1 font-medium">Security</span>
          </Link>

          <div className="hairline mt-3 pt-3 mx-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-ink-primary text-white inline-flex items-center justify-center text-body-sm font-semibold">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-body-sm font-medium text-ink-primary truncate">
                  {displayName ?? email ?? "Member"}
                </div>
                {email && displayName && (
                  <div className="text-caption text-ink-quaternary truncate">{email}</div>
                )}
              </div>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  aria-label="Sign out"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-full text-ink-quaternary hover:text-ink-primary hover:bg-bg-inset focus-ring"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:pl-64 min-w-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
