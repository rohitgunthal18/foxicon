import { NextResponse } from 'next/server';

import { getCurrentAdmin } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { computeTotals, type AgreementLine } from '@/lib/agreement-math';
import { hashAgreementContent } from '@/lib/agreements';
import { agreementSchema } from '@/lib/agreement-schema';

/**
 * Edit an agreement before it is signed.
 *
 * The status gate is the whole point of this handler:
 *
 *  - `draft`  — edit freely. Nobody has seen it.
 *  - `sent`   — edit *and revoke*. Saving nulls the token hash, which makes the
 *    link already in the client's inbox a 404, and drops the agreement back to
 *    draft so it must be sent again. The alternative — quietly editing under a
 *    live link — means a client reading the terms has them change mid-read, and
 *    then hits the content-hash guard on submit with an error they cannot act
 *    on. Killing the link is louder, and loud is correct here.
 *  - `signed` — refused. A signed agreement is a record of what was agreed; it
 *    is not editable by anyone, including us.
 *  - `voided` — refused. Duplicate it instead.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const { id } = await params;

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

  const { data: existing } = await supabaseAdmin
    .from('agreements')
    .select('id, status, reference')
    .eq('id', id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Agreement not found.' }, { status: 404 });
  }

  if (existing.status === 'signed') {
    return NextResponse.json(
      { error: 'This agreement is signed and can no longer be changed.' },
      { status: 409 }
    );
  }

  if (existing.status === 'voided') {
    return NextResponse.json(
      { error: 'This agreement was voided. Duplicate it instead.' },
      { status: 409 }
    );
  }

  // Same recomputation as create: whatever total the browser sent is ignored.
  const totals = computeTotals(input.items as AgreementLine[], input.tax_percent);

  const wasSent = existing.status === 'sent';

  const { error } = await supabaseAdmin
    .from('agreements')
    .update({
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
      // Revoke the outstanding link. Lookup is by token_hash, so nulling it
      // makes every URL already handed out unresolvable.
      ...(wasSent
        ? { status: 'draft' as const, token_hash: null, expires_at: null, sent_at: null }
        : {}),
    })
    .eq('id', id)
    // Re-assert the status we read above. If it changed underneath us — someone
    // signed it in the last few milliseconds — this matches zero rows rather
    // than overwriting a signed agreement.
    .eq('status', existing.status);

  if (error) {
    return NextResponse.json({ error: 'Could not save the changes.' }, { status: 500 });
  }

  // Line items are replaced wholesale rather than diffed: nothing references
  // them, and a delete-then-insert cannot leave a half-updated price list.
  const { error: deleteError } = await supabaseAdmin
    .from('agreement_items')
    .delete()
    .eq('agreement_id', id);

  if (deleteError) {
    return NextResponse.json({ error: 'Could not update the line items.' }, { status: 500 });
  }

  const { error: itemsError } = await supabaseAdmin.from('agreement_items').insert(
    input.items.map((item, index) => ({
      agreement_id: id,
      kind: item.kind,
      label: item.label,
      detail: item.detail ?? null,
      qty: item.qty,
      unit_inr: item.unit_inr,
      sort_order: index,
    }))
  );

  if (itemsError) {
    return NextResponse.json({ error: 'Could not save the line items.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    id,
    reference: existing.reference,
    /** True when saving invalidated a signing link that was already sent. */
    link_revoked: wasSent,
  });
}
