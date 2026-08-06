-- Extend `leads` to carry scraped Google Maps leads alongside form submissions.
--
-- Scraped leads bring business-intelligence fields (lead_score, rating, review
-- count, pitch angle, Maps URL) that form leads do not have. They are still
-- leads: same statuses, same follow-ups, same notes, same detail page. So the
-- columns go here and `source` distinguishes them, rather than a second table
-- that would duplicate the entire pipeline.

-- Scraper fields -----------------------------------------------------------

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


-- Contact-method constraint --------------------------------------------------
--
-- The original rule was "email or phone, else the lead is useless". That holds
-- for a form submission, where those are the only two channels we ever get.
-- A scraped listing is different: 4 of the first 30 rows have no phone and no
-- email, but every one has a Maps URL — which carries the business's own
-- contact page, so the lead is reachable and worth keeping.

alter table public.leads drop constraint if exists leads_needs_contact_method;

alter table public.leads
  add constraint leads_needs_contact_method
  check (email is not null or phone is not null or maps_url is not null);


-- Re-import safety -----------------------------------------------------------
--
-- A Maps URL identifies one business listing. Making it unique lets the
-- importer use `on conflict do nothing` so re-running the same scrape adds only
-- what is new instead of duplicating the lot.
--
-- Deliberately NOT partial. A `where maps_url is not null` predicate reads like
-- it would spare the form-submitted leads, but Postgres already does that —
-- NULLs are never equal to each other in a unique index, so those rows are
-- exempt regardless. What the predicate *does* do is make the index unusable as
-- an `ON CONFLICT (maps_url)` target unless the statement repeats the predicate,
-- which the Supabase client cannot express. That cost the importer every insert
-- with 42P10 until 20260805140000 dropped it.

create unique index if not exists leads_maps_url_key
  on public.leads (maps_url);

-- Sorting by score is the point of the new list, so it gets an index.
create index if not exists leads_lead_score_idx
  on public.leads (lead_score desc nulls last) where lead_score is not null;

create index if not exists leads_city_idx
  on public.leads (city) where city is not null;


comment on column public.leads.lead_score is
  'Scraper-assigned 0-100 priority. Higher means a better fit for outreach.';
comment on column public.leads.rating is 'Google Maps star rating, 0.0-5.0.';
comment on column public.leads.review_count is 'Google Maps review count.';
comment on column public.leads.pitch_angle is
  'Scraper-written reason this business needs us. Shown on the lead detail page.';
comment on column public.leads.maps_url is
  'Google Maps listing URL. Unique — doubles as the de-duplication key on import.';
