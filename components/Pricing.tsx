'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Check,
  Minus,
  ArrowRight,
  Star,
  Gift,
  Sparkles,
  MapPin,
  Share2,
} from 'lucide-react';

const plans = [
  {
    name: 'Single Page',
    tagline: 'Get online this week',
    price: '4,999',
    delivery: '3 Days',
    featured: false,
    features: [
      { text: 'One beautifully designed page', included: true },
      { text: 'Mobile-friendly', included: true },
      { text: 'Click-to-call + WhatsApp button', included: true },
      { text: 'Google Maps embed', included: true },
      { text: 'Enquiry form', included: true },
      { text: '6 months support', included: true },
      { text: 'Online booking', included: false },
      { text: 'Accept payments', included: false },
    ],
  },
  {
    name: 'Static',
    tagline: 'A full website for your business',
    price: '9,999',
    delivery: '7 Days',
    featured: false,
    features: [
      { text: 'Up to 5 custom pages', included: true },
      { text: 'Mobile-friendly', included: true },
      { text: 'Contact form + WhatsApp button', included: true },
      { text: 'Basic Google search setup', included: true },
      { text: 'Fast, secure hosting setup', included: true },
      { text: '1 year support', included: true },
      { text: 'Online booking', included: false },
      { text: 'Accept payments', included: false },
    ],
  },
  {
    name: 'Dynamic',
    tagline: 'Turns visitors into customers',
    price: '19,999',
    delivery: '10-12 Days',
    featured: true,
    features: [
      { text: 'Up to 10 pages', included: true },
      { text: 'Edit content yourself, anytime', included: true },
      { text: 'Take bookings 24/7, even while you sleep', included: true },
      { text: 'Accept payments — cards, UPI, wallets', included: true },
      { text: 'Blog to pull in new visitors', included: true },
      { text: 'Customer list + booking dashboard', included: true },
      { text: 'Advanced Google ranking setup', included: true },
      { text: 'Priority support for 2 years', included: true },
    ],
  },
];

const freebies = [
  {
    icon: MapPin,
    title: 'Google Maps Setup',
    description: 'Findable on Google Maps, with a kit to collect your first 50 reviews.',
    worth: '4,000',
  },
  {
    icon: Share2,
    title: 'Instagram Page Setup',
    description: 'A launch-ready page — profile, 2 reels and 5 posts ready to post.',
    worth: '3,000',
  },
];

