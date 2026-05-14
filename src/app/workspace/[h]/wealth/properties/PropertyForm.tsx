"use client";

/**
 * PropertyForm — full sectioned form for add/edit.
 * Groups: [A] Purchase · [B] Loan · [C] Rental · [D] Expenses · [E] Projection
 * Used inside AddPropertyModal (create) and EditPropertyForm (update).
 */

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProperty, updateProperty } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field, inputCls, textareaCls, ErrorBanner, SuccessBanner } from "@/components/workspace/forms/Field";

type ActionState = { ok: boolean; error?: string } | null;
const initial: ActionState = null;

// ─── Existing property row (for editing) ────────────────────────────────────
export type PropertyRow = {
  id: string;
  name: string;
  type: "ppor" | "owner_occupied" | "investment";
  purchase_price: number | null;
  current_value: number | null;
  deposit: number | null;
  stamp_duty: number | null;
  legal_fees: number | null;
  building_inspection: number | null;
  loan_setup_fees: number | null;
  purchase_date: string | null;
  settlement_date: string | null;
  loan_amount: number | null;
  interest_rate: number | null;
  loan_term_years: number | null;
  loan_type: string | null;
  io_period_start: string | null;
  io_period_end: string | null;
  offset_balance: number | null;
  weekly_rent: number | null;
  rental_income: number | null;
  rental_growth: number | null;
  vacancy_rate: number | null;
  management_fee: number | null;
  rental_start_date: string | null;
  insurance: number | null;
  council_rates: number | null;
  water_rates: number | null;
  maintenance: number | null;
  body_corporate: number | null;
  land_tax: number | null;
  expenses: number | null;
  capital_growth: number | null;
  renovation_costs: number | null;
  planned_sale_date: string | null;
  selling_costs: number | null;
  projection_years: number | null;
  notes: string | null;
};

