// Creates admin user via Supabase Auth REST API directly
// Run: node supabase/seed-admin-v2.mjs

try { process.loadEnvFile('.env.local'); } catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). Check .env.local');
  process.exit(1);
}

const ADMIN_EMAIL = 'admin@brightloop.io';
const ADMIN_PASSWORD = 'Admin@123';

async function req(path, body, method = 'POST') {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, data: json };
}

async function main() {
  console.log('\n🌱 Seeding admin user via REST API...\n');

  // Step 1: Create auth user (skip email confirmation)
  const { ok, data, status } = await req('/auth/v1/admin/users', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Administrator' },
  });

  let userId;

  if (!ok) {
    if (data?.msg?.includes('already been registered') || status === 422) {
      console.log('ℹ️  Auth user already exists — fetching ID...');
      const { data: list } = await req('/auth/v1/admin/users?page=1&per_page=100', undefined, 'GET');
      const existing = list?.users?.find(u => u.email === ADMIN_EMAIL);
      if (!existing) { console.error('❌ Could not find existing user'); process.exit(1); }
      userId = existing.id;
      console.log('✅ Found existing user:', userId);
    } else {
      console.error('❌ Auth error:', JSON.stringify(data));
      process.exit(1);
    }
  } else {
    userId = data.id;
    console.log('✅ Auth user created:', userId);
  }

  // Step 2: Upsert profile row directly via REST
  const { ok: profileOk, data: profileData } = await req(
    '/rest/v1/profiles',
    {
      id: userId,
      email: ADMIN_EMAIL,
      full_name: 'Administrator',
      role: 'admin',
      organization: 'Brightloop',
      is_active: true,
    }
  );

  // Try upsert with header
  const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      id: userId,
      email: ADMIN_EMAIL,
      full_name: 'Administrator',
      role: 'admin',
      organization: 'Brightloop',
      is_active: true,
    }),
  });

  if (upsertRes.ok) {
    console.log('✅ Admin profile created/updated');
  } else {
    const err = await upsertRes.text();
    console.log('⚠️  Profile upsert response:', err);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Admin credentials ready:');
  console.log(`  Email   : ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('  URL     : http://localhost:3000/auth/login');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
