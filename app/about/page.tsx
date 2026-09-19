import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import About from '@/components/About';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Award, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Foxi Tech - Web Design & Digital Marketing Agency',
  description: 'Learn about Foxi Tech, Pune\'s leading web design, local SEO, and custom software development agency. Fast turnarounds, fixed pricing, and high-converting digital presence.',
  keywords: [
    'About Foxi Tech',
    'Foxi Tech Pune',
    'web design agency Pune',
    'software development company Pune',
    'digital marketing agency Pune',
    'Foxi Tech founder',
    'foxitech'
  ],
  alternates: {
    canonical: 'https://www.foxitech.in/about',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            'name': 'About Foxi Tech',
            'description': 'Foxi Tech is a premier digital marketing, website design, and software agency headquartered in Pune, India.',
            'url': 'https://www.foxitech.in/about',
            'mainEntity': {
              '@type': 'Organization',
              'name': 'Foxi Tech',
              'url': 'https://www.foxitech.in',
              'founder': {
                '@type': 'Person',
                'name': 'Rohit Gunthal',
                'jobTitle': 'Founder & CEO',
              },
              'foundingLocation': {
                '@type': 'Place',
                'name': 'Pune, Maharashtra, India',
              },
              'email': 'contact@foxitech.in',
              'telephone': '+917218616190',
            },
          }),
        }}
      />

      <Navigation />

      {/* Header Banner */}
      <section className="bg-primary-950 text-white pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <span className="text-accent-500 font-display text-sm font-semibold tracking-wider uppercase mb-3 block">
            Who We Are
          </span>
          <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight">
            Engineering Digital Growth for Modern Businesses
          </h1>
          <p className="mt-6 text-primary-300 text-base lg:text-xl max-w-3xl leading-relaxed">
            Foxi Tech is a full-service web design, local SEO, and software development agency. We build fast, conversion-focused websites and high-ROI acquisition funnels with zero monthly retainers.
          </p>
        </div>
      </section>

      {/* Main About Component */}
      <About />

      {/* Agency Mission & Engineering Standards */}
      <section className="py-20 bg-white border-t border-primary-100">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <div className="max-w-3xl mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-950 mb-6">
              Why Forward-Thinking Businesses Choose Foxi Tech
            </h2>
            <p className="text-primary-600 text-lg leading-relaxed">
              Traditional agencies lock clients into lengthy retainers while delivering slow WordPress templates. At Foxi Tech, we combine cutting-edge tech stacks with local search dominance to deliver measurable ROI in days, not months.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-primary-100 p-8 hover:border-primary-950 transition-colors">
              <div className="w-12 h-12 bg-primary-100 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary-950" />
              </div>
              <h3 className="font-display text-xl font-bold text-primary-950 mb-3">
                Modern Stack Performance
              </h3>
              <p className="text-primary-600 text-sm leading-relaxed">
                Built on Next.js 16, React 19, and Tailwind CSS. Sites load in under 1.5 seconds, providing superior Core Web Vitals and higher Google rankings.
              </p>
            </div>

            <div className="border border-primary-100 p-8 hover:border-primary-950 transition-colors">
              <div className="w-12 h-12 bg-primary-100 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-primary-950" />
              </div>
              <h3 className="font-display text-xl font-bold text-primary-950 mb-3">
                100% Asset Ownership
              </h3>
              <p className="text-primary-600 text-sm leading-relaxed">
                No hostage codes or monthly lease fees. You own 100% of your domain, codebase, database, and creative assets once completed.
              </p>
            </div>

            <div className="border border-primary-100 p-8 hover:border-primary-950 transition-colors">
              <div className="w-12 h-12 bg-primary-100 flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-primary-950" />
              </div>
              <h3 className="font-display text-xl font-bold text-primary-950 mb-3">
                Full-Funnel Local SEO
              </h3>
              <p className="text-primary-600 text-sm leading-relaxed">
                From Google Business Profile verification and review generation kits to targeted Meta and Google ads, we turn searchers into paying clients.
              </p>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-16 bg-primary-50 border border-primary-200 p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-primary-950 mb-2">
                Ready to dominate your local market?
              </h3>
              <p className="text-primary-600 text-sm">
                Get a customized project proposal and fixed quote within two hours.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-primary-950 text-white px-8 py-4 font-semibold text-sm hover:bg-accent-600 transition-colors shrink-0"
            >
              Start Your Project
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
