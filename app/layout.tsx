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
  title: "FOXI TECH - Web Design & Digital Growth for Small Businesses",
  description: "Websites, Google Maps, Instagram and Meta Ads for small and medium businesses. Everything you need to be found, trusted and booked online — live in 5 days.",
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
