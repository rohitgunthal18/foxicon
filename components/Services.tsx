'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Monitor, MapPin, Camera, Megaphone, Search, CalendarCheck, ChevronDown, X, Star, Zap, Headphones, BadgeCheck, Check } from 'lucide-react';

const services = [
  {
    icon: Monitor,
    title: 'Website Design',
    description: 'A fast, mobile-friendly website that shows what you sell, builds trust, and turns visitors into real enquiries.',
  },
  {
    icon: MapPin,
    title: 'Google Maps Setup',
    description: 'A complete Google Business Profile so nearby customers find you first, plus a simple kit to collect 50 reviews.',
  },
  {
    icon: Camera,
    title: 'Instagram Setup',
    description: 'A clean, ready-to-post Instagram page built for your business, with 2 reels and 5 posts made and ready to go.',
  },
  {
    icon: Megaphone,
    title: 'Meta & Google Ads',
    description: 'Local ads on Facebook, Instagram and Google that reach the people near you who are ready to buy from you now.',
  },
  {
    icon: Search,
    title: 'Local SEO',
    description: 'On-page and local search setup so your business shows up when people close by search for the things you sell.',
  },
  {
    icon: CalendarCheck,
    title: 'Online Booking',
    description: 'A 24/7 booking form plus WhatsApp enquiries, and one simple panel to manage all your customers in one place.',
  },
];

interface ServiceCardProps {
  service: typeof services[0];
  index: number;
  isInView: boolean;
  onGetQuote: (serviceTitle: string) => void;
}

