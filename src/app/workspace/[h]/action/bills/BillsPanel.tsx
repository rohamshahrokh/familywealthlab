"use client";

import * as React from "react";
import { SurfaceCard, CardHeader } from "@/components/workspace/cards";
import { MetricCard } from "@/components/workspace/charts-interactive";
import { Field, inputCls } from "@/components/workspace/forms/Field";
import { fmtMoney, fmtMoneyCompact } from "@/components/workspace/format";
import type { DemoBill } from "@/lib/finance/demoData";

interface Props {
  initial: DemoBill[];
}

type TabKey = "bills" | "cycles" | "notifications" | "digest";

const TABS: { key: TabKey; label: string }[] = [
  { key: "bills",         label: "Bills" },
  { key: "cycles",        label: "Payment Cycles" },
  { key: "notifications", label: "Notification Log" },
  { key: "digest",        label: "Daily Digest" },
];

const TOGGLE_GROUP =
  "inline-flex flex-wrap rounded-xl border border-line bg-bg-inset p-1 text-caption mono uppercase tracking-wider";
const TOGGLE = (active: boolean) =>
  `px-3 h-8 inline-flex items-center rounded-lg transition-colors duration-tactile ${
    active ? "bg-ink-primary text-white" : "text-ink-tertiary hover:text-ink-primary hover:bg-bg-base/60"
  }`;

