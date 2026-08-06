-- FOXI TECH — admin dashboard schema, all 5 migrations in one transaction.
-- Generated from supabase/migrations/2026080213*.sql — do not edit by hand.
--
-- Paste the whole file into the Supabase dashboard SQL editor and press Run.
--   https://supabase.com/dashboard/project/kppbasebdmepfcdeppwr/sql/new
--
-- Wrapped in BEGIN/COMMIT: if any statement fails, nothing is applied, so
-- you can fix and re-run without ending up half-migrated.

begin;


-- ============================================================
-- 20260802130000_admin_users.sql
-- ============================================================

-- Admin authentication and authorisation.
--
-- Admin identity lives in Supabase Auth (auth.users). This table adds the
-- application-level facts: display name, role and whether the account is still
-- allowed in. Membership of this table IS the admin grant — a Supabase Auth
-- user with no active row here can log in but reaches nothing.
--
-- There is deliberately no self-signup path. Accounts are created by an
-- existing owner (or the provisioning script) using the secret key.

create type public.admin_role as enum ('owner', 'admin', 'staff');

create table public.admin_users (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null check (length(trim(full_name)) between 1 and 120),
  email      text not null unique,
  role       public.admin_role not null default 'staff',
  is_active  boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index admin_users_active_idx on public.admin_users (is_active) where is_active;

create trigger admin_users_set_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;

-- An admin may read only their own row, and only while active. This is defence
-- in depth: the Data Access Layer is the primary gate, but if a session token
-- ever leaked into the browser it still could not enumerate the admin list.
create policy "admins read their own row"
  on public.admin_users for select to authenticated
  using (id = (select auth.uid()) and is_active);

-- No insert/update/delete policies: account management happens server-side
-- with the secret key.

/**
 * True when the current JWT belongs to an active admin.
 * Used by RLS policies on the admin-only tables below.
 */
create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where id = (select auth.uid()) and is_active
  );
$$;


-- ============================================================
-- 20260802130100_lead_pipeline.sql
-- ============================================================

-- Lead pipeline: turn `leads` from an inbox into a sales pipeline.
--
-- The old status enum (new/contacted/qualified/won/lost/spam) collapsed the
-- entire post-agreement lifecycle into a single "won". That makes the one
-- question the owner actually needs answered — "who owes us money?" —
-- unanswerable. The new enum splits it:
--
--   new -> contacted -> qualified -> agreement -> development
--        -> delivered -> paid -> closed
--
-- plus the two dead ends, `lost` (client walked) and `rejected` (we said no,
-- or it was spam).
--
-- Postgres will not let us reorder or remove enum values in place, so we build
-- the new type and swap the column over with an explicit mapping.

create type public.lead_status_v2 as enum (
  'new',
  'contacted',
  'qualified',
  'agreement',
  'development',
  'delivered',
  'paid',
  'closed',
  'lost',
  'rejected'
);

alter table public.leads alter column status drop default;

alter table public.leads
  alter column status type public.lead_status_v2
  using (
    case status::text
      when 'won'  then 'paid'      -- old "won" meant money received
      when 'spam' then 'rejected'
      else status::text
    end
  )::public.lead_status_v2;

alter table public.leads alter column status set default 'new';

drop type public.lead_status;
alter type public.lead_status_v2 rename to lead_status;

create type public.lead_priority as enum ('low', 'normal', 'high');

alter table public.leads
  add column priority public.lead_priority not null default 'normal',
  add column next_follow_up_at timestamptz,
  add column owner_id uuid references public.admin_users (id) on delete set null,
  add column value_inr integer check (value_inr is null or value_inr >= 0),
  add column last_contacted_at timestamptz;

-- The dashboard's two hot queries: the board grouped by status, and the
-- "who do I need to chase today" list.
create index leads_status_created_idx on public.leads (status, created_at desc);
create index leads_follow_up_idx on public.leads (next_follow_up_at)
  where next_follow_up_at is not null;