interface PropertyFormProps {
  householdId: string;
  /** Pass to switch to edit mode. */
  existing?: PropertyRow;
  /** Called after successful save (for modal close / redirect). */
  onSuccess?: () => void;
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function n(v: number | null | undefined): string {
  if (v == null) return "";
  return String(v);
}

function SectionHeader({ label, index }: { label: string; index: string }) {
  return (
    <div className="syslabel mb-4 mt-6 first:mt-0">
      <span className="syslabel-bracket">{index}</span>
      <span>{label}</span>
    </div>
  );
}

function selectCls() {
  return inputCls;
}

// ─── Submit button ────────────────────────────────────────────────────────────
function Submit({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="md" disabled={pending}>
      {pending ? "Saving…" : isEdit ? "Save changes" : "Add property"}
    </Button>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────
export function PropertyForm({ householdId, existing, onSuccess }: PropertyFormProps) {
  const isEdit = !!existing;
  const action = isEdit ? updateProperty : createProperty;

  const [state, formAction] = useFormState(action, initial);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state?.ok) {
      if (!isEdit) formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, isEdit, onSuccess]);

  // Track type for conditional sections
  const defaultType = existing?.type ?? "investment";
  const [propType, setPropType] = React.useState<string>(defaultType);
  const isInvestment = propType !== "ppor" && propType !== "owner_occupied";

  // Track loan type for IO fields
  const defaultLoanType = existing?.loan_type ?? "PI";
  const [loanType, setLoanType] = React.useState<string>(defaultLoanType ?? "PI");
  const isIO = loanType === "IO";

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      {isEdit && <input type="hidden" name="id" value={existing.id} />}
      <input type="hidden" name="household_id" value={householdId} />

      {/* ── [A] Purchase Details ─────────────────────────────────────────── */}
      <SectionHeader index="[A]" label="Purchase Details" />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Property name" required>
          <input
            name="name"
            required
            maxLength={120}
            defaultValue={existing?.name ?? ""}
            placeholder="e.g. 12 Acacia St, Brisbane"
            className={inputCls}
          />
        </Field>
        <Field label="Type" required>
          <select
            name="type"
            required
            defaultValue={defaultType}
            onChange={(e) => setPropType(e.target.value)}
            className={selectCls()}
          >
            <option value="ppor">PPOR (primary residence)</option>
            <option value="owner_occupied">Owner-occupied (other)</option>
            <option value="investment">Investment property</option>
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Purchase price (AUD)">
          <input
            type="number" name="purchase_price" min="0" step="1"
            defaultValue={n(existing?.purchase_price)}
            placeholder="750000" className={inputCls}
          />
        </Field>
        <Field label="Current value (AUD)">
          <input
            type="number" name="current_value" min="0" step="1"
            defaultValue={n(existing?.current_value)}
            placeholder="750000" className={inputCls}
          />
        </Field>
        <Field label="Deposit (AUD)">
          <input
            type="number" name="deposit" min="0" step="1"
            defaultValue={n(existing?.deposit)}
            placeholder="150000" className={inputCls}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Stamp duty (AUD)">
          <input
            type="number" name="stamp_duty" min="0" step="1"
            defaultValue={n(existing?.stamp_duty)}
            placeholder="Auto-estimated" className={inputCls}
          />
        </Field>
        <Field label="Legal fees (AUD)">
          <input
            type="number" name="legal_fees" min="0" step="1"
            defaultValue={n(existing?.legal_fees)}
            placeholder="2000" className={inputCls}
          />
        </Field>
        <Field label="Building inspection (AUD)">
          <input
            type="number" name="building_inspection" min="0" step="1"
            defaultValue={n(existing?.building_inspection)}
            placeholder="800" className={inputCls}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Loan setup fees (AUD)">
          <input
            type="number" name="loan_setup_fees" min="0" step="1"
            defaultValue={n(existing?.loan_setup_fees)}
            placeholder="1500" className={inputCls}
          />
        </Field>
        <Field label="Purchase date">
          <input
            type="date" name="purchase_date"
            defaultValue={existing?.purchase_date ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Settlement date">
          <input
            type="date" name="settlement_date"
            defaultValue={existing?.settlement_date ?? ""}
            className={inputCls}
          />
        </Field>
      </div>

      {/* ── [B] Loan Details ─────────────────────────────────────────────── */}
      <SectionHeader index="[B]" label="Loan Details" />

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Loan amount (AUD)">
          <input
            type="number" name="loan_amount" min="0" step="1"
            defaultValue={n(existing?.loan_amount)}
            placeholder="600000" className={inputCls}
          />
        </Field>
        <Field label="Interest rate" hint="Decimal — e.g. 0.0625 = 6.25%">
          <input
            type="number" name="interest_rate" min="0" max="1" step="0.0001"
            defaultValue={n(existing?.interest_rate)}
            placeholder="0.0625" className={inputCls}
          />
        </Field>
        <Field label="Loan term (years)">
          <input
            type="number" name="loan_term_years" min="1" max="40" step="1"
            defaultValue={n(existing?.loan_term_years)}
            placeholder="30" className={inputCls}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Loan type">
          <select
            name="loan_type"
            defaultValue={defaultLoanType ?? "PI"}
            onChange={(e) => setLoanType(e.target.value)}
            className={selectCls()}
          >
            <option value="PI">Principal &amp; Interest</option>
            <option value="IO">Interest Only</option>
            <option value="OFFSET">Offset</option>
            <option value="LINE_OF_CREDIT">Line of Credit</option>
          </select>
        </Field>
        <Field label="Offset balance (AUD)">
          <input
            type="number" name="offset_balance" min="0" step="1"
            defaultValue={n(existing?.offset_balance)}
            placeholder="0" className={inputCls}
          />
        </Field>
        {isIO && (
          <>
            <Field label="IO period start">
              <input
                type="date" name="io_period_start"
                defaultValue={existing?.io_period_start ?? ""}
                className={inputCls}
              />
            </Field>
          </>
        )}
      </div>

      {isIO && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="IO period end">
            <input
              type="date" name="io_period_end"
              defaultValue={existing?.io_period_end ?? ""}
              className={inputCls}
            />
          </Field>
        </div>
      )}

      {/* ── [C] Rental Income (investment only) ──────────────────────────── */}
      {isInvestment && (
        <>
          <SectionHeader index="[C]" label="Rental Income" />

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Weekly rent (AUD)">
              <input
                type="number" name="weekly_rent" min="0" step="1"
                defaultValue={n(existing?.weekly_rent)}
                placeholder="550" className={inputCls}
              />
            </Field>
            <Field label="Rental growth" hint="Decimal — e.g. 0.03 = 3%">
              <input
                type="number" name="rental_growth" min="0" max="1" step="0.001"
                defaultValue={n(existing?.rental_growth)}
                placeholder="0.03" className={inputCls}
              />
            </Field>
            <Field label="Vacancy rate" hint="Decimal — e.g. 0.02 = 2%">
              <input
                type="number" name="vacancy_rate" min="0" max="1" step="0.001"
                defaultValue={n(existing?.vacancy_rate)}
                placeholder="0.02" className={inputCls}
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Management fee" hint="Decimal — e.g. 0.08 = 8%">
              <input
                type="number" name="management_fee" min="0" max="1" step="0.001"
                defaultValue={n(existing?.management_fee)}
                placeholder="0.08" className={inputCls}
              />
            </Field>
            <Field label="Rental start date">
              <input
                type="date" name="rental_start_date"
                defaultValue={existing?.rental_start_date ?? ""}
                className={inputCls}
              />
            </Field>
            <Field label="Annual rental income (AUD)" hint="Override if needed">
              <input
                type="number" name="rental_income" min="0" step="1"
                defaultValue={n(existing?.rental_income)}
                placeholder="Calculated from weekly rent"
                className={inputCls}
              />
            </Field>
          </div>
        </>
      )}

      {/* ── [D] Operating Expenses (annual) ──────────────────────────────── */}
      <SectionHeader index="[D]" label="Operating Expenses (annual)" />

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Insurance (AUD/yr)">
          <input
            type="number" name="insurance" min="0" step="1"
            defaultValue={n(existing?.insurance)}
            placeholder="1800" className={inputCls}
          />
        </Field>
        <Field label="Council rates (AUD/yr)">
          <input
            type="number" name="council_rates" min="0" step="1"
            defaultValue={n(existing?.council_rates)}
            placeholder="2200" className={inputCls}
          />
        </Field>
        <Field label="Water rates (AUD/yr)">
          <input
            type="number" name="water_rates" min="0" step="1"
            defaultValue={n(existing?.water_rates)}
            placeholder="900" className={inputCls}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Maintenance (AUD/yr)">
          <input
            type="number" name="maintenance" min="0" step="1"
            defaultValue={n(existing?.maintenance)}
            placeholder="2000" className={inputCls}
          />
        </Field>
        <Field label="Body corporate (AUD/yr)">
          <input
            type="number" name="body_corporate" min="0" step="1"
            defaultValue={n(existing?.body_corporate)}
            placeholder="0" className={inputCls}
          />
        </Field>
        <Field label="Land tax (AUD/yr)">
          <input
            type="number" name="land_tax" min="0" step="1"
            defaultValue={n(existing?.land_tax)}
            placeholder="0" className={inputCls}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Other annual expenses (AUD)">
          <input
            type="number" name="expenses" min="0" step="1"
            defaultValue={n(existing?.expenses)}
            placeholder="0" className={inputCls}
          />
        </Field>
      </div>

      {/* ── [E] Projection Assumptions ───────────────────────────────────── */}
      <SectionHeader index="[E]" label="Projection Assumptions" />

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Capital growth" hint="Decimal — e.g. 0.06 = 6%">
          <input
            type="number" name="capital_growth" min="0" max="1" step="0.001"
            defaultValue={n(existing?.capital_growth)}
            placeholder="0.06" className={inputCls}
          />
        </Field>
        <Field label="Renovation costs (AUD)">
          <input
            type="number" name="renovation_costs" min="0" step="1"
            defaultValue={n(existing?.renovation_costs)}
            placeholder="0" className={inputCls}
          />
        </Field>
        <Field label="Projection years">
          <input
            type="number" name="projection_years" min="1" max="50" step="1"
            defaultValue={n(existing?.projection_years ?? 15)}
            placeholder="15" className={inputCls}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Planned sale date">
          <input
            type="date" name="planned_sale_date"
            defaultValue={existing?.planned_sale_date ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Selling costs" hint="Decimal — e.g. 0.025 = 2.5%">
          <input
            type="number" name="selling_costs" min="0" max="1" step="0.001"
            defaultValue={n(existing?.selling_costs)}
            placeholder="0.025" className={inputCls}
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          name="notes"
          rows={2}
          maxLength={2000}
          defaultValue={existing?.notes ?? ""}
          className={textareaCls}
        />
      </Field>

      {/* ── Status / submit ───────────────────────────────────────────────── */}
      <ErrorBanner message={state?.error} />
      {state?.ok && !isEdit && (
        <SuccessBanner message="Property saved to ledger." />
      )}

      <div className="flex items-center gap-3 pt-2">
        <Submit isEdit={isEdit} />
        {!isEdit && (
          <span className="text-caption text-ink-quaternary">
            The Decision Engine reads this ledger immediately.
          </span>
        )}
      </div>
    </form>
  );
}
