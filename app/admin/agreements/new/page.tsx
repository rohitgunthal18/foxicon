import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { verifySession } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { DEFAULT_SPLITS } from '@/lib/agreement-math';
import { CLAUSE_KEYS } from '@/lib/agreement-clauses';
import AgreementForm, { type AgreementFormData } from '@/components/admin/AgreementForm';

interface Props {
  searchParams: Promise<{ lead?: string }>;
}

export default async function NewAgreementPage({ searchParams }: Props) {
  await verifySession();
  const { lead: leadId } = await searchParams;

  /*
    The lead and the template are independent reads, so they go in parallel —
    the Supabase project is in Seoul and serialising them would cost an extra
    round trip on a page that is already a form the admin is waiting to type in.
  */
  const [leadResult, templateResult] = await Promise.all([
    leadId
      ? supabaseAdmin
          .from('leads')
          .select('id, name, company, email, phone, service_slug, value_inr, message')
          .eq('id', leadId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabaseAdmin
      .from('agreement_templates')
      .select('*')
      .eq('is_default', true)
      .maybeSingle(),
  ]);

  const lead = leadResult.data;
  const template = templateResult.data;

  // Every clause the form knows about, pulled off the template row by name.
  const clauses: Record<string, string> = {};
  for (const key of CLAUSE_KEYS) {
    const value = template ? (template as Record<string, unknown>)[key] : null;
    clauses[key] = typeof value === 'string' ? value : '';
  }

  const initial: AgreementFormData = {
    lead_id: lead?.id ?? null,
    // Business name is the better label on an agreement when we have one, but
    // the personal name is what we always have — fall back rather than blank.
    client_name: lead?.name ?? '',
    client_company: lead?.company ?? '',
    client_email: lead?.email ?? '',
    client_phone: lead?.phone ?? '',
    project_title: '',
    items: [
      {
        kind: 'service',
        label: '',
        detail: '',
        qty: '1',
        // The deal value the admin already estimated on the lead, so the common
        // case is "check it and send" rather than "retype what you just typed".
        unit_inr: lead?.value_inr != null ? String(lead.value_inr) : '',
      },
    ],
    tax_percent: '0',
    splits: DEFAULT_SPLITS.map((split) => ({
      label: split.label,
      percent: String(split.percent),
      due_note: split.due_note,
    })),
    delivery_days: '7',
    support_months: '1',
    revisions_included: '2',
    clauses,
  };

  return (
    <div className="space-y-6">
      <header>
        <Link
          href={lead ? `/admin/leads/${lead.id}` : '/admin/agreements'}
          className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition hover:text-primary-900"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          {lead ? 'Back to lead' : 'Back to agreements'}
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold text-primary-900">
          New agreement
        </h1>
        <p className="mt-1 text-sm text-primary-600">
          {lead
            ? `Pre-filled from ${lead.name}. Check the pricing and terms, then create it.`
            : 'Fill in the client, the pricing and the terms.'}
        </p>
      </header>

      {!template && (
        <p className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No default template was found, so the terms below start empty. Fill them
          in before sending — an agreement with blank terms is not worth signing.
        </p>
      )}

      <AgreementForm mode="create" initial={initial} />
    </div>
  );
}
