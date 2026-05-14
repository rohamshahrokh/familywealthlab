"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, ShieldCheck, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, index: "[01]" },
  { href: "/settings/security", label: "Security", icon: ShieldCheck, index: "[02]" },
];

interface Props {
  children: React.ReactNode;
  displayName: string | null;
  email: string | null;
}

/**
 * Authenticated app shell — brand-matched paper bg with a desktop sidebar
 * and a mobile drawer. Sign-out posts a real form to /auth/signout so the
 * server action logs the audit entry.
 */
export function AppShell({ children, displayName, email }: Props) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-bg-base/95 border-b border-line">
        <div className="container mx-auto h-14 flex items-center justify-between">
          <Link href="/dashboard" className="focus-ring rounded-md">
            <Logo withWordmark size={22} />
          </Link>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-full text-ink-secondary hover:text-ink-primary hover:bg-bg-inset focus-ring"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-line bg-bg-base/95">
            <div className="container mx-auto py-4 flex flex-col gap-1">
              {NAV.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 py-3 px-3 rounded-xl text-body",
                      active
                        ? "bg-bg-inset text-ink-primary"
                        : "text-ink-secondary hover:text-ink-primary hover:bg-bg-inset"
                    )}
                  >
                    <span className="mono text-ember-500/80 text-[0.65rem]">{item.index}</span>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <SignOutButton />
            </div>
          </div>
        )}
      </header>

      {/* Desktop layout */}
      <div className="md:flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:border-r md:border-line md:bg-white">
          <div className="px-5 py-6 border-b border-line">
            <Link href="/dashboard" className="focus-ring rounded-md">
              <Logo withWordmark size={22} />
            </Link>
          </div>
          <nav className="flex-1 px-3 py-5 space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm transition-colors",
                    active
                      ? "bg-bg-inset text-ink-primary"
                      : "text-ink-secondary hover:text-ink-primary hover:bg-bg-inset"
                  )}
                >
                  <span className="mono text-ember-500/80 text-[0.625rem] tracking-wider">
                    {item.index}
                  </span>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-3 py-4 border-t border-line">
            <div className="px-3 pb-3">
              <div className="text-body-sm font-medium text-ink-primary truncate">
                {displayName || "Member"}
              </div>
              <div className="text-caption text-ink-quaternary truncate">{email}</div>
            </div>
            <SignOutButton />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 md:ml-64">
          <div className="container mx-auto py-8 sm:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm",
          "text-ink-secondary hover:text-ink-primary hover:bg-bg-inset transition-colors focus-ring"
        )}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </form>
  );
}