function ServiceCard({ service, index, isInView, onGetQuote }: ServiceCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = service.icon;

  // Shared body: rendered twice, once as an always-open desktop block and once
  // inside the mobile-only height animation. `flex-1` + `mt-auto` let the
  // desktop copy stretch so every card's button lines up on the same baseline.
  const body = (
    <div className="pt-6 text-primary-600 leading-relaxed text-sm lg:text-base border-t border-primary-100 mt-4 flex flex-col flex-1 items-start gap-4">
      <p>{service.description}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onGetQuote(service.title);
        }}
        className="group inline-flex items-center gap-2.5 mt-auto bg-white text-primary-950 px-5 py-2 text-xs font-semibold border border-primary-950 hover:bg-primary-950 hover:text-white transition-all duration-300 cursor-pointer uppercase tracking-wider"
      >
        Get a Quote
        <ChevronDown className="w-3.5 h-3.5 -rotate-90 group-hover:translate-x-0.5 transition-transform duration-300" />
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
      className="group h-full"
    >
      <div className="border border-primary-200 p-6 lg:p-8 hover:border-primary-950 transition-all duration-300 hover:shadow-lg bg-white h-full flex flex-col">
        {/* Header row: Icon, Title, and Chevron Arrow (chevron is mobile-only) */}
        <div
          className="flex items-center justify-between gap-4 cursor-pointer select-none lg:cursor-default lg:select-text"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 flex-shrink-0 flex items-center justify-center group-hover:bg-primary-950 transition-colors duration-300">
              <Icon className="w-6 h-6 text-primary-950 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="font-display text-lg lg:text-xl font-bold text-primary-950">
              {service.title}
            </h3>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-primary-50 transition-colors duration-200 lg:hidden"
            aria-label="Expand details"
            aria-expanded={isOpen}
          >
            <ChevronDown
              className={`w-5 h-5 text-primary-600 transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Desktop (lg+): always expanded, no accordion, no chevron */}
        <div className="hidden lg:flex lg:flex-col lg:flex-1">{body}</div>

        {/* Mobile / tablet (below lg): click-to-expand with height animation */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          className="overflow-hidden lg:hidden"
        >
          {body}
        </motion.div>
      </div>
    </motion.div>
  );
}

const initialQuoteForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  message: '',
  website: '', // honeypot
};

const modalInputClass =
  'w-full px-2.5 py-1.5 md:px-4 md:py-3 border border-primary-300 focus:border-primary-950 focus:outline-none transition-colors duration-200 text-xs md:text-sm';
const modalErrorInputClass =
  'w-full px-2.5 py-1.5 md:px-4 md:py-3 border border-red-500 focus:border-red-600 focus:outline-none transition-colors duration-200 text-xs md:text-sm';

export default function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [quoteService, setQuoteService] = useState<string | null>(null);

  const [form, setForm] = useState(initialQuoteForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');

  const handleGetQuote = (serviceTitle: string) => {
    setQuoteService(serviceTitle);
    setForm(initialQuoteForm);
    setStatus('idle');
    setErrors({});
    setFeedback('');
  };

  const handleCloseModal = () => {
    setQuoteService(null);
  };

  const updateField =
    (field: keyof typeof initialQuoteForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleQuoteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setErrors({});
    setFeedback('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          // Read from state, not the form: the service input is `disabled`,
          // so it never appears in FormData. The API resolves titles to slugs.
          service_slug: quoteService,
          source: 'quote_modal',
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus('error');
        setErrors(result.errors ?? {});
        setFeedback(result.message ?? 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      // Give the confirmation a beat to register before the modal closes.
      setTimeout(() => setQuoteService(null), 2600);
    } catch {
      setStatus('error');
      setFeedback('We could not reach the server. Please check your connection.');
    }
  };

  return (
    <section id="services" ref={ref} className="py-24 lg:py-32 bg-white relative">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-20"
        >
          <h2 className="font-display text-section font-bold text-primary-950 mb-6">
            Everything Your Business Needs Online
          </h2>
          <p className="text-lg lg:text-xl text-primary-600 leading-relaxed">
            One team for your website, Google presence, social media and ads.
            So customers find you, trust you, and buy from you.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {services.map((service, index) => (
            <ServiceCard
              key={service.title}
              service={service}
              index={index}
              isInView={isInView}
              onGetQuote={handleGetQuote}
            />
          ))}
        </div>

        {/* Credentials Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 border-t border-primary-200"
        >
          {/* ── Mobile: 2×2 centered square cards ── */}
          <div className="grid grid-cols-2 lg:hidden border-b border-primary-100">
            {[
              { icon: Star,       label: 'Google Rating', value: '4.9 / 5',  sub: '120+ Client Reviews' },
              { icon: Zap,        label: 'Avg. Delivery', value: '5 Days',   sub: 'Site Live Fast'     },
              { icon: Headphones, label: 'Support',       value: '24 / 7',   sub: 'Always Reachable'   },
              { icon: BadgeCheck, label: 'Guarantee',     value: '100%',     sub: 'Satisfaction'       },
            ].map((item, index) => {
              const Icon = item.icon;
              const isRightCol = index % 2 === 1;
              const isBottomRow = index >= 2;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.45, delay: 0.9 + index * 0.08 }}
                  className={`flex flex-col items-center justify-center text-center gap-2 py-6 px-3
                    ${isRightCol ? 'border-l border-primary-100' : ''}
                    ${!isBottomRow ? 'border-b border-primary-100' : ''}
                    hover:bg-primary-50 transition-colors duration-200`}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-primary-100">
                    <Icon className="w-4 h-4 text-primary-950" />
                  </div>
                  <p className="text-base font-bold text-primary-950 font-display tracking-tight leading-none">
                    {item.value}
                  </p>
                  <p className="text-[10px] font-semibold text-primary-950 uppercase tracking-wider leading-tight">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-primary-400 leading-tight">{item.sub}</p>
                </motion.div>
              );
            })}
          </div>

          {/* ── Desktop: horizontal strip ── */}
          <div className="hidden lg:grid lg:grid-cols-4">
            {[
              { icon: Star,       label: 'Google Rating', value: '4.9 / 5',  sub: '120+ Client Reviews' },
              { icon: Zap,        label: 'Avg. Delivery', value: '5 Days',   sub: 'Site Live Fast'     },
              { icon: Headphones, label: 'Support',       value: '24 / 7',   sub: 'Always Reachable'   },
              { icon: BadgeCheck, label: 'Guarantee',     value: '100%',     sub: 'Satisfaction'       },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  className={`group flex items-start gap-4 px-8 py-10 border-l-2 border-transparent hover:border-primary-950 hover:bg-primary-50 transition-all duration-300 ${
                    index !== 0 ? 'border-l border-l-primary-100' : ''
                  }`}
                >
                  <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-primary-100 group-hover:bg-primary-950 transition-colors duration-300 mt-0.5">
                    <Icon className="w-4 h-4 text-primary-950 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-950 font-display tracking-tight">
                      {item.value}
                    </p>
                    <p className="text-xs font-semibold text-primary-950 mt-0.5 uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs text-primary-500 mt-0.5">{item.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quote Popup Modal */}
      <AnimatePresence>
        {quoteService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-[#04080f] backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
              className="relative bg-white w-full max-w-xl border border-primary-200 p-5 md:p-8 lg:p-10 shadow-2xl z-10 overflow-visible max-h-none"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-primary-50 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-primary-950" />
              </button>

              {/* Header */}
              <div className="mb-4 md:mb-6 lg:mb-8 pr-6">
                <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-primary-950 mb-1">
                  Request a Quote
                </h2>
                <p className="text-xs md:text-sm text-primary-600">
                  Share a few details and we&apos;ll send you pricing within 2 hours.
                </p>
              </div>

              {/* Form matching Contact.tsx style */}
              {status === 'success' ? (
                <div
                  aria-live="polite"
                  className="border border-primary-200 bg-primary-50 p-6 md:p-8 text-center"
                >
                  <Check className="w-9 h-9 md:w-10 md:h-10 text-accent-600 mx-auto mb-3" />
                  <h3 className="font-display text-lg md:text-xl font-bold text-primary-950 mb-2">
                    Request received
                  </h3>
                  <p className="text-xs md:text-sm text-primary-600">
                    We&apos;ll send your pricing for {quoteService} within 2 hours.
                  </p>
                </div>
              ) : (
              <form
                onSubmit={handleQuoteSubmit}
                noValidate
                className="space-y-3 md:space-y-4 lg:space-y-6"
              >
                {/* Honeypot — hidden from people, tempting to bots. */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={updateField('website')}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {status === 'error' && feedback && (
                  <p
                    aria-live="polite"
                    className="border-l-2 border-red-500 bg-red-50 px-3 py-2 text-[10px] md:text-xs text-red-700"
                  >
                    {feedback}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                  <div>
                    <label htmlFor="modal-name" className="block text-[10px] md:text-sm font-medium text-primary-700 mb-1 lg:mb-2">
                      Full Name
                    </label>
                    <input
                      required
                      type="text"
                      id="modal-name"
                      name="name"
                      value={form.name}
                      onChange={updateField('name')}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'modal-name-error' : undefined}
                      className={errors.name ? modalErrorInputClass : modalInputClass}
                      placeholder="Rahul Sharma"
                    />
                    {errors.name && (
                      <p id="modal-name-error" className="mt-1 text-[10px] md:text-xs text-red-600">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="modal-company" className="block text-[10px] md:text-sm font-medium text-primary-700 mb-1 lg:mb-2">
                      Business Name
                    </label>
                    <input
                      required
                      type="text"
                      id="modal-company"
                      name="company"
                      value={form.company}
                      onChange={updateField('company')}
                      aria-invalid={Boolean(errors.company)}
                      aria-describedby={errors.company ? 'modal-company-error' : undefined}
                      className={errors.company ? modalErrorInputClass : modalInputClass}
                      placeholder="Your Business Name"
                    />
                    {errors.company && (
                      <p id="modal-company-error" className="mt-1 text-[10px] md:text-xs text-red-600">
                        {errors.company}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                  <div>
                    <label htmlFor="modal-email" className="block text-[10px] md:text-sm font-medium text-primary-700 mb-1 lg:mb-2">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      id="modal-email"
                      name="email"
                      value={form.email}
                      onChange={updateField('email')}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'modal-email-error' : undefined}
                      className={errors.email ? modalErrorInputClass : modalInputClass}
                      placeholder="you@yourbusiness.com"
                    />
                    {errors.email && (
                      <p id="modal-email-error" className="mt-1 text-[10px] md:text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="modal-phone" className="block text-[10px] md:text-sm font-medium text-primary-700 mb-1 lg:mb-2">
                      Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      id="modal-phone"
                      name="phone"
                      value={form.phone}
                      onChange={updateField('phone')}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'modal-phone-error' : undefined}
                      className={errors.phone ? modalErrorInputClass : modalInputClass}
                      placeholder="+91 00000 00000"
                    />
                    {errors.phone && (
                      <p id="modal-phone-error" className="mt-1 text-[10px] md:text-xs text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="modal-service" className="block text-[10px] md:text-sm font-medium text-primary-700 mb-1 lg:mb-2">
                    Service Interest
                  </label>
                  <input
                    type="text"
                    id="modal-service"
                    name="service"
                    value={quoteService}
                    disabled
                    className="w-full px-2.5 py-1.5 md:px-4 md:py-3 border border-primary-200 bg-primary-50 text-primary-600 focus:outline-none cursor-not-allowed font-medium text-xs md:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="modal-message" className="block text-[10px] md:text-sm font-medium text-primary-700 mb-1 lg:mb-2">
                    Message
                  </label>
                  <textarea
                    id="modal-message"
                    name="message"
                    rows={3}
                    value={form.message}
                    onChange={updateField('message')}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'modal-message-error' : undefined}
                    className={`${errors.message ? modalErrorInputClass : modalInputClass} resize-none`}
                    placeholder="Tell us about your business..."
                  />
                  {errors.message && (
                    <p id="modal-message-error" className="mt-1 text-[10px] md:text-xs text-red-600">
                      {errors.message}
                    </p>
                  )}
                </div>

                <motion.button
                  whileHover={status === 'submitting' ? undefined : { scale: 1.01 }}
                  whileTap={status === 'submitting' ? undefined : { scale: 0.99 }}
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-primary-950 text-white py-2.5 md:py-4 font-medium hover:bg-accent-600 transition-colors duration-300 uppercase tracking-wider text-xs md:text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary-950"
                >
                  {status === 'submitting' ? 'Sending…' : 'Submit Quote Request'}
                </motion.button>

                <p className="text-[10px] md:text-xs text-primary-500 text-center">
                  We respect your privacy. Your information is secure and never shared.
                </p>
              </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
