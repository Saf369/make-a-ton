// Runs all pending SQL migrations against Supabase via REST API
// Run: node supabase/run-migrations.mjs

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

try { process.loadEnvFile('.env.local'); } catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). Check .env.local');
  process.exit(1);
}

async function runSQL(label, sql) {
  console.log(`\n▶  Running: ${label}`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) {
    console.log(`✅  ${label} — success`);
    return true;
  }

  const text = await res.text();
  // Try the pg REST approach via supabase's SQL endpoint
  console.log(`⚠️  exec_sql RPC not available, trying /sql endpoint…`);

  const res2 = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res2.ok) {
    console.log(`✅  ${label} — success via /pg/query`);
    return true;
  }

  const text2 = await res2.text();
  console.log(`❌  ${label} failed:`, text2.slice(0, 300));
  return false;
}

const migrations = [
  '001_users_schema.sql',
  '002_fix_rls_policies.sql',
];

console.log('🚀 Brightloop Hub — Running Supabase Migrations\n');

for (const file of migrations) {
  const sql = readFileSync(join(__dir, 'migrations', file), 'utf8');
  await runSQL(file, sql);
}

console.log('\n✅ Migration runner complete.\n');
