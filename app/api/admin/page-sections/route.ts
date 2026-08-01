import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper that creates a Supabase client with the current user's token
async function getAuthenticatedClient(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const tokenCookie = cookieHeader
    .split('; ')
    .find(c => c.startsWith('sb-') && c.includes('-auth-token'));
  
  if (!tokenCookie) return null;
  // Supabase stores the token as a base64-encoded JSON string like: "base64-{...}"
// It may be split into multiple parts (0, 1, 2) — we need the full encoded value
const tokenParts = tokenCookie.split('=').slice(1).join('=');
let tokenValue = '';
try {
  // Decode the base64 JSON to extract the actual access_token
  const decoded = JSON.parse(atob(tokenParts));
  tokenValue = decoded.access_token || '';
} catch {
  // Fallback: try using the raw value directly
  tokenValue = tokenParts;
}
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${tokenValue}` } }
  });
}

// GET all sections (public – no auth needed)
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.from('page_sections').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sections: data });
}

// POST to update a section (admin only, authenticated via cookie)
export async function POST(req: Request) {
  const supabase = await getAuthenticatedClient(req);
  if (!supabase) {
    return NextResponse.json({ error: 'You must be logged in to edit.' }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'You must be logged in to edit.' }, { status: 401 });
  }

  // Check the user's role in the members table
  const { data: member } = await supabase
    .from('members')
    .select('role')
    .eq('email', user.email)
    .single();

  if (!member || member.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can edit the page.' }, { status: 403 });
  }

  const { section_key, content } = await req.json();
  const { error } = await supabase
    .from('page_sections')
    .upsert({ section_key, content, updated_at: new Date().toISOString() }, { onConflict: 'section_key' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}