-- Activity timeline ---------------------------------------------------------
--
-- A `status` column tells you where a lead is. It cannot tell you how it got
-- there, who moved it, or what was said on the phone last Tuesday. Every
-- meaningful action appends a row here, so the lead detail page can render an
-- honest history instead of a single mutable field.

create type public.activity_kind as enum (
  'note',
  'status_change',
  'agreement_sent',
  'agreement_signed',
  'payment_recorded',
  'field_update'
);

create table public.lead_activities (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  author_id   uuid references public.admin_users (id) on delete set null,
  kind        public.activity_kind not null default 'note',
  body        text check (body is null or length(body) <= 4000),
  -- For status_change: {"from": "new", "to": "contacted"}. For field_update:
  -- the changed keys. Kept loose on purpose — this is a log, not a model.
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index lead_activities_lead_idx
  on public.lead_activities (lead_id, created_at desc);

alter table public.lead_activities enable row level security;
-- No policies. Route handlers read and write this with the secret key.


-- ============================================================
-- 20260802130200_agreements.sql
-- ============================================================

-- Agreements: generate, send, sign, and prove it.
--
-- Security model for the public signing link (the thing the client clicks):
--
--   1. The link carries a 32-byte random token. Only its sha256 is stored, so
--      a database leak does not hand an attacker working signing links.
--   2. The endpoint only accepts a signature while status = 'sent'. Signing
--      flips it to 'signed' in the same conditional UPDATE, so a replayed or
--      concurrent request matches zero rows and is refused.
--   3. `signature_events.agreement_id` is UNIQUE. Even if the status guard
--      were somehow bypassed, the second insert violates a constraint. Two
--      independent locks, one at the row level and one at the schema level.
--   4. `expires_at` closes the window entirely after a set period.
--   5. `content_hash` freezes the exact text that was on screen when the
--      client signed, so a later edit cannot silently reattach a real
--      signature to different terms.

create type public.agreement_status as enum ('draft', 'sent', 'signed', 'voided');
create type public.agreement_item_kind as enum ('service', 'addon', 'discount');

-- Editable boilerplate. The generator pre-fills a new agreement from the
-- default row; the admin then edits any block for that specific client
-- without touching the template.
create table public.agreement_templates (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  intro            text not null default '',
  scope            text not null default '',
  payment_terms    text not null default '',
  delivery         text not null default '',
  support          text not null default '',
  revisions        text not null default '',
  client_duties    text not null default '',
  ownership        text not null default '',
  confidentiality  text not null default '',
  liability        text not null default '',
  termination      text not null default '',
  dispute          text not null default '',
  signing_text     text not null default '',
  is_default       boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- At most one default template.
create unique index agreement_templates_single_default_idx
  on public.agreement_templates (is_default) where is_default;

create trigger agreement_templates_set_updated_at
  before update on public.agreement_templates
  for each row execute function public.set_updated_at();


create table public.agreements (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid references public.leads (id) on delete set null,
  -- Human-facing reference, e.g. FOXI-2026-0001. Filled by the app.
  reference     text not null unique,
  status        public.agreement_status not null default 'draft',

  -- Client details are copied, not joined. The agreement must still read
  -- correctly years later even if the lead row is edited or deleted.
  client_name    text not null,
  client_email   text,
  client_phone   text,
  client_company text,
  client_address text,

  plan_slug      text references public.plans (slug) on delete set null,
  service_slug   text references public.services (slug) on delete set null,
  project_title  text not null default '',

  -- All money in whole rupees, matching the rest of the schema.
  currency         text not null default 'INR',
  subtotal_inr     integer not null default 0 check (subtotal_inr >= 0),
  discount_inr     integer not null default 0 check (discount_inr >= 0),
  tax_percent      numeric(5, 2) not null default 0 check (tax_percent >= 0 and tax_percent <= 100),
  total_inr        integer not null default 0 check (total_inr >= 0),

  -- [{ label, percent, amount_inr, due_note }]. Stored as jsonb because the
  -- schedule is free-form per client and is never queried by field.
  installments   jsonb not null default '[]'::jsonb,

  delivery_days  integer not null default 7 check (delivery_days > 0),
  support_months integer not null default 1 check (support_months >= 0),
  revisions_included integer not null default 2 check (revisions_included >= 0),

  -- The full, already-edited agreement text. Snapshotted per agreement so
  -- editing a template never rewrites history.
  content        jsonb not null default '{}'::jsonb,

  -- sha256 of the canonical content at send time. Compared at signing.
  content_hash   text,

  -- sha256 of the 32-byte link token. The raw token is shown to the admin
  -- exactly once, when the agreement is sent, and never persisted.
  token_hash     text unique,

  sent_at        timestamptz,
  expires_at     timestamptz,
  signed_at      timestamptz,
  voided_at      timestamptz,
  void_reason    text,

  created_by     uuid references public.admin_users (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- A sent agreement is meaningless without a link and a deadline.
  constraint agreements_sent_needs_token check (
    status <> 'sent' or (token_hash is not null and expires_at is not null)
  ),
  constraint agreements_signed_needs_timestamp check (
    status <> 'signed' or signed_at is not null
  )
);

create index agreements_status_idx on public.agreements (status, created_at desc);
create index agreements_lead_idx on public.agreements (lead_id);

create trigger agreements_set_updated_at
  before update on public.agreements
  for each row execute function public.set_updated_at();


-- Line items behind `subtotal_inr`. Kept relational (not jsonb) because the
-- generator edits them row by row and the printed agreement lists them.
create table public.agreement_items (
  id            uuid primary key default gen_random_uuid(),
  agreement_id  uuid not null references public.agreements (id) on delete cascade,
  kind          public.agreement_item_kind not null default 'service',
  label         text not null check (length(trim(label)) between 1 and 200),
  detail        text,
  qty           integer not null default 1 check (qty > 0),
  unit_inr      integer not null default 0,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index agreement_items_agreement_idx
  on public.agreement_items (agreement_id, sort_order);


-- Append-only signature audit trail. One row per agreement, forever.
create table public.signature_events (
  id             uuid primary key default gen_random_uuid(),
  agreement_id   uuid not null unique references public.agreements (id) on delete cascade,
  signer_name    text not null check (length(trim(signer_name)) between 2 and 160),
  signer_email   text,
  accepted_terms boolean not null check (accepted_terms),
  -- What the signer actually saw. If this stops matching the agreement's
  -- current content_hash, the terms were edited after signing.
  content_hash   text not null,
  ip_hash        text,
  user_agent     text,
  signed_at      timestamptz not null default now()
);

-- Belt and braces: block UPDATE and DELETE at the database level so even a
-- server-side bug cannot rewrite a signature.
create or replace function public.signature_events_immutable()
returns trigger language plpgsql
as $$
begin
  raise exception 'signature_events is append-only';
end;
$$;

create trigger signature_events_no_update
  before update or delete on public.signature_events
  for each row execute function public.signature_events_immutable();


alter table public.agreement_templates enable row level security;
alter table public.agreements         enable row level security;
alter table public.agreement_items    enable row level security;
alter table public.signature_events   enable row level security;

-- No policies on any of the four. The signing page and the admin UI both go
-- through server route handlers using the secret key, which bypasses RLS.
-- Anyone who finds the PostgREST endpoint gets zero rows and zero writes:
-- they cannot list agreements, cannot read a token hash, and cannot forge a
-- signature row directly.


-- ============================================================
-- 20260802130300_agreement_template_seed.sql
-- ============================================================

-- Default agreement boilerplate, in FOXI TECH's voice.
--
-- Every field here is editable at generation time; the admin overrides only
-- what this particular client needs. Deliberately single-paragraph blocks so
-- the printed agreement stays short and readable.
--
-- Idempotent: safe to re-run; only inserts when no default exists yet.

insert into public.agreement_templates (
  name, is_default,
  intro, scope, payment_terms, delivery, support, revisions,
  client_duties, ownership, confidentiality, liability, termination, dispute,
  signing_text
)
select
  'FOXI TECH Standard',
  true,
  'This Agreement is made between FOXI TECH ("we", "us"), based at Shop 4, Tech Plaza, Baner Road, Pune, Maharashtra 411045, and the client named below ("you"). It covers the digital services described in the Scope of Work. By signing, you accept the terms on this page.',
  'We will design, build and deliver the website and digital services set out in the line items above, in line with the project plan shared after this agreement is signed.',
  'A 50% advance of the total is due before work begins. The balance is due as set out in the Installments section, payable by bank transfer or UPI. Work starts only after the advance clears.',
  'The project will be delivered within the Delivery Days shown above from the date the advance is received and all required content is supplied by you. Any delay in content, decisions or payments extends the delivery date by the same period.',
  'Support is included for the Support Months shown above from the date of delivery. It covers fixes to defects in the delivered work. New features, content updates and redesign work are quoted separately.',
  'Two rounds of revisions are included, unless the Revisions Included line above says otherwise. Further rounds, and any changes that alter the scope, are billed at our standard hourly rate.',
  'You will provide all text, images, logos and business details needed for the project, on time and in final form. You confirm you own or hold the rights to all material you supply. Delay in supplying this material extends the delivery date.',
  'Upon full payment, ownership of the delivered website and its source files transfers to you. We retain the right to display the work in our portfolio.',
  'We will not disclose your business information, customer data or project details to any third party, except as needed to deliver the services. This obligation survives the end of this agreement.',
  'We deliver the work to the agreed scope and fix genuine defects. To the fullest extent permitted by law, our total liability under this agreement is limited to the amount you have paid us, and we are not liable for lost profits or indirect damages.',
  'Either party may end this agreement with 7 days written notice. If you cancel after work has started, you pay for the work completed to date. If we cancel, we refund the unused portion of the advance.',
  'This agreement is governed by the laws of India. Disputes will first be discussed in good faith, and if unresolved, referred to the courts of Pune, Maharashtra.',
  'I confirm I have read and agree to the terms above, and that the details I have provided are accurate. This typed name serves as my legal signature.'
from (select 1) as x
where not exists (
  select 1 from public.agreement_templates where is_default
);


-- ============================================================
-- 20260802130400_login_attempts.sql
-- ============================================================

-- Login throttling store.
--
-- The existing `checkRateLimit` helper counts rows in the table being written
-- to (leads, reviews). Login has no such table — a failed attempt writes
-- nothing — so it needs a dedicated log.
--
-- Only the hashed IP is kept. No email, so a dump of this table cannot be used
-- to enumerate admin accounts or correlate attempts to a person.

create table public.login_attempts (
  id          uuid primary key default gen_random_uuid(),
  ip_hash     text not null,
  succeeded   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index login_attempts_ip_time_idx
  on public.login_attempts (ip_hash, created_at desc);

alter table public.login_attempts enable row level security;
-- No policies: written only by the login route handler via the secret key.

/**
 * Deletes attempt rows older than a day. Called opportunistically from the
 * login route so the table cannot grow without bound; there is no cron here.
 */
create or replace function public.prune_login_attempts()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.login_attempts
  where created_at < now() - interval '1 day';
$$;


-- ============================================================
-- Migration bookkeeping
-- ============================================================
-- Record these as applied so a future `supabase db push` does not try to
-- re-run them against a database that already has the tables.

insert into supabase_migrations.schema_migrations (version, name)
values
  ('20260802130000', 'admin_users'),
  ('20260802130100', 'lead_pipeline'),
  ('20260802130200', 'agreements'),
  ('20260802130300', 'agreement_template_seed'),
  ('20260802130400', 'login_attempts')
on conflict (version) do nothing;

commit;
