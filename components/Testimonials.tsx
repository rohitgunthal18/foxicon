'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Star,
  Quote,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';

// PLACEHOLDER CONTENT — replace with real client quotes before launch.
const testimonials = [
  {
    quote:
      'People used to walk straight past my café. Now they find us on Google and walk in asking for the cold coffee they saw online. Weekends are packed.',
    name: 'Kunal Shirke',
    role: 'Café Owner, Kothrud',
  },
  {
    quote:
      'I never had a website before. They built one in a week and now customers message me on WhatsApp straight from it. I stopped losing orders.',
    name: 'Priya Jadhav',
    role: 'Boutique Owner, Camp',
  },
  {
    quote:
      'Enquiries doubled in two months. Best part — they explained everything in simple words and never made me feel lost with the tech side.',
    name: 'Amit Kulkarni',
    role: 'Gym Owner, Baner',
  },
  {
    quote:
      'Parents can now see our timings, fees and results on their own. My phone finally stopped ringing all day with the same three questions.',
    name: 'Sneha Patil',
    role: 'Coaching Centre, Wakad',
  },
  {
    quote:
      'The site looks premium. Clients see our project photos and already trust us before the first meeting even starts.',
    name: 'Rohan Deshpande',
    role: 'Interior Studio, Aundh',
  },
  {
    quote:
      'Service bookings come in online now, even at midnight. Simple, clean, and it just works. Best money I have spent on my business.',
    name: 'Sameer Khan',
    role: 'Car Service Garage, Hadapsar',
  },
];

interface ReviewCardProps {
  testimonial: (typeof testimonials)[0];
  index: number;
  isInView: boolean;
}

