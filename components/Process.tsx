'use client';

import { motion, useInView, useScroll, useSpring } from 'framer-motion';
import { Check } from 'lucide-react';
import { useRef } from 'react';

const steps = [
  {
    day: 'Day 1',
    title: 'Kickoff',
    description: 'A short call to understand your business and customers.',
  },
  {
    day: 'Day 2-4',
    title: 'Design & Build',
    description: 'We design and build while you carry on with work.',
  },
  {
    day: 'Day 5',
    title: 'Your Review',
    description: 'You see it live and we fix your changes the same day.',
  },
  {
    day: 'Day 6-7',
    title: "You're Live",
    description: 'Site launched, Google Maps live, Instagram ready.',
  },
];

export default function Process() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Rail draws itself across the four days as the section scrolls into view
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'center 0.6'],
  });
  const railScale = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 22,
    restDelta: 0.001,
  });

  return (
    <section
      id="process"
      ref={ref}
      className="relative overflow-hidden py-24 lg:py-32 bg-primary-950 text-white"
    >
      {/* Dot grid, fading out downwards */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(circle, #5a5a5a 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'linear-gradient(to bottom, black, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 70%)',
        }}
      />

      {/* Soft accent glow along the top edge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 0%, rgba(37, 99, 235, 0.14), transparent 70%)',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl mb-12 lg:mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-[2px] bg-accent-500" />
            <span className="text-sm font-medium tracking-widest uppercase text-primary-300">
              How It Works
            </span>
          </div>
          <h2 className="font-display text-section font-bold text-white mb-6">
            Live In One Week
          </h2>
          <p className="text-lg lg:text-xl text-primary-300 leading-relaxed">
            No long meetings. No endless changes. One week from start to your
            first online enquiry.
          </p>
        </motion.div>

        {/* Steps — each card hangs off a shared rail, horizontal on lg, vertical below */}
        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-10">
          {/* The rail: runs down the left edge below lg, across the top on lg */}
          <div
            aria-hidden
            className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-white/15 lg:left-0 lg:right-0 lg:top-[5px] lg:bottom-auto lg:h-[2px] lg:w-auto"
          >
            <motion.div
              style={{ scaleY: railScale }}
              className="h-full w-full origin-top bg-accent-500 lg:hidden"
            />
            <motion.div
              style={{ scaleX: railScale }}
              className="hidden h-full w-full origin-left bg-accent-500 lg:block"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1, ease: 'easeOut' }}
              className="relative pl-8 lg:pl-0 lg:pt-8"
            >
              {/* Node sitting on the rail */}
              {index === steps.length - 1 ? (
                <span className="absolute left-0 top-1.5 flex h-3 w-3 items-center justify-center bg-accent-500 lg:top-0 lg:left-0">
                  <Check className="h-2 w-2 text-white" strokeWidth={4} />
                </span>
              ) : (
                <span className="absolute left-0 top-1.5 h-3 w-3 border-2 border-white/40 bg-primary-950 lg:top-0 lg:left-0" />
              )}

              <p className="text-xs font-semibold uppercase tracking-widest text-accent-500">
                {step.day}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-white lg:text-2xl">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-300">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
