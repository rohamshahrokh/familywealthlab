import * as React from "react";
import { Logo } from "@/components/brand/Logo";

const SECTIONS = [
  {
    label: "Platform",
    links: [
      { label: "Net Worth Engine", href: "#command" },
      { label: "What-If Scenarios", href: "#whatif" },
      { label: "AI Insights", href: "#ai" },
      { label: "Mobile", href: "#mobile" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Method", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Research", href: "#" },
      { label: "Help center", href: "#" },
      { label: "Status", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    label: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Disclosures", href: "#" },
      { label: "Security", href: "#trust" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg-inset">
      <div className="container mx-auto py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2 max-w-sm">
            <Logo withWordmark size={24} />
            <p className="mt-5 text-body-sm text-ink-tertiary leading-relaxed">
              The wealth operating system for Australian households —
              forecasting, scenarios, and decision intelligence in one calm interface.
            </p>
            <p className="mt-6 text-caption text-ink-quaternary">
              Brisbane, Australia · Modelling only — not personal financial advice.
            </p>
          </div>
          {SECTIONS.map((s) => (
            <div key={s.label}>
              <h4 className="text-eyebrow uppercase text-ink-quaternary mb-4">{s.label}</h4>
              <ul className="flex flex-col gap-2.5">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-body-sm text-ink-tertiary hover:text-ink-primary transition-colors duration-200"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-caption text-ink-quaternary">
            © {new Date().getFullYear()} Family Wealth Lab. All rights reserved.
          </p>
          <p className="text-caption text-ink-quaternary">
            Built in Australia · v1.0 preview
          </p>
        </div>
      </div>
    </footer>
  );
}
