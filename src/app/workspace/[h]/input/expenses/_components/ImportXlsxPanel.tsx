"use client";

/**
 * ImportXlsxPanel — dialog for uploading an .xlsx file to import expenses.
 * Calls the `importExpensesXlsx` server action via useFormState.
 */

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { X, Upload } from "lucide-react";
import { importExpensesXlsx } from "../xlsx-actions";
import { Button } from "@/components/ui/cta-button";
import { ErrorBanner, SuccessBanner } from "@/components/workspace/forms/Field";

type State = { ok: boolean; error?: string; created?: number; skipped?: number } | null;

export function ImportXlsxPanel({
  householdId,
  onClose,
}: {
  householdId: string;
  onClose: () => void;
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [state, formAction] = useFormState(importExpensesXlsx, null as State);

  React.useEffect(() => {
    dialogRef.current?.showModal();
    return () => dialogRef.current?.close();
  }, []);

  // Close automatically on success after a short delay
  React.useEffect(() => {
    if (state?.ok) {
      const t = setTimeout(onClose, 2000);
      return () => clearTimeout(t);
    }
  }, [state?.ok, onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto rounded-2xl border border-line bg-bg-base shadow-2xl p-0 w-full max-w-lg backdrop:bg-ink-primary/30"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-line">
        <h2 className="text-body-lg font-semibold text-ink-primary flex items-center gap-2">
          <Upload className="h-4 w-4 text-ember-500" />
          Import Excel
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close import dialog"
          className="h-8 w-8 inline-flex items-center justify-center rounded-full text-ink-quaternary hover:text-ink-primary hover:bg-bg-inset transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form action={formAction} encType="multipart/form-data" className="p-6 space-y-5">
        <input type="hidden" name="household_id" value={householdId} />

        <ErrorBanner message={state?.ok === false ? state.error : undefined} />
        {state?.ok && (
          <SuccessBanner
            message={`Imported ${state.created} row${state.created !== 1 ? "s" : ""}${state.skipped ? ` · skipped ${state.skipped}` : ""}.`}
          />
        )}

        <div>
          <label className="block space-y-1.5">
            <span className="text-caption text-ink-secondary font-medium">
              Excel file (.xlsx)
            </span>
            <input
              type="file"
              name="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              required
              aria-label="Select Excel file to import"
              className="block w-full text-body-sm text-ink-secondary file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-body-sm file:font-medium file:bg-ember-50 file:text-ember-700 hover:file:bg-ember-100 cursor-pointer"
            />
          </label>
          <p className="mt-2 text-caption text-ink-quaternary">
            Columns: date, amount, category, subcategory, source_code, member, payment_method, label, cadence, notes.
          </p>
        </div>

        <div className="flex items-center gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-body-sm text-ink-tertiary hover:text-ink-primary px-3 h-10 rounded-full transition-colors"
          >
            Cancel
          </button>
          <Submit />
        </div>
      </form>
    </dialog>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-label="Upload and import Excel file">
      {pending ? "Importing…" : "Import"}
    </Button>
  );
}
