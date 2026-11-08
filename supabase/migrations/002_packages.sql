-- =====================================================================
-- 002 — Pricing packages managed from the dashboard
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run. (Already included in schema.sql for fresh setups.)
-- =====================================================================

create table if not exists public.packages (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null check (char_length(name) between 1 and 60),
  price       text not null check (char_length(price) between 1 and 30),  -- e.g. "$350" or "From $800"
  hours       text,                                                     -- e.g. "2 hours"
  reels       int  check (reels is null or reels between 0 and 100),
  reel_length text,                                                     -- e.g. "15–30 sec"
  ideal       text,                                                     -- one-line pitch under the price
  features    text[] not null default '{}',                             -- extra bullet points
  popular     boolean not null default false,                           -- dark card + "Most booked" badge
  visible     boolean not null default true,                            -- hidden packages stay in the dashboard only
  sort        int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists packages_public_idx on public.packages (visible, sort);

drop trigger if exists packages_touch on public.packages;
create trigger packages_touch before update on public.packages
for each row execute function public.touch_updated_at();

-- Data API grants (works with "Automatically expose new tables" OFF)
revoke all on public.packages from anon, authenticated;
grant select on public.packages to anon;
grant select, insert, update, delete on public.packages to authenticated;

-- Row level security: visitors see visible packages, admins manage all
alter table public.packages enable row level security;

drop policy if exists "packages read visible" on public.packages;
drop policy if exists "packages admin"        on public.packages;
create policy "packages read visible" on public.packages for select
  using (visible or public.is_admin());
create policy "packages admin" on public.packages for all
  using (public.is_admin()) with check (public.is_admin());

-- Seed with the current prices (skipped if they already exist)
insert into public.packages (slug, name, price, hours, reels, reel_length, ideal, features, popular, sort) values
  ('basic',    'Basic',    '$300', '1 hour',  2, '15–30 sec',
   'Perfect for quick projects, social highlights and product showcases.', array['Extra hours available'], false, 1),
  ('standard', 'Standard', '$350', '2 hours', 3, '15–30 sec',
   'Ideal for business promos and event highlights.',                     array['Extra hours available'], true,  2),
  ('premium',  'Premium',  '$500', '4 hours', 4, '15–30 sec',
   'Full coverage for major events and bigger stories.',                  array['Extra hours available'], false, 3)
on conflict (slug) do nothing;
