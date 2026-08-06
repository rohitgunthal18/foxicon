'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, Plus, Trash2 } from 'lucide-react';

import { computeTotals, buildInstallments } from '@/lib/agreement-math';
import { CLAUSE_ORDER } from '@/lib/agreement-clauses';
import { formatInr } from '@/lib/admin-shared';

const FIELD =
  'w-full border border-primary-200 bg-white px-3 py-2.5 text-sm text-primary-900 ' +
  'outline-none transition focus:border-primary-950 placeholder:text-primary-400';

const LABEL = 'mb-1.5 block text-xs font-semibold text-primary-700';

const KIND_LABEL: Record<LineItem['kind'], string> = {
  service: 'Service',
  addon: 'Add-on',
  discount: 'Discount',
};

export interface LineItem {
  kind: 'service' | 'addon' | 'discount';
  label: string;
  detail: string;
  /** Held as strings so a half-typed number does not become NaN mid-keystroke. */
  qty: string;
  unit_inr: string;
}

export interface PaymentSplit {
  label: string;
  percent: string;
  due_note: string;
}

export interface AgreementFormData {
  lead_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company: string;
  project_title: string;
  items: LineItem[];
  tax_percent: string;
  splits: PaymentSplit[];
  delivery_days: string;
  support_months: string;
  revisions_included: string;
  clauses: Record<string, string>;
}

interface Props {
  mode: 'create' | 'edit';
  /** Required in edit mode — the agreement being PATCHed. */
  agreementId?: string;
  initial: AgreementFormData;
  /** True when saving will kill a signing link that has already gone out. */
  warnLinkRevocation?: boolean;
}

