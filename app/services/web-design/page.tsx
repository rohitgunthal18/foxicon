import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Monitor, Zap, Shield, Sparkles, Smartphone, Code2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Website Design & Next.js Development | Foxi Tech Pune',
  description: 'Fast, high-converting website design and Next.js development in Pune by Foxi Tech. Mobile-friendly, SEO-optimized, delivered in 3 to 12 days with zero monthly retainers.',
  keywords: [
    'web design agency Pune',
    'website design company Pune',
    'Next.js development company India',
    'small business website design Pune',
    'dental clinic website design Pune',
    'doctor website design Pune',
    'best web development services in Pune',
    'budget friendly website design agency in india',
    'Foxi Tech web design',
    'foxitech'
  ],
  alternates: {
    canonical: 'https://www.foxitech.in/services/web-design',
  },
  openGraph: {
    title: 'Website Design & Next.js Development | Foxi Tech Pune',
    description: 'Get a lightning-fast, mobile-friendly website that turns Google searchers into paying clients. Delivered in 3-12 days.',
    url: 'https://www.foxitech.in/services/web-design',
    siteName: 'Foxi Tech',
    type: 'website',
  },
};

export default function WebDesignServicePage() {
  const features = [
    {
      title: 'Ultra-Fast Performance',
      desc: 'Engineered with Next.js 16 and React 19 for sub-second loading speeds and perfect Core Web Vitals.',
      icon: Zap,
    },
    {
      title: 'Mobile-First Architecture',
      desc: 'Over 75% of local searches happen on mobile. We design seamless touch experiences for smartphones and tablets.',
      icon: Smartphone,
    },
    {
      title: 'Conversion-Focused Layout',
      desc: 'Strategic placement of WhatsApp click-to-chat, phone links, and contact forms to turn visitors into leads.',
      icon: Sparkles,
    },
    {
      title: 'Technical SEO Included',
      desc: 'Schema.org JSON-LD, OpenGraph tags, semantic HTML5, and automated XML sitemaps built right in.',
      icon: Code2,
    },
    {
      title: '100% Code & Asset Ownership',
      desc: 'No hidden license fees or proprietary site locks. You own full source code and domains.',
      icon: Shield,
    },
    {
      title: 'Rapid 3 to 12 Day Delivery',
      desc: 'Launch your website this week while competitors are still waiting on months of agency design drafts.',
      icon: Monitor,
    },
  ];

  const faqs = [
    {
      q: 'How fast can Foxi Tech design and launch my website?',
      a: 'A Single Page website is live in 3 days, a Static Multi-Page website in 7 days, and a Dynamic website with booking and payment integrations takes 10 to 12 days.',
    },
    {
      q: 'Will my website rank on Google search?',
      a: 'Yes. Every website we build includes on-page SEO, schema markup, Google Search Console integration, and optimized metadata to ensure fast indexing and ranking.',
    },
    {
      q: 'Do I have to pay monthly fees to Foxi Tech?',
      a: 'No. Foxi Tech charges a transparent, one-time fee with no monthly agency retainers. You only pay your annual domain and hosting renewals.',
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
                'name': 'Website Design & Development',
                'serviceType': 'Web Design, Next.js Development, UI/UX Design',
                'description': 'High-performance, mobile-responsive website design and custom web development for small businesses and clinics.',
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
                    'name': 'Website Design',
                    'item': 'https://www.foxitech.in/services/web-design',
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
            <span className="text-white">Website Design</span>
          </div>
          <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight">
            High-Performance Website Design &amp; Development
          </h1>
          <p className="mt-6 text-primary-300 text-base lg:text-xl max-w-3xl leading-relaxed">
            We build ultra-fast, mobile-responsive Next.js websites that build instant trust, rank on Google, and convert visitors into booked clients.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent-600 text-white px-8 py-4 text-sm font-semibold hover:bg-accent-700 transition-colors"
            >
              Get a Free Quote
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
              Engineered to Outperform Competitors
            </h2>
            <p className="text-primary-600 text-base lg:text-lg">
              Every detail is designed around customer psychology and technical perfection.
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
            Ready to Launch Your New Website?
          </h2>
          <p className="text-primary-300 text-sm mb-8">
            Talk to Foxi Tech today. We deliver your full design and launch plan within 2 hours.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-white text-primary-950 px-8 py-4 font-semibold text-sm hover:bg-primary-100 transition-colors"
          >
            Contact Foxi Tech Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
