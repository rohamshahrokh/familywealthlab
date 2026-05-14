-- Family Wealth Lab — Commercial Ledger (Phase 1 vertical slice)
-- ---------------------------------------------------------------------------
-- Run AFTER 20260514000000_auth_foundation.sql.
--
-- Creates schema `ledger` with 8 tables that map 1:1 to the DashboardInputs
-- contract used by the vendored engine. Every table is household-scoped and
-- guarded by RLS via app.is_household_member().
--
-- Column shapes intentionally mirror the live-app source-of-truth tables
-- (sf_snapshot, sf_properties, sf_stocks, sf_crypto, sf_income, sf_expenses)
-- so the engine adapter can consume them without per-field translation.
--
-- Postponed (Phase 2): forecast.*, scenarios.*, ai.*, billing.*.
-- ---------------------------------------------------------------------------

create schema if not exists ledger;
grant usage on schema ledger to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Common audit columns helper (DRY trigger function).
-- ---------------------------------------------------------------------------

create or replace function ledger.set_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- 1. ledger.snapshot — household master row (singleton per household, current)
-- ---------------------------------------------------------------------------

create table if not exists ledger.snapshot (
  id                      uuid primary key default gen_random_uuid(),
  household_id            uuid not null references app.households(id) on delete cascade,
  as_of                   date not null default current_date,

  -- Household composition / planning
  household_size          int,
  retirement_target_year  int,

  -- Income (manual master override; ledger.income_sources is primary SoT)
  monthly_income          numeric(14,2),
  roham_monthly_income    numeric(14,2),
  fara_monthly_income     numeric(14,2),
  rental_income_total     numeric(14,2),
  other_income            numeric(14,2),

  -- Expenses (manual master override; ledger.expenses is primary SoT)
  monthly_expenses        numeric(14,2),
  expenses_include_debt   boolean not null default true,

  -- Cash / liquid
  cash_balance            numeric(14,2),
  emergency_fund_target   numeric(14,2),

  -- PPOR
  ppor                    numeric(14,2),
  mortgage                numeric(14,2),
  mortgage_rate           numeric(7,4),
  mortgage_term_years     numeric(5,2),

  -- Other debts (non-property)
  other_debts             numeric(14,2),

  -- Aggregate fallbacks (only used when per-asset rows are empty)
  stocks                  numeric(14,2),
  crypto                  numeric(14,2),
  super_combined          numeric(14,2),

  -- Tax / regime context
  tax_regime              text default 'AU',
  marginal_tax_rate       numeric(5,4),

  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  unique (household_id)
);

create index if not exists snapshot_household_idx on ledger.snapshot(household_id);

drop trigger if exists snapshot_updated_at on ledger.snapshot;
create trigger snapshot_updated_at
  before update on ledger.snapshot
  for each row execute function ledger.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. ledger.properties — every PPOR + investment property + planned purchase
-- ---------------------------------------------------------------------------

