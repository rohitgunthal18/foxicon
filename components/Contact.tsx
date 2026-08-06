'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

const initialForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  service: '',
  message: '',
  website: '', // honeypot
};

type FormState = typeof initialForm;
type Status = 'idle' | 'submitting' | 'success' | 'error';

const inputClass =
  'w-full px-4 py-3 border border-primary-300 focus:border-primary-950 focus:outline-none transition-colors duration-200';
const errorInputClass =
  'w-full px-4 py-3 border border-red-500 focus:border-red-600 focus:outline-none transition-colors duration-200';

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const update =
    (field: keyof FormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setErrors({});
    setMessage('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          // The select stores slugs already; the API expects `service_slug`.
          service_slug: form.service,
          message: form.message,
          source: 'contact_form',
          website: form.website,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus('error');
        setErrors(result.errors ?? {});
        setMessage(result.message ?? 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      setForm(initialForm);
    } catch {
      setStatus('error');
      setMessage(
        'We could not reach the server. Please check your connection, or WhatsApp us directly.'
      );
    }
  };

  return (
    <section id="contact" ref={ref} className="py-24 lg:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
        <div className="grid lg:grid-cols-5 gap-16 lg:gap-24">
          {/* Left - Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-display text-section font-bold text-primary-950 mb-6">
                Let&apos;s Get You
                <br />
                Online
              </h2>
              <p className="text-lg text-primary-600 leading-relaxed mb-12">
                Tell us about your business and we&apos;ll send back a clear plan and
                a fixed quote — usually within two hours.
              </p>

              {/* Contact Info */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary-950" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-600 mb-1">Email</p>
                    <p className="text-primary-950 font-medium">contact.foxitech@gmail.com</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary-950" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-600 mb-1">Phone</p>
                    <p className="text-primary-950 font-medium">+91 72186 16190</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary-950" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-600 mb-1">Studio</p>
                    <p className="text-primary-950 font-medium">
                      Shop 4, Tech Plaza, Baner Road
                      <br />
                      Pune, Maharashtra 411045
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Response Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-12 p-6 border-l-2 border-accent-600 bg-primary-50"
              >
                <div className="flex items-center gap-3">
                  <p className="text-sm text-primary-600">Average Reply Time</p>
                  <p className="text-xl font-bold text-primary-950">&lt; 2 Hours</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-3"
          >
            {status === 'success' ? (
              <div
                aria-live="polite"
                className="border border-primary-200 bg-primary-50 p-10 text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-accent-600 mx-auto mb-5" />
                <h3 className="font-display text-2xl font-bold text-primary-950 mb-3">
                  Thanks — we&apos;ve got it
                </h3>
                <p className="text-primary-600 leading-relaxed mb-6">
                  We&apos;ll come back to you with a clear plan and a fixed quote,
                  usually within two hours.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-sm font-medium text-primary-950 underline underline-offset-4 hover:text-accent-600 transition-colors duration-200"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                {/* Honeypot — hidden from people, tempting to bots. */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={update('website')}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {status === 'error' && message && (
                  <p
                    aria-live="polite"
                    className="border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {message}
                  </p>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-primary-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={update('name')}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className={errors.name ? errorInputClass : inputClass}
                      placeholder="Rahul Sharma"
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-2 text-sm text-red-600">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-primary-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={form.company}
                      onChange={update('company')}
                      aria-invalid={Boolean(errors.company)}
                      aria-describedby={errors.company ? 'company-error' : undefined}
                      className={errors.company ? errorInputClass : inputClass}
                      placeholder="Your business name"
                    />
                    {errors.company && (
                      <p id="company-error" className="mt-2 text-sm text-red-600">
                        {errors.company}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={update('email')}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={errors.email ? errorInputClass : inputClass}
                      placeholder="you@business.com"
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-2 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-primary-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={update('phone')}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      className={errors.phone ? errorInputClass : inputClass}
                      placeholder="+91 00000 00000"
                    />
                    {errors.phone && (
                      <p id="phone-error" className="mt-2 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-primary-700 mb-2">
                    Service Interest
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={form.service}
                    onChange={update('service')}
                    aria-invalid={Boolean(errors.service_slug)}
                    aria-describedby={errors.service_slug ? 'service-error' : undefined}
                    className={`${errors.service_slug ? errorInputClass : inputClass} bg-white`}
                  >
                    <option value="">Select a service</option>
                    <option value="website-design">Website Design</option>
                    <option value="google-maps">Google Maps Setup</option>
                    <option value="instagram">Instagram Setup</option>
                    <option value="ads">Meta &amp; Google Ads</option>
                    <option value="local-seo">Local SEO</option>
                    <option value="online-booking">Online Booking</option>
                  </select>
                  {errors.service_slug && (
                    <p id="service-error" className="mt-2 text-sm text-red-600">
                      {errors.service_slug}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-primary-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={form.message}
                    onChange={update('message')}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    className={`${errors.message ? errorInputClass : inputClass} resize-none`}
                    placeholder="Tell us about your business..."
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-2 text-sm text-red-600">
                      {errors.message}
                    </p>
                  )}
                </div>

                <motion.button
                  whileHover={status === 'submitting' ? undefined : { scale: 1.02 }}
                  whileTap={status === 'submitting' ? undefined : { scale: 0.98 }}
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-primary-950 text-white py-4 font-medium hover:bg-accent-600 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary-950"
                >
                  {status === 'submitting' ? 'Sending…' : 'Get My Free Quote'}
                </motion.button>

                <p className="text-sm text-primary-600 text-center">
                  We respect your privacy. Your information is secure and never shared.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
