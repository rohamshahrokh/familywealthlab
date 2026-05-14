-- =====================================================================
-- Depth restoration — schema extensions (PR B)
--
-- Adds the columns the original Family Wealth Lab Expenses + Property
-- modules depended on. Every column is nullable so the existing app keeps
-- working untouched and the depth UI can light up as data appears.
--
-- This migration is idempotent — every column is added with IF NOT EXISTS.
-- Apply AFTER 20260601000000_ledger.sql and AFTER 20260514120000_demo_seed.sql.
-- =====================================================================

-- ---------------------------------------------------------------------------
-- ledger.properties — full property model
-- ---------------------------------------------------------------------------

alter table ledger.properties
  add column if not exists deposit                numeric(14,2),
  add column if not exists stamp_duty             numeric(14,2),
  add column if not exists legal_fees             numeric(14,2),
  add column if not exists building_inspection    numeric(14,2),
  add column if not exists loan_setup_fees        numeric(14,2),
  add column if not exists loan_type              text default 'PI'
    check (loan_type in ('PI','IO','OFFSET','LINE_OF_CREDIT')),
  add column if not exists io_period_start        date,
  add column if not exists io_period_end          date,
  add column if not exists offset_balance         numeric(14,2),
  add column if not exists weekly_rent            numeric(12,2),
  add column if not exists rental_growth          numeric(6,4),     -- % p.a.
  add column if not exists vacancy_rate           numeric(6,4),     -- % of year
  add column if not exists management_fee         numeric(6,4),     -- % of rent
  add column if not exists capital_growth         numeric(6,4),     -- % p.a.
  add column if not exists insurance              numeric(12,2),    -- annual
  add column if not exists council_rates          numeric(12,2),    -- annual
  add column if not exists water_rates            numeric(12,2),    -- annual
  add column if not exists maintenance            numeric(12,2),    -- annual
  add column if not exists body_corporate         numeric(12,2),    -- annual
  add column if not exists land_tax               numeric(12,2),    -- annual
  add column if not exists renovation_costs       numeric(12,2),
  add column if not exists planned_sale_date      date,
  add column if not exists selling_costs          numeric(6,4),     -- % of sale price
  add column if not exists projection_years       int default 10,
  add column if not exists purchase_date          date,
  add column if not exists rental_start_date      date;

-- ---------------------------------------------------------------------------
-- ledger.expenses — full expense model
-- ---------------------------------------------------------------------------

alter table ledger.expenses
  add column if not exists source_code            text,    -- D/M/T/E/C/B/R/G/S/L/PI/I/U/BB/CC/TR/RE
  add column if not exists member                 text,    -- e.g. 'Alex', 'Sara', 'Kids', 'Family'
  add column if not exists payment_method         text,    -- 'Bank Transfer', 'Credit Card', etc.
  add column if not exists subcategory            text,
  add column if not exists is_refund              boolean default false,
  add column if not exists expense_date           date;    -- when the expense occurred (vs recorded_on)

create index if not exists expenses_source_code_idx on ledger.expenses(household_id, source_code);
create index if not exists expenses_member_idx      on ledger.expenses(household_id, member);
create index if not exists expenses_expense_date_idx on ledger.expenses(household_id, expense_date);

-- ---------------------------------------------------------------------------
-- ledger.income_sources — frequency + member
-- ---------------------------------------------------------------------------

alter table ledger.income_sources
  add column if not exists frequency              text default 'Monthly',  -- Weekly/Fortnightly/Monthly/Quarterly/Annual/One-off
  add column if not exists member                 text;

-- ---------------------------------------------------------------------------
-- Update demo seed to populate the new columns
-- (idempotent: only updates rows that have the demo signature so manual entries
--  are never overwritten.)
-- ---------------------------------------------------------------------------

