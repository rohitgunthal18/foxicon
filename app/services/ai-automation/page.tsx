import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Bot, PhoneCall, Zap, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Voice Agents & Business Automation | Foxi Tech Pune',
  description: 'Automate sales calls, appointment bookings, and lead follow-ups with AI voice agents by Foxi Tech Pune. Multilingual voice assistants powered by Sarvam AI.',
  keywords: [
    'AI voice agents Pune',
    'AI calling agency India',
    'automated appointment booking AI',
    'Sarvam AI voice bot',
    'business automation agency Pune',
    'Foxi Tech AI automation',
    'foxitech'
  ],
  alternates: {
    canonical: 'https://www.foxitech.in/services/ai-automation',
  },
  openGraph: {
    title: 'AI Voice Agents & Business Automation | Foxi Tech Pune',
    description: 'Never miss a lead again. Foxi Tech builds AI voice agents that call new leads within 2 minutes and book appointments automatically.',
    url: 'https://www.foxitech.in/services/ai-automation',
    siteName: 'Foxi Tech',
    type: 'website',
  },
};

export default function AIAutomationServicePage() {
  const features = [
    {
      title: 'Instant 2-Minute Lead Callbacks',
      desc: 'The moment a lead fills out your form, an AI voice agent dials them instantly, increasing conversion rates by 391%.',
      icon: Clock,
    },
    {
      title: 'Indian English & Hindi Fluency',
      desc: 'Powered by advanced Indian speech models (Sarvam AI) for natural, latency-free conversations that sound authentically human.',
      icon: Bot,
    },
    {
      title: 'Automated Calendar Bookings',
      desc: 'The AI checks your real-time availability, answers common patient/customer questions, and locks in appointment slots.',
      icon: PhoneCall,
    },
    {
      title: '24/7 After-Hours Coverage',
      desc: 'Capture and qualify leads on evenings, weekends, and holidays when your front desk or sales team is offline.',
      icon: Zap,
    },
    {
      title: 'Call Recording & CRM Sync',
      desc: 'Every call generates a full transcript, audio recording, and lead sentiment analysis automatically synced to your dashboard.',
      icon: Sparkles,
    },
    {
      title: 'Strict Privacy & Compliance',
      desc: 'Consent-based calling with automated opt-out handling and secure data processing that protects your brand reputation.',
      icon: ShieldCheck,
    },
  ];

  const faqs = [
    {
      q: 'How does the AI voice agent sound?',
      a: 'The voice agent sounds remarkably natural with human-like intonation, realistic pauses, and fluent comprehension of Indian English and Hindi nuances.',
    },
    {
      q: 'Can the AI handle unexpected customer questions?',
      a: 'Yes. The system prompt is trained on your exact business services, pricing, timings, and FAQs. If a question is outside its scope, it politely offers to connect the caller with human staff.',
    },
    {
      q: 'Is it difficult to integrate with our existing website or CRM?',
      a: 'Not at all. Foxi Tech handles 100% of the technical setup, API connections, and webhook triggers so it works seamlessly in the background.',
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
                'name': 'AI Voice Agents & Business Automation',
                'serviceType': 'AI Voice Assistants, Outbound Lead Calling, Conversational Automation',
                'description': 'Multilingual AI voice assistants that automate appointment bookings and qualify customer leads 24/7.',
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
                    'name': 'AI Voice Automation',
                    'item': 'https://www.foxitech.in/services/ai-automation',
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
            <span className="text-white">AI Automation</span>
          </div>
          <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight">
            Conversational AI Voice Agents &amp; Automation
          </h1>
          <p className="mt-6 text-primary-300 text-base lg:text-xl max-w-3xl leading-relaxed">
            Never miss an inquiry again. Our AI voice agents follow up with incoming leads in under 2 minutes, answer inquiries, and schedule appointments directly into your calendar.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent-600 text-white px-8 py-4 text-sm font-semibold hover:bg-accent-700 transition-colors"
            >
              Request a Live Demo
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
              Speed to Lead Wins the Customer
            </h2>
            <p className="text-primary-600 text-base lg:text-lg">
              Responding within 5 minutes makes you 21 times more likely to qualify a lead.
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
            Automate Your Lead Callbacks Today
          </h2>
          <p className="text-primary-300 text-sm mb-8">
            Experience our voice agent in action. Request a callback demo to test the conversational quality.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-white text-primary-950 px-8 py-4 font-semibold text-sm hover:bg-primary-100 transition-colors"
          >
            Get a Demo Callback
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
