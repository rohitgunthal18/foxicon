import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { verifySession } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CLAUSE_KEYS } from '@/lib/agreement-clauses';
import AgreementForm, { type AgreementFormData } from '@/components/admin/AgreementForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditAgreementPage({ params }: Props) {
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

  /*
    A signed agreement is a record of what was agreed. The PATCH route refuses
    to change one, and this page refuses to offer the form at all — showing an
    editable copy of a document that cannot be edited only invites the attempt.
  */
  if (agreement.status === 'signed' || agreement.status === 'voided') {
    return (
      <div className="space-y-4">
        <Link
          href={`/admin/agreements/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition hover:text-primary-900"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Back to agreement
        </Link>
        <div className="border border-primary-200 bg-white p-8 text-center">
          <h1 className="font-display text-xl font-bold text-primary-900">
            {agreement.status === 'signed'
              ? 'This agreement is signed'
              : 'This agreement was voided'}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-primary-600">
            {agreement.status === 'signed'
              ? 'A signed agreement is a record of what both sides agreed to, so it cannot be edited. Create a new one if the terms need to change.'
              : 'Voided agreements are kept for the record. Create a new one instead.'}
          </p>
          <Link
            href="/admin/agreements/new"
            className="mt-4 inline-block bg-primary-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            New agreement
          </Link>
        </div>
      </div>
    );
  }

  const storedClauses = (agreement.content ?? {}) as Record<string, string>;
  const clauses: Record<string, string> = {};
  for (const key of CLAUSE_KEYS) {
    clauses[key] = storedClauses[key] ?? '';
  }

  const splits = (agreement.installments ?? []) as {
    label: string;
    percent: number;
    due_note: string;
  }[];

  const initial: AgreementFormData = {
    lead_id: agreement.lead_id,
    client_name: agreement.client_name,
    client_company: agreement.client_company ?? '',
    client_email: agreement.client_email ?? '',
    client_phone: agreement.client_phone ?? '',
    project_title: agreement.project_title ?? '',
    items: (items ?? []).map((item) => ({
      kind: item.kind as 'service' | 'addon' | 'discount',
      label: item.label,
      detail: item.detail ?? '',
      qty: String(item.qty),
      unit_inr: String(item.unit_inr),
    })),
    tax_percent: String(agreement.tax_percent ?? 0),
    splits: splits.map((split) => ({
      label: split.label,
      percent: String(split.percent),
      due_note: split.due_note,
    })),
    delivery_days: String(agreement.delivery_days),
    support_months: String(agreement.support_months),
    revisions_included: String(agreement.revisions_included),
    clauses,
  };

  return (
    <div className="space-y-6">
      <header>
        <Link
          href={`/admin/agreements/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition hover:text-primary-900"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Back to agreement
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold text-primary-900">
          Edit {agreement.reference}
        </h1>
      </header>

      <AgreementForm
        mode="edit"
        agreementId={id}
        initial={initial}
        warnLinkRevocation={agreement.status === 'sent'}
      />
    </div>
  );
}