function ReviewCard({ testimonial, index, isInView }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article
      data-review-card
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
      className="snap-start shrink-0 w-[85vw] sm:w-[380px] border border-primary-200 bg-white p-6 lg:p-7 hover:border-primary-950 transition-colors duration-300"
    >
      {/* Rating row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex gap-1" aria-label="Rated 5 out of 5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-accent-600 fill-current" />
          ))}
        </div>
        <Quote className="w-5 h-5 text-primary-300" aria-hidden="true" />
      </div>

      {/* Quote — one line by default, expands to full text */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : '1.75rem' }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
        className="overflow-hidden"
      >
        <p
          className={`text-base leading-7 text-primary-800 ${
            expanded ? '' : 'line-clamp-1'
          }`}
        >
          {testimonial.quote}
        </p>
      </motion.div>

      {/* Read more toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-600 hover:text-primary-950 transition-colors duration-200 cursor-pointer"
      >
        {expanded ? 'Read less' : 'Read more'}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Author */}
      <div className="border-l-2 border-primary-950 pl-4 mt-5">
        <p className="font-medium text-primary-950 leading-tight">
          {testimonial.name}
        </p>
        <p className="text-sm text-primary-600">{testimonial.role}</p>
      </div>
    </motion.article>
  );
}

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const trackRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const openModal = () => {
    setSubmitted(false);
    setRating(0);
    setHoverRating(0);
    setReviewText('');
    setReviewName('');
    setHoneypot('');
    setIsSubmitting(false);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Escape to close + body scroll lock + move focus into the dialog
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen, closeModal]);

  // Auto-dismiss the thank-you state
  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => closeModal(), 2400);
    return () => clearTimeout(timer);
  }, [submitted, closeModal]);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-review-card]');
    const amount = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  // Body has a 10-character minimum server-side; mirror it here so the user
  // finds out before submitting rather than after.
  const isValid =
    rating > 0 && reviewText.trim().length >= 10 && reviewName.trim() !== '';

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    // The single name field is captioned "Name & business", so split on the
    // first comma into author name and role.
    const trimmedName = reviewName.trim();
    const commaAt = trimmedName.indexOf(',');
    const authorName = commaAt === -1 ? trimmedName : trimmedName.slice(0, commaAt).trim();
    const authorRole = commaAt === -1 ? undefined : trimmedName.slice(commaAt + 1).trim();

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: authorName,
          author_role: authorRole || undefined,
          rating,
          body: reviewText.trim(),
          website: honeypot,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(result.message ?? 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError('We could not reach the server. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 md:gap-12 mb-12 lg:mb-16"
        >
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-accent-600" />
              <span className="text-sm font-medium tracking-widest uppercase text-primary-600">
                Clients
              </span>
            </div>
            <h2 className="font-display text-section font-bold text-primary-950">
              Rated 4.9/5 By
              <br />
              120+ Businesses
            </h2>
          </div>

          {/* (a) Write a Review — sits beside the heading, wraps below on mobile */}
          <button
            ref={triggerRef}
            type="button"
            onClick={openModal}
            className="group inline-flex items-center justify-center gap-2.5 shrink-0 self-start md:self-auto md:mb-2 bg-primary-950 text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider border border-primary-950 hover:bg-accent-600 hover:border-accent-600 transition-colors duration-300 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-current" />
            Write a Review
          </button>
        </motion.div>

        {/* (b) Horizontally scrolling review track — all breakpoints */}
        <div
          className="relative"
          style={{
            maskImage:
              'linear-gradient(to right, black 0%, black 90%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, black 0%, black 90%, transparent 100%)',
          }}
        >
          <div
            ref={trackRef}
            className="flex items-start gap-6 overflow-x-auto snap-x snap-mandatory pb-2 pr-8 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((testimonial, index) => (
              <ReviewCard
                key={testimonial.name}
                testimonial={testimonial}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>
        </div>

        {/* Scroll affordances */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-between gap-4 mt-8"
        >
          <p className="text-sm text-primary-600">
            Swipe or scroll to read all {testimonials.length} reviews
          </p>
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous reviews"
              className="w-11 h-11 flex items-center justify-center border border-primary-200 text-primary-950 hover:bg-primary-950 hover:text-white hover:border-primary-950 transition-colors duration-300 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next reviews"
              className="w-11 h-11 flex items-center justify-center border border-primary-200 text-primary-950 hover:bg-primary-950 hover:text-white hover:border-primary-950 transition-colors duration-300 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* (d) Write a Review modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-[#04080f] backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-modal-title"
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
              className="relative z-10 w-full max-w-[420px] bg-white border border-primary-200 p-6 sm:p-8 shadow-2xl focus:outline-none"
            >
              {/* Close */}
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close review form"
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-primary-950 hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <div className="w-14 h-14 bg-primary-950 flex items-center justify-center mb-6">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <h2
                    id="review-modal-title"
                    className="font-display text-2xl font-bold text-primary-950 mb-2"
                  >
                    Thank You
                  </h2>
                  <p className="text-sm text-primary-600 max-w-[260px]">
                    Your review will appear here once we&apos;ve approved it. We
                    really appreciate you taking the time.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6 pr-8">
                    <h2
                      id="review-modal-title"
                      className="font-display text-2xl font-bold text-primary-950 mb-1"
                    >
                      Write a Review
                    </h2>
                    <p className="text-xs text-primary-600">
                      Tell other business owners how it went.
                    </p>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="space-y-5">
                    {/* Honeypot — hidden from people, tempting to bots. */}
                    <input
                      type="text"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />

                    {submitError && (
                      <p
                        aria-live="polite"
                        className="border-l-2 border-red-500 bg-red-50 px-3 py-2 text-xs text-red-700"
                      >
                        {submitError}
                      </p>
                    )}
                    {/* Star rating */}
                    <div>
                      <span className="block text-xs font-medium text-primary-700 mb-2">
                        Your Rating
                      </span>
                      <div
                        role="radiogroup"
                        aria-label="Your rating out of 5"
                        className="flex items-center gap-1.5"
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        {[1, 2, 3, 4, 5].map((value) => {
                          const active = value <= (hoverRating || rating);
                          return (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={rating === value}
                              aria-label={`${value} out of 5 stars`}
                              onClick={() => setRating(value)}
                              onMouseEnter={() => setHoverRating(value)}
                              className="p-1 cursor-pointer"
                            >
                              <Star
                                className={`w-7 h-7 transition-colors duration-200 ${
                                  active
                                    ? 'text-accent-600 fill-current'
                                    : 'text-primary-300'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review */}
                    <div>
                      <label
                        htmlFor="review-text"
                        className="block text-xs font-medium text-primary-700 mb-2"
                      >
                        Your Review
                      </label>
                      <textarea
                        required
                        id="review-text"
                        name="review"
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="What did we get right for your business?"
                        className="w-full px-3 py-2.5 border border-primary-300 focus:border-primary-950 focus:outline-none transition-colors duration-200 resize-none text-sm"
                      />
                    </div>

                    {/* Name */}
                    <div>
                      <label
                        htmlFor="review-name"
                        className="block text-xs font-medium text-primary-700 mb-2"
                      >
                        Your Name
                      </label>
                      <input
                        required
                        type="text"
                        id="review-name"
                        name="name"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Name & business"
                        className="w-full px-3 py-2.5 border border-primary-300 focus:border-primary-950 focus:outline-none transition-colors duration-200 text-sm"
                      />
                    </div>

                    <motion.button
                      whileHover={isValid && !isSubmitting ? { scale: 1.01 } : undefined}
                      whileTap={isValid && !isSubmitting ? { scale: 0.99 } : undefined}
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className="w-full bg-primary-950 text-white py-3 font-medium uppercase tracking-wider text-xs transition-colors duration-300 hover:bg-accent-600 disabled:bg-primary-300 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? 'Sending…' : 'Submit Review'}
                    </motion.button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
