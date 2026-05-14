"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Compass,
  Wallet,
  Building2,
  CreditCard,
  ShieldCheck,
  Target,
  LineChart,
  Brain,
  Sliders,
  Settings,
  LogOut,
  ChevronDown,
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

type NavLeaf = {
  href: string;
  label: string;
  index: string;
  status?: "live" | "soon";
};

type NavGroup = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  items: NavLeaf[];
};

const GROUPS = (h: string): NavGroup[] => [
  {
    key: "snapshot",
    label: "Snapshot",
    icon: Compass,
    defaultOpen: true,
    items: [
      { href: `/workspace/${h}/overview`, label: "Command Centre", index: "[01·01]", status: "live" },
    ],
  },
  {
    key: "input",
    label: "Input Today",
    icon: Wallet,
    items: [
      { href: `/workspace/${h}/wealth/cash`,        label: "Cash accounts", index: "[02·01]", status: "live" },
      { href: `/workspace/${h}/wealth/properties`,  label: "Properties",    index: "[02·02]", status: "live" },
      { href: `/workspace/${h}/wealth/liabilities`, label: "Liabilities",   index: "[02·03]", status: "live" },
      { href: `/workspace/${h}/wealth/super`,       label: "Superannuation",index: "[02·04]", status: "live" },
      { href: `/workspace/${h}/input/income`,       label: "Income",        index: "[02·05]", status: "live" },
      { href: `/workspace/${h}/input/expenses`,     label: "Expenses",      index: "[02·06]", status: "live" },
      { href: `/workspace/${h}/input/stocks`,       label: "Stocks",        index: "[02·07]", status: "live" },
      { href: `/workspace/${h}/input/crypto`,       label: "Crypto",        index: "[02·08]", status: "live" },
    ],
  },
  {
    key: "strategy",
    label: "Strategy",
    icon: Target,
    items: [
      { href: `/workspace/${h}/strategy/plan`,     label: "Financial plan", index: "[03·01]", status: "live" },
      { href: `/workspace/${h}/strategy/property`, label: "Property plan",  index: "[03·02]", status: "live" },
      { href: `/workspace/${h}/strategy/debt`,     label: "Debt strategy",  index: "[03·03]", status: "live" },
      { href: `/workspace/${h}/strategy/tax`,      label: "Tax strategy",   index: "[03·04]", status: "live" },
      { href: `/workspace/${h}/strategy/cgt`,      label: "CGT simulator",  index: "[03·05]", status: "live" },
    ],
  },
  {
    key: "forecast",
    label: "Forecast",
    icon: LineChart,
    items: [
      { href: `/workspace/${h}/forecast/baseline`, label: "Baseline forecast", index: "[04·01]", status: "live" },
      { href: `/workspace/${h}/forecast/fire`,     label: "FIRE projection",   index: "[04·02]", status: "live" },
      { href: `/workspace/${h}/forecast/montecarlo`, label: "Monte Carlo",     index: "[04·03]", status: "live" },
    ],
  },
  {
    key: "action",
    label: "Action",
    icon: Brain,
    items: [
      { href: `/workspace/${h}/decision`, label: "Decision Engine", index: "[05·01]", status: "live" },
      { href: `/workspace/${h}/action/whatif`,  label: "What-If",   index: "[05·02]", status: "live" },
      { href: `/workspace/${h}/action/compare`, label: "Scenario compare", index: "[05·03]", status: "live" },
    ],
  },
  {
    key: "settings",
    label: "Support · Settings",
    icon: Sliders,
    items: [
      { href: `/workspace/${h}/settings/assumptions`, label: "Assumptions centre", index: "[06·01]", status: "live" },
      { href: `/settings/security`,                   label: "Security",           index: "[06·02]", status: "live" },
      { href: `/settings/billing`,                    label: "Billing",            index: "[06·03]", status: "live" },
    ],
  },
];

