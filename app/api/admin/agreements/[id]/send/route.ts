import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentAdmin } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  generateSigningToken,
  hashToken,
  hashAgreementContent,
  signingLinkExpiry,
  SIGNING_LINK_DAYS,
} from '@/lib/agreements';

const sendSchema = z.object({
  expires_in_days: z.number().int().min(1).max(90).default(SIGNING_LINK_DAYS),
});

/**
 * Send a draft for signature.
 *
 * Mints the token, stores only its hash, and flips the agreement to `sent`.
 * The raw token is returned in this response and never again — it exists in
 * the database only as a hash, so there is no "resend the same link" path.
 * Re-sending mints a fresh token, which silently invalidates the old link.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = sendSchema.safeParse(body);
  const expiresInDays = parsed.success ? parsed.data.expires_in_days : SIGNING_LINK_DAYS;

  const { data: agreement } = await supabaseAdmin
    .from('agreements')
    .select('id, status, lead_id, reference, content, client_name')
    .eq('id', id)
    .maybeSingle();

  if (!agreement) {
    return NextResponse.json({ error: 'Agreement not found.' }, { status: 404 });
  }

  // A signed agreement is final. Re-sending would mean minting a link to
  // something already executed.
  if (agreement.status === 'signed') {
    return NextResponse.json(
      { error: 'This agreement is already signed.' },
      { status: 409 }
    );
  }

  if (agreement.status === 'voided') {
    return NextResponse.json(
      { error: 'This agreement was voided. Duplicate it instead.' },
      { status: 409 }
    );
  }

  const token = generateSigningToken();

  // Freeze the content hash at send time. This is the value the signing page
  // shows the client and the signature is bound to.
  const contentHash = hashAgreementContent(agreement.content);

  const { error } = await supabaseAdmin
    .from('agreements')
    .update({
      status: 'sent',
      token_hash: hashToken(token),
      content_hash: contentHash,
      sent_at: new Date().toISOString(),
      expires_at: signingLinkExpiry(expiresInDays),
    })
    .eq('id', id)
    .in('status', ['draft', 'sent']);

  if (error) {
    return NextResponse.json({ error: 'Could not send the agreement.' }, { status: 500 });
  }

  // Move the lead to the agreement stage and log it.
  if (agreement.lead_id) {
    await supabaseAdmin
      .from('leads')
      .update({ status: 'agreement' })
      .eq('id', agreement.lead_id)
      .in('status', ['new', 'contacted', 'qualified', 'follow_up']);

    await supabaseAdmin.from('lead_activities').insert({
      lead_id: agreement.lead_id,
      author_id: admin.id,
      kind: 'agreement_sent',
      body: `Agreement ${agreement.reference} sent to ${agreement.client_name}.`,
      meta: { agreement_id: id, reference: agreement.reference },
    });
  }

  const origin = new URL(request.url).origin;

  return NextResponse.json({
    ok: true,
    // Shown once. Copy it now or mint a new one later.
    link: `${origin}/sign/${token}`,
    expires_in_days: expiresInDays,
  });
}
