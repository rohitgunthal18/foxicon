import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { hashToken } from '@/lib/agreements';
import { AgreementPDF } from '@/lib/pdf/agreement-template';
import { buildAgreementPdfData } from '@/lib/pdf/build-agreement-data';

/**
 * Public token-gated PDF download.
 *
 * Only serves signed agreements. The signature is legally binding, so the
 * client is entitled to a copy of the document they signed, which is why this
 * route exists. A draft or sent agreement would be shown via the signing page,
 * not downloaded from here.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const tokenHash = hashToken(token);

  const { data: agreement } = await supabaseAdmin
    .from('agreements')
    .select('*')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (!agreement) {
    return NextResponse.json({ error: 'Agreement not found.' }, { status: 404 });
  }

  // Only signed agreements are downloadable via this public route. The signing
  // page shows the preview; this route is for the executed copy.
  if (agreement.status !== 'signed') {
    return NextResponse.json(
      { error: 'This agreement has not been signed yet.' },
      { status: 403 }
    );
  }

  // Both keyed on the id we now have, so they can go together.
  const [{ data: items }, { data: signature }] = await Promise.all([
    supabaseAdmin
      .from('agreement_items')
      .select('kind, label, detail, qty, unit_inr')
      .eq('agreement_id', agreement.id)
      .order('sort_order', { ascending: true }),
    supabaseAdmin
      .from('signature_events')
      .select('signer_name, signed_at')
      .eq('agreement_id', agreement.id)
      .maybeSingle(),
  ]);

  const data = buildAgreementPdfData(agreement, items ?? [], signature ?? null);

  const pdfBuffer = await renderToBuffer(<AgreementPDF data={data} />);

  return new Response(pdfBuffer.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${agreement.reference}-signed.pdf"`,
      // Signed agreements are immutable, but they are also behind a secret
      // token — an intermediary cache would serve the PDF to whoever requests
      // this URL next, which leaks both parties' names.
      'Cache-Control': 'private, no-store',
    },
  });
}
