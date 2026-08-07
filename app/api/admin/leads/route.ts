import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentAdmin } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  LEAD_DEAD_ENDS,
  LEAD_STAGES,
  type LeadStatus,
} from '@/lib/admin-shared';
import { PHONE_SHAPE } from '@/lib/phone';
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/types';

/*
  Shape-checked, not dialability-checked.

  `phone` used to be `z.string().max(24)`, which accepted `abc` and `!!!!` as
  readily as a number — and the first sign of trouble was the voice agent's 422
  at dial time, long after whoever typed it had moved on. The stored format is
  still whatever was typed (`094217 96468` included); `lib/phone.ts` normalises
  at the point of use.
*/
const phoneField = z
  .union([
    z.literal(''),
    z.null(),
    z.string().trim().min(6).max(24).regex(PHONE_SHAPE, 'Enter a valid phone number'),
  ])
  /* Blank means "no number", not the empty string — the column's own check
     constraint requires 6-24 characters when the value is not null. */
  .transform((value) => (value === '' ? null : value))
  .optional();

const postSchema = z.object({
  name: z.string().trim().min(1).max(250),
  company: z.string().max(160).nullable().optional(),
  email: z.union([z.email(), z.literal(''), z.null()]).optional(),
  phone: phoneField,
  service_slug: z.string().max(60).nullable().optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  value_inr: z.number().int().min(0).nullable().optional(),
  next_follow_up_at: z.string().nullable().optional(),
  message: z.string().max(4000).nullable().optional(),
});

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

  const parsed = postSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Some values were not valid.', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { email, ...rest } = parsed.data;
  const cleanEmail = email === '' ? null : (email ?? null);

  if (!cleanEmail && !rest.phone) {
    return NextResponse.json(
      { error: 'Provide at least an email or a phone number.' },
      { status: 422 }
    );
  }

  const base: TablesInsert<'leads'> = {
    ...rest,
    email: cleanEmail,
    priority: rest.priority ?? 'normal',
  };

  // `source: 'manual'` needs the enum value added by
  // supabase/migrations/20260803120000_manual_lead_source.sql. Until that is
  // applied the insert would fail with 22P02, so fall back to the column
  // default rather than refusing to save a lead the owner just typed out. The
  // activity note below records the true origin either way.
  let { data: lead, error: insertError } = await supabaseAdmin
    .from('leads')
    .insert({ ...base, source: 'manual' as TablesInsert<'leads'>['source'] })
    .select('id')
    .single();

  if (insertError?.code === '22P02') {
    ({ data: lead, error: insertError } = await supabaseAdmin
      .from('leads')
      .insert(base)
      .select('id')
      .single());
  }

  if (insertError || !lead) {
    console.error('[api/admin/leads POST] insert failed', insertError);
    return NextResponse.json({ error: 'Could not create the lead.' }, { status: 500 });
  }

  // Log the creation so the history explains where this lead came from. The
  // note itself is not repeated here — it is already stored on the lead and
  // rendered in the "Original message" card on the detail page.
  await supabaseAdmin.from('lead_activities').insert({
    lead_id: lead.id,
    author_id: admin.id,
    kind: 'note',
    body: 'Added manually — this lead did not come through the website.',
  });

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}

/**
 * Derived from the shared constant rather than hand-listed. The hand-written
 * copy silently went stale when `follow_up` was added — the board offered the
 * stage, and every attempt to move a lead into it was rejected here as an
 * invalid enum value.
 */
const LEAD_STATUSES = [...LEAD_STAGES, ...LEAD_DEAD_ENDS] as [
  LeadStatus,
  ...LeadStatus[],
];

const patchSchema = z.object({
  id: z.uuid(),
  status: z.enum(LEAD_STATUSES).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  value_inr: z.number().int().min(0).nullable().optional(),
  next_follow_up_at: z.string().nullable().optional(),
  service_slug: z.string().max(60).nullable().optional(),
  name: z.string().trim().min(1).max(250).optional(),
  company: z.string().max(160).nullable().optional(),
  email: z.union([z.email(), z.null()]).optional(),
  phone: phoneField,
});

/**
 * Update a lead. Every admin write goes through the DAL first — an
 * unauthenticated request never reaches the database.
 *
 * Status changes and field edits both append a row to `lead_activities`, so
 * the lead detail page can show an honest history rather than just the current
 * value of a mutable column.
 */
export async function PATCH(request: Request) {
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

  const parsed = patchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Some values were not valid.', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { id, ...changes } = parsed.data;

  if (Object.keys(changes).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  // Read the current row so the activity log can record what actually changed.
  const { data: before, error: readError } = await supabaseAdmin
    .from('leads')
    .select('id, status, name')
    .eq('id', id)
    .maybeSingle();

  if (readError || !before) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
  }

  // Moving a lead into a stage counts as contact having happened.
  // `follow_up` was added in supabase/migrations/20260805115900_lead_enums.sql;
  // until that is applied and types are regenerated, the cast suppresses the error.
  const updates: TablesUpdate<'leads'> = { ...changes } as TablesUpdate<'leads'>;
  if (changes.status === 'contacted') {
    updates.last_contacted_at = new Date().toISOString();
  }

  const { data: after, error: updateError } = await supabaseAdmin
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select('id, status')
    .single();

  if (updateError) {
    return NextResponse.json({ error: 'Could not save the change.' }, { status: 500 });
  }

  // Log it. A failure here must not fail the update the admin already made,
  // so it is awaited but its error is only recorded, not surfaced.
  const activities: TablesInsert<'lead_activities'>[] = [];

  if (changes.status && changes.status !== before.status) {
    activities.push({
      lead_id: id,
      author_id: admin.id,
      kind: 'status_change',
      body: null,
      meta: { from: before.status, to: changes.status },
    });
  }

  const fieldChanges = Object.keys(changes).filter((key) => key !== 'status');
  if (fieldChanges.length > 0) {
    activities.push({
      lead_id: id,
      author_id: admin.id,
      kind: 'field_update',
      body: null,
      meta: { fields: fieldChanges },
    });
  }

  if (activities.length > 0) {
    const { error: logError } = await supabaseAdmin
      .from('lead_activities')
      .insert(activities);
    if (logError) {
      console.error('Failed to log lead activity', logError);
    }
  }

  return NextResponse.json({ ok: true, lead: after });
}

const deleteSchema = z.object({
  id: z.uuid(),
});

/** Delete a lead. Cascades to activities via the foreign key. */
export async function DELETE(request: Request) {
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

  const parsed = deleteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid ID.' }, { status: 422 });
  }

  const { error } = await supabaseAdmin
    .from('leads')
    .delete()
    .eq('id', parsed.data.id);

  if (error) {
    return NextResponse.json({ error: 'Could not delete the lead.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
