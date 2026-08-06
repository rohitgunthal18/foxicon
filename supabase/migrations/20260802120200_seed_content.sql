-- Seed the current hardcoded component content into the database.
-- Idempotent: safe to re-run. Values mirror the live components exactly so the
-- rendered site is unchanged after switching to DB-backed content.

-- ---------------------------------------------------------------- services
insert into public.services (slug, title, description, icon, sort_order) values
  ('website-design', 'Website Design',
   'A fast, mobile-friendly website that makes your business look established and trustworthy.',
   'Monitor', 1),
  ('google-maps', 'Google Maps Setup',
   'Get found by nearby customers searching for what you offer, with reviews that build trust.',
   'MapPin', 2),
  ('instagram', 'Instagram Setup',
   'A launch-ready page with posts and reels so customers see an active, real business.',
   'Camera', 3),
  ('ads', 'Meta & Google Ads',
   'Paid campaigns that put your business in front of people ready to buy.',
   'Megaphone', 4),
  ('local-seo', 'Local SEO',
   'Rank for the searches your customers actually type, in the area you actually serve.',
   'Search', 5),
  ('online-booking', 'Online Booking',
   'Let customers book and pay themselves, 24/7, without a single phone call.',
   'CalendarCheck', 6)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- plans
insert into public.plans (slug, name, tagline, price_inr, delivery_label, is_featured, sort_order) values
  ('single-page', 'Single Page', 'Get online this week',            4999,  '3 Days',      false, 1),
  ('static',      'Static',      'A full website for your business', 9999,  '7 Days',      false, 2),
  ('dynamic',     'Dynamic',     'Turns visitors into customers',    19999, '10-12 Days',  true,  3)
on conflict (slug) do nothing;

-- ---------------------------------------------------- plan_features
insert into public.plan_features (plan_id, text, included, sort_order)
select p.id, f.text, f.included, f.sort_order
from public.plans p
join (values
  ('single-page', 'One beautifully designed page',              true,  1),
  ('single-page', 'Mobile-friendly',                            true,  2),
  ('single-page', 'Click-to-call + WhatsApp button',            true,  3),
  ('single-page', 'Google Maps embed',                          true,  4),
  ('single-page', 'Enquiry form',                               true,  5),
  ('single-page', '6 months support',                           true,  6),
  ('single-page', 'Online booking',                             false, 7),
  ('single-page', 'Accept payments',                            false, 8),

  ('static',      'Up to 5 custom pages',                       true,  1),
  ('static',      'Mobile-friendly',                            true,  2),
  ('static',      'Contact form + WhatsApp button',             true,  3),
  ('static',      'Basic Google search setup',                  true,  4),
  ('static',      'Fast, secure hosting setup',                 true,  5),
  ('static',      '1 year support',                             true,  6),
  ('static',      'Online booking',                             false, 7),
  ('static',      'Accept payments',                            false, 8),

  ('dynamic',     'Up to 10 pages',                             true,  1),
  ('dynamic',     'Edit content yourself, anytime',             true,  2),
  ('dynamic',     'Take bookings 24/7, even while you sleep',   true,  3),
  ('dynamic',     'Accept payments — cards, UPI, wallets',      true,  4),
  ('dynamic',     'Blog to pull in new visitors',               true,  5),
  ('dynamic',     'Customer list + booking dashboard',          true,  6),
  ('dynamic',     'Advanced Google ranking setup',              true,  7),
  ('dynamic',     'Priority support for 2 years',               true,  8)
) as f(plan_slug, text, included, sort_order) on f.plan_slug = p.slug
where not exists (
  select 1 from public.plan_features pf
  where pf.plan_id = p.id and pf.text = f.text
);

-- ---------------------------------------------------------------- bonuses
-- min_plan_sort = 2 -> included from the Static plan upward, not Single Page.
insert into public.bonuses (title, description, icon, worth_inr, min_plan_sort, sort_order)
select * from (values
  ('Google Maps Setup',
   'Findable on Google Maps, with a kit to collect your first 50 reviews.',
   'MapPin', 4000, 2::smallint, 1::smallint),
  ('Instagram Page Setup',
   'A launch-ready page — profile, 2 reels and 5 posts ready to post.',
   'Share2', 3000, 2::smallint, 2::smallint)
) as b(title, description, icon, worth_inr, min_plan_sort, sort_order)
where not exists (select 1 from public.bonuses where bonuses.title = b.title);

-- ---------------------------------------------------- process_steps
insert into public.process_steps (day_label, title, description, sort_order)
select * from (values
  ('Day 1',   'Kickoff',        'A short call to understand your business and customers.', 1::smallint),
  ('Day 2-4', 'Design & Build', 'We design and build while you carry on with work.',       2::smallint),
  ('Day 5',   'Your Review',    'You see it live and we fix your changes the same day.',   3::smallint),
  ('Day 6-7', 'You''re Live',   'Site launched, Google Maps live, Instagram ready.',       4::smallint)
) as s(day_label, title, description, sort_order)
where not exists (select 1 from public.process_steps where process_steps.title = s.title);

-- ---------------------------------------------------------------- site_settings
insert into public.site_settings (key, value, label) values
  ('contact_email',   'contact.foxitech@gmail.com',                      'Contact email'),
  ('contact_phone',   '+91 72186 16190',                                 'Contact phone'),
  ('address_line1',   'Shop 4, Tech Plaza, Baner Road',                  'Address line 1'),
  ('address_line2',   'Pune, Maharashtra 411045',                        'Address line 2'),
  ('reply_time',      '< 2 Hours',                                       'Typical reply time'),
  ('rating_value',    '4.9/5',                                           'Average client rating'),
  ('clients_count',   '120+',                                            'Businesses served'),
  ('delivery_days',   '5 Days',                                          'Typical delivery'),
  ('support_hours',   '24/7',                                            'Support availability')
on conflict (key) do nothing;
