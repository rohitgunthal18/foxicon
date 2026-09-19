import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Code, Database, Server, ShieldCheck, Layers, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Custom Software & Web Application Development | Foxi Tech Pune',
  description: 'Scalable custom software, internal dashboards, booking systems, and SaaS platforms built with Next.js, React, and Supabase by Foxi Tech Pune.',
  keywords: [
    'custom software development Pune',
    'web application development company Pune',
    'Next.js development agency India',
    'SaaS development Pune',
    'Supabase developers Pune',
    'Foxi Tech custom software',
    'foxitech'
  ],
  alternates: {
    canonical: 'https://www.foxitech.in/services/custom-software',
  },
  openGraph: {
    title: 'Custom Software & Web Application Development | Foxi Tech Pune',
    description: 'Bespoke web applications, client portals, and automated back offices built with modern React and PostgreSQL architectures.',
    url: 'https://www.foxitech.in/services/custom-software',
    siteName: 'Foxi Tech',
    type: 'website',
  },
};

export default function CustomSoftwareServicePage() {
  const capabilities = [
    {
      title: 'Full-Stack Web Applications',
      desc: 'High-performance web apps built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS.',
      icon: Code,
    },
    {
      title: 'PostgreSQL & Database Architecture',
      desc: 'Robust relational database schemas with Supabase, Row Level Security (RLS), and automated daily backups.',
      icon: Database,
    },
    {
      title: 'Client Portals & Admin Dashboards',
      desc: 'Streamlined back-office management, role-based access control, and intuitive dashboards for your staff.',
      icon: Server,
    },
    {
      title: 'Automated Agreement & Document Engines',
      desc: 'Dynamic PDF generation, electronic signature verification, and automated client onboarding pipelines.',
      icon: ShieldCheck,
    },
    {
      title: 'API Development & Third-Party Integrations',
      desc: 'Seamless integration with payment gateways (Razorpay, Stripe), WhatsApp Business API, and CRM systems.',
      icon: Layers,
    },
    {
      title: 'Scalable Cloud Architecture',
      desc: 'Serverless deployment on edge networks ensuring 99.9% uptime, minimal latency, and zero server maintenance overhead.',
      icon: Cpu,
    },
  ];

  const faqs = [
    {
      q: 'What technologies does Foxi Tech use for custom software?',
      a: 'We build primarily with Next.js, React, TypeScript, Tailwind CSS, Supabase (PostgreSQL), and Node.js. This guarantees modern security, extreme performance, and long-term maintainability.',
    },
    {
      q: 'Do I own the intellectual property and source code?',
      a: 'Yes, 100%. All custom code, database schemas, and documentation are completely transferred to your ownership upon project completion.',
    },
    {
      q: 'Can Foxi Tech maintain and update our application after launch?',
      a: 'Yes. We provide continuous support, feature updates, and performance monitoring tailored to your business needs.',
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
                'name': 'Custom Software Development',
                'serviceType': 'Custom Web Application, Full-Stack Development, SaaS Engineering',
                'description': 'End-to-end custom software and web application development using Next.js and Supabase.',
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
                    'name': 'Custom Software',
                    'item': 'https://www.foxitech.in/services/custom-software',
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
            <span className="text-white">Custom Software</span>
          </div>
          <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight">
            Custom Software &amp; Scalable Web Applications
          </h1>
          <p className="mt-6 text-primary-300 text-base lg:text-xl max-w-3xl leading-relaxed">
            From client onboarding portals and booking engines to full-scale SaaS platforms. We build fast, secure software tailored to your exact operational workflows.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent-600 text-white px-8 py-4 text-sm font-semibold hover:bg-accent-700 transition-colors"
            >
              Discuss Your Software Project
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

      {/* Capabilities Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-950 mb-4">
              Modern Engineering for Growing Companies
            </h2>
            <p className="text-primary-600 text-base lg:text-lg">
              Enterprise-grade reliability without the enterprise development timeline.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((item, idx) => {
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
            Have a Software Idea to Build?
          </h2>
          <p className="text-primary-300 text-sm mb-8">
            Talk to Foxi Tech engineers. We evaluate your requirements and scope a clear architecture in 24 hours.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-white text-primary-950 px-8 py-4 font-semibold text-sm hover:bg-primary-100 transition-colors"
          >
            Schedule a Technical Call
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
