/** "or" divider with hairline rules */
export function Divider({ label = "or" }: { label?: string }) {
  return (
    <div className="relative my-5 flex items-center" aria-hidden>
      <div className="flex-1 h-px bg-line" />
      <span className="mono px-3 text-caption text-ink-quaternary">{label}</span>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}
