-- Combined migration for dashboard SQL editor. Run this, then regenerate types.

-- New source for scraped leads.
alter type public.lead_source add value if not exists 'imported';

-- "Call them back Thursday at 6" is a distinct state.
alter type public.lead_status add value if not exists 'follow_up';

-- Extend `leads` to carry scraped Google Maps leads alongside form submissions.
alter table public.leads
  add column if not exists lead_score   integer
    check (lead_score is null or lead_score between 0 and 100),
  add column if not exists rating       numeric(2, 1)
    check (rating is null or rating between 0 and 5),
  add column if not exists review_count integer
    check (review_count is null or review_count >= 0),
  add column if not exists category     text check (length(category) <= 120),
  add column if not exists niche        text check (length(niche) <= 120),
  add column if not exists city         text check (length(city) <= 120),
  add column if not exists address      text check (length(address) <= 500),
  add column if not exists website      text check (length(website) <= 500),
  add column if not exists maps_url     text check (length(maps_url) <= 2000),
  add column if not exists pitch_angle  text check (length(pitch_angle) <= 1000);

-- Scraped leads may have Maps URL but no email/phone.
alter table public.leads drop constraint if exists leads_needs_contact_method;
alter table public.leads
  add constraint leads_needs_contact_method
  check (email is not null or phone is not null or maps_url is not null);

-- Re-import safety: Maps URL is the de-duplication key.
--
-- NOT partial, deliberately. A `where maps_url is not null` predicate makes the
-- index unusable as an `ON CONFLICT (maps_url)` target, which broke every
-- import with 42P10. NULLs are never equal in a unique index anyway, so the
-- form-submitted leads are exempt without needing the predicate.
--
-- The drop handles databases where the earlier, partial version already landed.
drop index if exists public.leads_maps_url_key;

create unique index if not exists leads_maps_url_key
  on public.leads (maps_url);

create index if not exists leads_lead_score_idx
  on public.leads (lead_score desc nulls last) where lead_score is not null;

create index if not exists leads_city_idx
  on public.leads (city) where city is not null;

-- Business names run much longer than the 120 the contact form was sized for.
-- Keyword-stuffed Maps listings ("Best X in <area> | Dr <name> | Specialist")
-- routinely pass 120; row 63 of the first real import did.
do $$
declare
  target text;
begin
  select con.conname into target
  from pg_constraint con
  where con.conrelid = 'public.leads'::regclass
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%length(TRIM(%name%'
  limit 1;

  if target is not null then
    execute format('alter table public.leads drop constraint %I', target);
  end if;
end $$;

alter table public.leads
  add constraint leads_name_check
  check (length(trim(name)) between 1 and 250);
