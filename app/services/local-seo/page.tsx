import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, Star, Search, ShieldCheck, Award, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Google Maps Setup & Local SEO Services | Foxi Tech Pune',
  description: 'Dominate Google Maps 3-Pack with Foxi Tech\'s Local SEO and Google Business Profile optimization. Get found by nearby customers, collect 50+ reviews, and increase footfall.',
  keywords: [
    'local SEO services Pune',
    'Google Maps ranking Pune',
    'Google Business Profile optimization India',
    'dental clinic local SEO Pune',
    'Google My Business management Pune',
    'local search marketing agency',
    'Foxi Tech local SEO',
    'foxitech'
  ],
  alternates: {
    canonical: 'https://www.foxitech.in/services/local-seo',
  },
  openGraph: {
    title: 'Google Maps Setup & Local SEO Services | Foxi Tech Pune',
    description: 'Get your business into Google Maps top 3. Profile optimization, 50-review kit, and local search dominance.',
    url: 'https://www.foxitech.in/services/local-seo',
    siteName: 'Foxi Tech',
    type: 'website',
  },
};

export default function LocalSEOServicePage() {
  const deliverables = [
    {
      title: 'Google Business Profile Audit & Setup',
      desc: 'Complete optimization of categories, business hours, services, geo-coordinates, and high-resolution visual branding.',
      icon: MapPin,
    },
    {
      title: '50 Five-Star Review Collection Kit',
      desc: 'Our proven playbook and smart review QR card templates that make it effortless for satisfied customers to leave 5-star reviews.',
      icon: Star,
    },
    {
      title: 'Local Citation & NAP Synchronization',
      desc: 'Accurate Name, Address, Phone synchronization across Justdial, IndiaMART, Sulekha, and top Indian local directories.',
      icon: Search,
    },
    {
      title: 'Google Maps 3-Pack Ranking Strategy',
      desc: 'On-page geo-signals and localized schema markup connecting your website directly to your Google Maps pin.',
      icon: TrendingUp,
    },
    {
      title: 'Review Monitoring & Response Setup',
      desc: 'Guidelines and templates for responding to reviews professionally to build credibility and improve map rankings.',
      icon: ShieldCheck,
    },
    {
      title: 'Monthly Performance Insights',
      desc: 'Transparent tracking of profile views, phone calls initiated, and map direction requests from real customers.',
      icon: Award,
    },
  ];

  const faqs = [
    {
      q: 'How does Google Maps optimization help my business?',
      a: 'When customers search for "dentist near me" or "web design agency in Pune", Google displays the Maps 3-Pack at the very top. Ranking in these top 3 spots drives over 70% of calls and clinic visits.',
    },
    {
      q: 'Is Google Business Profile setup included free with Foxi Tech websites?',
      a: 'Yes! Every Foxi Tech website package includes complete Google Business Profile setup and our 50-review kit at no extra charge.',
    },
    {
      q: 'How quickly will my Google Business Profile rank?',
      a: 'Initial verification and setup take 3 to 5 days. Most clients begin seeing increased phone calls and direction requests within 2 to 4 weeks as reviews start rolling in.',
    },
  ];

  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Service',
                'name': 'Google Maps Setup & Local SEO',
                'serviceType': 'Local SEO, Google Business Profile Management, Map Ranking',
                'description': 'Google Business Profile optimization and local SEO services to rank businesses in Google Maps top 3.',
                'provider': {
                  '@type': 'Organization',
                  'name': 'Foxi Tech',
                  'url': 'https://www.foxitech.in',
                  'telephone': '+917218616190',
                  'email': 'contact@foxitech.in',
                },
                'areaServed': [
                  { '@type': 'City', 'name': 'Pune' },
                  { '@type': 'City', 'name': 'Bangalore' },
                  { '@type': 'City', 'name': 'Hyderabad' },
                  { '@type': 'City', 'name': 'Mumbai' },
                  { '@type': 'City', 'name': 'Delhi' },
                ],
              },
              {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                  {
                    '@type': 'ListItem',
                    'position': 1,
                    'name': 'Home',
                    'item': 'https://www.foxitech.in',
                  },
                  {
                    '@type': 'ListItem',
                    'position': 2,
                    'name': 'Services',
                    'item': 'https://www.foxitech.in/#services',
                  },
                  {
                    '@type': 'ListItem',
                    'position': 3,
                    'name': 'Local SEO',
                    'item': 'https://www.foxitech.in/services/local-seo',
                  },
                ],
              },
              {
                '@type': 'FAQPage',
                'mainEntity': faqs.map((faq) => ({
                  '@type': 'Question',
                  'name': faq.q,
                  'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': faq.a,
                  },
                })),
              },
            ],
          }),
        }}
      />

      <Navigation />

      {/* Header Banner */}
      <section className="bg-primary-950 text-white pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent-400 mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Services</span>
            <span>/</span>
            <span className="text-white">Local SEO &amp; Maps</span>
          </div>
          <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight">
            Google Maps Setup &amp; Local SEO Dominance
          </h1>
          <p className="mt-6 text-primary-300 text-base lg:text-xl max-w-3xl leading-relaxed">
            Get your business into Google&apos;s top 3 local map pack. We optimize your profile, establish local citations, and hand you a proven kit to collect 50+ real reviews.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent-600 text-white px-8 py-4 text-sm font-semibold hover:bg-accent-700 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-primary-700 text-white px-8 py-4 text-sm font-semibold hover:bg-primary-900 transition-colors"
            >
              See All Inclusions
            </Link>
          </div>
        </div>
      </section>

      {/* Deliverables Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-950 mb-4">
              Everything Needed to Rank #1 Locally
            </h2>
            <p className="text-primary-600 text-base lg:text-lg">
              Nine out of ten customers check Google Maps before choosing a local business or doctor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {deliverables.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="border border-primary-100 p-8 hover:border-primary-950 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 bg-primary-100 flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-primary-950" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-primary-950 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-primary-600 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-primary-50 border-t border-primary-200">
        <div className="max-w-[1000px] mx-auto px-4 lg:px-0">
          <h2 className="font-display text-3xl font-bold text-primary-950 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-6 border border-primary-200">
                <h3 className="font-display text-lg font-bold text-primary-950 mb-2">
                  {faq.q}
                </h3>
                <p className="text-primary-700 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-primary-950 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold mb-4">
            Claim Your Google Maps 3-Pack Spot
          </h2>
          <p className="text-primary-300 text-sm mb-8">
            Stop losing nearby customers to competitors. Let Foxi Tech optimize your local presence today.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-white text-primary-950 px-8 py-4 font-semibold text-sm hover:bg-primary-100 transition-colors"
          >
            Claim Your Spot Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
