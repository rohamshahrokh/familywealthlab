"use client";

/**
 * EditPropertyForm — wraps PropertyForm for in-page edit mode.
 * Rendered when ?edit=<id> is in the URL. On success/cancel,
 * navigates back to ?tab=portfolio.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { PropertyForm, type PropertyRow } from "../PropertyForm";
import { SurfaceCard } from "@/components/workspace/cards";
import { X } from "lucide-react";

export function EditPropertyForm({
  householdId,
  basePath,
  property,
}: {
  householdId: string;
  basePath: string;
  property: PropertyRow;
}) {
  const router = useRouter();

  function handleClose() {
    router.push(`${basePath}?tab=portfolio`);
  }

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between mb-6">
        <div className="syslabel">
          <span className="syslabel-bracket">[EDIT]</span>
          <span>{property.name}</span>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cancel edit"
          className="h-8 w-8 inline-flex items-center justify-center rounded-full text-ink-quaternary hover:text-ink-primary hover:bg-bg-inset transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <PropertyForm
        householdId={householdId}
        existing={property}
        onSuccess={handleClose}
      />
    </SurfaceCard>
  );
}
