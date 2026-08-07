-- Normalise stored phone numbers to a bare 10-digit Indian mobile.
--
-- The Google Maps scrape wrote numbers the way Maps displays them: a trunk zero
-- and an embedded space, `094217 96468`. Sarvam's outbound API takes E.164 and
-- nothing else, so every call against a scraped lead failed with
--   user_config.user_phone_number: Invalid phone number format
--
-- The application no longer depends on the stored shape — `lib/phone.ts`
-- normalises at the point of use, and the outbound route refuses to dial
-- anything it cannot convert. This migration is the other half: it makes the
-- column itself consistent, so the number an admin reads on the lead page is
-- the number that gets dialled, and so a `like '9%'` search behaves.
--
-- Stored as 10 digits, no country code — `+91` is added when dialling, which is
-- what `toE164` already does for a bare 10-digit value.

-- Preview before committing to it. Run this on its own first; it changes nothing.
--
--   select id, phone,
--          regexp_replace(phone, '\D', '', 'g') as digits,
--          length(regexp_replace(phone, '\D', '', 'g')) as digit_count
--   from public.leads
--   where phone is not null
--     and phone <> regexp_replace(phone, '\D', '', 'g')
--   order by digit_count desc, phone;


-- leads.phone ----------------------------------------------------------------

with normalised as (
  select
    id,
    case
      -- `00 91 XXXXXXXXXX` — international dialling prefix.
      when digits ~ '^0091[6-9][0-9]{9}$' then substring(digits from 5)
      -- `91 XXXXXXXXXX` — country code already present.
      when digits ~ '^91[6-9][0-9]{9}$'   then substring(digits from 3)
      -- `0XXXXXXXXXX` — the trunk zero this migration exists for.
      when digits ~ '^0[6-9][0-9]{9}$'    then substring(digits from 2)
      -- Already a bare mobile; only the punctuation needs dropping.
      when digits ~ '^[6-9][0-9]{9}$'     then digits
      -- Anything else stays exactly as it is: landlines with an area code we
      -- cannot prove, short numbers, junk from the importer. Rewriting those
      -- would be guessing, and a wrong number is worse than an unusable one.
      else null
    end as fixed
  from (
    select id, regexp_replace(phone, '\D', '', 'g') as digits
    from public.leads
    where phone is not null
  ) stripped
)
update public.leads as l
set phone = n.fixed
from normalised as n
where l.id = n.id
  and n.fixed is not null
  and l.phone <> n.fixed;


-- agreements.client_phone ----------------------------------------------------
--
-- Seeded from `leads.phone` when an agreement is drafted, so it inherited the
-- same trunk zero. Display-only today, but it is the field most likely to grow
-- a "WhatsApp the agreement" link later.

with normalised as (
  select
    id,
    case
      when digits ~ '^0091[6-9][0-9]{9}$' then substring(digits from 5)
      when digits ~ '^91[6-9][0-9]{9}$'   then substring(digits from 3)
      when digits ~ '^0[6-9][0-9]{9}$'    then substring(digits from 2)
      when digits ~ '^[6-9][0-9]{9}$'     then digits
      else null
    end as fixed
  from (
    select id, regexp_replace(client_phone, '\D', '', 'g') as digits
    from public.agreements
    where client_phone is not null
  ) stripped
)
update public.agreements as a
set client_phone = n.fixed
from normalised as n
where a.id = n.id
  and n.fixed is not null
  and a.client_phone <> n.fixed;


-- What did not get fixed ------------------------------------------------------
--
-- Run this afterwards. Every row it returns is a number the voice agent will
-- refuse to dial, and each needs a human to look at it.
--
--   select id, name, phone
--   from public.leads
--   where phone is not null
--     and regexp_replace(phone, '\D', '', 'g') !~ '^[6-9][0-9]{9}$'
--   order by name;
