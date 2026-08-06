import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FileCheck2, ShieldCheck, Clock } from 'lucide-react';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { hashToken, hashAgreementContent } from '@/lib/agreements';
import { formatInr } from '@/lib/admin';
import { CLAUSE_ORDER } from '@/lib/agreement-clauses';
import SignatureForm from '@/components/admin/SignatureForm';

export const metadata: Metadata = {
  title: 'Service Agreement — FOXI TECH',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SignPage({ params }: Props) {
  const { token } = await params;

  const { data: agreement } = await supabaseAdmin
    .from('agreements')
    .select('*')
    .eq('token_hash', hashToken(token))
    .maybeSingle();

  // Drafts and voided agreements are indistinguishable from a bad link.
  if (!agreement || agreement.status === 'draft' || agreement.status === 'voided') {
    notFound();
  }

  const { data: items } = await supabaseAdmin
    .from('agreement_items')
    .select('kind, label, detail, qty, unit_inr, sort_order')
    .eq('agreement_id', agreement.id)
    .order('sort_order', { ascending: true });

  const content = (agreement.content ?? {}) as Record<string, string>;
  const installments = (agreement.installments ?? []) as {
    label: string;
    percent: number;
    amount_inr: number;
    due_note: string;
  }[];

  const isExpired =
    agreement.status === 'sent' &&
    agreement.expires_at !== null &&
    new Date(agreement.expires_at) < new Date();

  const isSigned = agreement.status === 'signed';

  let signature: { signer_name: string; signed_at: string } | null = null;
  if (isSigned) {
    const { data } = await supabaseAdmin
      .from('signature_events')
      .select('signer_name, signed_at')
      .eq('agreement_id', agreement.id)
      .maybeSingle();
    signature = data ?? null;
  }

  const contentHash = agreement.content_hash ?? hashAgreementContent(agreement.content);

  const workItems = (items ?? []).filter((item) => item.kind !== 'discount');
  const discountItems = (items ?? []).filter((item) => item.kind === 'discount');

  return (
    <main className="min-h-screen bg-primary-50 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Letterhead */}
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border border-primary-200 bg-primary-900 p-6 sm:p-8">
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              FOXI<span className="text-accent-500">.</span>
            </span>
            <p className="mt-1 text-xs text-white/50">
              Shop 4, Tech Plaza, Baner Road, Pune 411045
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/40">Agreement</p>
            <p className="font-mono text-sm text-white">{agreement.reference}</p>
          </div>
        </header>

        <div className="border border-t-0 border-primary-200 bg-white p-6 sm:p-10">
          {/* State banners */}
          {isSigned && signature && (
            <div className="mb-8 flex items-start gap-3 border border-emerald-500/20 bg-emerald-500/5 p-4">
              <FileCheck2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-primary-900">
                  Signed by {signature.signer_name}
                </p>
                <p className="mt-0.5 text-xs text-primary-600">
                  {new Date(signature.signed_at).toLocaleString('en-IN', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                  . This is your copy — keep it for your records.
                </p>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="mb-8 flex items-start gap-3 border border-amber-500/20 bg-amber-500/5 p-4">
              <Clock aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-primary-900">This link has expired</p>
                <p className="mt-0.5 text-xs text-primary-600">
                  Get in touch and we will send you a fresh one.
                </p>
              </div>
            </div>
          )}

          <h1 className="font-display text-2xl font-bold text-primary-900 sm:text-3xl">
            Service Agreement
          </h1>
          {agreement.project_title && (
            <p className="mt-1 text-sm text-primary-600">{agreement.project_title}</p>
          )}

          {/* Parties */}
          <dl className="mt-6 grid gap-4 border-y border-primary-200 py-5 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-widest text-primary-400">
                Prepared for
              </dt>
              <dd className="mt-1 text-sm text-primary-900">
                {agreement.client_name}
                {agreement.client_company && (
                  <span className="block text-primary-600">{agreement.client_company}</span>
                )}
                {agreement.client_email && (
                  <span className="block text-xs text-primary-500">{agreement.client_email}</span>
                )}
                {agreement.client_phone && (
                  <span className="block text-xs text-primary-500">{agreement.client_phone}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-widest text-primary-400">
                Prepared by
              </dt>
              <dd className="mt-1 text-sm text-primary-900">
                FOXI TECH
                <span className="block text-xs text-primary-500">contact.foxitech@gmail.com</span>
                <span className="block text-xs text-primary-500">+91 72186 16190</span>
              </dd>
            </div>
          </dl>

          {/* Line items */}
          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary-400">
              What is included
            </h2>

            <div className="mt-3 divide-y divide-primary-200 border-y border-primary-200">
              {workItems.map((item, index) => (
                <div key={index} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary-900">{item.label}</p>
                    {item.detail && (
                      <p className="mt-0.5 text-xs text-primary-500">{item.detail}</p>
                    )}
                    {item.qty > 1 && (
                      <p className="mt-0.5 text-xs text-primary-400">
                        {item.qty} × {formatInr(item.unit_inr)}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm text-primary-900">
                    {formatInr(item.qty * item.unit_inr)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-primary-600">
                <span>Subtotal</span>
                <span>{formatInr(agreement.subtotal_inr)}</span>
              </div>

              {discountItems.map((item, index) => (
                <div key={index} className="flex justify-between text-emerald-700">
                  <span>{item.label}</span>
                  <span>−{formatInr(item.qty * item.unit_inr)}</span>
                </div>
              ))}

              {Number(agreement.tax_percent) > 0 && (
                <div className="flex justify-between text-primary-600">
                  <span>GST ({agreement.tax_percent}%)</span>
                  <span>
                    {formatInr(
                      agreement.total_inr -
                        (agreement.subtotal_inr - agreement.discount_inr)
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t border-primary-200 pt-2 font-display text-lg font-bold text-primary-900">
                <span>Total</span>
                <span>{formatInr(agreement.total_inr)}</span>
              </div>
            </div>
          </section>

          {/* Payment schedule */}
          {installments.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-primary-400">
                Payment schedule
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {installments.map((installment, index) => (
                  <div
                    key={index}
                    className="border border-primary-200 p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-primary-500">
                      {installment.label} · {installment.percent}%
                    </p>
                    <p className="mt-1 font-display text-lg font-bold text-primary-900">
                      {formatInr(installment.amount_inr)}
                    </p>
                    <p className="mt-0.5 text-xs text-primary-500">{installment.due_note}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Key terms at a glance */}
          <section className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ['Delivery', `${agreement.delivery_days} days`],
              ['Support', `${agreement.support_months} month${agreement.support_months === 1 ? '' : 's'}`],
              ['Revisions', `${agreement.revisions_included} rounds`],
            ].map(([label, value]) => (
              <div key={label} className="bg-primary-50 p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-400">
                  {label}
                </p>
                <p className="mt-1 text-sm font-medium text-primary-900">{value}</p>
              </div>
            ))}
          </section>

          {/* Clauses */}
          <section className="mt-8 space-y-4 sm:space-y-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary-400">
              Terms
            </h2>
            {CLAUSE_ORDER.filter(([key]) => content[key]?.trim()).map(([key, heading], index) => (
              <article key={key}>
                <h3 className="text-xs font-semibold text-primary-900 sm:text-sm">
                  {index + 1}. {heading}
                </h3>
                <p className="mt-1 whitespace-pre-line text-[11px] leading-relaxed text-primary-700 sm:text-sm">
                  {content[key]}
                </p>
              </article>
            ))}
          </section>

          {/* Signature */}
          <section className="mt-10 border-t border-primary-200 pt-8">
            {isSigned && signature ? (
              <div className="bg-primary-50 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-400">
                  Signed by
                </p>
                <p className="mt-1 font-display text-xl text-primary-900">
                  {signature.signer_name}
                </p>
                <p className="mt-0.5 text-xs text-primary-500">
                  {new Date(signature.signed_at).toLocaleString('en-IN', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            ) : isExpired ? (
              <p className="text-sm text-primary-600">
                This agreement can no longer be signed online.
              </p>
            ) : (
              <SignatureForm
                token={token}
                contentHash={contentHash}
                signingText={
                  content.signing_text ??
                  'I confirm I have read and agree to the terms above.'
                }
                defaultName={agreement.client_name}
                defaultEmail={agreement.client_email ?? ''}
              />
            )}
          </section>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-primary-400">
            <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
            Signed electronically. Valid under the Information Technology Act, 2000.
          </p>
        </div>
      </div>
    </main>
  );
}
