import { createClient } from '@supabase/supabase-js';

import type { Database } from './types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local.'
  );
}

/**
 * Browser-safe client. Constrained by Row Level Security, so it can only read
 * active marketing content and approved reviews. It has no access to `leads`.
 */
export const supabase = createClient<Database>(url, publishableKey, {
  auth: { persistSession: false },
});
