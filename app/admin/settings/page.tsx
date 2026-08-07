import { KeyRound } from 'lucide-react';

import { verifySession } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import SarvamSettingsForm, {
  type SettingField,
} from '@/components/admin/SarvamSettingsForm';

/**
 * Which fields the form shows, in this order, and which are secret.
 *
 * Declared here rather than read from the `metadata` column so the page renders
 * a complete form on a database where the migration has not been applied yet —
 * the table is then empty and every field falls back to its environment
 * variable, which is exactly the state this page needs to be able to explain.
 */
const FIELDS: {
  key: string;
  label: string;
  secret: boolean;
  envFallback: string;
  placeholder?: string;
  hint?: string;
}[] = [
  {
    key: 'sarvam_api_key',
    label: 'API key',
    secret: true,
    envFallback: 'SARVAM_API_KEY',
    placeholder: 'sk_samvaad_…',
    hint: 'The Voice Agents key from Settings → API Key. The general platform key (sk_… without samvaad) is a different key and will not place calls.',
  },
  {
    key: 'sarvam_org_id',
    label: 'Organisation ID',
    secret: false,
    envFallback: 'SARVAM_ORG_ID',
    placeholder: '019f7b9a-…',
  },
  {
    key: 'sarvam_workspace_id',
    label: 'Workspace ID',
    secret: false,
    envFallback: 'SARVAM_WORKSPACE_ID',
    placeholder: '019f7b9a-…',
  },
  {
    key: 'sarvam_app_id',
    label: 'Agent app ID',
    secret: false,
    envFallback: 'SARVAM_APP_ID',
    placeholder: 'Conversatio-…',
    hint: 'The agent that does the talking. Its prompt lives in the Sarvam dashboard.',
  },
  {
    key: 'sarvam_connection_id',
    label: 'Connection ID',
    secret: false,
    envFallback: 'SARVAM_CONNECTION_ID',
    hint: 'The telephony connection the rented number belongs to.',
  },
  {
    key: 'sarvam_agent_phone',
    label: 'Agent phone number',
    secret: false,
    envFallback: 'SARVAM_AGENT_PHONE',
    placeholder: '+919876543210',
    hint: 'The number customers see. Must be a number attached to the connection above, in +91 form.',
  },
];

/** `sk_samvaad_027…lc` — enough to recognise, not enough to reuse. */
function mask(value: string): string {
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 6)}${'•'.repeat(10)}${value.slice(-4)}`;
}

export default async function SettingsPage() {
  await verifySession();

  /*
    Read on the secret key, which bypasses RLS — the page is already behind
    `verifySession`. A missing table (migration not yet applied) is not an
    error here: every field simply reports its environment variable instead.
  */
  const { data: rows } = await supabaseAdmin
    .from('admin_settings')
    .select('key, value')
    .eq('category', 'sarvam');

  const stored = new Map((rows ?? []).map((row) => [row.key, row.value ?? '']));

  const fields: SettingField[] = FIELDS.map((field) => {
    const value = stored.get(field.key) ?? '';
    return {
      key: field.key,
      label: field.label,
      secret: field.secret,
      // A secret never leaves the server in full, not even to an admin's browser.
      value: value ? (field.secret ? mask(value) : value) : '',
      envFallback: field.envFallback,
      envIsSet: Boolean(process.env[field.envFallback]),
      placeholder: field.placeholder,
      hint: field.hint,
    };
  });

  const tableMissing = rows === null;
  const unset = fields.filter((field) => !field.value && !field.envIsSet);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-primary-900">Settings</h1>
        <p className="mt-1 text-sm text-primary-600">
          Credentials for the services this back office talks to.
        </p>
      </header>

      <section className="max-w-2xl overflow-hidden rounded-xl border border-primary-200 bg-white">
        <header className="flex items-start gap-3 border-b border-primary-200 px-5 py-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100">
            <KeyRound aria-hidden className="h-4 w-4 text-primary-700" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-primary-900">Sarvam voice agent</h2>
            <p className="mt-0.5 text-xs text-primary-500">
              Six values, all from the Sarvam dashboard. Saving them here takes
              precedence over the environment — which is how you move the whole
              back office onto a different Sarvam account without a redeploy.
            </p>
          </div>
        </header>

        <div className="px-5 py-4">
          {tableMissing && (
            <p className="mb-4 rounded-lg border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              The <code>admin_settings</code> table does not exist yet, so nothing
              can be saved from this page. Apply{' '}
              <code>supabase/APPLY_ADMIN_SETTINGS.sql</code> in the Supabase SQL
              editor first. Calls still work in the meantime — every field below
              falls back to its environment variable.
            </p>
          )}

          {unset.length > 0 && !tableMissing && (
            <p className="mb-4 rounded-lg border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {unset.length === 1
                ? `${unset[0].label} has no value, here or in the environment. Calls will fail until it is set.`
                : `${unset.length} values are not set, here or in the environment. Calls will fail until they are.`}
            </p>
          )}

          <SarvamSettingsForm fields={fields} />
        </div>
      </section>

      <p className="max-w-2xl text-xs text-primary-500">
        These credentials are read only on the server. A key pasted here is never
        sent back to a browser in full — reopening this page shows a masked
        version, so retype a secret to change it rather than editing the mask.
      </p>
    </div>
  );
}
