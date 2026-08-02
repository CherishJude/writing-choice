import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify role using admin client (must be super_admin)
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('role')
      .eq('email', user.email)
      .single();

    if (!member || member.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden. Super Admin access required.' }, { status: 403 });
    }

    const { targetEmail, newRole } = await req.json();

    if (!targetEmail || !newRole) {
      return NextResponse.json({ error: 'Missing email or role' }, { status: 400 });
    }

    if (targetEmail === 'judecherish23@gmail.com') {
      return NextResponse.json({ error: 'Cannot modify Super Admin role' }, { status: 400 });
    }

    // Perform the update using the Admin client to bypass RLS!
    const { error } = await supabaseAdmin
      .from('members')
      .update({ role: newRole })
      .eq('email', targetEmail);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: `Role updated to ${newRole}` });
  } catch (err: any) {
    console.error('Role Update Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
