import 'server-only';

import { createClient } from '@supabase/supabase-js';

import type { Database } from './types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Copy .env.example to .env.local.'
  );
}

/**
 * Privileged client. BYPASSES Row Level Security entirely.
 *
 * The `server-only` import above makes the build fail if this module is ever
 * pulled into a client component, which is the guard that keeps the secret key
 * out of the browser bundle. Use this only inside route handlers and server
 * components, and never return raw rows from it to an unauthenticated caller.
 */
export const supabaseAdmin = createClient<Database>(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
