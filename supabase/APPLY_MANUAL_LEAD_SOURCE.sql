-- FOXI TECH — enables manually added leads.
-- Generated from supabase/migrations/20260803120000_manual_lead_source.sql.
--
-- Paste into the Supabase dashboard SQL editor and press Run:
--   https://supabase.com/dashboard/project/kppbasebdmepfcdeppwr/sql/new
--
-- One statement. Additive, so it cannot fail against existing rows, and it is
-- safe to run twice.

alter type public.lead_source add value if not exists 'manual';

insert into supabase_migrations.schema_migrations (version, name)
values ('20260803120000', 'manual_lead_source')
on conflict (version) do nothing;
