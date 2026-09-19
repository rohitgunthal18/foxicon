import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, MapPin, Star, ShieldCheck, Zap, Phone, Mail } from 'lucide-react';

interface CityData {
  slug: string;
  name: string;
  state: string;
  tagline: string;
  description: string;
  neighborhoods: string[];
  pricingStarting: string;
  turnaroundDays: string;
}

const CITIES: Record<string, CityData> = {
  pune: {
    slug: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    tagline: 'Leading Web Design & Digital Marketing Agency in Pune',
    description: 'Foxi Tech is Pune\'s premier digital marketing, custom software, and website design agency. Headquartered in Baner, we help local businesses, clinics, and startups rank #1 on Google Maps and launch high-converting Next.js websites in days.',
    neighborhoods: ['Baner', 'Koregaon Park', 'Hinjewadi', 'Viman Nagar', 'Kharadi', 'Kothrud', 'Hadapsar', 'Wakad', 'Shivajinagar'],
    pricingStarting: '₹4,999',
    turnaroundDays: '3 to 7 Days',
  },
  bangalore: {
    slug: 'bangalore',
    name: 'Bangalore (Bengaluru)',
    state: 'Karnataka',
    tagline: 'Best Web Development & Digital Marketing Agency in Bangalore',
    description: 'Scale your startup or enterprise with Foxi Tech\'s Next.js web development, local SEO, and Meta/Google ads in Bangalore. We deliver lightning-fast modern websites with zero monthly retainers.',
    neighborhoods: ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Electronic City', 'Jayanagar', 'Bellandur'],
    pricingStarting: '₹4,999',
    turnaroundDays: '3 to 7 Days',
  },
  hyderabad: {
    slug: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    tagline: 'Top Web Design & Performance Marketing Agency in Hyderabad',
    description: 'Foxi Tech provides high-converting website design, Google Business Profile ranking, and automated AI lead calling for clinics, tech startups, and businesses across Hyderabad and HITEC City.',
    neighborhoods: ['HITEC City', 'Gachibowli', 'Madhapur', 'Jubilee Hills', 'Banjara Hills', 'Kondapur', 'Kukatpally'],
    pricingStarting: '₹4,999',
    turnaroundDays: '3 to 7 Days',
  },
  delhi: {
    slug: 'delhi',
    name: 'Delhi NCR',
    state: 'Delhi',
    tagline: 'Premier Web Design & Digital Growth Agency in Delhi NCR',
    description: 'Expand your reach across Delhi, Gurgaon, and Noida with Foxi Tech. Premium web development, Google Maps top 3 rankings, and high-ROI Meta ad funnels with transparent fixed pricing.',
    neighborhoods: ['Connaught Place', 'Gurgaon Cyber City', 'Golf Course Road', 'Noida Sector 62', 'South Extension', 'Saket'],
    pricingStarting: '₹4,999',
    turnaroundDays: '3 to 7 Days',
  },
  mumbai: {
    slug: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    tagline: 'Leading Digital Marketing & Web Development in Mumbai',
    description: 'Foxi Tech empowers commercial firms, clinics, and brands in Mumbai with high-performance Next.js websites, local SEO dominance, and precision paid advertising.',
    neighborhoods: ['Bandra Kurla Complex (BKC)', 'Andheri', 'Powai', 'South Mumbai', 'Thane', 'Navi Mumbai'],
    pricingStarting: '₹4,999',
    turnaroundDays: '3 to 7 Days',
  },
  kolkata: {
    slug: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    tagline: 'Budget-Friendly Web Design & Digital Marketing in Kolkata',
    description: 'Looking for a budget-friendly website design agency in Kolkata? Foxi Tech builds fast, modern, mobile-friendly websites and Google Maps setups starting at ₹4,999 with zero retainers.',
    neighborhoods: ['Salt Lake (Bidhannagar)', 'New Town', 'Park Street', 'Ballygunge', 'Howrah', 'Alipore'],
    pricingStarting: '₹4,999',
    turnaroundDays: '3 to 7 Days',
  },
  chennai: {
    slug: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    tagline: 'Top Web Development & Local SEO Agency in Chennai',
    description: 'Foxi Tech provides rapid Next.js website design, Google Maps 3-Pack optimization, and paid ad management for businesses across Chennai and the OMR tech corridor.',
    neighborhoods: ['OMR', 'Guindy', 'T. Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Alwarpet'],
    pricingStarting: '₹4,999',
    turnaroundDays: '3 to 7 Days',
  },
  coimbatore: {
    slug: 'coimbatore',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    tagline: 'Best Digital Marketing & Website Design in Coimbatore',
    description: 'Foxi Tech supports retail, healthcare, and industrial enterprises across Coimbatore with modern web applications, Google Business Profile ranking, and high-converting marketing funnels.',
    neighborhoods: ['Gandhipuram', 'RS Puram', 'Peelamedu', 'Saibaba Colony', 'Saravanampatti'],
    pricingStarting: '₹4,999',
    turnaroundDays: '3 to 7 Days',
  },
};

