-- Make the `maps_url` unique index usable as an ON CONFLICT target.
--
-- 20260805120000 created it partial:
--
--   create unique index leads_maps_url_key
--     on public.leads (maps_url) where maps_url is not null;
--
-- Postgres will only match a *partial* index to an `ON CONFLICT (maps_url)`
-- clause if the statement repeats the index predicate — and PostgREST has no
-- way to express `where maps_url is not null` on an upsert. So every import
-- failed with 42P10, "there is no unique or exclusion constraint matching the
-- ON CONFLICT specification", even though the index was there.
--
-- The predicate was never doing real work anyway: Postgres does not treat NULLs
-- as equal in a unique index, so the many form-submitted leads with a null
-- maps_url are already exempt from the uniqueness rule without it. Dropping the
-- predicate costs nothing and makes the index a valid conflict target.

drop index if exists public.leads_maps_url_key;

create unique index if not exists leads_maps_url_key
  on public.leads (maps_url);
