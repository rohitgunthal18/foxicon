'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Minimal dot grid background — left half only */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d1d1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Full-height hero image — hidden on mobile, 50% split on desktop */}
      <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-1/2 pointer-events-auto">
        <Image
          src="/datacenter4.webp"
          alt="Modern business website designed by Foxi Tech"
          fill
          priority
          className="object-cover object-center"
          sizes="50vw"
        />
        {/* Soft fade into white on the left/mobile edge */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/90 to-transparent" />
      </div>

      {/* Content — left half */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12 pt-28 pb-16 lg:py-32 w-full relative z-10">
        <div className="max-w-xl">
          {/* Tag line */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase text-primary-500">
              <span className="w-5 h-[1px] bg-primary-400" />
              Web Design &amp; Digital Growth
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(2rem,5vw,4rem)] font-bold text-primary-950 leading-[1.12] tracking-tight">
            Get Your Business
            <br />
            <span className="text-primary-600">Found.</span> Trusted. Booked.
          </h1>

          {/* Description */}
          <p className="mt-4 md:mt-6 text-base lg:text-lg text-primary-700 max-w-lg leading-relaxed font-normal">
            A website, Google Maps and Instagram — done for you.
            Ready in 5 days.
          </p>

          {/* CTA buttons */}
          <div className="mt-6 md:mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={scrollToContact}
              className="group inline-flex items-center gap-3 bg-primary-950 text-white px-7 py-3.5 text-sm font-medium hover:bg-accent-600 transition-colors duration-300 cursor-pointer"
            >
              Get a Free Quote
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>

            <button
              onClick={scrollToPricing}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium text-primary-700 border border-primary-200 hover:border-primary-400 hover:text-primary-950 transition-all duration-300 cursor-pointer"
            >
              View Pricing
            </button>
          </div>

          {/* Stats Marquee */}
          <div 
            className="relative mt-8 md:mt-16 pt-6 md:pt-8 border-t border-primary-100 w-full overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, black 0%, black 75%, transparent 98%)',
              WebkitMaskImage: 'linear-gradient(to right, black 0%, black 75%, transparent 98%)',
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.85, ease: 'easeOut' }}
              className="w-full"
            >
              <motion.div
                className="flex gap-16 pr-16"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  repeat: Infinity,
                  ease: "linear",
                  duration: 25,
                }}
                style={{ width: "fit-content" }}
              >
                {[
                  { value: '120+', label: 'Happy Clients' },
                  { value: '4.9/5', label: 'Google Rating' },
                  { value: '5 Days', label: 'Avg. Delivery' },
                  { value: '100%', label: 'Satisfaction' },
                  { value: '24/7', label: 'Support' },

                  // Duplicate for infinite loop
                  { value: '120+', label: 'Happy Clients' },
                  { value: '4.9/5', label: 'Google Rating' },
                  { value: '5 Days', label: 'Avg. Delivery' },
                  { value: '100%', label: 'Satisfaction' },
                  { value: '24/7', label: 'Support' },
                ].map((stat, idx) => (
                  <div key={`${stat.label}-${idx}`} className="flex-shrink-0">
                    <p className="text-2xl lg:text-3xl font-bold text-primary-950">{stat.value}</p>
                    <p className="text-xs text-primary-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator removed */}
    </section>
  );
}
