-- Leads the owner found themselves.
--
-- `lead_source` only knew about the two public forms. An outbound lead — found
-- on Instagram, referred by a client, met at an event — had nowhere honest to
-- go, and recording it as 'contact_form' would make the lead detail page lie
-- about where the person came from.
--
-- `add value` is the only enum change Postgres allows in place. It is additive
-- and cannot fail against existing rows.

alter type public.lead_source add value if not exists 'manual';
