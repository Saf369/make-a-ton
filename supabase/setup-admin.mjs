// Full admin setup: fixes DB schema and creates admin user
// Run: node supabase/setup-admin.mjs

import pkg from 'pg';
const { Client } = pkg;

try { process.loadEnvFile('.env.local'); } catch {}

const DB_CONN = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DB_CONN || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables (DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). Check .env.local');
  process.exit(1);
}

const ADMIN_EMAIL = 'admin@brightloop.io';
const ADMIN_PASSWORD = 'Admin@123';

async function runSQL(client, label, sql) {
  try {
    await client.query(sql);
    console.log(`  ✅ ${label}`);
  } catch (e) {
    console.log(`  ⚠️  ${label}: ${e.message}`);
  }
}

async function main() {
  console.log('\n🔧 Brightloop Hub — Full Admin Setup\n');

  // ── 1. Connect directly to Postgres ──────────────────────────
  const db = new Client({ connectionString: DB_CONN, ssl: { rejectUnauthorized: false } });
  await db.connect();
  console.log('✅ Connected to Postgres\n');

  // ── 2. Apply schema fixes ─────────────────────────────────────
  console.log('📦 Applying schema...');

  // Create enum if missing
  await runSQL(db, 'user_role enum',
    `DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin','staff','customer');
     EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);

  // Create profiles table if missing
  await runSQL(db, 'profiles table', `
    CREATE TABLE IF NOT EXISTS public.profiles (
      id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email        TEXT NOT NULL,
      full_name    TEXT,
      avatar_url   TEXT,
      phone        TEXT,
      organization TEXT,
      role         user_role NOT NULL DEFAULT 'customer',
      is_active    BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Drop broken trigger before recreating
  await runSQL(db, 'drop old trigger', `
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  `);

  // Recreate trigger with safe role cast
  await runSQL(db, 'handle_new_user function', `
    CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
    DECLARE
      v_role user_role;
    BEGIN
      BEGIN
        v_role := (NEW.raw_user_meta_data->>'role')::user_role;
      EXCEPTION WHEN OTHERS THEN
        v_role := 'customer'::user_role;
      END;
      INSERT INTO public.profiles (id, email, full_name, organization, role)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'organization', ''),
        v_role
      )
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  await runSQL(db, 're-create trigger', `
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  `);

  // Enable RLS
  await runSQL(db, 'enable RLS', `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`);

  // Fix recursive policies
  await runSQL(db, 'get_my_role function', `
    CREATE OR REPLACE FUNCTION public.get_my_role()
    RETURNS TEXT AS $$
      SELECT COALESCE((SELECT role::TEXT FROM public.profiles WHERE id = auth.uid()), 'customer');
    $$ LANGUAGE sql SECURITY DEFINER STABLE;
  `);

  await runSQL(db, 'drop old policies', `
    DROP POLICY IF EXISTS "profiles: admins can read all" ON public.profiles;
    DROP POLICY IF EXISTS "profiles: admins can update all" ON public.profiles;
    DROP POLICY IF EXISTS "profiles: admins can insert" ON public.profiles;
    DROP POLICY IF EXISTS "profiles: admins can delete" ON public.profiles;
    DROP POLICY IF EXISTS "profiles: staff can read all" ON public.profiles;
    DROP POLICY IF EXISTS "profiles: users can read own" ON public.profiles;
    DROP POLICY IF EXISTS "profiles: users can update own" ON public.profiles;
  `);

  await runSQL(db, 'RLS policies', `
    CREATE POLICY "read own" ON public.profiles FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "admin read all" ON public.profiles FOR SELECT USING (public.get_my_role() = 'admin');
    CREATE POLICY "admin update all" ON public.profiles FOR UPDATE USING (public.get_my_role() = 'admin');
    CREATE POLICY "admin insert" ON public.profiles FOR INSERT WITH CHECK (public.get_my_role() = 'admin');
    CREATE POLICY "admin delete" ON public.profiles FOR DELETE USING (public.get_my_role() = 'admin');
    CREATE POLICY "staff read all" ON public.profiles FOR SELECT USING (public.get_my_role() = 'staff');
  `);

  console.log('\n✅ Schema ready\n');

  // ── 3. Drop trigger temporarily, create user, re-add trigger ──
  console.log('👤 Creating admin user...');

  // Drop trigger so it doesn't interfere with user creation
  await db.query(`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`);
  console.log('  ✅ Trigger dropped temporarily');

  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Administrator' },
    }),
  });

  const authJson = await authRes.json();
  let userId;

  if (!authRes.ok) {
    if (authJson.msg?.includes('already been registered') || authJson.code === 422) {
      console.log('  ℹ️  User already exists in auth');
    } else {
      console.error('  ❌ Auth error:', JSON.stringify(authJson));
    }
  } else {
    userId = authJson.id;
    console.log('  ✅ Auth user created:', userId);
  }

  // Recreate trigger
  await db.query(`
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  `);
  console.log('  ✅ Trigger recreated');

  // Fetch user ID if not captured above
  if (!userId) {
    const row = await db.query(`SELECT id FROM auth.users WHERE email = $1`, [ADMIN_EMAIL]);
    userId = row.rows[0]?.id;
  }

  if (!userId) {
    console.error('  ❌ Could not find user ID');
    await db.end();
    process.exit(1);
  }

  // ── 4. Upsert profile with admin role ─────────────────────────
  await db.query(`
    INSERT INTO public.profiles (id, email, full_name, role, organization, is_active)
    VALUES ($1, $2, 'Administrator', 'admin', 'Brightloop', true)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Administrator', is_active = true;
  `, [userId, ADMIN_EMAIL]);

  console.log('  ✅ Admin profile set (role = admin)');

  await db.end();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎉 Admin account ready!');
  console.log(`  Email   : ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('  URL     : http://localhost:3000/auth/login');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
