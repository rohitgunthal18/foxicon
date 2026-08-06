-- Lead capture (contact form + service quote modal) and customer reviews.
--
-- SECURITY MODEL
-- Both tables hold data submitted by anonymous visitors, but neither grants the
-- anon role any access at all. Every write goes through a Next.js route handler
-- using the secret key, which lets us validate, rate-limit and force server-side
-- defaults. A public INSERT policy on `leads` would let anyone spam the table
-- directly via PostgREST; a public SELECT would expose the entire lead list to
-- the browser. Neither is granted here.

create type public.lead_source as enum ('contact_form', 'quote_modal');

create type public.lead_status as enum (
  'new', 'contacted', 'qualified', 'won', 'lost', 'spam'
);

create type public.review_status as enum ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------- leads
create table public.leads (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (length(trim(name)) between 1 and 120),
  company       text check (length(company) <= 160),
  email         text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone         text check (phone is null or length(trim(phone)) between 6 and 24),
  service_slug  text references public.services (slug) on delete set null,
  message       text check (length(message) <= 4000),
  source        public.lead_source not null default 'contact_form',
  status        public.lead_status not null default 'new',
  admin_notes   text,

  -- Captured server-side for spam triage. Never accepted from the client.
  ip_hash       text,
  user_agent    text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- A lead with no way to reach the customer is useless.
  constraint leads_needs_contact_method
    check (email is not null or phone is not null)
);

create index leads_triage_idx  on public.leads (status, created_at desc);
create index leads_created_idx on public.leads (created_at desc);
create index leads_service_idx on public.leads (service_slug) where service_slug is not null;

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- reviews
-- Public-facing, so moderation is mandatory: rows land as 'pending' and only
-- become readable once an admin approves them.
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  author_name text not null check (length(trim(author_name)) between 1 and 120),
  author_role text check (length(author_role) <= 160),
  rating      smallint not null check (rating between 1 and 5),
  body        text not null check (length(trim(body)) between 1 and 2000),
  status      public.review_status not null default 'pending',
  is_featured boolean not null default false,
  sort_order  smallint not null default 0,

  ip_hash     text,
  user_agent  text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index reviews_public_idx
  on public.reviews (sort_order, created_at desc) where status = 'approved';
create index reviews_moderation_idx
  on public.reviews (status, created_at desc);

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------- row level security
-- Enabled on every table. Content tables get a read-only public policy;
-- leads and reviews-in-moderation get no anon policy whatsoever.

alter table public.services      enable row level security;
alter table public.plans         enable row level security;
alter table public.plan_features enable row level security;
alter table public.bonuses       enable row level security;
alter table public.faqs          enable row level security;
alter table public.process_steps enable row level security;
alter table public.site_settings enable row level security;
alter table public.leads         enable row level security;
alter table public.reviews       enable row level security;

-- Public read of active marketing content.
create policy "public reads active services"
  on public.services for select to anon, authenticated
  using (is_active);

create policy "public reads active plans"
  on public.plans for select to anon, authenticated
  using (is_active);

create policy "public reads features of active plans"
  on public.plan_features for select to anon, authenticated
  using (exists (
    select 1 from public.plans p
    where p.id = plan_features.plan_id and p.is_active
  ));

create policy "public reads active bonuses"
  on public.bonuses for select to anon, authenticated
  using (is_active);

create policy "public reads active faqs"
  on public.faqs for select to anon, authenticated
  using (is_active);

create policy "public reads active process steps"
  on public.process_steps for select to anon, authenticated
  using (is_active);

create policy "public reads site settings"
  on public.site_settings for select to anon, authenticated
  using (true);

-- Approved reviews only. Pending and rejected rows stay invisible.
create policy "public reads approved reviews"
  on public.reviews for select to anon, authenticated
  using (status = 'approved');

-- NOTE: `leads` intentionally has NO policy for anon or authenticated.
-- With RLS enabled and no policy, every anon request returns zero rows and
-- every anon write is refused. The secret key used by our route handlers
-- bypasses RLS, so server-side inserts and admin reads still work.
