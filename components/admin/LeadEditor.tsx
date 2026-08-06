'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';

export interface ServiceOption {
  slug: string;
  title: string;
}

interface Props {
  leadId: string;
  priority: 'low' | 'normal' | 'high';
  valueInr: number | null;
  nextFollowUpAt: string | null;
  serviceSlug: string | null;
  services: ServiceOption[];
}

/** timestamptz -> the `YYYY-MM-DD` an `<input type="date">` expects, in local time. */
function toDateInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * `YYYY-MM-DD` -> ISO timestamp at 9am local.
 *
 * A follow-up is a day, not an instant, but the column is timestamptz. Pinning
 * it to the start of the working day means "chase them on the 5th" doesn't
 * read as overdue at 00:01 on the 5th.
 */
function fromDateInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}T09:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const FIELD =
  'w-full rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm text-primary-900 ' +
  'outline-none transition focus:border-primary-950';

const LABEL = 'mb-1.5 block text-xs font-medium text-primary-600';

const PRIORITIES = ['low', 'normal', 'high'] as const;

/**
 * The editable half of a lead: how hot it is, what it's worth, when to chase,
 * and which service it's for. Saves only the fields that actually changed, so
 * the activity log records a truthful `field_update` rather than listing every
 * input on the form.
 */
export default function LeadEditor({
  leadId,
  priority,
  valueInr,
  nextFollowUpAt,
  serviceSlug,
  services,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    priority,
    value: valueInr === null ? '' : String(valueInr),
    followUp: toDateInput(nextFollowUpAt),
    service: serviceSlug ?? '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const initial = {
    priority,
    value: valueInr === null ? '' : String(valueInr),
    followUp: toDateInput(nextFollowUpAt),
    service: serviceSlug ?? '',
  };

  const isDirty =
    form.priority !== initial.priority ||
    form.value !== initial.value ||
    form.followUp !== initial.followUp ||
    form.service !== initial.service;

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setJustSaved(false);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isDirty) return;

    const trimmed = form.value.trim();
    const parsedValue = trimmed === '' ? null : Number(trimmed);

    if (parsedValue !== null && (!Number.isInteger(parsedValue) || parsedValue < 0)) {
      setError('Enter the value in whole rupees, or leave it blank.');
      return;
    }

    // Only what changed — the activity log records these field names verbatim.
    const changes: Record<string, unknown> = { id: leadId };
    if (form.priority !== initial.priority) changes.priority = form.priority;
    if (form.value !== initial.value) changes.value_inr = parsedValue;
    if (form.followUp !== initial.followUp) {
      changes.next_follow_up_at = fromDateInput(form.followUp);
    }
    if (form.service !== initial.service) {
      changes.service_slug = form.service === '' ? null : form.service;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        setError(result.error ?? 'Could not save these details.');
        return;
      }

      setJustSaved(true);
      router.refresh();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="priority" className={LABEL}>
            Priority
          </label>
          <select
            id="priority"
            value={form.priority}
            onChange={(e) => update('priority', e.target.value as (typeof PRIORITIES)[number])}
            className={FIELD}
          >
            {PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {option === 'high' ? 'High — chase today' : option === 'low' ? 'Low' : 'Normal'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="value" className={LABEL}>
            Estimated value (₹)
          </label>
          <input
            id="value"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={form.value}
            onChange={(e) => update('value', e.target.value)}
            placeholder="e.g. 9999"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="followUp" className={LABEL}>
            Next follow-up
          </label>
          <input
            id="followUp"
            type="date"
            value={form.followUp}
            onChange={(e) => update('followUp', e.target.value)}
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="service" className={LABEL}>
            Service
          </label>
          <select
            id="service"
            value={form.service}
            onChange={(e) => update('service', e.target.value)}
            className={FIELD}
          >
            <option value="">Not assigned</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isDirty || isSaving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving && <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />}
          {isSaving ? 'Saving…' : 'Save details'}
        </button>

        {justSaved && !isDirty && (
          <span aria-live="polite" className="inline-flex items-center gap-1 text-xs text-emerald-700">
            <Check aria-hidden className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
