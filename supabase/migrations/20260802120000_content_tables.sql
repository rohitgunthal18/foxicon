-- Content tables: everything the admin dashboard will edit.
-- Icons are stored as lucide-react component NAMES (e.g. 'MapPin'); the frontend
-- maps name -> component. Prices are integer rupees, formatted at render time.

create extension if not exists "pgcrypto";

-- Reusable updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- services
-- Canonical service list. `slug` is the single vocabulary for service
-- selection, replacing the slug/title mismatch between the two forms.
create table public.services (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  description text not null,
  icon        text not null,
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint services_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index services_active_order_idx
  on public.services (sort_order) where is_active;

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- plans
create table public.plans (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  tagline        text not null,
  price_inr      integer not null check (price_inr >= 0),
  delivery_label text not null,
  is_featured    boolean not null default false,
  sort_order     smallint not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- At most one plan may be flagged "Recommended".
create unique index plans_single_featured_idx
  on public.plans (is_featured) where is_featured;

create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------- plan_features
-- Feature matrix: 8 rows per plan, each included or struck through.
create table public.plan_features (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid not null references public.plans (id) on delete cascade,
  text       text not null,
  included   boolean not null default true,
  sort_order smallint not null default 0
);

create index plan_features_plan_idx
  on public.plan_features (plan_id, sort_order);

-- ---------------------------------------------------------------- bonuses
-- The "Free Bonuses" strip. `min_plan_sort` marks the cheapest plan tier that
-- receives the bonus, so the copy stays correct if plans are reordered.
create table public.bonuses (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text not null,
  icon          text not null,
  worth_inr     integer not null check (worth_inr >= 0),
  min_plan_sort smallint not null default 1,
  sort_order    smallint not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger bonuses_set_updated_at
  before update on public.bonuses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- faqs
create table public.faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  sort_order smallint not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger faqs_set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------- process_steps
create table public.process_steps (
  id          uuid primary key default gen_random_uuid(),
  day_label   text not null,
  title       text not null,
  description text not null,
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger process_steps_set_updated_at
  before update on public.process_steps
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- site_settings
-- Single-row key/value store for the facts currently duplicated across five
-- components (4.9/5 rating, 120+ clients, phone, email, address, reply time).
create table public.site_settings (
  key        text primary key,
  value      text not null,
  label      text not null,
  updated_at timestamptz not null default now(),
  constraint site_settings_key_format check (key ~ '^[a-z0-9_]+$')
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();
