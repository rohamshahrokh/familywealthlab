-- ---------------------------------------------------------------------------
-- Family Wealth Lab — ledger.properties smoke test
-- ---------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor *while signed in as the same user as the
-- app*. It verifies the ledger schema is reachable, RLS allows household
-- members to insert, and the column shape matches what the server action sends.
--
-- Usage:
--   1. Open Supabase Dashboard → SQL Editor.
--   2. Paste this entire file.
--   3. Replace :household_id with a real household UUID you belong to.
--   4. Run. Expect a single inserted row, then it is rolled back so nothing
--      persists.
--
-- If any step fails, the message tells you exactly which check failed.
-- ---------------------------------------------------------------------------

begin;

-- 1. Schema reachable + table exists?
do $$
begin
  if not exists (
    select 1
    from   information_schema.tables
    where  table_schema = 'ledger'
    and    table_name   = 'properties'
  ) then
    raise exception 'ledger.properties does not exist — apply 20260601000000_ledger.sql';
  end if;
end $$;

-- 2. ledger schema is granted to authenticated?
do $$
begin
  if not exists (
    select 1
    from   information_schema.role_table_grants
    where  table_schema = 'ledger'
    and    table_name   = 'properties'
    and    grantee      = 'authenticated'
    and    privilege_type = 'INSERT'
  ) then
    raise exception 'authenticated role missing INSERT grant on ledger.properties';
  end if;
end $$;

-- 3. RLS is enabled?
do $$
declare
  rls_on boolean;
begin
  select c.relrowsecurity
  into   rls_on
  from   pg_class c
  join   pg_namespace n on n.oid = c.relnamespace
  where  n.nspname = 'ledger' and c.relname = 'properties';

  if not rls_on then
    raise exception 'RLS is not enabled on ledger.properties';
  end if;
end $$;

-- 4. Insert one row using the same column shape the server action sends.
--    Replace the household_id literal below with one you belong to.
insert into ledger.properties (
  household_id,
  name,
  type,
  purchase_price,
  current_value,
  loan_amount,
  interest_rate,
  loan_term_years,
  settlement_date,
  rental_income,
  expenses,
  notes
)
values (
  '00000000-0000-0000-0000-000000000000'::uuid,  -- ← REPLACE with your household_id
  'Smoke test — Acacia St',
  'investment',
  850000,
  950000,
  620000,
  0.0625,
  30,
  '2024-06-15',
  2800,
  650,
  'inserted by properties_smoke_test.sql'
)
returning id, household_id, name, type, settlement_date;

-- 5. Roll back so the smoke row never persists.
rollback;
