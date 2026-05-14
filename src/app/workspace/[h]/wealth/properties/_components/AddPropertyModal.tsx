"use client";

/**
 * AddPropertyModal — `<dialog>`-based modal wrapping PropertyForm.
 * Opens when `?add=1` is in the URL. Close navigates back to ?tab=portfolio.
 * Mirrors AddExpenseModal pattern.
 */

import * as React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { PropertyForm } from "../PropertyForm";

export function AddPropertyModal({
  householdId,
  basePath,
}: {
  householdId: string;
  basePath: string;
}) {
  const router = useRouter();
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    dialogRef.current?.showModal();
    return () => dialogRef.current?.close();
  }, []);

  function handleClose() {
    router.push(`${basePath}?tab=portfolio`);
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="m-auto rounded-2xl border border-line bg-bg-base shadow-2xl p-0 w-full max-w-2xl max-h-[90dvh] overflow-y-auto backdrop:bg-ink-primary/30"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-bg-base z-10">
        <h2 className="text-body-lg font-semibold text-ink-primary">Add Property</h2>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close add property dialog"
          className="h-8 w-8 inline-flex items-center justify-center rounded-full text-ink-quaternary hover:text-ink-primary hover:bg-bg-inset transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-6">
        <PropertyForm
          householdId={householdId}
          onSuccess={handleClose}
        />
      </div>
    </dialog>
  );
}
