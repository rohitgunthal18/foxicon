import { NextResponse } from 'next/server';
import { z } from 'zod';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { hashToken, hashAgreementContent } from '@/lib/agreements';
import { getClientIp, hashIp } from '@/lib/http';

/**
 * The public signing endpoint. This is the one endpoint an outsider can reach
 * with no login, so it is locked down on five independent axes:
 *
 *  1. **Unguessable token.** 32 random bytes. The URL is the credential.
 *  2. **Hash-only storage.** We look up by sha256(token); the raw token is
 *     never stored, so a database leak yields no working links.
 *  3. **One-shot state machine.** The signature is written by an UPDATE that
 *     is conditional on `status = 'sent'`. Signing sets it to `'signed'` in
 *     that same statement, so a second request — replayed, refreshed, or
 *     racing concurrently — matches zero rows and is refused with 409. There
 *     is no window where two requests can both pass a check and then both
 *     write.
 *  4. **Unique constraint.** `signature_events.agreement_id` is UNIQUE and the
 *     table rejects UPDATE and DELETE via trigger. Even if the state guard
 *     were bypassed, the second insert fails and the row can never be altered.
 *  5. **Expiry + content hash.** Links die after 14 days, and the hash of the
 *     exact text shown is stored with the signature, so terms cannot be
 *     rewritten after the fact and passed off as signed.
 *
 * Note what is deliberately absent: no way to list agreements, no way to learn
 * whether a token exists other than by holding it, and identical 404 responses
 * for "no such token" and "wrong token" so the endpoint cannot be probed.
 */

const signSchema = z.object({
  signer_name: z.string().trim().min(2, 'Please type your full name').max(160),
  signer_email: z.union([z.email(), z.literal('')]).optional(),
  accepted_terms: z.literal(true, {
    message: 'Please tick the box to accept the terms',
  }),
  /** The hash the browser was shown. Must match the server's current hash. */
  content_hash: z.string().length(64),
});

/** Shape returned to the signing page. Never includes token or hash columns. */
function publicView(agreement: Record<string, unknown>) {
  return {
    reference: agreement.reference,
    status: agreement.status,
    client_name: agreement.client_name,
    client_company: agreement.client_company,
    client_email: agreement.client_email,
    project_title: agreement.project_title,
    currency: agreement.currency,
    subtotal_inr: agreement.subtotal_inr,
    discount_inr: agreement.discount_inr,
    tax_percent: agreement.tax_percent,
    total_inr: agreement.total_inr,
    installments: agreement.installments,
    delivery_days: agreement.delivery_days,
    support_months: agreement.support_months,
    revisions_included: agreement.revisions_included,
    content: agreement.content,
    sent_at: agreement.sent_at,
    expires_at: agreement.expires_at,
    signed_at: agreement.signed_at,
  };
}

async function loadByToken(token: string) {
  const tokenHash = hashToken(token);

  const { data } = await supabaseAdmin
    .from('agreements')
    .select('*')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  return data;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const agreement = await loadByToken(token);

  // Same response for a malformed token, an unknown token and a voided
  // agreement — nothing here confirms whether a link ever existed.
  if (!agreement || agreement.status === 'draft' || agreement.status === 'voided') {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const { data: items } = await supabaseAdmin
    .from('agreement_items')
    .select('kind, label, detail, qty, unit_inr, sort_order')
    .eq('agreement_id', agreement.id)
    .order('sort_order', { ascending: true });

  if (agreement.status === 'signed') {
    const { data: signature } = await supabaseAdmin
      .from('signature_events')
      .select('signer_name, signed_at, content_hash')
      .eq('agreement_id', agreement.id)
      .maybeSingle();

    return NextResponse.json({
      state: 'signed',
      agreement: publicView(agreement),
      items: items ?? [],
      signature,
      // True when the agreement text still matches what was signed.
      content_intact: signature?.content_hash === agreement.content_hash,
    });
  }

  if (agreement.expires_at && new Date(agreement.expires_at) < new Date()) {
    return NextResponse.json({ state: 'expired' }, { status: 410 });
  }

  return NextResponse.json({
    state: 'awaiting_signature',
    agreement: publicView(agreement),
    items: items ?? [],
    content_hash: agreement.content_hash,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = signSchema.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first?.message ?? 'Invalid details.' }, { status: 422 });
  }

  const agreement = await loadByToken(token);

  if (!agreement || agreement.status === 'draft' || agreement.status === 'voided') {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Already signed — refuse loudly and permanently. This is the case the
  // owner specifically asked about: a re-POST to a known endpoint.
  if (agreement.status === 'signed') {
    return NextResponse.json(
      { error: 'This agreement has already been signed.' },
      { status: 409 }
    );
  }

  if (agreement.expires_at && new Date(agreement.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This link has expired.' }, { status: 410 });
  }

  // The client must be signing the text we currently hold. If the admin edited
  // the agreement after the page loaded, the hashes diverge and we stop.
  const currentHash = agreement.content_hash ?? hashAgreementContent(agreement.content);
  if (parsed.data.content_hash !== currentHash) {
    return NextResponse.json(
      { error: 'This agreement was updated. Please reload the page and read it again.' },
      { status: 409 }
    );
  }

  const signedAt = new Date().toISOString();

  // The one-shot gate. `.eq('status', 'sent')` means only the first request
  // through here matches a row; every later one updates nothing.
  const { data: claimed, error: claimError } = await supabaseAdmin
    .from('agreements')
    .update({ status: 'signed', signed_at: signedAt })
    .eq('id', agreement.id)
    .eq('status', 'sent')
    .select('id, lead_id, reference')
    .maybeSingle();

  if (claimError) {
    return NextResponse.json({ error: 'Could not record the signature.' }, { status: 500 });
  }

  if (!claimed) {
    // Lost the race to a concurrent request, or status moved underneath us.
    return NextResponse.json(
      { error: 'This agreement has already been signed.' },
      { status: 409 }
    );
  }

  const { error: signatureError } = await supabaseAdmin.from('signature_events').insert({
    agreement_id: claimed.id,
    signer_name: parsed.data.signer_name,
    signer_email: parsed.data.signer_email || null,
    accepted_terms: true,
    content_hash: currentHash,
    ip_hash: hashIp(getClientIp(request)),
    user_agent: request.headers.get('user-agent')?.slice(0, 400) ?? null,
    signed_at: signedAt,
  });

  if (signatureError) {
    // The status flip succeeded but the audit row did not. Roll the status
    // back so the client can retry rather than being left with an agreement
    // marked signed and no evidence behind it.
    await supabaseAdmin
      .from('agreements')
      .update({ status: 'sent', signed_at: null })
      .eq('id', claimed.id);

    return NextResponse.json({ error: 'Could not record the signature.' }, { status: 500 });
  }

  // Advance the lead and log it, so the owner sees the deal move on its own.
  if (claimed.lead_id) {
    await supabaseAdmin
      .from('leads')
      .update({ status: 'development' })
      .eq('id', claimed.lead_id)
      .in('status', ['agreement', 'qualified', 'contacted', 'new', 'follow_up']);

    await supabaseAdmin.from('lead_activities').insert({
      lead_id: claimed.lead_id,
      kind: 'agreement_signed',
      body: `${parsed.data.signer_name} signed agreement ${claimed.reference}.`,
      meta: { agreement_id: claimed.id, reference: claimed.reference },
    });
  }

  return NextResponse.json({ ok: true, signed_at: signedAt });
}
