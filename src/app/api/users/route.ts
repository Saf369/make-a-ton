import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const admin = await createAdminClient();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = admin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (status && status !== 'all') {
      const isActive = status === 'Active' || status === 'active';
      query = query.eq('is_active', isActive);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,department.ilike.%${search}%,title.ilike.%${search}%`);
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // Try to get auth users for last_sign_in_at
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 100 });
    const authMap = new Map((authData?.users || []).map(u => [u.id, u]));

    const enriched = (profiles || []).map(p => {
      const authUser = authMap.get(p.id);
      return {
        ...p,
        last_sign_in_at: authUser?.last_sign_in_at || null,
      };
    });

    return NextResponse.json({ users: enriched });
  } catch (err: any) {
    console.error('API /users GET error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await createAdminClient();
    const body = await request.json();

    const {
      email,
      password,
      name,
      full_name,
      role = 'staff',
      department = '',
      organization = 'Brightloop Hub',
      title = '',
      location = '',
      phone = '',
      is_active = true
    } = body;

    const userFullName = full_name || name || 'New User';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Default password if not provided
    const userPassword = password || 'Brightloop@123';

    // 1. Create user in Supabase Auth
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        full_name: userFullName,
        organization,
        role,
        department,
        title,
        location,
        phone,
        is_active
      }
    });

    if (authError) {
      console.error('Auth create error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authUser.user.id;

    // 2. Ensure profile exists and has all values
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: userFullName,
        organization,
        role,
        department,
        title,
        location,
        phone,
        is_active,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ user: profile, message: 'User created successfully' }, { status: 201 });
  } catch (err: any) {
    console.error('API /users POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
