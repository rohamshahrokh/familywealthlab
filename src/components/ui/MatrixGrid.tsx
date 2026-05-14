"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MatrixTone = "positive" | "negative" | "warning" | "neutral";

export interface MatrixCell {
  value: string;
  /** Optional delta line shown below value. */
  delta?: string;
  tone?: MatrixTone;
  /** When true, this cell is the "winning" / recommended option. */
  highlight?: boolean;
}

export interface MatrixColumn {
  /** Short header label (e.g. "REFI · IO"). */
  label: string;
  /** Optional caption under the header (e.g. "5Y FIXED"). */
  caption?: string;
  /** Mark this column as the recommended path. */
  recommended?: boolean;
}

export interface MatrixRow {
  /** Row label (e.g. "Net worth · 2045"). */
  label: string;
  /** Optional caption under label (e.g. "P50 MEDIAN"). */
  caption?: string;
  /** Cells in the same order as `columns`. */
  cells: MatrixCell[];
}

interface MatrixGridProps {
  columns: MatrixColumn[];
  rows: MatrixRow[];
  /** Optional title shown at the top-left corner cell. */
  cornerLabel?: string;
  className?: string;
}

const TONE_TEXT: Record<MatrixTone, string> = {
  positive: "text-positive",
  negative: "text-negative",
  warning: "text-warning",
  neutral: "text-ink-quinary",
};

/**
 * MatrixGrid — responsive 2D comparison grid.
 *
 * Desktop: rows × columns as a real table-like grid.
 * Mobile (<md): stacks into one card per column, each containing the rows
 * as label/value pairs. No horizontal overflow. No tiny unreadable text.
 *
 * The "recommended" column gets an ember rail, a SCENARIO chip, and a soft
 * tinted background. Hovering any column lifts it and highlights its rail.
 */