// Convert a bill into its monthly-equivalent dollar amount
function monthlyEquivalent(b: DemoBill): number {
  switch (b.frequency) {
    case "weekly":      return b.amount * 52 / 12;
    case "fortnightly": return b.amount * 26 / 12;
    case "monthly":     return b.amount;
    case "quarterly":   return b.amount / 3;
    case "annual":      return b.amount / 12;
  }
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const t = new Date(iso); t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const STATUS_STYLE: Record<DemoBill["status"], string> = {
  current:  "bg-bg-inset text-ink-tertiary border-line",
  due_soon: "bg-ember-500/10 text-ember-600 border-ember-500/30",
  overdue:  "bg-rose-600/10 text-rose-700 border-rose-600/30",
  paid:     "bg-emerald-600/10 text-emerald-700 border-emerald-600/30",
};

const STATUS_LABEL: Record<DemoBill["status"], string> = {
  current: "Current", due_soon: "Due soon", overdue: "Overdue", paid: "Paid",
};

export function BillsPanel({ initial }: Props) {
  const [tab, setTab] = React.useState<TabKey>("bills");
  const [bills, setBills] = React.useState<DemoBill[]>(initial);
  const [showAdd, setShowAdd] = React.useState(false);

  // Aggregate KPIs
  const kpis = React.useMemo(() => {
    const monthly = bills.reduce((s, b) => s + monthlyEquivalent(b), 0);
    const annual  = monthly * 12;
    const overdue = bills
      .filter((b) => b.status === "overdue")
      .reduce((s, b) => s + b.amount, 0);
    const dueWeek = bills
      .filter((b) => {
        const d = daysUntil(b.nextDue);
        return d >= 0 && d <= 7;
      })
      .reduce((s, b) => s + b.amount, 0);
    const paidMonth = bills
      .filter((b) => b.status === "paid")
      .reduce((s, b) => s + b.amount, 0);
    return { monthly, annual, overdue, dueWeek, paidMonth };
  }, [bills]);

  function addBill(b: DemoBill) {
    setBills((prev) => [...prev, b]);
    setShowAdd(false);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* KPI grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard index="01" label="Monthly Equivalent" value={kpis.monthly}   format="moneyCompact" />
        <MetricCard index="02" label="Due This Week"      value={kpis.dueWeek}   format="moneyCompact" tone={kpis.dueWeek > 0 ? "warning" : "neutral"} />
        <MetricCard index="03" label="Overdue"            value={kpis.overdue}   format="moneyCompact" tone={kpis.overdue > 0 ? "negative" : "neutral"} />
        <MetricCard index="04" label="Paid This Month"    value={kpis.paidMonth} format="moneyCompact" tone="positive" />
        <MetricCard index="05" label="Annual Total"       value={kpis.annual}    format="moneyCompact" />
      </section>

      {/* Tabs + add button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="overflow-x-auto -mx-1 px-1">
          <div className={TOGGLE_GROUP}>
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={TOGGLE(tab === t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-4 h-9 text-body-sm font-medium hover:bg-graphite-800 focus-ring"
        >
          {showAdd ? "Cancel" : "+ Add bill"}
        </button>
      </div>

      {showAdd && <AddBillForm onAdd={addBill} onCancel={() => setShowAdd(false)} />}

      {tab === "bills" && <BillsTable bills={bills} />}
      {tab === "cycles" && <PaymentCycles bills={bills} />}
      {tab === "notifications" && <NotificationLog bills={bills} />}
      {tab === "digest" && <DailyDigest bills={bills} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bills table

function BillsTable({ bills }: { bills: DemoBill[] }) {
  return (
    <SurfaceCard>
      <CardHeader index="[A]" eyebrow="All bills" title={`${bills.length} active`} />
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-body-sm">
          <thead>
            <tr className="text-caption mono uppercase tracking-wider text-ink-quaternary">
              <th className="text-left py-2 pr-3 font-medium">Bill</th>
              <th className="text-left py-2 px-3 font-medium">Member</th>
              <th className="text-left py-2 px-3 font-medium">Category</th>
              <th className="text-left py-2 px-3 font-medium">Freq.</th>
              <th className="text-right py-2 px-3 font-medium">Amount</th>
              <th className="text-right py-2 px-3 font-medium">/ month</th>
              <th className="text-left py-2 px-3 font-medium">Next due</th>
              <th className="text-left py-2 pl-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b) => {
              const due = daysUntil(b.nextDue);
              return (
                <tr key={b.id} className="border-t border-line">
                  <td className="py-2.5 pr-3">
                    <div className="font-medium text-ink-primary">{b.name}</div>
                    {b.essential && (
                      <div className="text-caption text-ember-600 mono uppercase tracking-wider">Essential</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-ink-secondary">{b.member}</td>
                  <td className="py-2.5 px-3 text-ink-secondary">{b.category}</td>
                  <td className="py-2.5 px-3 text-ink-tertiary capitalize">{b.frequency}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-ink-primary">{fmtMoney(b.amount, 2)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-ink-tertiary">
                    {fmtMoney(monthlyEquivalent(b), 2)}
                  </td>
                  <td className="py-2.5 px-3 text-ink-secondary">
                    <div>{b.nextDue}</div>
                    <div className="text-caption text-ink-quaternary">
                      {due < 0 ? `${-due}d ago` : due === 0 ? "today" : `in ${due}d`}
                    </div>
                  </td>
                  <td className="py-2.5 pl-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-caption mono uppercase tracking-wider ${STATUS_STYLE[b.status]}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment cycles

function PaymentCycles({ bills }: { bills: DemoBill[] }) {
  const groups = ["weekly", "fortnightly", "monthly", "quarterly", "annual"] as const;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((freq) => {
        const matches = bills.filter((b) => b.frequency === freq);
        const total = matches.reduce((s, b) => s + b.amount, 0);
        return (
          <SurfaceCard key={freq}>
            <CardHeader index="·" eyebrow={freq} title={`${matches.length} bills`} />
            <div className="num text-h5 text-ink-primary tabular-nums">{fmtMoneyCompact(total)}</div>
            <p className="text-caption text-ink-tertiary mt-1">per {freq.replace(/ly$/, "")}</p>
            <ul className="mt-4 space-y-1.5 text-body-sm">
              {matches.map((b) => (
                <li key={b.id} className="flex justify-between border-t border-line pt-1.5 first:border-t-0 first:pt-0">
                  <span className="text-ink-secondary truncate pr-2">{b.name}</span>
                  <span className="tabular-nums text-ink-primary">{fmtMoney(b.amount, 2)}</span>
                </li>
              ))}
              {matches.length === 0 && <li className="text-ink-quaternary">No bills.</li>}
            </ul>
          </SurfaceCard>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification log

function NotificationLog({ bills }: { bills: DemoBill[] }) {
  // Generate a synthetic activity feed from bill state
  const events = bills.flatMap((b) => {
    const due = daysUntil(b.nextDue);
    const log: { id: string; when: string; title: string; sub: string; tone: string }[] = [];
    if (b.status === "overdue") {
      log.push({
        id: `${b.id}-overdue`,
        when: `${-due}d ago`,
        title: `Overdue: ${b.name}`,
        sub: `${fmtMoney(b.amount, 2)} · ${b.member}`,
        tone: "rose",
      });
    } else if (b.status === "due_soon") {
      log.push({
        id: `${b.id}-soon`,
        when: due === 0 ? "today" : `in ${due}d`,
        title: `Reminder: ${b.name}`,
        sub: `${fmtMoney(b.amount, 2)} · ${b.member}`,
        tone: "ember",
      });
    }
    return log;
  });

  return (
    <SurfaceCard>
      <CardHeader index="[N]" eyebrow="Notifications" title="Last 7 days" />
      {events.length === 0 ? (
        <p className="text-body text-ink-tertiary">No notifications in the last 7 days.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-3 border-t border-line pt-3 first:border-t-0 first:pt-0">
              <div>
                <div className="text-body-sm text-ink-primary">{e.title}</div>
                <div className="text-caption text-ink-tertiary">{e.sub}</div>
              </div>
              <span
                className={`shrink-0 text-caption mono uppercase tracking-wider ${
                  e.tone === "rose" ? "text-rose-700" : "text-ember-600"
                }`}
              >
                {e.when}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily digest

function DailyDigest({ bills }: { bills: DemoBill[] }) {
  const upcoming = bills
    .map((b) => ({ b, days: daysUntil(b.nextDue) }))
    .filter((x) => x.days >= 0 && x.days <= 14)
    .sort((a, b) => a.days - b.days);
  const total = upcoming.reduce((s, x) => s + x.b.amount, 0);

  return (
    <SurfaceCard>
      <CardHeader index="[D]" eyebrow="Digest" title="Next 14 days" />
      <div className="flex items-baseline justify-between mb-4">
        <div className="num text-h5 text-ink-primary tabular-nums">{fmtMoney(total)}</div>
        <span className="text-caption text-ink-tertiary">{upcoming.length} bills</span>
      </div>
      <ul className="space-y-2 text-body-sm">
        {upcoming.map((x) => (
          <li key={x.b.id} className="flex items-center justify-between border-t border-line pt-2 first:border-t-0 first:pt-0">
            <div>
              <span className="text-ink-primary font-medium">{x.b.name}</span>
              <span className="text-caption text-ink-tertiary ml-2">
                {x.days === 0 ? "today" : `in ${x.days}d`}
              </span>
            </div>
            <span className="tabular-nums text-ink-primary">{fmtMoney(x.b.amount, 2)}</span>
          </li>
        ))}
        {upcoming.length === 0 && <li className="text-ink-tertiary">No upcoming bills.</li>}
      </ul>
    </SurfaceCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add bill form

function AddBillForm({
  onAdd,
  onCancel,
}: {
  onAdd: (b: DemoBill) => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("Utilities");
  const [amount, setAmount] = React.useState(0);
  const [frequency, setFrequency] = React.useState<DemoBill["frequency"]>("monthly");
  const [nextDue, setNextDue] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [member, setMember] = React.useState("Joint");
  const [priority, setPriority] = React.useState<DemoBill["priority"]>("medium");
  const [essential, setEssential] = React.useState(false);
  const [autoRenew, setAutoRenew] = React.useState(true);
  const [autoMatch, setAutoMatch] = React.useState(true);
  const [remindBeforeDays, setRemindBeforeDays] = React.useState(3);
  const [remindOnDue, setRemindOnDue] = React.useState(true);
  const [remindOverdue, setRemindOverdue] = React.useState(true);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onAdd({
      id: `b${Date.now()}`,
      name: name.trim() || "Untitled bill",
      category,
      amount,
      frequency,
      nextDue,
      startDate: nextDue,
      remindBeforeDays,
      remindOnDue,
      remindOverdue,
      member,
      priority,
      essential,
      autoRenew,
      autoMatch,
      status: "current",
    });
  }

  return (
    <SurfaceCard>
      <CardHeader index="[+]" eyebrow="Add bill" title="New recurring bill" />
      <form onSubmit={submit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Bill name">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electricity — Origin" />
        </Field>
        <Field label="Category">
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            {["Housing", "Utilities", "Insurance", "Subscriptions", "Transport", "Family", "Other"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Amount ($)">
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputCls}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </Field>
        <Field label="Frequency">
          <select className={inputCls} value={frequency} onChange={(e) => setFrequency(e.target.value as DemoBill["frequency"])}>
            {(["weekly", "fortnightly", "monthly", "quarterly", "annual"] as const).map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field label="Next due">
          <input type="date" className={inputCls} value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
        </Field>
        <Field label="Member">
          <select className={inputCls} value={member} onChange={(e) => setMember(e.target.value)}>
            {["Joint", "Roham", "Partner"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value as DemoBill["priority"])}>
            {(["low", "medium", "high"] as const).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Remind before (days)">
          <input
            type="number"
            min={0}
            max={30}
            className={inputCls}
            value={remindBeforeDays}
            onChange={(e) => setRemindBeforeDays(Number(e.target.value))}
          />
        </Field>
        <div className="flex flex-col gap-2 text-body-sm pt-6">
          <label className="inline-flex items-center gap-2 text-ink-secondary">
            <input type="checkbox" checked={essential} onChange={(e) => setEssential(e.target.checked)} />
            Essential
          </label>
          <label className="inline-flex items-center gap-2 text-ink-secondary">
            <input type="checkbox" checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)} />
            Auto-renew
          </label>
          <label className="inline-flex items-center gap-2 text-ink-secondary">
            <input type="checkbox" checked={autoMatch} onChange={(e) => setAutoMatch(e.target.checked)} />
            Auto-match transactions
          </label>
        </div>
        <div className="flex flex-col gap-2 text-body-sm pt-6">
          <label className="inline-flex items-center gap-2 text-ink-secondary">
            <input type="checkbox" checked={remindOnDue} onChange={(e) => setRemindOnDue(e.target.checked)} />
            Remind on due date
          </label>
          <label className="inline-flex items-center gap-2 text-ink-secondary">
            <input type="checkbox" checked={remindOverdue} onChange={(e) => setRemindOverdue(e.target.checked)} />
            Remind when overdue
          </label>
        </div>

        <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-5 h-10 text-body-sm font-medium hover:bg-graphite-800 focus-ring"
          >
            Add bill
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-inset px-5 h-10 text-body-sm text-ink-secondary hover:text-ink-primary hover:bg-bg-base focus-ring"
          >
            Cancel
          </button>
        </div>
      </form>
    </SurfaceCard>
  );
}
