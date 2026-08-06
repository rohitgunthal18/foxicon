-- ===========================================================================
--  FIX: CSV import failing with 500 / "Could not save the leads"
-- ===========================================================================
--
--  Paste this whole file into the Supabase SQL editor and press Run.
--
--  Why: the unique index on `maps_url` was created as a PARTIAL index
--  (`where maps_url is not null`). Postgres will not match a partial index to
--  an `ON CONFLICT (maps_url)` clause unless the statement repeats the same
--  predicate, which the Supabase client cannot express. Every import therefore
--  failed with:
--
--      42P10: there is no unique or exclusion constraint matching the
--             ON CONFLICT specification
--
--  The predicate was redundant: Postgres never treats NULLs as equal in a
--  unique index, so leads with no maps_url (everything from the website forms)
--  are already exempt from uniqueness without it.
--
--  Safe to run more than once.
-- ===========================================================================

drop index if exists public.leads_maps_url_key;

create unique index if not exists leads_maps_url_key
  on public.leads (maps_url);

-- Verify: expect one row, and `indexdef` must NOT contain "WHERE".
select indexname, indexdef
  from pg_indexes
 where schemaname = 'public'
   and tablename = 'leads'
   and indexname = 'leads_maps_url_key';
