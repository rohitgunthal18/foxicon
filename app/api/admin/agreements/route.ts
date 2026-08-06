import { NextResponse } from 'next/server';

import { getCurrentAdmin } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { computeTotals, type AgreementLine } from '@/lib/agreement-math';
import { hashAgreementContent } from '@/lib/agreements';
import { agreementSchema } from '@/lib/agreement-schema';

/** Sequential, human-readable reference: FOXI-2026-0001. */
async function nextReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FOXI-${year}-`;

  const { data } = await supabaseAdmin
    .from('agreements')
    .select('reference')
    .like('reference', `${prefix}%`)
    .order('reference', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastNumber = data?.reference
    ? Number.parseInt(data.reference.slice(prefix.length), 10)
    : 0;

  return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
}

/** Create a draft agreement. Drafts have no token and cannot be signed. */
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = agreementSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Some values were not valid.' },
      { status: 422 }
    );
  }

  const input = parsed.data;

  // Recompute every figure server-side. Whatever total the browser sent is
  // ignored — the stored amount is derived from the line items alone.
  const totals = computeTotals(input.items as AgreementLine[], input.tax_percent);

  const reference = await nextReference();

  const { data: agreement, error } = await supabaseAdmin
    .from('agreements')
    .insert({
      lead_id: input.lead_id ?? null,
      reference,
      status: 'draft',
      client_name: input.client_name,
      client_email: input.client_email || null,
      client_phone: input.client_phone || null,
      client_company: input.client_company || null,
      client_address: input.client_address || null,
      plan_slug: input.plan_slug ?? null,
      service_slug: input.service_slug ?? null,
      project_title: input.project_title ?? '',
      subtotal_inr: totals.subtotalInr,
      discount_inr: totals.discountInr,
      tax_percent: input.tax_percent,
      total_inr: totals.totalInr,
      installments: input.installments,
      delivery_days: input.delivery_days,
      support_months: input.support_months,
      revisions_included: input.revisions_included,
      content: input.content,
      content_hash: hashAgreementContent(input.content),
      created_by: admin.id,
    })
    .select('id, reference')
    .single();

  if (error || !agreement) {
    return NextResponse.json({ error: 'Could not create the agreement.' }, { status: 500 });
  }

  const { error: itemsError } = await supabaseAdmin.from('agreement_items').insert(
    input.items.map((item, index) => ({
      agreement_id: agreement.id,
      kind: item.kind,
      label: item.label,
      detail: item.detail ?? null,
      qty: item.qty,
      unit_inr: item.unit_inr,
      sort_order: index,
    }))
  );

  if (itemsError) {
    // No line items means no agreement. Remove the header rather than leaving
    // a zero-value draft behind.
    await supabaseAdmin.from('agreements').delete().eq('id', agreement.id);
    return NextResponse.json({ error: 'Could not save the line items.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: agreement.id, reference: agreement.reference });
}
