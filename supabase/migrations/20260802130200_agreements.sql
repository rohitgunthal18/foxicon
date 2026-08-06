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
