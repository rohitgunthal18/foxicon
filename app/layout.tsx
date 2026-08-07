import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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
  title: {
    default: "FOXI TECH | Web Design, Local SEO & Ads Agency Pune",
    template: "%s | FOXI TECH"
  },
  description: "Get premium website design, Google Maps local SEO, Instagram marketing, and high-converting Meta Ads for dental clinics, doctors, and local businesses in Pune, India. No monthly retainers.",
  keywords: [
    "web design agency Pune",
    "local SEO services Pune",
    "dental clinic website design Pune",
    "Google Business Profile optimization India",
    "Instagram marketing agency Pune",
    "doctor website design Pune",
    "small business web development Pune",
    "Google Maps ranking Pune",
    "Meta ads agency Pune",
    "FOXI TECH Pune"
  ],
  authors: [{ name: "FOXI TECH", url: "https://www.foxitech.in" }],
  creator: "FOXI TECH",
  publisher: "FOXI TECH",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: "FOXI TECH | Web Design, Local SEO & Ads Agency Pune",
    description: "Websites, Google Maps optimization, Instagram grids, and automated AI calling for small businesses and clinics. Get booked online — live in 5 days.",
    url: "https://www.foxitech.in",
    siteName: "FOXI TECH",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FOXI TECH | Web Design & Local SEO Pune",
    description: "A complete website, Google Maps review setup, Instagram kits, and Meta ads for local clinics and shops.",
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
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-white text-primary-900">{children}</body>
    </html>
  );
}
