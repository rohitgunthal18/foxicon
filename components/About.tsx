'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check } from 'lucide-react';

const principles = [
  {
    title: 'Built for Small Business',
    description: 'Every site is shaped around how customers actually pick a business — services, timings, location, trust.',
  },
  {
    title: 'Live in Days, Not Months',
    description: 'Kickoff to launch in under a week. You start getting enquiries while others are still waiting on drafts.',
  },
  {
    title: 'One Team, Everything Online',
    description: 'Website, Google Maps, Instagram and ads handled together — so nothing falls between agencies.',
  },
  {
    title: 'Honest, Fixed Pricing',
    description: 'One-time pricing with no hidden retainers. What we quote is what you pay.',
  },
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" ref={ref} className="py-24 lg:py-32 bg-primary-50">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-display text-section font-bold text-primary-950 mb-6">
                Your Customers Are
                <br />
                Searching Right Now
              </h2>
              <p className="text-lg lg:text-xl text-primary-600 leading-relaxed">
                Nine out of ten customers look you up on Google before they buy.
                We make sure they find a business that looks as good online as it does
                in person — and can reach you in two taps.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-6 mt-12"
            >
              <div className="border-l-2 border-primary-950 pl-6">
                <p className="text-4xl font-bold text-primary-950 mb-2">120+</p>
                <p className="text-sm text-primary-600">Businesses Online</p>
              </div>
              <div className="border-l-2 border-accent-600 pl-6">
                <p className="text-4xl font-bold text-primary-950 mb-2">4.9/5</p>
                <p className="text-sm text-primary-600">Rated on Google</p>
              </div>
            </motion.div>
          </div>

          {/* Right - Principles */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-8"
            >
              {principles.map((principle, index) => (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, x: 30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 mt-1 w-5 h-5 border-2 border-primary-950 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-950 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-primary-950 mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-primary-600 leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>


          </div>
        </div>
      </div>
    </section>
  );
}
