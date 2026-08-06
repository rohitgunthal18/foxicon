import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentAdmin } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';

const noteSchema = z.object({
  lead_id: z.uuid(),
  body: z.string().trim().min(1, 'Write something first').max(4000),
});

/** Append a note to a lead's timeline. */
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

  const parsed = noteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid note.' },
      { status: 422 }
    );
  }

  const { error } = await supabaseAdmin.from('lead_activities').insert({
    lead_id: parsed.data.lead_id,
    author_id: admin.id,
    kind: 'note',
    body: parsed.data.body,
  });

  if (error) {
    return NextResponse.json({ error: 'Could not save the note.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
