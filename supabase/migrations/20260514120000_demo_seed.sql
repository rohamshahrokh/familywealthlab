-- Family Wealth Lab — Demo Seed
-- ---------------------------------------------------------------------------
-- Run AFTER 20260601000000_ledger.sql.
--
-- Creates ledger.seed_demo_household(household_id uuid) — a SECURITY DEFINER
-- function that populates an empty household with the canonical "Alex & Sara
-- Johnson — Brisbane QLD" demo dataset ported verbatim from the original
-- Family Wealth Lab personal app (shahrokh-family-financial-planner).
--
-- Policy decision (logged in change report): per user direction on
-- 2026-05-14, every NEW household is auto-seeded with demo data on first
-- workspace load. Users overwrite as they enter their own real data. This
-- supersedes the prior "honesty principle" empty-state-only rule.
--
-- The seed is idempotent — it inserts only if the household has zero rows
-- across ledger.snapshot, ledger.properties, ledger.stocks, ledger.crypto,
-- ledger.income_sources, ledger.expenses, ledger.timeline_events.
-- ---------------------------------------------------------------------------

create or replace function ledger.seed_demo_household(p_household_id uuid)
  returns void
  language plpgsql
  security definer
  set search_path = ledger, app, public
as $$
declare
  v_existing int;
  v_today date := current_date;
