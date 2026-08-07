import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Refund Policy | FOXI TECH',
  description: 'Review our transparent refund policy and satisfaction guarantees for all digital products and services.',
};

export default function RefundPolicy() {
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
            Refund Policy
          </h1>
          <p className="mt-4 text-primary-300 text-base lg:text-lg max-w-2xl leading-relaxed">
            Effective date: August 7, 2026. We aim for complete clarity. This policy details how cancellations, changes, and refunds are handled.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24 bg-white flex-grow">
        <div className="max-w-[800px] mx-auto px-4 lg:px-0">
          <div className="prose prose-slate max-w-none text-primary-900 space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">1. Web Development Refund Rules</h2>
              <p className="text-primary-700 leading-relaxed">
                Because web design and development require substantial upfront resource allocation and customized planning, our refund eligibility is structured as follows:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 text-primary-700">
                <li><strong>100% Refund:</strong> Available if you cancel your order within 24 hours of payment and before any setup, planning, or mapping work has begun.</li>
                <li><strong>50% Refund:</strong> Available if work has started but we have not yet delivered the initial design mockups or wireframes.</li>
                <li><strong>No Refund:</strong> Once initial design drafts are submitted for review, or after the website goes live, the deposit and final payments are non-refundable.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">2. Marketing and Ad Management</h2>
              <p className="text-primary-700 leading-relaxed">
                Fees for advertising setup, SEO optimization, and campaign launch services are non-refundable once configuration has begun. Ad spend paid directly to platforms like Google Ads or Meta is completely managed by those systems and is entirely non-refundable by FOXI TECH.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">3. How to Request a Refund</h2>
              <p className="text-primary-700 leading-relaxed">
                To request a refund or cancellation, please email us at support@foxitech.in with your project ID, agreement details, and the reason for your request. We review all requests within 3 business days and process eligible refunds to your original payment method.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">4. Revisions and Modifications</h2>
              <p className="text-primary-700 leading-relaxed">
                Instead of a refund, we offer a dedicated revision period to ensure you are 100% satisfied with the layout, assets, and design before launch. Please see your Service Agreement for specific details on the number of revision rounds included in your plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
