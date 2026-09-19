import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Contact from '@/components/Contact';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Foxi Tech - Get a Free Quote & Consultation',
  description: 'Get in touch with Foxi Tech. Contact us at contact@foxitech.in or call +91 7218616190. Request a free quote for web design, local SEO, or software development in Pune.',
  keywords: [
    'Contact Foxi Tech',
    'Foxi Tech phone number',
    'Foxi Tech email',
    'Foxi Tech address',
    'web design consultation Pune',
    'foxitech contact'
  ],
  alternates: {
    canonical: 'https://www.foxitech.in/contact',
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            'name': 'Contact Foxi Tech',
            'description': 'Contact Foxi Tech for website design, local SEO, and digital marketing inquiries.',
            'url': 'https://www.foxitech.in/contact',
            'mainEntity': {
              '@type': 'LocalBusiness',
              'name': 'Foxi Tech',
              'email': 'contact@foxitech.in',
              'telephone': '+917218616190',
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': 'Shop 4, Tech Plaza, Baner Road',
                'addressLocality': 'Pune',
                'postalCode': '411045',
                'addressRegion': 'Maharashtra',
                'addressCountry': 'IN',
              },
            },
          }),
        }}
      />

      <Navigation />

      {/* Header Banner */}
      <section className="bg-primary-950 text-white pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <span className="text-accent-500 font-display text-sm font-semibold tracking-wider uppercase mb-3 block">
            Get In Touch
          </span>
          <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight">
            Let&apos;s Build Something Great Together
          </h1>
          <p className="mt-6 text-primary-300 text-base lg:text-xl max-w-3xl leading-relaxed">
            Have a project in mind or need help ranking your business on Google? Send us a message or call us directly. We respond within two hours.
          </p>
        </div>
      </section>

      {/* Contact Component */}
      <Contact />

      <Footer />
    </main>
  );
}
