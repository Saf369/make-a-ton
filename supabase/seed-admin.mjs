// Creates the initial admin user in Supabase
// Run: node supabase/seed-admin.mjs

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

try { process.loadEnvFile('.env.local'); } catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). Check .env.local');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: ws },
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = 'admin@brightloop.io';
const ADMIN_PASSWORD = 'Admin@123';  // Change after first login!

async function seedAdmin() {
  console.log('\n🌱 Seeding initial admin user...\n');

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,   // skip email verification
    user_metadata: {
      full_name: 'Administrator',
      role: 'admin',
      organization: 'Brightloop',
    },
  });

  if (authError) {
    if (authError.message?.includes('already been registered')) {
      console.log('ℹ️  User already exists — updating role to admin...');
    } else {
      console.error('❌ Failed to create auth user:', authError.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Auth user created:', authData.user.id);
  }

  // 2. Get the user ID (whether newly created or existing)
  const { data: existingUser, error: fetchError } = await admin.auth.admin.listUsers();
  const user = existingUser?.users?.find(u => u.email === ADMIN_EMAIL);

  if (!user) {
    console.error('❌ Could not find user after creation');
    process.exit(1);
  }

  // 3. Upsert profile with admin role
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({
      id: user.id,
      email: ADMIN_EMAIL,
      full_name: 'Administrator',
      role: 'admin',
      organization: 'Brightloop',
      is_active: true,
    }, { onConflict: 'id' });

  if (profileError) {
    console.error('❌ Failed to upsert profile:', profileError.message);
    process.exit(1);
  }

  console.log('✅ Admin profile set\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Login credentials:');
  console.log(`  Email   : ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('  URL     : http://localhost:3000/auth/login');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

seedAdmin();
