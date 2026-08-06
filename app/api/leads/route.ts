import type { NextRequest } from 'next/server';

import { getClientIp, hashIp } from '@/lib/http';
import { checkRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { fieldErrors, leadSchema } from '@/lib/validation';

/** Max submissions per hashed IP per window. */
const RATE_LIMIT = { max: 5, windowMinutes: 60 };

/**
 * Resolves whatever the form sent into a real `services.slug`.
 *
 * The contact form sends kebab-case slugs ('website-design') while the services
 * quote modal sends display titles ('Website Design'). Accept both, and fall
 * back to null rather than failing the insert on a foreign key violation — a
 * lead with an unrecognised service is still a lead worth keeping.
 */
async function resolveServiceSlug(value: string | null | undefined) {
  if (!value) return null;

  const { data } = await supabaseAdmin
    .from('services')
    .select('slug')
    .or(`slug.eq.${value},title.eq.${value}`)
    .limit(1)
    .maybeSingle();

  return data?.slug ?? null;
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        message: 'Please check the highlighted fields.',
        errors: fieldErrors(parsed.error),
      },
      { status: 422 }
    );
  }

  const { website, service_slug, ...lead } = parsed.data;

  // Honeypot tripped: almost certainly a bot. Return success so it does not
  // learn anything, but drop the submission.
  if (website) {
    return Response.json({ ok: true }, { status: 202 });
  }

  const ipHash = hashIp(getClientIp(request));

  const { allowed, retryAfterSeconds } = await checkRateLimit(
    'leads',
    ipHash,
    RATE_LIMIT
  );
  if (!allowed) {
    return Response.json(
      {
        ok: false,
        message:
          'We have already received a few enquiries from you. Please give us a little time to reply.',
      },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    );
  }

  const { error } = await supabaseAdmin.from('leads').insert({
    ...lead,
    service_slug: await resolveServiceSlug(service_slug),
    ip_hash: ipHash,
    user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
  });

  if (error) {
    // Log server-side for triage; never leak database detail to the client.
    console.error('[api/leads] insert failed', error);
    return Response.json(
      {
        ok: false,
        message:
          'Something went wrong on our side. Please try again, or WhatsApp us directly.',
      },
      { status: 500 }
    );
  }

  return Response.json({ ok: true }, { status: 201 });
}
