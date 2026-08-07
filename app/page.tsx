import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import Process from '@/components/Process';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "FOXI TECH",
            "image": "https://www.foxitech.in/favicon.svg",
            "@id": "https://www.foxitech.in/#organization",
            "url": "https://www.foxitech.in",
            "telephone": "+917218616190",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Koregaon Park",
              "addressLocality": "Pune",
              "postalCode": "411001",
              "addressRegion": "Maharashtra",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 18.5362,
              "longitude": 73.8930
            },
            "sameAs": [
              "https://www.linkedin.com/company/foxitech",
              "https://twitter.com/foxitech"
            ],
            "priceRange": "$$",
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
              ],
              "opens": "09:00",
              "closes": "20:00"
            }
          })
        }}
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
