-- Voice Agent Calls — tracks AI agent outbound calls per lead.
--
-- Two tables: `agent_calls` for structured call data (transcripts,
-- duration, summary, disposition) and a new value on activity_kind so
-- the lead timeline can cleanly render each call as its own row.

-- 1. Extend the activity kind enum ------------------------------------------
alter type public.activity_kind add value if not exists 'agent_call';

-- 2. Agent calls table ------------------------------------------------------
create table public.agent_calls (
  id               uuid primary key default gen_random_uuid(),
  lead_id          uuid not null references public.leads (id) on delete cascade,
  attempt_id       text not null unique,
  interaction_id   text,
  mode             text not null default 'auto' check (mode in ('auto', 'manual')),
  call_status      text not null check (call_status in (
                     'initiated', 'connected', 'no_answer', 'busy', 'failed'
                   )),
  duration_seconds double precision,
  language_name    text,
  summary          text check (summary is null or length(summary) <= 2000),
  disposition      text,
  transcript       jsonb not null default '[]'::jsonb,
  agent_variables  jsonb not null default '{}'::jsonb,
  meta             jsonb not null default '{}'::jsonb,
  started_at       timestamptz not null default now(),
  ended_at         timestamptz
);

-- Indexes ----------------------------------------------------------------
create index agent_calls_lead_idx on public.agent_calls (lead_id, started_at desc);
create index agent_calls_attempt_idx on public.agent_calls (attempt_id);

-- RLS: all reads go through the secret-key client, so no policies needed.
alter table public.agent_calls enable row level security;
