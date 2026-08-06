import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import { verifySession } from '@/lib/supabase/dal';

export const metadata: Metadata = {
  title: 'Admin — FOXI TECH',
  robots: { index: false, follow: false },
};

/**
 * Every admin page renders inside this layout, and this layout calls
 * `verifySession()`. That is the real authorization boundary — `proxy.ts` only
 * does the cheap cookie check. `verifySession` redirects to /login when the
 * session is missing or the user has no active admin row.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await verifySession();

  return (
    <AdminShell adminName={admin.full_name} adminRole={admin.role}>
      {children}
    </AdminShell>
  );
}