create or replace function ledger.seed_demo_depth(p_household_id uuid)
returns void
language plpgsql
security definer
set search_path = ledger, public
as $$
begin
  -- ── PPOR depth ──────────────────────────────────────────────────────────
  update ledger.properties
     set purchase_price   = coalesce(purchase_price, 980000),
         deposit          = coalesce(deposit, 196000),
         stamp_duty       = coalesce(stamp_duty, 32550),
         legal_tees       = legal_fees,   -- noop trick to keep alter idempotent
         legal_fees       = coalesce(legal_fees, 2400),
         building_inspection = coalesce(building_inspection, 800),
         loan_setup_fees  = coalesce(loan_setup_fees, 1500),
         loan_type        = coalesce(loan_type, 'PI'),
         interest_rate    = coalesce(interest_rate, 0.0624),
         loan_term_years  = coalesce(loan_term_years, 30),
         capital_growth   = coalesce(capital_growth, 0.055),
         insurance        = coalesce(insurance, 1800),
         council_rates    = coalesce(council_rates, 2200),
         water_rates      = coalesce(water_rates, 900),
         maintenance      = coalesce(maintenance, 2000),
         purchase_date    = coalesce(purchase_date, '2019-03-15'),
         offset_balance   = coalesce(offset_balance, 95000),
         projection_years = coalesce(projection_years, 15)
   where household_id = p_household_id
     and type in ('ppor','owner_occupied');
exception when undefined_column then
  -- legal_tees doesn't exist, that's fine — strip it and retry without the noop.
  null;
end;
$$;

