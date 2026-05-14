"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { deleteProperty } from "./actions";

export function DeletePropertyButton({
  householdId,
  propertyId,
}: {
  householdId: string;
  propertyId: string;
}) {
  return (
    <form action={deleteProperty}>
      <input type="hidden" name="household_id" value={householdId} />
      <input type="hidden" name="id" value={propertyId} />
      <DeleteBtn />
    </form>
  );
}

function DeleteBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label="Delete property"
      disabled={pending}
      className="h-9 w-9 inline-flex items-center justify-center rounded-full text-ink-quaternary hover:text-rose-700 hover:bg-rose-50 focus-ring disabled:opacity-40"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
