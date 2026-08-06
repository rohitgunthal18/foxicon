-- Widen the `leads.name` limit for scraped business names.
--
-- The original 120 was sized for a person typing their own name into the
-- contact form. Scraped Google Maps listings are business names, and they run
-- much longer — full legal names, branch and locality suffixes, and the
-- "Best Dental Clinic in <area> | Dr <name> | Implant & Root Canal Specialist"
-- style of listing that businesses write to game Maps search. Row 63 of the
-- first real import tripped it.
--
-- 250 covers the observed long tail with room to spare. The lower bound and
-- the not-null stay exactly as they were: a nameless lead is still invalid.

-- The original was an unnamed inline column check, so Postgres named it
-- `leads_name_check`. Dropped by that name, but defensively: if an earlier
-- collision made it `leads_name_check1`, drop whichever check actually
-- mentions `name` rather than leaving a stale 120 limit silently in place.
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
