"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { deleteIncomeSource } from "./actions";

export function DeleteIncomeButton({ householdId, id }: { householdId: string; id: string }) {
  return (
    <form action={deleteIncomeSource}>
      <input type="hidden" name="household_id" value={householdId} />
      <input type="hidden" name="id" value={id} />
      <Btn />
    </form>
  );
}

function Btn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label="Delete income source"
      disabled={pending}
      className="h-9 w-9 inline-flex items-center justify-center rounded-full text-ink-quaternary hover:text-rose-700 hover:bg-rose-50 focus-ring disabled:opacity-40"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
