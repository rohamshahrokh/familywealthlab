"use client";

/**
 * AddIncomeModal — dialog wrapping the IncomeForm.
 */

import * as React from "react";
import { X } from "lucide-react";
import { IncomeForm } from "./IncomeForm";

export function AddIncomeModal({
  householdId,
  onClose,
}: {
  householdId: string;
  onClose: () => void;
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    dialogRef.current?.showModal();
    return () => dialogRef.current?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto rounded-2xl border border-line bg-bg-base shadow-2xl p-0 w-full max-w-2xl backdrop:bg-ink-primary/30"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-line">
        <h2 className="text-body-lg font-semibold text-ink-primary">Add Income</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close add income dialog"
          className="h-8 w-8 inline-flex items-center justify-center rounded-full text-ink-quaternary hover:text-ink-primary hover:bg-bg-inset transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-6">
        <IncomeForm householdId={householdId} />
      </div>
    </dialog>
  );
}
