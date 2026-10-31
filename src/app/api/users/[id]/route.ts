import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await createAdminClient();

    const { data: profile, error } = await admin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: error?.message || 'User not found' }, { status: 404 });
    }

    // Get auth metadata
    const { data: authUser } = await admin.auth.admin.getUserById(id);

    return NextResponse.json({
      user: {
        ...profile,
        last_sign_in_at: authUser?.user?.last_sign_in_at || null,
        email_confirmed_at: authUser?.user?.email_confirmed_at || null
      }
    });
  } catch (err: any) {
    console.error('API /users/[id] GET error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await createAdminClient();
    const body = await request.json();

    const {
      full_name,
      name,
      email,
      role,
      department,
      organization,
      title,
      location,
      phone,
      timezone,
      language,
      is_active,
      password
    } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (full_name !== undefined || name !== undefined) updates.full_name = full_name ?? name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (department !== undefined) updates.department = department;
    if (organization !== undefined) updates.organization = organization;
    if (title !== undefined) updates.title = title;
    if (location !== undefined) updates.location = location;
    if (phone !== undefined) updates.phone = phone;
    if (timezone !== undefined) updates.timezone = timezone;
    if (language !== undefined) updates.language = language;
    if (is_active !== undefined) updates.is_active = is_active;

    // 1. Update public.profiles
    const { data: updatedProfile, error: profileError } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 2. If email, password, or metadata needs syncing with auth
    const authUpdates: Record<string, any> = {};
    if (email) authUpdates.email = email;
    if (password) authUpdates.password = password;
    if (updates.full_name || updates.role) {
      authUpdates.user_metadata = {
        full_name: updates.full_name,
        role: updates.role,
        department: updates.department,
        organization: updates.organization
      };
    }

    if (Object.keys(authUpdates).length > 0) {
      await admin.auth.admin.updateUserById(id, authUpdates);
    }

    return NextResponse.json({ user: updatedProfile, message: 'User updated successfully' });
  } catch (err: any) {
    console.error('API /users/[id] PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await createAdminClient();

    // Deleting from auth.users cascades to public.profiles via ON DELETE CASCADE
    const { error: authError } = await admin.auth.admin.deleteUser(id);

    if (authError) {
      // Fallback: delete directly from profiles if auth user already gone
      await admin.from('profiles').delete().eq('id', id);
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('API /users/[id] DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