create table if not exists ledger.properties (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references app.households(id) on delete cascade,
  name            text not null,
  type            text not null default 'investment'
                  check (type in ('ppor','owner_occupied','investment')),

  purchase_price  numeric(14,2),
  current_value   numeric(14,2),
  loan_amount     numeric(14,2),
  interest_rate   numeric(7,4),
  loan_term_years numeric(5,2),

  settlement_date date,                 -- null/future ⇒ planned, past ⇒ settled
  rental_income   numeric(14,2),        -- monthly
  expenses        numeric(14,2),        -- monthly (rates, strata, etc.)

  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists properties_household_idx on ledger.properties(household_id);
create index if not exists properties_settlement_idx on ledger.properties(household_id, settlement_date);

drop trigger if exists properties_updated_at on ledger.properties;
create trigger properties_updated_at
  before update on ledger.properties
  for each row execute function ledger.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. ledger.stocks — per-ticker holdings catalog
-- ---------------------------------------------------------------------------

create table if not exists ledger.stocks (
  id               uuid primary key default gen_random_uuid(),
  household_id     uuid not null references app.households(id) on delete cascade,
  ticker           text not null,
  exchange         text,
  current_holding  numeric(18,6) not null default 0,
  current_price    numeric(14,4),
  average_cost     numeric(14,4),
  currency         text default 'AUD',
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists stocks_household_idx on ledger.stocks(household_id);

drop trigger if exists stocks_updated_at on ledger.stocks;
create trigger stocks_updated_at
  before update on ledger.stocks
  for each row execute function ledger.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. ledger.crypto — per-coin holdings catalog
-- ---------------------------------------------------------------------------

create table if not exists ledger.crypto (
  id               uuid primary key default gen_random_uuid(),
  household_id     uuid not null references app.households(id) on delete cascade,
  symbol           text not null,
  current_holding  numeric(24,8) not null default 0,
  current_price    numeric(18,4),
  average_cost     numeric(18,4),
  currency         text default 'AUD',
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists crypto_household_idx on ledger.crypto(household_id);

drop trigger if exists crypto_updated_at on ledger.crypto;
create trigger crypto_updated_at
  before update on ledger.crypto
  for each row execute function ledger.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. ledger.income_sources — primary SoT (trailing average computed in adapter)
-- ---------------------------------------------------------------------------

create table if not exists ledger.income_sources (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references app.households(id) on delete cascade,
  source          text not null,        -- salary, rental, dividend, business, other
  label           text,
  amount          numeric(14,2) not null,
  cadence         text not null default 'monthly'
                  check (cadence in ('monthly','annual','one_off')),
  starts_on       date,
  ends_on         date,
  recorded_on     date not null default current_date,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists income_household_idx on ledger.income_sources(household_id, recorded_on desc);

drop trigger if exists income_updated_at on ledger.income_sources;
create trigger income_updated_at
  before update on ledger.income_sources
  for each row execute function ledger.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. ledger.expenses — primary SoT for outgoings
-- ---------------------------------------------------------------------------

create table if not exists ledger.expenses (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references app.households(id) on delete cascade,
  category        text not null,        -- housing, transport, food, etc.
  label           text,
  amount          numeric(14,2) not null,
  cadence         text not null default 'monthly'
                  check (cadence in ('monthly','annual','one_off')),
  is_debt_service boolean not null default false,
  recorded_on     date not null default current_date,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists expenses_household_idx on ledger.expenses(household_id, recorded_on desc);

drop trigger if exists expenses_updated_at on ledger.expenses;
create trigger expenses_updated_at
  before update on ledger.expenses
  for each row execute function ledger.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. ledger.assumptions — household-scoped engine assumptions overrides
-- ---------------------------------------------------------------------------

create table if not exists ledger.assumptions (
  household_id            uuid primary key references app.households(id) on delete cascade,
  inflation_rate          numeric(6,4),
  wage_growth_rate        numeric(6,4),
  property_growth_rate    numeric(6,4),
  equity_return_rate      numeric(6,4),
  crypto_return_rate      numeric(6,4),
  super_return_rate       numeric(6,4),
  cash_rate               numeric(6,4),
  horizon_years           int default 10,
  monte_carlo_runs        int default 500,
  fat_tails               boolean default true,
  updated_at              timestamptz not null default now()
);

drop trigger if exists assumptions_updated_at on ledger.assumptions;
create trigger assumptions_updated_at
  before update on ledger.assumptions
  for each row execute function ledger.set_updated_at();

-- ---------------------------------------------------------------------------
-- 8. ledger.timeline_events — planned events (settlements, sales, goal dates)
-- ---------------------------------------------------------------------------

create table if not exists ledger.timeline_events (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references app.households(id) on delete cascade,
  kind            text not null,        -- purchase, sale, retire, milestone
  label           text not null,
  occurs_on       date not null,
  amount          numeric(14,2),
  ref_table       text,                 -- e.g. 'properties' | 'stocks'
  ref_id          uuid,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists timeline_household_idx on ledger.timeline_events(household_id, occurs_on);

drop trigger if exists timeline_updated_at on ledger.timeline_events;
create trigger timeline_updated_at
  before update on ledger.timeline_events
  for each row execute function ledger.set_updated_at();

-- ---------------------------------------------------------------------------
-- audit.data_change_log — append-only mutation trail across ledger.*
-- ---------------------------------------------------------------------------

create table if not exists audit.data_change_log (
  id            bigserial primary key,
  occurred_at   timestamptz not null default now(),
  household_id  uuid,
  user_id       uuid,
  schema_name   text not null,
  table_name    text not null,
  row_id        uuid,
  action        text not null check (action in ('insert','update','delete')),
  diff          jsonb not null default '{}'::jsonb
);

create index if not exists data_change_household_idx
  on audit.data_change_log(household_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- RLS — every ledger table is household-scoped. audit is read-self via household.
-- ---------------------------------------------------------------------------

alter table ledger.snapshot         enable row level security;
alter table ledger.properties       enable row level security;
alter table ledger.stocks           enable row level security;
alter table ledger.crypto           enable row level security;
alter table ledger.income_sources   enable row level security;
alter table ledger.expenses         enable row level security;
alter table ledger.assumptions      enable row level security;
alter table ledger.timeline_events  enable row level security;
alter table audit.data_change_log   enable row level security;

-- Helper: identical 4-policy pattern (select/insert/update/delete) on a
-- household-scoped table. Generated inline for transparency.

-- snapshot
drop policy if exists snapshot_select on ledger.snapshot;
create policy snapshot_select on ledger.snapshot
  for select using (app.is_household_member(household_id));
drop policy if exists snapshot_insert on ledger.snapshot;
create policy snapshot_insert on ledger.snapshot
  for insert with check (app.is_household_member(household_id));
drop policy if exists snapshot_update on ledger.snapshot;
create policy snapshot_update on ledger.snapshot
  for update using (app.is_household_member(household_id))
             with check (app.is_household_member(household_id));
drop policy if exists snapshot_delete on ledger.snapshot;
create policy snapshot_delete on ledger.snapshot
  for delete using (app.is_household_member(household_id));

-- properties
drop policy if exists properties_select on ledger.properties;
create policy properties_select on ledger.properties
  for select using (app.is_household_member(household_id));
drop policy if exists properties_insert on ledger.properties;
create policy properties_insert on ledger.properties
  for insert with check (app.is_household_member(household_id));
drop policy if exists properties_update on ledger.properties;
create policy properties_update on ledger.properties
  for update using (app.is_household_member(household_id))
             with check (app.is_household_member(household_id));
drop policy if exists properties_delete on ledger.properties;
create policy properties_delete on ledger.properties
  for delete using (app.is_household_member(household_id));

-- stocks
drop policy if exists stocks_select on ledger.stocks;
create policy stocks_select on ledger.stocks
  for select using (app.is_household_member(household_id));
drop policy if exists stocks_insert on ledger.stocks;
create policy stocks_insert on ledger.stocks
  for insert with check (app.is_household_member(household_id));
drop policy if exists stocks_update on ledger.stocks;
create policy stocks_update on ledger.stocks
  for update using (app.is_household_member(household_id))
             with check (app.is_household_member(household_id));
drop policy if exists stocks_delete on ledger.stocks;
create policy stocks_delete on ledger.stocks
  for delete using (app.is_household_member(household_id));

-- crypto
drop policy if exists crypto_select on ledger.crypto;
create policy crypto_select on ledger.crypto
  for select using (app.is_household_member(household_id));
drop policy if exists crypto_insert on ledger.crypto;
create policy crypto_insert on ledger.crypto
  for insert with check (app.is_household_member(household_id));
drop policy if exists crypto_update on ledger.crypto;
create policy crypto_update on ledger.crypto
  for update using (app.is_household_member(household_id))
             with check (app.is_household_member(household_id));
drop policy if exists crypto_delete on ledger.crypto;
create policy crypto_delete on ledger.crypto
  for delete using (app.is_household_member(household_id));

-- income_sources
drop policy if exists income_select on ledger.income_sources;
create policy income_select on ledger.income_sources
  for select using (app.is_household_member(household_id));
drop policy if exists income_insert on ledger.income_sources;
create policy income_insert on ledger.income_sources
  for insert with check (app.is_household_member(household_id));
drop policy if exists income_update on ledger.income_sources;
create policy income_update on ledger.income_sources
  for update using (app.is_household_member(household_id))
             with check (app.is_household_member(household_id));
drop policy if exists income_delete on ledger.income_sources;
create policy income_delete on ledger.income_sources
  for delete using (app.is_household_member(household_id));

-- expenses
drop policy if exists expenses_select on ledger.expenses;
create policy expenses_select on ledger.expenses
  for select using (app.is_household_member(household_id));
drop policy if exists expenses_insert on ledger.expenses;
create policy expenses_insert on ledger.expenses
  for insert with check (app.is_household_member(household_id));
drop policy if exists expenses_update on ledger.expenses;
create policy expenses_update on ledger.expenses
  for update using (app.is_household_member(household_id))
             with check (app.is_household_member(household_id));
drop policy if exists expenses_delete on ledger.expenses;
create policy expenses_delete on ledger.expenses
  for delete using (app.is_household_member(household_id));

-- assumptions
drop policy if exists assumptions_select on ledger.assumptions;
create policy assumptions_select on ledger.assumptions
  for select using (app.is_household_member(household_id));
drop policy if exists assumptions_insert on ledger.assumptions;
create policy assumptions_insert on ledger.assumptions
  for insert with check (app.is_household_member(household_id));
drop policy if exists assumptions_update on ledger.assumptions;
create policy assumptions_update on ledger.assumptions
  for update using (app.is_household_member(household_id))
             with check (app.is_household_member(household_id));
drop policy if exists assumptions_delete on ledger.assumptions;
create policy assumptions_delete on ledger.assumptions
  for delete using (app.is_household_member(household_id));

-- timeline_events
drop policy if exists timeline_select on ledger.timeline_events;
create policy timeline_select on ledger.timeline_events
  for select using (app.is_household_member(household_id));
drop policy if exists timeline_insert on ledger.timeline_events;
create policy timeline_insert on ledger.timeline_events
  for insert with check (app.is_household_member(household_id));
drop policy if exists timeline_update on ledger.timeline_events;
create policy timeline_update on ledger.timeline_events
  for update using (app.is_household_member(household_id))
             with check (app.is_household_member(household_id));
drop policy if exists timeline_delete on ledger.timeline_events;
create policy timeline_delete on ledger.timeline_events
  for delete using (app.is_household_member(household_id));

-- audit.data_change_log: read-only for household members, no client writes
drop policy if exists data_change_select on audit.data_change_log;
create policy data_change_select on audit.data_change_log
  for select using (
    household_id is not null and app.is_household_member(household_id)
  );

-- ---------------------------------------------------------------------------
-- Grants — expose to authenticated for read+write; service-role for audit.
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on
  ledger.snapshot, ledger.properties, ledger.stocks, ledger.crypto,
  ledger.income_sources, ledger.expenses, ledger.assumptions,
  ledger.timeline_events
  to authenticated;

grant select on audit.data_change_log to authenticated;
grant insert on audit.data_change_log to service_role;
grant usage on sequence audit.data_change_log_id_seq to service_role;
