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
