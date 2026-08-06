import 'server-only';

import { supabaseAdmin } from './supabase/admin';

type RateLimitTable = 'leads' | 'reviews';

/**
 * Login throttling, counted from `login_attempts` rather than from the table
 * being written to. Failed logins produce no row anywhere else, so they need
 * their own log — see the `login_attempts` migration.
 */
export async function checkLoginRateLimit(
  ipHash: string | null,
  { max, windowMinutes }: { max: number; windowMinutes: number }
): Promise<RateLimitResult> {
  if (!ipHash) return { allowed: true, retryAfterSeconds: 0 };

  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  const { count, error } = await supabaseAdmin
    .from('login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .eq('succeeded', false)
    .gte('created_at', since);

  // Unlike the public forms, a broken counter here must NOT fail open —
  // that would remove the only brake on password guessing.
  if (error) return { allowed: false, retryAfterSeconds: windowMinutes * 60 };

  return {
    allowed: (count ?? 0) < max,
    retryAfterSeconds: windowMinutes * 60,
  };
}

/** Records an attempt so the throttle above can see it. */
export async function recordLoginAttempt(
  ipHash: string | null,
  succeeded: boolean
): Promise<void> {
  if (!ipHash) return;
  await supabaseAdmin.from('login_attempts').insert({ ip_hash: ipHash, succeeded });
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Counts recent submissions from the same hashed IP.
 *
 * This is deliberately database-backed rather than in-memory: route handlers run
 * on short-lived serverless instances, so a module-level Map would reset on every
 * cold start and would not be shared between concurrent instances.
 */
export async function checkRateLimit(
  table: RateLimitTable,
  ipHash: string | null,
  { max, windowMinutes }: { max: number; windowMinutes: number }
): Promise<RateLimitResult> {
  // No IP (local dev, stripped headers) means we cannot rate limit; allow it.
  if (!ipHash) return { allowed: true, retryAfterSeconds: 0 };

  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  const { count, error } = await supabaseAdmin
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);

  // Fail open on infrastructure errors: a broken counter should not block
  // a real customer from reaching us.
  if (error) return { allowed: true, retryAfterSeconds: 0 };

  return {
    allowed: (count ?? 0) < max,
    retryAfterSeconds: windowMinutes * 60,
  };
}
