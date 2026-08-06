/**
 * One-shot admin bootstrap.
 *
 *   npm run setup:admin
 *
 * Checks the admin schema is actually present, then creates (or resets) the
 * demo owner account and prints the credentials. Safe to re-run: it resets the
 * password rather than erroring on a duplicate.
 *
 * The credentials live here rather than in .env.local on purpose — this is a
 * first-login password meant to be changed, not a secret. Nothing in this file
 * grants access on its own; it only works with the secret key from .env.local,
 * which is gitignored.
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const EMAIL = 'rohit@foxitech.in';
const PASSWORD = 'FoxiAdmin2026!';
const FULL_NAME = 'Rohit Gunthal';
const ROLE = 'owner';

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    for (const line of raw.split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    console.error('Could not read .env.local. Copy .env.example and fill it in.');
    process.exit(1);
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------------------
// 1. Is the schema there?
//
// Without this check the failure surfaces as an opaque PostgREST error at the
// very last step, after an Auth user has already been created.
// ---------------------------------------------------------------------------

const REQUIRED = [
  'admin_users',
  'lead_activities',
  'agreements',
  'agreement_items',
  'agreement_templates',
  'signature_events',
  'login_attempts',
];

const missing = [];
for (const table of REQUIRED) {
  // A plain GET, deliberately not `{ head: true }`. A HEAD response carries no
  // body, so PostgREST's PGRST205 "table not found" payload never arrives and a
  // missing table looks like a success — which is how an earlier version of
  // this check sailed straight past and created an orphaned Auth user.
  const { error } = await supabase.from(table).select('*').limit(1);
  if (error) missing.push(`${table} (${error.message})`);
}

// Fail closed: any unresolved error here means we must not touch Auth.
if (missing.length > 0) {
  console.error('\nThe admin schema is not ready.\n');
  console.error(`Could not read:\n  ${missing.join('\n  ')}\n`);
  console.error('Apply it first — open the SQL editor:');
  console.error('  https://supabase.com/dashboard/project/kppbasebdmepfcdeppwr/sql/new\n');
  console.error('Paste the whole of this file and press Run:');
  console.error('  supabase/APPLY_ADMIN_MIGRATIONS.sql\n');
  console.error('Then run `npm run setup:admin` again.\n');
  process.exit(1);
}

console.log('Admin schema found.');

// ---------------------------------------------------------------------------
// 2. Auth user
// ---------------------------------------------------------------------------

const { data: list, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});

if (listError) {
  console.error('Could not list users:', listError.message);
  process.exit(1);
}

const existing = list.users.find((user) => user.email?.toLowerCase() === EMAIL.toLowerCase());

let userId;

if (existing) {
  const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) {
    console.error('Could not update the existing user:', error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log('Reset the password on the existing Auth user.');
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: FULL_NAME },
  });
  if (error) {
    console.error('Could not create the Auth user:', error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log('Created the Auth user.');
}

// ---------------------------------------------------------------------------
// 3. admin_users row
//
// Both halves are required. An Auth user with no admin row can sign in but
// reaches nothing — that is exactly what the DAL enforces.
// ---------------------------------------------------------------------------

const { error: upsertError } = await supabase
  .from('admin_users')
  .upsert(
    { id: userId, full_name: FULL_NAME, email: EMAIL, role: ROLE, is_active: true },
    { onConflict: 'id' }
  );

if (upsertError) {
  console.error('Could not write the admin_users row:', upsertError.message);
  process.exit(1);
}

console.log('\n────────────────────────────────');
console.log(' Admin ready. Sign in at /login');
console.log('────────────────────────────────');
console.log(`  Email:    ${EMAIL}`);
console.log(`  Password: ${PASSWORD}`);
console.log(`  Role:     ${ROLE}`);
console.log('\nChange the password once you are in.\n');
