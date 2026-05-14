"use client";

/**
 * HeaderActions — client button row for export / template / import / fix /
 * add expense actions.
 *
 * Export (CSV + XLSX) uses simple anchor navigation.
 * Template download uses anchor navigation.
 * Import Excel opens the ImportXlsxPanel dialog.
 * Fix Categories triggers a server action.
 * Add Expense opens the AddExpenseModal.
 */

import * as React from "react";
import { Download, FileSpreadsheet, Upload, Zap, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImportXlsxPanel } from "./ImportXlsxPanel";
import { AddExpenseModal } from "./AddExpenseModal";

export function HeaderActions({
  householdId,
  tab,
}: {
  householdId: string;
  tab: string;
}) {
  const [showImport, setShowImport] = React.useState(false);
  const [showAdd, setShowAdd] = React.useState(false);

  const exportCsvHref = `/workspace/${householdId}/input/expenses/export`;
  const exportXlsxHref = `/workspace/${householdId}/input/expenses/export.xlsx`;
  const templateHref = `/workspace/${householdId}/input/expenses/template.xlsx`;

  return (
    <>
      {/* Row 1: Export / Template / Import */}
      <div className="flex flex-wrap items-center gap-2">
        <a href={exportCsvHref} aria-label="Export expenses as CSV" download>
          <Button variant="secondary" size="sm">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </a>
        <a href={exportXlsxHref} aria-label="Export expenses as Excel" download>
          <Button variant="secondary" size="sm">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export
          </Button>
        </a>
        <a href={templateHref} aria-label="Download import template" download>
          <Button variant="secondary" size="sm">
            <Download className="h-3.5 w-3.5" />
            Template
          </Button>
        </a>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowImport(true)}
          aria-label="Import from Excel file"
        >
          <Upload className="h-3.5 w-3.5" />
          Import Excel
        </Button>
      </div>

      {/* Row 2: Fix Categories + Add Expense */}
      <div className="flex items-center gap-2">
        <a
          href={`/workspace/${householdId}/input/expenses/fix-categories`}
          aria-label="Auto-fix expense categories from source codes"
        >
          <Button variant="secondary" size="sm" className="border-ember-300 text-ember-700 hover:bg-ember-50">
            <Zap className="h-3.5 w-3.5" />
            Fix Categories
          </Button>
        </a>
        <Button
          variant="ember"
          size="sm"
          onClick={() => setShowAdd(true)}
          aria-label="Add new expense"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Expense
        </Button>
      </div>

      {/* Import panel dialog */}
      {showImport && (
        <ImportXlsxPanel
          householdId={householdId}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Add expense dialog */}
      {showAdd && (
        <AddExpenseModal
          householdId={householdId}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  );
}
