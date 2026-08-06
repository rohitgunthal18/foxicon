import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';

import { verifySession } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { type LeadStatus } from '@/lib/admin';
import { markOverdue } from '@/lib/admin-shared';
import LeadFilters from '@/components/admin/LeadFilters';

interface Props {
  searchParams: Promise<{ view?: string }>;
}

/**
 * Temporary type until the migration is applied and types are regenerated.
 * After running supabase/APPLY_SCRAPED_LEADS_SUPPORT.sql and regenerating
 * types, this can be removed.
 */
interface ScrapedLeadRow {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  lead_score: number | null;
  rating: number | null;
  review_count: number | null;
  maps_url: string | null;
  status: string;
  priority: string;
  value_inr: number | null;
  next_follow_up_at: string | null;
  created_at: string;
}

export default async function LeadsPage({ searchParams }: Props) {
  await verifySession();
  const { view = 'list' } = await searchParams;

  /**
   * Every lead, unfiltered — deliberately.
   *
   * `LeadFilters` owns the `?status=` filter client-side because it also
   * renders the per-status counts, and the board needs every stage populated
   * to be a board at all. Filtering here as well would leave each pill
   * counting only the rows that survived the server filter, so selecting one
   * status would show every other pill as (0).
   */
  /**
   * The scraped columns (`city`, `lead_score`, `rating`, `review_count`,
   * `maps_url`) are added by supabase/migrations/20260805120000. Until that is
   * applied and `lib/supabase/types.ts` is regenerated, the generated row type
   * does not know about them, so the select is cast. Regenerate with:
   *
   *   npx supabase gen types typescript --project-id kppbasebdmepfcdeppwr \
   *     > lib/supabase/types.ts
   *
   * and this cast can go.
   */
  const { data, error } = await supabaseAdmin
    .from('leads')
    .select(
      'id, name, company, email, phone, city, lead_score, rating, review_count, maps_url, status, priority, value_inr, next_follow_up_at, created_at'
    )
    .order('created_at', { ascending: false })
    .overrideTypes<ScrapedLeadRow[]>();

  if (error) {
    return (
      <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-700">
        Could not load leads. Try again.
      </p>
    );
  }

  /**
   * Which leads have someone's written note on them, for the list's dot.
   *
   * `kind = 'note'` only, deliberately: the automatic rows (status changes,
   * field edits, the importer's "Imported from a Google Maps scrape.") are not
   * something a person chose to write down, and counting them would light the
   * dot on every imported lead at once and make it mean nothing.
   *
   * Fetched as bare `lead_id`s and tallied here rather than as a per-lead count
   * query — PostgREST has no `group by`, so the alternative is one request per
   * row.
   */
  const { data: noted } = await supabaseAdmin
    .from('lead_activities')
    .select('lead_id')
    .eq('kind', 'note');

  const withNotes = new Set((noted ?? []).map((row) => row.lead_id));

  /**
   * `markOverdue` reads the clock once for the whole list, outside the
   * component — see the note on it in `lib/admin-shared.ts`.
   */
  const leads = markOverdue(data ?? []).map((lead) => ({
    ...lead,
    status: lead.status as LeadStatus,
    priority: lead.priority as 'low' | 'normal' | 'high',
    has_note: withNotes.has(lead.id),
  }));

  const boardView = view === 'board';
  return (
    /*
      `min-h-0` on a flex child is what allows it to be *shorter* than its
      content and scroll internally; without it the default `min-height: auto`
      makes the table's height push the page instead of fitting inside it.
      The same pair repeats down through LeadFilters to the table box.
    */
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-bold text-primary-950 sm:text-2xl">
            Leads
          </h1>
          <p className="mt-0.5 text-xs text-primary-600 sm:text-sm">
            {leads.length} in total. Move them along the pipeline — every change
            is recorded.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/leads/import"
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-white px-3 py-2 text-xs font-medium text-primary-700 transition hover:border-primary-300 hover:text-primary-950 sm:text-sm"
          >
            <Upload aria-hidden className="h-4 w-4" />
            Import CSV
          </Link>

          <Link
            href="/admin/leads/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-accent-500 sm:text-sm"
          >
            <Plus aria-hidden className="h-4 w-4" />
            Add lead
          </Link>
        </div>
      </header>

      <LeadFilters leads={leads} view={boardView ? 'board' : 'list'} />
    </div>
  );
}
