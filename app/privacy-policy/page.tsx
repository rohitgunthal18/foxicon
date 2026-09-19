import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | Foxi Tech',
  description: 'Learn how Foxi Tech collects, uses, and protects your business and personal information.',
};

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-primary-300 text-base lg:text-lg max-w-2xl leading-relaxed">
            Last updated: August 7, 2026. This policy explains how we handle your data when you visit our website, use our back office, or contact us.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24 bg-white flex-grow">
        <div className="max-w-[800px] mx-auto px-4 lg:px-0">
          <div className="prose prose-slate max-w-none text-primary-900 space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">1. Information We Collect</h2>
              <p className="text-primary-700 leading-relaxed">
                We collect information directly from you when you submit a contact form, request a voice agent callback demo, or register an agreement. This information may include:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-primary-700">
                <li>Your name and contact details (email address and phone number).</li>
                <li>Your business details (company name, city, website, and Google Maps profile details).</li>
                <li>Any messages, comments, or inputs you provide in our forms.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">2. How We Use Your Information</h2>
              <p className="text-primary-700 leading-relaxed">
                We use the collected information for the following business purposes:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-primary-700">
                <li>To provide and manage our services, website, and admin platform.</li>
                <li>To schedule and place automatic sales voice calls using our AI outbound calling systems (Sarvam AI integration).</li>
                <li>To respond to your inquiries and support requests.</li>
                <li>To compile business and operational agreements.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">3. Data Sharing and Integrations</h2>
              <p className="text-primary-700 leading-relaxed">
                We do not sell, rent, or trade your personal data. To provide our core services, we securely share specific contact information with trusted services:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-primary-700">
                <li><strong>Supabase:</strong> For secure database storage, user authentication, and data integrity.</li>
                <li><strong>Sarvam AI:</strong> To execute conversational voice call campaigns and synthesize call audio.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">4. Security</h2>
              <p className="text-primary-700 leading-relaxed">
                We implement strict security measures including Row Level Security (RLS) policies inside Supabase to safeguard admin records, lead interactions, and transcripts. However, no database or transmission channel is 100% secure. Please protect your account login credentials.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-primary-950 mb-3">5. Your Choices and Rights</h2>
              <p className="text-primary-700 leading-relaxed">
                Depending on your location, you may have the right to request access to, correction of, or deletion of the personal data we store. If you wish to opt out of callback demos or have your details removed, please write to us at support@foxitech.in.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
