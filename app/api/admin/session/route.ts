import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getClientIp, hashIp } from '@/lib/http';
import { checkLoginRateLimit, recordLoginAttempt } from '@/lib/rate-limit';

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

/**
 * Sign in. On success the Supabase auth cookies are written by the server
 * client and the browser is free to navigate to /admin.
 *
 * Two checks run before a session is considered valid:
 *   1. Supabase Auth accepts the password.
 *   2. That auth user has an active row in `admin_users`.
 *
 * If (2) fails we sign straight back out, so a leftover Auth user whose admin
 * access was revoked cannot hold a usable session.
 */
export async function POST(request: Request) {
  const ipHash = hashIp(getClientIp(request));

  // Brute-force brake. Deliberately tight — real admins log in rarely.
  const limit = await checkLoginRateLimit(ipHash, {
    max: 8,
    windowMinutes: 15,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  // Opportunistic housekeeping; failures are not fatal.
  void Promise.resolve(supabaseAdmin.rpc('prune_login_attempts')).catch(() => {});

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = credentialsSchema.safeParse(payload);
  if (!parsed.success) {
    // Never say which field was wrong — that is an account-enumeration hint.
    await recordLoginAttempt(ipHash, false);
    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    await recordLoginAttempt(ipHash, false);
    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 }
    );
  }

  const { data: admin } = await supabaseAdmin
    .from('admin_users')
    .select('id, full_name, role')
    .eq('id', data.user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    await recordLoginAttempt(ipHash, false);
    return NextResponse.json(
      { error: 'This account does not have admin access.' },
      { status: 403 }
    );
  }

  await recordLoginAttempt(ipHash, true);

  await supabaseAdmin
    .from('admin_users')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', admin.id);

  return NextResponse.json({ ok: true, name: admin.full_name });
}

/** Sign out. Clears the auth cookies. */
export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