export function MatrixGrid({ columns, rows, cornerLabel, className }: MatrixGridProps) {
  const [hover, setHover] = React.useState<number | null>(null);

  return (
    <div className={cn("w-full", className)}>
      {/* ── Desktop / tablet table view ─────────────────────────── */}
      <div
        className="hidden md:grid rounded-xl border border-line bg-white/70 overflow-hidden"
        style={{
          gridTemplateColumns: `minmax(120px, 1.4fr) repeat(${columns.length}, minmax(0, 1fr))`,
        }}
        role="table"
        aria-label="Scenario comparison matrix"
      >
        {/* Header row */}
        <div className="px-4 py-3 bg-bg-inset/70 border-b border-line">
          <span className="syslabel text-[0.6rem]">
            <span className="mono text-ember-500">[ Δ ]</span>
            <span>{cornerLabel ?? "MATRIX"}</span>
          </span>
        </div>
        {columns.map((c, i) => {
          const isRec = !!c.recommended;
          const isHover = hover === i;
          return (
            <motion.div
              key={c.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                "relative px-4 py-3 border-b border-line text-right transition-colors duration-300",
                isRec ? "bg-ember-50/60" : "bg-bg-inset/40",
              )}
            >
              {isRec && (
                <span
                  aria-hidden
                  className="absolute -top-2 right-3 px-1.5 bg-ember-500 text-white text-[0.55rem] mono tracking-wider rounded-sm uppercase"
                >
                  Scenario
                </span>
              )}
              <p className={cn("text-[0.65rem] mono uppercase tracking-wider", isRec ? "text-ember-700" : "text-ink-quaternary")}>
                {c.label}
              </p>
              {c.caption && (
                <p className="text-[0.6rem] mono text-ink-quinary uppercase tracking-wider">
                  {c.caption}
                </p>
              )}
              {/* Top accent rail */}
              <motion.span
                aria-hidden
                className={cn(
                  "absolute left-0 right-0 -top-px h-[2px]",
                  isRec ? "bg-ember-500" : "bg-ember-500/0",
                )}
                animate={{ opacity: isHover && !isRec ? 0.5 : isRec ? 1 : 0 }}
                transition={{ duration: 0.25 }}
              />
            </motion.div>
          );
        })}

        {/* Body rows */}
        {rows.map((row, ri) => (
          <React.Fragment key={row.label}>
            <div
              className={cn(
                "px-4 py-3.5 border-b border-line/60 last:border-b-0",
                "bg-white/30",
              )}
            >
              <p className="text-body-sm text-ink-secondary">{row.label}</p>
              {row.caption && (
                <p className="mt-0.5 text-[0.6rem] mono uppercase tracking-wider text-ink-quinary">
                  {row.caption}
                </p>
              )}
            </div>
            {row.cells.map((cell, ci) => {
              const col = columns[ci];
              const isRec = !!col?.recommended;
              const isHover = hover === ci;
              const toneClass = cell.tone ? TONE_TEXT[cell.tone] : "text-ink-primary";
              return (
                <motion.div
                  key={`${ri}-${ci}`}
                  onMouseEnter={() => setHover(ci)}
                  onMouseLeave={() => setHover(null)}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    delay: 0.04 * ri + 0.06 * ci,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "px-4 py-3.5 text-right border-b border-line/60 last:border-b-0 transition-colors duration-300",
                    isRec ? "bg-ember-50/30" : "bg-white/20",
                    isHover && !isRec && "bg-bg-inset/60",
                  )}
                >
                  <p className={cn("text-h4 mono tracking-tight", toneClass)}>{cell.value}</p>
                  {cell.delta && (
                    <p
                      className={cn(
                        "mt-0.5 text-[0.65rem] mono tracking-wider",
                        cell.tone === "positive"
                          ? "text-positive"
                          : cell.tone === "warning"
                          ? "text-warning"
                          : cell.tone === "negative"
                          ? "text-negative"
                          : "text-ink-quinary",
                      )}
                    >
                      {cell.delta}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* ── Mobile stacked view ─────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-3">
        {columns.map((c, ci) => {
          const isRec = !!c.recommended;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: ci * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative rounded-lg border bg-white/70 p-4",
                isRec ? "border-ember-500/40 bg-ember-50/40" : "border-line",
              )}
            >
              {isRec && (
                <span
                  aria-hidden
                  className="absolute -top-2 left-3 px-1.5 bg-ember-500 text-white text-[0.55rem] mono tracking-wider rounded-sm uppercase"
                >
                  Scenario
                </span>
              )}
              <div className="flex items-baseline justify-between gap-3">
                <p className={cn("text-[0.65rem] mono uppercase tracking-wider", isRec ? "text-ember-700" : "text-ink-quaternary")}>
                  {c.label}
                </p>
                {c.caption && (
                  <p className="text-[0.6rem] mono text-ink-quinary uppercase tracking-wider">
                    {c.caption}
                  </p>
                )}
              </div>
              <div className="mt-3 flex flex-col gap-2.5">
                {rows.map((row, ri) => {
                  const cell = row.cells[ci];
                  if (!cell) return null;
                  const toneClass = cell.tone ? TONE_TEXT[cell.tone] : "text-ink-primary";
                  return (
                    <div key={ri} className="flex items-baseline justify-between gap-3 border-b border-line/50 pb-2 last:border-b-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-body-sm text-ink-secondary truncate">{row.label}</p>
                        {row.caption && (
                          <p className="text-[0.6rem] mono uppercase tracking-wider text-ink-quinary">
                            {row.caption}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("text-body-sm mono", toneClass)}>{cell.value}</p>
                        {cell.delta && (
                          <p
                            className={cn(
                              "text-[0.6rem] mono",
                              cell.tone === "positive"
                                ? "text-positive"
                                : cell.tone === "warning"
                                ? "text-warning"
                                : cell.tone === "negative"
                                ? "text-negative"
                                : "text-ink-quinary",
                            )}
                          >
                            {cell.delta}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
