import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getAuthenticatedClient(req: Request) {
  let accessToken = '';

  // 1. ADDITION: Check for an Authorization header first.
  // This handles frontend fetch calls passing the token directly via headers.
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    accessToken = authHeader.split(' ')[1];
  } else {
    // 2. ORIGINAL LOGIC: Fallback to reading the cookie
    const cookieHeader = req.headers.get('cookie') || '';
    // Find the Supabase auth cookie (name like "sb-xxxxx-auth-token")
    const tokenCookie = cookieHeader
      .split('; ')
      .find(c => c.startsWith('sb-') && c.includes('-auth-token'));

    if (!tokenCookie) return null;

    // Extract the cookie value (everything after the first '=')
    let cookieValue = tokenCookie.split('=').slice(1).join('=');
    if (!cookieValue) return null;

    // 3. ADDITION: Decode the URI component to restore any URL-encoded characters (like %3D to =)
    cookieValue = decodeURIComponent(cookieValue);

    try {
      // The cookie value is a base64‑encoded JSON string (URL‑safe).
      // Convert URL‑safe base64 to standard base64, then decode.
      const base64 = cookieValue.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
      accessToken = decoded.access_token;
    } catch {
      // Fallback: try using the raw cookie value as the token directly
      accessToken = cookieValue;
    }
  }

  if (!accessToken) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}

export async function GET(req: Request) {
  const supabase = await getAuthenticatedClient(req);
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase.from('members').select('settings').eq('email', user.email).single();
  return NextResponse.json({ settings: member?.settings || {} });
}

export async function PUT(req: Request) {
  const supabase = await getAuthenticatedClient(req);
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { settings } = await req.json();

  const updateData: any = { settings };
  if (settings.display_name !== undefined) {
    updateData.display_name = settings.display_name;
  }

  const { error } = await supabase.from('members').update(updateData).eq('email', user.email);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}