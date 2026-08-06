import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentAdmin } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { TablesInsert } from '@/lib/supabase/types';

/**
 * Bulk import for scraped Google Maps leads.
 *
 * The scraper (`lead-finder`) writes a CSV with these columns:
 *
 *   name, phone, city, lead_type, lead_score, rating, reviews, category,
 *   address, website, pitch_angle, niche, maps_url
 *
 * Parsing happens in the browser — see `components/admin/ImportLeadsForm.tsx` —
 * so the admin can see and correct what will be imported before anything is
 * written. This handler re-validates every row regardless: the client is not
 * a trusted source, and a hand-edited paste can arrive here just as easily.
 *
 * `maps_url` is the de-duplication key (unique index `leads_maps_url_key`), so
 * re-running the same scrape adds only genuinely new businesses.
 */

/**
 * Blank-tolerant number coercion.
 *
 * `z.coerce.number()` turns '' into 0, which would silently record every
 * rating-less clinic as rated 0.0 — worse than recording nothing. This maps
 * blank/absent to undefined and only coerces real values.
 */
const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const n = typeof value === 'string' ? Number(value.trim()) : value;
    return Number.isNaN(n) ? undefined : n;
  }, schema.optional());

/** Trim, then treat blank as absent. */
const optionalText = (max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    },
    z.string().max(max).optional()
  );

const rowSchema = z.object({
  name: z.string().trim().min(1).max(250),
  phone: optionalText(24),
  email: z.preprocess(
    (value) => {
      if (typeof value !== 'string' || value.trim() === '') return undefined;
      return value.trim();
    },
    z.email().optional()
  ),
  company: optionalText(160),
  city: optionalText(120),
  category: optionalText(120),
  niche: optionalText(120),
  address: optionalText(500),
  website: optionalText(500),
  pitch_angle: optionalText(1000),
  message: optionalText(4000),
  maps_url: z.preprocess(
    (value) => {
      if (typeof value !== 'string' || value.trim() === '') return undefined;
      return value.trim();
    },
    z.url().max(2000).optional()
  ),
  lead_score: optionalNumber(z.number().int().min(0).max(100)),
  rating: optionalNumber(z.number().min(0).max(5)),
  review_count: optionalNumber(z.number().int().min(0)),
});

const payloadSchema = z.object({
  rows: z.array(rowSchema).min(1).max(2000),
});

/**
 * `lib/supabase/types.ts` was generated before 20260805120000 added the scraped
 * columns, so `TablesInsert<'leads'>` does not know about them yet and every
 * read or write of `maps_url` here fails to type-check. Describing them locally
 * keeps the shape honest in the meantime — the columns and their nullability
 * mirror that migration exactly.
 *
 * Delete this and use `TablesInsert<'leads'>` directly once types are
 * regenerated:
 *
 *   npx supabase gen types typescript --project-id kppbasebdmepfcdeppwr \
 *     > lib/supabase/types.ts
 */
/**
 * The insert helpers wrap their argument in `RejectExcessProperties`, which maps
 * any key the generated types do not know to `never`. So a widened type cannot
 * be passed directly — the rows are built as `ScrapedLeadInsert` for real
 * checking, then narrowed through this alias at the two call sites. Both go away
 * with the regenerated types.
 */
type KnownLeadInsert = TablesInsert<'leads'>;