const freebiesWorth = '7,000';

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="pricing" ref={ref} className="py-24 lg:py-32 bg-primary-50">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16 lg:mb-24"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-[2px] bg-accent-600" />
            <span className="text-sm font-medium tracking-widest uppercase text-primary-600">
              Pricing
            </span>
          </div>
          <h2 className="font-display text-section font-bold text-primary-950 mb-6">
            One-Time Pricing.
            <br />
            No Retainers.
          </h2>
          <p className="text-lg lg:text-xl text-primary-600 leading-relaxed">
            Other agencies charge ₹50,000 to ₹1,00,000 for the same work. We
            keep it honest — without cutting corners.
          </p>
        </motion.div>
        {/* Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              className={`relative border p-8 lg:p-10 h-full flex flex-col ${
                plan.featured
                  ? 'border-primary-950 bg-primary-950 text-white md:col-span-2 lg:col-span-1'
                  : 'border-primary-200 bg-white'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 bg-accent-600 text-white text-xs font-medium tracking-widest uppercase px-4 py-2 flex items-center gap-2">
                  <Star className="w-3 h-3 fill-current" />
                  Recommended
                </div>
              )}

              <p
                className={`font-display text-2xl font-bold mb-2 ${
                  plan.featured ? 'text-white' : 'text-primary-950'
                }`}
              >
                {plan.name}
              </p>
              <p
                className={`text-sm mb-8 ${
                  plan.featured ? 'text-primary-300' : 'text-primary-600'
                }`}
              >
                {plan.tagline}
              </p>

              <div className="flex items-end gap-2 mb-2">
                <span
                  className={`text-2xl font-medium ${
                    plan.featured ? 'text-primary-400' : 'text-primary-500'
                  }`}
                >
                  ₹
                </span>
                <span
                  className={`text-5xl font-bold leading-none ${
                    plan.featured ? 'text-white' : 'text-primary-950'
                  }`}
                >
                  {plan.price}
                </span>
              </div>
              <p
                className={`text-sm mb-8 ${
                  plan.featured ? 'text-primary-400' : 'text-primary-500'
                }`}
              >
                One-time · Live in {plan.delivery}
              </p>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex gap-3">
                    <span
                      className={`flex-shrink-0 mt-0.5 w-5 h-5 border-2 flex items-center justify-center ${
                        !feature.included
                          ? plan.featured
                            ? 'border-primary-700'
                            : 'border-primary-300'
                          : plan.featured
                          ? 'border-accent-600 bg-accent-600'
                          : 'border-primary-950'
                      }`}
                    >
                      {feature.included ? (
                        <Check
                          className={`w-3 h-3 stroke-[3] ${
                            plan.featured ? 'text-white' : 'text-primary-950'
                          }`}
                        />
                      ) : (
                        <Minus
                          className={`w-3 h-3 stroke-[3] ${
                            plan.featured ? 'text-primary-700' : 'text-primary-300'
                          }`}
                        />
                      )}
                    </span>
                    <span
                      className={`text-sm leading-relaxed ${
                        !feature.included
                          ? plan.featured
                            ? 'text-primary-600'
                            : 'text-primary-400'
                          : plan.featured
                          ? 'text-primary-100'
                          : 'text-primary-700'
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={scrollToContact}
                className={`w-full py-4 font-medium flex items-center justify-center gap-2 transition-colors duration-300 ${
                  plan.featured
                    ? 'bg-accent-600 text-white hover:bg-white hover:text-primary-950'
                    : 'border border-primary-950 text-primary-950 hover:bg-primary-950 hover:text-white'
                }`}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Free With Static & Dynamic */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="relative mt-16 lg:mt-20"
        >
          {/* Soft accent glow under the card */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 -bottom-3 h-24 bg-accent-600/10 blur-2xl"
          />

          <div className="relative border border-primary-200 bg-white">
            {/* Top accent rule */}
            <div className="h-[3px] w-full bg-gradient-to-r from-accent-600 via-accent-500 to-transparent" />
            {/* Corner accent */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-accent-600"
            />

            <div className="p-8 lg:p-10">
              {/* Header */}
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-8 lg:mb-10">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-12 h-12 bg-accent-600 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </span>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium tracking-widest uppercase text-accent-600 mb-2">
                      <Sparkles className="w-4 h-4" />
                      Free Bonuses
                    </p>
                    <h3 className="font-display text-3xl lg:text-4xl font-bold text-primary-950 leading-tight">
                      Free With Static &amp; Dynamic
                    </h3>
                  </div>
                </div>

                {/* Total value */}
                <div className="flex items-center gap-4 border-l-2 border-accent-600 pl-4 md:flex-col md:items-end md:gap-1 md:border-l-0 md:pl-0 md:text-right">
                  <span className="text-lg text-primary-400 line-through">
                    Worth ₹{freebiesWorth}
                  </span>
                  <span className="font-display text-3xl font-bold text-accent-600">
                    Yours Free
                  </span>
                </div>
              </div>

              {/* The two bonuses */}
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {freebies.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.6,
                        delay: 0.5 + index * 0.1,
                        ease: 'easeOut',
                      }}
                      className="group border border-primary-200 bg-primary-50 p-6 lg:p-8 transition-colors duration-300 hover:border-accent-600 hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <span className="flex-shrink-0 w-12 h-12 border-2 border-accent-600 bg-accent-600/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-accent-600">
                          <Icon className="w-5 h-5 text-accent-600 transition-colors duration-300 group-hover:text-white" />
                        </span>
                        <span className="flex items-baseline gap-2 text-xs font-medium tracking-widest uppercase">
                          <span className="text-primary-400 line-through">
                            ₹{item.worth}
                          </span>
                          <span className="bg-accent-600 text-white px-2 py-1">
                            Free
                          </span>
                        </span>
                      </div>
                      <h4 className="font-display text-xl font-bold text-primary-950 mb-2">
                        {item.title}
                      </h4>
                      <p className="text-primary-600 leading-relaxed">
                        {item.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Which plans get them */}
              <div className="mt-8 lg:mt-10 pt-6 border-t border-primary-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <span className="self-start sm:self-auto flex-shrink-0 inline-flex items-center gap-2 bg-primary-950 text-white text-xs font-medium tracking-widest uppercase px-3 py-2">
                  <Minus className="w-3 h-3 stroke-[3]" />
                  Not In Single Page
                </span>
                <p className="text-sm text-primary-600 leading-relaxed">
                  Both bonuses come with the{' '}
                  <span className="font-medium text-primary-950">Static</span>{' '}
                  and{' '}
                  <span className="font-medium text-primary-950">Dynamic</span>{' '}
                  plans. The ₹4,999 Single Page plan does not include them — move
                  up to Static and you get both, free.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
