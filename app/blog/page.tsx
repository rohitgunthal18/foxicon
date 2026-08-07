import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Insights & Blog | FOXI TECH',
  description: 'Digital growth guides, Local SEO strategies, and Google Maps tips for dental clinics and local businesses.',
};

export default function Blog() {
  const posts = [
    {
      title: 'Why 90% of Local Dental Clinics Lose Bookings Without a Dedicated Website',
      date: 'August 5, 2026',
      readTime: '5 min read',
      excerpt: 'Relying solely on Google Maps reviews or social media is a dangerous trap. Discover how a dedicated single-page website acts as the closing hub for new patient bookings.',
      slug: 'why-dental-clinics-need-website',
    },
    {
      title: 'The Ultimate Guide to Collecting Your First 100 Google Maps Reviews Legally',
      date: 'July 28, 2026',
      readTime: '6 min read',
      excerpt: 'Positive reviews on Google Maps are the number-one search ranking factor. Learn our review kit playbook and review collection strategies to skyrocket your local map ranking.',
      slug: 'collecting-first-100-google-reviews',
    },
    {
      title: 'Understanding AI Voice Assistants: How Voice Agents automate Clinic Callbacks',
      date: 'July 14, 2026',
      readTime: '4 min read',
      excerpt: 'AI-powered voice agents are changing cold calling and appointment follow-ups. We explain the security, latency, and callback features of automated calling.',
      slug: 'understanding-ai-voice-assistants',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navigation />

      {/* Header Banner */}
      <section className="bg-primary-950 text-white pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <span className="text-accent-500 font-display text-sm font-semibold tracking-wider uppercase mb-3 block">
            FOXI Insights
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
            Our Blog &amp; Guides
          </h1>
          <p className="mt-4 text-primary-300 text-base lg:text-lg max-w-2xl leading-relaxed">
            Actionable design advice, Local SEO tips, and tech reviews to help you scale your small business or clinical practice across India.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24 bg-white flex-grow">
        <div className="max-w-[900px] mx-auto px-4 lg:px-0">
          <div className="grid md:grid-cols-1 gap-12">
            {posts.map((post, idx) => (
              <article key={idx} className="border-b border-primary-100 pb-12 last:border-b-0">
                <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider text-primary-500 mb-3">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-primary-950 hover:text-accent-700 transition cursor-pointer mb-3">
                  {post.title}
                </h2>
                <p className="text-primary-700 text-sm lg:text-base leading-relaxed mb-6">
                  {post.excerpt}
                </p>
                <button
                  type="button"
                  className="font-semibold text-sm text-primary-950 hover:text-accent-600 transition"
                >
                  Read Full Article &rarr;
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
