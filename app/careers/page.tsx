import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Careers | Foxi Tech',
  description: 'Join our growing technical and creative agency in Pune. Build the future of local business automation.',
};

export default function Careers() {
  const jobs = [
    {
      title: 'Junior Frontend Developer (React/Next.js)',
      department: 'Engineering',
      location: 'Pune (Hybrid)',
      type: 'Full-time',
      salary: '₹4.5L - ₹6.5L / year',
      description: 'We are looking for a junior developer with strong knowledge of Next.js, React, and Tailwind CSS to build client landing pages, corporate back offices, and integrate voice agents.',
    },
    {
      title: 'Social Media & Brand Designer',
      department: 'Creative',
      location: 'Pune (On-site)',
      type: 'Full-time',
      salary: '₹3.6L - ₹4.8L / year',
      description: 'Help small businesses shine. You will design Instagram grids, reels templates, brand books, and custom Google Business visual assets for local clinics and retail brands.',
    },
    {
      title: 'Account Manager & Client Coordinator',
      department: 'Client Success',
      location: 'Pune (Hybrid)',
      type: 'Full-time',
      salary: '₹4.0L - ₹5.5L / year',
      description: 'Coordinate development pipelines, onboarding checklists, and run feedback calls with owners of dental clinics, retail shops, and professional firms across India.',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navigation />

      {/* Header Banner */}
      <section className="bg-primary-950 text-white pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <span className="text-accent-500 font-display text-sm font-semibold tracking-wider uppercase mb-3 block">
            Join the Team
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
            Careers at Foxi Tech
          </h1>
          <p className="mt-4 text-primary-300 text-base lg:text-lg max-w-2xl leading-relaxed">
            Build high-performance web systems and AI tools for small businesses. Join a fast-paced agency committed to real digital growth.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24 bg-white flex-grow">
        <div className="max-w-[900px] mx-auto px-4 lg:px-0">
          <div className="mb-16">
            <h2 className="font-display text-3xl font-bold text-primary-950 mb-4">Why Work with Us?</h2>
            <p className="text-primary-700 leading-relaxed max-w-3xl">
              At FOXI TECH, we eliminate corporate fluff. We deliver working code and live marketing campaigns to real local businesses. You will work on production Next.js apps, explore advanced database scaling with Supabase, configure voice-agent integrations, and see the direct impact of your efforts.
            </p>
          </div>

          <h2 className="font-display text-2xl font-bold text-primary-950 mb-8 border-b border-primary-100 pb-4">
            Current Open Positions
          </h2>

          <div className="space-y-8">
            {jobs.map((job, idx) => (
              <div key={idx} className="border border-primary-100 p-6 lg:p-8 bg-slate-50 hover:shadow-md transition">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-primary-950 mb-1">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider text-primary-500">
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-accent-700 bg-accent-50 px-3 py-1 border border-accent-100">
                    {job.salary}
                  </span>
                </div>
                <p className="text-primary-700 text-sm leading-relaxed mb-6">
                  {job.description}
                </p>
                <a
                  href={`mailto:careers@foxitech.in?subject=Application for ${encodeURIComponent(job.title)}`}
                  className="inline-block px-5 py-2.5 bg-primary-950 hover:bg-primary-900 text-white font-semibold text-xs tracking-wider uppercase"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