/**
 * WorkspaceShell — household-scoped chrome with a grouped, collapsible sidebar.
 * Mobile-first; sidebar collapses to a sheet < md and groups are collapsed by
 * default except Snapshot. "Soon" entries are visible but disabled, so users
 * see the full IA without dead clicks.
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
  const groups = React.useMemo(() => GROUPS(householdId), [householdId]);
  const initial = (displayName || email || "?").trim().charAt(0).toUpperCase();

  const isActiveLeaf = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  const groupHasActive = (group: NavGroup) =>
    group.items.some((leaf) => isActiveLeaf(leaf.href));

  return (
    <div className="min-h-screen bg-bg-base flex flex-col md:flex-row">
      {/* ── Mobile topbar ─────────────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 glass-nav">
        <div className="container mx-auto h-14 flex items-center justify-between">
          <Link href={`/workspace/${householdId}/overview`} className="flex items-center gap-2.5 focus-ring rounded-md">
            <Logo />
            <span className="inline-flex items-baseline gap-1.5">
              <span className="text-body-sm font-semibold tracking-tight text-ink-primary">Family Wealth Lab</span>
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
          <div className="border-t border-line bg-bg-base/95 backdrop-blur-md max-h-[80vh] overflow-y-auto">
            <div className="container mx-auto py-4 flex flex-col gap-1">
              <SidebarNav groups={groups} isActiveLeaf={isActiveLeaf} groupHasActive={groupHasActive} onNavigate={() => setOpen(false)} />
              <div className="hairline my-3" />
              <form action="/auth/signout" method="post">
                <button type="submit"
                  className="w-full inline-flex items-center gap-3 rounded-2xl px-3.5 h-11 text-body-sm text-ink-secondary hover:bg-bg-inset hover:text-ink-primary focus-ring">
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
              <span className="text-body-sm font-semibold tracking-tight text-ink-primary">Family Wealth Lab</span>
              <span className="mono text-[0.625rem] text-ember-500 tracking-wider">[FWL]</span>
            </span>
          </Link>
        </div>

        <div className="px-3 pb-4">
          <div className="card-inset px-3.5 py-3 mx-2">
            <div className="syslabel mb-1"><span className="syslabel-bracket">→</span><span>Household</span></div>
            <div className="text-body-sm font-medium text-ink-primary truncate">{householdName}</div>
          </div>
        </div>

        <nav className="px-3 flex-1 space-y-1 overflow-y-auto">
          <SidebarNav groups={groups} isActiveLeaf={isActiveLeaf} groupHasActive={groupHasActive} />
        </nav>

        <div className="px-3 pb-5 mt-auto">
          <div className="hairline pt-3 mx-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-ink-primary text-white inline-flex items-center justify-center text-body-sm font-semibold">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-body-sm font-medium text-ink-primary truncate">{displayName ?? email ?? "Member"}</div>
                {email && displayName && (<div className="text-caption text-ink-quaternary truncate">{email}</div>)}
              </div>
              <form action="/auth/signout" method="post">
                <button type="submit" aria-label="Sign out"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-full text-ink-quaternary hover:text-ink-primary hover:bg-bg-inset focus-ring">
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

// ── Sidebar nav (shared mobile + desktop) ────────────────────────────────────
function SidebarNav({
  groups, isActiveLeaf, groupHasActive, onNavigate,
}: {
  groups: NavGroup[];
  isActiveLeaf: (href: string) => boolean;
  groupHasActive: (group: NavGroup) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {groups.map((group) => (
        <SidebarGroup
          key={group.key}
          group={group}
          forceOpen={groupHasActive(group)}
          isActiveLeaf={isActiveLeaf}
          onNavigate={onNavigate}
        />
      ))}
    </>
  );
}

function SidebarGroup({
  group, forceOpen, isActiveLeaf, onNavigate,
}: {
  group: NavGroup;
  forceOpen: boolean;
  isActiveLeaf: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = React.useState(group.defaultOpen ?? false);
  React.useEffect(() => { if (forceOpen) setOpen(true); }, [forceOpen]);
  const Icon = group.icon;

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "w-full flex items-center gap-3 rounded-2xl px-3.5 h-11 text-body-sm font-medium focus-ring transition-colors",
          forceOpen ? "text-ink-primary" : "text-ink-secondary hover:bg-bg-inset hover:text-ink-primary",
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 ml-2 pl-3 border-l border-line space-y-0.5">
          {group.items.map((leaf) => {
            const active = isActiveLeaf(leaf.href);
            const disabled = leaf.status === "soon";
            const baseCls = cn(
              "group flex items-center gap-3 rounded-xl px-3 h-9 text-body-sm focus-ring transition-colors",
              active
                ? "bg-ink-primary text-white"
                : disabled
                  ? "text-ink-quaternary cursor-not-allowed"
                  : "text-ink-secondary hover:bg-bg-inset hover:text-ink-primary",
            );
            const inner = (
              <>
                <span className="flex-1 truncate">{leaf.label}</span>
                {leaf.status === "soon" && (
                  <span className="text-[0.625rem] mono uppercase tracking-wider text-ink-quaternary">soon</span>
                )}
                <span className={cn(
                  "mono text-[0.625rem] tracking-wider",
                  active ? "text-white/70" : "text-ember-500",
                )}>
                  {leaf.index}
                </span>
              </>
            );
            return disabled ? (
              <div key={leaf.href} aria-disabled="true" className={baseCls}>{inner}</div>
            ) : (
              <Link key={leaf.href} href={leaf.href} onClick={onNavigate} className={baseCls}>
                {inner}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