type ScrapedLeadInsert = TablesInsert<'leads'> & {
  city?: string | null;
  address?: string | null;
  website?: string | null;
  maps_url?: string | null;
  category?: string | null;
  niche?: string | null;
  lead_score?: number | null;
  rating?: number | null;
  review_count?: number | null;
  pitch_angle?: string | null;
};

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    // Point at the offending row rather than dumping the whole issue list —
    // "row 47: rating must be <= 5" is actionable, a 2000-entry array is not.
    const issue = parsed.error.issues[0];
    const rowIndex = typeof issue?.path[1] === 'number' ? issue.path[1] : null;
    const field = issue?.path[2];
    return NextResponse.json(
      {
        error:
          rowIndex === null
            ? 'The file could not be read as a lead list.'
            : `Row ${rowIndex + 1}${field ? ` (${String(field)})` : ''}: ${issue.message}`,
      },
      { status: 422 }
    );
  }

  /**
   * A lead needs at least one way to reach it — the `leads_needs_contact_method`
   * constraint enforces email, phone, or a Maps URL. Rejecting these here gives
   * a row number; letting the database reject them gives a 500 for the batch.
   */
  const rows = parsed.data.rows;
  const unreachable = rows.findIndex(
    (row) => !row.email && !row.phone && !row.maps_url
  );
  if (unreachable !== -1) {
    return NextResponse.json(
      {
        error: `Row ${unreachable + 1} (${rows[unreachable].name}) has no phone, email, or Maps link — there would be no way to contact them.`,
      },
      { status: 422 }
    );
  }

  const toInsert: ScrapedLeadInsert[] = rows.map((row) => ({
    name: row.name,
    phone: row.phone ?? null,
    email: row.email ?? null,
    company: row.company ?? null,
    city: row.city ?? null,
    address: row.address ?? null,
    website: row.website ?? null,
    maps_url: row.maps_url ?? null,
    category: row.category ?? null,
    niche: row.niche ?? null,
    lead_score: row.lead_score ?? null,
    rating: row.rating ?? null,
    review_count: row.review_count ?? null,
    pitch_angle: row.pitch_angle ?? null,
    message: row.message ?? null,
    source: 'imported' as TablesInsert<'leads'>['source'],
    status: 'new',
    priority: 'normal',
  }));

  /**
   * `ignoreDuplicates` makes this `on conflict do nothing`, so re-importing a
   * scrape that overlaps an earlier one inserts the new businesses and leaves
   * the existing rows — and their status, notes and follow-ups — untouched.
   *
   * Without it a single repeat listing aborts the whole batch.
   */
  let { data, error } = await supabaseAdmin
    .from('leads')
    .upsert(toInsert as KnownLeadInsert[], {
      onConflict: 'maps_url',
      ignoreDuplicates: true,
    })
    .select('id');

  /**
   * 42P10 — "no unique or exclusion constraint matching the ON CONFLICT
   * specification". Either the `maps_url` unique index is missing, or it exists
   * but is *partial* (`where maps_url is not null`), which Postgres will not
   * match against `onConflict: 'maps_url'` unless the statement repeats the
   * predicate — something this client cannot express.
   *
   * The index is worth having: it makes de-duplication atomic, so two imports
   * running at once cannot both insert the same listing. But an import should
   * not be dead in the water until someone runs a migration, so fall back to
   * de-duplicating in application code: read the Maps URLs already stored, drop
   * the rows that match, and plainly insert the rest.
   *
   * The race this reopens needs two concurrent imports of the same listing to
   * bite — not a real risk for a single admin importing a scrape by hand, and
   * it closes again the moment APPLY_MAPS_URL_FIX.sql is run.
   */
  let dedupedInApp = false;

  if (error?.code === '42P10') {
    console.warn(
      '[api/admin/leads/import] no usable maps_url conflict target — ' +
        'falling back to application-level de-duplication. ' +
        'Run supabase/APPLY_MAPS_URL_FIX.sql to restore the atomic path.'
    );

    /**
     * Read the Maps URLs already stored rather than asking about the incoming
     * ones. The obvious shape — `.in('maps_url', urls)` — is a trap here:
     * PostgREST spells that as `in.(a,b,c)` and a Google Maps URL contains
     * commas and parentheses of its own (`/@12.97,77.59,17z/`), so a few hundred
     * of them produce a filter that either mis-parses or blows the URL length
     * limit. Paging the stored side has no such edge: the leads table is the
     * small side of this comparison, and the page loop keeps it bounded if that
     * stops being true.
     */
    const existing = new Set<string>();
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      // `overrideTypes` for the same reason as ScrapedLeadInsert above: the
      // generated types predate the column, so the select is otherwise typed as
      // a SelectQueryError rather than a row.
      const { data: found, error: readError } = await supabaseAdmin
        .from('leads')
        .select('maps_url')
        .not('maps_url', 'is', null)
        .range(from, from + PAGE - 1)
        .overrideTypes<{ maps_url: string | null }[]>();

      if (readError) {
        console.error('[api/admin/leads/import] dedup read failed', readError);
        return NextResponse.json(
          {
            error: `Could not check for existing leads: ${readError.message}`,
          },
          { status: 500 }
        );
      }

      for (const row of found ?? []) {
        if (row.maps_url) existing.add(row.maps_url);
      }

      if (!found || found.length < PAGE) break;
    }

    /**
     * Drop rows already stored, and rows repeated within this file. The second
     * half matters: this path inserts plainly, with no `on conflict`, so a
     * listing that appears twice in one scrape would be refused by the unique
     * index and take the whole batch down with it. The upsert path absorbed
     * that; here it has to be done by hand. `existing` doubles as the seen-set,
     * so the first occurrence wins and later ones are counted as skipped.
     */
    const fresh = toInsert.filter((row) => {
      if (!row.maps_url) return true;
      if (existing.has(row.maps_url)) return false;
      existing.add(row.maps_url);
      return true;
    });

    if (fresh.length === 0) {
      return NextResponse.json({
        ok: true,
        inserted: 0,
        skipped: toInsert.length,
      });
    }

    ({ data, error } = await supabaseAdmin
      .from('leads')
      .insert(fresh as KnownLeadInsert[])
      .select('id'));

    dedupedInApp = true;
  }

  if (error) {
    console.error('[api/admin/leads/import] insert failed', error);

    // The enum value and the columns arrive in
    // supabase/migrations/20260805*. Until those are applied, say so plainly
    // instead of returning a bare 500.
    if (error.code === '22P02' || error.code === '42703') {
      return NextResponse.json(
        {
          error:
            'The database is missing the imported-leads columns. Run supabase/APPLY_SCRAPED_LEADS_SUPPORT.sql in the Supabase SQL editor, then try again.',
        },
        { status: 503 }
      );
    }

    /**
     * 23514 is a check-constraint violation. The one that actually shows up
     * here is the old 120-character `leads_name_check`: validation above now
     * allows business names up to 250, so a long name gets past Zod and is
     * refused by the database instead. Naming the migration beats "Could not
     * save the leads" — otherwise the fix is invisible from the UI.
     */
    if (error.code === '23514') {
      const isName = error.message?.includes('leads_name_check');
      return NextResponse.json(
        {
          error: isName
            ? 'Some business names are longer than the database allows. Run supabase/APPLY_WIDEN_LEAD_NAME.sql in the Supabase SQL editor, then try again.'
            : `A row was refused by a database constraint (${error.message}).`,
        },
        { status: 503 }
      );
    }

    /**
     * 42P10 — "no unique or exclusion constraint matching the ON CONFLICT
     * specification". The `maps_url` unique index is missing, or it exists but
     * is *partial* (`where maps_url is not null`), which Postgres refuses to
     * match against `onConflict: 'maps_url'` unless the statement repeats the
     * predicate — something this client cannot express. Either way the whole
     * batch is rejected before a single row lands.
     */
    if (error.code === '42P10') {
      return NextResponse.json(
        {
          error:
            'The maps_url unique index is missing or partial, so duplicate detection cannot run. Run supabase/APPLY_MAPS_URL_FIX.sql in the Supabase SQL editor, then try again.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Could not save the leads.' },
      { status: 500 }
    );
  }

  /**
   * Correct on both paths: on the upsert path `data` holds what Postgres
   * actually inserted, and on the fallback path it holds the rows left after
   * the already-present ones were filtered out. Either way the difference from
   * the submitted total is what got skipped as a duplicate.
   */
  const inserted = data?.length ?? 0;
  const skipped = toInsert.length - inserted;

  /**
   * One activity row per imported lead, recording where it came from.
   *
   * `kind: 'field_update'`, not `'note'`, and deliberately so: the list marks a
   * lead with a yellow dot when it has a note, meaning "someone wrote something
   * here, go read it". Logging the import as a note would light that dot on all
   * 800 rows at once and make it worthless on the first day.
   */
  if (inserted > 0 && data) {
    const { error: logError } = await supabaseAdmin
      .from('lead_activities')
      .insert(
        data.map((lead) => ({
          lead_id: lead.id,
          author_id: admin.id,
          kind: 'field_update' as const,
          body: 'Imported from a Google Maps scrape.',
        }))
      );
    if (logError) {
      console.error('[api/admin/leads/import] activity log failed', logError);
    }
  }

  /**
   * `degraded` tells the UI the import worked but took the fallback path, so it
   * can surface the one-time SQL fix rather than let a missing index sit
   * unnoticed behind a success message.
   */
  return NextResponse.json({
    ok: true,
    inserted,
    skipped,
    ...(dedupedInApp ? { degraded: 'maps_url_index_missing' } : {}),
  });
}
