-- Enum additions, alone in their own migration.
--
-- Postgres refuses to use a value added by `alter type ... add value` inside the
-- same transaction that added it. Supabase wraps each migration file in one
-- transaction, so these two values must land — and commit — before any later
-- migration or route handler can insert a row that references them.

-- Where Google-Maps-scraped leads come from.
alter type public.lead_source add value if not exists 'imported';

-- "They picked up, they're interested, call back Thursday at 6."
--
-- Distinct from `contacted` (we rang once) and `qualified` (they asked for a
-- quote). `next_follow_up_at` already records *when* to call; this records that
-- calling back is the whole state of the lead.
alter type public.lead_status add value if not exists 'follow_up';
