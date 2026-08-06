-- Widen `leads.name` from 120 to 250 characters.
--
-- Paste into the Supabase dashboard SQL editor and Run. Safe to run twice.
--
-- Why: 120 was sized for a person typing their own name into the contact form.
-- Scraped Google Maps listings are business names and run far longer — full
-- legal names with branch and locality suffixes, and the keyword-stuffed
-- "Best X in <area> | Dr <name> | <service> Specialist" style that businesses
-- write to rank in Maps search. Row 63 of the first real import hit the limit.

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