/** Whole rupees, or 0. Rejects nothing — validation happens at submit. */
function toInt(value: string): number {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

function toNum(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export default function AgreementForm({
  mode,
  agreementId,
  initial,
  warnLinkRevocation = false,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AgreementFormData>(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof AgreementFormData>(key: K, value: AgreementFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  /*
    Totals come from the same function the API uses, so what is shown here and
    what gets stored cannot disagree — the server recomputes and ignores
    whatever the browser sends, and this keeps the two answers identical.
  */
  const { totals, installments, percentTotal } = useMemo(() => {
    const lines = form.items.map((item) => ({
      kind: item.kind,
      label: item.label,
      qty: Math.max(1, toInt(item.qty)),
      unit_inr: toInt(item.unit_inr),
    }));

    const computed = computeTotals(lines, toNum(form.tax_percent));

    const splits = form.splits.map((split) => ({
      label: split.label,
      percent: toNum(split.percent),
      due_note: split.due_note,
    }));

    return {
      totals: computed,
      installments: buildInstallments(computed.totalInr, splits),
      percentTotal: splits.reduce((sum, split) => sum + split.percent, 0),
    };
  }, [form.items, form.tax_percent, form.splits]);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
    setError(null);
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { kind: 'service', label: '', detail: '', qty: '1', unit_inr: '' },
      ],
    }));
  }

  function removeItem(index: number) {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }

  function updateSplit(index: number, patch: Partial<PaymentSplit>) {
    setForm((prev) => ({
      ...prev,
      splits: prev.splits.map((split, i) => (i === index ? { ...split, ...patch } : split)),
    }));
    setError(null);
  }

  function addSplit() {
    setForm((prev) => ({
      ...prev,
      splits: [...prev.splits, { label: '', percent: '', due_note: '' }],
    }));
  }

  function removeSplit(index: number) {
    setForm((prev) => ({ ...prev, splits: prev.splits.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.client_name.trim()) {
      setError('The client name is required — it goes on the agreement.');
      return;
    }

    const items = form.items.filter((item) => item.label.trim());
    if (items.length === 0) {
      setError('Add at least one line item with a description.');
      return;
    }

    const splits = form.splits.filter((split) => split.label.trim());
    // An agreement whose instalments do not add up to the total is an invoice
    // dispute waiting to happen, so this is a hard stop rather than a warning.
    if (splits.length > 0 && Math.abs(percentTotal - 100) > 0.01) {
      setError(
        `The payment schedule adds up to ${percentTotal}%. It has to come to exactly 100%.`
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    const body = {
      lead_id: form.lead_id,
      client_name: form.client_name.trim(),
      client_email: form.client_email.trim(),
      client_phone: form.client_phone.trim(),
      client_company: form.client_company.trim(),
      project_title: form.project_title.trim(),
      items: items.map((item) => ({
        kind: item.kind,
        label: item.label.trim(),
        detail: item.detail.trim() || null,
        qty: Math.max(1, toInt(item.qty)),
        unit_inr: toInt(item.unit_inr),
      })),
      tax_percent: toNum(form.tax_percent),
      installments,
      delivery_days: Math.max(1, toInt(form.delivery_days)),
      support_months: toInt(form.support_months),
      revisions_included: toInt(form.revisions_included),
      content: form.clauses,
    };

    try {
      const response = await fetch(
        mode === 'edit' ? `/api/admin/agreements/${agreementId}` : '/api/admin/agreements',
        {
          method: mode === 'edit' ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Could not save the agreement.');
        return;
      }

      router.push(`/admin/agreements/${result.id ?? agreementId}`);
      router.refresh();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {warnLinkRevocation && (
        <div className="flex items-start gap-3 border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">This agreement has already been sent.</p>
            <p className="mt-0.5">
              Saving will invalidate the signing link the client already has and
              put the agreement back in draft. You will need to send it again.
            </p>
          </div>
        </div>
      )}

      {/* Client */}
      <section className="overflow-hidden border border-primary-200 bg-white">
        <header className="border-b border-primary-200 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
            Client details
          </h2>
        </header>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label htmlFor="client_name" className={LABEL}>
              Name or business name <span className="text-red-500">*</span>
            </label>
            <input
              id="client_name"
              type="text"
              required
              value={form.client_name}
              onChange={(e) => set('client_name', e.target.value)}
              placeholder="e.g. Priya Sharma"
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="client_company" className={LABEL}>
              Company
            </label>
            <input
              id="client_company"
              type="text"
              value={form.client_company}
              onChange={(e) => set('client_company', e.target.value)}
              placeholder="e.g. Sharma Enterprises"
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="client_phone" className={LABEL}>
              Phone
            </label>
            <input
              id="client_phone"
              type="tel"
              value={form.client_phone}
              onChange={(e) => set('client_phone', e.target.value)}
              placeholder="+91 98765 43210"
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="client_email" className={LABEL}>
              Email
            </label>
            <input
              id="client_email"
              type="email"
              value={form.client_email}
              onChange={(e) => set('client_email', e.target.value)}
              placeholder="priya@example.com"
              className={FIELD}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="project_title" className={LABEL}>
              Project title
            </label>
            <input
              id="project_title"
              type="text"
              value={form.project_title}
              onChange={(e) => set('project_title', e.target.value)}
              placeholder="e.g. Restaurant website with online ordering"
              className={FIELD}
            />
          </div>
        </div>
      </section>

      {/* Line items */}
      <section className="overflow-hidden border border-primary-200 bg-white">
        <header className="flex items-center justify-between border-b border-primary-200 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
            Pricing
          </h2>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 border border-primary-200 px-2.5 py-1.5 text-xs font-medium text-primary-700 transition hover:border-primary-300 hover:bg-primary-50"
          >
            <Plus aria-hidden className="h-3.5 w-3.5" />
            Add line
          </button>
        </header>

        <div className="divide-y divide-primary-100">
          {form.items.map((item, index) => (
            <div key={index} className="grid gap-3 p-5 sm:grid-cols-12">
              <div className="sm:col-span-3">
                <label className={LABEL} htmlFor={`kind-${index}`}>
                  Type
                </label>
                <select
                  id={`kind-${index}`}
                  value={item.kind}
                  onChange={(e) =>
                    updateItem(index, { kind: e.target.value as LineItem['kind'] })
                  }
                  className={FIELD}
                >
                  {(Object.keys(KIND_LABEL) as LineItem['kind'][]).map((kind) => (
                    <option key={kind} value={kind}>
                      {KIND_LABEL[kind]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5">
                <label className={LABEL} htmlFor={`label-${index}`}>
                  Description
                </label>
                <input
                  id={`label-${index}`}
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(index, { label: e.target.value })}
                  placeholder="e.g. 5-page business website"
                  className={FIELD}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={LABEL} htmlFor={`qty-${index}`}>
                  Qty
                </label>
                <input
                  id={`qty-${index}`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={item.qty}
                  onChange={(e) => updateItem(index, { qty: e.target.value })}
                  className={FIELD}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={LABEL} htmlFor={`unit-${index}`}>
                  Rate (₹)
                </label>
                <input
                  id={`unit-${index}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={item.unit_inr}
                  onChange={(e) => updateItem(index, { unit_inr: e.target.value })}
                  placeholder="25000"
                  className={FIELD}
                />
              </div>

              <div className="sm:col-span-10">
                <label className={LABEL} htmlFor={`detail-${index}`}>
                  Detail <span className="font-normal text-primary-400">(optional)</span>
                </label>
                <input
                  id={`detail-${index}`}
                  type="text"
                  value={item.detail}
                  onChange={(e) => updateItem(index, { detail: e.target.value })}
                  placeholder="What this includes"
                  className={FIELD}
                />
              </div>

              <div className="flex items-end justify-between sm:col-span-2">
                <span className="text-sm text-primary-600 sm:hidden">
                  {formatInr(Math.max(1, toInt(item.qty)) * toInt(item.unit_inr))}
                </span>
                {form.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    aria-label={`Remove line ${index + 1}`}
                    className="ml-auto p-2.5 text-primary-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 aria-hidden className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totals — live, from the same maths the server runs */}
        <div className="space-y-1.5 border-t border-primary-200 bg-primary-50 px-5 py-4 text-sm">
          <div className="flex justify-between text-primary-600">
            <span>Subtotal</span>
            <span>{formatInr(totals.subtotalInr)}</span>
          </div>
          {totals.discountInr > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span>−{formatInr(totals.discountInr)}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 text-primary-600">
            <label htmlFor="tax_percent" className="shrink-0">
              GST %
            </label>
            <div className="flex items-center gap-2">
              <input
                id="tax_percent"
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step="0.01"
                value={form.tax_percent}
                onChange={(e) => set('tax_percent', e.target.value)}
                className="w-20 border border-primary-200 bg-white px-2 py-1 text-right text-sm outline-none focus:border-primary-950"
              />
              <span className="w-24 text-right">{formatInr(totals.taxInr)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-primary-200 pt-2 font-display text-lg font-bold text-primary-900">
            <span>Total</span>
            <span>{formatInr(totals.totalInr)}</span>
          </div>
        </div>
      </section>

      {/* Payment schedule */}
      <section className="overflow-hidden border border-primary-200 bg-white">
        <header className="flex items-center justify-between border-b border-primary-200 px-5 py-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
              Payment schedule
            </h2>
            <p className="mt-0.5 text-xs text-primary-500">
              Defaults to half up front, half on delivery. Change the split if this
              client needs something different.
            </p>
          </div>
          <button
            type="button"
            onClick={addSplit}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-primary-200 px-2.5 py-1.5 text-xs font-medium text-primary-700 transition hover:border-primary-300 hover:bg-primary-50"
          >
            <Plus aria-hidden className="h-3.5 w-3.5" />
            Add stage
          </button>
        </header>

        <div className="divide-y divide-primary-100">
          {form.splits.map((split, index) => (
            <div key={index} className="grid gap-3 p-5 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <label className={LABEL} htmlFor={`split-label-${index}`}>
                  Stage
                </label>
                <input
                  id={`split-label-${index}`}
                  type="text"
                  value={split.label}
                  onChange={(e) => updateSplit(index, { label: e.target.value })}
                  placeholder="Advance"
                  className={FIELD}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL} htmlFor={`split-percent-${index}`}>
                  %
                </label>
                <input
                  id={`split-percent-${index}`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  value={split.percent}
                  onChange={(e) => updateSplit(index, { percent: e.target.value })}
                  className={FIELD}
                />
              </div>
              <div className="sm:col-span-5">
                <label className={LABEL} htmlFor={`split-note-${index}`}>
                  When it is due
                </label>
                <input
                  id={`split-note-${index}`}
                  type="text"
                  value={split.due_note}
                  onChange={(e) => updateSplit(index, { due_note: e.target.value })}
                  placeholder="Before work begins"
                  className={FIELD}
                />
              </div>
              <div className="flex items-end justify-between sm:col-span-1">
                <span className="text-sm font-medium text-primary-700 sm:hidden">
                  {formatInr(installments[index]?.amount_inr ?? 0)}
                </span>
                {form.splits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSplit(index)}
                    aria-label={`Remove stage ${index + 1}`}
                    className="ml-auto p-2.5 text-primary-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 aria-hidden className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* What the client will actually see, in rupees */}
        <div className="border-t border-primary-200 bg-primary-50 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span
              className={
                Math.abs(percentTotal - 100) > 0.01
                  ? 'font-medium text-red-600'
                  : 'text-primary-600'
              }
            >
              {percentTotal}% allocated
              {Math.abs(percentTotal - 100) > 0.01 && ' — must be exactly 100%'}
            </span>
            <span className="text-primary-600">
              {installments
                .map((inst) => `${inst.label || '—'}: ${formatInr(inst.amount_inr)}`)
                .join('  ·  ')}
            </span>
          </div>
        </div>
      </section>

      {/* Delivery terms */}
      <section className="overflow-hidden border border-primary-200 bg-white">
        <header className="border-b border-primary-200 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
            Delivery terms
          </h2>
        </header>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div>
            <label htmlFor="delivery_days" className={LABEL}>
              Delivery (days)
            </label>
            <input
              id="delivery_days"
              type="number"
              inputMode="numeric"
              min={1}
              max={365}
              value={form.delivery_days}
              onChange={(e) => set('delivery_days', e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="support_months" className={LABEL}>
              Support (months)
            </label>
            <input
              id="support_months"
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              value={form.support_months}
              onChange={(e) => set('support_months', e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="revisions_included" className={LABEL}>
              Revision rounds
            </label>
            <input
              id="revisions_included"
              type="number"
              inputMode="numeric"
              min={0}
              max={99}
              value={form.revisions_included}
              onChange={(e) => set('revisions_included', e.target.value)}
              className={FIELD}
            />
          </div>
        </div>
      </section>

      {/* Clauses */}
      <section className="overflow-hidden border border-primary-200 bg-white">
        <header className="border-b border-primary-200 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
            Terms
          </h2>
          <p className="mt-0.5 text-xs text-primary-500">
            Pre-filled from the standard template. Edit anything this client needs
            differently — what you leave here is what they sign.
          </p>
        </header>
        <div className="space-y-4 p-5">
          {CLAUSE_ORDER.map(([key, heading]) => (
            <div key={key}>
              <label htmlFor={`clause-${key}`} className={LABEL}>
                {heading}
              </label>
              <textarea
                id={`clause-${key}`}
                rows={3}
                value={form.clauses[key] ?? ''}
                onChange={(e) =>
                  set('clauses', { ...form.clauses, [key]: e.target.value })
                }
                className={`${FIELD} resize-y`}
              />
            </div>
          ))}

          <div className="border-t border-primary-200 pt-4">
            <label htmlFor="clause-signing_text" className={LABEL}>
              Consent sentence
              <span className="ml-1 font-normal text-primary-400">
                (shown beside the tick box)
              </span>
            </label>
            <textarea
              id="clause-signing_text"
              rows={2}
              value={form.clauses.signing_text ?? ''}
              onChange={(e) =>
                set('clauses', { ...form.clauses, signing_text: e.target.value })
              }
              className={`${FIELD} resize-y`}
            />
          </div>
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-primary-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
          {isSaving
            ? 'Saving…'
            : mode === 'edit'
              ? 'Save changes'
              : 'Create agreement'}
        </button>
        <Link
          href={
            mode === 'edit' && agreementId
              ? `/admin/agreements/${agreementId}`
              : '/admin/agreements'
          }
          className="text-sm text-primary-500 transition hover:text-primary-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
