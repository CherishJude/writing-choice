import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
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

    // Verify role using admin client (bypassing RLS on members table)
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('role')
      .eq('email', user.email)
      .single();

    if (!member || (member.role !== 'super_admin' && member.role !== 'moderator')) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    // Fetch all required data using Admin Client to bypass RLS!
    const { data: userData } = await supabaseAdmin.from('members').select('*');
    const { data: msgData } = await supabaseAdmin.from('group_messages').select('*').order('timestamp', { ascending: false });
    const { data: orderData } = await supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false });

    return NextResponse.json({
      users: userData || [],
      messages: msgData || [],
      orders: orderData || []
    });

  } catch (err: any) {
    console.error('Admin Data Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