begin
  -- Guard: only seed empty households.
  select
    (select count(*) from ledger.snapshot         where household_id = p_household_id)
  + (select count(*) from ledger.properties       where household_id = p_household_id)
  + (select count(*) from ledger.stocks           where household_id = p_household_id)
  + (select count(*) from ledger.crypto           where household_id = p_household_id)
  + (select count(*) from ledger.income_sources   where household_id = p_household_id)
  + (select count(*) from ledger.expenses         where household_id = p_household_id)
  + (select count(*) from ledger.timeline_events  where household_id = p_household_id)
  into v_existing;

  if v_existing > 0 then
    return;
  end if;

  -- ─── Snapshot ──────────────────────────────────────────────────────────
  insert into ledger.snapshot (
    household_id, as_of,
    household_size, retirement_target_year,
    monthly_income, roham_monthly_income, fara_monthly_income, rental_income_total, other_income,
    monthly_expenses, expenses_include_debt,
    cash_balance, emergency_fund_target,
    ppor, mortgage, mortgage_rate, mortgage_term_years,
    other_debts,
    stocks, crypto, super_combined,
    tax_regime, marginal_tax_rate,
    notes
  ) values (
    p_household_id, v_today,
    4, 2044,
    18000, 12500, 5500, 2000, 0,
    11200, true,
    20000, 30000,
    1200000, 850000, 0.0624, 30,
    14500,
    62000, 18500, 160000,
    'AU', 0.3700,
    'Demo household — Alex & Sara Johnson, Brisbane QLD. Auto-seeded; overwrite as you enter real data.'
  );

  -- ─── Properties ────────────────────────────────────────────────────────
  insert into ledger.properties (household_id, name, type, purchase_price, current_value, loan_amount, interest_rate, loan_term_years, settlement_date, rental_income, expenses, notes) values
    (p_household_id, 'PPOR — Brookfield Ave, Kenmore',           'ppor',       780000,  1200000, 850000, 0.0624, 30, '2019-06-15', 0,    633,  'Family home — purchased 2019 at 80% LVR. Current LVR ~71%. Offset balance $95K.'),
    (p_household_id, 'IP1 — Everton Park (planned 2027)',        'investment', 750000,  750000,  600000, 0.0650, 30, '2027-03-01', 2817, 833,  'Planned IP purchase 2027. Brisbane northside. IO loan. Est. 5% capital growth, 3% rental growth, 3% vacancy.');

  -- ─── Stocks (ASX ETF core) ─────────────────────────────────────────────
  insert into ledger.stocks (household_id, ticker, exchange, current_holding, current_price, average_cost, currency, notes) values
    (p_household_id, 'VAS',  'ASX', 200, 98.50,  88.00,  'AUD', 'Vanguard Australian Shares Index — 40% allocation. Monthly DCA $500.'),
    (p_household_id, 'VGS',  'ASX', 150, 130.20, 118.50, 'AUD', 'Vanguard Global Shares Index — 35% allocation. Monthly DCA $400.'),
    (p_household_id, 'QUAL', 'ASX', 80,  47.80,  42.10,  'AUD', 'iShares MSCI World Quality Factor — 15% allocation. Monthly DCA $200.'),
    (p_household_id, 'NDQ',  'ASX', 60,  42.10,  38.20,  'AUD', 'Betashares NASDAQ 100 — 10% allocation. Monthly DCA $100.');

  -- ─── Crypto ────────────────────────────────────────────────────────────
  insert into ledger.crypto (household_id, symbol, current_holding, current_price, average_cost, currency, notes) values
    (p_household_id, 'BTC', 0.12, 95000, 80500, 'AUD', 'Bitcoin — DCA $200/mo. Started Oct 2024.'),
    (p_household_id, 'ETH', 1.5,  3200,  2980,  'AUD', 'Ethereum — DCA $100/mo. Started Mar 2025.');

  -- ─── Income sources (current state — monthly, as of today) ─────────────
  insert into ledger.income_sources (household_id, source, label, amount, cadence, starts_on, recorded_on, notes) values
    (p_household_id, 'salary',   'Alex monthly salary — net',  12500, 'monthly', '2019-01-01', v_today, 'Tech sector, $150K gross.'),
    (p_household_id, 'salary',   'Sara monthly salary — net',  5500,  'monthly', '2019-01-01', v_today, 'Part-time, $70K gross.'),
    (p_household_id, 'rental',   'Rental income — IP1',        667,   'monthly', '2027-04-01', v_today, '$650/wk weekly. Starts at IP1 settlement.'),
    (p_household_id, 'dividend', 'ETF dividends (est. annual)', 7400, 'annual',  '2025-01-01', v_today, 'VAS + VGS estimated yield ~3.5% combined.'),
    (p_household_id, 'one_off',  'ATO tax refund — FY2024-25', 6600,  'one_off', '2025-08-15', '2025-08-15', 'Alex + Sara combined.');

  -- ─── Expenses (recurring lines — monthly cadence by default) ──────────
  insert into ledger.expenses (household_id, category, label, amount, cadence, is_debt_service, recorded_on, notes) values
    (p_household_id, 'Housing / Mortgage',   'Home loan repayment',         3400, 'monthly', true,  v_today, 'CBA P&I — Brookfield Ave.'),
    (p_household_id, 'Childcare',            'Daycare — 2 kids',            1800, 'monthly', false, v_today, 'Goodstart Early Learning.'),
    (p_household_id, 'Groceries',            'Weekly groceries',            1200, 'monthly', false, v_today, 'Coles + Aldi weekly.'),
    (p_household_id, 'Dining Out / Coffee',  'Restaurants & cafes',         800,  'monthly', false, v_today, 'Date nights + family meals.'),
    (p_household_id, 'Utilities',            'Electricity & gas',           380,  'monthly', false, v_today, 'Origin Energy.'),
    (p_household_id, 'Insurance',            'Home & car insurance',        420,  'monthly', false, v_today, 'NRMA combined policy.'),
    (p_household_id, 'Subscriptions',        'Netflix + Disney+',           45,   'monthly', false, v_today, 'Streaming.'),
    (p_household_id, 'Fitness',              'Gym memberships x2',          120,  'monthly', false, v_today, 'F45 + Yoga.'),
    (p_household_id, 'Transport / Fuel',     'Fuel & parking',              200,  'monthly', false, v_today, 'Two vehicles.'),
    (p_household_id, 'Health / Medical',     'Health expenses (avg)',       150,  'monthly', false, v_today, 'GP visits, pharmacy.'),
    (p_household_id, 'Shopping',             'Discretionary shopping',      400,  'monthly', false, v_today, 'Clothes, household items.'),
    (p_household_id, 'Entertainment',        'Entertainment & outings',     200,  'monthly', false, v_today, 'Movies, attractions.'),
    (p_household_id, 'Kids Expenses',        'Kids extras (sports/clubs)',  185,  'monthly', false, v_today, 'Excludes daycare and school fees.'),
    -- annual / quarterly recurring
    (p_household_id, 'Council Rates',        'Brisbane City Council rates', 2200, 'annual',  false, v_today, 'Brisbane City Council — PPOR.'),
    (p_household_id, 'Education',            'School fees (x2 kids)',       9600, 'annual',  false, v_today, 'State school + sport levy. ~$2,400/term × 4.'),
    (p_household_id, 'Transport / Fuel',     'Car registration (x2)',       650,  'annual',  false, v_today, 'Both vehicles.'),
    (p_household_id, 'Insurance',            'Income protection (Alex)',    900,  'annual',  false, v_today, 'Outside super.');

  -- ─── Assumptions ──────────────────────────────────────────────────────
  insert into ledger.assumptions (
    household_id, inflation_rate, wage_growth_rate, property_growth_rate,
    equity_return_rate, crypto_return_rate, super_return_rate, cash_rate,
    horizon_years, monte_carlo_runs, fat_tails
  ) values (
    p_household_id, 0.025, 0.030, 0.055,
    0.095, 0.200, 0.075, 0.042,
    20, 500, true
  );

  -- ─── Timeline events ──────────────────────────────────────────────────
  insert into ledger.timeline_events (household_id, kind, label, occurs_on, amount, ref_table, notes) values
    (p_household_id, 'milestone', 'Bought PPOR (Kenmore)',                '2019-06-15', 780000,  'properties', 'Purchased at 80% LVR.'),
    (p_household_id, 'milestone', 'Offset account opened',                '2024-02-01', 50000,   null,         'CBA offset linked to home loan.'),
    (p_household_id, 'milestone', 'Started ETF DCA strategy',             '2025-01-15', 1200,    'stocks',     'VAS + VGS + QUAL + NDQ monthly DCA total $1,200.'),
    (p_household_id, 'milestone', 'Tax refund reinvested',                '2025-08-20', 5200,    'stocks',     '2024-25 ATO refund deployed into VGS lump sum.'),
    (p_household_id, 'milestone', 'Mortgage refinance',                   '2026-03-01', -4000,   null,         'Refinanced at 5.85% fixed 2yr — saves ~$4K/year.'),
    (p_household_id, 'purchase',  'Buy Investment Property 1',            '2027-03-01', 750000,  'properties', 'Everton Park — $750K, IO loan $600K, $650/wk rent.'),
    (p_household_id, 'milestone', 'IP1 negative gearing benefit',         '2028-08-15', 6800,    null,         'Estimated annual tax benefit from IP1 losses.'),
    (p_household_id, 'purchase',  'Buy Investment Property 2',            '2029-06-01', 650000,  'properties', 'Target: Logan area, 7% yield. Second IP.'),
    (p_household_id, 'milestone', 'Super salary sacrifice increase',      '2030-01-01', 24000,   null,         'Alex increases SS to $2K/mo post IP2 purchase.'),
    (p_household_id, 'milestone', 'Both kids in high school',             '2032-01-01', 21600,   null,         'Childcare costs end. Surplus rises by $1,800/mo.'),
    (p_household_id, 'milestone', 'IP1 IO→P&I switch',                    '2035-03-01', 0,       'properties', 'IP1 IO period ends. Switch to P&I. LVR at ~55%.'),
    (p_household_id, 'milestone', 'PPOR paid off',                        '2038-06-15', 0,       'properties', 'Home loan cleared. $3,400/mo freed.'),
    (p_household_id, 'retire',    'FIRE — semi-retirement target',        '2040-06-01', 108000,  null,         '$9K/mo passive income target. Semi-FIRE.'),
    (p_household_id, 'retire',    'Full retirement — Alex age 55',        '2044-06-01', 3200000, null,         'Portfolio projected $3.2M. 4% SWR = $128K/yr.');
end $$;

revoke all on function ledger.seed_demo_household(uuid) from public;
grant execute on function ledger.seed_demo_household(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Auto-seed trigger: when a new household is created, seed it with demo data.
-- This runs as SECURITY DEFINER so it works inside the household-creation
-- transaction even before RLS context is fully populated.
-- ---------------------------------------------------------------------------

create or replace function app.seed_household_on_create() returns trigger
  language plpgsql
  security definer
  set search_path = ledger, app, public
as $$
begin
  perform ledger.seed_demo_household(new.id);
  return new;
end $$;

drop trigger if exists households_auto_seed on app.households;
create trigger households_auto_seed
  after insert on app.households
  for each row execute function app.seed_household_on_create();

-- ---------------------------------------------------------------------------
-- Backfill: seed every EXISTING empty household so current users see the demo.
-- ---------------------------------------------------------------------------

do $$
declare
  h record;
begin
  for h in select id from app.households loop
    perform ledger.seed_demo_household(h.id);
  end loop;
end $$;
