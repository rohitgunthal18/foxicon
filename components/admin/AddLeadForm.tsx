'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export interface ServiceOption {
  slug: string;
  title: string;
}

const FIELD =
  'w-full rounded-lg border border-primary-200 bg-white px-3 py-2.5 text-sm text-primary-900 ' +
  'outline-none transition focus:border-primary-950 placeholder:text-primary-400';

const LABEL = 'mb-1.5 block text-xs font-semibold text-primary-700';

export default function AddLeadForm({ services }: { services: ServiceOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service_slug: '',
    priority: 'normal',
    value_inr: '',
    next_follow_up_at: '',
    message: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.email.trim() && !form.phone.trim()) {
      setError('Provide at least an email or a phone number.');
      return;
    }

    const valueNum = form.value_inr.trim() === '' ? null : Number(form.value_inr);
    if (valueNum !== null && (!Number.isInteger(valueNum) || valueNum < 0)) {
      setError('Enter the value in whole rupees, or leave it blank.');
      return;
    }

    let followUp: string | null = null;
    if (form.next_follow_up_at) {
      const d = new Date(`${form.next_follow_up_at}T09:00:00`);
      followUp = Number.isNaN(d.getTime()) ? null : d.toISOString();
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          company: form.company.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          service_slug: form.service_slug || null,
          priority: form.priority,
          value_inr: valueNum,
          next_follow_up_at: followUp,
          message: form.message.trim() || null,
        }),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(result.error ?? 'Could not save the lead.');
        return;
      }

      router.push(`/admin/leads/${result.id}`);
      router.refresh();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact */}
      <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
        <header className="border-b border-primary-200 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
            Contact details
          </h2>
        </header>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className={LABEL}>Full name <span className="text-red-500">*</span></label>
            <input id="name" type="text" required value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Priya Sharma" className={FIELD} />
          </div>
          <div>
            <label htmlFor="company" className={LABEL}>Company</label>
            <input id="company" type="text" value={form.company}
              onChange={(e) => set('company', e.target.value)}
              placeholder="e.g. Sharma Enterprises" className={FIELD} />
          </div>
          <div>
            <label htmlFor="phone" className={LABEL}>Phone</label>
            <input id="phone" type="tel" value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 98765 43210" className={FIELD} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className={LABEL}>Email</label>
            <input id="email" type="email" value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="priya@example.com" className={FIELD} />
          </div>
        </div>
      </section>

      {/* Deal */}
      <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
        <header className="border-b border-primary-200 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
            Deal details
          </h2>
        </header>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label htmlFor="service" className={LABEL}>Service</label>
            <select id="service" value={form.service_slug}
              onChange={(e) => set('service_slug', e.target.value)} className={FIELD}>
              <option value="">Not assigned</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>{s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="priority" className={LABEL}>Priority</label>
            <select id="priority" value={form.priority}
              onChange={(e) => set('priority', e.target.value)} className={FIELD}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High — chase today</option>
            </select>
          </div>
          <div>
            <label htmlFor="value" className={LABEL}>Estimated value (₹)</label>
            <input id="value" type="number" inputMode="numeric" min={0} step={1}
              value={form.value_inr}
              onChange={(e) => set('value_inr', e.target.value)}
              placeholder="e.g. 25000" className={FIELD} />
          </div>
          <div>
            <label htmlFor="followUp" className={LABEL}>First follow-up date</label>
            <input id="followUp" type="date" value={form.next_follow_up_at}
              onChange={(e) => set('next_follow_up_at', e.target.value)} className={FIELD} />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
        <header className="border-b border-primary-200 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
            Notes
          </h2>
        </header>
        <div className="p-5">
          <label htmlFor="message" className={LABEL}>
            How did you find them? What did they ask for?
          </label>
          <textarea id="message" rows={3} value={form.message}
            onChange={(e) => set('message', e.target.value)}
            placeholder="Met at a networking event. Interested in a website redesign for their restaurant chain."
            className={`${FIELD} resize-none`} />
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-50">
          {isSaving && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
          {isSaving ? 'Saving…' : 'Add lead'}
        </button>
        <Link
          href="/admin/leads"
          className="text-sm text-primary-500 transition hover:text-primary-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
