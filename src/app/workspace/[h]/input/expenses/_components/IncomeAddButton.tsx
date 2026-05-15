"use client";

/**
 * IncomeAddButton — opens the Add Income modal dialog.
 */

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/cta-button";
import { AddIncomeModal } from "./AddIncomeModal";

export function IncomeAddButton({ householdId }: { householdId: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ember"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Add new income record"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Income
      </Button>
      {open && (
        <AddIncomeModal householdId={householdId} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
