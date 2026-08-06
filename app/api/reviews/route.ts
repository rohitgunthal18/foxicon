import type { NextRequest } from 'next/server';

import { getClientIp, hashIp } from '@/lib/http';
import { checkRateLimit } from '@/lib/rate-limit';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { fieldErrors, reviewSchema } from '@/lib/validation';

/** Reviews are heavier to moderate than leads, so the window is a day. */
const RATE_LIMIT = { max: 2, windowMinutes: 1440 };

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

  const parsed = reviewSchema.safeParse(payload);
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

  const { website, ...review } = parsed.data;

  if (website) {
    return Response.json({ ok: true }, { status: 202 });
  }

  const ipHash = hashIp(getClientIp(request));

  const { allowed, retryAfterSeconds } = await checkRateLimit(
    'reviews',
    ipHash,
    RATE_LIMIT
  );
  if (!allowed) {
    return Response.json(
      {
        ok: false,
        message: 'Thanks — you have already left a review recently.',
      },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    );
  }

  // `status` and `is_featured` are deliberately omitted so the database
  // defaults apply. Accepting either from the client would let anyone
  // self-approve a review straight onto the public testimonials wall.
  const { error } = await supabaseAdmin.from('reviews').insert({
    ...review,
    ip_hash: ipHash,
    user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
  });

  if (error) {
    console.error('[api/reviews] insert failed', error);
    return Response.json(
      { ok: false, message: 'Something went wrong on our side. Please try again.' },
      { status: 500 }
    );
  }

  return Response.json(
    {
      ok: true,
      message: "Thank you! Your review will appear once we've approved it.",
    },
    { status: 201 }
  );
}

export async function GET() {
  // Uses the RLS-constrained client on purpose: the policy already limits this
  // to approved rows, so a mistake here cannot leak pending or rejected ones.
  const { data, error } = await supabase
    .from('reviews')
    .select('id, author_name, author_role, rating, body, created_at')
    .eq('status', 'approved')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[api/reviews] select failed', error);
    return Response.json({ ok: false, reviews: [] }, { status: 500 });
  }

  return Response.json({ ok: true, reviews: data ?? [] });
}
