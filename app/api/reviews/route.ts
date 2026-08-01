import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper function to create a Supabase client that knows the current user
async function getAuthenticatedClient(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  
  // Find the Supabase auth token cookie (name starts with 'sb-' and contains '-auth-token')
  const tokenCookie = cookieHeader
    .split('; ')
    .find(c => c.startsWith('sb-') && c.includes('-auth-token'));
    
  if (!tokenCookie) return null;
  
  const tokenValue = tokenCookie.split('=')[1];
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Create a new client that sends the user's token in every request
  const client = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: { Authorization: `Bearer ${tokenValue}` }
    }
  });
  
  return client;
}

// GET all reviews (public, no auth needed)
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data });
}

// POST a new review (authenticated only)
export async function POST(req: Request) {
  const { rating, review_text } = await req.json();
  
  const supabase = await getAuthenticatedClient(req);
  if (!supabase) {
    return NextResponse.json({ error: 'You must be logged in to review.' }, { status: 401 });
  }
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'You must be logged in to review.' }, { status: 401 });
  }
  
  const { error } = await supabase
    .from('reviews')
    .insert({
      user_email: user.email,
      rating,
      review_text
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}