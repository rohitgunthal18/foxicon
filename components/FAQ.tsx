'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'How long until my site is live?',
    answer:
      'Three days for a single page, seven days for a static site, and ten to twelve days for a dynamic site with booking and payments. We start the day we get your content.',
  },
  {
    question: 'Are there any monthly fees?',
    answer:
      'No retainers from us. The price you see is one-time. You only pay your domain and hosting renewal each year, which is a few hundred rupees, and we set it up for you.',
  },
  {
    question: 'Which plan should I pick?',
    answer:
      'If customers call you to book, Static is enough. If you want them booking and paying without anyone picking up the phone, choose Dynamic — that is where most businesses see the difference.',
  },
  {
    question: 'Can I update the website myself later?',
    answer:
      'On the Dynamic plan, yes — you get a simple dashboard to change text, images, services and timings anytime. On Single Page and Static plans we handle edits for you during your support period.',
  },
  {
    question: 'Do you handle Google Maps and Instagram too?',
    answer:
      'Both are free with every website. We set up your Google Business Profile with a 50 five-star review kit, and launch your Instagram page with 2 reels and 5 posts ready to go.',
  },
  {
    question: 'What do you need from me to start?',
    answer:
      'Your business name, services, timings, a few photos and your contact details. If you do not have photos or written content, we help with that too.',
  },
];

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" ref={ref} className="py-24 lg:py-32 bg-primary-50">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-accent-600" />
              <span className="text-sm font-medium tracking-widest uppercase text-primary-600">
                FAQ
              </span>
            </div>
            <h2 className="font-display text-section font-bold text-primary-950 mb-6">
              Questions,
              <br />
              Answered
            </h2>
            <p className="text-lg text-primary-600 leading-relaxed">
              Still unsure about something? Call us on +91 72186 16190 — we
              usually reply in under two hours.
            </p>
          </motion.div>

          {/* Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={faq.question} className="border-b border-primary-200">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="w-full py-6 flex items-start justify-between gap-6 text-left group"
                  >
                    <span className="text-lg font-medium text-primary-950 group-hover:text-accent-600 transition-colors duration-200">
                      {faq.question}
                    </span>
                    <span className="flex-shrink-0 mt-1 text-primary-600">
                      {isOpen ? (
                        <Minus className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 pr-12 text-primary-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
