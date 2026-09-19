import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// Dynamically import below-the-fold components to reduce initial JS bundle and TBT
const Services = dynamic(() => import('@/components/Services'));
const About = dynamic(() => import('@/components/About'));
const Process = dynamic(() => import('@/components/Process'));
const Pricing = dynamic(() => import('@/components/Pricing'));
const Testimonials = dynamic(() => import('@/components/Testimonials'));
const FAQ = dynamic(() => import('@/components/FAQ'));
const Contact = dynamic(() => import('@/components/Contact'));
const Footer = dynamic(() => import('@/components/Footer'));

export const metadata: Metadata = {
  title: 'Foxi Tech | Web Design, Local SEO & Software Agency Pune',
  description: 'Foxi Tech is Pune\'s premier digital marketing, custom software, and website design agency. High-converting Next.js websites, Google Maps #1 rankings, and zero monthly retainers.',
  keywords: [
    'Foxi Tech',
    'foxitech pune',
    'Foxi Tech Pune',
    'foxitech',
    'FoxiTech',
    'web design agency Pune',
    'digital marketing agency Pune',
    'best web development services in Pune',
    'local SEO services Pune',
    'Foxi Tech agency'
  ],
  alternates: {
    canonical: 'https://www.foxitech.in',
  },
};

export default function Home() {
  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': 'https://www.foxitech.in/#organization',
        'name': 'Foxi Tech',
        'alternateName': [
          'Foxitech',
          'FoxiTech',
          'Foxi Tech Pune',
          'Foxi Tech Agency',
          'Foxi Tech India',
        ],
        'image': 'https://www.foxitech.in/favicon.svg',
        'url': 'https://www.foxitech.in',
        'telephone': '+917218616190',
        'email': 'contact@foxitech.in',
        'priceRange': '₹₹',
        'currenciesAccepted': 'INR',
        'paymentAccepted': 'UPI, Net Banking, Credit Card, Debit Card',
        'founder': {
          '@type': 'Person',
          'name': 'Rohit Gunthal',
          'jobTitle': 'Founder & CEO',
          'url': 'https://www.foxitech.in',
        },
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Shop 4, Tech Plaza, Baner Road',
          'addressLocality': 'Pune',
          'postalCode': '411045',
          'addressRegion': 'Maharashtra',
          'addressCountry': 'IN',
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': 18.5590,
          'longitude': 73.7868,
        },
        'areaServed': [
          { '@type': 'City', 'name': 'Pune' },
          { '@type': 'City', 'name': 'Bangalore' },
          { '@type': 'City', 'name': 'Hyderabad' },
          { '@type': 'City', 'name': 'Mumbai' },
          { '@type': 'City', 'name': 'Delhi' },
          { '@type': 'City', 'name': 'Kolkata' },
          { '@type': 'City', 'name': 'Chennai' },
          { '@type': 'City', 'name': 'Coimbatore' },
          { '@type': 'Country', 'name': 'India' },
        ],
        'sameAs': [
          'https://www.linkedin.com/company/foxi-tech',
          'https://www.instagram.com/foxitech.in',
        ],
        'openingHoursSpecification': {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ],
          'opens': '09:00',
          'closes': '20:00',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.foxitech.in/#faq',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Who is the founder of Foxi Tech?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Rohit Gunthal is the Founder and CEO of Foxi Tech, leading the agency in delivering web design, local SEO, and custom software across India.',
            },
          },
          {
            '@type': 'Question',
            'name': 'What are the best web development services in Pune?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Foxi Tech provides top-rated web development services in Pune, building ultra-fast Next.js websites, mobile-first designs, and custom web applications delivered within 3 to 12 days.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Which is the top digital marketing agency in Pune for local businesses?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Foxi Tech is a leading digital marketing agency in Pune specializing in Google Business Profile optimization, Google Maps 3-Pack rankings, and high-converting Meta and Google ads.',
            },
          },
          {
            '@type': 'Question',
            'name': 'What is a budget friendly website design agency in India with no monthly retainers?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Foxi Tech is a budget-friendly website design agency in India offering transparent, one-time pricing starting from ₹4,999. Clients get 100% ownership of their website with zero monthly retainers.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Does Foxi Tech provide web development and digital marketing in Bangalore, Hyderabad, Delhi, Kolkata, Chennai, and Coimbatore?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes. While headquartered in Pune, Foxi Tech provides end-to-end web design, local SEO, custom software development, and performance advertising to businesses in Bangalore, Hyderabad, Delhi NCR, Mumbai, Kolkata, Chennai, and Coimbatore.',
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen">
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />

      <Navigation />
      <Hero />
      <Services />
      <About />
      <Process />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
