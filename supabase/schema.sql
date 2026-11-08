-- =====================================================================
-- The K Reaction — Supabase schema
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / ON CONFLICT.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Tables ----------------------------------------------------

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique check (char_length(name) between 1 and 60),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort       int  not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 160),
  client      text,
  description text,
  song        text,                 -- music / track used in the video
  event_date  date,
  cover_path  text,                 -- path in the "media" bucket
  video_path  text,                 -- uploaded file path in the "media" bucket
  video_url   text,                 -- or an external YouTube / Instagram / Vimeo link
  featured    boolean not null default false,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  sort        int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.project_categories (
  project_id  uuid not null references public.projects(id)   on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (project_id, category_id)
);

create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 120),
  email      text check (email is null or char_length(email) <= 200),
  phone      text check (phone is null or char_length(phone) <= 40),
  event_type text check (event_type is null or char_length(event_type) <= 60),
  event_date date,
  package    text check (package is null or char_length(package) <= 40),
  message    text check (message is null or char_length(message) <= 2000),
  status     text not null default 'new' check (status in ('new', 'contacted', 'booked', 'lost')),
  created_at timestamptz not null default now(),
  constraint leads_contact_required check (email is not null or phone is not null)
);

-- Who can use the dashboard. Add a row per admin (see bottom of file).
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists projects_public_idx on public.projects (status, featured desc, sort, created_at desc);
create index if not exists leads_created_idx   on public.leads (created_at desc);

-- keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
for each row execute function public.touch_updated_at();

-- ---------- Admin check ----------------------------------------------

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Data API grants -------------------------------------------
-- Explicit grants, so this works with "Automatically expose new tables" OFF.
-- Row level security below still decides which rows each role can touch.

grant usage on schema public to anon, authenticated;

revoke all on public.categories, public.projects, public.project_categories,
              public.leads, public.admins from anon, authenticated;

grant select on public.categories, public.projects, public.project_categories to anon;
grant insert on public.leads to anon;

grant select, insert, update, delete
  on public.categories, public.projects, public.project_categories, public.leads
  to authenticated;
grant select on public.admins to authenticated;

-- ---------- Row level security ---------------------------------------

alter table public.categories         enable row level security;
alter table public.projects           enable row level security;
alter table public.project_categories enable row level security;
alter table public.leads              enable row level security;
alter table public.admins             enable row level security;

-- categories: everyone reads, admins write
drop policy if exists "categories read"  on public.categories;
drop policy if exists "categories admin" on public.categories;
create policy "categories read"  on public.categories for select using (true);
create policy "categories admin" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- projects: public sees published, admins see and write everything
drop policy if exists "projects read published" on public.projects;
drop policy if exists "projects admin"          on public.projects;
create policy "projects read published" on public.projects for select
  using (status = 'published' or public.is_admin());
create policy "projects admin" on public.projects for all
  using (public.is_admin()) with check (public.is_admin());

-- project_categories: readable when its project is readable
drop policy if exists "project_categories read"  on public.project_categories;
drop policy if exists "project_categories admin" on public.project_categories;
create policy "project_categories read" on public.project_categories for select
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and (p.status = 'published' or public.is_admin())
  ));
create policy "project_categories admin" on public.project_categories for all
  using (public.is_admin()) with check (public.is_admin());

-- leads: anyone can submit a new lead; only admins read / update / delete
drop policy if exists "leads insert" on public.leads;
drop policy if exists "leads admin"  on public.leads;
create policy "leads insert" on public.leads for insert to anon, authenticated
  with check (status = 'new');
create policy "leads admin" on public.leads for all
  using (public.is_admin()) with check (public.is_admin());

-- admins: a user can only see their own row (managed from the SQL editor)
drop policy if exists "admins self" on public.admins;
create policy "admins self" on public.admins for select using (user_id = auth.uid());

-- ---------- Storage: public "media" bucket ----------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true,
  524288000, -- 500 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media public read"  on storage.objects;
drop policy if exists "media admin insert" on storage.objects;
drop policy if exists "media admin update" on storage.objects;
drop policy if exists "media admin delete" on storage.objects;
create policy "media public read"  on storage.objects for select using (bucket_id = 'media');
create policy "media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy "media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ---------- Seed categories (match src/content/site.ts) ---------------

insert into public.categories (name, slug, sort) values
  ('Nightlife',               'nightlife',         1),
  ('Drag queens',             'drag-queens',       2),
  ('Festival',                'festival',          3),
  ('Live set',                'live-set',          4),
  ('DJ',                      'dj',                5),
  ('Podcast',                 'podcast',           6),
  ('Interior design',         'interior-design',   7),
  ('Promo / reels',           'promo',             8),
  ('Behind the scenes',       'behind-the-scenes', 9),
  ('Real estate & lifestyle', 'real-estate',      10)
on conflict (slug) do nothing;

-- ---------- Pricing packages (also in migrations/002_packages.sql) ---
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

-- ---------- Make yourself an admin -----------------------------------
-- 1. Supabase → Authentication → Users → Add user (email + password).
-- 2. Run this with that email:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'you@thekreaction.com'
-- on conflict do nothing;
