import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import type { Database } from './types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local.'
  );
}

/**
 * Server-side Supabase client that reads and refreshes the auth session from
 * cookies. Use this for anything that needs to know *who* is asking.
 *
 * It uses the publishable key, so it is still bound by Row Level Security —
 * an authenticated admin session does not grant table access on its own. The
 * privileged reads and writes go through `supabaseAdmin`, gated by the DAL.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(url!, publishableKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Session refresh is handled in `proxy.ts`, which can write them.
        }
      },
    },
  });
}
