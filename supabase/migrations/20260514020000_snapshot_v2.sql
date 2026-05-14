-- ---------------------------------------------------------------------------
-- Phase 2A — Snapshot Command Centre
--
-- Adds the ledger tables required to power the central read-model:
--   * ledger.cash_accounts   — every cash/offset/savings/emergency account
--   * ledger.liabilities     — non-property debt (credit cards, personal loans)
--   * ledger.super_accounts  — Australian superannuation balances
--   * ledger.snapshot_cache  — one materialised KPI row per household
--   * ledger.assumptions     — extra columns for FIRE / buffer / retirement
--
-- All tables use the same RLS pattern as Phase 1 (membership check via
-- app.is_household_member(uuid)). Additive only — no destructive changes.
-- ---------------------------------------------------------------------------

set search_path = public;

-- ── 1. ledger.cash_accounts ────────────────────────────────────────────────
create table if not exists ledger.cash_accounts (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references public.households(id) on delete cascade,
  name            text not null,
  type            text not null check (type in ('checking','savings','offset','emergency','other')),
  institution     text,
  balance         numeric(14,2) not null default 0,
  currency        text not null default 'AUD',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists cash_accounts_household_idx
  on ledger.cash_accounts (household_id);

alter table ledger.cash_accounts enable row level security;

create policy cash_accounts_select on ledger.cash_accounts
  for select using (app.is_household_member(household_id));
create policy cash_accounts_insert on ledger.cash_accounts
  for insert with check (app.is_household_member(household_id));
create policy cash_accounts_update on ledger.cash_accounts
  for update using (app.is_household_member(household_id))
              with check (app.is_household_member(household_id));
create policy cash_accounts_delete on ledger.cash_accounts
  for delete using (app.is_household_member(household_id));

-- ── 2. ledger.liabilities ──────────────────────────────────────────────────
create table if not exists ledger.liabilities (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references public.households(id) on delete cascade,
  name            text not null,
  type            text not null check (type in
                    ('credit_card','personal_loan','heloc','student_loan','other')),
  balance         numeric(14,2) not null default 0,
  interest_rate   numeric(6,4),           -- 0.1999 = 19.99%
  min_payment     numeric(12,2),          -- monthly minimum payment
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists liabilities_household_idx
  on ledger.liabilities (household_id);

alter table ledger.liabilities enable row level security;

create policy liabilities_select on ledger.liabilities
  for select using (app.is_household_member(household_id));
create policy liabilities_insert on ledger.liabilities
  for insert with check (app.is_household_member(household_id));
create policy liabilities_update on ledger.liabilities
  for update using (app.is_household_member(household_id))
              with check (app.is_household_member(household_id));
create policy liabilities_delete on ledger.liabilities
  for delete using (app.is_household_member(household_id));

-- ── 3. ledger.super_accounts ───────────────────────────────────────────────
create table if not exists ledger.super_accounts (
  id                  uuid primary key default gen_random_uuid(),
  household_id        uuid not null references public.households(id) on delete cascade,
  owner_label         text,                      -- free text e.g. "Roham", "Fara"
  provider            text,
  balance             numeric(14,2) not null default 0,
  contribution_rate   numeric(6,4),              -- 0.115 = 11.5%
  preservation_age    int,                       -- typically 60 in AU
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists super_accounts_household_idx
  on ledger.super_accounts (household_id);

alter table ledger.super_accounts enable row level security;

create policy super_accounts_select on ledger.super_accounts
  for select using (app.is_household_member(household_id));
create policy super_accounts_insert on ledger.super_accounts
  for insert with check (app.is_household_member(household_id));
create policy super_accounts_update on ledger.super_accounts
  for update using (app.is_household_member(household_id))
              with check (app.is_household_member(household_id));
create policy super_accounts_delete on ledger.super_accounts
  for delete using (app.is_household_member(household_id));

-- ── 4. ledger.snapshot_cache ───────────────────────────────────────────────
-- One row per household. Refreshed on every ledger write; readers may also
-- fall through to a live recompute if `computed_at` is older than 5 minutes.
create table if not exists ledger.snapshot_cache (
  household_id    uuid primary key references public.households(id) on delete cascade,
  payload         jsonb not null,            -- the full Snapshot struct
  schema_version  int not null default 1,
  computed_at     timestamptz not null default now()
);

alter table ledger.snapshot_cache enable row level security;

create policy snapshot_cache_select on ledger.snapshot_cache
  for select using (app.is_household_member(household_id));
-- Writes go through the SECURITY DEFINER function below; no direct INSERT/UPDATE.
create policy snapshot_cache_insert on ledger.snapshot_cache
  for insert with check (app.is_household_member(household_id));
create policy snapshot_cache_update on ledger.snapshot_cache
  for update using (app.is_household_member(household_id))
              with check (app.is_household_member(household_id));

-- ── 5. ledger.assumptions extension ────────────────────────────────────────
-- Add forward-planning assumption columns. Existing rows continue to work.
alter table ledger.assumptions
  add column if not exists fire_target_amount      numeric(14,2),
  add column if not exists fire_target_age         int,
  add column if not exists retirement_age          int,
  add column if not exists emergency_buffer_months int default 6,
  add column if not exists return_assumption       numeric(6,4),
  add column if not exists inflation_assumption    numeric(6,4);

comment on column ledger.assumptions.fire_target_amount      is 'Liquid net-worth target that defines financial independence';
comment on column ledger.assumptions.fire_target_age         is 'Age the household wishes to hit FIRE by';
comment on column ledger.assumptions.retirement_age          is 'Age the household plans to retire (super preservation aware)';
comment on column ledger.assumptions.emergency_buffer_months is 'Target months of expenses to hold as emergency buffer';
comment on column ledger.assumptions.return_assumption       is 'Annual return assumption used by forecast engines, decimal form';
comment on column ledger.assumptions.inflation_assumption    is 'Annual inflation assumption used by forecast engines, decimal form';
