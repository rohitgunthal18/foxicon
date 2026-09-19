import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.foxitech.in'),
  title: {
    default: "Foxi Tech | Web Design, Local SEO & Software Agency Pune",
    template: "%s | Foxi Tech"
  },
  description: "Foxi Tech (https://www.foxitech.in) is a premier digital marketing, custom software, and website design agency in Pune, India. We build high-converting Next.js websites, rank businesses #1 on Google Maps, and manage high-ROI Meta & Google ads with zero monthly retainers.",
  keywords: [
    "Foxi Tech",
    "foxitech",
    "FoxiTech",
    "Foxi Tech Pune",
    "Foxi Tech agency",
    "foxitech.in",
    "Foxi Tech India",
    "web design agency Pune",
    "best web development services in Pune",
    "digital marketing agency in Pune",
    "local SEO services Pune",
    "Google Maps ranking Pune",
    "Google Business Profile optimization India",
    "budget friendly website design agency in india",
    "custom software development Pune",
    "Meta ads agency Pune",
    "Next.js development company India",
    "dental clinic website design Pune",
    "doctor website design Pune",
    "web design agency Bangalore",
    "digital marketing agency Hyderabad",
    "website design company Delhi",
    "web development Mumbai",
    "digital marketing agency Kolkata",
    "web design agency Chennai",
    "web design Coimbatore"
  ],
  authors: [{ name: "Foxi Tech", url: "https://www.foxitech.in" }],
  creator: "Foxi Tech",
  publisher: "Foxi Tech",
  alternates: {
    canonical: '/',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Foxi Tech | Web Design, Local SEO & Software Agency Pune",
    description: "Foxi Tech delivers high-performance Next.js websites, Google Maps top rankings, and high-ROI Meta/Google ads for businesses across India. Live in 3 to 12 days.",
    url: "https://www.foxitech.in",
    siteName: "Foxi Tech",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: '/datacenter4.webp',
        width: 1200,
        height: 630,
        alt: 'Foxi Tech - Web Design & Digital Growth Agency',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Foxi Tech | Web Design, Local SEO & Software Agency",
    description: "Websites, Google Maps optimization, Instagram kits, and Meta ads for businesses across India. Fast turnarounds, no monthly retainers.",
    images: ['/datacenter4.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.foxitech.in/#organization',
        'name': 'Foxi Tech',
        'alternateName': ['Foxitech', 'FoxiTech', 'Foxi Tech Agency', 'Foxi Tech India', 'Foxi Tech Pune'],
        'url': 'https://www.foxitech.in',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://www.foxitech.in/favicon.svg',
        },
        'founder': {
          '@type': 'Person',
          'name': 'Rohit Gunthal',
          'jobTitle': 'Founder & CEO',
          'url': 'https://www.foxitech.in',
        },
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
        'sameAs': [
          'https://www.linkedin.com/company/foxi-tech',
          'https://www.instagram.com/foxitech.in',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.foxitech.in/#website',
        'url': 'https://www.foxitech.in',
        'name': 'Foxi Tech',
        'alternateName': 'Foxitech',
        'publisher': {
          '@id': 'https://www.foxitech.in/#organization',
        },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://www.foxitech.in/blog?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SiteNavigationElement',
        '@id': 'https://www.foxitech.in/#navigation',
        'name': [
          'Website Design',
          'Local SEO & Google Maps',
          'Meta & Google Ads',
          'Custom Software Development',
          'AI Voice Automation',
          'Pricing & Packages',
          'About Us',
          'Careers',
          'Blog & Guides',
          'Support Center',
          'Contact Us',
        ],
        'url': [
          'https://www.foxitech.in/services/web-design',
          'https://www.foxitech.in/services/local-seo',
          'https://www.foxitech.in/services/google-ads',
          'https://www.foxitech.in/services/custom-software',
          'https://www.foxitech.in/services/ai-automation',
          'https://www.foxitech.in/pricing',
          'https://www.foxitech.in/about',
          'https://www.foxitech.in/careers',
          'https://www.foxitech.in/blog',
          'https://www.foxitech.in/support',
          'https://www.foxitech.in/contact',
        ],
      },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2EJ6GNHG3T"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-2EJ6GNHG3T');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
        />
      </head>
      <body className="font-sans antialiased bg-white text-primary-900">{children}</body>
    </html>
  );
}
