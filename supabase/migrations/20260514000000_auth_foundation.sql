-- Family Wealth Lab — Commercial Auth Foundation
-- ---------------------------------------------------------------------------
-- Run this migration on the **new** fwl-commercial Supabase project ONLY.
-- Do NOT run it against the live/personal-use project.
--
-- Creates:
--   schema `app`        — household + profile data
--   schema `audit`      — append-only audit trail
--   helpers             — household membership + MFA checks for RLS
--   trigger             — auto-provisions profile+household on auth signup
--   RLS                 — every table; users only see their household
-- ---------------------------------------------------------------------------

create schema if not exists app;
create schema if not exists audit;

-- ---------------------------------------------------------------------------
-- Helper functions live in `app` so RLS can reference them.
-- ---------------------------------------------------------------------------

create or replace function app.current_user_id() returns uuid
  language sql stable as $$ select auth.uid() $$;

create or replace function app.is_mfa_verified() returns boolean
  language sql stable as $$
    select coalesce((auth.jwt() ->> 'aal') = 'aal2', false)
  $$;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

create table if not exists app.households (
  id           uuid primary key default gen_random_uuid(),
  name         text not null default 'My household',
  country_code text not null default 'AU',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists app.profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  display_name   text,
  household_id   uuid references app.households(id) on delete set null,
  onboarded_at   timestamptz,             -- NULL until /onboarding completes
  last_seen_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists app.household_members (
  household_id uuid not null references app.households(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'owner' check (role in ('owner','member','viewer')),
  joined_at    timestamptz not null default now(),
  primary key (household_id, user_id)
);

create index if not exists household_members_user_idx
  on app.household_members(user_id);

-- ---------------------------------------------------------------------------
-- Audit — append-only auth events.
-- ---------------------------------------------------------------------------

create table if not exists audit.auth_events (
  id          bigserial primary key,
  occurred_at timestamptz not null default now(),
  user_id     uuid,                -- nullable: failed logins may have no user
  email       text,
  event       text not null,       -- 'signup', 'login_success', 'mfa_enrolled', etc.
  ip          inet,
  user_agent  text,
  metadata    jsonb not null default '{}'::jsonb
);

create index if not exists auth_events_user_idx
  on audit.auth_events(user_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- Membership predicate — referenced by RLS on every household-scoped table.
-- ---------------------------------------------------------------------------

create or replace function app.is_household_member(h uuid) returns boolean
  language sql stable security definer set search_path = app, public as $$
    select exists (
      select 1 from app.household_members
      where household_id = h and user_id = auth.uid()
    )
  $$;

-- ---------------------------------------------------------------------------
-- Auto-provision: when a new auth.users row appears, create profile +
-- household + owner membership in one transaction.
-- ---------------------------------------------------------------------------

create or replace function app.handle_new_user() returns trigger
  language plpgsql security definer set search_path = app, public as $$
declare
  new_household_id uuid;
begin
  insert into app.households (name)
    values (coalesce(new.raw_user_meta_data ->> 'household_name', 'My household'))
    returning id into new_household_id;

  insert into app.profiles (user_id, display_name, household_id)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
      new_household_id
    );

  insert into app.household_members (household_id, user_id, role)
    values (new_household_id, new.id, 'owner');

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS — enable + policies.
-- ---------------------------------------------------------------------------

alter table app.households        enable row level security;
alter table app.profiles          enable row level security;
alter table app.household_members enable row level security;
alter table audit.auth_events     enable row level security;

-- profiles: self-only
drop policy if exists profiles_self_select on app.profiles;
create policy profiles_self_select on app.profiles
  for select using (user_id = auth.uid());

drop policy if exists profiles_self_update on app.profiles;
create policy profiles_self_update on app.profiles
  for update using (user_id = auth.uid())
                 with check (user_id = auth.uid());

-- households: visible to members
drop policy if exists households_member_select on app.households;
create policy households_member_select on app.households
  for select using (app.is_household_member(id));

drop policy if exists households_owner_update on app.households;
create policy households_owner_update on app.households
  for update using (
    exists (
      select 1 from app.household_members
      where household_id = app.households.id
        and user_id = auth.uid() and role = 'owner'
    )
  );

-- household_members: members see roster; only owners can add new members
drop policy if exists hm_member_select on app.household_members;
create policy hm_member_select on app.household_members
  for select using (app.is_household_member(household_id));

drop policy if exists hm_owner_insert on app.household_members;
create policy hm_owner_insert on app.household_members
  for insert with check (
    exists (
      select 1 from app.household_members existing
      where existing.household_id = household_members.household_id
        and existing.user_id = auth.uid() and existing.role = 'owner'
    )
  );

drop policy if exists hm_owner_delete on app.household_members;
create policy hm_owner_delete on app.household_members
  for delete using (
    exists (
      select 1 from app.household_members existing
      where existing.household_id = household_members.household_id
        and existing.user_id = auth.uid() and existing.role = 'owner'
    )
  );

-- audit.auth_events: users see only their own rows; no insert/update/delete
-- from the app role (service-role only via the audit helper module).
drop policy if exists auth_events_self_select on audit.auth_events;
create policy auth_events_self_select on audit.auth_events
  for select using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Grants — expose schemas to PostgREST under anon + authenticated.
-- (You also need to add `app` and `audit` to the "Exposed schemas" list in
--  Supabase Dashboard → Settings → API.)
-- ---------------------------------------------------------------------------

grant usage on schema app   to anon, authenticated;
grant usage on schema audit to anon, authenticated;

grant select          on app.households        to authenticated;
grant select, update  on app.profiles          to authenticated;
grant select          on app.household_members to authenticated;
grant insert, delete  on app.household_members to authenticated;
grant select          on audit.auth_events     to authenticated;

-- Service role inserts audit rows; explicit grant for clarity.
grant insert on audit.auth_events to service_role;
grant usage  on sequence audit.auth_events_id_seq to service_role;
