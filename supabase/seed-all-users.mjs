// Seed realistic users across admin, staff, and customer roles
// Run: node supabase/seed-all-users.mjs

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

const USERS_TO_SEED = [
  {
    email: 'admin@brightloop.io',
    password: 'Admin@123',
    full_name: 'Administrator',
    organization: 'Brightloop Hub',
    role: 'admin',
    department: 'Executive',
    title: 'System Administrator',
    location: 'Muscat, Oman',
    phone: '+968 24 123456',
    is_active: true
  },
  {
    email: 'rayan@brightloop.io',
    password: 'Admin@123',
    full_name: 'Rayan Al-Mansoor',
    organization: 'Brightloop Hub',
    role: 'admin',
    department: 'Executive',
    title: 'Super Admin & Lead',
    location: 'Dubai, UAE',
    phone: '+971 4 321 0001',
    is_active: true
  },
  {
    email: 'sarah.j@brightloop.io',
    password: 'Staff@123',
    full_name: 'Sarah Jenkins',
    organization: 'Brightloop Hub',
    role: 'staff',
    department: 'Finance & Accounting',
    title: 'Senior Billing Operations Manager',
    location: 'Dubai, UAE',
    phone: '+971 4 321 0002',
    is_active: true
  },
  {
    email: 'david.chen@brightloop.io',
    password: 'Staff@123',
    full_name: 'David Chen',
    organization: 'Brightloop Hub',
    role: 'staff',
    department: 'Customer Success',
    title: 'Customer Support Lead',
    location: 'London, UK',
    phone: '+44 20 7123 4567',
    is_active: true
  },
  {
    email: 'elena.r@brightloop.io',
    password: 'Staff@123',
    full_name: 'Elena Rostova',
    organization: 'Brightloop Hub',
    role: 'staff',
    department: 'Revenue & Sales',
    title: 'Sales Lead',
    location: 'Singapore, SG',
    phone: '+65 6789 0123',
    is_active: true
  },
  {
    email: 'tariq@brightloop.io',
    password: 'Staff@123',
    full_name: 'Tariq Al-Fahad',
    organization: 'Brightloop Hub',
    role: 'staff',
    department: 'Compliance',
    title: 'Operations Auditor',
    location: 'Riyadh, KSA',
    phone: '+966 11 234 5678',
    is_active: false
  },
  {
    email: 'rvance@acmetech.com',
    password: 'Customer@123',
    full_name: 'Robert Vance',
    organization: 'Acme Technologies Inc.',
    role: 'customer',
    department: 'Procurement',
    title: 'VP Operations',
    location: 'United States',
    phone: '+1 (555) 019-2834',
    is_active: true
  },
  {
    email: 'kpatel@nexusdata.ai',
    password: 'Customer@123',
    full_name: 'Kavita Patel',
    organization: 'Nexus Data Labs',
    role: 'customer',
    department: 'Technology',
    title: 'Head of Infrastructure',
    location: 'United Kingdom',
    phone: '+44 20 7946 0912',
    is_active: true
  }
];

async function main() {
  console.log('\n🌱 Seeding users into Supabase Auth & Profiles...\n');

  const db = new Client({ connectionString: DB_CONN, ssl: { rejectUnauthorized: false } });
  await db.connect();

  for (const u of USERS_TO_SEED) {
    console.log(`Processing: ${u.email} (${u.role})...`);

    // 1. Create or get auth user
    let userId;
    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: {
          full_name: u.full_name,
          organization: u.organization,
          role: u.role,
          department: u.department,
          title: u.title,
          location: u.location,
          phone: u.phone,
          is_active: u.is_active
        }
      })
    });

    const createJson = await createRes.json();

    if (createRes.ok && createJson.id) {
      userId = createJson.id;
      console.log(`  ✅ Auth user created: ${userId}`);
    } else {
      // Find existing
      const existing = await db.query('SELECT id FROM auth.users WHERE email = $1', [u.email]);
      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        console.log(`  ℹ️  Existing auth user found: ${userId}`);
      } else {
        console.error(`  ❌ Failed to create/find auth user: ${JSON.stringify(createJson)}`);
        continue;
      }
    }

    // 2. Upsert into public.profiles
    await db.query(`
      INSERT INTO public.profiles (
        id, email, full_name, organization, role, department, title, location, phone, is_active, timezone, language
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'UTC+04:00', 'English (United States)')
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        organization = EXCLUDED.organization,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        title = EXCLUDED.title,
        location = EXCLUDED.location,
        phone = EXCLUDED.phone,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    `, [userId, u.email, u.full_name, u.organization, u.role, u.department, u.title, u.location, u.phone, u.is_active]);

    console.log(`  ✅ Profile synced for ${u.full_name}`);
  }

  const { rows } = await db.query('SELECT id, email, full_name, role, department, is_active FROM public.profiles ORDER BY role, full_name');
  console.log('\n📊 All Profiles in Database:');
  console.table(rows);

  await db.end();
  console.log('\n🎉 All users successfully seeded!\n');
}

main().catch(console.error);
