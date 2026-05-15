"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type BulkDeleteModalProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  count?: number;
  /** Optional label describing what is being deleted (e.g. "transactions"). */
  label?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onExportBackup?: () => void;
};

/**
 * Demo-mode stub for the personal app's BulkDeleteModal.
 * In the commercial shell, write operations are gated; this modal renders a
 * read-only confirmation that informs the user the action would run in a real
 * environment.
 */
export default function BulkDeleteModal({
  open,
  onOpenChange,
  title = "Delete selected items",
  description = "This is a demo. No data will be removed.",
  count,
  label,
  onConfirm,
  onCancel,
  onExportBackup,
}: BulkDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => onOpenChange?.(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
            {typeof count === "number"
              ? ` (${count} ${label ?? `item${count === 1 ? "" : "s"}`})`
              : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {onExportBackup ? (
            <Button variant="outline" onClick={onExportBackup}>
              Export backup
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              onOpenChange?.(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (onConfirm) await onConfirm();
              onOpenChange?.(false);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { BulkDeleteModal };
