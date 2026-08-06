import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { verifySession } from '@/lib/supabase/dal';
import ImportLeadsForm from '@/components/admin/ImportLeadsForm';

/**
 * Bulk import from Google Maps scrapes.
 *
 * The form parses the CSV in the browser and shows a preview before saving
 * anything, so the admin can see and correct what will land.
 */
export default async function ImportLeadsPage() {
  await verifySession();

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-sm text-primary-600 transition hover:text-primary-900"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        All leads
      </Link>

      <header>
        <h1 className="font-display text-2xl font-bold text-primary-950 sm:text-3xl">
          Import leads
        </h1>
        <p className="mt-1 text-sm text-primary-600">
          Bulk import from your Google Maps scraper. Upload a CSV with business
          names, phones, ratings, and Maps URLs — the preview will show you
          what gets matched before anything is saved.
        </p>
      </header>

      <ImportLeadsForm />
    </div>
  );
}
