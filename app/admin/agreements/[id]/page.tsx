import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, FileSignature } from 'lucide-react';

import { verifySession } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CLAUSE_ORDER, FOXI } from '@/lib/agreement-clauses';
import { absoluteTime, formatInr, type AgreementStatus } from '@/lib/admin';
import SendAgreementButton from '@/components/admin/SendAgreementButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AgreementDetailPage({ params }: Props) {
  await verifySession();
  const { id } = await params;

  const [{ data: agreement }, { data: items }] = await Promise.all([
    supabaseAdmin.from('agreements').select('*').eq('id', id).maybeSingle(),
    supabaseAdmin
      .from('agreement_items')
      .select('kind, label, detail, qty, unit_inr, sort_order')
      .eq('agreement_id', id)
      .order('sort_order', { ascending: true }),
  ]);

  if (!agreement) notFound();

  const status = agreement.status as AgreementStatus;
  const clauses = (agreement.content ?? {}) as Record<string, string>;
  const installments = (agreement.installments ?? []) as {
    label: string;
    percent: number;
    amount_inr: number;
    due_note: string;
  }[];

  const workItems = (items ?? []).filter((item) => item.kind !== 'discount');
  const netBeforeTax = agreement.subtotal_inr - agreement.discount_inr;
  const taxInr = agreement.total_inr - netBeforeTax;

  const hasExpired =
    status === 'sent' &&
    agreement.expires_at !== null &&
    new Date(agreement.expires_at) < new Date();

  // The signature lives in its own table, one row per agreement, immutable.
  let signature: { signer_name: string; signed_at: string } | null = null;
  if (status === 'signed') {
    const { data } = await supabaseAdmin
      .from('signature_events')
      .select('signer_name, signed_at')
      .eq('agreement_id', id)
      .maybeSingle();
    signature = data;
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/agreements"
          className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition hover:text-primary-900"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Back to agreements
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-primary-900">
              {agreement.reference}
            </h1>
            <p className="mt-1 text-sm text-primary-600">
              {status === 'draft' && 'Draft agreement — edit and send when ready'}
              {status === 'sent' && 'Sent — waiting for signature'}
              {status === 'signed' && 'Signed agreement'}
              {status === 'voided' && 'Voided agreement'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {status === 'draft' && (
              <>
                <Link
                  href={`/admin/agreements/${id}/edit`}
                  className="inline-flex items-center gap-1.5 border border-primary-300 bg-white px-4 py-2.5 text-sm font-medium text-primary-900 transition hover:border-primary-400"
                >
                  Edit
                </Link>
                <SendAgreementButton agreementId={id} />
              </>
            )}

            {status === 'sent' && (
              <>
                <Link
                  href={`/api/admin/agreements/${id}/pdf`}
                  className="inline-flex items-center gap-1.5 border border-primary-300 bg-white px-4 py-2.5 text-sm font-medium text-primary-900 transition hover:border-primary-400"
                >
                  <Download className="h-4 w-4" />
                  Preview PDF
                </Link>
                <SendAgreementButton agreementId={id} resend />
              </>
            )}

            {status === 'signed' && (
              <Link
                href={`/api/admin/agreements/${id}/pdf`}
                className="inline-flex items-center gap-1.5 bg-primary-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600"
              >
                <Download className="h-4 w-4" />
                Download Signed PDF
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Signed banner */}
      {status === 'signed' && signature && (
        <div className="border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <FileSignature className="h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Signed by {signature.signer_name}
              </p>
              <p className="mt-0.5 text-sm text-green-700">
                {absoluteTime(signature.signed_at)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Note for sent agreements */}
      {status === 'sent' && (
        <div className="border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            {hasExpired
              ? 'The signing link has expired. Resend to generate a fresh one.'
              : 'The signing link was shown when you clicked Send. Copy it from the modal or resend to generate a new one.'}
          </p>
        </div>
      )}

      {/* Agreement preview */}
      <div className="space-y-6 border border-primary-200 bg-white p-6">
        {/* Parties */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary-400">
              Prepared For
            </p>
            <p className="mt-2 font-medium text-primary-900">{agreement.client_name}</p>
            {agreement.client_company && (
              <p className="text-sm text-primary-600">{agreement.client_company}</p>
            )}
            {agreement.client_phone && (
              <p className="text-sm text-primary-600">{agreement.client_phone}</p>
            )}
            {agreement.client_email && (
              <p className="text-sm text-primary-600">{agreement.client_email}</p>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary-400">
              Prepared By
            </p>
            <p className="mt-2 font-medium text-primary-900">{FOXI.name}</p>
            <p className="text-sm text-primary-600">{FOXI.email}</p>
            <p className="text-sm text-primary-600">{FOXI.phone}</p>
          </div>
        </div>

        {agreement.project_title && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary-400">
              Project
            </p>
            <p className="mt-2 font-medium text-primary-900">{agreement.project_title}</p>
          </div>
        )}

        <div className="border-t border-primary-200" />

        {/* Line items */}
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-primary-400">
            What Is Included
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-primary-700">
                    Description
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-primary-700">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-primary-700">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {workItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-primary-900">{item.label}</p>
                      {item.detail && (
                        <p className="mt-0.5 text-xs text-primary-500">{item.detail}</p>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center text-primary-900">{item.qty}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-primary-900">
                      {formatInr(item.qty * item.unit_inr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-600">Subtotal</span>
                <span className="font-medium text-primary-900">
                  {formatInr(agreement.subtotal_inr)}
                </span>
              </div>
              {agreement.discount_inr > 0 && (
                <div className="flex justify-between">
                  <span className="text-primary-600">Discount</span>
                  <span className="font-medium text-primary-900">
                    - {formatInr(agreement.discount_inr)}
                  </span>
                </div>
              )}
              {agreement.tax_percent > 0 && (
                <div className="flex justify-between">
                  <span className="text-primary-600">GST ({agreement.tax_percent}%)</span>
                  <span className="font-medium text-primary-900">{formatInr(taxInr)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-primary-900 pt-2">
                <span className="font-bold text-primary-900">Total</span>
                <span className="font-bold text-primary-900">
                  {formatInr(agreement.total_inr)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment schedule */}
        {installments.length > 0 && (
          <>
            <div className="border-t border-primary-200" />
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-primary-400">
                Payment Schedule
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-primary-700">
                        Stage
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-primary-700">
                        Share
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-primary-700">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100">
                    {installments.map((inst, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-primary-900">{inst.label}</p>
                          {inst.due_note && (
                            <p className="mt-0.5 text-xs text-primary-500">{inst.due_note}</p>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center text-primary-900">
                          {inst.percent}%
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-primary-900">
                          {formatInr(inst.amount_inr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Key terms */}
        <div className="border-t border-primary-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-primary-50 px-4 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-primary-400">
              Delivery
            </p>
            <p className="mt-1 text-lg font-bold text-primary-900">
              {agreement.delivery_days} days
            </p>
          </div>
          <div className="bg-primary-50 px-4 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-primary-400">
              Support
            </p>
            <p className="mt-1 text-lg font-bold text-primary-900">
              {agreement.support_months}{' '}
              {agreement.support_months === 1 ? 'month' : 'months'}
            </p>
          </div>
          <div className="bg-primary-50 px-4 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-primary-400">
              Revisions
            </p>
            <p className="mt-1 text-lg font-bold text-primary-900">
              {agreement.revisions_included} rounds
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="border-t border-primary-200" />
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-primary-400">
            Terms
          </p>
          <div className="space-y-4">
            {CLAUSE_ORDER.filter(([key]) => clauses[key]?.trim()).map(
              ([key, heading], index) => (
                <div key={key}>
                  <h3 className="font-medium text-primary-900">
                    {index + 1}. {heading}
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-primary-700">
                    {clauses[key]}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
