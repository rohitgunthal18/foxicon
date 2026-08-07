import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentAdmin } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { toE164 } from '@/lib/phone';

/**
 * Only these keys may be written from the browser.
 *
 * An allowlist rather than "any key in the table": the route runs on the secret
 * key, so an open `key` field would let a signed-in admin write any row in
 * `admin_settings`, including ones added later for something else entirely.
 */
const WRITABLE_KEYS = [
  'sarvam_api_key',
  'sarvam_org_id',
  'sarvam_workspace_id',
  'sarvam_app_id',
  'sarvam_connection_id',
  'sarvam_agent_phone',
] as const;

const patchSchema = z.object({
  settings: z
    .array(
      z
        .object({
          key: z.enum(WRITABLE_KEYS),
          /* Empty string is meaningful — it clears the stored value and hands the
             credential back to the environment variable. */
          value: z.string().max(2000),
        })
        /*
          The agent's own number is the one setting with a format Sarvam will
          reject, and it fails at dial time rather than at save time — so an
          admin who pastes the number in the shape the leads table uses
          (`094217 96468`) gets a caller ID that looks saved and never works.
          Checked here; every other field is an opaque credential we cannot
          validate without calling Sarvam.
        */
        .refine(
          (setting) =>
            setting.key !== 'sarvam_agent_phone' ||
            setting.value === '' ||
            toE164(setting.value) !== null,
          {
            message:
              'The agent phone number must be a valid Indian mobile in +91 form, for example +919876543210.',
            path: ['value'],
          }
        )
        /* Store it normalised, so what Sarvam receives is what was validated. */
        .transform((setting) =>
          setting.key === 'sarvam_agent_phone' && setting.value !== ''
            ? { ...setting, value: toE164(setting.value) as string }
            : setting
        )
    )
    .min(1),
});

/** Save credentials. Values are stored as given; nothing is echoed back. */
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
    /* Pass the first message through — these are format complaints about the
       admin's own input, not anything that could leak a stored value. */
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Some values were not valid.' },
      { status: 422 }
    );
  }

  const now = new Date().toISOString();

  /*
    `upsert` on the unique `key`, not `update`.

    The seed rows come from the migration, so on a database where it has been
    applied an update would be enough — but a fresh row for a key added later
    would silently match nothing and report success having saved nothing.
  */
  const { error } = await supabaseAdmin.from('admin_settings').upsert(
    parsed.data.settings.map(({ key, value }) => ({
      key,
      value: value.trim(),
      category: 'sarvam',
      updated_by: admin.id,
      updated_at: now,
    })),
    { onConflict: 'key' }
  );

  if (error) {
    console.error('[api/admin/settings PATCH]', error);
    return NextResponse.json(
      { error: 'Could not save the settings.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
