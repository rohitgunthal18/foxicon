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
