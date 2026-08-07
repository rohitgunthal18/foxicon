import 'server-only';

import { supabaseAdmin } from './supabase/admin';

/**
 * Get a setting value, falling back to env var if database value is empty.
 *
 * This allows gradual migration: start with env vars, move to database UI later.
 * Database values take precedence when present.
 */
export async function getSetting(
  key: string
): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('admin_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  // Database value exists and is non-empty
  if (data?.value) {
    return data.value;
  }

  return null;
}

/** Which database keys maps to each credential. */
const SARVAM_KEYS = {
  apiKey: 'sarvam_api_key',
  orgId: 'sarvam_org_id',
  workspaceId: 'sarvam_workspace_id',
  appId: 'sarvam_app_id',
  connectionId: 'sarvam_connection_id',
  agentPhone: 'sarvam_agent_phone',
} as const;

export type SarvamCredentials = Record<keyof typeof SARVAM_KEYS, string | null>;

/**
 * The six Sarvam credentials, loaded directly from the database.
 */
export async function getSarvamCredentials(): Promise<SarvamCredentials> {
  const { data } = await supabaseAdmin
    .from('admin_settings')
    .select('key, value')
    .eq('category', 'sarvam');

  const stored = new Map((data ?? []).map((row) => [row.key, row.value]));

  return Object.fromEntries(
    Object.entries(SARVAM_KEYS).map(([field, key]) => {
      const value = stored.get(key)?.trim();
      return [field, value || null];
    })
  ) as SarvamCredentials;
}

/**
 * Update a setting value in the database.
 * Only called from the admin settings API route.
 */
export async function updateSetting(
  key: string,
  value: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from('admin_settings')
    .update({ value, updated_by: adminId, updated_at: new Date().toISOString() })
    .eq('key', key);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all settings in a category with their metadata.
 * Used to render the settings form.
 */
export async function getSettingsByCategory(category: string) {
  const { data, error } = await supabaseAdmin
    .from('admin_settings')
    .select('id, key, value, metadata')
    .eq('category', category)
    .order('key');

  if (error) {
    throw new Error(`Failed to fetch settings: ${error.message}`);
  }

  return data ?? [];
}