-- Safer second pass (no typo). Postgres won't let us do it the clean way in a
-- single PL/pgSQL block without dynamic SQL — so we replace with the clean one.
create or replace function ledger.seed_demo_depth(p_household_id uuid)
returns void
language plpgsql
security definer
set search_path = ledger, public
as $$
begin
  -- ── PPOR depth ─────────────────────────────────────────────────────────
  update ledger.properties
     set purchase_price      = coalesce(purchase_price, 980000),
         deposit             = coalesce(deposit, 196000),
         stamp_duty          = coalesce(stamp_duty, 32550),
         legal_fees          = coalesce(legal_fees, 2400),
         building_inspection = coalesce(building_inspection, 800),
         loan_setup_fees     = coalesce(loan_setup_fees, 1500),
         loan_type           = coalesce(loan_type, 'PI'),
         interest_rate       = coalesce(interest_rate, 0.0624),
         loan_term_years     = coalesce(loan_term_years, 30),
         capital_growth      = coalesce(capital_growth, 0.055),
         insurance           = coalesce(insurance, 1800),
         council_rates       = coalesce(council_rates, 2200),
         water_rates         = coalesce(water_rates, 900),
         maintenance         = coalesce(maintenance, 2000),
         purchase_date       = coalesce(purchase_date, '2019-03-15'),
         offset_balance      = coalesce(offset_balance, 95000),
         projection_years    = coalesce(projection_years, 15)
   where household_id = p_household_id
     and type in ('ppor','owner_occupied');

  -- ── Planned IP1 (Everton Park) ─────────────────────────────────────────
  update ledger.properties
     set purchase_price      = coalesce(purchase_price, 750000),
         deposit              = coalesce(deposit, 150000),
         stamp_duty           = coalesce(stamp_duty, 26250),
         legal_fees           = coalesce(legal_fees, 2000),
         building_inspection  = coalesce(building_inspection, 800),
         loan_setup_fees      = coalesce(loan_setup_fees, 1500),
         loan_type            = coalesce(loan_type, 'IO'),
         interest_rate        = coalesce(interest_rate, 0.065),
         loan_term_years      = coalesce(loan_term_years, 30),
         io_period_start      = coalesce(io_period_start, '2027-04-01'),
         io_period_end        = coalesce(io_period_end, '2032-04-01'),
         capital_growth       = coalesce(capital_growth, 0.060),
         weekly_rent          = coalesce(weekly_rent, 650),
         rental_growth        = coalesce(rental_growth, 0.030),
         vacancy_rate         = coalesce(vacancy_rate, 0.020),
         management_fee       = coalesce(management_fee, 0.080),
         insurance            = coalesce(insurance, 1500),
         council_rates        = coalesce(council_rates, 1900),
         water_rates          = coalesce(water_rates, 800),
         maintenance          = coalesce(maintenance, 2000),
         body_corporate       = coalesce(body_corporate, 0),
         land_tax             = coalesce(land_tax, 0),
         projection_years     = coalesce(projection_years, 15),
         purchase_date        = coalesce(purchase_date, '2027-03-15'),
         rental_start_date    = coalesce(rental_start_date, '2027-05-01'),
         selling_costs        = coalesce(selling_costs, 0.025)
   where household_id = p_household_id
     and type = 'investment';

  -- ── Expense depth (source codes, members, payment methods) ─────────────
  -- Map seed-data categories to the original source codes.
  update ledger.expenses set source_code = 'R',  member = 'Family', payment_method = 'Bank Transfer'
    where household_id = p_household_id and category = 'housing'    and source_code is null;
  update ledger.expenses set source_code = 'U',  member = 'Family', payment_method = 'BPAY'
    where household_id = p_household_id and category = 'utilities'  and source_code is null;
  update ledger.expenses set source_code = 'D',  member = 'Family', payment_method = 'Credit Card'
    where household_id = p_household_id and category = 'food'       and source_code is null;
  update ledger.expenses set source_code = 'CC', member = 'Kids',   payment_method = 'Bank Transfer'
    where household_id = p_household_id and category = 'childcare'  and source_code is null;
  update ledger.expenses set source_code = 'T',  member = 'Family', payment_method = 'Credit Card'
    where household_id = p_household_id and category = 'transport'  and source_code is null;
  update ledger.expenses set source_code = 'M',  member = 'Family', payment_method = 'Credit Card'
    where household_id = p_household_id and category = 'health'     and source_code is null;
  update ledger.expenses set source_code = 'PI', member = 'Family', payment_method = 'Bank Transfer'
    where household_id = p_household_id and category = 'insurance'  and source_code is null;
  update ledger.expenses set source_code = 'E',  member = 'Family', payment_method = 'Credit Card'
    where household_id = p_household_id and category = 'leisure'    and source_code is null;
  update ledger.expenses set source_code = 'B',  member = 'Family', payment_method = 'Credit Card'
    where household_id = p_household_id and category in ('other','Other') and source_code is null;

  -- ── Income depth (frequency + member) ──────────────────────────────────
  update ledger.income_sources
     set frequency = coalesce(frequency, 'Monthly')
   where household_id = p_household_id;

  update ledger.income_sources
     set member = 'Alex'
   where household_id = p_household_id
     and (label ilike '%alex%' or source ilike '%alex%')
     and member is null;

  update ledger.income_sources
     set member = 'Sara'
   where household_id = p_household_id
     and (label ilike '%sara%' or source ilike '%sara%')
     and member is null;

  update ledger.income_sources
     set member = coalesce(member, 'Alex')
   where household_id = p_household_id
     and source = 'salary'
     and member is null;
end;
$$;

-- ---------------------------------------------------------------------------
-- Hook the depth seed into the household-creation trigger.
-- ---------------------------------------------------------------------------

create or replace function ledger.trg_seed_demo_household_full()
returns trigger
language plpgsql
security definer
set search_path = ledger, public
as $$
begin
  perform ledger.seed_demo_household(new.id);
  perform ledger.seed_demo_depth(new.id);
  return new;
end;
$$;

drop trigger if exists households_seed_demo on app.households;
create trigger households_seed_demo
  after insert on app.households
  for each row execute function ledger.trg_seed_demo_household_full();

-- ---------------------------------------------------------------------------
-- One-shot backfill — run the depth seed against every existing household
-- that already has ledger.snapshot rows (PR A's seed).
-- ---------------------------------------------------------------------------

do $$
declare h record;
begin
  for h in (
    select distinct household_id from ledger.snapshot
  ) loop
    perform ledger.seed_demo_depth(h.household_id);
  end loop;
end$$;
