import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | FOXI TECH',
  description: 'Understand the terms and conditions for utilizing web development and ads services from FOXI TECH.',
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navigation />

      {/* Header Banner */}
      <section className="bg-primary-950 text-white pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <span className="text-accent-500 font-display text-sm font-semibold tracking-wider uppercase mb-3 block">
            Legal Information
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-4 text-primary-300 text-base lg:text-lg max-w-2xl leading-relaxed">
            Effective date: August 7, 2026. These terms govern the development, hosting, and ad management services provided by FOXI TECH.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24 bg-white flex-grow">
        <div className="max-w-[800px] mx-auto px-4 lg:px-0">
          <div className="prose prose-slate max-w-none text-primary-900 space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">1. Scope of Services</h2>
              <p className="text-primary-700 leading-relaxed">
                FOXI TECH provides design and development services for:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-primary-700">
                <li>Single Page, Static, and Dynamic website systems.</li>
                <li>Google Business Profile (Maps) optimization.</li>
                <li>Instagram template setup and content creation.</li>
                <li>Local Search Engine Optimization (SEO) and marketing ad management.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">2. Timelines and Deliveries</h2>
              <p className="text-primary-700 leading-relaxed">
                We make every effort to deliver your projects within our stated guidelines:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-primary-700">
                <li><strong>Single Page:</strong> Live in 3 business days.</li>
                <li><strong>Static Website:</strong> Live in 7 business days.</li>
                <li><strong>Dynamic Website:</strong> Live in 10 to 12 business days.</li>
              </ul>
              <p className="text-primary-700 mt-2 leading-relaxed">
                Delays in providing logo assets, business information, or feedback on drafts will extend the delivery window.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">3. Payments and No Retainers</h2>
              <p className="text-primary-700 leading-relaxed">
                We charge a transparent, one-time flat price for website setup and configuration. We do **not** charge any hidden monthly retainers. 
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-primary-700">
                <li>A 50% deposit is required to initiate design work.</li>
                <li>The remaining 50% balance is due upon website launch or project sign-off.</li>
                <li>Ad budgets for Meta or Google ads are paid directly by the client and are not included in our design pricing.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">4. Intellectual Property</h2>
              <p className="text-primary-700 leading-relaxed">
                Upon receipt of full payment, all intellectual property rights for the website code, custom graphic elements, and optimized copywriting belong completely to you. We reserve the right to display links to completed projects in our sales portfolio.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">5. Termination and Disruption</h2>
              <p className="text-primary-700 leading-relaxed">
                You may request to terminate service at any point during development. If work has already been completed, deposit funds will be handled in accordance with our Refund Policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
