// Quick Supabase connection test
// Run: node supabase/test-connection.mjs

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

try { process.loadEnvFile('.env.local'); } catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error('❌ Missing environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY). Check .env.local');
  process.exit(1);
}

const clientOptions = { realtime: { transport: ws } };

async function test() {
  console.log('\n🔍 Testing Supabase connection...\n');

  // 1. Test with anon key
  const anonClient = createClient(url, anonKey, clientOptions);
  try {
    const { data, error } = await anonClient.from('profiles').select('count').limit(1);
    if (error) {
      console.log('⚠️  Anon key — table check:', error.message);
    } else {
      console.log('✅ Anon key connected successfully');
    }
  } catch (e) {
    console.log('❌ Anon key error:', e.message);
  }

  // 2. Test with service role key
  const adminClient = createClient(url, serviceKey, {
    ...clientOptions,
    auth: { autoRefreshToken: false, persistSession: false }
  });
  try {
    const { data, error } = await adminClient.from('profiles').select('count').limit(1);
    if (error) {
      // Table doesn't exist yet — but connection is fine if it's a table error
      if (error.code === '42P01') {
        console.log('✅ Service role key connected (profiles table not yet created — run migration)');
      } else {
        console.log('⚠️  Service role key — query error:', error.message);
      }
    } else {
      console.log('✅ Service role key connected — profiles table exists!');
      console.log('   Row count:', data);
    }
  } catch (e) {
    console.log('❌ Service role key error:', e.message);
  }

  // 3. Test auth service health
  try {
    const { data, error } = await anonClient.auth.getSession();
    if (error) {
      console.log('⚠️  Auth service:', error.message);
    } else {
      console.log('✅ Auth service reachable (no active session — expected)');
    }
  } catch (e) {
    console.log('❌ Auth service error:', e.message);
  }

  console.log('\nDone.\n');
}

test();
