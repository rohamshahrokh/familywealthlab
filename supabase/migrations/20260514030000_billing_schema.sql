-- ============================================================================
-- billing schema — Phase 2F+ scaffolding
--
-- Provisions the `billing.subscriptions` table that `getEntitlements()` reads
-- from. The actual Stripe checkout + webhook is delivered in a follow-up PR.
-- This migration creates the storage so the entitlement lookup path is
-- production-ready even on Free tier.
-- ============================================================================

create schema if not exists billing;

-- Locked-down subscription tier enum. Adding a tier later is a new migration.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_tier') then
    create type billing.subscription_tier as enum ('free', 'plus', 'pro');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type billing.subscription_status as enum (
      'trialing', 'active', 'past_due', 'canceled', 'incomplete'
    );
  end if;
end $$;

create table if not exists billing.subscriptions (
  household_id           uuid primary key references app.households(id) on delete cascade,
  tier                   billing.subscription_tier not null default 'free',
  status                 billing.subscription_status not null default 'active',
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  trial_end              timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_tier_idx on billing.subscriptions (tier);
create index if not exists subscriptions_stripe_sub_idx on billing.subscriptions (stripe_subscription_id);

-- updated_at trigger
create or replace function billing.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists subscriptions_updated_at on billing.subscriptions;
create trigger subscriptions_updated_at
  before update on billing.subscriptions
  for each row execute function billing.set_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table billing.subscriptions enable row level security;

-- Members of a household can read their subscription.
drop policy if exists subscriptions_select on billing.subscriptions;
create policy subscriptions_select
  on billing.subscriptions
  for select
  using ( app.is_household_member(household_id) );

-- Writes (insert/update/delete) are service-role only — the Stripe webhook
-- lives in a Next route handler that uses the service client. No client-side
-- mutation of subscription state is permitted.
drop policy if exists subscriptions_no_client_write on billing.subscriptions;
create policy subscriptions_no_client_write
  on billing.subscriptions
  for all
  using (false)
  with check (false);

-- Service role bypasses RLS entirely so the webhook keeps working.

-- ── Convenience read helper ─────────────────────────────────────────────────
-- Returns the effective tier for the calling user's household, defaulting to
-- 'free' when no row exists yet. Used by the UI fallback in
-- `src/lib/billing/entitlements.ts`.
create or replace function billing.effective_tier(p_household uuid)
returns billing.subscription_tier
language sql
stable
as $$
  select coalesce(
    (select tier from billing.subscriptions where household_id = p_household),
    'free'::billing.subscription_tier
  );
$$;

grant usage on schema billing to authenticated, service_role;
grant select on billing.subscriptions to authenticated;
grant all on billing.subscriptions to service_role;
grant execute on function billing.effective_tier(uuid) to authenticated, service_role;
