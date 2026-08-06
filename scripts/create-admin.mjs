/**
 * Creates (or resets) an admin account.
 *
 *   node scripts/create-admin.mjs "Full Name" email@example.com 'password' owner
 *
 * Runs against the Supabase Auth admin API with the secret key, then inserts
 * the matching `admin_users` row. Both halves are required: an Auth user with
 * no admin row can sign in but reaches nothing, which is exactly what the DAL
 * enforces.
 *
 * Reads credentials from .env.local. Never commit that file.
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

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

const [fullName, email, password, role = 'owner'] = process.argv.slice(2);

if (!fullName || !email || !password) {
  console.error(
    'Usage: node scripts/create-admin.mjs "Full Name" email@example.com \'password\' [owner|admin|staff]'
  );
  process.exit(1);
}

if (password.length < 10) {
  console.error('Use a password of at least 10 characters.');
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Find an existing Auth user with this email so the script is re-runnable.
const { data: list, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});

if (listError) {
  console.error('Could not list users:', listError.message);
  process.exit(1);
}

const existing = list.users.find(
  (user) => user.email?.toLowerCase() === email.toLowerCase()
);

let userId;

if (existing) {
  const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  });
  if (error) {
    console.error('Could not update the existing user:', error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log('Reset password for existing Auth user.');
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) {
    console.error('Could not create the Auth user:', error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log('Created Auth user.');
}

const { error: upsertError } = await supabase
  .from('admin_users')
  .upsert(
    { id: userId, full_name: fullName, email, role, is_active: true },
    { onConflict: 'id' }
  );

if (upsertError) {
  console.error('Could not write the admin_users row:', upsertError.message);
  process.exit(1);
}

console.log('\nAdmin ready.');
console.log(`  Name:  ${fullName}`);
console.log(`  Email: ${email}`);
console.log(`  Role:  ${role}`);
console.log('\nSign in at /login');