export async function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const data = CITIES[city.toLowerCase()];

  if (!data) {
    return { title: 'Location Not Found | Foxi Tech' };
  }

  return {
    title: `Best Web Development & Digital Marketing Agency in ${data.name} | Foxi Tech`,
    description: `Looking for top web design or digital marketing services in ${data.name}? Foxi Tech builds fast Next.js websites, ranks businesses #1 on Google Maps, and drives sales with Meta/Google ads.`,
    keywords: [
      `best web development services in ${data.name}`,
      `digital marketing agency in ${data.name}`,
      `website design company ${data.name}`,
      `local SEO services ${data.name}`,
      `Google Maps ranking ${data.name}`,
      `budget friendly website design agency in india`,
      `Foxi Tech ${data.name}`,
      `foxitech ${data.name}`,
    ],
    alternates: {
      canonical: `https://www.foxitech.in/locations/${data.slug}`,
    },
    openGraph: {
      title: `Best Web Development & Digital Marketing Agency in ${data.name} | Foxi Tech`,
      description: data.description,
      url: `https://www.foxitech.in/locations/${data.slug}`,
      siteName: 'Foxi Tech',
      type: 'website',
    },
  };
}

export default async function CityLocationPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const data = CITIES[city.toLowerCase()];

  if (!data) {
    notFound();
  }

  const faqs = [
    {
      q: `What are the best web development services in ${data.name}?`,
      a: `Foxi Tech is ranked among the top web development providers in ${data.name}, offering ultra-fast Next.js websites, mobile-responsive UI/UX, and custom software systems with guaranteed delivery in 3 to 12 days.`,
    },
    {
      q: `Which digital marketing agency in ${data.name} offers transparent pricing with no retainers?`,
      a: `Foxi Tech offers completely transparent, one-time flat pricing with zero monthly retainers for businesses in ${data.name}. Packages start from ${data.pricingStarting} with full code and asset ownership.`,
    },
    {
      q: `How does Foxi Tech help my business rank #1 on Google Maps in ${data.name}?`,
      a: `We execute full Google Business Profile optimization, local NAP citations, geotagged content, and provide our proprietary 50 five-star review kit to get your business into the top 3 spots in ${data.name}.`,
    },
    {
      q: `Who is the founder of Foxi Tech?`,
      a: `Rohit Gunthal is the Founder & CEO of Foxi Tech, leading the agency to serve modern businesses across ${data.name} and India.`,
    },
  ];

  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">
      {/* Localized Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'ProfessionalService',
                '@id': `https://www.foxitech.in/locations/${data.slug}#organization`,
                'name': `Foxi Tech - ${data.name}`,
                'alternateName': [`Foxitech ${data.name}`, 'Foxi Tech'],
                'url': `https://www.foxitech.in/locations/${data.slug}`,
                'telephone': '+917218616190',
                'email': 'contact@foxitech.in',
                'priceRange': '₹₹',
                'founder': {
                  '@type': 'Person',
                  'name': 'Rohit Gunthal',
                  'jobTitle': 'Founder & CEO',
                  'url': 'https://www.foxitech.in',
                },
                'areaServed': {
                  '@type': 'City',
                  'name': data.name,
                },
                'address': {
                  '@type': 'PostalAddress',
                  'addressLocality': data.name,
                  'addressRegion': data.state,
                  'addressCountry': 'IN',
                },
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
                    'name': 'Locations',
                    'item': 'https://www.foxitech.in/#locations',
                  },
                  {
                    '@type': 'ListItem',
                    'position': 3,
                    'name': data.name,
                    'item': `https://www.foxitech.in/locations/${data.slug}`,
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
            <span>Locations</span>
            <span>/</span>
            <span className="text-white">{data.name}</span>
          </div>
          <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight">
            {data.tagline}
          </h1>
          <p className="mt-6 text-primary-300 text-base lg:text-xl max-w-3xl leading-relaxed">
            {data.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent-600 text-white px-8 py-4 text-sm font-semibold hover:bg-accent-700 transition-colors"
            >
              Get a Quote in {data.name}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-primary-700 text-white px-8 py-4 text-sm font-semibold hover:bg-primary-900 transition-colors"
            >
              View Transparent Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="border border-primary-100 p-8">
              <div className="w-12 h-12 bg-primary-100 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary-950" />
              </div>
              <h3 className="font-display text-xl font-bold text-primary-950 mb-2">
                Fast Turnaround
              </h3>
              <p className="text-primary-600 text-sm">
                Websites delivered and live in {data.turnaroundDays}. Start capturing leads immediately.
              </p>
            </div>

            <div className="border border-primary-100 p-8">
              <div className="w-12 h-12 bg-primary-100 flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-primary-950" />
              </div>
              <h3 className="font-display text-xl font-bold text-primary-950 mb-2">
                Local Map Dominance
              </h3>
              <p className="text-primary-600 text-sm">
                Rank in the Google Maps 3-Pack across {data.name} and collect 50+ real reviews.
              </p>
            </div>

            <div className="border border-primary-100 p-8">
              <div className="w-12 h-12 bg-primary-100 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-primary-950" />
              </div>
              <h3 className="font-display text-xl font-bold text-primary-950 mb-2">
                Zero Monthly Retainers
              </h3>
              <p className="text-primary-600 text-sm">
                Packages start at {data.pricingStarting} with 100% code, domain, and asset ownership.
              </p>
            </div>
          </div>

          {/* Neighborhoods Served */}
          <div className="border border-primary-200 p-8 lg:p-12 bg-slate-50">
            <h2 className="font-display text-2xl font-bold text-primary-950 mb-4">
              Key Areas &amp; Neighborhoods Served in {data.name}
            </h2>
            <p className="text-primary-600 text-sm mb-6">
              Foxi Tech supports clinics, retailers, tech startups, and professional firms across the entire metropolitan area:
            </p>
            <div className="flex flex-wrap gap-3">
              {data.neighborhoods.map((n, idx) => (
                <span
                  key={idx}
                  className="bg-white border border-primary-200 px-4 py-2 text-xs font-semibold text-primary-900"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Localized FAQ Section */}
      <section className="py-20 bg-primary-50 border-t border-primary-200">
        <div className="max-w-[1000px] mx-auto px-4 lg:px-0">
          <h2 className="font-display text-3xl font-bold text-primary-950 mb-8 text-center">
            Frequently Asked Questions in {data.name}
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
            Grow Your Business in {data.name}
          </h2>
          <p className="text-primary-300 text-sm mb-8">
            Contact Foxi Tech today. Email us at contact@foxitech.in or call +91 7218616190.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-white text-primary-950 px-8 py-4 font-semibold text-sm hover:bg-primary-100 transition-colors"
          >
            Start Your Project Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
