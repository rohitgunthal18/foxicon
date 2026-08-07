import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Support Center | FOXI TECH',
  description: 'Reach our 24/7 client support desk, submit a ticket, or schedule a call with our technical team.',
};

export default function Support() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navigation />

      {/* Header Banner */}
      <section className="bg-primary-950 text-white pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <span className="text-accent-500 font-display text-sm font-semibold tracking-wider uppercase mb-3 block">
            Customer Care
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
            Support Center
          </h1>
          <p className="mt-4 text-primary-300 text-base lg:text-lg max-w-2xl leading-relaxed">
            Need help with your website, Google profile, or ads? Our support desk is online 24/7 to resolve issues quickly.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24 bg-white flex-grow">
        <div className="max-w-[1000px] mx-auto px-4 lg:px-0">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="border border-primary-100 p-6 bg-slate-50 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-primary-950 mb-2">Email Support</h3>
                <p className="text-primary-600 text-sm leading-relaxed mb-4">
                  For complex technical requests, bug reports, and database issues.
                </p>
              </div>
              <a href="mailto:support@foxitech.in" className="text-accent-600 font-semibold hover:text-accent-700 text-sm">
                support@foxitech.in &rarr;
              </a>
            </div>

            <div className="border border-primary-100 p-6 bg-slate-50 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-primary-950 mb-2">WhatsApp Desk</h3>
                <p className="text-primary-600 text-sm leading-relaxed mb-4">
                  Quick adjustments, text edits, and graphic updates. Response in under 1 hour.
                </p>
              </div>
              <a href="https://wa.me/917218616190" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:text-emerald-700 text-sm">
                Chat on WhatsApp &rarr;
              </a>
            </div>

            <div className="border border-primary-100 p-6 bg-slate-50 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-primary-950 mb-2">Phone Hotline</h3>
                <p className="text-primary-600 text-sm leading-relaxed mb-4">
                  For urgent server down issues or launch support. Available 9 AM - 8 PM.
                </p>
              </div>
              <a href="tel:+917218616190" className="text-primary-950 font-semibold hover:text-primary-800 text-sm">
                +91 72186 16190 &rarr;
              </a>
            </div>
          </div>

          <div className="max-w-[600px] mx-auto bg-slate-50 p-8 border border-primary-100">
            <h2 className="font-display text-2xl font-bold text-primary-950 mb-6 text-center">
              Submit a Support Ticket
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sunil Agrawal"
                  className="w-full px-4 py-2.5 border border-primary-200 focus:border-primary-950 outline-none transition text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2">
                  Your Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 border border-primary-200 focus:border-primary-950 outline-none transition text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2">
                  Category
                </label>
                <select className="w-full px-4 py-2.5 border border-primary-200 focus:border-primary-950 outline-none transition text-sm bg-white">
                  <option>Website Text/Image Edit</option>
                  <option>Domain/Hosting Issue</option>
                  <option>Google Maps Profile Support</option>
                  <option>Instagram Template Question</option>
                  <option>Ad Campaign Adjustment</option>
                  <option>Other / General Enquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2">
                  Description of Issue
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what needs editing or fixing..."
                  className="w-full px-4 py-2.5 border border-primary-200 focus:border-primary-950 outline-none transition text-sm bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary-950 hover:bg-primary-900 text-white font-semibold text-sm transition tracking-wider uppercase"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
