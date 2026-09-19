import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Plans | Foxi Tech - Transparent Web Design Packages',
  description: 'Explore Foxi Tech\'s transparent, one-time pricing for website design, Google Maps setup, and digital marketing. Zero monthly retainers. Starting from ₹4,999.',
  keywords: [
    'Foxi Tech pricing',
    'website design packages Pune',
    'affordable website design India',
    'budget friendly website design agency in india',
    'web development cost Pune',
    'foxitech pricing'
  ],
  alternates: {
    canonical: 'https://www.foxitech.in/pricing',
  },
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': 'Pricing & Plans | Foxi Tech',
            'description': 'Transparent web design and digital marketing packages with zero monthly retainers.',
            'url': 'https://www.foxitech.in/pricing',
            'offers': [
              {
                '@type': 'Offer',
                'name': 'Single Page Website',
                'price': '4999',
                'priceCurrency': 'INR',
                'description': 'One beautifully designed page, mobile-friendly, WhatsApp button, Google Maps embed, live in 3 days.',
              },
              {
                '@type': 'Offer',
                'name': 'Static Website',
                'price': '9999',
                'priceCurrency': 'INR',
                'description': 'Up to 5 custom pages, fast secure hosting setup, basic Google search setup, 1 year support, live in 7 days.',
              },
              {
                '@type': 'Offer',
                'name': 'Dynamic Website & Booking System',
                'price': '19999',
                'priceCurrency': 'INR',
                'description': 'Up to 10 pages, self-edit CMS dashboard, 24/7 online booking, payment gateway, live in 10-12 days.',
              },
            ],
          }),
        }}
      />

      <Navigation />

      {/* Header Banner */}
      <section className="bg-primary-950 text-white pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <span className="text-accent-500 font-display text-sm font-semibold tracking-wider uppercase mb-3 block">
            Transparent Pricing
          </span>
          <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight">
            Simple, Honest Pricing With Zero Retainers
          </h1>
          <p className="mt-6 text-primary-300 text-base lg:text-xl max-w-3xl leading-relaxed">
            What you see is what you pay. Every package includes full source code ownership, mobile-responsive layout, and search engine optimization.
          </p>
        </div>
      </section>

      {/* Pricing Table Component */}
      <Pricing />

      {/* FAQ Component */}
      <FAQ />

      <Footer />
    </main>
  );
}
