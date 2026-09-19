import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Megaphone, Target, BarChart3, Users, DollarSign, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Meta & Google Ads Agency Pune | Performance Marketing | Foxi Tech',
  description: 'High-converting Meta (Instagram/Facebook) and Google Ads campaigns in Pune by Foxi Tech. Targeted PPC advertising delivering qualified leads and immediate customer calls.',
  keywords: [
    'Meta ads agency Pune',
    'Google ads agency Pune',
    'PPC agency Pune',
    'digital marketing agency Pune',
    'lead generation ads India',
    'Instagram ads agency Pune',
    'Foxi Tech ads',
    'foxitech'
  ],
  alternates: {
    canonical: 'https://www.foxitech.in/services/google-ads',
  },
  openGraph: {
    title: 'Meta & Google Ads Agency Pune | Foxi Tech',
    description: 'Stop burning money on bad ads. Foxi Tech builds targeted Meta and Google PPC campaigns that drive real booked appointments.',
    url: 'https://www.foxitech.in/services/google-ads',
    siteName: 'Foxi Tech',
    type: 'website',
  },
};

export default function AdsServicePage() {
  const features = [
    {
      title: 'High-Intent Google Search Ads',
      desc: 'Capture customers actively searching for your services with targeted search campaigns and negative keyword pruning.',
      icon: Target,
    },
    {
      title: 'Meta (Instagram & Facebook) Funnels',
      desc: 'Visual, high-converting ad creative and video reels that turn local social media users into WhatsApp inquiries.',
      icon: Megaphone,
    },
    {
      title: 'Zero Ad-Spend Waste',
      desc: 'Pinpoint geographic targeting down to specific postal codes and radius around your physical office or clinic.',
      icon: DollarSign,
    },
    {
      title: 'Direct WhatsApp & CRM Routing',
      desc: 'Leads bypass confusing forms and route directly to your team’s WhatsApp or phone within seconds.',
      icon: Zap,
    },
    {
      title: 'Audience Retargeting',
      desc: 'Re-engage website visitors who did not convert on their first visit, lowering customer acquisition costs.',
      icon: Users,
    },
    {
      title: 'Transparent ROI Reporting',
      desc: 'Real-time visibility into cost per lead, total inquiries, and booked revenue with no vanity metrics.',
      icon: BarChart3,
    },
  ];

  const faqs = [
    {
      q: 'How much budget do I need to start advertising?',
      a: 'We recommend starting with ₹500 to ₹1,000 per day in ad spend for local service businesses. You pay this budget directly to Google or Meta with zero agency markup.',
    },
    {
      q: 'How fast do ads start generating leads?',
      a: 'Once campaigns are approved by Google and Meta (usually 24 to 48 hours), leads and inquiries begin flowing immediately.',
    },
    {
      q: 'Do you design the ad creative and write the copy?',
      a: 'Yes. Foxi Tech writes all ad copy, headlines, calls-to-action, and produces visual creative optimized for Instagram feeds, stories, and Google Search snippets.',
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
                'name': 'Meta & Google Ads Performance Marketing',
                'serviceType': 'Pay-Per-Click (PPC), Meta Ads, Google Ads Management',
                'description': 'Targeted Google Ads and Meta advertising campaigns engineered to drive high-intent leads and sales for local businesses.',
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
                    'name': 'Meta & Google Ads',
                    'item': 'https://www.foxitech.in/services/google-ads',
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
            <span className="text-white">Paid Advertising</span>
          </div>
          <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight">
            High-ROI Meta &amp; Google Ads Management
          </h1>
          <p className="mt-6 text-primary-300 text-base lg:text-xl max-w-3xl leading-relaxed">
            Stop burning budget on generic clicks. We build hyper-targeted paid ad funnels on Google, Instagram, and Facebook that reach nearby customers ready to buy.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent-600 text-white px-8 py-4 text-sm font-semibold hover:bg-accent-700 transition-colors"
            >
              Launch Your Campaign
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-primary-700 text-white px-8 py-4 text-sm font-semibold hover:bg-primary-900 transition-colors"
            >
              View Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-950 mb-4">
              Precision Ad Targeting That Delivers
            </h2>
            <p className="text-primary-600 text-base lg:text-lg">
              We focus on one metric: qualified inquiries that generate revenue for your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
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
                      {feature.title}
                    </h3>
                    <p className="text-primary-600 text-sm leading-relaxed">
                      {feature.desc}
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
            Start Getting New Leads This Week
          </h2>
          <p className="text-primary-300 text-sm mb-8">
            Speak to our performance marketing team at Foxi Tech. We’ll design your campaign structure today.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-white text-primary-950 px-8 py-4 font-semibold text-sm hover:bg-primary-100 transition-colors"
          >
            Get Free Ads Consultation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
