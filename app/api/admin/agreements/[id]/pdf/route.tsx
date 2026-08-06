import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import { getCurrentAdmin } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AgreementPDF } from '@/lib/pdf/agreement-template';
import { buildAgreementPdfData } from '@/lib/pdf/build-agreement-data';

/**
 * The agreement as a PDF, for admins.
 *
 * Serves any status: a draft renders with a blank signature line so the admin
 * can proof it before sending, and a signed one renders with the client's name
 * and timestamp. There is no stored file — the PDF is rebuilt from the row on
 * every request, so it cannot drift from the record the way a cached copy in a
 * bucket would.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const { id } = await params;

  const { data: agreement } = await supabaseAdmin
    .from('agreements')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!agreement) {
    return NextResponse.json({ error: 'Agreement not found.' }, { status: 404 });
  }

  // Both keyed on the id we now have, so they can go together.
  const [{ data: items }, { data: signature }] = await Promise.all([
    supabaseAdmin
      .from('agreement_items')
      .select('kind, label, detail, qty, unit_inr')
      .eq('agreement_id', id)
      .order('sort_order', { ascending: true }),
    supabaseAdmin
      .from('signature_events')
      .select('signer_name, signed_at')
      .eq('agreement_id', id)
      .maybeSingle(),
  ]);

  const data = buildAgreementPdfData(agreement, items ?? [], signature ?? null);

  const pdfBuffer = await renderToBuffer(<AgreementPDF data={data} />);

  const suffix = agreement.status === 'signed' ? '-signed' : '';

  return new Response(pdfBuffer.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${agreement.reference}${suffix}.pdf"`,
      // A draft can change between requests, and a signed one should not be
      // served from an intermediary cache to whoever asks next.
      'Cache-Control': 'private, no-store',
    },
  });
}
