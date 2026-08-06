import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from './server';
import { supabaseAdmin } from './admin';

export type AdminRole = 'owner' | 'admin' | 'staff';

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
}

/**
 * The single gate for every admin page and action.
 *
 * Per the Next 16 auth guide, this is memoized with React `cache()` so all
 * data requests in one render pass share a single session check. The check is
 * two-layered, both server-side:
 *
 *   1. Is the Supabase Auth session cookie valid? (`supabase.auth.getUser`)
 *   2. Does that auth user have an active row in `admin_users`?
 *
 * Step 2 is the actual grant. An Auth session alone means nothing — it must
 * be backed by an admin row, which is why we query `admin_users` directly
 * rather than trusting any claim in the JWT.
 */
export const verifySession = cache(async (): Promise<AdminUser> => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const { data: admin, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select('id, full_name, email, role, is_active, last_seen_at, created_at')
    .eq('id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (adminError || !admin) {
    redirect('/login');
  }

  return {
    id: admin.id,
    full_name: admin.full_name,
    email: admin.email,
    role: admin.role as AdminRole,
    is_active: admin.is_active,
    last_seen_at: admin.last_seen_at,
    created_at: admin.created_at,
  };
});

/**
 * Like `verifySession`, but for code paths that must not redirect (API
 * route handlers, server actions). Returns `null` instead.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    return await verifySession();
  } catch {
    return null;
  }
}

/**
 * Role guard for owner-only actions (e.g. managing admin accounts).
 * Redirects non-owners away rather than throwing.
 */
export async function requireRole(...roles: AdminRole[]): Promise<AdminUser> {
  const admin = await verifySession();
  if (!roles.includes(admin.role)) {
    redirect('/admin');
  }
  return admin;
}
