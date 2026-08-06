import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { verifySession } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import AddLeadForm from '@/components/admin/AddLeadForm';

/**
 * Manual lead entry — for the enquiries that never touch the website: a
 * referral, an Instagram DM, someone met at an event.
 *
 * Follow-up date is on the form rather than buried in the detail page, because
 * an outbound lead with no next action is the one that gets forgotten.
 */
export default async function NewLeadPage() {
  await verifySession();

  const { data: services } = await supabaseAdmin
    .from('services')
    .select('slug, title')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-sm text-primary-600 transition hover:text-primary-900"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        All leads
      </Link>

      <header>
        <h1 className="font-display text-2xl font-bold text-primary-950 sm:text-3xl">
          Add a lead
        </h1>
        <p className="mt-1 text-sm text-primary-600">
          For enquiries that came in outside the website — a referral, a DM, a
          phone call.
        </p>
      </header>

      <AddLeadForm services={services ?? []} />
    </div>
  );
}
